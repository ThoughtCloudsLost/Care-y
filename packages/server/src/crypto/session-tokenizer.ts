/**
 * HMAC-SHA256 tokenizer for session drift detection.
 *
 * Produces deterministic tokens from IP addresses and user agents.
 * The server compares tokens to detect drift without storing or
 * decrypting the raw values. The HMAC key is derived from OPS_SECRETS_KEY
 * via HKDF with info "care-y-session-token-v1".
 */

import { hkdfSync, createHmac } from "node:crypto";
import { CryptoError } from "../errors.js";

export interface SessionTokenizer {
  /** Produces a deterministic HMAC-SHA256 hex token for comparison. */
  tokenize(value: string): string;
}

const SESSION_TOKEN_INFO = "care-y-session-token-v1";
const REQUIRED_KEY_LENGTH = 32;

/** Derives the session HMAC key from OPS_SECRETS_KEY via HKDF. */
export function deriveSessionHmacKey(opsSecretsKey: Buffer): Buffer {
  if (opsSecretsKey.length !== REQUIRED_KEY_LENGTH) {
    throw new CryptoError(
      `OPS_SECRETS_KEY must be ${String(REQUIRED_KEY_LENGTH)} bytes, got ${String(opsSecretsKey.length)}`,
    );
  }
  return Buffer.from(
    hkdfSync("sha256", opsSecretsKey, Buffer.alloc(0), SESSION_TOKEN_INFO, 32),
  );
}

/** Creates a SessionTokenizer from the derived HMAC key. */
export function createSessionTokenizer(hmacKey: Buffer): SessionTokenizer {
  if (hmacKey.length !== REQUIRED_KEY_LENGTH) {
    throw new CryptoError(
      `Session HMAC key must be ${String(REQUIRED_KEY_LENGTH)} bytes, got ${String(hmacKey.length)}`,
    );
  }

  return {
    tokenize(value: string): string {
      return createHmac("sha256", hmacKey).update(value).digest("hex");
    },
  };
}
