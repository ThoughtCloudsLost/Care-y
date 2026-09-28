/**
 * The handbook story ticket, "Help with housing", as plain data.
 *
 * The server's direct-insert seeder (also used by the demo) writes it row
 * by row, and the client's dev seeder replays it through the production
 * mutations, so both seeds carry the same thread. Authors are symbolic:
 * "me" is the seeding volunteer, "other" is the volunteer who worked the
 * first shift before handing the ticket over.
 *
 * Dev-only. Exposed through the "./dev/seed-handbook-ticket.js" subpath and
 * never from the package index, so production bundles do not pull it in.
 */

import type {
  CallStatus,
  FollowUpSource,
  FollowUpType,
  ReactionType,
  TicketPriority,
} from "../schemas/tickets.js";
import type { SeedQueue } from "./seed-stories.js";

/** Who a row belongs to: the seeding volunteer or the first-shift volunteer. */
export type SeedHandbookAuthor = "me" | "other";

export interface SeedHandbookMedia {
  readonly kind: "recording" | "image" | "file";
  /** For recordings: duration in seconds. */
  readonly durationSeconds?: number;
  /** For attachments: plaintext filename (encrypted at insert time). */
  readonly filename?: string;
  /** For attachments: MIME content type. */
  readonly contentType?: string;
}

/** Event parameters: the volunteer an assignment names, or the new priority. */
export type SeedHandbookEventParams =
  { readonly user: SeedHandbookAuthor } | { readonly to: TicketPriority };

export interface SeedHandbookReaction {
  readonly reaction: ReactionType;
  readonly agoMinutes: number;
  readonly by: "other";
}

export interface SeedHandbookFollowUp {
  readonly content: string;
  readonly source: FollowUpSource;
  /** Absent means "message". */
  readonly type?: FollowUpType;
  /** Absent means false. */
  readonly isPrivate?: boolean;
  readonly agoMinutes: number;
  readonly media?: readonly SeedHandbookMedia[];
  readonly eventParams?: SeedHandbookEventParams;
  /** Terminal call status for phone_call rows. */
  readonly callStatus?: CallStatus;
  /** Call duration in seconds for answered phone_call rows. */
  readonly callDurationSeconds?: number;
  /** Reactions on this row (internal notes only in the UI). */
  readonly reactions?: readonly SeedHandbookReaction[];
  /** Author of a volunteer row. Absent means "me". */
  readonly author?: SeedHandbookAuthor;
  /**
   * Part of the merge: the messages that arrived on the client's second
   * ticket, the merge event, and the reply that refers to it. The direct
   * seeder writes them in place; a replay through the app has no second
   * ticket to merge, so it leaves them out.
   */
  readonly mergedIn?: true;
}

export interface SeedHandbookTicket {
  readonly title: string;
  readonly description: string;
  readonly queue: SeedQueue;
  /** Priority once the thread's priority_changed event has run. */
  readonly priority: TicketPriority;
  /** Priority at creation, before the priority_changed event. */
  readonly initialPriority: TicketPriority;
  /** Minutes ago the ticket was opened. */
  readonly createdAgo: number;
  /** Minutes ago the seeding volunteer last read the ticket. */
  readonly unreadSince: number;
  /** Chronological, oldest first. */
  readonly followUps: readonly SeedHandbookFollowUp[];
}

export const SEED_HANDBOOK_TICKET: SeedHandbookTicket = {
  title: "Help with housing",
  description: "Client needs housing referral and support",
  queue: "Housing",
  // High matches the priority_changed event in the thread below.
  priority: "high",
  initialPriority: "normal",
  createdAgo: 4320, // 3 days
  // One unread client reply (the check-in text minutes ago). The
  // thread's final exchange is the newest activity of any seeded
  // ticket, so under the default recent-activity sort the story
  // ticket stays on top even after the unread pill clears.
  unreadSince: 15,
  followUps: [
    // Day 1: intake conversation and the shelter list. The first
    // shift's volunteer (another roster user when available) handles
    // this stretch; the seeded volunteer takes over at the handoff
    // below, which is why the reassignment events name two people.
    {
      content: "Volunteer assigned",
      source: "system",
      type: "volunteer_assigned",
      eventParams: { user: "other" },
      agoMinutes: 4310,
    },
    {
      content: "I need help finding a place to stay",
      source: "client",
      agoMinutes: 4300,
    },
    {
      content: "My sister said I can only stay with her through the weekend",
      source: "client",
      agoMinutes: 4297,
    },
    {
      content: "I can look into shelters in your area",
      source: "volunteer",
      author: "other",
      agoMinutes: 4200,
    },
    {
      content: "Is it ok if I text you a list, or would a call work better?",
      source: "volunteer",
      author: "other",
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
      author: "other",
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
      author: "other",
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
      author: "other",
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
      author: "other",
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
      author: "other",
      agoMinutes: 2085,
    },
    // Shift change: the first volunteer hands off to the seeded
    // volunteer, so the unassign/assign pair names two people.
    {
      content: "Volunteer unassigned",
      source: "system",
      type: "volunteer_unassigned",
      eventParams: { user: "other" },
      agoMinutes: 1800,
    },
    {
      content: "Volunteer assigned",
      source: "system",
      type: "volunteer_assigned",
      eventParams: { user: "me" },
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
      mergedIn: true,
    },
    {
      content: "Do I need to bring anything besides the letter?",
      source: "client",
      type: "sms_inbound",
      agoMinutes: 1695,
      mergedIn: true,
    },
    {
      content: "Sorry, I think I texted you from my work phone earlier",
      source: "client",
      type: "sms_inbound",
      agoMinutes: 1610,
      mergedIn: true,
    },
    {
      content: "",
      source: "system",
      type: "merge_note",
      agoMinutes: 1600,
      mergedIn: true,
    },
    {
      content:
        "No problem at all, I pulled those messages into this conversation. The letter and your ID are all you need",
      source: "volunteer",
      agoMinutes: 1595,
      mergedIn: true,
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
      reactions: [{ reaction: "acknowledge", agoMinutes: 280, by: "other" }],
    },
    {
      content: "This is the letter they gave me at the desk",
      source: "client",
      agoMinutes: 240,
      media: [{ kind: "image", contentType: "image/jpeg" }],
    },
    {
      content: "That is the referral confirmation, you are all set for tonight",
      source: "volunteer",
      agoMinutes: 235,
    },
    // email_inbound: client replied by email instead of SMS (seeds the
    // bubble renderer and caution affordance for dev and e2e).
    {
      content: JSON.stringify({
        subject: "Re: your appointment",
        text: "Thank you, I have the letter and my ID ready. Do I need anything else for tonight?",
        from: "maria.l@example.org",
        droppedAttachments: 0,
      }),
      source: "client",
      type: "email_inbound",
      agoMinutes: 220,
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
    // email_outbound: volunteer follows up by email with bed
    // confirmation details. Content is JSON.stringify({ subject, doc })
    // where doc is a minimal ProseMirror doc, matching the shape the
    // email compose editor produces.
    {
      content: JSON.stringify({
        subject: "Bed confirmation for tonight",
        doc: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "The east side shelter confirmed a bed for you tonight. Check in is between 6pm and 8pm at the front desk.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Bring the referral letter and your ID. Let me know if you need anything else before then.",
                },
              ],
            },
          ],
        },
      }),
      source: "volunteer",
      type: "email_outbound",
      agoMinutes: 120,
    },
    // email_inbound: client replies by email. droppedAttachments: 1 so
    // the dropped-attachment notice renders in the bubble. The from
    // value matches the seeded email address on this client.
    {
      content: JSON.stringify({
        subject: "Re: Bed confirmation for tonight",
        text: "Got it, I will be there by 7. I tried to attach a photo of the letter but it would not go through.",
        from: "maria.l@example.org",
        droppedAttachments: 1,
      }),
      source: "client",
      type: "email_inbound",
      agoMinutes: 90,
    },
    {
      content: "Checked in a few minutes ago. Thank you for staying on this",
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
};

/** Hex of a valid 64x64 cyan PNG (178 bytes), visible on light and dark. */
const SEED_PNG_HEX =
  // Generated programmatically: 64x64 RGB, solid #00CCBB.
  // CRC32 checksums computed correctly for all chunks.
  "89504e470d0a1a0a0000000d49484452000000400000" +
  "00400802000000250be6890000007949444154789ced" +
  "cf410900300cc0c0fab7340b1355117b1c8340045c66" +
  "eef93b2f68400b1ad08206b4a0012d68400b1ad08206" +
  "b4a0012d68400b1ad08206b4a0012d68400b1ad08206" +
  "b4a0012d68400b1ad08206b4a0012d68400b1ad08206" +
  "b4a0012d68400b1ad08206b4a0012d68400b1ad08206" +
  "b4e0ad050ceb71698b8b2a940000000049454e44ae42" +
  "6082";

/**
 * Synthetic image for seeded attachments. Production uses real uploads and
 * MMS media, but the encryption pipeline is identical.
 */
export function generateSeedPng(): Uint8Array {
  return Uint8Array.from({ length: SEED_PNG_HEX.length / 2 }, (_, i) =>
    Number.parseInt(SEED_PNG_HEX.slice(i * 2, i * 2 + 2), 16),
  );
}

/** Small text file for seeded file attachments. */
export function generateSeedTextFile(): Uint8Array {
  return new TextEncoder().encode(
    "CARE-Y Safety Plan Template\n\n" +
      "1. Warning signs that a crisis may be developing\n" +
      "2. Internal coping strategies\n" +
      "3. People and social settings that provide distraction\n" +
      "4. People I can ask for help\n" +
      "5. Professionals or agencies I can contact during a crisis\n" +
      "6. Making the environment safe\n",
  );
}
