/**
 * Typed message protocol for the main-thread/Worker portal crypto boundary.
 *
 * Two message channels share the same postMessage transport:
 *
 *  1. Request-response ("type" discriminant, has "id"):
 *     Main thread sends a PortalWorkerRequest with a monotonic id.
 *     The Worker responds with a PortalWorkerResponse carrying the
 *     same id. The bridge matches responses to pending promises by id.
 *
 *  2. Worker-initiated events ("kind" discriminant, no id):
 *     The Worker posts PortalWorkerEvent messages (e.g., DerivationProgress)
 *     when Argon2id completes a phase. The bridge dispatches these to a
 *     registered handler.
 *
 * Key material (seed, blindState, clientPrivate) never appears in any
 * response or event. Only public values (channelId, clientPublic) and
 * operation results (plaintext, ciphertext) cross back to the main thread.
 *
 * Fields marked "Transferable" are passed in the postMessage transfer list.
 * After transfer the main-thread ArrayBuffer is neutered (zero-length).
 */

// -- Error codes --------------------------------------------------------------

export type PortalWorkerErrorCode =
  | "NOT_READY"
  | "INVALID_STATE"
  | "DECRYPT_FAILED"
  | "ENCRYPT_FAILED"
  | "KEY_CHECK_FAILED"
  | "WORKER_ERROR"
  | "BRIDGE_DESTROYED";

// -- Request types (main thread -> Worker) ------------------------------------

export interface PortalInitRequest {
  readonly type: "init";
  readonly id: number;
}

/**
 * Parse the seed, derive channelId and auth, run portalOprfInput + oprfBlind.
 * The Worker holds the seed and blind state internally.
 * Passphrase is optional (omit for plain links).
 */
export interface ChannelSessionStartRequest {
  readonly type: "channelSessionStart";
  readonly id: number;
  /** Portal seed bytes. Transferable: neutered on main thread after send. */
  readonly seed: ArrayBuffer;
  /** Spoken passphrase (omit for plain links). */
  readonly passphrase?: string;
}

/**
 * Re-run the channel derivation from the Worker-held seed with a new
 * passphrase. Valid after a completed round whose key check failed, or
 * after an evaluate that never finished. The seed never returns to the
 * main thread; retrying a mistyped passphrase flows through here.
 */
export interface ChannelSessionRestartRequest {
  readonly type: "channelSessionRestart";
  readonly id: number;
  /** Spoken passphrase (omit for plain links). */
  readonly passphrase?: string;
}

/**
 * Finalize the OPRF round and derive the portal keypair.
 * The tRPC evaluate hop runs on the main thread between start and finish.
 */
export interface ChannelSessionFinishRequest {
  readonly type: "channelSessionFinish";
  readonly id: number;
  /** OPRF server evaluation result, base64url. */
  readonly evaluated: string;
}

/**
 * Verify a derived keypair against the server-stored PORTAL_KEY_CHECK.
 * Returns { ok: true/false }.
 */
export interface VerifyKeyCheckRequest {
  readonly type: "verifyKeyCheck";
  readonly id: number;
  /** ECIES ephemeral point, base64url. */
  readonly ephemeralPoint: string;
  /** ECIES nonce, base64url. */
  readonly nonce: string;
  /** ECIES ciphertext, base64url. */
  readonly ciphertext: string;
}

/**
 * Decrypt a single portal message (ECIES triple encrypted to clientPublic).
 */
export interface DecryptMessageRequest {
  readonly type: "decryptMessage";
  readonly id: number;
  /** ECIES ephemeral point, base64url. */
  readonly ephemeralPoint: string;
  /** ECIES nonce, base64url. */
  readonly nonce: string;
  /** ECIES ciphertext, base64url. */
  readonly ciphertext: string;
}

/**
 * Encrypt a client reply with attachments:
 *   1. Generate tk_temp, encrypt content with AAD binding
 *   2. Seal tk_temp to org public key
 *   3. ECIES self-copy to clientPublic
 *   4. Encrypt each attachment under a file key wrapped by tk_temp
 *   5. Zero tk_temp in finally
 */
export interface EncryptReplyRequest {
  readonly type: "encryptReply";
  readonly id: number;
  /** UTF-8 plaintext of the reply. */
  readonly text: string;
  /** Org public key, base64url. */
  readonly orgPublicKey: string;
  readonly ticketId: string;
  readonly followUpId: string;
  readonly keyGeneration: string;
  /** Attachments to encrypt alongside the reply. */
  readonly attachments: readonly PortalAttachmentInput[];
}

/** Input shape for an attachment riding a reply. */
export interface PortalAttachmentInput {
  readonly attachmentId: string;
  readonly filename: string;
  readonly contentType: string;
  /** Raw file bytes. Transferable: neutered on main thread after send. */
  readonly data: ArrayBuffer;
}

/**
 * Decrypt an attachment key from the client's self-copy ECIES wrap.
 */
export interface DecryptAttachmentKeyRequest {
  readonly type: "decryptAttachmentKey";
  readonly id: number;
  /** ECIES ephemeral point, base64url. */
  readonly ephemeralPoint: string;
  /** ECIES nonce, base64url. */
  readonly nonce: string;
  /** ECIES ciphertext, base64url. */
  readonly ciphertext: string;
}

/**
 * Decrypt an attachment blob with a file key.
 * The file key is zeroed after use.
 */
export interface DecryptAttachmentBlobRequest {
  readonly type: "decryptAttachmentBlob";
  readonly id: number;
  /** Encrypted blob bytes. Transferable: neutered on main thread after send. */
  readonly ciphertext: ArrayBuffer;
  /** File key, base64url. Zeroed inside the Worker after one use. */
  readonly fileKey: string;
  readonly ticketId: string;
  readonly attachmentId: string;
}

// -- Account session requests -------------------------------------------------

/**
 * Account login start: Argon2id stretch + OPRF blind.
 * Emits DerivationProgressEvent during Argon2id.
 * The tRPC evaluate hop runs on the main thread between start and finish.
 */
export interface AccountSessionStartRequest {
  readonly type: "accountSessionStart";
  readonly id: number;
  /** UTF-8 password. Transferable: neutered on main thread after send. */
  readonly password: ArrayBuffer;
  /** Argon2id salt, base64url. */
  readonly salt: string;
}

/**
 * Account login finish: OPRF finalize + deriveClientAccountKeys.
 * Returns clientPublic and authToken for the login mutation.
 */
export interface AccountSessionFinishRequest {
  readonly type: "accountSessionFinish";
  readonly id: number;
  /** OPRF server evaluation result, base64url. */
  readonly evaluated: string;
}

/**
 * Zero every held secret and return to uninitialized-session state.
 * Wired to quick exit and pagehide.
 */
export interface PortalZeroAllRequest {
  readonly type: "zeroAll";
  readonly id: number;
}

export type PortalWorkerRequest =
  | PortalInitRequest
  | ChannelSessionStartRequest
  | ChannelSessionRestartRequest
  | ChannelSessionFinishRequest
  | VerifyKeyCheckRequest
  | DecryptMessageRequest
  | EncryptReplyRequest
  | DecryptAttachmentKeyRequest
  | DecryptAttachmentBlobRequest
  | AccountSessionStartRequest
  | AccountSessionFinishRequest
  | PortalZeroAllRequest;

/** All valid portal request type discriminants. */
export type PortalWorkerRequestType = PortalWorkerRequest["type"];

// -- Response types (Worker -> main thread) ------------------------------------

interface PortalSuccessBase {
  readonly id: number;
  readonly ok: true;
}

export interface PortalErrorResponse {
  readonly id: number;
  readonly ok: false;
  readonly type: PortalWorkerRequestType;
  readonly error: string;
  readonly code: PortalWorkerErrorCode;
}

export interface PortalInitResponse extends PortalSuccessBase {
  readonly type: "init";
}

export interface ChannelSessionStartResponse extends PortalSuccessBase {
  readonly type: "channelSessionStart";
  /** Hex channel identifier derived from the seed. */
  readonly channelId: string;
  /** Base64url channel auth token. */
  readonly auth: string;
  /** Base64url blinded element for the OPRF server. */
  readonly blindedElement: string;
}

export interface ChannelSessionRestartResponse extends PortalSuccessBase {
  readonly type: "channelSessionRestart";
  /** Hex channel identifier derived from the held seed. */
  readonly channelId: string;
  /** Base64url channel auth token. */
  readonly auth: string;
  /** Base64url blinded element for the OPRF server. */
  readonly blindedElement: string;
}

export interface ChannelSessionFinishResponse extends PortalSuccessBase {
  readonly type: "channelSessionFinish";
  /** Base64url ristretto255 client public key. */
  readonly clientPublic: string;
}

export interface VerifyKeyCheckResponse extends PortalSuccessBase {
  readonly type: "verifyKeyCheck";
  /** Whether the key check decrypted to PORTAL_KEY_CHECK. */
  readonly ok: true;
  readonly passed: boolean;
}

export interface DecryptMessageResponse extends PortalSuccessBase {
  readonly type: "decryptMessage";
  /** UTF-8 decrypted message content. */
  readonly plaintext: string;
}

/** Wire-ready ECIES triple. */
export interface EciesTripleWireResponse {
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly ciphertext: string;
}

/** Wire-ready encrypted attachment payload. */
export interface PortalAttachmentPayloadResponse {
  readonly attachmentId: string;
  /** Base64url encrypted blob. */
  readonly blob: string;
  readonly sizeBytes: number;
  readonly contentType: string;
  /** Base64url file key wrap (under tk_temp). */
  readonly fileKeyWrap: string;
  /** Base64url encrypted filename (under tk_temp). */
  readonly encryptedFilename: string;
  readonly selfCopy: EciesTripleWireResponse;
}

export interface EncryptReplyResponse extends PortalSuccessBase {
  readonly type: "encryptReply";
  /** Base64url encrypted content. */
  readonly encryptedContent: string;
  /** Base64url sealed tk_temp (to org public key). */
  readonly wrappedTkTemp: string;
  readonly selfCopy: EciesTripleWireResponse;
  readonly attachments: readonly PortalAttachmentPayloadResponse[];
}

export interface DecryptAttachmentKeyResponse extends PortalSuccessBase {
  readonly type: "decryptAttachmentKey";
  /** Base64url raw file key bytes. Caller passes to decryptAttachmentBlob. */
  readonly fileKey: string;
  /** Original filename recovered from the payload. */
  readonly filename: string;
}

export interface DecryptAttachmentBlobResponse extends PortalSuccessBase {
  readonly type: "decryptAttachmentBlob";
  /** Decrypted file bytes. Transferable: neutered in Worker after send. */
  readonly data: ArrayBuffer;
}

export interface AccountSessionStartResponse extends PortalSuccessBase {
  readonly type: "accountSessionStart";
  /** Base64url blinded element for the OPRF server. */
  readonly blindedElement: string;
}

export interface AccountSessionFinishResponse extends PortalSuccessBase {
  readonly type: "accountSessionFinish";
  /** Base64url ristretto255 client public key. */
  readonly clientPublic: string;
  /** Base64url auth token for the login mutation. */
  readonly authToken: string;
}

export interface PortalZeroAllResponse extends PortalSuccessBase {
  readonly type: "zeroAll";
}

export type PortalWorkerSuccessResponse =
  | PortalInitResponse
  | ChannelSessionStartResponse
  | ChannelSessionRestartResponse
  | ChannelSessionFinishResponse
  | VerifyKeyCheckResponse
  | DecryptMessageResponse
  | EncryptReplyResponse
  | DecryptAttachmentKeyResponse
  | DecryptAttachmentBlobResponse
  | AccountSessionStartResponse
  | AccountSessionFinishResponse
  | PortalZeroAllResponse;

export type PortalWorkerResponse =
  PortalWorkerSuccessResponse | PortalErrorResponse;

// -- Worker-initiated events (Worker -> main, not tied to a request) -----------

/**
 * Derivation progress phases, matching the LoginCryptoCallbacks pattern
 * used by account-crypto.ts. Emitted as unsolicited events during
 * accountSessionStart.
 */
export type DerivationPhase =
  | "argon2id-start"
  | "argon2id-done"
  | "oprf-start"
  | "oprf-done"
  | "derive-start"
  | "derive-done";

export interface DerivationProgressEvent {
  readonly kind: "derivationProgress";
  readonly phase: DerivationPhase;
}

export type PortalWorkerEvent = DerivationProgressEvent;

// -- Type-level helpers -------------------------------------------------------

/**
 * Extract the success response type for a given request type discriminant.
 * Used by the bridge to narrow the response after matching on `type`.
 */
export type PortalResponseForRequest<T extends PortalWorkerRequestType> =
  Extract<PortalWorkerSuccessResponse, { readonly type: T }>;
