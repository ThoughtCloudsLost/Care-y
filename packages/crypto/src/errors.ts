/**
 * Crypto-specific error hierarchy.
 *
 * Self-contained: no dependency on packages/server (isomorphic library).
 * The server maps CryptoError subtypes to AppError at the tRPC boundary.
 */

export class CryptoError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "CryptoError";
    this.code = code;
  }
}

/** Decryption failed: wrong key, tampered ciphertext, or corrupted data */
export class DecryptionError extends CryptoError {
  constructor(message = "Decryption failed") {
    super("DECRYPTION_FAILED", message);
    this.name = "DecryptionError";
  }
}

/** Key material has wrong length, type, or format */
export class InvalidKeyError extends CryptoError {
  constructor(message = "Invalid key") {
    super("INVALID_KEY", message);
    this.name = "InvalidKeyError";
  }
}

/** Input data has wrong length, is truncated, or is malformed */
export class InvalidInputError extends CryptoError {
  constructor(message = "Invalid input") {
    super("INVALID_INPUT", message);
    this.name = "InvalidInputError";
  }
}

/** Sodium backend not initialized (getSodium() not called) */
export class SodiumNotReadyError extends CryptoError {
  constructor() {
    super(
      "SODIUM_NOT_READY",
      "Sodium backend not initialized. Call getSodium() first.",
    );
    this.name = "SodiumNotReadyError";
  }
}
