/**
 * Core crypto logic shared between dedicated and SharedWorker entry points.
 *
 * All state (keys, caches) and message handlers live here. Entry points
 * provide a Sink function that routes responses to the correct transport:
 *   - Dedicated Worker: self.postMessage(msg)
 *   - SharedWorker: port.postMessage(msg)
 *
 * Key material never leaves this module. Only public values (volPublic,
 * orgPublicKey) and operation results (plaintext, ciphertext) are sent
 * through the sink.
 *
 * State machine:
 *   UNINITIALIZED -> READY (after libsodium init)
 *   READY -> STRETCHED (after argon2id)
 *   STRETCHED -> BLINDED (after oprfBlind)
 *   BLINDED -> KEYED (after deriveKeys)
 *   KEYED -> READY (after zeroAll)
 */

/* eslint-disable @typescript-eslint/no-unsafe-type-assertion --
   Branded type casts (Uint8Array -> Salt, EvaluatedElement, RistrettoPoint, Nonce,
   Ciphertext, SymmetricKey) are the standard pattern for phantom-branded newtypes
   in @care-y/crypto. The __brand field never exists at runtime; length is validated
   inside each crypto function boundary. Same pattern as derive.ts, ecies.ts, oprf.ts. */

import {
  getSodium,
  requireSodium,
  oprfBlind,
  oprfFinalize,
  deriveMasterKey,
  deriveAccountKey,
  deriveVolunteerPrivateKey,
  deriveVolunteerPublicKey,
  eciesEncrypt,
  eciesDecrypt,
  encryptContent,
  decryptContent,
  generateContentKey,
  buildContentAad,
  followupSlot,
  blobSlot,
  fieldSlot,
  encode,
  decode,
  hkdfDerive32,
  HKDF_LABELS,
  type Scalar,
  type RistrettoPoint,
  type SymmetricKey,
  type Salt,
  type Nonce,
  type EvaluatedElement,
  type Ciphertext,
} from "@care-y/crypto";
import type {
  WorkerResponse,
  ErrorResponse,
  Argon2idRequest,
  DeriveKeysRequest,
  DecryptContentRequest,
  DecryptAndRewrapRequest,
  RewrapBlobRequest,
  DecryptBlobRequest,
  EncryptContentRequest,
  EvictTkRequest,
  UnwrapOrgKeyRequest,
  UnwrapTkRequest,
  WrapWithVolPublicRequest,
  SealSelfBlobRequest,
  OpenSelfBlobRequest,
  RewrapTkRequest,
  CreateTicketKeyRequest,
  OrgDecryptRequest,
  OrgEncryptRequest,
  OrgDecryptBatchRequest,
  ExportOrgSecretKeyRequest,
  AliasHashRequest,
  WorkerRequest,
  WorkerRequestType,
  RewrapEvent,
  RewrapResultEvent,
  SharedWorkerState,
} from "./crypto-protocol.js";
import { normalizeAlias } from "@care-y/shared";
import { TkCache } from "./tk-cache.js";

// ── Sink type ──────────────────────────────────────────────────────

export type Sink = (
  msg: WorkerResponse | RewrapEvent,
  transfer?: Transferable[],
) => void;

// ── Key material (module-scoped, never returned via sink) ──────────

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

let stretched: Uint8Array | null = null;
let blindState: Scalar | null = null;
let masterKey: SymmetricKey | null = null;
let volPrivate: Scalar | null = null;
let volPublic: RistrettoPoint | null = null;

let orgSecret: Uint8Array | null = null;
let orgPublicKey: Uint8Array | null = null;
let aliasIndexKey: Uint8Array | null = null;

const tkCache = new TkCache({
  maxEntries: 50,
  memzero: (buf) => {
    requireSodium().memzero(buf);
  },
});

const pendingRewraps = new Set<string>();

const rewrapTkTempCache = new Map<string, Uint8Array>();

// ── State machine ───────────────────────────────────────────────────

type WorkerStateInternal =
  "UNINITIALIZED" | "READY" | "STRETCHED" | "BLINDED" | "KEYED";
let state: WorkerStateInternal = "UNINITIALIZED";

// ── State transition callback ───────────────────────────────────────

export type StateTransitionCallback = (newState: SharedWorkerState) => void;
let stateTransitionCallback: StateTransitionCallback | null = null;

export function onStateTransition(cb: StateTransitionCallback): void {
  stateTransitionCallback = cb;
}

function notifyStateTransition(): void {
  stateTransitionCallback?.(getState());
}

// ── Idle self-zero backstop ─────────────────────────────────────────

/**
 * Zeroes all key material after this long without a single crypto
 * request. Backstop for tabs that die without sending "disconnect"
 * (crash, force-kill): their port stays in the SharedWorker's set, the
 * last-port-gone zero timer never starts, and keys would otherwise
 * stay resident until the browser process exits (ADR-044
 * extendedLifetime). Bounds key residency for a seized device.
 *
 * Set to twice the 15-minute main-thread idle timeout in
 * (app)/+layout.svelte. That timer tracks human input and sends an
 * explicit zeroAll; crypto requests are sparser than input events, so
 * a shorter interval here would zero keys out from under a session
 * that is active but not currently decrypting.
 */
export const IDLE_SELF_ZERO_MS = 30 * 60 * 1000;

let idleSelfZeroTimer: ReturnType<typeof setTimeout> | null = null;

const noopSink: Sink = () => undefined;

function hasKeyMaterial(): boolean {
  return state === "STRETCHED" || state === "BLINDED" || state === "KEYED";
}

function armIdleSelfZero(): void {
  if (idleSelfZeroTimer !== null) clearTimeout(idleSelfZeroTimer);
  idleSelfZeroTimer = setTimeout(() => {
    idleSelfZeroTimer = null;
    // Without key material a zero would only broadcast a spurious READY
    // state change, which live tabs treat as a logout signal.
    if (hasKeyMaterial()) {
      handleZeroAll(-1, noopSink);
    }
  }, IDLE_SELF_ZERO_MS);
}

// ── Public accessors for SharedWorker ───────────────────────────────

export function getState(): SharedWorkerState {
  return state === "KEYED" ? "KEYED" : "READY";
}

export function getPublicKeys(): { volPublic?: string; orgPublicKey?: string } {
  return {
    volPublic: volPublic ? encode(volPublic) : undefined,
    orgPublicKey: orgPublicKey ? encode(orgPublicKey) : undefined,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────

function postError(
  sink: Sink,
  id: number,
  type: WorkerRequestType,
  error: string,
  code: ErrorResponse["code"],
): void {
  const msg: ErrorResponse = { id, ok: false, type, error, code };
  sink(msg);
}

function requireState(
  sink: Sink,
  id: number,
  type: WorkerRequestType,
  expected: WorkerStateInternal,
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

function requireKeyed(
  sink: Sink,
  id: number,
  type: WorkerRequestType,
): boolean {
  if (state !== "KEYED") {
    postError(sink, id, type, "Worker not keyed (login required)", "NOT_READY");
    return false;
  }
  return true;
}

function requireOrgKeyed(
  sink: Sink,
  id: number,
  type: WorkerRequestType,
): boolean {
  if (orgSecret === null) {
    postError(sink, id, type, "Org key not loaded", "NOT_READY");
    return false;
  }
  return true;
}

function assertPresent<T>(value: T | null, name: string): T {
  if (value === null) {
    throw new InvalidStateError(
      `${name} is null (state machine invariant violated)`,
    );
  }
  return value;
}

class InvalidStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidStateError";
  }
}

function zeroAndClear(
  sodium: ReturnType<typeof requireSodium>,
  buf: Uint8Array | null,
): null {
  if (buf) sodium.memzero(buf);
  return null;
}

// ── Handlers ────────────────────────────────────────────────────────

async function handleInit(id: number, sink: Sink): Promise<void> {
  await getSodium();
  if (state !== "KEYED") {
    state = "READY";
  }
  const msg: WorkerResponse = { id, ok: true, type: "init" };
  sink(msg);
}

function handleArgon2id(req: Argon2idRequest, sink: Sink): void {
  if (!requireState(sink, req.id, "argon2id", "READY")) return;

  const sodium = requireSodium();
  const passwordBuf = new Uint8Array(req.password);
  const saltBuf = new Uint8Array(req.salt);

  try {
    stretched = deriveAccountKey(passwordBuf, saltBuf as Salt);
    state = "STRETCHED";
    const msg: WorkerResponse = { id: req.id, ok: true, type: "argon2id" };
    sink(msg);
  } finally {
    sodium.memzero(passwordBuf);
    sodium.memzero(saltBuf);
  }
}

function handleOprfBlind(id: number, sink: Sink): void {
  if (!requireState(sink, id, "oprfBlind", "STRETCHED")) return;

  const result = oprfBlind(assertPresent(stretched, "stretched"));
  blindState = result.blindState;
  state = "BLINDED";

  const msg: WorkerResponse = {
    id,
    ok: true,
    type: "oprfBlind",
    blindedElement: encode(result.blindedElement),
  };
  sink(msg);
}

function handleDeriveKeys(req: DeriveKeysRequest, sink: Sink): void {
  if (!requireState(sink, req.id, "deriveKeys", "BLINDED")) return;

  const sodium = requireSodium();
  const evalBuf = new Uint8Array(req.evaluated);

  try {
    const oprfOutput = oprfFinalize(
      assertPresent(blindState, "blindState"),
      evalBuf as EvaluatedElement,
      assertPresent(stretched, "stretched"),
    );

    try {
      masterKey = deriveMasterKey(oprfOutput);
      volPrivate = deriveVolunteerPrivateKey(masterKey);
      volPublic = deriveVolunteerPublicKey(volPrivate);
      state = "KEYED";

      const msg: WorkerResponse = {
        id: req.id,
        ok: true,
        type: "deriveKeys",
        volPublic: encode(volPublic),
      };
      sink(msg);
      notifyStateTransition();
    } finally {
      sodium.memzero(oprfOutput);
    }
  } finally {
    sodium.memzero(evalBuf);
    stretched = zeroAndClear(sodium, stretched);
    blindState = zeroAndClear(sodium, blindState);
  }
}

interface KeyWrapRequest {
  readonly id: number;
  readonly type: WorkerRequestType;
  readonly ticketId: string;
  readonly keyCacheId: string;
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly wrappedKey: string;
}

function resolveTk(req: KeyWrapRequest, sink: Sink): Uint8Array | null {
  const cached = tkCache.get(req.keyCacheId);
  if (cached) return cached;

  const ephemeralPoint = decode(req.ephemeralPoint);
  const nonce = decode(req.nonce);
  const wrappedKey = decode(req.wrappedKey);

  try {
    const tk = eciesDecrypt(
      ephemeralPoint as RistrettoPoint,
      nonce as Nonce,
      wrappedKey,
      assertPresent(volPrivate, "volPrivate"),
    );
    tkCache.set(req.keyCacheId, tk);
    return tk;
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      req.type,
      err instanceof Error ? err.message : String(err),
      "DECRYPT_FAILED",
    );
    return null;
  }
}

function handleDecryptContent(req: DecryptContentRequest, sink: Sink): void {
  if (!requireKeyed(sink, req.id, "decryptContent")) return;

  const sodium = requireSodium();
  const tk = resolveTk(req, sink);
  if (!tk) return;

  const ciphertextBuf = decode(req.ciphertext);

  try {
    const plaintext = decryptContent(
      ciphertextBuf as Ciphertext,
      tk as SymmetricKey,
      buildContentAad(req.ticketId, req.slot),
    );

    try {
      const msg: WorkerResponse = {
        id: req.id,
        ok: true,
        type: "decryptContent",
        plaintext: textDecoder.decode(plaintext),
      };
      sink(msg);
    } finally {
      sodium.memzero(plaintext);
    }
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "decryptContent",
      err instanceof Error ? err.message : String(err),
      "DECRYPT_FAILED",
    );
  }
}

function unwrapTkTemp(
  req: DecryptAndRewrapRequest,
  sink: Sink,
): Uint8Array | null {
  const ephemeralPoint = decode(req.ephemeralPoint);
  const nonce = decode(req.nonce);
  const wrappedKey = decode(req.wrappedKey);

  try {
    return eciesDecrypt(
      ephemeralPoint as RistrettoPoint,
      nonce as Nonce,
      wrappedKey,
      assertPresent(volPrivate, "volPrivate"),
    );
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "decryptAndRewrap",
      err instanceof Error ? err.message : String(err),
      "DECRYPT_FAILED",
    );
    return null;
  }
}

function handleDecryptAndRewrap(
  req: DecryptAndRewrapRequest,
  sink: Sink,
): void {
  if (!requireKeyed(sink, req.id, "decryptAndRewrap")) return;

  const sodium = requireSodium();
  const tkTemp = unwrapTkTemp(req, sink);
  if (!tkTemp) return;

  rewrapTkTempCache.set(req.followUpId, tkTemp);

  const ciphertextBuf = decode(req.ciphertext);
  // Same AAD before and after the rewrap: the content stays in the same
  // followup slot of the same ticket, only the key changes (ADR-053).
  const aad = buildContentAad(req.ticketId, followupSlot(req.followUpId));

  try {
    const plaintext = decryptContent(
      ciphertextBuf as Ciphertext,
      tkTemp as SymmetricKey,
      aad,
    );

    try {
      const msg: WorkerResponse = {
        id: req.id,
        ok: true,
        type: "decryptAndRewrap",
        plaintext: textDecoder.decode(plaintext),
      };
      sink(msg);
    } finally {
      triggerRewrap(req.followUpId, req.ticketId, plaintext, aad, sodium, sink);
    }
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "decryptAndRewrap",
      err instanceof Error ? err.message : String(err),
      "DECRYPT_FAILED",
    );
  }
}

function triggerRewrap(
  followUpId: string,
  ticketId: string,
  plaintext: Uint8Array,
  aad: Uint8Array,
  sodium: ReturnType<typeof requireSodium>,
  sink: Sink,
): void {
  if (pendingRewraps.has(followUpId)) {
    sodium.memzero(plaintext);
    return;
  }

  const canonicalTk = tkCache.get(ticketId);
  if (!canonicalTk) {
    sodium.memzero(plaintext);
    return;
  }

  try {
    const reEncrypted = encryptContent(
      plaintext,
      canonicalTk as SymmetricKey,
      aad,
    );
    pendingRewraps.add(followUpId);
    const event: RewrapEvent = {
      kind: "rewrap",
      followUpId,
      ticketId,
      encryptedContent: encode(reEncrypted),
    };
    sink(event);
  } catch (err: unknown) {
    pendingRewraps.delete(followUpId);
    if (import.meta.env.DEV) {
      console.warn("[triggerRewrap] failed for", followUpId, err);
    }
  } finally {
    sodium.memzero(plaintext);
  }
}

function handleRewrapBlob(req: RewrapBlobRequest, sink: Sink): void {
  if (!requireKeyed(sink, req.id, "rewrapBlob")) return;

  const sodium = requireSodium();
  const tkTemp = rewrapTkTempCache.get(req.followUpId);
  if (!tkTemp) {
    postError(
      sink,
      req.id,
      "rewrapBlob",
      `No cached tk_temp for follow-up ${req.followUpId}`,
      "TK_NOT_CACHED",
    );
    return;
  }

  const canonicalTk = tkCache.get(req.ticketId);
  if (!canonicalTk) {
    postError(
      sink,
      req.id,
      "rewrapBlob",
      `No cached tk for ticket ${req.ticketId}`,
      "TK_NOT_CACHED",
    );
    return;
  }

  const ciphertextBuf = new Uint8Array(req.ciphertext);
  // Bound to the attachments/recordings row id, which is stable across
  // the rewrap; the storage blobKey changes when the server re-stores.
  const aad = buildContentAad(req.ticketId, blobSlot(req.blobId));

  try {
    const blobPlaintext = decryptContent(
      ciphertextBuf as Ciphertext,
      tkTemp as SymmetricKey,
      aad,
    );
    try {
      const reEncrypted = encryptContent(
        blobPlaintext,
        canonicalTk as SymmetricKey,
        aad,
      );
      const msg: WorkerResponse = {
        id: req.id,
        ok: true,
        type: "rewrapBlob",
        encryptedData: encode(reEncrypted),
        blobKey: req.blobKey,
        category: req.category,
      };
      sink(msg);
    } finally {
      sodium.memzero(blobPlaintext);
    }
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "rewrapBlob",
      err instanceof Error ? err.message : String(err),
      "REWRAP_FAILED",
    );
  }
}

export function handleRewrapResult(event: RewrapResultEvent): void {
  pendingRewraps.delete(event.followUpId);
  const tkTemp = rewrapTkTempCache.get(event.followUpId);
  if (tkTemp) {
    requireSodium().memzero(tkTemp);
    rewrapTkTempCache.delete(event.followUpId);
  }
}

function handleDecryptBlob(req: DecryptBlobRequest, sink: Sink): void {
  if (!requireKeyed(sink, req.id, "decryptBlob")) return;

  const sodium = requireSodium();
  const tk = resolveTk(req, sink);
  if (!tk) return;

  try {
    const ciphertextBuf = new Uint8Array(req.ciphertext);
    const plainBytes = decryptContent(
      ciphertextBuf as Ciphertext,
      tk as SymmetricKey,
      buildContentAad(req.ticketId, req.slot),
    );

    const abuf = new ArrayBuffer(plainBytes.byteLength);
    new Uint8Array(abuf).set(plainBytes);
    sodium.memzero(plainBytes);

    const msg: WorkerResponse = {
      id: req.id,
      ok: true,
      type: "decryptBlob",
      data: abuf,
    };
    sink(msg, [abuf]);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "decryptBlob",
      err instanceof Error ? err.message : String(err),
      "DECRYPT_FAILED",
    );
  }
}

function handleEncryptContent(req: EncryptContentRequest, sink: Sink): void {
  if (!requireKeyed(sink, req.id, "encryptContent")) return;

  const tk = tkCache.get(req.ticketId);
  if (!tk) {
    postError(
      sink,
      req.id,
      "encryptContent",
      `No cached tk for ticket ${req.ticketId}`,
      "TK_NOT_CACHED",
    );
    return;
  }

  const plaintextBuf = textEncoder.encode(req.plaintext);

  try {
    const ciphertext = encryptContent(
      plaintextBuf,
      tk as SymmetricKey,
      buildContentAad(req.ticketId, req.slot),
    );

    const msg: WorkerResponse = {
      id: req.id,
      ok: true,
      type: "encryptContent",
      ciphertext: encode(ciphertext),
    };
    sink(msg);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "encryptContent",
      err instanceof Error ? err.message : String(err),
      "ENCRYPT_FAILED",
    );
  }
}

function handleEvictTk(req: EvictTkRequest, sink: Sink): void {
  tkCache.evict(req.ticketId);
  const msg: WorkerResponse = { id: req.id, ok: true, type: "evictTk" };
  sink(msg);
}

export function handleZeroAll(id: number, sink: Sink): void {
  const sodium = requireSodium();

  // Nothing left to protect; the next request re-arms the backstop.
  if (idleSelfZeroTimer !== null) {
    clearTimeout(idleSelfZeroTimer);
    idleSelfZeroTimer = null;
  }

  tkCache.zeroAll();

  for (const tkTemp of rewrapTkTempCache.values()) {
    sodium.memzero(tkTemp);
  }
  rewrapTkTempCache.clear();
  pendingRewraps.clear();

  volPrivate = zeroAndClear(sodium, volPrivate);
  masterKey = zeroAndClear(sodium, masterKey);
  stretched = zeroAndClear(sodium, stretched);
  blindState = zeroAndClear(sodium, blindState);
  orgSecret = zeroAndClear(sodium, orgSecret);
  aliasIndexKey = zeroAndClear(sodium, aliasIndexKey);

  volPublic = null;
  orgPublicKey = null;
  state = "READY";

  const msg: WorkerResponse = { id, ok: true, type: "zeroAll" };
  sink(msg);
  notifyStateTransition();
}

function handleGetVolPublic(id: number, sink: Sink): void {
  if (!requireKeyed(sink, id, "getVolPublic")) return;

  const msg: WorkerResponse = {
    id,
    ok: true,
    type: "getVolPublic",
    volPublic: encode(assertPresent(volPublic, "volPublic")),
  };
  sink(msg);
}

function handleUnwrapOrgKey(req: UnwrapOrgKeyRequest, sink: Sink): void {
  if (!requireKeyed(sink, req.id, "unwrapOrgKey")) return;

  const ephemeralPoint = decode(req.ephemeralPoint);
  const nonce = decode(req.nonce);
  const wrappedKey = decode(req.wrappedOrgKey);
  const sodium = requireSodium();

  try {
    const unwrappedOrgSecret = eciesDecrypt(
      ephemeralPoint as RistrettoPoint,
      nonce as Nonce,
      wrappedKey,
      assertPresent(volPrivate, "volPrivate"),
    );

    orgSecret = zeroAndClear(sodium, orgSecret);
    aliasIndexKey = zeroAndClear(sodium, aliasIndexKey);
    orgPublicKey = null;

    orgSecret = new Uint8Array(unwrappedOrgSecret.byteLength);
    orgSecret.set(unwrappedOrgSecret);
    sodium.memzero(unwrappedOrgSecret);
    orgPublicKey = sodium.crypto_scalarmult_base(orgSecret);

    const msg: WorkerResponse = {
      id: req.id,
      ok: true,
      type: "unwrapOrgKey",
      orgPublicKey: encode(orgPublicKey),
    };
    sink(msg);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "unwrapOrgKey",
      err instanceof Error ? err.message : String(err),
      "UNWRAP_FAILED",
    );
  }
}

function handleUnwrapTk(req: UnwrapTkRequest, sink: Sink): void {
  if (!requireKeyed(sink, req.id, "unwrapTk")) return;

  const tk = resolveTk(req, sink);
  if (!tk) return;

  const msg: WorkerResponse = { id: req.id, ok: true, type: "unwrapTk" };
  sink(msg);
}

function handleWrapWithVolPublic(
  req: WrapWithVolPublicRequest,
  sink: Sink,
): void {
  if (!requireKeyed(sink, req.id, "wrapWithVolPublic")) return;

  const data = decode(req.data);

  try {
    const wrap = eciesEncrypt(data, assertPresent(volPublic, "volPublic"));

    const msg: WorkerResponse = {
      id: req.id,
      ok: true,
      type: "wrapWithVolPublic",
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
    };
    sink(msg);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "wrapWithVolPublic",
      err instanceof Error ? err.message : String(err),
      "ENCRYPT_FAILED",
    );
  }
}

/**
 * Domain tag prefixed inside every self-blob plaintext before ECIES
 * encryption to volPublic. openSelfBlob refuses plaintexts without it:
 * ticket key wraps and org key wraps are also ECIES envelopes to
 * volPublic, and without this check the handler would be a generic
 * vol_private decrypt oracle able to hand raw key material to the main
 * thread. Exported for tests.
 */
const SELF_BLOB_TAG_TEXT = "carey.self-blob.v1:";
export const SELF_BLOB_TAG: Uint8Array = new TextEncoder().encode(
  SELF_BLOB_TAG_TEXT,
);

function hasSelfBlobTag(plaintext: Uint8Array): boolean {
  if (plaintext.length < SELF_BLOB_TAG.length) return false;
  // The tag is pure ASCII, so UTF-8 decoding of the prefix equals the tag
  // string exactly when the bytes match exactly. Avoids indexed access.
  const prefix = new TextDecoder().decode(
    plaintext.subarray(0, SELF_BLOB_TAG.length),
  );
  return prefix === SELF_BLOB_TAG_TEXT;
}

function handleSealSelfBlob(req: SealSelfBlobRequest, sink: Sink): void {
  if (!requireKeyed(sink, req.id, "sealSelfBlob")) return;

  const sodium = requireSodium();
  const payload = decode(req.data);
  const tagged = new Uint8Array(SELF_BLOB_TAG.length + payload.length);
  tagged.set(SELF_BLOB_TAG);
  tagged.set(payload, SELF_BLOB_TAG.length);

  try {
    const wrap = eciesEncrypt(tagged, assertPresent(volPublic, "volPublic"));

    const msg: WorkerResponse = {
      id: req.id,
      ok: true,
      type: "sealSelfBlob",
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedPayload: encode(wrap.ciphertext),
    };
    sink(msg);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "sealSelfBlob",
      err instanceof Error ? err.message : String(err),
      "ENCRYPT_FAILED",
    );
  } finally {
    sodium.memzero(tagged);
    sodium.memzero(payload);
  }
}

function handleOpenSelfBlob(req: OpenSelfBlobRequest, sink: Sink): void {
  if (!requireKeyed(sink, req.id, "openSelfBlob")) return;

  const sodium = requireSodium();
  const ephemeralPoint = decode(req.ephemeralPoint);
  const nonce = decode(req.nonce);
  const wrappedPayload = decode(req.wrappedPayload);

  let plaintext: Uint8Array | null = null;
  try {
    plaintext = eciesDecrypt(
      ephemeralPoint as RistrettoPoint,
      nonce as Nonce,
      wrappedPayload,
      assertPresent(volPrivate, "volPrivate"),
    );

    if (!hasSelfBlobTag(plaintext)) {
      postError(
        sink,
        req.id,
        "openSelfBlob",
        "Envelope is not a self-blob",
        "UNWRAP_FAILED",
      );
      return;
    }

    const payload = plaintext.slice(SELF_BLOB_TAG.length);
    const encoded = encode(payload);
    sodium.memzero(payload);

    const msg: WorkerResponse = {
      id: req.id,
      ok: true,
      type: "openSelfBlob",
      data: encoded,
    };
    sink(msg);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "openSelfBlob",
      err instanceof Error ? err.message : String(err),
      "UNWRAP_FAILED",
    );
  } finally {
    if (plaintext) sodium.memzero(plaintext);
  }
}

function handleRewrapTk(req: RewrapTkRequest, sink: Sink): void {
  if (!requireKeyed(sink, req.id, "rewrapTk")) return;

  const tk = tkCache.get(req.ticketId);
  if (!tk) {
    postError(
      sink,
      req.id,
      "rewrapTk",
      `No cached tk for ticket ${req.ticketId}`,
      "TK_NOT_CACHED",
    );
    return;
  }

  const recipientPub = decode(req.recipientVolPublic);

  try {
    const wrap = eciesEncrypt(tk, recipientPub as RistrettoPoint);

    const msg: WorkerResponse = {
      id: req.id,
      ok: true,
      type: "rewrapTk",
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
    };
    sink(msg);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "rewrapTk",
      err instanceof Error ? err.message : String(err),
      "REWRAP_FAILED",
    );
  }
}

function handleCreateTicketKey(req: CreateTicketKeyRequest, sink: Sink): void {
  if (!requireKeyed(sink, req.id, "createTicketKey")) return;

  const sodium = requireSodium();
  const tk = generateContentKey();

  try {
    const encryptedFields = req.fields.map((f) => {
      const plaintextBuf = textEncoder.encode(f.plaintext);
      const slot =
        f.name === "title" || f.name === "description"
          ? f.name
          : fieldSlot(f.name);
      const ciphertext = encryptContent(
        plaintextBuf,
        tk,
        buildContentAad(req.ticketId, slot),
      );
      return { name: f.name, ciphertext: encode(ciphertext) };
    });

    const wrap = eciesEncrypt(tk, assertPresent(volPublic, "volPublic"));
    const keyGeneration = crypto.randomUUID();

    const msg: WorkerResponse = {
      id: req.id,
      ok: true,
      type: "createTicketKey",
      encryptedFields,
      keyWrap: {
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
      },
      keyGeneration,
    };
    sink(msg);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "createTicketKey",
      err instanceof Error ? err.message : String(err),
      "ENCRYPT_FAILED",
    );
  } finally {
    sodium.memzero(tk);
  }
}

// ── Org-tier sealed-box handlers ────────────────────────────────────

function handleOrgDecrypt(req: OrgDecryptRequest, sink: Sink): void {
  if (!requireOrgKeyed(sink, req.id, "orgDecrypt")) return;

  const sodium = requireSodium();
  const ciphertext = decode(req.ciphertext);

  try {
    const plainBytes = sodium.crypto_box_seal_open(
      ciphertext,
      assertPresent(orgPublicKey, "orgPublicKey"),
      assertPresent(orgSecret, "orgSecret"),
    );

    try {
      const msg: WorkerResponse = {
        id: req.id,
        ok: true,
        type: "orgDecrypt",
        plaintext: encode(plainBytes),
      };
      sink(msg);
    } finally {
      sodium.memzero(plainBytes);
    }
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "orgDecrypt",
      err instanceof Error ? err.message : String(err),
      "DECRYPT_FAILED",
    );
  }
}

function handleOrgEncrypt(req: OrgEncryptRequest, sink: Sink): void {
  if (!requireOrgKeyed(sink, req.id, "orgEncrypt")) return;

  const sodium = requireSodium();
  const plaintext = decode(req.plaintext);

  try {
    const ciphertext = sodium.crypto_box_seal(
      plaintext,
      assertPresent(orgPublicKey, "orgPublicKey"),
    );

    const msg: WorkerResponse = {
      id: req.id,
      ok: true,
      type: "orgEncrypt",
      ciphertext: encode(ciphertext),
    };
    sink(msg);
  } catch (err: unknown) {
    postError(
      sink,
      req.id,
      "orgEncrypt",
      err instanceof Error ? err.message : String(err),
      "ENCRYPT_FAILED",
    );
  }
}

function ensureAliasIndexKey(): Uint8Array {
  if (aliasIndexKey) return aliasIndexKey;
  const secret = assertPresent(orgSecret, "orgSecret");
  aliasIndexKey = hkdfDerive32(secret, HKDF_LABELS.ALIAS_INDEX);
  return aliasIndexKey;
}

function handleAliasHash(req: AliasHashRequest, sink: Sink): void {
  if (!requireOrgKeyed(sink, req.id, "aliasHash")) return;

  const sodium = requireSodium();
  const key = ensureAliasIndexKey();
  const normalized = normalizeAlias(req.alias);
  const hmac = sodium.crypto_auth_hmacsha512(
    textEncoder.encode(normalized),
    key,
  );

  // Convert to lowercase hex
  const hex = Array.from(hmac, (b) => b.toString(16).padStart(2, "0")).join("");

  sodium.memzero(hmac);

  const msg: WorkerResponse = {
    id: req.id,
    ok: true,
    type: "aliasHash",
    hash: hex,
  };
  sink(msg);
}

function handleOrgDecryptBatch(req: OrgDecryptBatchRequest, sink: Sink): void {
  if (!requireOrgKeyed(sink, req.id, "orgDecryptBatch")) return;

  const sodium = requireSodium();
  const pk = assertPresent(orgPublicKey, "orgPublicKey");
  const sk = assertPresent(orgSecret, "orgSecret");

  const results: { cacheKey: string; plaintext: string | null }[] =
    req.items.map((item) => {
      try {
        const ciphertext = decode(item.ciphertext);
        const plainBytes = sodium.crypto_box_seal_open(ciphertext, pk, sk);
        const plaintext = textDecoder.decode(plainBytes);
        sodium.memzero(plainBytes);
        return { cacheKey: item.cacheKey, plaintext };
      } catch {
        return { cacheKey: item.cacheKey, plaintext: null };
      }
    });

  const msg: WorkerResponse = {
    id: req.id,
    ok: true,
    type: "orgDecryptBatch",
    results,
  };
  sink(msg);
}

function handleExportOrgSecretKey(
  req: ExportOrgSecretKeyRequest,
  sink: Sink,
): void {
  if (!requireOrgKeyed(sink, req.id, "exportOrgSecretKey")) return;

  const sk = assertPresent(orgSecret, "orgSecret");
  const abuf = new ArrayBuffer(sk.byteLength);
  new Uint8Array(abuf).set(sk);

  const msg: WorkerResponse = {
    id: req.id,
    ok: true,
    type: "exportOrgSecretKey",
    orgSecretKey: abuf,
  };
  sink(msg, [abuf]);
}

function handleGetOrgPublicKey(id: number, sink: Sink): void {
  if (!requireOrgKeyed(sink, id, "getOrgPublicKey")) return;

  const msg: WorkerResponse = {
    id,
    ok: true,
    type: "getOrgPublicKey",
    orgPublicKey: encode(assertPresent(orgPublicKey, "orgPublicKey")),
  };
  sink(msg);
}

// ── Dispatcher factory ──────────────────────────────────────────────

export function createDispatcher(
  sink: Sink,
): (req: WorkerRequest | RewrapResultEvent) => void {
  return (req: WorkerRequest | RewrapResultEvent): void => {
    // Every message counts as activity for the idle self-zero backstop.
    armIdleSelfZero();

    if ("kind" in req) {
      handleRewrapResult(req);
      return;
    }

    const handle = async (): Promise<void> => {
      switch (req.type) {
        case "init":
          await handleInit(req.id, sink);
          break;
        case "argon2id":
          handleArgon2id(req, sink);
          break;
        case "oprfBlind":
          handleOprfBlind(req.id, sink);
          break;
        case "deriveKeys":
          handleDeriveKeys(req, sink);
          break;
        case "decryptContent":
          handleDecryptContent(req, sink);
          break;
        case "decryptAndRewrap":
          handleDecryptAndRewrap(req, sink);
          break;
        case "rewrapBlob":
          handleRewrapBlob(req, sink);
          break;
        case "encryptContent":
          handleEncryptContent(req, sink);
          break;
        case "decryptBlob":
          handleDecryptBlob(req, sink);
          break;
        case "evictTk":
          handleEvictTk(req, sink);
          break;
        case "zeroAll":
          handleZeroAll(req.id, sink);
          break;
        case "getVolPublic":
          handleGetVolPublic(req.id, sink);
          break;
        case "unwrapOrgKey":
          handleUnwrapOrgKey(req, sink);
          break;
        case "unwrapTk":
          handleUnwrapTk(req, sink);
          break;
        case "wrapWithVolPublic":
          handleWrapWithVolPublic(req, sink);
          break;
        case "sealSelfBlob":
          handleSealSelfBlob(req, sink);
          break;
        case "openSelfBlob":
          handleOpenSelfBlob(req, sink);
          break;
        case "rewrapTk":
          handleRewrapTk(req, sink);
          break;
        case "createTicketKey":
          handleCreateTicketKey(req, sink);
          break;
        case "orgDecrypt":
          handleOrgDecrypt(req, sink);
          break;
        case "orgEncrypt":
          handleOrgEncrypt(req, sink);
          break;
        case "orgDecryptBatch":
          handleOrgDecryptBatch(req, sink);
          break;
        case "exportOrgSecretKey":
          handleExportOrgSecretKey(req, sink);
          break;
        case "getOrgPublicKey":
          handleGetOrgPublicKey(req.id, sink);
          break;
        case "aliasHash":
          handleAliasHash(req, sink);
          break;
        case "connect":
        case "disconnect":
          // Handled by the SharedWorker entry point, not the core dispatcher.
          // Dedicated Worker ignores these (should not receive them).
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
