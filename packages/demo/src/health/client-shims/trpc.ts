/**
 * Health tRPC shim: aliases over $lib/trpc so route components
 * talk to the in-browser PGlite engine instead of the demo mock.
 *
 * Exports the same surface as packages/client/src/lib/trpc/index.ts:
 *   - trpc (the client object)
 *   - setDevDelay / isDevDelayEnabled (delay toggle)
 *
 * The trpc export is a lazy proxy: accessing any property before
 * setHealthTrpc() is called throws a clear error. main.ts calls
 * setHealthTrpc(engine.trpc) after bootHealthEngine resolves.
 */

// Type-only import of the real client type via relative path that
// bypasses the $lib alias (same trick as packages/demo/src/stubs/trpc.ts).
import type { trpc as realTrpcClient } from "../../../../client/src/lib/trpc/index.js";

type RealTrpc = typeof realTrpcClient;

// -----------------------------------------------------------------------
// Engine handle (set by main.ts after boot)
// -----------------------------------------------------------------------

let engineTrpc: unknown = null;

class HealthTrpcNotReadyError extends Error {
  override readonly name = "HealthTrpcNotReadyError";
  constructor() {
    super(
      "Health tRPC accessed before engine boot. Call setHealthTrpc() first.",
    );
  }
}

/**
 * Wire the engine's tRPC caller proxy into this shim.
 * Called once by main.ts after bootHealthEngine resolves.
 */
export function setHealthTrpc(t: unknown): void {
  engineTrpc = t;
}

// -----------------------------------------------------------------------
// Dev delay stubs (no-ops in the health; the engine has no network)
// -----------------------------------------------------------------------

let devDelayOn = false;

export function isDevDelayEnabled(): boolean {
  return devDelayOn;
}

export function setDevDelay(enabled: boolean): void {
  devDelayOn = enabled;
}

// -----------------------------------------------------------------------
// Lazy proxy typed as the real TRPCClient<AppRouter>
// -----------------------------------------------------------------------

/**
 * Proxy that delegates every property access to the engine handle.
 * Throws HealthTrpcNotReadyError if accessed before setHealthTrpc().
 */
export const trpc: RealTrpc = new Proxy(
  {},
  {
    get(_target: Record<string, unknown>, prop: string | symbol): unknown {
      if (engineTrpc === null) {
        throw new HealthTrpcNotReadyError();
      }
      return Reflect.get(engineTrpc as Record<string | symbol, unknown>, prop);
    },
  },
) as unknown as RealTrpc;
