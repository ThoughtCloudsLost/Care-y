/**
 * Ends a staff session on the server and wipes it from this device.
 *
 * The logout page and the idle timeout both call this, so the server
 * session ends the same way however the user leaves. The server call is
 * retried briefly. The local wipe runs whatever the server answered: a
 * device the user has walked away from must not keep keys or decrypted
 * data because the network was down.
 *
 * The caller learns whether the server confirmed, so the login page can
 * tell the user when the server session may outlive this device's.
 */

import { trpc } from "$lib/trpc/index.js";
import { isUnauthorizedTrpcError } from "$lib/errors.js";
import { clearAllDecryptedData, type CleanupOrgKey } from "./cleanup.js";

/** Total server logout attempts before giving up. */
const LOGOUT_MAX_ATTEMPTS = 3;

/** Pause before the second and third attempts. */
const LOGOUT_RETRY_DELAYS_MS: readonly number[] = [300, 1_000];

/** Narrow interface: only the method the wipe needs from QueryClient. */
export interface EndSessionQueryClient {
  clear(): void;
}

/** Narrow interface: only the method the wipe needs from CryptoBridge. */
export interface EndSessionBridge {
  zeroAll(): Promise<void>;
}

export interface EndStaffSessionDeps {
  readonly queryClient: EndSessionQueryClient;
  readonly bridge: EndSessionBridge;
  readonly orgKeyManager: CleanupOrgKey;
}

export interface EndStaffSessionResult {
  /** True when the server confirmed the session no longer exists. */
  readonly serverConfirmed: boolean;
}

async function wait(ms: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Calls auth.logout until the server confirms or the attempts run out.
 * UNAUTHORIZED counts as confirmed: the server holds no session to end.
 */
async function logoutOnServer(): Promise<boolean> {
  for (let attempt = 1; attempt <= LOGOUT_MAX_ATTEMPTS; attempt++) {
    try {
      await trpc.auth.logout.mutate();
      return true;
    } catch (err: unknown) {
      if (isUnauthorizedTrpcError(err)) return true;
      const delay = LOGOUT_RETRY_DELAYS_MS[attempt - 1];
      if (attempt < LOGOUT_MAX_ATTEMPTS && delay !== undefined) {
        await wait(delay);
      }
    }
  }
  // Recovery is the caller's: it tells the user the server did not confirm
  console.warn("[end-staff-session] server did not confirm sign-out", {
    attempts: LOGOUT_MAX_ATTEMPTS,
  });
  return false;
}

/**
 * Ends the server session (with retries), then clears cached queries,
 * decrypted data, the org key, and the worker's key material. The local
 * wipe always runs.
 */
export async function endStaffSession(
  deps: EndStaffSessionDeps,
): Promise<EndStaffSessionResult> {
  // The local wipe runs first: logout needs only the session cookie, and
  // keys must not stay in memory while the server attempts back off.
  deps.queryClient.clear();
  // Resets the cache registry: clears every decrypt cache and drops the
  // registrations so the next sign-in starts clean.
  clearAllDecryptedData();
  deps.orgKeyManager.zero();
  await deps.bridge.zeroAll();

  const serverConfirmed = await logoutOnServer();

  return { serverConfirmed };
}
