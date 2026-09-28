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
  buildSeedStories,
  originFollowUps,
  messageFollowUp,
  messageStepContent,
  SEED_VOICEMAIL_DURATION_S,
  type SeedStory,
} from "@care-y/shared/dev/seed-stories.js";
import {
  SEED_HANDBOOK_TICKET,
  generateSeedPng,
  generateSeedTextFile,
  type SeedHandbookAuthor,
} from "@care-y/shared/dev/seed-handbook-ticket.js";
import {
  generateContentKey,
  encryptContent,
  buildContentAad,
  followupSlot,
  cursorSlot,
  blobSlot,
  filenameSlot,
  fileKeySlot,
  eciesEncrypt,
  toRistrettoPoint,
  requireSodium,
  type SymmetricKey,
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
): Promise<{
  ticketIds: string[];
  /**
   * Content key per ticket created by this run, keyed by ticket id, for
   * in-process seeders that need to add follow-ups to the same tickets.
   *
   * IN-PROCESS ONLY. Never return this from a procedure, log it, or
   * persist it. Nothing on a running server can recover these keys by any
   * other route (the org wrap opens with the org secret key, which lives
   * on the client), and that property is the point.
   */
  ticketKeys: ReadonlyMap<string, SymmetricKey>;
}> {
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
    /** Defaults to open. Closed tickets end with a status_closed follow-up. */
    status?: "open" | "closed";
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

  // The handbook story ticket, built from the shared definition the client
  // dev seed also replays. "other" is the reacting user, so the first
  // shift's messages, the handoff and the note reaction name another
  // volunteer.
  function handbookTicketDef(): TicketDef {
    const def = SEED_HANDBOOK_TICKET;
    const resolve = (who: SeedHandbookAuthor): UserId =>
      who === "me" ? me : reactingUserId;
    return {
      title: def.title,
      description: def.description,
      queue: def.queue,
      priority: def.priority,
      unreadSince: def.unreadSince,
      assignedTo: me,
      onHold: false,
      withKeyWrap: true,
      createdAgo: def.createdAgo,
      followUps: def.followUps.map((fu) => ({
        content: fu.content,
        source: fu.source,
        ...(fu.type !== undefined ? { type: fu.type } : {}),
        ...(fu.isPrivate !== undefined ? { isPrivate: fu.isPrivate } : {}),
        agoMinutes: fu.agoMinutes,
        ...(fu.media !== undefined
          ? { media: fu.media.map((media) => ({ ...media })) }
          : {}),
        ...(fu.eventParams !== undefined
          ? {
              eventParams:
                "user" in fu.eventParams
                  ? { userId: resolve(fu.eventParams.user) }
                  : { to: fu.eventParams.to },
            }
          : {}),
        ...(fu.callStatus !== undefined ? { callStatus: fu.callStatus } : {}),
        ...(fu.callDurationSeconds !== undefined
          ? { callDurationSeconds: fu.callDurationSeconds }
          : {}),
        // Seeded reactions are always stamped with the reacting user.
        ...(fu.reactions !== undefined
          ? {
              reactions: fu.reactions.map((r) => ({
                reaction: r.reaction,
                agoMinutes: r.agoMinutes,
              })),
            }
          : {}),
        ...(fu.author !== undefined ? { authorId: resolve(fu.author) } : {}),
      })),
    };
  }

  const ticketDefs: TicketDef[] = [
    // --- MY TICKETS (assigned to me) ---
    handbookTicketDef(),
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

  // Generated tickets: a month of ordinary work from the shared story
  // generator, the same stories the client-side dev seeder replays. The
  // volume also exercises virtual scrolling on long lists.
  // Skipped when handcraftedOnly is set (E2E tests use only the 14 above).
  const GENERATED_COUNT = options?.handcraftedOnly === true ? 0 : 106;

  function storyToTicketDef(story: SeedStory): TicketDef {
    const { origin } = story;
    const assignStep = story.steps.find((s) => s.kind === "assign");
    const assignee =
      assignStep?.kind !== "assign"
        ? null
        : assignStep.to === "me"
          ? me
          : reactingUserId;
    // Every volunteer follow-up belongs to whoever took the ticket, which
    // is also who answered the call on call-opened stories.
    const authorId =
      assignee !== null && assignee !== me ? assignee : undefined;

    // The follow-ups that opened the ticket (none for a ticket a volunteer
    // opened). A voicemail after a missed call lands a minute after the
    // call, kept strictly before the first step.
    const followUps: FollowUpDef[] = [];
    const firstStepAgo = story.steps.at(0)?.agoMinutes;
    originFollowUps(origin.kind).forEach((shape, k) => {
      if (shape.type === "phone_call") {
        followUps.push({
          content: "",
          source: shape.source,
          type: shape.type,
          callStatus:
            origin.callDurationSeconds !== undefined
              ? "completed"
              : "no_answer",
          ...(origin.callDurationSeconds !== undefined
            ? { callDurationSeconds: origin.callDurationSeconds }
            : {}),
          agoMinutes: origin.agoMinutes,
        });
      } else if (shape.type === "voicemail") {
        const agoMinutes = Math.min(
          origin.agoMinutes,
          Math.max(
            origin.agoMinutes - k,
            firstStepAgo !== undefined ? firstStepAgo + 1 : 1,
          ),
        );
        followUps.push({
          content: "Voicemail recording",
          source: shape.source,
          type: shape.type,
          media: [
            { kind: "recording", durationSeconds: SEED_VOICEMAIL_DURATION_S },
          ],
          agoMinutes,
        });
      } else {
        followUps.push({
          content: origin.content,
          source: shape.source,
          type: shape.type,
          agoMinutes: origin.agoMinutes,
        });
      }
    });

    let priority = story.initialPriority;
    let onHold = false;
    let status: "open" | "closed" = "open";
    let lastVolunteerMessageAgo: number | undefined;
    for (const step of story.steps) {
      switch (step.kind) {
        case "message": {
          const shape = messageFollowUp(story.channel, step.from);
          followUps.push({
            content: messageStepContent(story, step),
            source: shape.source,
            type: shape.type,
            agoMinutes: step.agoMinutes,
            ...(shape.source === "volunteer" && authorId !== undefined
              ? { authorId }
              : {}),
          });
          if (step.from === "volunteer") {
            lastVolunteerMessageAgo = step.agoMinutes;
          }
          break;
        }
        case "note":
          followUps.push({
            content: step.content,
            source: "volunteer",
            type: "internal_note",
            isPrivate: true,
            agoMinutes: step.agoMinutes,
            ...(authorId !== undefined ? { authorId } : {}),
          });
          break;
        case "priority":
          followUps.push({
            content: `Priority changed to ${step.to}`,
            source: "system",
            type: "priority_changed",
            eventParams: { from: priority, to: step.to },
            agoMinutes: step.agoMinutes,
          });
          priority = step.to;
          break;
        case "assign":
          followUps.push({
            content: "Volunteer assigned",
            source: "system",
            type: "volunteer_assigned",
            eventParams: { userId: step.to === "me" ? me : reactingUserId },
            agoMinutes: step.agoMinutes,
          });
          break;
        case "hold":
          followUps.push({
            content: "Put on hold",
            source: "system",
            type: "hold_placed",
            agoMinutes: step.agoMinutes,
          });
          onHold = true;
          break;
        case "close":
          followUps.push({
            content: "Status changed to closed",
            source: "system",
            type: "status_closed",
            agoMinutes: step.agoMinutes,
          });
          status = "closed";
          break;
      }
    }

    // Open tickets assigned to me read up to my last reply, so any client
    // message after it shows as unread.
    const unreadSince =
      assignStep?.kind === "assign" &&
      assignStep.to === "me" &&
      !onHold &&
      status === "open"
        ? lastVolunteerMessageAgo
        : undefined;

    return {
      title: story.title,
      description: story.description,
      queue: story.queue,
      priority,
      assignedTo: assignee,
      onHold,
      status,
      withKeyWrap: true,
      createdAgo: origin.agoMinutes,
      followUps,
      ...(unreadSince !== undefined ? { unreadSince } : {}),
    };
  }

  for (const story of buildSeedStories(GENERATED_COUNT)) {
    ticketDefs.push(storyToTicketDef(story));
  }

  const createdIds: string[] = [];
  // Content key per ticket this run created, so a later seeder can add
  // follow-ups to the same ticket. Nothing on a running server can
  // recover these: the org wrap opens only with the org secret key, which
  // lives on the client. Skipped for tickets that already existed, whose
  // keys this run never held.
  const ticketKeys = new Map<string, SymmetricKey>();
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
        ...(def.status !== undefined ? { status: def.status } : {}),
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
      //
      // The anchor ticket (i === 0) uses the file-key envelope (ADR-089):
      // a random file key encrypts the blob, the key is wrapped under the
      // ticket key and stored in file_key_wrap. The portal seeder later
      // unwraps the file key and seals it to the channel's client_public.
      // All other tickets use the direct envelope (blob encrypted directly
      // under the ticket key, no file_key_wrap).
      const useFileKeyEnvelope = i === 0;
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

            let encrypted: Uint8Array;
            let fileKeyWrapBuf: Buffer | null = null;
            if (useFileKeyEnvelope) {
              const sodium = requireSodium();
              const fileKey = generateContentKey();
              try {
                encrypted = encryptContent(
                  raw,
                  fileKey,
                  buildContentAad(ticket.id, blobSlot(recordingId)),
                );
                fileKeyWrapBuf = Buffer.from(
                  encryptContent(
                    fileKey,
                    tk,
                    buildContentAad(ticket.id, fileKeySlot(recordingId)),
                  ),
                );
              } finally {
                sodium.memzero(fileKey);
              }
            } else {
              encrypted = encryptContent(
                raw,
                tk,
                buildContentAad(ticket.id, blobSlot(recordingId)),
              );
            }

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
                ...(fileKeyWrapBuf !== null
                  ? { file_key_wrap: fileKeyWrapBuf }
                  : {}),
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
                raw = Buffer.from(generateSeedPng());
              } else {
                raw = Buffer.from(imgAsset.bytes);
                imageAssetIdx++;
              }
            } else {
              raw =
                media.kind === "image"
                  ? Buffer.from(generateSeedPng())
                  : Buffer.from(generateSeedTextFile());
            }
            const attachmentId = newAttachmentId();

            let encrypted: Uint8Array;
            let fileKeyWrapBuf: Buffer | null = null;
            if (useFileKeyEnvelope) {
              const sodium = requireSodium();
              const fileKey = generateContentKey();
              try {
                encrypted = encryptContent(
                  raw,
                  fileKey,
                  buildContentAad(ticket.id, blobSlot(attachmentId)),
                );
                fileKeyWrapBuf = Buffer.from(
                  encryptContent(
                    fileKey,
                    tk,
                    buildContentAad(ticket.id, fileKeySlot(attachmentId)),
                  ),
                );
              } finally {
                sodium.memzero(fileKey);
              }
            } else {
              encrypted = encryptContent(
                raw,
                tk,
                buildContentAad(ticket.id, blobSlot(attachmentId)),
              );
            }

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
                ...(fileKeyWrapBuf !== null
                  ? { file_key_wrap: fileKeyWrapBuf }
                  : {}),
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
    ticketKeys.set(ticket.id, tk);
  }

  return { ticketIds: createdIds, ticketKeys };
}
