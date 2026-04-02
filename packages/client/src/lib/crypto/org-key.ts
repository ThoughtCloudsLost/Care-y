/**
 * Main-thread org key manager for non-PII tier decryption.
 *
 * Holds the Curve25519 org secret key in memory for the duration of the
 * session. Used to decrypt branding assets, KB articles, and shared org
 * config that are sealed with the org's public key (crypto_box_seal).
 *
 * The org secret is received as a Transferable ArrayBuffer from the
 * crypto Worker's unwrapOrgKey response. The Worker uses volPrivate to
 * ECIES-unwrap the org key, then transfers ownership to the main thread.
 *
 * This key is less sensitive than PII-tier keys (shared across all
 * volunteers, not per-user), so it lives on the main thread to avoid
 * postMessage round-trips for every branding/KB decrypt. It is zeroed
 * on logout, idle timeout, and beforeunload.
 *
 * References:
 *   SEC-206  ProtonMail Worker key isolation pattern
 *   SEC-207  ProtonMail CryptoProxy (non-PII on main thread)
 */

import { requireSodium } from "@care-y/crypto";

/** Thrown when decrypt is called before the org key has been loaded. */
export class OrgKeyNotLoadedError extends Error {
  constructor() {
    super("Org encryption key not loaded. Please log in again.");
    this.name = "OrgKeyNotLoadedError";
  }
}

// care-y-ignore-next-line no-org-private-key-server -- this is a CLIENT-SIDE class (packages/client/).
// The org secret key lives in browser memory only, received via Transferable from the crypto Worker.
// It is never sent to the server. The server holds only the ECIES-wrapped blob (wrapped_org_keys table).
export class OrgKeyManager {
  private orgSecret: Uint8Array | null = null;
  private orgPublicKey: Uint8Array | null = null;

  /**
   * Load the org secret key from a buffer.
   *
   * Accepts ArrayBufferLike (covers both ArrayBuffer from Transferable
   * postMessage and Uint8Array.buffer which returns ArrayBufferLike).
   * Called once after loginCrypto completes and the Worker transfers
   * the unwrapped org key back to the main thread.
   */
  load(orgKeyBuffer: ArrayBufferLike): void {
    const sodium = requireSodium();
    if (this.orgSecret) {
      // Zero the previous key before replacing (e.g., re-login without logout)
      sodium.memzero(this.orgSecret);
    }
    if (this.orgPublicKey) {
      sodium.memzero(this.orgPublicKey);
    }
    this.orgSecret = new Uint8Array(orgKeyBuffer);
    this.orgPublicKey = sodium.crypto_scalarmult_base(this.orgSecret);
  }

  /**
   * Decrypt a sealed box ciphertext using the org keypair.
   *
   * crypto_box_seal_open requires both the public key and secret key.
   * The public key is derived from the secret key via crypto_scalarmult_base
   * (Curve25519 base point multiplication). The derived pk is zeroed after use.
   */
  decrypt(ciphertext: Uint8Array): Uint8Array {
    if (!this.orgSecret || !this.orgPublicKey) {
      throw new OrgKeyNotLoadedError();
    }

    const sodium = requireSodium();
    return sodium.crypto_box_seal_open(
      ciphertext,
      this.orgPublicKey,
      this.orgSecret,
    );
  }

  /** Zero the org secret key. Idempotent (safe to call multiple times). */
  zero(): void {
    if (this.orgSecret || this.orgPublicKey) {
      const sodium = requireSodium();
      if (this.orgPublicKey) {
        sodium.memzero(this.orgPublicKey);
        this.orgPublicKey = null;
      }
      if (this.orgSecret) {
        sodium.memzero(this.orgSecret);
        this.orgSecret = null;
      }
    }
  }

  /** Whether the org key is currently loaded (for UI status indicators). */
  get isLoaded(): boolean {
    return this.orgSecret !== null;
  }
}
