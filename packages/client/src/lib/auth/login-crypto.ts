/**
 * Client-side login crypto flow.
 *
 * Orchestrates the full key derivation pipeline:
 *   getSalt (tRPC) -> Argon2id (Worker) -> OPRF blind (Worker)
 *   -> OPRF evaluate (tRPC) -> deriveKeys (Worker) -> unwrapOrgKey (Worker)
 *
 * The main thread handles network I/O and progress callbacks.
 * The Worker handles all key derivation. masterKey, volPrivate, and
 * stretched never exist on the main thread.
 *
 * References:
 *   SEC-206, SEC-207  ProtonMail crypto worker pattern
 *   SEC-210           W3C postMessage interception risk
 */

import { decode } from "@care-y/crypto";
import { trpc } from "$lib/trpc/index.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";

/**
 * Copy a Uint8Array's contents into a standalone ArrayBuffer
 * suitable for Transferable transfer. Uses slice() to guarantee
 * a fresh ArrayBuffer even when the view covers the whole buffer.
 */
function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  // ArrayBuffer.prototype.slice returns ArrayBuffer per spec, but TS
  // types it as ArrayBufferLike (union with SharedArrayBuffer).
  // Uint8Array never backs onto SharedArrayBuffer in our usage.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- ArrayBuffer.slice() always returns ArrayBuffer
  return view.buffer.slice(
    view.byteOffset,
    view.byteOffset + view.byteLength,
  ) as ArrayBuffer;
}

export interface LoginCryptoResult {
  /** Base64-encoded volunteer public key (for display or upload). */
  volPublic: string;
  /** Unwrapped org private key (Transferable, for OrgKeyManager). Null if org not onboarded. */
  orgPrivateKey: ArrayBuffer | null;
}

export interface LoginCryptoCallbacks {
  onArgon2idStart: () => void;
  onArgon2idDone: () => void;
  onOprfStart: () => void;
  onOprfDone: () => void;
  onDeriveStart: () => void;
  onDone: () => void;
  /**
   * Called when the OPRF server requires proof-of-work.
   * The UI should show a "Verifying..." spinner while PoW is solved.
   * Returns the hex-encoded solution string.
   */
  onPowRequired: (challenge: string, difficulty: number) => Promise<string>;
}

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
  // `"data" in err` narrows to `Record<string, unknown>` at this point.
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
 * Decode a standard base64 string to Uint8Array.
 *
 * The OPRF evaluate endpoint returns standard base64 (with +, /, =).
 * The @care-y/crypto decode() expects url-safe no-padding base64.
 * This helper bridges the gap until all server responses are
 * standardized to url-safe encoding.
 *
 * The `evaluated` value is a public ristretto255 point (not key material),
 * so the temporary JS string from atob is acceptable here.
 */
function decodeStandardBase64(encoded: string): Uint8Array {
  const binary = atob(encoded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/**
 * Full login crypto pipeline.
 *
 * @param identifier - Username (used for getSalt and OPRF userId lookup)
 * @param password - Raw password string (zeroed via Transferable after Argon2id)
 * @param bridge - Initialized CryptoBridge instance
 * @param callbacks - Progress callbacks for UI state management
 * @returns volPublic (base64) and orgPrivateKey (ArrayBuffer or null)
 */
export async function loginCrypto(
  identifier: string,
  password: string,
  bridge: CryptoBridge,
  callbacks: LoginCryptoCallbacks,
): Promise<LoginCryptoResult> {
  // 1. Get salt + userId from server.
  //    Salt is url-safe base64 (fixed in Task 0c).
  //    userId is the real UUID or a deterministic fake (enumeration defense).
  const { salt: saltB64, userId } = await trpc.auth.getSalt.query({
    identifier,
  });
  const salt = decode(saltB64);

  // 2. Argon2id in the crypto Worker (pre-keyed state).
  //    Worker runs deriveAccountKey(password, salt) internally, holds `stretched`.
  //    Both buffers are Transferable-transferred: neutered (zero-length) on main thread.
  callbacks.onArgon2idStart();
  const passwordBuf = new TextEncoder().encode(password);
  await bridge.argon2id(toArrayBuffer(passwordBuf), toArrayBuffer(salt));
  // Both ArrayBuffers are now neutered (byteLength === 0)
  callbacks.onArgon2idDone();

  // 3. OPRF blind inside the Worker.
  //    Worker already holds `stretched`, runs oprfBlind(stretched) internally.
  //    Returns only `blindedElement` (base64, public). blindState stays in Worker.
  callbacks.onOprfStart();
  const { blindedElement } = await bridge.oprfBlind();

  // 4. OPRF evaluate via tRPC (network call from main thread).
  //    The OPRF endpoint is a publicProcedure (no auth required, pre-login).
  //    May return a PoW challenge on repeated failures.
  let evaluatedB64: string;
  try {
    const result = await trpc.oprf.evaluate.mutate({
      userId,
      blindedElement,
    });
    evaluatedB64 = result.evaluated;
  } catch (err: unknown) {
    if (isPowRequired(err)) {
      const solution = await callbacks.onPowRequired(
        err.data.challenge,
        err.data.difficulty,
      );
      const result = await trpc.oprf.evaluate.mutate({
        userId,
        blindedElement,
        powChallenge: err.data.challenge,
        powSolution: solution,
      });
      evaluatedB64 = result.evaluated;
    } else {
      throw err;
    }
  }
  callbacks.onOprfDone();

  // 5. Transfer `evaluated` to Worker for OPRF finalize + key derivation.
  //    Worker already holds stretched + blindState from steps 2-3.
  //    Worker does: oprfFinalize(blindState, evaluated, stretched) -> oprfOutput
  //    -> deriveMasterKey(oprfOutput) -> volPrivate/volPublic
  //    masterKey + volPrivate stay in Worker. Only volPublic (public) comes back.
  //
  //    OPRF evaluate returns standard base64. Convert before transfer.
  callbacks.onDeriveStart();
  const evaluatedBytes = decodeStandardBase64(evaluatedB64);
  const { volPublic } = await bridge.deriveKeys(toArrayBuffer(evaluatedBytes));
  // evaluatedBytes.buffer is neutered after Transferable transfer.

  // 6. Fetch and unwrap the org private key (non-PII tier).
  //    The wrapped org key is ECIES-encrypted with volPublic during admin onboarding.
  //    The Worker unwraps it using volPrivate and returns the raw key as Transferable.
  //    Returns null if the org hasn't generated a keypair yet (pre-onboarding).
  let orgPrivateKey: ArrayBuffer | null = null;
  try {
    const orgKeyData = await trpc.keys.getWrappedOrgKey.query();
    if (orgKeyData) {
      orgPrivateKey = await bridge.unwrapOrgKey(
        orgKeyData.wrappedKey,
        orgKeyData.ephemeralPoint,
        orgKeyData.nonce,
      );
    }
  } catch {
    // Org key may not exist yet (pre-onboarding). Non-fatal.
    // Org key features (branding, KB) will be unavailable.
  }

  callbacks.onDone();
  return { volPublic, orgPrivateKey };
}
