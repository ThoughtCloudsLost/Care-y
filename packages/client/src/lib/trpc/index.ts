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
import { page } from "$app/state";
import { DEV_ORG_SLUG } from "$lib/utils/org-slug.js";
import { isUnauthorizedTrpcError } from "$lib/errors.js";
import { reverifyStore } from "$lib/stores/reverify.svelte.js";
import { TRPC_BASE_PATH } from "./base-path.js";

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

// Prevents multiple simultaneous re-verification prompts when many queries
// fail at once.
let openingReverify = false;

// Prevents multiple simultaneous password-change redirects when many
// queries fail at once.
let redirectingToPasswordChange = false;

/**
 * Paths that handle TWOFA_REQUIRED themselves (login, 2FA verification,
 * logout). The interceptor must not prompt or redirect for these.
 */
const TWOFA_BYPASS_PREFIXES = ["auth.", "twoFactor.verify."];

function shouldBypass(path: string): boolean {
  return TWOFA_BYPASS_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/**
 * Fetches enrolled 2FA method types from the server and opens the
 * re-verification sheet over the current page, so unsaved work stays.
 *
 * The twoFactor.status endpoint uses authedProcedure (no 2FA required),
 * so it won't trigger this interceptor recursively. When the session is
 * gone entirely (UNAUTHORIZED) there is nothing to re-verify, so the user
 * goes to /login. Any other failure leaves the sheet closed; the next call
 * that fails with TWOFA_REQUIRED tries again.
 *
 * Only the (app) layout mounts ReverifySheet. On any other route (for
 * example onboarding) nothing would render the store, so the user goes to
 * /login and signs in again there.
 */
async function openReverify(): Promise<void> {
  if (!reverifyStore.registered) {
    await goto(resolve("/login"));
    return;
  }
  try {
    const status = await trpc.twoFactor.status.query();
    reverifyStore.open(status.methods.map((m) => m.type));
  } catch (fetchErr: unknown) {
    if (isUnauthorizedTrpcError(fetchErr)) {
      await goto(resolve("/login"));
      return;
    }
    console.warn(
      "[2fa-interceptor] failed to fetch enrolled methods:",
      fetchErr,
    );
  }
}

/**
 * Sends an account still on its temporary password to /complete, where
 * onboarding asks for a new one. Skipped when already there so the page's
 * own failing calls do not reload it.
 */
async function redirectToPasswordChange(): Promise<void> {
  const target = resolve("/complete");
  if (page.url.pathname === target) return;
  await goto(target);
}

/**
 * tRPC link that intercepts TWOFA_REQUIRED and PASSWORD_CHANGE_REQUIRED
 * errors globally.
 *
 * When the server clears twofa_verified (e.g., IP drift), every authed2fa
 * procedure fails with TWOFA_REQUIRED. Without this interceptor, each widget
 * would show its own QueryError. Instead, a single re-verification sheet
 * opens over the current page.
 *
 * While the account must replace its temporary password, every authed2fa
 * procedure fails with PASSWORD_CHANGE_REQUIRED, and the user is sent to
 * the onboarding page that collects the new password.
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
              !openingReverify &&
              !reverifyStore.opened &&
              isTRPCClientError<AppRouter>(err) &&
              err.message === ErrorCode.TWOFA_REQUIRED
            ) {
              openingReverify = true;
              void openReverify().finally(() => {
                openingReverify = false;
              });
            }
            if (
              !shouldBypass(op.path) &&
              !redirectingToPasswordChange &&
              isTRPCClientError<AppRouter>(err) &&
              err.message === ErrorCode.PASSWORD_CHANGE_REQUIRED
            ) {
              redirectingToPasswordChange = true;
              void redirectToPasswordChange().finally(() => {
                redirectingToPasswordChange = false;
              });
            }
            // Always propagate the error so callers see the failure.
            // The sheet or redirect handles the UX; individual queries can
            // still clean up their loading states.
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
      url: TRPC_BASE_PATH,
      // Send queries as POST too. A GET query carries its input in the URL,
      // which proxies and access logs record; identifiers such as the
      // sign-in username must not end up there. Needs allowMethodOverride
      // on the server handler.
      methodOverride: "POST",
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
