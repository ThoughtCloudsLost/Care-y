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

import type { RawKBItem } from "$lib/search/providers/kb.js";
import {
  createDemoTickets,
  mapToTicketLikeRecord,
} from "../lib/fixtures/tickets.js";
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
// Record type alias (matches TicketLikeRecord structurally)
// -----------------------------------------------------------------------

type TicketRecord = TicketLikeRecord;

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
          encryptedDisplayName: "demo-encrypted-display-name",
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
          encryptedDisplayName: "demo-encrypted-display-name",
          roleId: "demo-role-001",
        },
        {
          id: "demo-user-002",
          encryptedDisplayName: "demo-encrypted-volunteer-2",
          roleId: "demo-role-002",
        },
        {
          id: "demo-user-003",
          encryptedDisplayName: "demo-encrypted-volunteer-3",
          roleId: "demo-role-002",
        },
      ];
    },
  },
};

const ticketsRouter = {
  myQueues: {
    async query(): Promise<
      readonly {
        id: string;
        encryptedName: unknown;
        openCount: number;
      }[]
    > {
      // Desktop-only sidebar queues. Returns empty in the demo since
      // layoutMode.isDesktop is always false.
      await Promise.resolve();
      return [];
    },
  },
  list: {
    async query(opts?: {
      limit?: number;
      cursor?: string;
    }): Promise<readonly TicketRecord[]> {
      await Promise.resolve();
      const all = tickets.map(mapToTicketLikeRecord);
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
      if (!ticket) {
        throw new DemoStubError(`tickets.get(${opts.ticketId})`);
      }
      return mapToTicketLikeRecord(ticket);
    },
  },
  contentSearch: {
    async query(opts: {
      ticketIds: readonly string[];
      page: number;
      pageSize: number;
      signal?: AbortSignal;
    }): Promise<{
      followups: readonly {
        ticketId: string;
        followupId: string;
        encryptedContent: string;
      }[];
      total: number;
    }> {
      // Simulate staged delay for the escalation demo beat
      await delay(CONTENT_SEARCH_PAGE_DELAY_MS, opts.signal);

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
  // TicketPreview probes `trpc.tickets?.noteTypes` and falls back to
  // undefined when absent. This explicit optional member lets the
  // property-access type-check without providing a real implementation.
  noteTypes: undefined,
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
// Type for the exported trpc object
// -----------------------------------------------------------------------

/**
 * Structural shape for the KB router as consumed by AppShell's search
 * provider registration. The runtime value is undefined (the demo has
 * no KB data), but the type must declare these members so the truthiness
 * guard in AppShell narrows to a usable router shape on the true branch.
 */
interface KbRouterShape {
  readonly listItems: {
    query(opts: { limit: number; cursor: string | undefined }): Promise<{
      items: readonly RawKBItem[];
      nextCursor: string | null;
      total?: number;
    }>;
  };
  readonly listCategories: {
    query(): Promise<readonly { id: string; encryptedName: unknown }[]>;
  };
  readonly listBodies: {
    query(opts: {
      itemIds: string[];
    }): Promise<readonly { id: string; encryptedBody: unknown }[]>;
  };
}

/**
 * Explicit type surface for the demo's trpc mock. Stubbed routers carry
 * their concrete types. Unstubbed routers (kb, volunteers, admin, etc.)
 * are optional members typed with their structural shape so that
 * truthiness guards in AppShell narrow correctly on both branches.
 */
interface DemoTrpc {
  readonly auth: typeof authRouter;
  readonly tickets: typeof ticketsRouter;
  readonly recentViews: typeof recentViewsRouter;
  /** KB router: not stubbed. AppShell guards `const r = trpc.kb; r ? ... : skip`. */
  readonly kb: KbRouterShape | undefined;
  /** Catch-all: any other property resolves to undefined at runtime. */
  readonly [key: string]: unknown;
}

// -----------------------------------------------------------------------
// Exported trpc object
// -----------------------------------------------------------------------

/**
 * Concrete base object with the stubbed routers. Typed exactly so no
 * `as DemoTrpc` cast is needed on the base.
 */
const trpcBase: {
  readonly auth: typeof authRouter;
  readonly tickets: typeof ticketsRouter;
  readonly recentViews: typeof recentViewsRouter;
  readonly kb: undefined;
} = {
  auth: authRouter,
  tickets: ticketsRouter,
  recentViews: recentViewsRouter,
  kb: undefined,
};

/**
 * The demo mock tRPC client. Properties that the demo needs are backed
 * by real mock implementations. Unstubbed sub-trees resolve to
 * `undefined` so that truthiness guards in client components take the
 * skip branch, matching demo expectations (no KB search group, etc.).
 */
export const trpc: DemoTrpc = new Proxy(trpcBase, {
  get(target: typeof trpcBase, prop: string | symbol): unknown {
    if (typeof prop === "symbol") return undefined;
    // Unstubbed routers return undefined (not a proxy), so truthiness
    // guards narrow them out. This matches the explicit kb shape on the
    // type and avoids the catch-all proxy's truthy-object problem.
    const hit = Object.entries(target).find(([key]) => key === prop);
    return hit === undefined ? undefined : hit[1];
  },
});
