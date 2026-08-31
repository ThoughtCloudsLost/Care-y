import { ConflictError, ValidationError, NotFoundError } from "../errors.js";

/**
 * Typed error for the key rotation guard: rotation cannot proceed while
 * portal reply wraps are pending convergence.
 */
export class PendingPortalReplyWrapsError extends ValidationError {
  constructor() {
    super(
      "Cannot rotate org key while portal_reply_key_wraps rows exist. " +
        "Convert all pending portal reply wraps before rotating.",
    );
  }
}

/**
 * Thrown when createChannel detects a second active channel for the same
 * client via the partial unique index constraint. The route maps this
 * to FORBIDDEN with ErrorCode.PORTAL_CHANNEL_EXISTS.
 */
export class ChannelAlreadyActiveError extends ConflictError {
  constructor() {
    super("An active portal channel already exists for this client");
  }
}

/**
 * Thrown when account creation hits a unique-violation (23505) on
 * username_hash. The route maps this to ACCOUNT_USERNAME_TAKEN.
 */
export class UsernameTakenError extends ConflictError {
  constructor() {
    super("Username is already taken");
  }
}

/**
 * Thrown during upgrade or password change when a volunteer dual-copy
 * reply raced the swap: a portal_messages row on the old channel/key
 * has a created_at newer than the newest row the client re-encrypted.
 * The client must refetch, re-decrypt, and retry.
 */
export class StaleThreadError extends ConflictError {
  constructor() {
    super("Thread state changed during re-encryption; retry after refetch");
  }
}

/**
 * Reseed: the presented channelId does not match the client's active
 * channel. The route maps this to PORTAL_CHANNEL_MISMATCH.
 */
export class PortalChannelMismatchError extends ConflictError {
  constructor() {
    super(
      "Presented channel does not match the client's active portal channel",
    );
  }
}

/**
 * Reseed: a followup referenced in the payload fails server-side
 * validation (missing, wrong client, private, deleted, wrong type).
 * A compliant client never sends such rows.
 */
export class ReseedValidationError extends ValidationError {}

/**
 * Reseed blob convert: the attachment or recording row already has a
 * file_key_wrap, meaning it was already converted by a prior chunk.
 * The wrap path handles it on rerun; no blob conversion needed.
 */
export class ReseedAlreadyConvertedError extends ConflictError {
  constructor() {
    super("Row already has a file_key_wrap; use the wrap path instead");
  }
}

/**
 * Reseed blob convert: the attachment or recording row was not found
 * (soft-deleted or nonexistent). The route maps this to NOT_FOUND.
 */
export class ReseedRowNotFoundError extends NotFoundError {
  constructor(kind: "attachment" | "recording") {
    super(`${kind} not found or deleted`);
  }
}
