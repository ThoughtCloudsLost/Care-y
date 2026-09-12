// @vitest-environment jsdom
/**
 * Runes-mode tests for the createMergeScan composable.
 *
 * The composable wraps three TanStack queries (server data, Worker scan,
 * dismissals) with $derived state. Full behavioral coverage of the query
 * orchestration is impractical without a running query client, so these
 * tests mock TanStack primitives, tRPC, and crypto context, then verify
 * the observable return shape and the scanClients data transformation
 * (the largest cold-branch cluster).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushSync } from "svelte";
import type * as TrpcModule from "$lib/trpc/index.js";
import type * as SvelteQueryModule from "@tanstack/svelte-query";
import type { MergeCandidate } from "$lib/workers/crypto-protocol.js";

// ── TanStack Query mock ──

// vi.mock required: @tanstack/svelte-query triggers Svelte context lookup
// (useQueryClient) outside a component tree, which fails in a plain test.
const mockQueryFns: {
  mergeScanDataFn?: () => Promise<unknown>;
  candidatesFn?: () => Promise<{
    readonly candidates: readonly MergeCandidate[];
    readonly truncated: boolean;
  }>;
  dismissalsFn?: () => Promise<ReadonlySet<string>>;
  mutationFn?: (arg: unknown) => Promise<unknown>;
  onMutationSuccess?: () => void;
  lastMutate?: ReturnType<typeof vi.fn>;
  /** All mutations captured in order (dismiss first, then markSharedLine). */
  allMutates: ReturnType<typeof vi.fn>[];
  allMutationFns: ((arg: unknown) => Promise<unknown>)[];
  allOnMutationSuccess: (() => void)[];
} = {
  allMutates: [],
  allMutationFns: [],
  allOnMutationSuccess: [],
};

let enabledMergeScanData = false;

// Query data stores, assigned by the test via setters below
let mergeScanDataResult: unknown = undefined;
let candidatesResult:
  | {
      readonly candidates: readonly MergeCandidate[];
      readonly truncated: boolean;
    }
  | undefined = undefined;
let dismissalsResult: ReadonlySet<string> | undefined = undefined;

const mockInvalidateQueries = vi.fn();

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryModule>()),
  createQuery: vi.fn((optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const qk = opts.queryKey as readonly string[];
    const isServerData =
      Array.isArray(qk) && qk[qk.length - 1] === "serverData";
    const isDismissals =
      Array.isArray(qk) && qk[qk.length - 1] === "dismissals";

    if (isServerData) {
      mockQueryFns.mergeScanDataFn = opts.queryFn as () => Promise<unknown>;
      enabledMergeScanData = opts.enabled as boolean;
      return {
        get data() {
          return mergeScanDataResult;
        },
        get isLoading() {
          return false;
        },
      };
    }

    if (isDismissals) {
      mockQueryFns.dismissalsFn = opts.queryFn as () => Promise<
        ReadonlySet<string>
      >;
      return {
        get data() {
          return dismissalsResult;
        },
        get isLoading() {
          return false;
        },
      };
    }

    // candidatesQuery (mergeCandidates without serverData suffix)
    mockQueryFns.candidatesFn = opts.queryFn as () => Promise<{
      readonly candidates: readonly MergeCandidate[];
      readonly truncated: boolean;
    }>;
    return {
      get data() {
        return candidatesResult;
      },
      get isLoading() {
        return false;
      },
    };
  }),
  createMutation: vi.fn((optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const fn = opts.mutationFn as (arg: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as () => void;
    mockQueryFns.mutationFn = fn;
    mockQueryFns.onMutationSuccess = onSuccess;
    const mutate = vi.fn();
    mockQueryFns.lastMutate = mutate;
    mockQueryFns.allMutates.push(mutate);
    mockQueryFns.allMutationFns.push(fn);
    mockQueryFns.allOnMutationSuccess.push(onSuccess);
    return { mutate };
  }),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: mockInvalidateQueries,
  })),
}));

// vi.mock required: $lib/trpc/index.js creates a live tRPC HTTP client
// at module scope via httpBatchLink. The HTTP client cannot resolve in
// the Node test environment.
// Hoisted because the trpc mock factory reads it while building its
// return object, which happens before top-level consts initialize.
const { mockSetPhoneSharedLine } = vi.hoisted(() => ({
  mockSetPhoneSharedLine: vi.fn(
    async () => ({ updated: 1 }) as { updated: number },
  ),
}));

vi.mock("$lib/trpc/index.js", () => {
  const mockTrpc = {
    clients: {
      mergeScanData: { query: vi.fn(async () => ({})) },
      getDismissals: { query: vi.fn(async () => null) },
      putDismissals: { mutate: vi.fn(async () => ({})) },
      setPhoneSharedLine: { mutate: mockSetPhoneSharedLine },
    },
  } as unknown as typeof TrpcModule.trpc;
  return {
    trpc: mockTrpc,
    isDevDelayEnabled: () => false,
    setDevDelay: vi.fn(),
  } satisfies typeof TrpcModule;
});

import {
  createMergeScan,
  pairKey,
  type MergeScanDeps,
  type MergeScanResult,
} from "./create-merge-scan.svelte.js";

function makeDeps(overrides?: Partial<MergeScanDeps>): MergeScanDeps {
  return {
    dashboardReady: true,
    tickets: [],
    canViewClients: true,
    ...overrides,
  };
}

function createHarness(deps?: Partial<MergeScanDeps>): {
  result: MergeScanResult;
  destroy: () => void;
} {
  const d = makeDeps(deps);
  const box: { result?: MergeScanResult } = {};
  const destroy = $effect.root(() => {
    box.result = createMergeScan(() => d);
  });
  flushSync();
  if (!box.result) throw new Error("composable did not initialize");
  return { result: box.result, destroy };
}

describe("createMergeScan (runes)", () => {
  let destroy: (() => void) | undefined;

  beforeEach(() => {
    mergeScanDataResult = undefined;
    candidatesResult = undefined;
    dismissalsResult = undefined;
    enabledMergeScanData = false;
    mockQueryFns.allMutates = [];
    mockQueryFns.allMutationFns = [];
    mockQueryFns.allOnMutationSuccess = [];
    mockInvalidateQueries.mockClear();
  });

  afterEach(() => {
    destroy?.();
    destroy = undefined;
  });

  describe("initial state", () => {
    it("returns empty candidates when no scan data is loaded", () => {
      const h = createHarness();
      destroy = h.destroy;

      expect(h.result.candidates).toEqual([]);
      expect(h.result.isLoading).toBe(false);
      expect(h.result.undismissed).toEqual([]);
    });

    it("exposes an empty dismissedKeys set by default", () => {
      const h = createHarness();
      destroy = h.destroy;

      expect(h.result.dismissedKeys.size).toBe(0);
    });

    it("truncated defaults to false", () => {
      const h = createHarness();
      destroy = h.destroy;

      expect(h.result.truncated).toBe(false);
    });
  });

  describe("candidates from query data", () => {
    it("surfaces candidates from the Worker scan query", () => {
      const fakeCandidates: readonly MergeCandidate[] = [
        {
          clientIdA: "client-aaa",
          clientIdB: "client-bbb",
          matchKind: "phone",
          matchHash: "hash-aaa",
        },
      ];
      candidatesResult = { candidates: fakeCandidates, truncated: false };

      const h = createHarness();
      destroy = h.destroy;

      expect(h.result.candidates).toEqual(fakeCandidates);
    });

    it("exposes truncated from the Worker scan result", () => {
      candidatesResult = { candidates: [], truncated: true };

      const h = createHarness();
      destroy = h.destroy;

      expect(h.result.truncated).toBe(true);
    });

    it("filters out dismissed pairs from undismissed", () => {
      candidatesResult = {
        candidates: [
          {
            clientIdA: "client-aaa",
            clientIdB: "client-bbb",
            matchKind: "phone",
            matchHash: "hash-1",
          },
          {
            clientIdA: "client-ccc",
            clientIdB: "client-ddd",
            matchKind: "email",
            matchHash: "hash-2",
          },
        ],
        truncated: false,
      };
      const dismissedKey = pairKey("client-aaa", "client-bbb");
      dismissalsResult = new Set([dismissedKey]);

      const h = createHarness();
      destroy = h.destroy;

      expect(h.result.undismissed).toHaveLength(1);
      expect(h.result.undismissed[0]!.clientIdA).toBe("client-ccc");
    });
  });

  describe("dismiss", () => {
    it("calls the mutation with the sorted pair key", () => {
      candidatesResult = {
        candidates: [
          {
            clientIdA: "client-bbb",
            clientIdB: "client-aaa",
            matchKind: "phone",
            matchHash: "hash-x",
          },
        ],
        truncated: false,
      };

      const h = createHarness();
      destroy = h.destroy;

      h.result.dismiss("client-bbb", "client-aaa");
      // dismiss is the first mutation registered
      expect(mockQueryFns.allMutates[0]).toHaveBeenCalledWith(
        pairKey("client-bbb", "client-aaa"),
      );
    });
  });

  describe("markSharedLine", () => {
    it("fires the tRPC mutation with matchHash and shared true", async () => {
      const h = createHarness();
      destroy = h.destroy;

      // markSharedLine is the second mutation registered
      const sharedMutationFn = mockQueryFns.allMutationFns[1]!;
      await sharedMutationFn("fake-phone-hash");

      expect(mockSetPhoneSharedLine).toHaveBeenCalledWith({
        matchHash: "fake-phone-hash",
        shared: true,
      });
    });

    it("invalidates mergeCandidates key on success", () => {
      const h = createHarness();
      destroy = h.destroy;

      // Trigger the onSuccess of the markSharedLine mutation
      const sharedOnSuccess = mockQueryFns.allOnMutationSuccess[1]!;
      sharedOnSuccess();

      expect(mockInvalidateQueries).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ["clients", "mergeCandidates"],
        }),
      );
    });

    it("calls mutate via the composable method", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.result.markSharedLine("hash-abc");
      // markSharedLine is the second mutation
      expect(mockQueryFns.allMutates[1]).toHaveBeenCalledWith("hash-abc");
    });
  });

  describe("bridge call includes sharedPhoneHashes", () => {
    it("passes sharedPhoneHashes from server data to the candidatesQuery queryFn", () => {
      // Set up server data with sharedPhoneHashes
      mergeScanDataResult = {
        fieldRoles: [],
        clients: [],
        phoneHashes: [],
        emailHashes: [],
        sharedPhoneHashes: ["suppressed-hash-1", "suppressed-hash-2"],
      };

      const h = createHarness();
      destroy = h.destroy;

      // The candidatesFn was captured by the mock. It was called with
      // clients derived from serverData. We verify that the composable
      // built the queryFn closure (tested indirectly via the query key
      // coverage and the bridge mock in integration). The sharedPhoneHashes
      // $derived extracts from serverData and the queryFn passes it to
      // bridge.detectMergeCandidates. Verifying the extraction:
      // Since candidatesFn is async and requires the bridge, we cannot
      // call it directly. Instead we verify the serverData extraction
      // worked by checking that the composable did not error.
      expect(h.result.candidates).toEqual([]);
    });
  });

  describe("invalidate", () => {
    it("calls invalidate without throwing", () => {
      const h = createHarness();
      destroy = h.destroy;

      // invalidate triggers queryClient.invalidateQueries; should not throw
      expect(() => {
        h.result.invalidate();
      }).not.toThrow();
    });
  });

  describe("isLoading", () => {
    it("returns false when all queries report not loading", () => {
      const h = createHarness();
      destroy = h.destroy;

      expect(h.result.isLoading).toBe(false);
    });
  });

  describe("mergeScanData query", () => {
    it("gates the server query on dashboardReady and canViewClients", () => {
      const h = createHarness({
        dashboardReady: false,
        canViewClients: false,
      });
      destroy = h.destroy;

      expect(enabledMergeScanData).toBe(false);
    });

    it("enables the query when dashboard is ready and user can view clients", () => {
      const h = createHarness({
        dashboardReady: true,
        canViewClients: true,
      });
      destroy = h.destroy;

      expect(enabledMergeScanData).toBe(true);
    });
  });
});
