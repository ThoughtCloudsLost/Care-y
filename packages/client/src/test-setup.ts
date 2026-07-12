/**
 * Shared test setup for SvelteKit client tests.
 *
 * Provides reusable vi.mock() definitions for SvelteKit virtual modules
 * that have no on-disk source ($app/environment, @sveltejs/kit/hooks).
 * Wired into vitest.config.ts via test.setupFiles so every test file
 * gets these mocks automatically.
 *
 * Tests import the controllable functions (mockDev, etc.) from this file
 * to override mock behavior per-test via mockReturnValue().
 */

import { vi } from "vitest";

// jsdom does not implement matchMedia. Stub it so components that
// read media queries (e.g., prefers-reduced-motion) don't crash.
if (
  typeof globalThis.window !== "undefined" &&
  typeof window.matchMedia !== "function"
) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener(_cb: unknown) {
        /* deprecated stub */
      },
      removeListener(_cb: unknown) {
        /* deprecated stub */
      },
      addEventListener(_type: string, _cb: unknown) {
        /* stub */
      },
      removeEventListener(_type: string, _cb: unknown) {
        /* stub */
      },
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// ---------------------------------------------------------------------------
// $app/environment
// ---------------------------------------------------------------------------
// Default: dev = false (production mode). Tests that need dev mode call
// mockDev.mockReturnValue(true) in beforeEach or per-test.

export const mockDev = vi.fn((): boolean => false);
export const mockBrowser = vi.fn((): boolean => true);

vi.mock("$app/environment", () => ({
  get dev(): boolean {
    return mockDev();
  },
  get browser(): boolean {
    return mockBrowser();
  },
  building: false,
  version: "test",
}));

// ---------------------------------------------------------------------------
// $lib/terminology/context
// ---------------------------------------------------------------------------
// Svelte 5's createContext requires a live component tree. Component tests
// render in jsdom without a parent that calls setTerminology(), so the
// context lookup throws "missing_context". This mock provides the default
// English labels without requiring a Svelte context.

// vi.mock required: createContext from Svelte 5 throws "missing_context"
// outside a live component tree. Tests render components in jsdom without
// a parent that calls setTerminology().
vi.mock("$lib/terminology/context", () => {
  const defaults = {
    volunteer: "volunteer",
    volunteers: "volunteers",
    client: "client",
    clients: "clients",
    ticket: "ticket",
    tickets: "tickets",
    manager: "coordinator",
    managers: "coordinators",
    queue: "queue",
    queues: "queues",
    knowledgeBase: "knowledge base",
  };
  const resolver = () => defaults;
  return {
    getTerminology: () => resolver,
    // eslint-disable-next-line @typescript-eslint/no-empty-function -- test mock stub
    setTerminology: () => {},
  };
});

// ---------------------------------------------------------------------------
// $lib/crypto/context
// ---------------------------------------------------------------------------
// vi.mock required: createContext from Svelte 5 throws "missing_context"
// outside a live component tree. Crypto contexts are set by CryptoProvider
// in the (app) layout, but component tests don't mount the full layout.
// Stubs return no-op functions so components can import without crashing.
vi.mock("$lib/crypto/context", () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- test mock stub
  const noop = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- test mock stub
  const noopAsync = async () => {};
  const emptySet = new Set();
  return {
    getCryptoBridge: () => ({
      encrypt: noopAsync,
      decrypt: noopAsync,
      deriveTicketKey: noopAsync,
    }),
    getOrgKeyManager: () => ({
      unwrapOrgKey: noopAsync,
      isReady: () => false,
    }),
    getOrgDecryptCache: () => ({
      decrypt: () => null,
      set: noop,
    }),
    getTicketDecryptCache: () => ({
      decrypt: () => null,
      set: noop,
    }),
    getFollowUpDecryptCache: () => ({
      decrypt: () => null,
      set: noop,
    }),
    getPreviewLoader: () => ({
      load: noopAsync,
    }),
    getCurrentUserId: () => () => undefined,
    getCurrentUserRoleId: () => () => undefined,
    getCurrentPermissions: () => () => emptySet,
    setCryptoBridge: noop,
    setOrgKeyManager: noop,
    setOrgDecryptCache: noop,
    setTicketDecryptCache: noop,
    setFollowUpDecryptCache: noop,
    setPreviewLoader: noop,
    setCurrentUserId: noop,
    setCurrentUserRoleId: noop,
    setCurrentPermissions: noop,
  };
});

// ---------------------------------------------------------------------------
// $lib/crypto/org-key-ready.svelte
// ---------------------------------------------------------------------------
// vi.mock required: uses $state rune which needs Svelte compiler pipeline.
vi.mock("$lib/crypto/org-key-ready.svelte", () => ({
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- test mock stub
  setOrgKeyReady: () => {},
  getOrgKeyReady: () => false,
}));

// ---------------------------------------------------------------------------
// $lib/crypto/crypto-keyed.svelte
// ---------------------------------------------------------------------------
// vi.mock required: uses $state rune which needs Svelte compiler pipeline.
vi.mock("$lib/crypto/crypto-keyed.svelte", () => ({
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- test mock stub
  setCryptoKeyed: () => {},
  isCryptoKeyed: () => true,
}));

// ---------------------------------------------------------------------------
// @sveltejs/kit/hooks
// ---------------------------------------------------------------------------
// The real sequence() accesses an internal AsyncLocalStorage request store
// that only exists during SvelteKit request handling. Outside that context
// it throws "Could not get the request store".
//
// This reimplementation chains handles the same way: each handler's resolve
// calls the next handler in the sequence, with the last handler receiving
// the original resolve. Behaviorally identical for unit testing purposes.

// ---------------------------------------------------------------------------
// $service-worker
// ---------------------------------------------------------------------------
// SvelteKit virtual module that provides build manifest, static file list,
// and cache version string. Mocked with minimal plausible values so
// service-worker.ts can construct its KNOWN_ASSETS set.

export const mockServiceWorkerAssets = {
  build: ["/immutable/app.js", "/immutable/start.js"],
  files: ["/favicon.ico", "/robots.txt"],
  version: "test-v1",
};

vi.mock("$service-worker", () => ({
  build: mockServiceWorkerAssets.build,
  files: mockServiceWorkerAssets.files,
  version: mockServiceWorkerAssets.version,
}));

// ---------------------------------------------------------------------------
// @sveltejs/kit/hooks
// ---------------------------------------------------------------------------

vi.mock("@sveltejs/kit/hooks", () => ({
  sequence:
    (
      ...handlers: Array<
        (input: { event: unknown; resolve: unknown }) => Promise<unknown>
      >
    ) =>
    (input: { event: unknown; resolve: unknown }): Promise<unknown> => {
      let chain = input.resolve as (event: unknown) => Promise<unknown>;
      for (let i = handlers.length - 1; i >= 0; i--) {
        const handler = handlers[i]!;
        const next = chain;
        chain = (event: unknown) =>
          handler({ event, resolve: next }) as Promise<unknown>;
      }
      return chain(input.event);
    },
}));
