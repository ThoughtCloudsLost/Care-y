/**
 * Client-side error types.
 *
 * Mirrors the server's error hierarchy pattern. Each error class has a
 * distinct name for reliable instanceof checks and structured error handling.
 */

/** Base class for all client-side errors. */
export class ClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientError";
  }
}

/** WebAuthn API validation failures (bad input, missing public key, unsupported browser). */
export class WebauthnError extends ClientError {
  constructor(message: string) {
    super(message);
    this.name = "WebauthnError";
  }
}

/** Crypto Worker test infrastructure failures (handler not registered, no response). */
export class CryptoWorkerTestError extends ClientError {
  constructor(message: string) {
    super(message);
    this.name = "CryptoWorkerTestError";
  }
}
