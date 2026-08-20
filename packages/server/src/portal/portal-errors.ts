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
