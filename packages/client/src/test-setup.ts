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
