/**
 * Main-thread org key facade for non-PII tier operations.
 *
 * After the Worker isolation migration (ADR-042), this class is a thin
 * async facade. The org secret key lives exclusively in the crypto Worker.
 * The main thread retains only the org public key (non-secret, needed for
 * branding key derivation checks and isLoaded guard).
 *
 * Encrypt/decrypt operations delegate to the Worker via CryptoBridge.
 * The public key is cached locally for synchronous access (getPublicKey,
 * isLoaded) since it is not secret material.
 *
 * References:
 *   ADR-042  Org key Worker isolation
 *   SEC-206  ProtonMail Worker key isolation pattern
 */

import { decode, encode } from "@care-y/crypto";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";

const textEncoder = new TextEncoder();

/** Thrown when operations are called before the org key has been loaded. */
export class OrgKeyNotLoadedError extends Error {
  constructor() {
    super("Org encryption key not loaded. Please log in again.");
    this.name = "OrgKeyNotLoadedError";
  }
}

export class OrgKeyManager {
  private orgPublicKey: Uint8Array | null = null;
  private readonly bridge: CryptoBridge;
  private loadCallback: ((loaded: boolean) => void) | null = null;

  constructor(bridge: CryptoBridge) {
    this.bridge = bridge;
  }

  /**
   * Register a handler for load/zero transitions (ADR-049).
   * CryptoProvider uses this to keep isOrgKeyReady() in sync.
   */
  onLoadChange(handler: (loaded: boolean) => void): void {
    this.loadCallback = handler;
  }

  /**
   * Load the org public key from a base64 string.
   *
   * Called after the Worker's unwrapOrgKey response returns the public key.
   * The secret stays in the Worker. This just caches the public key locally
   * for synchronous getPublicKey() and isLoaded checks.
   */
  load(orgPublicKeyBase64: string): void {
    this.orgPublicKey = decode(orgPublicKeyBase64);
    this.loadCallback?.(true);
  }

  /**
   * Encrypt plaintext using the org public key (crypto_box_seal) via Worker.
   * Returns the sealed ciphertext as Uint8Array.
   */
  async encrypt(plaintext: Uint8Array): Promise<Uint8Array> {
    if (!this.orgPublicKey) {
      throw new OrgKeyNotLoadedError();
    }

    const ciphertextB64 = await this.bridge.orgEncrypt(encode(plaintext));
    return decode(ciphertextB64);
  }

  /** Encrypt a UTF-8 string and return its base64 ciphertext. */
  async encryptText(plaintext: string): Promise<string> {
    const cipherBytes = await this.encrypt(textEncoder.encode(plaintext));
    return encode(cipherBytes);
  }

  /**
   * Decrypt a sealed box ciphertext via Worker.
   * Returns the plaintext as Uint8Array.
   */
  async decrypt(ciphertext: Uint8Array): Promise<Uint8Array> {
    if (!this.orgPublicKey) {
      throw new OrgKeyNotLoadedError();
    }

    const rawBytesB64 = await this.bridge.orgDecrypt(encode(ciphertext));
    return decode(rawBytesB64);
  }

  /**
   * Compute the blind index hash of a raw alias string.
   * Normalization (NFKC, case fold, trim, whitespace collapse) happens
   * inside the Worker so the index key never crosses the boundary.
   * Returns lowercase hex HMAC-SHA512.
   */
  async aliasHash(alias: string): Promise<string> {
    if (!this.orgPublicKey) {
      throw new OrgKeyNotLoadedError();
    }
    return this.bridge.aliasHash(alias);
  }

  /**
   * Export the org secret key from the Worker for escrow/password-change.
   * The caller MUST zero the returned buffer immediately after use.
   */
  async getSecretKey(): Promise<Uint8Array | null> {
    if (!this.orgPublicKey) return null;

    const abuf = await this.bridge.exportOrgSecretKey();
    return new Uint8Array(abuf);
  }

  /**
   * Return a copy of the org public key (Curve25519, 32 bytes).
   * Synchronous, uses locally cached value. Returns null if not loaded.
   */
  getPublicKey(): Uint8Array | null {
    if (!this.orgPublicKey) return null;
    return new Uint8Array(this.orgPublicKey);
  }

  /** Whether the org key is currently loaded (for UI status indicators). */
  get isLoaded(): boolean {
    return this.orgPublicKey !== null;
  }

  /** Clear the local public key. Secret is zeroed by Worker's zeroAll. */
  zero(): void {
    this.orgPublicKey = null;
    this.loadCallback?.(false);
  }
}
