/**
 * Stub for $lib/trpc/index.js.
 *
 * Thin engine adapter with a minimal choreography overlay. The demo runs
 * the REAL server (createAppRouter on PGlite in-browser) via the engine.
 * All data endpoints delegate to the engine's tRPC caller adapter.
 *
 * Only two concerns stay mocked:
 *   1. twoFactor.verify.* choreography (TOTP is time-based, no real
 *      enrolled device exists, push approval is synthetic).
 *   2. auth.login wrapper: delegates to the engine for real scrypt
 *      password verification, then sets the login stage to "twofa-picker"
 *      as a demo-choreography side effect. This is a pass-through
 *      wrapper with a stage side effect, not a parallel data layer.
 *
 * Everything else (auth.me, branding.*, onboarding.*, tickets, etc.)
 * delegates directly to the engine.
 */

// Type-only import of the real tRPC client. Uses a relative path that
// bypasses the $lib/trpc alias (which points back to this stub file) and
// resolves @trpc/client and @care-y/server from the client package, so the
// demo package needs neither as a dependency. At runtime the Proxy stands
// in; the type makes all consumer-site accesses structurally valid.
import type { trpc as realTrpcClient } from "../../../client/src/lib/trpc/index.js";

type RealTrpc = typeof realTrpcClient;

import { setLoginStage } from "../lib/login-stage.svelte.js";
import { registerTrpcForPreview } from "./crypto-context.js";
import { traceFlowSpan } from "../lib/flow-events.js";
import type { DemoSeamKey } from "../lib/bridge.js";

// -----------------------------------------------------------------------
// Error types (no bare Error throws)
// -----------------------------------------------------------------------

class DemoEngineNotReadyError extends Error {
  override readonly name = "DemoEngineNotReadyError";
  constructor(path: string) {
    super(
      `Engine adapter not set. Cannot access trpc.${path} before setEngineTrpc() is called.`,
    );
  }
}

// Re-export so tests can assert on the error type without a string match.
export { DemoEngineNotReadyError };

// -----------------------------------------------------------------------
// Dev delay toggle
// -----------------------------------------------------------------------

let devDelayOn = false;

export function isDevDelayEnabled(): boolean {
  return devDelayOn;
}

export function setDevDelay(enabled: boolean): void {
  devDelayOn = enabled;
}

// -----------------------------------------------------------------------
// Engine adapter slot (accepts a value or a Promise)
// -----------------------------------------------------------------------

let enginePromise: Promise<unknown> | null = null;

/**
 * Store the engine's caller adapter. Called after engine boot completes.
 * Accepts the adapter directly or a Promise that resolves to it.
 * Calls made before the promise resolves will await it transparently.
 */
export function setEngineTrpc(t: unknown): void {
  enginePromise = Promise.resolve(t);
}

/**
 * Reset the engine adapter. Intended for tests only.
 */
export function resetEngineTrpc(): void {
  enginePromise = null;
}

async function getEngine(): Promise<unknown> {
  if (enginePromise === null) {
    throw new DemoEngineNotReadyError("(awaiting engine)");
  }
  return enginePromise;
}

// -----------------------------------------------------------------------
// Auth state (used by PhoneApp bridge for fast-forward)
// -----------------------------------------------------------------------

let demoAuthed = false;
let pushPollCount = 0;
let pushArmedUntil = 0;
let pushChallengeApproves = false;

/** Reset mock overlay state. Restart = iframe reload, so this is minimal. */
export function demoResetTrpc(): void {
  demoAuthed = false;
  pushPollCount = 0;
  pushArmedUntil = 0;
  pushChallengeApproves = false;
}

/**
 * Arm the next push challenge to approve. Called when a REAL visitor
 * tap opens the push method; a scroll-driven (synthetic) open never
 * arms, so merely showing the push screen cannot complete login.
 */
export function armPushChallenge(): void {
  pushArmedUntil = Date.now() + 3000;
}

/** Mark the demo as authenticated (called internally by 2FA verify stubs). */
function markAuthed(): void {
  demoAuthed = true;
}

/**
 * Pre-login auth.me rejection. Structural: the engine's fabricated
 * context is ALWAYS an authenticated, 2FA-verified admin, so a real
 * auth.me can never 401. The login page queries auth.me on mount and
 * redirects to "/" when twofaVerified is true, so without this gate
 * the demo skips the entire login story on boot.
 */
class DemoAuthError extends Error {
  override readonly name = "DemoAuthError";
  constructor() {
    super("Not authenticated");
  }
}

/** Check if the demo is in authenticated state. */
export function isDemoAuthed(): boolean {
  return demoAuthed;
}

/** Set the auth flag directly. For bridge fast-forward use by PhoneApp. */
export function setDemoAuthed(authed: boolean): void {
  demoAuthed = authed;
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

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

/** Tiny base64url encoder for plain ASCII strings (no baked literals). */
function asciiToBase64url(plain: string): string {
  return btoa(plain).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Emit a tRPC-lane request/response pair around a call. Procedure input
 * is never previewed: login carries a password, and the band would put
 * it on screen.
 */
async function tracedProc<T>(
  path: string,
  kind: "query" | "mutate",
  seamKey: DemoSeamKey | null,
  run: () => Promise<T>,
): Promise<T> {
  return await traceFlowSpan(
    { lane: "trpc", label: `${path} ${kind}`, seamKey },
    run,
  );
}

// -----------------------------------------------------------------------
// Mock overlay: 2FA verification choreography
//
// These procedures structurally cannot work through the engine: TOTP
// codes are time-based with no real enrolled device, WebAuthn has no
// real credential, push approval is synthetic, and email/SMS codes
// have no real transport.
// -----------------------------------------------------------------------

const TWOFA_SEAM: DemoSeamKey = "twofa-choreography";

/** Trace a twoFactor.verify procedure under the choreography seam. */
async function tracedVerify<T>(
  proc: string,
  kind: "query" | "mutate",
  run: () => Promise<T>,
): Promise<T> {
  return await tracedProc(`twoFactor.verify.${proc}`, kind, TWOFA_SEAM, run);
}

const twoFactorVerifyRouter = {
  totp: {
    async mutate(_opts: { code: string }): Promise<{ success: boolean }> {
      return tracedVerify("totp", "mutate", async () => {
        await delay(200);
        markAuthed();
        return { success: true };
      });
    },
  },
  emailComplete: {
    async mutate(_opts: { code: string }): Promise<{ success: boolean }> {
      return tracedVerify("emailComplete", "mutate", async () => {
        await delay(200);
        markAuthed();
        return { success: true };
      });
    },
  },
  smsComplete: {
    async mutate(_opts: { code: string }): Promise<{ success: boolean }> {
      return tracedVerify("smsComplete", "mutate", async () => {
        await delay(200);
        markAuthed();
        return { success: true };
      });
    },
  },
  backupCode: {
    async mutate(_opts: { code: string }): Promise<{ success: boolean }> {
      return tracedVerify("backupCode", "mutate", async () => {
        await delay(200);
        markAuthed();
        return { success: true };
      });
    },
  },
  emailSend: {
    async mutate(): Promise<{ sent: true }> {
      return tracedVerify("emailSend", "mutate", async () => {
        await delay(200);
        // Auto-start methods call their send endpoint the moment they open
        setLoginStage("twofa-method");
        return { sent: true };
      });
    },
  },
  smsSend: {
    async mutate(): Promise<{ sent: true }> {
      return tracedVerify("smsSend", "mutate", async () => {
        await delay(200);
        setLoginStage("twofa-method");
        return { sent: true };
      });
    },
  },
  webauthnOptions: {
    async mutate(): Promise<{
      challenge: string;
      rpId: string;
      allowCredentials: { id: string; transports: string[] }[];
    }> {
      return tracedVerify("webauthnOptions", "mutate", async () => {
        await delay(200);
        setLoginStage("twofa-method");
        return {
          challenge: asciiToBase64url("demo-challenge-payload"),
          rpId: "demo.local",
          allowCredentials: [
            {
              id: asciiToBase64url("demo-credential-id"),
              transports: ["internal"],
            },
          ],
        };
      });
    },
  },
  webauthnComplete: {
    async mutate(_resp: unknown): Promise<{ success: true }> {
      return tracedVerify("webauthnComplete", "mutate", async () => {
        await delay(200);
        markAuthed();
        return { success: true };
      });
    },
  },
  pushSend: {
    async mutate(): Promise<{ challengeId: string; sent: true }> {
      return tracedVerify("pushSend", "mutate", async () => {
        await delay(200);
        setLoginStage("twofa-method");
        pushPollCount = 0;
        pushChallengeApproves = Date.now() <= pushArmedUntil;
        return { challengeId: "demo-push-challenge", sent: true };
      });
    },
  },
  pushPoll: {
    async query(_opts: {
      challengeId: string;
    }): Promise<{ status: "pending" | "approved" | "denied" }> {
      return tracedVerify<{ status: "pending" | "approved" | "denied" }>(
        "pushPoll",
        "query",
        async () => {
          await delay(200);
          pushPollCount += 1;
          // Unarmed challenges (scroll-driven opens) wait forever: the
          // visitor can view the waiting state and move on. An armed
          // challenge stays "pending" long enough (~12s at the 3s poll
          // interval) to read, then the approval resolves.
          if (!pushChallengeApproves || pushPollCount <= 4) {
            return { status: "pending" };
          }
          markAuthed();
          return { status: "approved" };
        },
      );
    },
  },
};

// -----------------------------------------------------------------------
// Mock overlay object: only routers/procedures that need
// demo-specific choreography. Everything else delegates.
// -----------------------------------------------------------------------

const mockOverlay: Record<string, Record<string, unknown>> = {
  auth: {
    login: {
      async mutate(opts: {
        identifier: string;
        password: string;
      }): Promise<unknown> {
        // Delegate to the real engine for scrypt password verification
        // and real enrolledMethods from the seeded two_factor_methods rows.
        // The stage side effect is choreography, not a parallel data layer.
        return tracedProc("auth.login", "mutate", null, async () => {
          const engine = await getEngine();
          const authRouter = Reflect.get(
            engine as Record<string | symbol, unknown>,
            "auth",
          );
          const loginProc = Reflect.get(
            authRouter as Record<string | symbol, unknown>,
            "login",
          );
          const mutFn = Reflect.get(
            loginProc as Record<string | symbol, unknown>,
            "mutate",
          ) as (input: {
            identifier: string;
            password: string;
          }) => Promise<unknown>;
          const result = await mutFn(opts);
          setLoginStage("twofa-picker");
          return result;
        });
      },
    },
    me: {
      // Gate, then delegate: 401 until the demo login completes (see
      // DemoAuthError above for why the engine cannot provide this),
      // real engine auth.me afterwards.
      async query(): Promise<unknown> {
        return tracedProc("auth.me", "query", null, async () => {
          if (!demoAuthed) {
            throw new DemoAuthError();
          }
          const engine = await getEngine();
          const authRouter = Reflect.get(
            engine as Record<string | symbol, unknown>,
            "auth",
          );
          const meProc = Reflect.get(
            authRouter as Record<string | symbol, unknown>,
            "me",
          );
          const queryFn = Reflect.get(
            meProc as Record<string | symbol, unknown>,
            "query",
          ) as () => Promise<unknown>;
          return queryFn();
        });
      },
    },
  },
  twoFactor: {
    verify: twoFactorVerifyRouter,
  },
  onboarding: {
    getStatus: {
      // The login page gates its entire form render on this query, so
      // delegating to the engine would hold login hostage to engine
      // boot and defeat the lazy load. The seeded org is always fully
      // set up (seed-structure completes before any request can be
      // served), so this constant equals what the engine would return.
      async query(): Promise<{ needsSetup: boolean }> {
        return await tracedProc(
          "onboarding.getStatus",
          "query",
          null,
          async () => await Promise.resolve({ needsSetup: false }),
        );
      },
    },
  },
};

// -----------------------------------------------------------------------
// Recursive proxy: router[.subRouter...].procedure
//
// The mock overlay is consulted for the first two path levels (its
// entries are router -> procedure-or-subrouter). Everything else falls
// through to the engine adapter, accumulating the full path so nested
// routers (twoFactor.enroll.totpSetup, twoFactor.methods.remove) reach
// the caller. A flat two-level fall-through silently breaks exactly
// those: property access on a plain { query, mutate } object returns
// undefined and the client throws at .mutate.
//
// Every delegation path awaits the engine promise, so calls made
// while the engine is still booting will wait transparently.
// -----------------------------------------------------------------------

/**
 * Build a proxy node that delegates to the engine adapter at `path`.
 * "query"/"mutate" terminate into a dispatch; other property gets
 * extend the path.
 */
function makeEngineNode(path: readonly string[]): unknown {
  async function dispatch(kind: "query" | "mutate", input?: unknown) {
    return tracedProc(path.join("."), kind, null, async () => {
      const eng = await getEngine();
      let node: unknown = eng;
      for (const segment of path) {
        if (node === undefined || node === null) break;
        node = Reflect.get(node as Record<string | symbol, unknown>, segment);
      }
      const fn = Reflect.get(
        node as Record<string | symbol, unknown>,
        kind,
      ) as (i?: unknown) => Promise<unknown>;
      return fn(input);
    });
  }
  return new Proxy(
    {},
    {
      get(_target, prop: string | symbol): unknown {
        if (typeof prop === "symbol") return undefined;
        if (prop === "query") {
          return async (input?: unknown): Promise<unknown> =>
            dispatch("query", input);
        }
        if (prop === "mutate") {
          return async (input?: unknown): Promise<unknown> =>
            dispatch("mutate", input);
        }
        return makeEngineNode([...path, prop]);
      },
    },
  );
}

export const trpc: RealTrpc = new Proxy(
  {},
  {
    get(_target, routerName: string | symbol): unknown {
      if (typeof routerName === "symbol") return undefined;

      // Map lookups instead of computed property access: routerName and
      // procName arrive from arbitrary proxy gets, and Map.get carries
      // no prototype-pollution surface.
      const mockRouter = new Map(Object.entries(mockOverlay)).get(routerName);
      if (mockRouter === undefined) {
        return makeEngineNode([routerName]);
      }

      // Has some mocked procedures: return a proxy that checks procedure names
      return new Proxy(
        {},
        {
          get(_t2, procName: string | symbol): unknown {
            if (typeof procName === "symbol") return undefined;
            const mockProc = new Map(Object.entries(mockRouter)).get(procName);
            if (mockProc !== undefined) return mockProc;
            // Fall through to engine for non-mocked members on this router
            return makeEngineNode([routerName, procName]);
          },
        },
      );
    },
  },
) as unknown as RealTrpc;

/**
 * The mock overlay with its own concrete types, for tests and demo-internal
 * wiring. Client components go through `trpc` above, whose real-client
 * type enforces the production calling conventions; tests exercising
 * the mock's behavior use this surface instead.
 */
export const demoTrpcMock: typeof mockOverlay = mockOverlay;

// Register the trpc proxy with crypto-context for the PreviewLoader's queryFn.
// This runs at module init time, after the trpc Proxy is constructed above.
// crypto-context.ts cannot import trpc.ts (circular), so trpc.ts pushes itself.
registerTrpcForPreview(
  trpc as unknown as Parameters<typeof registerTrpcForPreview>[0],
);
