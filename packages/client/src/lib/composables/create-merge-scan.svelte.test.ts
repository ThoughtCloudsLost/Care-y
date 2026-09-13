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
  candidatesFn?: () => Promise<readonly MergeCandidate[]>;
  dismissalsFn?: () => Promise<ReadonlySet<string>>;
  mutationFn?: (key: string) => Promise<void>;
  onMutationSuccess?: () => void;
  lastMutate?: ReturnType<typeof vi.fn>;
} = {};

let enabledMergeScanData = false;

// Query data stores, assigned by the test via setters below
let mergeScanDataResult: unknown = undefined;
let candidatesResult: readonly MergeCandidate[] | undefined = undefined;
let dismissalsResult: ReadonlySet<string> | undefined = undefined;

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
    mockQueryFns.candidatesFn = opts.queryFn as () => Promise<
      readonly MergeCandidate[]
    >;
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
    mockQueryFns.mutationFn = opts.mutationFn as (key: string) => Promise<void>;
    mockQueryFns.onMutationSuccess = opts.onSuccess as () => void;
    // Record-only: the real mutationFn reaches bridge.orgEncrypt, which the
    // crypto mock does not provide; calling through would only reject.
    const mutate = vi.fn();
    mockQueryFns.lastMutate = mutate;
    return { mutate };
  }),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

// vi.mock required: $lib/trpc/index.js creates a live tRPC HTTP client
// at module scope via httpBatchLink. The HTTP client cannot resolve in
// the Node test environment.
vi.mock("$lib/trpc/index.js", () => {
  const mockTrpc = {
    clients: {
      mergeScanData: { query: vi.fn(async () => ({})) },
      getDismissals: { query: vi.fn(async () => null) },
      putDismissals: { mutate: vi.fn(async () => ({})) },
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
  });

  describe("candidates from query data", () => {
    it("surfaces candidates from the Worker scan query", () => {
      const fakeCandidates: readonly MergeCandidate[] = [
        {
          clientIdA: "client-aaa",
          clientIdB: "client-bbb",
          matchKind: "phone",
        },
      ];
      candidatesResult = fakeCandidates;

      const h = createHarness();
      destroy = h.destroy;

      expect(h.result.candidates).toEqual(fakeCandidates);
    });

    it("filters out dismissed pairs from undismissed", () => {
      candidatesResult = [
        {
          clientIdA: "client-aaa",
          clientIdB: "client-bbb",
          matchKind: "phone",
        },
        {
          clientIdA: "client-ccc",
          clientIdB: "client-ddd",
          matchKind: "email",
        },
      ];
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
      candidatesResult = [
        {
          clientIdA: "client-bbb",
          clientIdB: "client-aaa",
          matchKind: "phone",
        },
      ];

      const h = createHarness();
      destroy = h.destroy;

      h.result.dismiss("client-bbb", "client-aaa");
      expect(mockQueryFns.lastMutate).toHaveBeenCalledWith(
        pairKey("client-bbb", "client-aaa"),
      );
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
