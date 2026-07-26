/**
 * Demo ticket fixtures and mappers.
 *
 * All content is 100% fictional with 555 phone numbers and
 * obviously fake aliases. Prose is copied from the dev seed
 * data to stay realistic for a support-line context.
 */

import type { DemoTicket, DemoFollowUp } from "./types.js";
import type {
  DataCardProps,
  TicketLikeRecord,
} from "$lib/tickets/ticket-card-props.js";
import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";
import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
import type { DisplayStatus } from "$lib/tickets/display-status.js";

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

const DEMO_USER_ID = "demo-user-001";

/** Fake ciphertext: a filler string of exactly plaintext.length + 40. */
function fakeCipher(plaintext: string): string {
  const target = plaintext.length + 40;
  // Repeat a non-printable-looking character to fill
  return "x".repeat(target);
}

function minutesAgo(m: number): Date {
  return new Date(Date.now() - m * 60_000);
}

function deriveDisplayStatus(
  status: "open" | "closed",
  onHold: boolean,
  followUpCount: number,
): DisplayStatus {
  if (onHold) return "hold";
  if (status === "closed") return "closed";
  return followUpCount === 0 ? "new" : "active";
}

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${String(idCounter).padStart(4, "0")}`;
}

function buildFollowUp(
  ticketId: string,
  partial: {
    source: "client" | "volunteer" | "system";
    type?: DemoFollowUp["type"];
    content: string;
    isPrivate?: boolean;
    agoMinutes: number;
    eventParams?: Record<string, unknown>;
    hasRecording?: boolean;
    hasImage?: boolean;
    hasFile?: boolean;
  },
): DemoFollowUp {
  const id = nextId("fu");
  return {
    id,
    ticketId,
    source: partial.source,
    type: partial.type ?? "message",
    isPrivate: partial.isPrivate ?? false,
    content: partial.content,
    encryptedContent:
      partial.source === "system" ? "" : fakeCipher(partial.content),
    eventParams: partial.eventParams ?? null,
    createdAt: minutesAgo(partial.agoMinutes),
    hasRecording: partial.hasRecording ?? false,
    hasImage: partial.hasImage ?? false,
    hasFile: partial.hasFile ?? false,
    noteTypeId: null,
  };
}

function buildTicket(def: {
  title: string;
  description: string;
  queueId: string;
  queueName: string;
  priority: DemoTicket["priority"];
  assignedTo: string | null;
  assignedDisplayName: string | null;
  onHold: boolean;
  keyWrap: string | null;
  status: "open" | "closed";
  clientAlias: string;
  createdAgo: number;
  lastActivityAgo: number | null;
  followUpDefs: Parameters<typeof buildFollowUp>[1][];
}): DemoTicket {
  const id = nextId("tk");
  const followUps = def.followUpDefs.map((f) => buildFollowUp(id, f));
  return {
    id,
    queueId: def.queueId,
    queueName: def.queueName,
    status: def.status,
    onHold: def.onHold,
    priority: def.priority,
    clientAlias: def.clientAlias,
    assignedTo: def.assignedTo,
    assignedDisplayName: def.assignedDisplayName,
    title: def.title,
    encryptedTitle: fakeCipher(def.title),
    description: def.description,
    encryptedDescription: fakeCipher(def.description),
    keyWrap: def.keyWrap,
    createdAt: minutesAgo(def.createdAgo),
    lastActivityAt:
      def.lastActivityAgo !== null ? minutesAgo(def.lastActivityAgo) : null,
    followUpCount: followUps.length,
    displayStatus: deriveDisplayStatus(
      def.status,
      def.onHold,
      followUps.length,
    ),
    followUps,
  };
}

// -----------------------------------------------------------------------
// Fixture tickets
// -----------------------------------------------------------------------

/** Reset the ID counter so fixtures get deterministic IDs across calls. */
export function resetFixtureIds(): void {
  idCounter = 0;
}

export function createDemoTickets(): DemoTicket[] {
  resetFixtureIds();

  return [
    // 0: Housing referral (assigned, active, has conversation)
    buildTicket({
      title: "Help with housing",
      description: "Client needs housing referral and support",
      queueId: "q-housing",
      queueName: "Housing",
      priority: "normal",
      assignedTo: DEMO_USER_ID,
      assignedDisplayName: "You",
      onHold: false,
      keyWrap: "demo-keywrap",
      status: "open",
      clientAlias: "Sparrow-7",
      createdAgo: 4320,
      lastActivityAgo: 360,
      followUpDefs: [
        {
          source: "system",
          type: "volunteer_assigned",
          content: "Assigned to Demo Volunteer",
          agoMinutes: 4310,
          eventParams: { userId: DEMO_USER_ID },
        },
        {
          source: "client",
          content: "I need help finding a place to stay",
          agoMinutes: 4300,
        },
        {
          source: "volunteer",
          content: "I can look into shelters in your area",
          agoMinutes: 4200,
        },
        {
          source: "volunteer",
          type: "internal_note",
          content:
            "Client sounds stressed but stable. Shelter list sent via SMS.",
          isPrivate: true,
          agoMinutes: 4190,
        },
        {
          source: "client",
          content: "Thank you, any help is appreciated",
          agoMinutes: 1440,
        },
        {
          source: "system",
          type: "priority_changed",
          content: "Priority changed to high",
          agoMinutes: 1430,
          eventParams: { to: "high" },
        },
        {
          source: "system",
          type: "status_closed",
          content: "Status changed to closed",
          agoMinutes: 720,
        },
        {
          source: "system",
          type: "status_opened",
          content: "Status changed to open",
          agoMinutes: 360,
        },
      ],
    }),

    // 1: Legal aid follow-up (assigned, active)
    buildTicket({
      title: "Follow-up on legal aid referral",
      description: "Client was referred to legal aid last week",
      queueId: "q-intake",
      queueName: "Intake",
      priority: "normal",
      assignedTo: DEMO_USER_ID,
      assignedDisplayName: "You",
      onHold: false,
      keyWrap: "demo-keywrap",
      status: "open",
      clientAlias: "Birch-12",
      createdAgo: 10080,
      lastActivityAgo: 1440,
      followUpDefs: [
        {
          source: "volunteer",
          content: "Referred to legal aid org",
          agoMinutes: 10000,
        },
        {
          source: "client",
          content: "They said they would call me back",
          agoMinutes: 8640,
        },
        {
          source: "client",
          content: "",
          agoMinutes: 7200,
          hasRecording: true,
        },
        {
          source: "volunteer",
          content: "Still waiting, called again",
          agoMinutes: 5760,
        },
        {
          source: "client",
          content: "They finally reached out, thank you",
          agoMinutes: 2880,
        },
        {
          source: "volunteer",
          content: "Checking in, did the meeting happen?",
          agoMinutes: 1440,
        },
      ],
    }),

    // 2: Safety planning (assigned, high priority, crisis)
    buildTicket({
      title: "Safety planning session",
      description: "Client requested safety planning support",
      queueId: "q-crisis",
      queueName: "Crisis",
      priority: "high",
      assignedTo: DEMO_USER_ID,
      assignedDisplayName: "You",
      onHold: false,
      keyWrap: "demo-keywrap",
      status: "open",
      clientAlias: "Cedar-3",
      createdAgo: 180,
      lastActivityAgo: 155,
      followUpDefs: [
        {
          source: "system",
          type: "volunteer_assigned",
          content: "Assigned to Demo Volunteer",
          agoMinutes: 175,
          eventParams: { userId: DEMO_USER_ID },
        },
        {
          source: "client",
          content: "I need to talk about my situation",
          agoMinutes: 170,
        },
        {
          source: "client",
          content: "",
          agoMinutes: 165,
          hasRecording: true,
        },
        {
          source: "volunteer",
          content: "I am here for you. Can you tell me more?",
          agoMinutes: 160,
        },
        {
          source: "volunteer",
          type: "internal_note",
          content: "High-risk situation. Follow up within 24h per protocol.",
          isPrivate: true,
          agoMinutes: 155,
        },
      ],
    }),

    // 3: Benefits help (assigned, low priority)
    buildTicket({
      title: "Benefits application help",
      description: "Assistance with benefits paperwork",
      queueId: "q-intake",
      queueName: "Intake",
      priority: "low",
      assignedTo: DEMO_USER_ID,
      assignedDisplayName: "You",
      onHold: false,
      keyWrap: "demo-keywrap",
      status: "open",
      clientAlias: "Fern-21",
      createdAgo: 20160,
      lastActivityAgo: 20100,
      followUpDefs: [
        {
          source: "client",
          content: "Need help filling out forms",
          agoMinutes: 20100,
        },
      ],
    }),

    // 4: NO KEY WRAP (DENIED state)
    buildTicket({
      title: "Encrypted intake note",
      description: "Intake note from phone call, key wrap pending",
      queueId: "q-intake",
      queueName: "Intake",
      priority: "normal",
      assignedTo: DEMO_USER_ID,
      assignedDisplayName: "You",
      onHold: false,
      keyWrap: null,
      status: "open",
      clientAlias: "Oak-9",
      createdAgo: 60,
      lastActivityAgo: null,
      followUpDefs: [],
    }),

    // 5: On hold (waiting for shelter callback)
    buildTicket({
      title: "Waiting for callback from shelter",
      description: "Client requested callback when shelter has a bed",
      queueId: "q-housing",
      queueName: "Housing",
      priority: "normal",
      assignedTo: DEMO_USER_ID,
      assignedDisplayName: "You",
      onHold: true,
      keyWrap: "demo-keywrap",
      status: "open",
      clientAlias: "Maple-15",
      createdAgo: 7200,
      lastActivityAgo: 2000,
      followUpDefs: [
        {
          source: "system",
          type: "volunteer_assigned",
          content: "Assigned to Demo Volunteer",
          agoMinutes: 7100,
          eventParams: { userId: DEMO_USER_ID },
        },
        {
          source: "volunteer",
          content: "Shelter said they will call when a bed opens",
          agoMinutes: 5760,
        },
        {
          source: "system",
          type: "hold_placed",
          content: "Put on hold",
          agoMinutes: 5750,
        },
        {
          source: "client",
          content: "Still no word from them",
          agoMinutes: 2880,
        },
        {
          source: "volunteer",
          type: "internal_note",
          content: "Called shelter again, they have a long waitlist.",
          isPrivate: true,
          agoMinutes: 2000,
        },
      ],
    }),

    // 6: Emergency referral (unassigned, urgent)
    buildTicket({
      title: "Emergency referral needed",
      description: "Urgent case flagged by intake volunteer",
      queueId: "q-crisis",
      queueName: "Crisis",
      priority: "urgent",
      assignedTo: null,
      assignedDisplayName: null,
      onHold: false,
      keyWrap: "demo-keywrap",
      status: "open",
      clientAlias: "River-4",
      createdAgo: 45,
      lastActivityAgo: 40,
      followUpDefs: [
        {
          source: "client",
          content: "Please help, I am in danger",
          agoMinutes: 40,
        },
      ],
    }),

    // 7: New intake call (unassigned, no follow-ups)
    buildTicket({
      title: "New intake call",
      description: "Voicemail received, needs triage",
      queueId: "q-intake",
      queueName: "Intake",
      priority: "normal",
      assignedTo: null,
      assignedDisplayName: null,
      onHold: false,
      keyWrap: "demo-keywrap",
      status: "open",
      clientAlias: "Wren-8",
      createdAgo: 120,
      lastActivityAgo: null,
      followUpDefs: [],
    }),

    // 8: Relocation assistance (unassigned, housing)
    buildTicket({
      title: "Relocation assistance request",
      description: "Client needs help with relocation planning",
      queueId: "q-housing",
      queueName: "Housing",
      priority: "high",
      assignedTo: null,
      assignedDisplayName: null,
      onHold: false,
      keyWrap: "demo-keywrap",
      status: "open",
      clientAlias: "Sage-11",
      createdAgo: 360,
      lastActivityAgo: 350,
      followUpDefs: [
        {
          source: "client",
          content: "I need to move but I do not know where to go",
          agoMinutes: 350,
        },
      ],
    }),

    // 9: Food bank referral (unassigned, low)
    buildTicket({
      title: "Food bank referral",
      description: "Client asking about food assistance",
      queueId: "q-intake",
      queueName: "Intake",
      priority: "low",
      assignedTo: null,
      assignedDisplayName: null,
      onHold: false,
      keyWrap: "demo-keywrap",
      status: "open",
      clientAlias: "Lark-19",
      createdAgo: 480,
      lastActivityAgo: 470,
      followUpDefs: [
        {
          source: "client",
          content: "Where can I get groceries?",
          agoMinutes: 470,
        },
      ],
    }),
  ];
}

// -----------------------------------------------------------------------
// Mappers
// -----------------------------------------------------------------------

/**
 * Build a DecryptResult for a demo ticket field.
 * If keyWrap is null, the volunteer has no access (DENIED).
 * Otherwise, check the stub cache via the provided getter:
 * if the cache has a value, the field is "ready"; otherwise "loading".
 */
function resolveDemoDecrypt(
  cacheValue: string | undefined,
  hasAccess: boolean,
): DecryptResult {
  if (!hasAccess) return { status: "denied" };
  if (cacheValue === undefined) return { status: "loading" };
  return { status: "ready", value: cacheValue };
}

/**
 * Map a DemoTicket to a DataCardProps blob for TicketCard rendering.
 *
 * @param ticket - The demo ticket fixture
 * @param titleFromCache - The decrypted title from the stub cache (undefined = loading)
 * @param ontap - Callback when the card is tapped
 */
export function mapToCardProps(
  ticket: DemoTicket,
  titleFromCache: string | undefined,
  ontap: (ticketId: string) => void,
): DataCardProps {
  const hasAccess = ticket.keyWrap !== null;
  return {
    ticketId: ticket.id,
    queueName: ticket.queueName,
    displayStatus: ticket.displayStatus,
    priority: ticket.priority,
    titleResult: resolveDemoDecrypt(titleFromCache, hasAccess),
    clientAlias: ticket.clientAlias,
    assignedName:
      ticket.assignedTo === DEMO_USER_ID ? "You" : ticket.assignedDisplayName,
    createdAt: ticket.createdAt,
    lastActivityAt: ticket.lastActivityAt,
    followUpCount: ticket.followUpCount,
    unreadCount: 0,
    previewFollowUps: undefined,
    ontap,
  };
}

/**
 * Build RawFollowUpPreview arrays for the preview loader stub.
 * Returns the last 3 non-private, non-system follow-ups for a ticket.
 */
export function mapToPreviewFollowUps(
  ticket: DemoTicket,
): RawFollowUpPreview[] {
  const visible = ticket.followUps.filter(
    (fu) => !fu.isPrivate && fu.source !== "system",
  );
  const last3 = visible.slice(-3);
  return last3.map((fu) => ({
    id: fu.id,
    source: fu.source,
    type: fu.type,
    encryptedContent: fu.encryptedContent,
    keyWrap:
      ticket.keyWrap !== null
        ? { ephemeralPoint: "demo", nonce: "demo", wrappedKey: "demo" }
        : null,
    createdAt: fu.createdAt.toISOString(),
    hasRecording: fu.hasRecording,
    hasImage: fu.hasImage,
    hasFile: fu.hasFile,
    noteTypeId: fu.noteTypeId,
    eventParams: fu.eventParams,
  }));
}

/**
 * Build a TicketLikeRecord from a DemoTicket, suitable for
 * mapTicketDisplayFields or any consumer expecting that shape.
 */
export function mapToTicketLikeRecord(ticket: DemoTicket): TicketLikeRecord {
  return {
    id: ticket.id,
    queueId: ticket.queueId,
    encryptedQueueName: ticket.queueName,
    status: ticket.status,
    onHold: ticket.onHold,
    priority: ticket.priority,
    encryptedTitle: ticket.encryptedTitle,
    keyWrap: ticket.keyWrap,
    clientAlias: ticket.clientAlias,
    assignedTo: ticket.assignedTo,
    assignedDisplayName: ticket.assignedDisplayName,
    createdAt: ticket.createdAt.toISOString(),
    lastActivityAt: ticket.lastActivityAt?.toISOString() ?? null,
    followUpCount: ticket.followUpCount,
  };
}

/**
 * Build the seed data object for demoSeed() from a set of tickets.
 * Seeds titles, descriptions, and preview data into the stub caches.
 */
export function buildSeedData(tickets: readonly DemoTicket[]): {
  titles: Record<string, string>;
  descriptions: Record<string, string>;
  followUps: Record<string, string>;
  previews: Record<string, RawFollowUpPreview[]>;
} {
  const titles: Record<string, string> = {};
  const descriptions: Record<string, string> = {};
  const followUps: Record<string, string> = {};
  const previews: Record<string, RawFollowUpPreview[]> = {};

  for (const ticket of tickets) {
    if (ticket.keyWrap !== null) {
      titles[ticket.id] = ticket.title;
      descriptions[`desc:${ticket.id}`] = ticket.description;

      for (const fu of ticket.followUps) {
        if (fu.source !== "system" && fu.content !== "") {
          followUps[`fu:${ticket.id}:${fu.id}`] = fu.content;
        }
      }
    }
    previews[ticket.id] = mapToPreviewFollowUps(ticket);
  }

  return { titles, descriptions, followUps, previews };
}
