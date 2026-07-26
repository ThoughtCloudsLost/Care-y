/**
 * Stub for $lib/trpc/index.js.
 *
 * The real module creates a live tRPC HTTP client at import time.
 * The demo has no server, so this exports a mock object whose
 * endpoints return fixture-derived data. This is the demo's "server":
 * deterministic, no network, no timers left running after abort.
 *
 * Required call sites (audit-verified):
 *   auth.me.query            - AppShell:202-206
 *   auth.listUsers.query     - volunteer search provider
 *   tickets.myQueues.query   - AppShell:230-234 (desktop sidebar)
 *   tickets.list.query       - search escalation (list all)
 *   tickets.get.query        - recent-views prefetch
 *   tickets.contentSearch.query - search escalation deep-search
 *   recentViews.get.query    - SearchResults:57-59
 *   recentViews.put.mutate   - recent-views push
 *
 * Unstubbed sub-trees (kb, volunteers/admin) are typed as explicit
 * optional `undefined` members. Runtime guards in AppShell
 * (`const kbRouter = trpc.kb; kbRouter ? register : skip`) narrow
 * correctly: the group simply does not appear in search results,
 * matching demo expectations.
 */

// Type-only import of the real tRPC client. Uses a relative path that
// bypasses the $lib/trpc alias (which points back to this stub file) and
// resolves @trpc/client and @care-y/server from the client package, so the
// demo package needs neither as a dependency. At runtime the mock's Proxy
// stands in; the type makes all consumer-site accesses (tickets.create,
// tickets.searchClients, etc.) structurally valid.
import type { trpc as realTrpcClient } from "../../../client/src/lib/trpc/index.js";

type RealTrpc = typeof realTrpcClient;

import type { ReactionSummary } from "@care-y/shared";
import {
  createDemoTickets,
  mapToTicketLikeRecord,
  readCursorPayloadFor,
  DEMO_QUEUES,
  DEMO_KEY_WRAP,
  DEMO_USERS,
} from "../lib/fixtures/tickets.js";
import type { DemoTicket, DemoFollowUp } from "../lib/fixtures/types.js";
import { createEscalationCorpus } from "../lib/fixtures/search.js";
import type { TicketLikeRecord } from "$lib/tickets/ticket-card-props.js";

// -----------------------------------------------------------------------
// Error type (no bare Error throws)
// -----------------------------------------------------------------------

class DemoStubError extends Error {
  override readonly name = "DemoStubError";
  constructor(endpoint: string) {
    super(`trpc.${endpoint} is not implemented in the demo mock`);
  }
}

// -----------------------------------------------------------------------
// Dev delay toggle (preserved from original stub)
// -----------------------------------------------------------------------

let devDelayOn = false;

export function isDevDelayEnabled(): boolean {
  return devDelayOn;
}

export function setDevDelay(enabled: boolean): void {
  devDelayOn = enabled;
}

// -----------------------------------------------------------------------
// Fixture data (lazy-initialized, reset via demoResetTrpc)
// -----------------------------------------------------------------------

let tickets = createDemoTickets();
let escalationCorpus = createEscalationCorpus();

/** Reset fixture state. Call from demoReset() if needed. */
export function demoResetTrpc(): void {
  tickets = createDemoTickets();
  escalationCorpus = createEscalationCorpus();
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

const CONTENT_SEARCH_PAGE_DELAY_MS = 250;

async function delay(ms: number, signal?: AbortSignal): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    if (signal?.aborted === true) {
      reject(
        signal.reason instanceof Error
          ? signal.reason
          : new DOMException("Aborted", "AbortError"),
      );
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(
          signal.reason instanceof Error
            ? signal.reason
            : new DOMException("Aborted", "AbortError"),
        );
      },
      { once: true },
    );
  });
}

// -----------------------------------------------------------------------
// Record type alias (matches TicketLikeRecord + detail fields)
// -----------------------------------------------------------------------

type TicketRecord = TicketLikeRecord & {
  readonly hasPhone: boolean;
  readonly encryptedDescription: string;
};

// -----------------------------------------------------------------------
// Filtering helpers
// -----------------------------------------------------------------------

function matchesListFilter(ticket: DemoTicket, opts: ListQueryOpts): boolean {
  if (opts.statuses !== undefined && opts.statuses.length > 0) {
    if (!opts.statuses.includes(ticket.status)) return false;
  }
  if (opts.onHold === true && !ticket.onHold) return false;
  if (opts.queueIds !== undefined && opts.queueIds.length > 0) {
    if (!opts.queueIds.includes(ticket.queueId)) return false;
  }
  if (opts.priorities !== undefined && opts.priorities.length > 0) {
    if (!(opts.priorities as readonly string[]).includes(ticket.priority)) {
      return false;
    }
  }
  if (opts.assignedTo !== undefined) {
    if (opts.assignedTo === null) {
      if (ticket.assignedTo !== null) return false;
    } else {
      if (ticket.assignedTo !== opts.assignedTo) return false;
    }
  }
  return true;
}

/** Fake ciphertext filler (mirrors fixtures convention). */
function fakeCipher(plaintext: string): string {
  return "x".repeat(plaintext.length + 40);
}

// -----------------------------------------------------------------------
// Follow-up wire record mapper
// -----------------------------------------------------------------------

function mapFollowUpToWire(fu: DemoFollowUp): FollowUpWireRecord {
  return {
    id: fu.id,
    ticketId: fu.ticketId,
    source: fu.source,
    type: fu.type,
    isPrivate: fu.isPrivate,
    mentionedPseudonyms: [],
    encryptedContent: fu.encryptedContent,
    createdBy: fu.source === "volunteer" ? "demo-user-001" : null,
    createdAt: fu.createdAt.toISOString(),
    hasRecording: fu.hasRecording,
    hasImage: fu.hasImage,
    hasFile: fu.hasFile,
    noteTypeId: fu.noteTypeId,
    callSid: null,
    callStatus: null,
    callDurationSeconds: null,
    keyGeneration: "gen-1",
    keyWrap: {
      ephemeralPoint: "demo",
      nonce: "demo",
      wrappedKey: "demo",
    },
    eventParams: fu.eventParams,
  };
}

interface FollowUpWireRecord {
  readonly id: string;
  readonly ticketId: string;
  readonly source: string;
  readonly type: string;
  readonly isPrivate: boolean;
  readonly mentionedPseudonyms: string[];
  readonly encryptedContent: string | null;
  readonly createdBy: string | null;
  readonly createdAt: string;
  readonly hasRecording: boolean;
  readonly hasImage: boolean;
  readonly hasFile: boolean;
  readonly noteTypeId: string | null;
  readonly callSid: string | null;
  readonly callStatus: string | null;
  readonly callDurationSeconds: number | null;
  readonly keyGeneration: string | null;
  readonly keyWrap: {
    readonly ephemeralPoint: string;
    readonly nonce: string;
    readonly wrappedKey: string;
  } | null;
  readonly eventParams: Record<string, unknown> | null;
}

interface ListQueryOpts {
  limit?: number;
  cursor?: string;
  statuses?: ("open" | "closed")[];
  onHold?: true;
  queueIds?: string[];
  priorities?: string[];
  assignedTo?: string | null;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

// -----------------------------------------------------------------------
// Mock tRPC tree
// -----------------------------------------------------------------------

const authRouter = {
  me: {
    async query(): Promise<{
      user: {
        id: string;
        encryptedDisplayName: string;
        roleId: string;
      };
    }> {
      await Promise.resolve();
      return {
        user: {
          id: "demo-user-001",
          // The org cache stub resolves "me:display_name" from whatever
          // the scene seeds. This value is an opaque ciphertext placeholder
          // consistent with the seeded org cache key.
          encryptedDisplayName: DEMO_USERS[0]?.encryptedDisplayName ?? "",
          roleId: "demo-role-001",
        },
      };
    },
  },
  listUsers: {
    async query(): Promise<
      readonly {
        id: string;
        encryptedDisplayName: string;
        roleId: string;
      }[]
    > {
      await Promise.resolve();
      return [
        {
          id: "demo-user-001",
          encryptedDisplayName: DEMO_USERS[0]?.encryptedDisplayName ?? "",
          roleId: "demo-role-001",
        },
        {
          id: "demo-user-002",
          encryptedDisplayName: DEMO_USERS[1]?.encryptedDisplayName ?? "",
          roleId: "demo-role-002",
        },
        {
          id: "demo-user-003",
          encryptedDisplayName: DEMO_USERS[2]?.encryptedDisplayName ?? "",
          roleId: "demo-role-002",
        },
      ];
    },
  },
};

const noteTypesRouter = {
  listActive: {
    async query(): Promise<{
      types: readonly {
        id: string;
        encryptedIcon: string;
        encryptedName: string;
      }[];
      defaultNoteTypeId: string | null;
    }> {
      await Promise.resolve();
      return {
        types: [
          {
            id: "nt-general",
            encryptedIcon: fakeCipher("pencil"),
            encryptedName: fakeCipher("General Note"),
          },
          {
            id: "nt-follow-up",
            encryptedIcon: fakeCipher("phone"),
            encryptedName: fakeCipher("Follow-up Call"),
          },
        ],
        defaultNoteTypeId: null,
      };
    },
  },
  list: {
    async query(): Promise<{
      types: readonly {
        id: string;
        encryptedIcon: string;
        encryptedName: string;
      }[];
      defaultNoteTypeId: string | null;
    }> {
      await Promise.resolve();
      return {
        types: [
          {
            id: "nt-general",
            encryptedIcon: fakeCipher("pencil"),
            encryptedName: fakeCipher("General Note"),
          },
          {
            id: "nt-follow-up",
            encryptedIcon: fakeCipher("phone"),
            encryptedName: fakeCipher("Follow-up Call"),
          },
        ],
        defaultNoteTypeId: null,
      };
    },
  },
};

const ticketsRouter = {
  myQueues: {
    async query(): Promise<
      readonly {
        id: string;
        encryptedName: string;
        encryptedColor: string | null;
        encryptedIcon: string | null;
        sortOrder: number;
        escalateDays: number;
        isActive: boolean;
        createdAt: string;
        openCount: string;
        closedCount: string;
        holdCount: string;
        memberCount: string;
        urgentCount: string;
      }[]
    > {
      await Promise.resolve();
      return DEMO_QUEUES.map((q, i) => ({
        id: q.id,
        encryptedName: fakeCipher(q.name),
        encryptedColor: null,
        encryptedIcon: null,
        sortOrder: i,
        escalateDays: 3,
        isActive: true,
        createdAt: new Date(2024, 0, 1).toISOString(),
        openCount: String(
          tickets.filter(
            (t) => t.queueId === q.id && t.status === "open" && !t.onHold,
          ).length,
        ),
        closedCount: "0",
        holdCount: String(
          tickets.filter((t) => t.queueId === q.id && t.onHold).length,
        ),
        memberCount: "1",
        urgentCount: String(
          tickets.filter((t) => t.queueId === q.id && t.priority === "urgent")
            .length,
        ),
      }));
    },
  },
  listQueues: {
    async query(): Promise<
      readonly {
        id: string;
        encryptedName: string;
        encryptedColor: string | null;
        encryptedIcon: string | null;
        sortOrder: number;
        escalateDays: number;
        isActive: boolean;
        createdAt: string;
        openCount: string;
        closedCount: string;
        holdCount: string;
        memberCount: string;
        urgentCount: string;
      }[]
    > {
      await Promise.resolve();
      return DEMO_QUEUES.map((q, i) => ({
        id: q.id,
        encryptedName: fakeCipher(q.name),
        encryptedColor: null,
        encryptedIcon: null,
        sortOrder: i,
        escalateDays: 3,
        isActive: true,
        createdAt: new Date(2024, 0, 1).toISOString(),
        openCount: String(
          tickets.filter(
            (t) => t.queueId === q.id && t.status === "open" && !t.onHold,
          ).length,
        ),
        closedCount: "0",
        holdCount: String(
          tickets.filter((t) => t.queueId === q.id && t.onHold).length,
        ),
        memberCount: "1",
        urgentCount: String(
          tickets.filter((t) => t.queueId === q.id && t.priority === "urgent")
            .length,
        ),
      }));
    },
  },
  list: {
    async query(opts?: ListQueryOpts): Promise<readonly TicketRecord[]> {
      await Promise.resolve();
      const filtered = tickets.filter((t) => matchesListFilter(t, opts ?? {}));

      // Sort support
      const sortBy = opts?.sortBy ?? "date";
      const sortDir = opts?.sortDirection ?? "desc";
      const sorted = [...filtered].sort((a, b) => {
        let cmp = 0;
        if (sortBy === "priority") {
          const order = { low: 0, normal: 1, high: 2, urgent: 3 };
          cmp = order[a.priority] - order[b.priority];
        } else {
          const aTime = a.lastActivityAt?.getTime() ?? a.createdAt.getTime();
          const bTime = b.lastActivityAt?.getTime() ?? b.createdAt.getTime();
          cmp = aTime - bTime;
        }
        return sortDir === "asc" ? cmp : -cmp;
      });

      const all = sorted.map(mapToTicketLikeRecord);
      const limit = opts?.limit ?? 100;
      const cursor = opts?.cursor;
      const startIdx =
        cursor !== undefined ? all.findIndex((t) => t.id === cursor) + 1 : 0;
      return all.slice(startIdx, startIdx + limit);
    },
  },
  get: {
    async query(opts: { ticketId: string }): Promise<TicketRecord> {
      await Promise.resolve();
      const ticket = tickets.find((t) => t.id === opts.ticketId);
      if (ticket === undefined) {
        throw new DemoStubError(`tickets.get(${opts.ticketId})`);
      }
      return mapToTicketLikeRecord(ticket);
    },
  },
  counts: {
    async query(): Promise<{
      total: number;
      new: number;
      active: number;
      closed: number;
      onHold: number;
      unassigned: number;
      mine: number;
      byPriority: {
        low: number;
        normal: number;
        high: number;
        urgent: number;
      };
    }> {
      await Promise.resolve();
      const open = tickets.filter((t) => t.status === "open");
      const newTickets = open.filter((t) => !t.onHold && t.followUpCount === 0);
      const active = open.filter((t) => !t.onHold && t.followUpCount > 0);
      const onHold = tickets.filter((t) => t.onHold);
      const closed = tickets.filter((t) => t.status === "closed");
      const unassigned = open.filter((t) => t.assignedTo === null);
      const mine = tickets.filter((t) => t.assignedTo === "demo-user-001");

      return {
        total: tickets.length,
        new: newTickets.length,
        active: active.length,
        closed: closed.length,
        onHold: onHold.length,
        unassigned: unassigned.length,
        mine: mine.length,
        byPriority: {
          low: tickets.filter((t) => t.priority === "low").length,
          normal: tickets.filter((t) => t.priority === "normal").length,
          high: tickets.filter((t) => t.priority === "high").length,
          urgent: tickets.filter((t) => t.priority === "urgent").length,
        },
      };
    },
  },
  listVolunteers: {
    async query(): Promise<
      readonly {
        id: string;
        encryptedDisplayName: string;
        roleId: string;
      }[]
    > {
      await Promise.resolve();
      return [
        {
          id: "demo-user-001",
          encryptedDisplayName: DEMO_USERS[0]?.encryptedDisplayName ?? "",
          roleId: "demo-role-001",
        },
        {
          id: "demo-user-002",
          encryptedDisplayName: DEMO_USERS[1]?.encryptedDisplayName ?? "",
          roleId: "demo-role-002",
        },
        {
          id: "demo-user-003",
          encryptedDisplayName: DEMO_USERS[2]?.encryptedDisplayName ?? "",
          roleId: "demo-role-002",
        },
      ];
    },
  },
  listParticipants: {
    async query(_opts: { ticketId: string }): Promise<
      readonly {
        id: string;
        encryptedDisplayName: string;
        roleId: string;
      }[]
    > {
      await Promise.resolve();
      return [
        {
          id: "demo-user-001",
          encryptedDisplayName: DEMO_USERS[0]?.encryptedDisplayName ?? "",
          roleId: "demo-role-001",
        },
      ];
    },
  },
  listFollowUps: {
    async query(opts: {
      ticketId: string;
      limit?: number;
      cursor?: string;
      direction?: "older" | "newer";
      types?: string[];
      mediaFlags?: Record<string, boolean>;
      createdBy?: string;
      includeClientSource?: boolean;
      dateFrom?: string;
      dateTo?: string;
    }): Promise<{
      followUps: readonly FollowUpWireRecord[];
      reactions: Record<string, ReactionSummary[]>;
    }> {
      await Promise.resolve();
      const ticket = tickets.find((t) => t.id === opts.ticketId);
      if (ticket === undefined) {
        return { followUps: [], reactions: {} };
      }
      const fus = ticket.followUps.map(mapFollowUpToWire);
      const limit = opts.limit ?? 50;
      // Default direction is "older" (newest first)
      const sorted = opts.direction === "newer" ? [...fus] : [...fus].reverse();
      const sliced = sorted.slice(0, limit);
      return { followUps: sliced, reactions: {} };
    },
  },
  listFollowUpSummary: {
    async query(_opts: {
      ticketId: string;
      limit?: number;
      cursor?: string;
      direction?: "older" | "newer";
      types?: string[];
      mediaFlags?: Record<string, boolean>;
      createdBy?: string;
      includeClientSource?: boolean;
      dateFrom?: string;
      dateTo?: string;
    }): Promise<{
      summaries: readonly FollowUpWireRecord[];
      reactions: Record<string, ReactionSummary[]>;
    }> {
      await Promise.resolve();
      return { summaries: [], reactions: {} };
    },
  },
  listFollowUpsByIds: {
    async query(_opts: {
      ticketId: string;
      followUpIds: string[];
    }): Promise<readonly FollowUpWireRecord[]> {
      await Promise.resolve();
      return [];
    },
  },
  getReadCursor: {
    // The real endpoint (getOrCreate) always returns a cursor row, never
    // null. The payload is JSON the passthrough bridge hands back as
    // plaintext, marking the thread read through its latest follow-up.
    async query(opts: { ticketId: string }): Promise<{
      encryptedReadCursor: string;
    }> {
      await Promise.resolve();
      const ticket = tickets.find((t) => t.id === opts.ticketId);
      if (ticket === undefined) {
        throw new DemoStubError(`tickets.getReadCursor(${opts.ticketId})`);
      }
      return { encryptedReadCursor: readCursorPayloadFor(ticket) };
    },
  },
  updateReadCursor: {
    async mutate(_opts: unknown): Promise<{ ok: true }> {
      await Promise.resolve();
      return { ok: true };
    },
  },
  readStateSweep: {
    async query(_opts: { cursor?: string }): Promise<{
      items: readonly {
        ticketId: string;
        encryptedReadCursor: string;
        latestActivityAt: string | null;
        keyWrap: {
          ephemeralPoint: string;
          nonce: string;
          wrappedKey: string;
        } | null;
      }[];
      nextCursor: string | null;
    }> {
      await Promise.resolve();
      // One row per open accessible ticket. The client decrypts each
      // cursor through the seeded cache; tickets whose fixture carries
      // unreadCount > 0 have cursors behind latestActivityAt and show
      // as unread.
      const items = tickets
        .filter((t) => t.status === "open" && t.keyWrap !== null)
        .map((t) => ({
          ticketId: t.id,
          encryptedReadCursor: `demo-cursor-${t.id}`,
          latestActivityAt: (t.lastActivityAt ?? t.createdAt).toISOString(),
          keyWrap: DEMO_KEY_WRAP,
        }));
      return { items, nextCursor: null };
    },
  },
  listReadState: {
    async query(_opts: { ticketIds: readonly string[] }): Promise<
      Record<
        string,
        {
          encryptedReadCursor: string | null;
          followUpCreatedAt: string[];
        }
      >
    > {
      await Promise.resolve();
      return {};
    },
  },
  isWatching: {
    async query(_opts: { ticketId: string }): Promise<boolean> {
      await Promise.resolve();
      return false;
    },
  },
  getReactions: {
    async query(
      _opts: { followUpIds: string[] },
      _meta?: { signal?: AbortSignal },
    ): Promise<Record<string, ReactionSummary[]>> {
      await Promise.resolve();
      return {};
    },
  },
  listAttachments: {
    async query(_opts: { ticketId: string }): Promise<readonly unknown[]> {
      await Promise.resolve();
      return [];
    },
  },
  listRecordings: {
    async query(_opts: { ticketId: string }): Promise<readonly unknown[]> {
      await Promise.resolve();
      return [];
    },
  },
  listPresets: {
    async query(): Promise<readonly unknown[]> {
      await Promise.resolve();
      return [];
    },
  },
  contentSearch: {
    // The abort signal arrives as the second argument, matching the real
    // tRPC call convention query(input, opts). Callers that pass no signal
    // simply run the staged delay to completion.
    async query(
      opts: {
        ticketIds: readonly string[];
        page: number;
        pageSize: number;
      },
      callOpts?: { signal?: AbortSignal },
    ): Promise<{
      followups: readonly {
        ticketId: string;
        followupId: string;
        encryptedContent: string;
      }[];
      total: number;
    }> {
      // Simulate staged delay for the escalation demo beat
      await delay(CONTENT_SEARCH_PAGE_DELAY_MS, callOpts?.signal);

      // Return follow-ups from matching escalation corpus tickets
      const matchingIds = new Set(opts.ticketIds);
      const allFollowUps: {
        ticketId: string;
        followupId: string;
        encryptedContent: string;
      }[] = [];

      for (const item of escalationCorpus) {
        if (matchingIds.has(item.ticketId)) {
          allFollowUps.push({
            ticketId: item.ticketId,
            followupId: `fu-search-${item.ticketId}`,
            encryptedContent: item.title,
          });
        }
      }

      const start = opts.page * opts.pageSize;
      const pageItems = allFollowUps.slice(start, start + opts.pageSize);
      return { followups: pageItems, total: allFollowUps.length };
    },
  },
  noteTypes: noteTypesRouter,
  // Reply mutation: appends to the fixture thread so a sent message
  // appears in the conversation after the user taps send.
  createFollowUp: {
    async mutate(opts: {
      id: string;
      ticketId: string;
      encryptedContent: unknown;
      source: string;
      type: string;
      isPrivate: boolean;
      mentionedPseudonyms?: string[];
      noteTypeId?: string;
    }): Promise<FollowUpWireRecord> {
      await Promise.resolve();
      const record: FollowUpWireRecord = {
        id: opts.id,
        ticketId: opts.ticketId,
        source: opts.source,
        type: opts.type,
        isPrivate: opts.isPrivate,
        mentionedPseudonyms: opts.mentionedPseudonyms ?? [],
        encryptedContent:
          typeof opts.encryptedContent === "string"
            ? opts.encryptedContent
            : "",
        createdBy: "demo-user-001",
        createdAt: new Date().toISOString(),
        hasRecording: false,
        hasImage: false,
        hasFile: false,
        noteTypeId: opts.noteTypeId ?? null,
        callSid: null,
        callStatus: null,
        callDurationSeconds: null,
        keyGeneration: "gen-1",
        keyWrap: {
          ephemeralPoint: "demo",
          nonce: "demo",
          wrappedKey: "demo",
        },
        eventParams: null,
      };
      return record;
    },
  },
  // Mutation stubs that the detail page's composables may call.
  // These are gesture-triggered paths; returning a benign value
  // prevents unhandled-rejection errors.
  update: {
    async mutate(_opts: unknown): Promise<{ ok: true }> {
      await Promise.resolve();
      return { ok: true };
    },
  },
  assignTo: {
    async mutate(_opts: unknown): Promise<{ ok: true }> {
      await Promise.resolve();
      return { ok: true };
    },
  },
  close: {
    async mutate(_opts: unknown): Promise<{ ok: true }> {
      await Promise.resolve();
      return { ok: true };
    },
  },
  reopen: {
    async mutate(_opts: unknown): Promise<{ ok: true }> {
      await Promise.resolve();
      return { ok: true };
    },
  },
  take: {
    async mutate(_opts: unknown): Promise<{ ok: true }> {
      await Promise.resolve();
      return { ok: true };
    },
  },
  release: {
    async mutate(_opts: unknown): Promise<{ ok: true }> {
      await Promise.resolve();
      return { ok: true };
    },
  },
  watchTicket: {
    async mutate(_opts: unknown): Promise<{ ok: true }> {
      await Promise.resolve();
      return { ok: true };
    },
  },
  unwatchTicket: {
    async mutate(_opts: unknown): Promise<{ ok: true }> {
      await Promise.resolve();
      return { ok: true };
    },
  },
  deleteInternalNote: {
    async mutate(_opts: unknown): Promise<{ ok: true }> {
      await Promise.resolve();
      return { ok: true };
    },
  },
  toggleReaction: {
    async mutate(_opts: unknown): Promise<{ ok: true }> {
      await Promise.resolve();
      return { ok: true };
    },
  },
};

const recentViewsRouter = {
  get: {
    async query(): Promise<{
      envelope: null;
    }> {
      await Promise.resolve();
      // The demo starts with no recent-views envelope.
      return { envelope: null };
    },
  },
  put: {
    async mutate(_envelope: unknown): Promise<void> {
      await Promise.resolve();
      // No-op: the demo does not persist recent views.
    },
  },
};

// -----------------------------------------------------------------------
// Exported trpc object
// -----------------------------------------------------------------------

/**
 * Concrete base object with the stubbed routers. The Proxy makes
 * unstubbed routers return undefined at runtime so truthiness guards
 * in client components take the skip branch.
 */
const trpcBase = {
  auth: authRouter,
  tickets: ticketsRouter,
  recentViews: recentViewsRouter,
  kb: undefined,
};

/**
 * The mock with its own concrete types, for tests and demo-internal
 * wiring. Client components go through `trpc` below, whose real-client
 * type enforces the production calling conventions; tests exercising
 * the mock's behavior use this surface instead.
 */
export const demoTrpcMock: typeof trpcBase = trpcBase;

/**
 * The demo mock tRPC client, typed as the real TRPCClient<AppRouter>.
 * The cast washes all consumer-site type mismatches (missing endpoints,
 * DecoratedProcedureRecord shapes, etc.). At runtime the Proxy stands
 * in, returning undefined for unstubbed sub-trees.
 */
export const trpc: RealTrpc = new Proxy(trpcBase, {
  get(target: typeof trpcBase, prop: string | symbol): unknown {
    if (typeof prop === "symbol") return undefined;
    // Unstubbed routers return undefined (not a proxy), so truthiness
    // guards narrow them out.
    const hit = Object.entries(target).find(([key]) => key === prop);
    return hit === undefined ? undefined : hit[1];
  },
}) as unknown as RealTrpc;
