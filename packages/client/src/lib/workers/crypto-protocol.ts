/**
 * Typed message protocol for the main-thread/Worker crypto boundary.
 *
 * Two message channels share the same postMessage transport:
 *
 *  1. Request-response ("type" discriminant, has "id"):
 *     Main thread sends a WorkerRequest with a monotonic id. The Worker
 *     responds with a WorkerResponse carrying the same id. The bridge
 *     matches responses to pending promises by id.
 *
 *  2. Worker-initiated events ("kind" discriminant, no id):
 *     The Worker posts WorkerEvent messages (e.g., RewrapEvent) when it
 *     completes a background operation that the main thread should act on.
 *     The main thread posts MainThreadEvent messages back (e.g.,
 *     RewrapResultEvent) to report the outcome. These are fire-and-forget
 *     from the Worker's perspective: no promise, no id matching.
 *
 * The bridge dispatches on "kind" vs "type" at the top of onmessage.
 *
 * PII-tier key material (masterKey, volPrivate, tk) never appears in any
 * response or event. Only public values (volPublic) and operation results
 * (plaintext, ciphertext) cross back to the main thread.
 *
 * Fields marked "Transferable" are passed in the postMessage transfer list.
 * After transfer the main-thread ArrayBuffer is neutered (zero-length).
 */

// ── Error codes ──────────────────────────────────────────────────────

export type WorkerErrorCode =
  | "NOT_READY"
  | "INVALID_STATE"
  | "DECRYPT_FAILED"
  | "ENCRYPT_FAILED"
  | "TK_NOT_CACHED"
  | "REWRAP_FAILED"
  | "UNWRAP_FAILED"
  | "WORKER_ERROR";

// ── Request types (main thread -> Worker) ────────────────────────────

export interface InitRequest {
  readonly type: "init";
  readonly id: number;
}

export interface Argon2idRequest {
  readonly type: "argon2id";
  readonly id: number;
  /** UTF-8 encoded password. Transferable: neutered on main thread after send. */
  readonly password: ArrayBuffer;
  /** Argon2id salt. Transferable: neutered on main thread after send. */
  readonly salt: ArrayBuffer;
}

export interface OprfBlindRequest {
  readonly type: "oprfBlind";
  readonly id: number;
  // Worker already holds `stretched` from the argon2id step.
  // Runs oprfBlind(stretched), holds blindState internally, returns blindedElement.
}

export interface DeriveKeysRequest {
  readonly type: "deriveKeys";
  readonly id: number;
  /** OPRF server evaluation result. Transferable: neutered on main thread after send. */
  readonly evaluated: ArrayBuffer;
}

export interface DecryptContentRequest {
  readonly type: "decryptContent";
  readonly id: number;
  readonly ticketId: string;
  /** ECIES ephemeral point, base64. */
  readonly ephemeralPoint: string;
  /** ECIES nonce, base64. */
  readonly nonce: string;
  /** ECIES-wrapped ticket key, base64. */
  readonly wrappedKey: string;
  /** Encrypted content (nonce || ciphertext), base64. */
  readonly ciphertext: string;
}

/**
 * Decrypt follow-up content encrypted with tk_temp, then re-encrypt with
 * the ticket's canonical tk and post a RewrapEvent to the main thread.
 *
 * The Worker caches tk_temp for this follow-up so the main thread can
 * later send RewrapBlobRequests for the same follow-up. tk_temp is evicted
 * when RewrapResultEvent arrives (signaling all re-wrap is complete).
 */
export interface DecryptAndRewrapRequest {
  readonly type: "decryptAndRewrap";
  readonly id: number;
  readonly followUpId: string;
  /** Ticket that owns the canonical tk (already cached from a prior unwrap). */
  readonly ticketId: string;
  /** ECIES ephemeral point for tk_temp, base64. */
  readonly ephemeralPoint: string;
  /** ECIES nonce for tk_temp, base64. */
  readonly nonce: string;
  /** ECIES-wrapped tk_temp, base64. */
  readonly wrappedKey: string;
  /** Encrypted content (nonce || ciphertext), base64. */
  readonly ciphertext: string;
}

/**
 * Re-encrypt a single blob from tk_temp to the ticket's canonical tk.
 * The main thread pre-fetches the encrypted blob via tRPC, sends it here.
 * The Worker decrypts with the cached tk_temp (from a prior decryptAndRewrap),
 * re-encrypts with canonical tk, and returns the result.
 */
export interface RewrapBlobRequest {
  readonly type: "rewrapBlob";
  readonly id: number;
  readonly followUpId: string;
  readonly ticketId: string;
  /** Encrypted blob data (nonce || ciphertext), base64. */
  readonly ciphertext: string;
  readonly blobKey: string;
  readonly category: "attachment" | "recording";
}

export interface EncryptContentRequest {
  readonly type: "encryptContent";
  readonly id: number;
  readonly ticketId: string;
  /** UTF-8 plaintext to encrypt. Worker uses the cached tk for this ticketId. */
  readonly plaintext: string;
}

export interface EvictTkRequest {
  readonly type: "evictTk";
  readonly id: number;
  readonly ticketId: string;
}

export interface ZeroAllRequest {
  readonly type: "zeroAll";
  readonly id: number;
}

export interface GetVolPublicRequest {
  readonly type: "getVolPublic";
  readonly id: number;
}

export interface UnwrapOrgKeyRequest {
  readonly type: "unwrapOrgKey";
  readonly id: number;
  /** ECIES-wrapped org private key, base64. */
  readonly wrappedOrgKey: string;
  /** ECIES ephemeral point, base64. */
  readonly ephemeralPoint: string;
  /** ECIES nonce, base64. */
  readonly nonce: string;
}

export interface DecryptBlobRequest {
  readonly type: "decryptBlob";
  readonly id: number;
  readonly ticketId: string;
  /** ECIES ephemeral point, base64. */
  readonly ephemeralPoint: string;
  /** ECIES nonce, base64. */
  readonly nonce: string;
  /** ECIES-wrapped ticket key, base64. */
  readonly wrappedKey: string;
  /** Encrypted binary blob (nonce || ciphertext), base64. */
  readonly ciphertext: string;
}

export interface UnwrapTkRequest {
  readonly type: "unwrapTk";
  readonly id: number;
  readonly ticketId: string;
  /** ECIES ephemeral point, base64. */
  readonly ephemeralPoint: string;
  /** ECIES nonce, base64. */
  readonly nonce: string;
  /** ECIES-wrapped ticket key, base64. */
  readonly wrappedKey: string;
}

export interface WrapWithVolPublicRequest {
  readonly type: "wrapWithVolPublic";
  readonly id: number;
  /** Data to ECIES-encrypt with the Worker's volPublic, base64. */
  readonly data: string;
}

export interface RewrapTkRequest {
  readonly type: "rewrapTk";
  readonly id: number;
  readonly ticketId: string;
  /** New volunteer's ristretto255 public key, base64. */
  readonly recipientVolPublic: string;
}

export interface CreateTicketKeyRequest {
  readonly type: "createTicketKey";
  readonly id: number;
  readonly fields: readonly { name: string; plaintext: string }[];
}

export type WorkerRequest =
  | InitRequest
  | Argon2idRequest
  | OprfBlindRequest
  | DeriveKeysRequest
  | DecryptContentRequest
  | DecryptAndRewrapRequest
  | RewrapBlobRequest
  | EncryptContentRequest
  | DecryptBlobRequest
  | EvictTkRequest
  | ZeroAllRequest
  | GetVolPublicRequest
  | UnwrapOrgKeyRequest
  | UnwrapTkRequest
  | WrapWithVolPublicRequest
  | RewrapTkRequest
  | CreateTicketKeyRequest;

/** All valid request type discriminants. */
export type WorkerRequestType = WorkerRequest["type"];

// ── Response types (Worker -> main thread) ───────────────────────────

interface SuccessBase {
  readonly id: number;
  readonly ok: true;
}

export interface ErrorResponse {
  readonly id: number;
  readonly ok: false;
  /** Echoes the request type for error dispatch on the bridge side. */
  readonly type: WorkerRequestType;
  readonly error: string;
  readonly code: WorkerErrorCode;
}

export interface InitResponse extends SuccessBase {
  readonly type: "init";
}

export interface Argon2idResponse extends SuccessBase {
  readonly type: "argon2id";
  // No data returned. `stretched` is held internally by the Worker.
}

export interface OprfBlindResponse extends SuccessBase {
  readonly type: "oprfBlind";
  /** Blinded element, base64. Public value sent to the OPRF server. */
  readonly blindedElement: string;
}

export interface DeriveKeysResponse extends SuccessBase {
  readonly type: "deriveKeys";
  /** Volunteer public key, base64. Safe to return (stored on server). */
  readonly volPublic: string;
}

export interface DecryptContentResponse extends SuccessBase {
  readonly type: "decryptContent";
  /** UTF-8 decrypted content. */
  readonly plaintext: string;
}

export interface DecryptAndRewrapResponse extends SuccessBase {
  readonly type: "decryptAndRewrap";
  /** UTF-8 decrypted content (displayed to the volunteer). */
  readonly plaintext: string;
}

export interface RewrapBlobResponse extends SuccessBase {
  readonly type: "rewrapBlob";
  /** Re-encrypted blob data (encrypted with canonical tk), base64. */
  readonly encryptedData: string;
  readonly blobKey: string;
  readonly category: "attachment" | "recording";
}

export interface EncryptContentResponse extends SuccessBase {
  readonly type: "encryptContent";
  /** Encrypted content (nonce || ciphertext), base64. */
  readonly ciphertext: string;
}

export interface GetVolPublicResponse extends SuccessBase {
  readonly type: "getVolPublic";
  /** Volunteer public key, base64. */
  readonly volPublic: string;
}

export interface UnwrapOrgKeyResponse extends SuccessBase {
  readonly type: "unwrapOrgKey";
  /** Unwrapped org key (non-PII tier). Transferable to main thread for the org-key module. */
  // care-y-ignore-next-line no-org-private-key-server -- Worker-to-main-thread transfer, never sent to server
  readonly orgPrivateKey: ArrayBuffer;
}

export interface DecryptBlobResponse extends SuccessBase {
  readonly type: "decryptBlob";
  /** Decrypted binary data. Transferable: neutered in Worker after send. */
  readonly data: ArrayBuffer;
}

export interface UnwrapTkResponse extends SuccessBase {
  readonly type: "unwrapTk";
}

export interface WrapWithVolPublicResponse extends SuccessBase {
  readonly type: "wrapWithVolPublic";
  /** ECIES ephemeral point, base64. */
  readonly ephemeralPoint: string;
  /** ECIES nonce, base64. */
  readonly nonce: string;
  /** ECIES-wrapped data, base64. */
  readonly wrappedKey: string;
}

export interface RewrapTkResponse extends SuccessBase {
  readonly type: "rewrapTk";
  /** ECIES ephemeral point for new wrapping, base64. */
  readonly ephemeralPoint: string;
  /** ECIES nonce for new wrapping, base64. */
  readonly nonce: string;
  /** ECIES-wrapped ticket key for recipient, base64. */
  readonly wrappedKey: string;
}

export interface EvictTkResponse extends SuccessBase {
  readonly type: "evictTk";
}

export interface ZeroAllResponse extends SuccessBase {
  readonly type: "zeroAll";
}

export interface CreateTicketKeyResponse extends SuccessBase {
  readonly type: "createTicketKey";
  readonly encryptedFields: readonly {
    name: string;
    ciphertext: string;
  }[];
  readonly keyWrap: {
    ephemeralPoint: string;
    nonce: string;
    wrappedKey: string;
  };
  readonly keyGeneration: string;
}

export type WorkerSuccessResponse =
  | InitResponse
  | Argon2idResponse
  | OprfBlindResponse
  | DeriveKeysResponse
  | DecryptContentResponse
  | DecryptAndRewrapResponse
  | RewrapBlobResponse
  | EncryptContentResponse
  | DecryptBlobResponse
  | GetVolPublicResponse
  | UnwrapOrgKeyResponse
  | UnwrapTkResponse
  | WrapWithVolPublicResponse
  | RewrapTkResponse
  | EvictTkResponse
  | ZeroAllResponse
  | CreateTicketKeyResponse;

export type WorkerResponse = WorkerSuccessResponse | ErrorResponse;

// ── Worker-initiated events (Worker -> main, not tied to a request) ──

/**
 * Worker posts this after decrypting follow-up content with tk_temp and
 * re-encrypting with the ticket's canonical tk. The main thread should
 * call the rewrapFollowUp tRPC mutation with the ciphertext, then post
 * a RewrapResultEvent back.
 */
export interface RewrapEvent {
  readonly kind: "rewrap";
  readonly followUpId: string;
  readonly ticketId: string;
  readonly encryptedContent: string;
}

export type WorkerEvent = RewrapEvent;

/**
 * Main thread posts this back to the Worker after the tRPC rewrap
 * mutation completes (or fails).
 */
export interface RewrapResultEvent {
  readonly kind: "rewrap-result";
  readonly followUpId: string;
  readonly success: boolean;
}

export type MainThreadEvent = RewrapResultEvent;

// ── Type-level helpers ───────────────────────────────────────────────

/**
 * Extract the success response type for a given request type discriminant.
 * Used by the bridge to narrow the response after matching on `type`.
 */
export type ResponseForRequest<T extends WorkerRequestType> = Extract<
  WorkerSuccessResponse,
  { readonly type: T }
>;
