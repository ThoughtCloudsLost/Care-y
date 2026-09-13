import { ConflictError, ValidationError } from "../errors.js";

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
 * client via the partial unique index constraint. The caller (route)
 * maps this to a tRPC CONFLICT response.
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
