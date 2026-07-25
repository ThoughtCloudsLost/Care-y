/**
 * Stub for $lib/trpc/index.js.
 *
 * The real module creates a live tRPC HTTP client at import time.
 * The demo has no server, so this exports an empty object typed
 * to allow optional-chaining (e.g., trpc.tickets?.noteTypes).
 */

// Self-referential node type: dot-drilling and optional chaining
// (`trpc.tickets?.noteTypes`) typecheck without pulling in AppRouter
// or @trpc/client. `unknown` would not work here because property
// access on `unknown` is a type error. At runtime every lookup is
// undefined, so optional-chain guards are always falsy.
interface DemoTrpcNode {
  readonly [key: string]: DemoTrpcNode | undefined;
}

export const trpc: DemoTrpcNode = {};

export function isDevDelayEnabled(): boolean {
  return false;
}

export function setDevDelay(_enabled: boolean): void {
  // No-op in demo context.
}
