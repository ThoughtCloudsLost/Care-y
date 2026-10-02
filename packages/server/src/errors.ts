/**
 * Custom error types for CARE-Y server.
 *
 * All errors extend AppError, which provides a machine-readable `code`,
 * an HTTP status, and an `isOperational` flag (true = expected failure
 * like bad input; false = bug that needs investigation).
 *
 * Route handlers map these to tRPC error codes. No HTTP framework
 * references here so the errors stay usable in services and repositories.
 */

export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
  readonly isOperational: boolean;

  constructor(message: string, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.isOperational = isOperational;
  }
}

export class AuthError extends AppError {
  readonly code = "AUTH_ERROR" as const;
  readonly httpStatus = 401;
}

export class ForbiddenError extends AppError {
  readonly code = "FORBIDDEN" as const;
  readonly httpStatus = 403;
}

export class NotFoundError extends AppError {
  readonly code = "NOT_FOUND" as const;
  readonly httpStatus = 404;
}

export class ValidationError extends AppError {
  readonly code = "VALIDATION_ERROR" as const;
  readonly httpStatus = 400;
}

export class ConflictError extends AppError {
  readonly code = "CONFLICT" as const;
  readonly httpStatus = 409;
}

export class RateLimitError extends AppError {
  readonly code = "RATE_LIMITED" as const;
  readonly httpStatus = 429;
  readonly retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number) {
    super(message);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class EmailDeliveryError extends AppError {
  readonly code = "EMAIL_DELIVERY_ERROR" as const;
  readonly httpStatus: number;

  constructor(message: string, httpStatus = 503) {
    super(message);
    this.httpStatus = httpStatus;
  }
}

export class InternalError extends AppError {
  readonly code = "INTERNAL_ERROR" as const;
  readonly httpStatus = 500;

  constructor(message: string) {
    super(message, false); // non-operational: indicates a bug
  }
}

export class CryptoError extends AppError {
  readonly code = "CRYPTO_ERROR" as const;
  readonly httpStatus = 500;

  constructor(message: string) {
    super(message, false);
  }
}

/** Invalid or unsupported runtime configuration detected at startup. */
export class ConfigError extends AppError {
  readonly code = "CONFIG_ERROR" as const;
  readonly httpStatus = 500;

  constructor(message: string) {
    super(message, false); // non-operational: indicates a misconfiguration
  }
}

/** OPRF evaluation failed (process down, canary corruption, IPC timeout) */
export class OprfError extends AppError {
  readonly code = "OPRF_ERROR" as const;
  readonly httpStatus = 503;

  constructor(message: string) {
    super(message, false); // non-operational: indicates infrastructure failure
  }
}

/** Client must solve proof-of-work before retrying OPRF evaluation */
export class PowRequiredError extends AppError {
  readonly code = "POW_REQUIRED" as const;
  readonly httpStatus = 429;
  readonly challenge: string;
  readonly difficulty: number;

  constructor(challenge: string, difficulty: number) {
    super("Proof-of-work required");
    this.challenge = challenge;
    this.difficulty = difficulty;
  }
}

/** Volunteer key rotation failed (lock contention, re-wrap failure) */
export class KeyRotationError extends AppError {
  readonly code = "KEY_ROTATION_ERROR" as const;
  readonly httpStatus = 409; // conflict: rotation already in progress

  constructor(message: string) {
    super(message, false);
  }
}

/** Offboarding failed (FK constraint, missing user_keys row) */
export class OffboardingError extends AppError {
  readonly code = "OFFBOARDING_ERROR" as const;
  readonly httpStatus = 500;

  constructor(message: string) {
    super(message, false);
  }
}

/** Telephony provider operation failed (send SMS, initiate call, etc.) */
export class TelephonyError extends AppError {
  readonly code = "TELEPHONY_ERROR" as const;
  readonly httpStatus: number;

  constructor(message: string, httpStatus = 502) {
    super(message);
    this.httpStatus = httpStatus;
  }
}

/** Telephony provider configuration is invalid or missing */
export class TelephonyConfigError extends AppError {
  readonly code = "TELEPHONY_CONFIG_ERROR" as const;
  readonly httpStatus = 500;

  constructor(message: string) {
    super(message, false); // non-operational: config should be valid
  }
}

/** Secret encryption/decryption failed (key mismatch, tampered ciphertext) */
export class SecretCryptoError extends AppError {
  readonly code = "SECRET_CRYPTO_ERROR" as const;
  readonly httpStatus = 500;

  constructor(message: string) {
    super(message, false); // non-operational: indicates infrastructure failure
  }
}

/** MMS attachment failed validation (size, type, or magic bytes). */
export class AttachmentValidationError extends AppError {
  readonly code = "ATTACHMENT_VALIDATION_ERROR" as const;
  readonly httpStatus = 422;
  readonly reason: "size" | "content_type" | "magic_bytes";

  constructor(
    message: string,
    reason: "size" | "content_type" | "magic_bytes",
  ) {
    super(message);
    this.reason = reason;
  }
}

/** Ticket operation failed (close with unresolved deps, invalid state transition) */
export class TicketError extends AppError {
  readonly code = "TICKET_ERROR" as const;
  readonly httpStatus = 422;
}

/** Client merge operation failed (self-merge, already merged, undo locked) */
export class MergeError extends AppError {
  readonly code = "MERGE_ERROR" as const;
  readonly httpStatus = 422;
}

/** Notification delivery failed (SSE, email, SMS, push) */
export class NotificationError extends AppError {
  readonly code = "NOTIFICATION_ERROR" as const;
  readonly httpStatus = 500;
}

/** Search query failed (invalid filter, query error) */
export class SearchError extends AppError {
  readonly code = "SEARCH_ERROR" as const;
  readonly httpStatus = 400;
}

/** Audit log operation failed */
export class AuditError extends AppError {
  readonly code = "AUDIT_ERROR" as const;
  readonly httpStatus = 500;
}

/** Reply token operation failed (unknown token, revoked, mint failure) */
export class ReplyTokenError extends AppError {
  readonly code = "REPLY_TOKEN_ERROR" as const;
  readonly httpStatus: number;

  constructor(message: string, httpStatus = 400) {
    super(message);
    this.httpStatus = httpStatus;
  }
}

/** Inbound email ingest failed (missing ticket, encrypt/store failure).
 *  The SMTP receiver maps this to a 451 transient reply so the sending
 *  MTA retries; the message itself never appears in the error. */
export class InboundEmailError extends AppError {
  readonly code = "INBOUND_EMAIL_ERROR" as const;
  readonly httpStatus = 500;
}

/** A communication channel (SMS, email, voice, portal, share link) is disabled by org policy. */
export class ChannelDisabledError extends ForbiddenError {
  readonly channel: string;

  constructor(channel: string) {
    super(channel);
    this.channel = channel;
  }
}

/**
 * Second-factor guesses refused by the per-user limiter. Deliberately not a
 * RateLimitError: the error formatter forwards retryAfterSeconds for
 * RateLimitError causes, and whoever is guessing a second factor already
 * holds the password, so the wait window is withheld.
 */
export class SecondFactorLimitError extends AppError {
  readonly code = "SECOND_FACTOR_LIMITED" as const;
  readonly httpStatus = 429;
}

/**
 * Production secrets file refused at startup (missing, symlinked, loose
 * mode, unparseable, or a key also set in the environment). Messages name
 * keys only, never values, so printing the message is safe.
 */
export class SecretsFileError extends AppError {
  readonly code = "SECRETS_FILE_ERROR" as const;
  readonly httpStatus = 500;

  constructor(message: string) {
    super(message, false); // non-operational: indicates a misconfiguration
  }
}

/**
 * One step of an org erasure failed. Carries the step name and the class
 * name of the underlying error, nothing else. A cause's message can quote
 * a slug, a schema name or provider response text and is dropped here.
 * The org:erase CLI prints the two fields on its `deferred` line.
 */
export class ErasureStepError extends AppError {
  readonly code = "ERASURE_STEP_ERROR" as const;
  readonly httpStatus = 500;
  readonly step: string;
  readonly causeName: string;

  constructor(step: string, causeName: string) {
    super(`erasure step ${step} failed: ${causeName}`, false);
    this.step = step;
    this.causeName = causeName;
  }

  /**
   * Wraps a caught value, keeping only its class name.
   *
   * @param step - the erasure step that threw
   * @param cause - the caught value
   * @returns the step error; the cause itself is not retained
   */
  static fromCause(step: string, cause: unknown): ErasureStepError {
    return new ErasureStepError(step, errorClassName(cause));
  }
}

/** Class name of a caught value; non-Error values report their typeof. */
function errorClassName(err: unknown): string {
  return err instanceof Error ? err.constructor.name : typeof err;
}

/**
 * A donation provider call failed for a reason on the provider's side or
 * the network's: rate limited, a server error, no answer, or a body that
 * did not match its documented shape. The message is an error code, never
 * provider response text or a credential.
 */
export class DonationProviderError extends AppError {
  readonly code = "DONATION_PROVIDER_ERROR" as const;
  readonly httpStatus = 502;
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

export function extractErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
