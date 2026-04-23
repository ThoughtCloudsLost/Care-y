/**
 * Typed message protocol for the main-thread/Worker crypto boundary.
 *
 * Every request carries a monotonic `id` so the bridge can match responses
 * to pending promises. The Worker never initiates communication; it only
 * responds. PII-tier key material (masterKey, volPrivate, tk) never appears
 * in any response type. Only public values (volPublic) and operation results
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

export type WorkerRequest =
  | InitRequest
  | Argon2idRequest
  | OprfBlindRequest
  | DeriveKeysRequest
  | DecryptContentRequest
  | EncryptContentRequest
  | DecryptBlobRequest
  | EvictTkRequest
  | ZeroAllRequest
  | GetVolPublicRequest
  | UnwrapOrgKeyRequest
  | UnwrapTkRequest
  | WrapWithVolPublicRequest
  | RewrapTkRequest;

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

export type WorkerSuccessResponse =
  | InitResponse
  | Argon2idResponse
  | OprfBlindResponse
  | DeriveKeysResponse
  | DecryptContentResponse
  | EncryptContentResponse
  | DecryptBlobResponse
  | GetVolPublicResponse
  | UnwrapOrgKeyResponse
  | UnwrapTkResponse
  | WrapWithVolPublicResponse
  | RewrapTkResponse
  | EvictTkResponse
  | ZeroAllResponse;

export type WorkerResponse = WorkerSuccessResponse | ErrorResponse;

// ── Type-level helpers ───────────────────────────────────────────────

/**
 * Extract the success response type for a given request type discriminant.
 * Used by the bridge to narrow the response after matching on `type`.
 */
export type ResponseForRequest<T extends WorkerRequestType> = Extract<
  WorkerSuccessResponse,
  { readonly type: T }
>;
