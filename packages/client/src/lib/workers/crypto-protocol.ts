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
  | "WORKER_ERROR"
  // Main-thread-generated: the bridge was destroyed or disconnected while
  // requests were pending or arriving. Expected during teardown; callers
  // treat it as quiet cancellation, not a failure worth logging.
  | "BRIDGE_DESTROYED";

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
  /** The ticket that owns the content: the first AAD component (ADR-053). */
  readonly ticketId: string;
  /**
   * Key-cache identity for the unwrapped key. Canonical ticket keys use
   * the ticket id; per-followup temp keys use an isolated key so they
   * never shadow the canonical entry.
   */
  readonly keyCacheId: string;
  /** ECIES ephemeral point, base64. */
  readonly ephemeralPoint: string;
  /** ECIES nonce, base64. */
  readonly nonce: string;
  /** ECIES-wrapped ticket key, base64. */
  readonly wrappedKey: string;
  /** Encrypted content (nonce || ciphertext), base64. */
  readonly ciphertext: string;
  /** Content slot the ciphertext was read from, e.g. "title" (ADR-053). */
  readonly slot: string;
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
  /** Encrypted blob data (nonce || ciphertext), raw bytes. */
  readonly ciphertext: ArrayBuffer;
  readonly blobKey: string;
  /**
   * Attachments/recordings row id: the stable AAD component (ADR-053).
   * The blobKey rotates when the server re-stores the rewrapped blob, so
   * the AAD binds the row id instead.
   */
  readonly blobId: string;
  readonly category: "attachment" | "recording";
}

export interface EncryptContentRequest {
  readonly type: "encryptContent";
  readonly id: number;
  readonly ticketId: string;
  /** UTF-8 plaintext to encrypt. Worker uses the cached tk for this ticketId. */
  readonly plaintext: string;
  /** Content slot the ciphertext will be stored in (ADR-053). */
  readonly slot: string;
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

export interface OrgDecryptRequest {
  readonly type: "orgDecrypt";
  readonly id: number;
  /** Sealed-box ciphertext, base64. */
  readonly ciphertext: string;
}

export interface OrgEncryptRequest {
  readonly type: "orgEncrypt";
  readonly id: number;
  /** UTF-8 plaintext to seal, base64. */
  readonly plaintext: string;
}

export interface OrgDecryptBatchRequest {
  readonly type: "orgDecryptBatch";
  readonly id: number;
  readonly items: readonly {
    readonly cacheKey: string;
    readonly ciphertext: string;
  }[];
}

export interface ExportOrgSecretKeyRequest {
  readonly type: "exportOrgSecretKey";
  readonly id: number;
}

export interface GetOrgPublicKeyRequest {
  readonly type: "getOrgPublicKey";
  readonly id: number;
}

export interface AliasHashRequest {
  readonly type: "aliasHash";
  readonly id: number;
  /** Raw alias string. The Worker normalizes internally before HMAC. */
  readonly alias: string;
}

export interface DecryptBlobRequest {
  readonly type: "decryptBlob";
  readonly id: number;
  readonly ticketId: string;
  /** Key-cache identity (see DecryptContentRequest.keyCacheId). */
  readonly keyCacheId: string;
  /** ECIES ephemeral point, base64. */
  readonly ephemeralPoint: string;
  /** ECIES nonce, base64. */
  readonly nonce: string;
  /** ECIES-wrapped ticket key, base64. */
  readonly wrappedKey: string;
  /** Encrypted binary blob (nonce || ciphertext), raw bytes. */
  readonly ciphertext: ArrayBuffer;
  /** Content slot, normally "blob:<rowId>" (ADR-053). */
  readonly slot: string;
}

export interface UnwrapTkRequest {
  readonly type: "unwrapTk";
  readonly id: number;
  readonly ticketId: string;
  /** Key-cache identity (see DecryptContentRequest.keyCacheId). */
  readonly keyCacheId: string;
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

/**
 * Seal a payload to the Worker's own volPublic for server-side storage
 * (e.g. recently-viewed history). The Worker prefixes a self-blob domain
 * tag before ECIES encryption so openSelfBlob can refuse envelopes from
 * other vol_public-wrapped domains (ticket key wraps, org key wraps).
 */
export interface SealSelfBlobRequest {
  readonly type: "sealSelfBlob";
  readonly id: number;
  /** Payload to seal, base64. */
  readonly data: string;
}

/**
 * Open a self-blob envelope with the Worker's volPrivate. Refuses any
 * plaintext that does not carry the self-blob domain tag: without this
 * check the operation would be a generic vol_private decrypt oracle able
 * to extract raw ticket keys to the main thread.
 */
export interface OpenSelfBlobRequest {
  readonly type: "openSelfBlob";
  readonly id: number;
  /** ECIES ephemeral point, base64. */
  readonly ephemeralPoint: string;
  /** ECIES nonce, base64. */
  readonly nonce: string;
  /** ECIES-wrapped self-blob payload, base64. */
  readonly wrappedPayload: string;
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
  /**
   * Client-generated ticket id (crypto.randomUUID). The ticket row does
   * not exist yet, but the AAD must bind the id the row will be created
   * with, so the client mints it and sends it with the create mutation
   * (ADR-053).
   */
  readonly ticketId: string;
  readonly fields: readonly { name: string; plaintext: string }[];
}

// ── Merge candidate detection ──────────────────────────────────────

/**
 * Batch-decrypt intake form responses and telephony phone numbers to
 * detect likely duplicate clients. The Worker decrypts each blob with
 * the corresponding tk (via the existing tkCache/wrap machinery),
 * normalizes contact values, and returns ONLY candidate pairs (client
 * ids + match kind). Matched contact values never leave the Worker.
 *
 * fieldRoleMap maps fieldId -> role so the Worker can extract
 * phone-contact / email-contact answers from custom-form responses
 * without pattern matching.
 */
export interface DetectMergeCandidatesRequest {
  readonly type: "detectMergeCandidates";
  readonly id: number;
  readonly clients: readonly MergeScanClient[];
}

/** Per-client data needed by the merge scan Worker op. */
export interface MergeScanClient {
  readonly clientId: string;
  /**
   * Telephony phone (already decrypted by the volunteer on the main
   * thread via org-tier phone display). Null for web-intake-only clients.
   */
  readonly decryptedPhone: string | null;
  /** Per-ticket intake response blobs for this client. */
  readonly intakeResponses: readonly MergeScanIntakeResponse[];
}

export interface MergeScanIntakeResponse {
  /** Ticket id that owns the response blob (AAD component). */
  readonly ticketId: string;
  /** ECIES key wrap for the ticket key. */
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly wrappedKey: string;
  /** Intake wrap (sealed box). Null when the ticket has a vol-wrap. */
  readonly intakeWrap: string | null;
  /** Encrypted form response blob (nonce || ciphertext), base64. */
  readonly encryptedResponse: string;
  /** Field-id-to-role map from the form definition. */
  readonly fieldRoles: ReadonlyMap<string, string>;
}

export interface MergeCandidate {
  readonly clientIdA: string;
  readonly clientIdB: string;
  readonly matchKind: "phone" | "email";
}

// ── SharedWorker lifecycle requests ─────────────────────────────────

/**
 * Bridge asks the SharedWorker for its current state on (re)connection.
 * The Worker replies with a ConnectResponse containing the current state
 * and public keys if keyed. Used after F5 to detect a still-keyed Worker
 * and skip the password prompt.
 */
/**
 * Unseal an intake wrap (crypto_box_seal_open with orgSecret) and cache
 * the recovered tk. When targets are provided, also produce ECIES wraps
 * for the conversion mutation.
 */
export interface UnwrapIntakeTkRequest {
  readonly type: "unwrapIntakeTk";
  readonly id: number;
  readonly ticketId: string;
  /** Base64-encoded 80-byte sealed box (crypto_box_seal output). */
  readonly sealedWrap: string;
  /** When present, the Worker also produces ECIES wraps for conversion. */
  readonly targets?: readonly { volunteerId: string; volPublic: string }[];
}

export interface ConnectRequest {
  readonly type: "connect";
  readonly id: number;
}

/**
 * Bridge tells the SharedWorker this port is closing (tab closing or
 * navigating away). The SharedWorker removes the port and starts the
 * zero-on-last-disconnect timer if no ports remain.
 */
export interface DisconnectRequest {
  readonly type: "disconnect";
  readonly id: number;
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
  | UnwrapIntakeTkRequest
  | WrapWithVolPublicRequest
  | SealSelfBlobRequest
  | OpenSelfBlobRequest
  | RewrapTkRequest
  | CreateTicketKeyRequest
  | OrgDecryptRequest
  | OrgEncryptRequest
  | OrgDecryptBatchRequest
  | ExportOrgSecretKeyRequest
  | GetOrgPublicKeyRequest
  | AliasHashRequest
  | DetectMergeCandidatesRequest
  | ConnectRequest
  | DisconnectRequest;

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
  /** Org public key (base64). Worker retains the secret for XSS isolation. */
  readonly orgPublicKey: string;
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

export interface SealSelfBlobResponse extends SuccessBase {
  readonly type: "sealSelfBlob";
  /** ECIES ephemeral point, base64. */
  readonly ephemeralPoint: string;
  /** ECIES nonce, base64. */
  readonly nonce: string;
  /** ECIES-wrapped self-blob payload (domain tag inside), base64. */
  readonly wrappedPayload: string;
}

export interface OpenSelfBlobResponse extends SuccessBase {
  readonly type: "openSelfBlob";
  /** Unsealed payload with the domain tag stripped, base64. */
  readonly data: string;
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

export interface OrgDecryptResponse extends SuccessBase {
  readonly type: "orgDecrypt";
  /** Raw decrypted bytes, base64-encoded (binary-safe). */
  readonly plaintext: string;
}

export interface OrgEncryptResponse extends SuccessBase {
  readonly type: "orgEncrypt";
  /** Sealed-box ciphertext, base64. */
  readonly ciphertext: string;
}

export interface OrgDecryptBatchResponse extends SuccessBase {
  readonly type: "orgDecryptBatch";
  readonly results: readonly {
    readonly cacheKey: string;
    /** null on individual item failure (wrong key, corrupted ciphertext). */
    readonly plaintext: string | null;
  }[];
}

export interface ExportOrgSecretKeyResponse extends SuccessBase {
  readonly type: "exportOrgSecretKey";
  /** Raw org secret key bytes. Transferable: neutered in Worker after send. */
  readonly orgSecretKey: ArrayBuffer;
}

export interface GetOrgPublicKeyResponse extends SuccessBase {
  readonly type: "getOrgPublicKey";
  /** Org public key, base64. */
  readonly orgPublicKey: string;
}

export interface AliasHashResponse extends SuccessBase {
  readonly type: "aliasHash";
  /** Lowercase hex HMAC-SHA512 of the normalized alias. */
  readonly hash: string;
}

export interface UnwrapIntakeTkResponse extends SuccessBase {
  readonly type: "unwrapIntakeTk";
  /** ECIES wraps for conversion, present only when targets were provided. */
  readonly wraps?: readonly {
    readonly volunteerId: string;
    readonly ephemeralPoint: string;
    readonly nonce: string;
    readonly wrappedKey: string;
  }[];
}

export interface DetectMergeCandidatesResponse extends SuccessBase {
  readonly type: "detectMergeCandidates";
  /** Candidate pairs. Contains only client ids and match kind, never contact values. */
  readonly candidates: readonly MergeCandidate[];
}

// ── SharedWorker lifecycle responses ────────────────────────────────

export type SharedWorkerState = "READY" | "KEYED";

export interface ConnectResponse extends SuccessBase {
  readonly type: "connect";
  readonly state: SharedWorkerState;
  /** Volunteer public key, base64. Present only when state is KEYED. */
  readonly volPublic?: string;
  /** Org public key, base64. Present only when org key is loaded. */
  readonly orgPublicKey?: string;
}

export interface DisconnectResponse extends SuccessBase {
  readonly type: "disconnect";
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
  | UnwrapIntakeTkResponse
  | DetectMergeCandidatesResponse
  | WrapWithVolPublicResponse
  | SealSelfBlobResponse
  | OpenSelfBlobResponse
  | RewrapTkResponse
  | EvictTkResponse
  | ZeroAllResponse
  | CreateTicketKeyResponse
  | OrgDecryptResponse
  | OrgEncryptResponse
  | OrgDecryptBatchResponse
  | ExportOrgSecretKeyResponse
  | GetOrgPublicKeyResponse
  | AliasHashResponse
  | ConnectResponse
  | DisconnectResponse;

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

/**
 * SharedWorker broadcasts this to all connected ports when the Worker
 * state changes (another tab logged out, zeroed keys, or a new tab
 * completed key derivation). Ports use this to redirect to login or
 * update their local state.
 */
export interface StateChangeEvent {
  readonly kind: "stateChange";
  readonly state: SharedWorkerState;
}

export type WorkerEvent = RewrapEvent | StateChangeEvent;

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
