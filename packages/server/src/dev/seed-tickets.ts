import { InternalError } from "../errors.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { BlobStore } from "../storage/store.js";
import type {
  TicketPriority,
  OrgSchema,
  UserId,
  QueueId,
} from "@care-y/shared";
import {
  newTicketId,
  newFollowupId,
  newKeyGeneration,
  newRecordingId,
  newAttachmentId,
} from "@care-y/shared";
import {
  generateContentKey,
  encryptContent,
  buildContentAad,
  followupSlot,
  cursorSlot,
  blobSlot,
  filenameSlot,
  eciesEncrypt,
  toRistrettoPoint,
} from "@care-y/crypto";

export interface SeedTicketOptions {
  handcraftedOnly?: boolean;
}

/**
 * Optional narrative media assets for the seeded story ticket. When
 * provided, recordings use voicemailAudio bytes/duration, image
 * attachments consume documentImages round-robin. When absent, the
 * seeder falls back to its synthetic generators (WAV/PNG).
 */
export interface SeedMediaAssets {
  voicemailAudio?: { bytes: Uint8Array; durationSeconds: number };
  documentImages?: { bytes: Uint8Array; contentType: string }[];
}

export async function seedTestTickets(
  tDb: Kysely<TenantDatabase>,
  blobStore: BlobStore,
  userId: UserId,
  orgSchema: OrgSchema,
  options?: SeedTicketOptions,
  assets?: SeedMediaAssets,
): Promise<{ ticketIds: string[] }> {
  // 1. Look up vol_public for the current user
  const userKeys = await tDb
    .selectFrom("user_keys")
    .select("vol_public")
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (!userKeys?.vol_public) {
    throw new InternalError(
      "user_keys.vol_public not found. Run registerCrypto first.",
    );
  }

  const volPublic = toRistrettoPoint(new Uint8Array(userKeys.vol_public));

  // 2. Fetch queues + clients (created by seed script)
  // Queue names are encrypted (ADR-030), so we fetch all active
  // queues by sort_order and assign them to the seed labels by
  // position: sort_order 1 = "Intake", 2 = "Crisis", 3 = "Housing".
  const queues = await tDb
    .selectFrom("queues")
    .select(["id", "sort_order"])
    .where("is_active", "=", true)
    .orderBy("sort_order", "asc")
    .execute();
  const seedLabels = ["Intake", "Crisis", "Housing"];
  const queueMap = new Map<string, QueueId>();
  for (const [idx, q] of queues.entries()) {
    const label = seedLabels.at(idx);
    if (label !== undefined) queueMap.set(label, q.id);
  }

  const clients = await tDb
    .selectFrom("clients")
    .select(["id"])
    .orderBy("created_at", "asc")
    .execute();

  if (clients.length === 0) {
    throw new InternalError("No clients found. Run seed first.");
  }

  // Helper: minutes ago as a Date
  function minutesAgo(m: number): Date {
    return new Date(Date.now() - m * 60_000);
  }

  // 3. Ticket definitions with varied data
  // Clients are assigned round-robin from whatever clients exist.
  interface FollowUpDef {
    content: string;
    source: string;
    type?: string; // default: "message"
    isPrivate?: boolean; // default: false
    agoMinutes: number;
    media?: MediaDef[];
    eventParams?: Record<string, unknown>;
    /** Terminal call status for phone_call rows (completed/no_answer/busy/failed/canceled). */
    callStatus?: string;
    /** Call duration in seconds, written to followups.call_duration_seconds. */
    callDurationSeconds?: number;
    /**
     * Reactions to seed on this follow-up (internal notes only in the
     * UI). Reacting user is another active user when one exists, else
     * the seeded volunteer.
     */
    reactions?: { reaction: string; agoMinutes: number }[];
    /**
     * Author for volunteer follow-ups. Defaults to the seeded volunteer.
     * Set to another user's id so a thread can show a real handoff
     * (earlier messages and notes belong to the previous volunteer).
     */
    authorId?: UserId;
  }

  interface MediaDef {
    kind: "recording" | "image" | "file";
    /** For recordings: duration in seconds. */
    durationSeconds?: number;
    /** For attachments: plaintext filename (encrypted at insert time). */
    filename?: string;
    /** For attachments: MIME content type. */
    contentType?: string;
  }

  interface TicketDef {
    title: string;
    description: string;
    queue: string;
    priority: TicketPriority;
    assignedTo: UserId | null;
    onHold: boolean;
    withKeyWrap: boolean;
    createdAgo: number; // minutes ago
    followUps: FollowUpDef[];
    /**
     * Minutes ago the seeded volunteer last read this ticket. When set
     * (and the ticket has a key wrap), a real encrypted read cursor is
     * inserted, so follow-ups by others newer than this render the
     * unread badge. Omit for never-opened tickets (no cursor row).
     */
    unreadSince?: number;
  }

  // --- Synthetic media generators ---
  // Minimal valid files for testing. Production uses real
  // Twilio recordings / user uploads, but the encryption
  // pipeline is identical.

  /** Minimal valid WAV header + sine wave (~1 second, 8kHz mono). */
  function generateWav(durationSec: number): Buffer {
    const sampleRate = 8000;
    const numSamples = sampleRate * durationSec;
    const dataSize = numSamples * 2; // 16-bit PCM
    const header = Buffer.alloc(44);
    // RIFF header
    header.write("RIFF", 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write("WAVE", 8);
    // fmt chunk
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16); // chunk size
    header.writeUInt16LE(1, 20); // PCM
    header.writeUInt16LE(1, 22); // mono
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28); // byte rate
    header.writeUInt16LE(2, 32); // block align
    header.writeUInt16LE(16, 34); // bits per sample
    // data chunk
    header.write("data", 36);
    header.writeUInt32LE(dataSize, 40);
    const data = Buffer.alloc(dataSize);
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate);
      data.writeInt16LE(Math.round(sample * 16000), i * 2);
    }
    return Buffer.concat([header, data]);
  }

  /** Valid 64x64 cyan PNG (178 bytes). Visible on both light and dark. */
  function generatePng(): Buffer {
    // Generated programmatically: 64x64 RGB, solid #00CCBB.
    // CRC32 checksums computed correctly for all chunks.
    const hex =
      "89504e470d0a1a0a0000000d49484452000000400000" +
      "00400802000000250be6890000007949444154789ced" +
      "cf410900300cc0c0fab7340b1355117b1c8340045c66" +
      "eef93b2f68400b1ad08206b4a0012d68400b1ad08206" +
      "b4a0012d68400b1ad08206b4a0012d68400b1ad08206" +
      "b4a0012d68400b1ad08206b4a0012d68400b1ad08206" +
      "b4a0012d68400b1ad08206b4a0012d68400b1ad08206" +
      "b4e0ad050ceb71698b8b2a940000000049454e44ae42" +
      "6082";
    return Buffer.from(hex, "hex");
  }

  /** Small text file for attachment testing. */
  function generateTextFile(): Buffer {
    return Buffer.from(
      "CARE-Y Safety Plan Template\n\n" +
        "1. Warning signs that a crisis may be developing\n" +
        "2. Internal coping strategies\n" +
        "3. People and social settings that provide distraction\n" +
        "4. People I can ask for help\n" +
        "5. Professionals or agencies I can contact during a crisis\n" +
        "6. Making the environment safe\n",
      "utf-8",
    );
  }

  const me = userId;

  // Reacting user for seeded note reactions: prefer another active user
  // (roster volunteer) so the reaction reads as team feedback rather
  // than the author reacting to their own note.
  const otherUser = await tDb
    .selectFrom("users")
    .select("id")
    .where("id", "!=", me)
    .where("is_active", "=", true)
    .executeTakeFirst();
  const reactingUserId = otherUser?.id ?? me;

  const ticketDefs: TicketDef[] = [
    // --- MY TICKETS (assigned to me) ---
    {
      title: "Help with housing",
      description: "Client needs housing referral and support",
      queue: "Housing",
      // High matches the priority_changed event in the thread below.
      priority: "high",
      // One unread client reply (the check-in text minutes ago). The
      // thread's final exchange is the newest activity of any seeded
      // ticket, so under the default recent-activity sort the story
      // ticket stays on top even after the unread pill clears.
      unreadSince: 15,
      assignedTo: me,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 4320, // 3 days
      followUps: [
        // Day 1: intake conversation and the shelter list. The first
        // shift's volunteer (another roster user when available) handles
        // this stretch; the seeded volunteer takes over at the handoff
        // below, which is why the reassignment events name two people.
        {
          content: "Volunteer assigned",
          source: "system",
          type: "volunteer_assigned",
          eventParams: { userId: reactingUserId },
          agoMinutes: 4310,
        },
        {
          content: "I need help finding a place to stay",
          source: "client",
          agoMinutes: 4300,
        },
        {
          content:
            "My sister said I can only stay with her through the weekend",
          source: "client",
          agoMinutes: 4297,
        },
        {
          content: "I can look into shelters in your area",
          source: "volunteer",
          authorId: reactingUserId,
          agoMinutes: 4200,
        },
        {
          content:
            "Is it ok if I text you a list, or would a call work better?",
          source: "volunteer",
          authorId: reactingUserId,
          agoMinutes: 4197,
        },
        {
          content: "Texting is fine",
          source: "client",
          agoMinutes: 4190,
        },
        // The list itself, pasted from the library's housing referral
        // contacts article the way a volunteer actually sends it.
        {
          content:
            "Here is the list we keep: the city emergency shelter is walk-in, open 24/7. The family shelter takes families with children but needs a referral, which we can provide. The east side shelter's intake desk is open 10am to 8pm, call right at 10 for same-day beds",
          source: "volunteer",
          type: "sms_outbound",
          authorId: reactingUserId,
          agoMinutes: 4180,
        },
        {
          content: "Got it, I will look through these tonight",
          source: "client",
          type: "sms_inbound",
          agoMinutes: 4150,
        },
        {
          content:
            "First call went well, client is safe through the weekend. Texted the shelter list, will follow up tomorrow.",
          source: "volunteer",
          type: "internal_note",
          isPrivate: true,
          authorId: reactingUserId,
          agoMinutes: 4140,
        },
        // Day 2: waitlist news. The hold starts only once the client is
        // waiting days on the shelter's callback, not mid-conversation.
        {
          content:
            "Two of them were full but the one on the east side said to call back after 10",
          source: "client",
          agoMinutes: 2900,
        },
        {
          content:
            "That one usually has space midweek. Call right at 10 and mention our support line referred you",
          source: "volunteer",
          authorId: reactingUserId,
          agoMinutes: 2880,
        },
        {
          content:
            "I left my name with their intake office, they said it could be a day or two before they call back",
          source: "client",
          agoMinutes: 2500,
        },
        {
          content:
            "Sounds good. I will put the ticket on hold until you hear from them, just text us when you do",
          source: "volunteer",
          authorId: reactingUserId,
          agoMinutes: 2490,
        },
        {
          content: "Put on hold",
          source: "system",
          type: "hold_placed",
          agoMinutes: 2485,
        },
        {
          content: "They called back! I have an intake meeting tomorrow at 9",
          source: "client",
          type: "sms_inbound",
          agoMinutes: 2100,
        },
        {
          content: "Hold removed",
          source: "system",
          type: "hold_removed",
          agoMinutes: 2090,
        },
        {
          content:
            "That is great news. Text me after the meeting and let me know how it went",
          source: "volunteer",
          authorId: reactingUserId,
          agoMinutes: 2085,
        },
        // Shift change: the first volunteer hands off to the seeded
        // volunteer, so the unassign/assign pair names two people.
        {
          content: "Volunteer unassigned",
          source: "system",
          type: "volunteer_unassigned",
          eventParams: { userId: reactingUserId },
          agoMinutes: 1800,
        },
        {
          content: "Volunteer assigned",
          source: "system",
          type: "volunteer_assigned",
          eventParams: { userId: me },
          agoMinutes: 1790,
        },
        {
          content:
            "Hi, I am covering this shift and picking up your case. I have read through the thread, no need to repeat anything",
          source: "volunteer",
          agoMinutes: 1780,
        },
        // The client texted from a second phone, which opened a separate
        // ticket. The two messages below precede the merge event, exactly
        // where merged-in messages land in the timeline.
        {
          content: "It is me, I am on my way to the intake meeting",
          source: "client",
          type: "sms_inbound",
          agoMinutes: 1700,
        },
        {
          content: "Do I need to bring anything besides the letter?",
          source: "client",
          type: "sms_inbound",
          agoMinutes: 1695,
        },
        {
          content: "Sorry, I think I texted you from my work phone earlier",
          source: "client",
          type: "sms_inbound",
          agoMinutes: 1610,
        },
        {
          content: "",
          source: "system",
          type: "merge_note",
          agoMinutes: 1600,
        },
        {
          content:
            "No problem at all, I pulled those messages into this conversation. The letter and your ID are all you need",
          source: "volunteer",
          agoMinutes: 1595,
        },
        {
          content: "The intake worker was really kind",
          source: "client",
          agoMinutes: 1445,
        },
        {
          content: "Thank you, any help is appreciated",
          source: "client",
          agoMinutes: 1440,
        },
        {
          content:
            "Glad it went well. I am raising the priority so the weekend shift keeps an eye on this until you are settled",
          source: "volunteer",
          agoMinutes: 1435,
        },
        {
          content: "Priority changed to high",
          source: "system",
          type: "priority_changed",
          eventParams: { to: "high" },
          agoMinutes: 1430,
        },
        // Closed after intake looked settled, reopened when the bed fell through
        {
          content:
            "Glad the intake went well. I will close this for now, text us any time",
          source: "volunteer",
          agoMinutes: 725,
        },
        {
          content: "Status changed to closed",
          source: "system",
          type: "status_closed",
          agoMinutes: 720,
        },
        {
          content:
            "The bed fell through. They gave it away because I was at work and missed their call",
          source: "client",
          type: "sms_inbound",
          agoMinutes: 365,
        },
        {
          content: "Status changed to open",
          source: "system",
          type: "status_opened",
          agoMinutes: 360,
        },
        // Call attempts and the media cluster stay at the recent end
        // of the thread: the conversation is virtualized and the story
        // walk highlights these elements, so they must be inside the
        // mounted window. The narrative runs from a missed call and a
        // text through the client's voicemail into a completed call
        // that sorts out a held bed, confirmed by photo and checklist.
        {
          content: "",
          source: "volunteer",
          type: "phone_call",
          callStatus: "no_answer",
          agoMinutes: 340,
        },
        {
          content: "Just tried to call you. I am on until 9 tonight",
          source: "volunteer",
          type: "sms_outbound",
          agoMinutes: 338,
        },
        {
          content: "",
          source: "client",
          type: "voicemail",
          agoMinutes: 320,
          media: [{ kind: "recording" }],
        },
        {
          content: "",
          source: "volunteer",
          type: "phone_call",
          callStatus: "completed",
          callDurationSeconds: 340,
          agoMinutes: 300,
        },
        {
          content:
            "Client sounds stressed but steadier after we spoke. The east side shelter is holding a bed until 8pm if they bring the referral letter.",
          source: "volunteer",
          type: "internal_note",
          isPrivate: true,
          agoMinutes: 290,
          reactions: [{ reaction: "acknowledge", agoMinutes: 280 }],
        },
        {
          content: "This is the letter they gave me at the desk",
          source: "client",
          agoMinutes: 240,
          media: [{ kind: "image", contentType: "image/jpeg" }],
        },
        {
          content:
            "That is the referral confirmation, you are all set for tonight",
          source: "volunteer",
          agoMinutes: 235,
        },
        {
          content:
            "Attached the housing checklist we went over. Bring your ID and the letter",
          source: "volunteer",
          agoMinutes: 180,
          media: [
            {
              kind: "file",
              filename: "housing-checklist.txt",
              contentType: "text/plain",
            },
          ],
        },
        {
          content:
            "Checked in a few minutes ago. Thank you for staying on this",
          source: "client",
          type: "sms_inbound",
          agoMinutes: 5,
        },
        {
          content: "Really glad to hear it. I will check in with you tomorrow",
          source: "volunteer",
          agoMinutes: 2,
        },
      ],
    },
    {
      title: "Follow-up on legal aid referral",
      description: "Client was referred to legal aid last week",
      queue: "Intake",
      priority: "normal",
      assignedTo: me,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 10080, // 7 days
      followUps: [
        {
          content:
            "Referred you to the legal aid clinic downtown. They do intake on Tuesdays and Thursdays",
          source: "volunteer",
          agoMinutes: 10000,
        },
        {
          content: "They said they would call me back",
          source: "client",
          agoMinutes: 8640,
        },
        {
          content: "Should I just wait or call them again?",
          source: "client",
          agoMinutes: 8637,
        },
        {
          content: "",
          source: "client",
          type: "voicemail",
          agoMinutes: 7200,
          media: [
            {
              kind: "recording",
              durationSeconds: 12,
            },
          ],
        },
        {
          content:
            "Left them a message on your behalf. Their intake line fills up fast in the mornings",
          source: "volunteer",
          agoMinutes: 7100,
        },
        {
          content:
            "Called again this morning and got through. You are on their callback list for this week",
          source: "volunteer",
          agoMinutes: 5760,
        },
        // Client MMS: no filename (Twilio does not provide one)
        {
          content: "Here is the paper you asked me to send",
          source: "client",
          agoMinutes: 4320,
          media: [
            {
              kind: "image",
              contentType: "image/png",
            },
          ],
        },
        {
          content: "They finally reached out, thank you",
          source: "client",
          agoMinutes: 2880,
        },
        {
          content: "Checking in, did the meeting happen?",
          source: "volunteer",
          agoMinutes: 1440,
        },
      ],
    },
    {
      title: "Safety planning session",
      description: "Client requested safety planning support",
      queue: "Crisis",
      priority: "high",
      assignedTo: me,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 180, // 3 hours
      followUps: [
        {
          content: "Assigned to Dev Admin",
          source: "system",
          type: "volunteer_assigned",
          eventParams: { userId: me },
          agoMinutes: 175,
        },
        {
          content: "I need to talk about my situation",
          source: "client",
          agoMinutes: 170,
        },
        {
          content: "Things at home have gotten worse this week",
          source: "client",
          agoMinutes: 168,
        },
        {
          content: "",
          source: "client",
          type: "voicemail",
          agoMinutes: 165,
          media: [
            {
              kind: "recording",
              durationSeconds: 47,
            },
          ],
        },
        {
          content: "I am here for you. Can you tell me more?",
          source: "volunteer",
          agoMinutes: 160,
        },
        {
          content: "I can not really talk right now, texting is safer",
          source: "client",
          type: "sms_inbound",
          agoMinutes: 150,
        },
        {
          content: "That is completely fine, we can do everything by text",
          source: "volunteer",
          type: "sms_outbound",
          agoMinutes: 148,
        },
        {
          content:
            "Have you been able to put together a bag of essentials somewhere safe?",
          source: "volunteer",
          type: "sms_outbound",
          agoMinutes: 140,
        },
        {
          content: "Not yet, I can do that tonight",
          source: "client",
          type: "sms_inbound",
          agoMinutes: 130,
        },
        {
          content:
            "Start with documents, medications, and some cash if you can. We will go through the rest of the plan step by step",
          source: "volunteer",
          type: "sms_outbound",
          agoMinutes: 120,
        },
        {
          content: "High-risk situation. Follow up within 24h per protocol.",
          source: "volunteer",
          type: "internal_note",
          isPrivate: true,
          agoMinutes: 100,
        },
        {
          content: "Ok. Thank you",
          source: "client",
          type: "sms_inbound",
          agoMinutes: 95,
        },
      ],
    },
    {
      title: "Benefits application help",
      description: "Assistance with benefits paperwork",
      queue: "Intake",
      priority: "low",
      assignedTo: me,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 20160, // 14 days
      followUps: [
        {
          content: "Need help filling out forms",
          source: "client",
          agoMinutes: 20100,
        },
        {
          content: "It is the renewal packet, I do not understand section B",
          source: "client",
          agoMinutes: 20095,
        },
        {
          content:
            "We can go through it together. Are you free for a call this week?",
          source: "volunteer",
          agoMinutes: 20000,
        },
        {
          content: "Thursday afternoon works",
          source: "client",
          agoMinutes: 19900,
        },
      ],
    },
    // Locked-state demo: no key wrap, so the title and description render
    // as the encrypted/no-access fallback in the UI.
    {
      title: "Callback request from overnight line",
      description: "Caller asked for a callback during business hours",
      queue: "Intake",
      priority: "normal",
      assignedTo: me,
      onHold: false,
      withKeyWrap: false, // Tests decryption fallback
      createdAgo: 60,
      followUps: [],
    },

    // --- ON HOLD ---
    {
      title: "Waiting for callback from shelter",
      description: "Client requested callback when shelter has a bed",
      queue: "Housing",
      priority: "normal",
      assignedTo: me,
      onHold: true,
      withKeyWrap: true,
      createdAgo: 7200, // 5 days
      followUps: [
        {
          content: "Assigned to Dev Admin",
          source: "system",
          type: "volunteer_assigned",
          eventParams: { userId: me },
          agoMinutes: 7100,
        },
        {
          content: "Any word from the shelter yet?",
          source: "client",
          agoMinutes: 7000,
        },
        {
          content: "Not yet. I will call them again this afternoon",
          source: "volunteer",
          agoMinutes: 6990,
        },
        {
          content: "Shelter said they will call when a bed opens",
          source: "volunteer",
          agoMinutes: 5760,
        },
        {
          content: "Put on hold",
          source: "system",
          type: "hold_placed",
          agoMinutes: 5750,
        },
        {
          content: "Still no word from them",
          source: "client",
          agoMinutes: 2880,
        },
        {
          content:
            "I know the waiting is hard. You are still on their list, I confirmed this morning",
          source: "volunteer",
          agoMinutes: 2870,
        },
        {
          content:
            "Called shelter again, they have a long waitlist. Documented in case file.",
          source: "volunteer",
          type: "internal_note",
          isPrivate: true,
          agoMinutes: 2000,
        },
      ],
    },
    {
      title: "Pending court date documentation",
      description: "Need documents before next court appearance",
      queue: "Intake",
      priority: "high",
      assignedTo: me,
      onHold: true,
      withKeyWrap: true,
      createdAgo: 14400, // 10 days
      followUps: [
        {
          content: "Assigned to Dev Admin",
          source: "system",
          type: "volunteer_assigned",
          eventParams: { userId: me },
          agoMinutes: 14350,
        },
        {
          content: "Court date is in two weeks, need letter",
          source: "client",
          agoMinutes: 14300,
        },
        {
          content: "My lawyer says it has to be notarized too",
          source: "client",
          agoMinutes: 14295,
        },
        {
          content:
            "Working on getting the documentation together. I will ask about the notary",
          source: "volunteer",
          agoMinutes: 14200,
        },
        {
          content: "The letter is drafted, waiting on a signature",
          source: "volunteer",
          agoMinutes: 10080,
        },
        {
          content: "Attached the safety plan template for review",
          source: "volunteer",
          agoMinutes: 10070,
          media: [
            {
              kind: "file",
              filename: "safety-plan-template.txt",
              contentType: "text/plain",
            },
          ],
        },
        {
          content: "Put on hold",
          source: "system",
          type: "hold_placed",
          agoMinutes: 8640,
        },
        {
          content: "Waiting on court clerk response. Will check back Monday.",
          source: "volunteer",
          type: "internal_note",
          isPrivate: true,
          agoMinutes: 8630,
        },
      ],
    },

    // --- UNASSIGNED ---
    {
      title: "Emergency referral needed",
      description: "Urgent case flagged by intake volunteer",
      queue: "Crisis",
      priority: "urgent",
      assignedTo: null,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 45, // 45 minutes ago
      // No cursor: never-opened tickets announce via their New status
      // mark, and the story ticket stays the sole unread-pill ticket.
      followUps: [
        {
          content: "Please help, I am in danger",
          source: "client",
          agoMinutes: 40,
        },
        {
          content: "I can not stay here tonight",
          source: "client",
          agoMinutes: 38,
        },
        {
          content: "Please call me back as soon as someone is free",
          source: "client",
          agoMinutes: 37,
        },
      ],
    },
    {
      title:
        "Emergency referral needed for client who is in immediate danger and requires relocation assistance as well as legal representation for upcoming court hearing",
      description: "Multi-service coordination case",
      queue: "Crisis",
      priority: "high",
      assignedTo: null,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 90,
      followUps: [
        {
          content: "I need help with everything, I do not know where to start",
          source: "client",
          agoMinutes: 85,
        },
        {
          content: "I have to be out of the apartment by the first",
          source: "client",
          agoMinutes: 83,
        },
        {
          content: "And I still need a lawyer for the hearing on the 12th",
          source: "client",
          agoMinutes: 82,
        },
      ],
    },
    {
      title: "New intake call",
      description: "Voicemail received, needs triage",
      queue: "Intake",
      priority: "normal",
      assignedTo: null,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 120, // 2 hours
      // A single voicemail and nothing else: the shape a brand new
      // contact produces when they call outside a shift.
      followUps: [
        {
          content: "",
          source: "client",
          type: "voicemail",
          agoMinutes: 118,
          media: [{ kind: "recording", durationSeconds: 23 }],
        },
      ],
    },
    {
      title: "Relocation assistance request",
      description: "Client needs help with relocation planning",
      queue: "Housing",
      priority: "high",
      assignedTo: null,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 360, // 6 hours
      // No cursor: announced by the New status mark (see above).
      followUps: [
        {
          content: "I need to move but I do not know where to go",
          source: "client",
          agoMinutes: 350,
        },
        {
          content: "It is not safe for me to stay in this county",
          source: "client",
          agoMinutes: 345,
        },
        {
          content: "Is anyone there?",
          source: "client",
          agoMinutes: 200,
        },
      ],
    },
    {
      title: "Transportation to appointment",
      description: "Client needs ride to medical appointment",
      queue: "Intake",
      priority: "normal",
      assignedTo: null,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 2880, // 2 days
      followUps: [
        {
          content: "I have a doctor appointment next week",
          source: "client",
          agoMinutes: 2800,
        },
        {
          content: "Can someone help me get there?",
          source: "client",
          agoMinutes: 1440,
        },
        {
          content:
            "It is on the far side of town and the buses do not run early enough",
          source: "client",
          agoMinutes: 1435,
        },
      ],
    },
    {
      title: "Food bank referral",
      description: "Client asking about food assistance",
      queue: "Intake",
      priority: "low",
      assignedTo: null,
      onHold: false,
      withKeyWrap: true,
      createdAgo: 480, // 8 hours
      followUps: [
        {
          content: "Where can I get groceries?",
          source: "client",
          agoMinutes: 470,
        },
        {
          content: "The pantry near me moved and I do not know where it went",
          source: "client",
          agoMinutes: 468,
        },
      ],
    },
  ];

  // Generate additional tickets programmatically to test
  // virtual scrolling with large lists. Uses a simple
  // deterministic seed so re-runs produce the same data.
  // Skipped when handcraftedOnly is set (E2E tests use only the 14 above).
  const GENERATED_COUNT = options?.handcraftedOnly === true ? 0 : 106;
  const queuesArr = ["Intake", "Crisis", "Housing"] as const;
  const priorities: TicketPriority[] = [
    "low",
    "normal",
    "normal",
    "high",
    "urgent",
  ];
  // Full titles (no numeric suffixes): repeats across a long list read
  // as routine work, the way a real queue looks.
  const titlePool = [
    "Referral request",
    "Follow-up needed",
    "New intake call",
    "Callback requested",
    "Help with benefits paperwork",
    "Ride needed to medical appointment",
    "Safety check-in",
    "Housing waitlist question",
    "Question about court paperwork",
    "Prescription refill help",
    "Utility shutoff notice",
    "School enrollment question",
    "Childcare resource request",
    "Job search support",
    "Food assistance question",
    "ID replacement help",
    "Counseling referral request",
    "Interpreter needed for appointment",
    "Insurance paperwork question",
    "Weekly check-in call",
    "Left voicemail after hours",
    "Text conversation follow-up",
    "Needs updated resource list",
    "Rent assistance question",
  ];
  const descriptionPool = [
    "Phone intake from the main line",
    "Client texted the support line",
    "Voicemail left after hours",
    "Follow-up from an earlier call",
    "Client asked about available resources",
    "Case opened during evening shift",
    "Transferred from the crisis line",
    "Client asked for a callback",
  ];
  const clientMessages = [
    "I need some help please",
    "Can someone call me back when you get a chance?",
    "I have a question about my case",
    "When is my next appointment? I lost the paper I wrote it on",
    "I wanted to follow up on what we talked about last time",
    "Is there anyone available to talk today?",
    "Something came up and I have new information to share",
    "Things have changed since we last spoke",
  ];
  const volMessages = [
    "I will look into this for you and get back to you tomorrow",
    "Checking with the team now, hang tight",
    "Left you a voicemail, will try again tomorrow morning",
    "I passed your info along to the agency we talked about",
    "Scheduled a follow-up call for next week, does Tuesday work?",
    "Updated your file with the new details you sent",
  ];

  // Simple deterministic hash for reproducible "random" values.
  function seedHash(i: number, salt: number): number {
    let h = (i * 2654435761 + salt * 40503) >>> 0;
    h = ((h ^ (h >>> 16)) * 2246822507) >>> 0;
    h = ((h ^ (h >>> 13)) * 3266489909) >>> 0;
    return (h ^ (h >>> 16)) >>> 0;
  }

  for (let g = 0; g < GENERATED_COUNT; g++) {
    const h0 = seedHash(g, 0);
    const h1 = seedHash(g, 1);
    const h2 = seedHash(g, 2);
    const h3 = seedHash(g, 3);
    const h4 = seedHash(g, 4);

    const queue = queuesArr[h0 % queuesArr.length];
    const priority = priorities[h1 % priorities.length];
    const title = titlePool[h2 % titlePool.length];
    const description = descriptionPool[h4 % descriptionPool.length];
    if (
      queue === undefined ||
      priority === undefined ||
      title === undefined ||
      description === undefined
    )
      continue;

    // 40% assigned to me, 60% unassigned
    const assigned = h3 % 5 < 2 ? me : null;
    // 15% on hold (only if assigned)
    const hold = assigned !== null && h4 % 7 === 0;

    // Created 30 min to 30 days ago. The 180-follow-up pagination ticket
    // (g === 0) is pinned old: a long history reads as weeks of work, and
    // its newest message must not outrank the story ticket's fresh
    // activity under the default recent-activity sort.
    const ageMinutes = g === 0 ? 20160 : 30 + (h0 % 43200);

    // 0-4 follow-ups (first generated ticket gets 180 for pagination/feature testing)
    const fuCount = g === 0 ? 180 : h1 % 5;
    const followUps: FollowUpDef[] = [];

    if (g === 0) {
      // 180 follow-ups matching production data shapes.
      // Client media (MMS/voicemail): no filename (Twilio
      // doesn't provide one). Volunteer attachments: filename
      // (picked from device). Voicemail content: empty or
      // transcription. System events: exact server strings.
      const totalAge = ageMinutes;
      for (let f = 0; f < 180; f++) {
        const fuAge = Math.max(
          1,
          totalAge - Math.floor((totalAge * (f + 1)) / 181),
        );
        const fh = seedHash(0, 10 + f);
        const isClient = fh % 2 === 0;
        const msgs = isClient ? clientMessages : volMessages;

        if (f === 3) {
          followUps.push({
            content: "Assigned to Alice",
            source: "system",
            type: "volunteer_assigned",
            eventParams: { userId: me },
            agoMinutes: fuAge,
          });
        } else if (f === 10) {
          followUps.push({
            content: "Priority changed to high",
            source: "system",
            type: "priority_changed",
            eventParams: { to: "high", from: "normal" },
            agoMinutes: fuAge,
          });
        } else if (f === 20) {
          followUps.push({
            content: "Put on hold",
            source: "system",
            type: "hold_placed",
            agoMinutes: fuAge,
          });
        } else if (f === 30) {
          followUps.push({
            content: "Status changed to closed",
            source: "system",
            type: "status_closed",
            agoMinutes: fuAge,
          });
        } else if (f === 31) {
          followUps.push({
            content: "Status changed to open",
            source: "system",
            type: "status_opened",
            agoMinutes: fuAge,
          });
        } else if (f === 40) {
          followUps.push({
            content: "Assigned to Bob",
            source: "system",
            type: "volunteer_assigned",
            eventParams: { userId: me },
            agoMinutes: fuAge,
          });
        } else if (f === 5 || f === 55 || f === 120) {
          const noteText =
            f === 5
              ? "Client seems anxious, approach carefully"
              : f === 55
                ? "Coordinating with housing team on this"
                : "Supervisor reviewed, approved next steps";
          followUps.push({
            content: noteText,
            source: "volunteer",
            type: "internal_note",
            isPrivate: true,
            agoMinutes: fuAge,
          });
        } else if (f === 8) {
          // Client voicemail (inbound call, no transcription)
          followUps.push({
            content: "",
            source: "client",
            type: "voicemail",
            agoMinutes: fuAge,
            media: [{ kind: "recording", durationSeconds: 12 }],
          });
        } else if (f === 25) {
          // Volunteer voicemail (outbound call)
          followUps.push({
            content: "",
            source: "volunteer",
            agoMinutes: fuAge,
            media: [{ kind: "recording", durationSeconds: 30 }],
          });
        } else if (f === 65) {
          // Client voicemail with transcription
          followUps.push({
            content:
              "Hi, I wanted to talk about the appointment next week, I am not sure I can make it because my ride fell through and I need to figure out another way to get there",
            source: "client",
            agoMinutes: fuAge,
            media: [{ kind: "recording", durationSeconds: 90 }],
          });
        } else if (f === 12) {
          // Client MMS image only (no text, no filename from Twilio)
          followUps.push({
            content: "",
            source: "client",
            agoMinutes: fuAge,
            media: [{ kind: "image", contentType: "image/jpeg" }],
          });
        } else if (f === 35) {
          // Client MMS image with text body
          followUps.push({
            content: "Here is a photo of the document you asked for",
            source: "client",
            agoMinutes: fuAge,
            media: [{ kind: "image", contentType: "image/jpeg" }],
          });
        } else if (f === 50) {
          // Volunteer sends image (from device, has filename)
          followUps.push({
            content: "Attached the resource guide",
            source: "volunteer",
            agoMinutes: fuAge,
            media: [
              {
                kind: "image",
                filename: "resource-guide.jpg",
                contentType: "image/jpeg",
              },
            ],
          });
        } else if (f === 15) {
          // Client file via MMS (no filename from Twilio)
          followUps.push({
            content: "",
            source: "client",
            agoMinutes: fuAge,
            media: [{ kind: "file", contentType: "application/pdf" }],
          });
        } else if (f === 45) {
          // Volunteer file (from device, has filename)
          followUps.push({
            content: "Here are the referral instructions",
            source: "volunteer",
            agoMinutes: fuAge,
            media: [
              {
                kind: "file",
                filename: "referral-instructions.docx",
                contentType:
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              },
            ],
          });
        } else if (f === 100) {
          // Client MMS with multiple media (no filenames)
          followUps.push({
            content: "",
            source: "client",
            agoMinutes: fuAge,
            media: [
              { kind: "image", contentType: "image/png" },
              { kind: "file", contentType: "application/pdf" },
            ],
          });
        } else {
          const msg = msgs[fh % msgs.length] ?? "Message";
          followUps.push({
            content: msg,
            source: isClient ? "client" : "volunteer",
            agoMinutes: fuAge,
          });
        }
      }
    } else {
      for (let f = 0; f < fuCount; f++) {
        const fh = seedHash(g, 10 + f);
        const isClient = fh % 2 === 0;
        const msgs = isClient ? clientMessages : volMessages;
        const msg = msgs[fh % msgs.length] ?? "Message";
        // Space follow-ups evenly within the ticket's age
        const fuAge = Math.max(
          1,
          ageMinutes - Math.floor((ageMinutes * (f + 1)) / (fuCount + 1)),
        );
        followUps.push({
          content: msg,
          source: isClient ? "client" : "volunteer",
          agoMinutes: fuAge,
        });
      }
    }

    ticketDefs.push({
      title,
      description,
      queue,
      priority,
      assignedTo: assigned,
      onHold: hold,
      withKeyWrap: true,
      createdAgo: ageMinutes,
      followUps,
    });
  }

  const createdIds: string[] = [];
  const encoder = new TextEncoder();

  for (let i = 0; i < ticketDefs.length; i++) {
    const def = ticketDefs.at(i);
    if (!def) continue;
    const client = clients.at(i % clients.length);
    if (!client) continue;
    const clientId = client.id;

    const qId = queueMap.get(def.queue);
    if (qId === undefined) {
      throw new InternalError(
        `Queue "${def.queue}" not found. Run seed first.`,
      );
    }

    // Idempotency: skip if ticket already exists for this client
    const existing = await tDb
      .selectFrom("tickets")
      .select("id")
      .where("client_id", "=", clientId)
      .executeTakeFirst();

    if (existing) {
      createdIds.push(existing.id);
      continue;
    }

    // Generate ticket key and encrypt content. Ids are minted before
    // encryption so the AAD can bind them (ADR-053).
    const tk = generateContentKey();
    const ticketId = newTicketId();
    const encryptedTitle = encryptContent(
      encoder.encode(def.title),
      tk,
      buildContentAad(ticketId, "title"),
    );
    const encryptedDescription = encryptContent(
      encoder.encode(def.description),
      tk,
      buildContentAad(ticketId, "description"),
    );

    const keyGeneration = newKeyGeneration();
    const createdAt = minutesAgo(def.createdAgo);

    const ticket = await tDb
      .insertInto("tickets")
      .values({
        id: ticketId,
        client_id: clientId,
        queue_id: qId,
        encrypted_title: Buffer.from(encryptedTitle),
        encrypted_description: Buffer.from(encryptedDescription),
        key_generation: keyGeneration,
        assigned_to: def.assignedTo,
        on_hold: def.onHold,
        priority: def.priority,
        created_at: createdAt,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    // Create ECIES key wrap
    if (def.withKeyWrap) {
      const wrap = eciesEncrypt(tk, volPublic);
      await tDb
        .insertInto("ticket_key_wraps")
        .values({
          ticket_id: ticket.id,
          volunteer_id: userId,
          key_generation: keyGeneration,
          ephemeral_point: Buffer.from(wrap.ephemeralPoint),
          nonce: Buffer.from(wrap.nonce),
          wrapped_key: Buffer.from(wrap.ciphertext),
          algorithm: "ecies-ristretto255-v1",
        })
        .execute();
    }

    // Create follow-ups (encrypted with same ticket key, except system events
    // which carry no encrypted content under the Proton model)
    for (const fu of def.followUps) {
      const isSystem = fu.source === "system";
      const followUpId = newFollowupId();
      const encryptedContent = isSystem
        ? new Uint8Array(0)
        : encryptContent(
            encoder.encode(fu.content),
            tk,
            buildContentAad(ticket.id, followupSlot(followUpId)),
          );
      const followUp = await tDb
        .insertInto("followups")
        .values({
          id: followUpId,
          ticket_id: ticket.id,
          source: fu.source,
          type: fu.type ?? "message",
          is_private: fu.isPrivate ?? false,
          encrypted_content: Buffer.from(encryptedContent),
          event_params: fu.eventParams ?? null,
          created_at: minutesAgo(fu.agoMinutes),
          ...(fu.source === "volunteer"
            ? { created_by: fu.authorId ?? userId }
            : {}),
          ...(fu.callStatus !== undefined
            ? { call_status: fu.callStatus }
            : {}),
          ...(fu.callDurationSeconds !== undefined
            ? { call_duration_seconds: fu.callDurationSeconds }
            : {}),
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      // Seed reactions (rendered on internal notes)
      if (fu.reactions !== undefined) {
        for (const r of fu.reactions) {
          await tDb
            .insertInto("followup_reactions")
            .values({
              followup_id: followUp.id,
              user_id: reactingUserId,
              reaction: r.reaction,
              created_at: minutesAgo(r.agoMinutes),
            })
            .execute();
        }
      }

      // Create media records (encrypted blobs stored in BlobStore)
      if (fu.media && def.withKeyWrap) {
        let imageAssetIdx = 0;
        for (const media of fu.media) {
          if (media.kind === "recording") {
            const raw =
              assets?.voicemailAudio !== undefined
                ? Buffer.from(assets.voicemailAudio.bytes)
                : generateWav(media.durationSeconds ?? 5);
            const effectiveDuration =
              assets?.voicemailAudio !== undefined
                ? assets.voicemailAudio.durationSeconds
                : (media.durationSeconds ?? null);
            const recordingId = newRecordingId();
            const encrypted = encryptContent(
              raw,
              tk,
              buildContentAad(ticket.id, blobSlot(recordingId)),
            );
            const blobKey = await blobStore.put(
              orgSchema,
              "recording",
              Buffer.from(encrypted),
            );
            await tDb
              .insertInto("recordings")
              .values({
                id: recordingId,
                ticket_id: ticket.id,
                followup_id: followUp.id,
                blob_key: blobKey,
                size_bytes: encrypted.byteLength,
                duration_seconds: effectiveDuration,
                created_at: minutesAgo(fu.agoMinutes),
              })
              .execute();
          } else {
            // image or file attachment
            let raw: Buffer;
            if (
              media.kind === "image" &&
              assets?.documentImages !== undefined &&
              assets.documentImages.length > 0
            ) {
              const imgAsset =
                assets.documentImages[
                  imageAssetIdx % assets.documentImages.length
                ];
              if (imgAsset === undefined) {
                raw = generatePng();
              } else {
                raw = Buffer.from(imgAsset.bytes);
                imageAssetIdx++;
              }
            } else {
              raw = media.kind === "image" ? generatePng() : generateTextFile();
            }
            const attachmentId = newAttachmentId();
            const encrypted = encryptContent(
              raw,
              tk,
              buildContentAad(ticket.id, blobSlot(attachmentId)),
            );
            const category = "attachment" as const;
            const blobKey = await blobStore.put(
              orgSchema,
              category,
              Buffer.from(encrypted),
            );
            const encFilename =
              media.filename !== undefined
                ? Buffer.from(
                    encryptContent(
                      encoder.encode(media.filename),
                      tk,
                      buildContentAad(ticket.id, filenameSlot(attachmentId)),
                    ),
                  )
                : null;
            await tDb
              .insertInto("attachments")
              .values({
                id: attachmentId,
                ticket_id: ticket.id,
                followup_id: followUp.id,
                blob_key: blobKey,
                size_bytes: encrypted.byteLength,
                encrypted_filename: encFilename,
                content_type: media.contentType ?? null,
                created_at: minutesAgo(fu.agoMinutes),
              })
              .execute();
          }
        }
      }
    }

    // Seed a read cursor so the ticket reads as unread: the cursor
    // says the volunteer last read at `unreadSince`, and any newer
    // non-system follow-up by others counts toward the unread badge.
    // Encrypted exactly the way the client writes it (ticket key,
    // cursor slot AAD, JSON payload with an ISO readUpTo string), so
    // the client's read-state decrypt path consumes it unchanged.
    if (def.unreadSince !== undefined && def.withKeyWrap) {
      const cursorPayload = JSON.stringify({
        readUpTo: minutesAgo(def.unreadSince).toISOString(),
      });
      const encryptedCursor = encryptContent(
        encoder.encode(cursorPayload),
        tk,
        buildContentAad(ticket.id, cursorSlot(me)),
      );
      await tDb
        .insertInto("ticket_read_cursors")
        .values({
          ticket_id: ticket.id,
          user_id: me,
          encrypted_read_cursor: Buffer.from(encryptedCursor),
        })
        .execute();
    }

    createdIds.push(ticket.id);
  }

  return { ticketIds: createdIds };
}
