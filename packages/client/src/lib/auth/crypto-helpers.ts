/**
 * Shared crypto helpers for login and password change flows.
 *
 * Extracted from login-crypto.ts so both loginCrypto() and changePassword()
 * can reuse the OPRF evaluate-with-PoW-retry logic and the org key
 * fetch+unwrap pattern without duplication.
 */

import { trpc } from "$lib/trpc/index.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";

/**
 * Type guard for tRPC errors carrying a PoW challenge.
 *
 * The server's error formatter forwards `challenge` and `difficulty`
 * from PowRequiredError into the tRPC error shape's `data` field.
 */
function isPowRequired(
  err: unknown,
): err is { data: { code: string; challenge: string; difficulty: number } } {
  if (typeof err !== "object" || err === null || !("data" in err)) {
    return false;
  }
  const { data } = err;
  if (typeof data !== "object" || data === null) {
    return false;
  }
  return (
    "code" in data &&
    data.code === "POW_REQUIRED" &&
    "challenge" in data &&
    typeof data.challenge === "string" &&
    "difficulty" in data &&
    typeof data.difficulty === "number"
  );
}

/**
 * OPRF evaluate via tRPC with automatic PoW retry.
 *
 * On first failure count >= 3, the server returns a PoW challenge instead
 * of the evaluated element. This function handles the retry transparently.
 */
export async function evaluateWithPowRetry(
  userId: string,
  blindedElement: string,
  onPowRequired: (challenge: string, difficulty: number) => Promise<string>,
): Promise<string> {
  try {
    const result = await trpc.oprf.evaluate.mutate({ userId, blindedElement });
    return result.evaluated;
  } catch (err: unknown) {
    if (!isPowRequired(err)) throw err;

    const solution = await onPowRequired(
      err.data.challenge,
      err.data.difficulty,
    );
    const result = await trpc.oprf.evaluate.mutate({
      userId,
      blindedElement,
      powChallenge: err.data.challenge,
      powSolution: solution,
    });
    return result.evaluated;
  }
}

/**
 * Fetch and unwrap the org key if the org has been onboarded.
 * The Worker retains the secret; returns only the org public key (base64)
 * for main-thread caching. Returns null if the org keypair doesn't exist yet.
 */
export async function fetchAndUnwrapOrgKey(
  bridge: CryptoBridge,
): Promise<string | null> {
  try {
    const orgKeyData = await trpc.keys.getWrappedOrgKey.query();
    if (!orgKeyData) return null;

    return await bridge.unwrapOrgKey(
      orgKeyData.wrappedKey,
      orgKeyData.ephemeralPoint,
      orgKeyData.nonce,
    );
  } catch (err: unknown) {
    if (import.meta.env.DEV) {
      console.warn("[fetchAndUnwrapOrgKey] failed:", err);
    }
    return null;
  }
}
