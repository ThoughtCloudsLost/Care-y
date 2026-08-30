/**
 * Core portal crypto logic for the dedicated portal Worker.
 *
 * All state (seed, blind state, channel keypair, account keypair) and
 * message handlers live here. The entry point provides a Sink function
 * that routes responses to self.postMessage.
 *
 * Key material never leaves this module. Only public values (channelId,
 * clientPublic, auth) and operation results (plaintext, ciphertext) are
 * sent through the sink.
 *
 * State machine:
 *   UNINITIALIZED -> READY (after libsodium init)
 *   READY -> CHANNEL_BLINDED (after channelSessionStart)
 *   CHANNEL_BLINDED -> CHANNEL_KEYED (after channelSessionFinish)
 *   CHANNEL_BLINDED | CHANNEL_KEYED -> CHANNEL_BLINDED
 *     (after channelSessionRestart: passphrase retry from the held seed)
 *   CHANNEL_KEYED -> READY (after zeroAll)
 *
 *   READY -> ACCOUNT_STRETCHED (after accountSessionStart, Argon2id phase)
 *   ACCOUNT_STRETCHED -> ACCOUNT_BLINDED (after accountSessionStart, blind phase)
 *   ACCOUNT_BLINDED -> ACCOUNT_KEYED (after accountSessionFinish)
 *   ACCOUNT_KEYED -> READY (after zeroAll)
 *
 * Crypto ops (decryptMessage, encryptReply, decryptAttachmentKey,
 * decryptAttachmentBlob) run in either KEYED state under that session's
 * keypair. verifyKeyCheck is channel-only: it backs the passphrase gate,
 * which account sessions do not have.
 *
 * ADR-091: channel keypairs derive through a threshold OPRF round under
 * a per-channel tag; the main thread drives the tRPC evaluate call
 * between the start and finish operations.
 */

/* eslint-disable @typescript-eslint/no-unsafe-type-assertion --
   Branded type casts (Uint8Array -> RistrettoPoint, Nonce, Ciphertext,
   SymmetricKey, Salt) are the standard pattern for phantom-branded
   newtypes in @care-y/crypto. The __brand field never exists at runtime;
   length is validated inside each crypto function boundary. Same pattern
   as crypto-core.ts. */

import {
  getSodium,
  requireSodium,
  deriveChannelId,
  deriveChannelAuth,
  portalOprfInput,
  oprfBlind,
  oprfFinalize,
  derivePortalKeypairFromOprf,
  deriveAccountKey,
  deriveClientAccountKeys,
  PORTAL_KEY_CHECK,
  eciesEncrypt,
  eciesDecrypt,
  generateContentKey,
  encryptContent,
  decryptContent,
  sealForOrgKey,
  buildContentAad,
  followupSlot,
  blobSlot,
  fileKeySlot,
  filenameSlot,
  encodeFileKeyPayload,
  decodeFileKeyPayload,
  encode,
  decode,
  zeroAll,
  DecryptionError,
  toNonce,
  toRistrettoPoint,
  toSalt,
  toCiphertext,
  type PortalKeypair,
  type Scalar,
  type RistrettoPoint,
  type SymmetricKey,
  type EciesOutput,
} from "@care-y/crypto";
import type {
  PortalWorkerResponse,
  PortalWorkerRequest,
  PortalWorkerRequestType,
  PortalWorkerEvent,
  PortalErrorResponse,
  PortalWorkerErrorCode,
  ChannelSessionStartRequest,
  ChannelSessionRestartRequest,
  ChannelSessionFinishRequest,
  VerifyKeyCheckRequest,
  DecryptMessageRequest,
  EncryptReplyRequest,
  DecryptAttachmentKeyRequest,
  DecryptAttachmentBlobRequest,
  AccountSessionStartRequest,
  AccountSessionFinishRequest,
  EciesTripleWireResponse,
  PortalAttachmentPayloadResponse,
  DerivationPhase,
} from "./portal-protocol.js";

// -- Sink type ----------------------------------------------------------------

export type PortalSink = (
  msg: PortalWorkerResponse | PortalWorkerEvent,
  transfer?: Transferable[],
) => void;

// -- Key material (module-scoped, never returned via sink) --------------------

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

// Channel session state
let channelSeed: Uint8Array | null = null;
let channelBlindState: Scalar | null = null;
let channelBlindInput: Uint8Array | null = null;
let channelKeypair: PortalKeypair | null = null;

// Account session state
let accountStretched: Uint8Array | null = null;
let accountBlindState: Scalar | null = null;
let accountBlindInput: Uint8Array | null = null;
let accountKeypair: PortalKeypair | null = null;
let accountAuthToken: Uint8Array | null = null;

// -- State machine ------------------------------------------------------------

type PortalWorkerState =
  | "UNINITIALIZED"
  | "READY"
  | "CHANNEL_BLINDED"
  | "CHANNEL_KEYED"
  | "ACCOUNT_STRETCHED"
  | "ACCOUNT_BLINDED"
  | "ACCOUNT_KEYED";
let state: PortalWorkerState = "UNINITIALIZED";

// -- Helpers ------------------------------------------------------------------

class PortalInvalidStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PortalInvalidStateError";
  }
}

function postError(
  sink: PortalSink,
  id: number,
  type: PortalWorkerRequestType,
  error: string,
  code: PortalWorkerErrorCode,
): void {
  const msg: PortalErrorResponse = { id, ok: false, type, error, code };
  sink(msg);
}

function requireState(
  sink: PortalSink,
  id: number,
  type: PortalWorkerRequestType,
  expected: PortalWorkerState,
): boolean {
  if (state !== expected) {
    postError(
      sink,
      id,
      type,
      `Invalid state: expected ${expected}, got ${state}`,
      "INVALID_STATE",
    );
    return false;
  }
  return true;
}

function requireChannelKeyed(
  sink: PortalSink,
  id: number,
  type: PortalWorkerRequestType,
): boolean {
  if (state !== "CHANNEL_KEYED") {
    postError(sink, id, type, "Channel session not established", "NOT_READY");
    return false;
  }
  return true;
}

/**
 * Gate for ops that work in either session kind. Message decrypt, reply
 * encrypt, and attachment ops are session-agnostic: the account thread
 * uses the same ECIES construction under the account keypair.
 */
function requireKeyed(
  sink: PortalSink,
  id: number,
  type: PortalWorkerRequestType,
): boolean {
  if (state !== "CHANNEL_KEYED" && state !== "ACCOUNT_KEYED") {
    postError(sink, id, type, "No session established", "NOT_READY");
    return false;
  }
  return true;
}

/** The keypair belonging to whichever session kind is active. */
function activeKeypair(): PortalKeypair {
  return state === "ACCOUNT_KEYED"
    ? assertPresent(accountKeypair, "accountKeypair")
    : assertPresent(channelKeypair, "channelKeypair");
}

function assertPresent<T>(value: T | null, name: string): T {
  if (value === null) {
    throw new PortalInvalidStateError(
      `${name} is null (state machine invariant violated)`,
    );
  }
  return value;
}

function zeroAndClear(
  sodium: ReturnType<typeof requireSodium>,
  buf: Uint8Array | null,
): null {
  if (buf) sodium.memzero(buf);
  return null;
}

/** ECIES output to its base64url wire form. */
function toWire(out: EciesOutput): EciesTripleWireResponse {
  return {
    ephemeralPoint: encode(out.ephemeralPoint),
    nonce: encode(out.nonce),
    ciphertext: encode(out.ciphertext),
  };
}

// -- Handlers -----------------------------------------------------------------

async function handleInit(id: number, sink: PortalSink): Promise<void> {
  await getSodium();
  if (state === "UNINITIALIZED") {
    state = "READY";
  }
  const msg: PortalWorkerResponse = { id, ok: true, type: "init" };
  sink(msg);
}

function handleChannelSessionStart(
  req: ChannelSessionStartRequest,
  sink: PortalSink,
): void {
  if (!requireState(sink, req.id, "channelSessionStart", "READY")) return;

  const sodium = requireSodium();
  const seedBytes = new Uint8Array(req.seed);

  try {
    // Derive channelId and auth from seed
    const derivedChannelId = deriveChannelId(seedBytes);
    const auth = deriveChannelAuth(seedBytes);

    // Build pre-blind input (seed, or seed || Argon2id(passphrase))
    const input = portalOprfInput(seedBytes, req.passphrase);

    // Blind
    const { blindedElement, blindState } = oprfBlind(input);

    // Store state for finish step
    channelSeed = new Uint8Array(seedBytes.length);
    channelSeed.set(seedBytes);
    channelBlindState = blindState;
    channelBlindInput = input;
    state = "CHANNEL_BLINDED";

    const msg: PortalWorkerResponse = {
      id: req.id,
      ok: true,
      type: "channelSessionStart",
      channelId: derivedChannelId,
      auth: encode(auth),
      blindedElement: encode(blindedElement),
    };
    sink(msg);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "channelSessionStart",
      err instanceof Error ? err.message : String(err),
      "WORKER_ERROR",
    );
  } finally {
    // Zero the transferred seed copy
    sodium.memzero(seedBytes);
  }
}

function handleChannelSessionRestart(
  req: ChannelSessionRestartRequest,
  sink: PortalSink,
): void {
  // Valid after a completed round whose key check failed (CHANNEL_KEYED)
  // or after an evaluate that never finished (CHANNEL_BLINDED). The seed
  // stays Worker-held across attempts; the main thread zeroed its copy at
  // channelSessionStart, so a mistyped passphrase retries through here.
  if (state !== "CHANNEL_BLINDED" && state !== "CHANNEL_KEYED") {
    postError(
      sink,
      req.id,
      "channelSessionRestart",
      `Invalid state: expected CHANNEL_BLINDED or CHANNEL_KEYED, got ${state}`,
      "INVALID_STATE",
    );
    return;
  }

  const sodium = requireSodium();

  try {
    const seed = assertPresent(channelSeed, "channelSeed");

    // Zero the spent round's material before deriving the new round
    channelBlindInput = zeroAndClear(sodium, channelBlindInput);
    channelBlindState = zeroAndClear(sodium, channelBlindState);
    if (channelKeypair) {
      sodium.memzero(channelKeypair.clientPrivate);
      channelKeypair = null;
    }

    const derivedChannelId = deriveChannelId(seed);
    const auth = deriveChannelAuth(seed);
    const input = portalOprfInput(seed, req.passphrase);
    const { blindedElement, blindState } = oprfBlind(input);

    channelBlindState = blindState;
    channelBlindInput = input;
    state = "CHANNEL_BLINDED";

    const msg: PortalWorkerResponse = {
      id: req.id,
      ok: true,
      type: "channelSessionRestart",
      channelId: derivedChannelId,
      auth: encode(auth),
      blindedElement: encode(blindedElement),
    };
    sink(msg);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "channelSessionRestart",
      err instanceof Error ? err.message : String(err),
      "WORKER_ERROR",
    );
  }
}

function handleChannelSessionFinish(
  req: ChannelSessionFinishRequest,
  sink: PortalSink,
): void {
  if (!requireState(sink, req.id, "channelSessionFinish", "CHANNEL_BLINDED")) {
    return;
  }

  const sodium = requireSodium();
  let oprfOutput: Uint8Array | null = null;

  try {
    const evaluatedBytes = decode(req.evaluated);
    oprfOutput = oprfFinalize(
      assertPresent(channelBlindState, "channelBlindState"),
      toRistrettoPoint(evaluatedBytes),
      assertPresent(channelBlindInput, "channelBlindInput"),
    );

    channelKeypair = derivePortalKeypairFromOprf(oprfOutput);
    state = "CHANNEL_KEYED";

    const msg: PortalWorkerResponse = {
      id: req.id,
      ok: true,
      type: "channelSessionFinish",
      clientPublic: encode(channelKeypair.clientPublic),
    };
    sink(msg);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "channelSessionFinish",
      err instanceof Error ? err.message : String(err),
      "WORKER_ERROR",
    );
  } finally {
    zeroAll(oprfOutput);
    // Zero intermediate state (blind input and blind state are spent)
    channelBlindInput = zeroAndClear(sodium, channelBlindInput);
    channelBlindState = zeroAndClear(sodium, channelBlindState);
  }
}

function handleVerifyKeyCheck(
  req: VerifyKeyCheckRequest,
  sink: PortalSink,
): void {
  if (!requireChannelKeyed(sink, req.id, "verifyKeyCheck")) return;

  const kp = assertPresent(channelKeypair, "channelKeypair");
  const ephemeralPoint = toRistrettoPoint(decode(req.ephemeralPoint));
  const nonce = decode(req.nonce);
  const ciphertext = decode(req.ciphertext);

  try {
    const plaintext = eciesDecrypt(
      ephemeralPoint,
      toNonce(nonce),
      ciphertext,
      kp.clientPrivate,
    );
    const text = textDecoder.decode(plaintext);
    const passed = text === PORTAL_KEY_CHECK;
    const msg: PortalWorkerResponse = {
      id: req.id,
      ok: true,
      type: "verifyKeyCheck",
      passed,
    };
    sink(msg);
  } catch (err: unknown) {
    if (err instanceof DecryptionError) {
      // Wrong passphrase or corrupt key check, not a fatal error
      const msg: PortalWorkerResponse = {
        id: req.id,
        ok: true,
        type: "verifyKeyCheck",
        passed: false,
      };
      sink(msg);
      return;
    }
    postError(
      sink,
      req.id,
      "verifyKeyCheck",
      err instanceof Error ? err.message : String(err),
      "DECRYPT_FAILED",
    );
  }
}

function handleDecryptMessage(
  req: DecryptMessageRequest,
  sink: PortalSink,
): void {
  if (!requireKeyed(sink, req.id, "decryptMessage")) return;

  const kp = activeKeypair();
  const ephemeralPoint = toRistrettoPoint(decode(req.ephemeralPoint));
  const nonce = decode(req.nonce);
  const ciphertext = decode(req.ciphertext);

  try {
    const plaintext = eciesDecrypt(
      ephemeralPoint,
      toNonce(nonce),
      ciphertext,
      kp.clientPrivate,
    );
    const text = textDecoder.decode(plaintext);
    const msg: PortalWorkerResponse = {
      id: req.id,
      ok: true,
      type: "decryptMessage",
      plaintext: text,
    };
    sink(msg);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "decryptMessage",
      err instanceof Error ? err.message : String(err),
      "DECRYPT_FAILED",
    );
  }
}

/**
 * Encrypt one file under a key of its own, wrapping the key under tk_temp
 * and sealing a self-copy to the client's public key (ADR-089).
 */
function encryptSingleAttachment(
  att: {
    attachmentId: string;
    filename: string;
    contentType: string;
    data: ArrayBuffer;
  },
  tkTemp: SymmetricKey,
  clientPublic: RistrettoPoint,
  ticketId: string,
): PortalAttachmentPayloadResponse {
  const sodium = requireSodium();
  const fileKey: SymmetricKey = generateContentKey();
  const plainBytes = new Uint8Array(att.data);
  try {
    const blob = encryptContent(
      plainBytes,
      fileKey,
      buildContentAad(ticketId, blobSlot(att.attachmentId)),
    );
    const fileKeyWrap = encryptContent(
      fileKey,
      tkTemp,
      buildContentAad(ticketId, fileKeySlot(att.attachmentId)),
    );
    const encryptedFilename = encryptContent(
      textEncoder.encode(att.filename),
      tkTemp,
      buildContentAad(ticketId, filenameSlot(att.attachmentId)),
    );
    const selfCopy = eciesEncrypt(
      encodeFileKeyPayload(fileKey, att.filename),
      clientPublic,
    );

    return {
      attachmentId: att.attachmentId,
      blob: encode(blob),
      sizeBytes: blob.length,
      contentType: att.contentType,
      fileKeyWrap: encode(fileKeyWrap),
      encryptedFilename: encode(encryptedFilename),
      selfCopy: toWire(selfCopy),
    };
  } finally {
    sodium.memzero(fileKey);
    sodium.memzero(plainBytes);
  }
}

function handleEncryptReply(req: EncryptReplyRequest, sink: PortalSink): void {
  if (!requireKeyed(sink, req.id, "encryptReply")) return;

  const sodium = requireSodium();
  const kp = activeKeypair();
  const orgPubBytes = decode(req.orgPublicKey);
  const tkTemp: SymmetricKey = generateContentKey();

  try {
    const aad = buildContentAad(req.ticketId, followupSlot(req.followUpId));
    const encrypted = encryptContent(textEncoder.encode(req.text), tkTemp, aad);
    const wrapped = sealForOrgKey(tkTemp, orgPubBytes);
    const selfCopy: EciesOutput = eciesEncrypt(
      textEncoder.encode(req.text),
      kp.clientPublic,
    );

    const attachments = req.attachments.map((att) =>
      encryptSingleAttachment(att, tkTemp, kp.clientPublic, req.ticketId),
    );

    const msg: PortalWorkerResponse = {
      id: req.id,
      ok: true,
      type: "encryptReply",
      encryptedContent: encode(encrypted),
      wrappedTkTemp: encode(wrapped),
      selfCopy: toWire(selfCopy),
      attachments,
    };
    sink(msg);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "encryptReply",
      err instanceof Error ? err.message : String(err),
      "ENCRYPT_FAILED",
    );
  } finally {
    sodium.memzero(tkTemp);
  }
}

function handleDecryptAttachmentKey(
  req: DecryptAttachmentKeyRequest,
  sink: PortalSink,
): void {
  if (!requireKeyed(sink, req.id, "decryptAttachmentKey")) return;

  const kp = activeKeypair();
  const ephemeralPoint = toRistrettoPoint(decode(req.ephemeralPoint));
  const nonce = decode(req.nonce);
  const ciphertext = decode(req.ciphertext);

  try {
    const plaintext = eciesDecrypt(
      ephemeralPoint,
      toNonce(nonce),
      ciphertext,
      kp.clientPrivate,
    );
    const payload = decodeFileKeyPayload(plaintext);
    const msg: PortalWorkerResponse = {
      id: req.id,
      ok: true,
      type: "decryptAttachmentKey",
      fileKey: encode(payload.fileKey),
      filename: payload.filename,
    };
    sink(msg);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "decryptAttachmentKey",
      err instanceof Error ? err.message : String(err),
      "DECRYPT_FAILED",
    );
  }
}

function handleDecryptAttachmentBlob(
  req: DecryptAttachmentBlobRequest,
  sink: PortalSink,
): void {
  if (!requireKeyed(sink, req.id, "decryptAttachmentBlob")) return;

  const sodium = requireSodium();
  const fileKeyBytes = decode(req.fileKey);
  const ciphertextBuf = new Uint8Array(req.ciphertext);

  try {
    const plainBytes = decryptContent(
      toCiphertext(ciphertextBuf),
      fileKeyBytes as SymmetricKey,
      buildContentAad(req.ticketId, blobSlot(req.attachmentId)),
    );

    const abuf = new ArrayBuffer(plainBytes.byteLength);
    new Uint8Array(abuf).set(plainBytes);
    sodium.memzero(plainBytes);

    const msg: PortalWorkerResponse = {
      id: req.id,
      ok: true,
      type: "decryptAttachmentBlob",
      data: abuf,
    };
    sink(msg, [abuf]);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "decryptAttachmentBlob",
      err instanceof Error ? err.message : String(err),
      "DECRYPT_FAILED",
    );
  } finally {
    sodium.memzero(fileKeyBytes);
    sodium.memzero(ciphertextBuf);
  }
}

// -- Account session handlers -------------------------------------------------

function handleAccountSessionStart(
  req: AccountSessionStartRequest,
  sink: PortalSink,
): void {
  if (!requireState(sink, req.id, "accountSessionStart", "READY")) return;

  const sodium = requireSodium();
  const passwordBytes = new Uint8Array(req.password);
  const saltBytes = decode(req.salt);

  try {
    // Argon2id
    const progressEvent = (phase: DerivationPhase): void => {
      sink({ kind: "derivationProgress", phase });
    };

    progressEvent("argon2id-start");
    accountStretched = deriveAccountKey(passwordBytes, toSalt(saltBytes));
    progressEvent("argon2id-done");

    // OPRF blind
    progressEvent("oprf-start");
    const { blindedElement, blindState } = oprfBlind(accountStretched);
    accountBlindState = blindState;
    accountBlindInput = new Uint8Array(accountStretched.length);
    accountBlindInput.set(accountStretched);
    state = "ACCOUNT_BLINDED";

    const msg: PortalWorkerResponse = {
      id: req.id,
      ok: true,
      type: "accountSessionStart",
      blindedElement: encode(blindedElement),
    };
    sink(msg);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "accountSessionStart",
      err instanceof Error ? err.message : String(err),
      "WORKER_ERROR",
    );
  } finally {
    sodium.memzero(passwordBytes);
    sodium.memzero(saltBytes);
  }
}

function handleAccountSessionFinish(
  req: AccountSessionFinishRequest,
  sink: PortalSink,
): void {
  if (!requireState(sink, req.id, "accountSessionFinish", "ACCOUNT_BLINDED")) {
    return;
  }

  const sodium = requireSodium();
  let oprfOutput: Uint8Array | null = null;

  try {
    // Emit derive-start progress
    const progressEvent: PortalWorkerEvent = {
      kind: "derivationProgress",
      phase: "derive-start",
    };
    sink(progressEvent);

    const evaluatedBytes = decode(req.evaluated);
    oprfOutput = oprfFinalize(
      assertPresent(accountBlindState, "accountBlindState"),
      toRistrettoPoint(evaluatedBytes),
      assertPresent(accountBlindInput, "accountBlindInput"),
    );

    const keys = deriveClientAccountKeys(oprfOutput);
    accountKeypair = keys.keypair;
    // Copy authToken so we can return it; the key material stays here
    accountAuthToken = new Uint8Array(keys.authToken.length);
    accountAuthToken.set(keys.authToken);
    state = "ACCOUNT_KEYED";

    const msg: PortalWorkerResponse = {
      id: req.id,
      ok: true,
      type: "accountSessionFinish",
      clientPublic: encode(keys.keypair.clientPublic),
      authToken: encode(keys.authToken),
    };
    sink(msg);

    // Emit derive-done progress
    const doneEvent: PortalWorkerEvent = {
      kind: "derivationProgress",
      phase: "derive-done",
    };
    sink(doneEvent);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "accountSessionFinish",
      err instanceof Error ? err.message : String(err),
      "WORKER_ERROR",
    );
  } finally {
    zeroAll(oprfOutput);
    accountBlindInput = zeroAndClear(sodium, accountBlindInput);
    accountBlindState = zeroAndClear(sodium, accountBlindState);
    accountStretched = zeroAndClear(sodium, accountStretched);
  }
}

// -- Zero all -----------------------------------------------------------------

export function handleZeroAll(id: number, sink: PortalSink): void {
  const sodium = requireSodium();

  // Zero channel state
  channelSeed = zeroAndClear(sodium, channelSeed);
  channelBlindState = zeroAndClear(sodium, channelBlindState);
  channelBlindInput = zeroAndClear(sodium, channelBlindInput);
  if (channelKeypair) {
    sodium.memzero(channelKeypair.clientPrivate);
    channelKeypair = null;
  }

  // Zero account state
  accountStretched = zeroAndClear(sodium, accountStretched);
  accountBlindState = zeroAndClear(sodium, accountBlindState);
  accountBlindInput = zeroAndClear(sodium, accountBlindInput);
  accountAuthToken = zeroAndClear(sodium, accountAuthToken);
  if (accountKeypair) {
    sodium.memzero(accountKeypair.clientPrivate);
    accountKeypair = null;
  }

  state = "READY";

  const msg: PortalWorkerResponse = { id, ok: true, type: "zeroAll" };
  sink(msg);
}

// -- Dispatcher factory -------------------------------------------------------

export function createPortalDispatcher(
  sink: PortalSink,
): (req: PortalWorkerRequest) => void {
  return (req: PortalWorkerRequest): void => {
    const handle = async (): Promise<void> => {
      switch (req.type) {
        case "init":
          await handleInit(req.id, sink);
          break;
        case "channelSessionStart":
          handleChannelSessionStart(req, sink);
          break;
        case "channelSessionRestart":
          handleChannelSessionRestart(req, sink);
          break;
        case "channelSessionFinish":
          handleChannelSessionFinish(req, sink);
          break;
        case "verifyKeyCheck":
          handleVerifyKeyCheck(req, sink);
          break;
        case "decryptMessage":
          handleDecryptMessage(req, sink);
          break;
        case "encryptReply":
          handleEncryptReply(req, sink);
          break;
        case "decryptAttachmentKey":
          handleDecryptAttachmentKey(req, sink);
          break;
        case "decryptAttachmentBlob":
          handleDecryptAttachmentBlob(req, sink);
          break;
        case "accountSessionStart":
          handleAccountSessionStart(req, sink);
          break;
        case "accountSessionFinish":
          handleAccountSessionFinish(req, sink);
          break;
        case "zeroAll":
          handleZeroAll(req.id, sink);
          break;
      }
    };

    handle().catch((err: unknown) => {
      postError(
        sink,
        req.id,
        req.type,
        err instanceof Error ? err.message : String(err),
        "WORKER_ERROR",
      );
    });
  };
}
