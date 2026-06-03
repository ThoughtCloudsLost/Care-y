/**
 * tRPC client bootstrap.
 *
 * Uses vanilla @trpc/client with httpBatchLink.
 * All tRPC calls go through TanStack Query createQuery() with manual query keys.
 *
 * Pattern:
 *   createQuery({
 *     queryKey: ['resource', 'action'],
 *     queryFn: () => trpc.resource.action.query(),
 *   })
 */

import type { TRPCClient, TRPCLink } from "@trpc/client";
import {
  createTRPCClient,
  httpBatchLink,
  isTRPCClientError,
} from "@trpc/client";
import { observable } from "@trpc/server/observable";
import type { AppRouter } from "@care-y/server";
import { ErrorCode } from "@care-y/shared";
import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { DEV_ORG_SLUG } from "$lib/utils/org-slug.js";

// DEV-only artificial delay for testing loading/skeleton states.
// Adds 5-15s latency to both tRPC calls and ECIES decryption.
// Defaults OFF so tests and normal dev flow are fast.
// Toggled from DevThemePanel at runtime.
let devDelayEnabled = false;
export function setDevDelay(enabled: boolean): void {
  devDelayEnabled = enabled;
}
export function isDevDelayEnabled(): boolean {
  return devDelayEnabled;
}

// Prevents multiple simultaneous 2FA redirects when many queries fail at once.
let redirectingTo2fa = false;

/**
 * Paths that handle TWOFA_REQUIRED themselves (login, 2FA verification,
 * logout). The interceptor must not redirect for these.
 */
const TWOFA_BYPASS_PREFIXES = ["auth.", "twoFactor.verify."];

function shouldBypass(path: string): boolean {
  return TWOFA_BYPASS_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/**
 * Fetches enrolled 2FA method types from the server, stores them in
 * sessionStorage for the /2fa page, and navigates there.
 *
 * The twoFactor.status endpoint uses authedProcedure (no 2FA required),
 * so it won't trigger this interceptor recursively.
 */
async function redirectTo2fa(): Promise<void> {
  try {
    const status = await trpc.twoFactor.status.query();
    const methodTypes = status.methods.map((m) => m.type);
    try {
      sessionStorage.setItem("care-y-2fa-methods", JSON.stringify(methodTypes));
    } catch (storageErr: unknown) {
      // sessionStorage may be unavailable in private browsing or when full.
      // The /2fa page will redirect to /login if no methods are found.
      console.warn(
        "[2fa-interceptor] sessionStorage write failed:",
        storageErr,
      );
    }
  } catch (fetchErr: unknown) {
    // Status fetch can fail if the session is fully expired or the network
    // is down. Still redirect; the /2fa page sends the user to /login when
    // no methods are found in sessionStorage.
    console.warn(
      "[2fa-interceptor] failed to fetch enrolled methods:",
      fetchErr,
    );
  }
  await goto(resolve("/2fa"));
}

/**
 * tRPC link that intercepts TWOFA_REQUIRED errors globally.
 *
 * When the server clears twofa_verified (e.g., IP drift), every authed2fa
 * procedure fails with TWOFA_REQUIRED. Without this interceptor, each widget
 * would show its own QueryError. Instead, a single redirect to /2fa gives the
 * user a clean re-verification flow.
 */
function twoFaInterceptorLink(): TRPCLink<AppRouter> {
  return () =>
    ({ op, next }) =>
      observable((observer) => {
        const subscription = next(op).subscribe({
          next(value) {
            observer.next(value);
          },
          error(err) {
            if (
              !shouldBypass(op.path) &&
              !redirectingTo2fa &&
              isTRPCClientError<AppRouter>(err) &&
              err.message === ErrorCode.TWOFA_REQUIRED
            ) {
              redirectingTo2fa = true;
              void redirectTo2fa().finally(() => {
                redirectingTo2fa = false;
              });
            }
            // Always propagate the error so callers see the failure.
            // The redirect handles the UX; individual queries can still
            // clean up their loading states.
            observer.error(err);
          },
          complete() {
            observer.complete();
          },
        });

        return () => {
          subscription.unsubscribe();
        };
      });
}

export const trpc: TRPCClient<AppRouter> = createTRPCClient<AppRouter>({
  links: [
    twoFaInterceptorLink(),
    httpBatchLink({
      // Vite proxy in dev (/trpc -> localhost:3000), Caddy route in prod.
      // Same-origin requests: no CORS, cookies work naturally.
      url: "/trpc",
      // Dev: send X-Org-Slug header for org resolution (no subdomain in dev).
      // import.meta.env.DEV is compile-time; Vite strips the header in prod builds.
      headers: import.meta.env.DEV ? { "x-org-slug": DEV_ORG_SLUG } : undefined,
      // tRPC's RequestInitEsque has signal?: AbortSignal | undefined, incompatible
      // with native fetch's RequestInit under exactOptionalPropertyTypes (trpc/trpc#1904)
      async fetch(url, options) {
        if (import.meta.env.DEV && devDelayEnabled) {
          await new Promise((r) =>
            setTimeout(r, 5_000 + Math.random() * 10_000),
          );
        }
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});
