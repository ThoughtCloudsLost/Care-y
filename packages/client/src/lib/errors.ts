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

/** Telephony service errors (device not registered, SDK failures). */
export class TelephonyError extends ClientError {
  constructor(message: string) {
    super(message);
    this.name = "TelephonyError";
  }
}

/** Thrown when a crypto operation is attempted before the Worker is initialized and keyed. */
export class WorkerNotReadyError extends ClientError {
  constructor() {
    super("Crypto worker is not ready. Please wait for initialization.");
    this.name = "WorkerNotReadyError";
  }
}

/** Thrown when a required tRPC router is not available on the client. */
export class RouterNotAvailableError extends ClientError {
  constructor(router: string) {
    super(`${router} router unavailable`);
    this.name = "RouterNotAvailableError";
  }
}

/** Narrows a possibly-undefined router to its non-nullable type, or throws. */
export function requireRouter<T>(
  router: T | undefined,
  name: string,
): NonNullable<T> {
  if (router === undefined || router === null) {
    throw new RouterNotAvailableError(name);
  }
  return router;
}

/** Relay endpoint returned a non-OK response. */
export class RelayError extends ClientError {
  readonly code: string;
  readonly status: number;
  constructor(code: string, status: number) {
    super(`Relay error: ${code} (${String(status)})`);
    this.name = "RelayError";
    this.code = code;
    this.status = status;
  }
}

/** Relay returned 429. Carries the Retry-After seconds for UI display. */
export class RateLimitError extends ClientError {
  readonly retryAfterSeconds: number;
  constructor(retryAfterSeconds: number) {
    super(`Rate limited. Retry after ${String(retryAfterSeconds)}s`);
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/** Branding image processing or encryption failures. */
export class BrandingError extends ClientError {
  constructor(message: string) {
    super(message);
    this.name = "BrandingError";
  }
}

/** Blob download HTTP failures (non-tRPC binary endpoints). */
export class BlobFetchError extends ClientError {
  readonly status: number;
  constructor(status: number) {
    super(`Blob fetch failed: ${String(status)}`);
    this.name = "BlobFetchError";
    this.status = status;
  }
}

/**
 * Channel session derivation failed for reasons other than wrong passphrase
 * (network outage, server error, etc.). Allows callers to distinguish
 * connectivity issues from authentication failures.
 */
export class ChannelSessionError extends ClientError {
  constructor(message: string) {
    super(message);
    this.name = "ChannelSessionError";
  }
}

/** Portal infrastructure unavailable (router, fragment, session, or bootstrap). */
export class PortalUnavailableError extends ClientError {
  constructor(message: string) {
    super(message);
    this.name = "PortalUnavailableError";
  }
}

/** Org key not available when a crypto operation requires it. */
export class OrgKeyNotLoadedError extends ClientError {
  constructor() {
    super("Org key not loaded");
    this.name = "OrgKeyNotLoadedError";
  }
}
