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

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

export function extractErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
