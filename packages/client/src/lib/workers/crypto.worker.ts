/**
 * Crypto Web Worker: security core for PII-tier key material.
 *
 * All PII-tier keys (masterKey, volPrivate, cached tks) live exclusively
 * in this Worker's memory. The main thread communicates via a typed
 * postMessage protocol (crypto-protocol.ts). Key material never appears
 * in any response; only public values (volPublic) and operation results
 * (plaintext, ciphertext) cross back to the main thread.
 *
 * State machine:
 *   UNINITIALIZED -> READY (after libsodium init)
 *   READY -> STRETCHED (after argon2id)
 *   STRETCHED -> BLINDED (after oprfBlind)
 *   BLINDED -> KEYED (after deriveKeys)
 *   KEYED -> READY (after zeroAll)
 *
 * References:
 *   SEC-206  ProtonMail Web Worker crypto isolation pattern
 *   SEC-207  ProtonMail CryptoProxy (main-thread bridge to Worker)
 *   SEC-210  W3C Web Crypto: keys shared via postMessage are XSS-vulnerable
 *   docs/design-ref/crypto-architecture-v2.md Section 3.5
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
  encode,
  decode,
  type Scalar,
  type RistrettoPoint,
  type SymmetricKey,
  type Salt,
  type Nonce,
  type EvaluatedElement,
  type Ciphertext,
} from "@care-y/crypto";
import type {
  WorkerRequest,
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
  RewrapTkRequest,
  CreateTicketKeyRequest,
  OrgDecryptRequest,
  OrgEncryptRequest,
  OrgDecryptBatchRequest,
  ExportOrgSecretKeyRequest,
  WorkerRequestType,
  RewrapEvent,
  RewrapResultEvent,
} from "./crypto-protocol.js";
import { TkCache } from "./tk-cache.js";

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

// ── Key material (Worker-only, never returned via postMessage) ──────

let stretched: Uint8Array | null = null;
let blindState: Scalar | null = null;
let masterKey: SymmetricKey | null = null;
let volPrivate: Scalar | null = null;
let volPublic: RistrettoPoint | null = null;

// Org-tier key material (Curve25519, non-PII). Kept in Worker for XSS isolation.
let orgSecret: Uint8Array | null = null;
let orgPublicKey: Uint8Array | null = null;

const tkCache = new TkCache({
  maxEntries: 50,
  memzero: (buf) => {
    requireSodium().memzero(buf);
  },
});

const pendingRewraps = new Set<string>();

// tk_temp values cached per follow-up ID for blob re-wrap.
// Evicted when RewrapResultEvent arrives (all re-wrap complete).
const rewrapTkTempCache = new Map<string, Uint8Array>();

// ── State machine ───────────────────────────────────────────────────

type WorkerState =
  | "UNINITIALIZED"
  | "READY"
  | "STRETCHED"
  | "BLINDED"
  | "KEYED";
let state: WorkerState = "UNINITIALIZED";

// ── Helpers ─────────────────────────────────────────────────────────

function postError(
  id: number,
  type: WorkerRequestType,
  error: string,
  code: ErrorResponse["code"],
): void {
  const msg: ErrorResponse = { id, ok: false, type, error, code };
  self.postMessage(msg);
}

function requireState(
  id: number,
  type: WorkerRequestType,
  expected: WorkerState,
): boolean {
  if (state !== expected) {
    postError(
      id,
      type,
      `Invalid state: expected ${expected}, got ${state}`,
      "INVALID_STATE",
    );
    return false;
  }
  return true;
}

function requireKeyed(id: number, type: WorkerRequestType): boolean {
  if (state !== "KEYED") {
    postError(id, type, "Worker not keyed (login required)", "NOT_READY");
    return false;
  }
  return true;
}

function requireOrgKeyed(id: number, type: WorkerRequestType): boolean {
  if (orgSecret === null) {
    postError(id, type, "Org key not loaded", "NOT_READY");
    return false;
  }
  return true;
}

/** Assert a state-guarded variable is non-null. Throws if violated (bug, not user error). */
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

// ── Handlers ────────────────────────────────────────────────────────

async function handleInit(id: number): Promise<void> {
  await getSodium();
  state = "READY";
  const msg: WorkerResponse = { id, ok: true, type: "init" };
  self.postMessage(msg);
}

function handleArgon2id(req: Argon2idRequest): void {
  if (!requireState(req.id, "argon2id", "READY")) return;

  const sodium = requireSodium();
  const passwordBuf = new Uint8Array(req.password);
  const saltBuf = new Uint8Array(req.salt);

  try {
    stretched = deriveAccountKey(passwordBuf, saltBuf as Salt);
    state = "STRETCHED";
    const msg: WorkerResponse = { id: req.id, ok: true, type: "argon2id" };
    self.postMessage(msg);
  } finally {
    sodium.memzero(passwordBuf);
    sodium.memzero(saltBuf);
  }
}

function handleOprfBlind(id: number): void {
  if (!requireState(id, "oprfBlind", "STRETCHED")) return;

  const result = oprfBlind(assertPresent(stretched, "stretched"));
  blindState = result.blindState;
  state = "BLINDED";

  const msg: WorkerResponse = {
    id,
    ok: true,
    type: "oprfBlind",
    blindedElement: encode(result.blindedElement),
  };
  self.postMessage(msg);
}

function handleDeriveKeys(req: DeriveKeysRequest): void {
  if (!requireState(req.id, "deriveKeys", "BLINDED")) return;

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
      self.postMessage(msg);
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
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly wrappedKey: string;
}

function resolveTk(req: KeyWrapRequest): Uint8Array | null {
  const cached = tkCache.get(req.ticketId);
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
    tkCache.set(req.ticketId, tk);
    return tk;
  } catch (err: unknown) {
    postError(
      req.id,
      req.type,
      err instanceof Error ? err.message : String(err),
      "DECRYPT_FAILED",
    );
    return null;
  }
}

function handleDecryptContent(req: DecryptContentRequest): void {
  if (!requireKeyed(req.id, "decryptContent")) return;

  const sodium = requireSodium();
  const tk = resolveTk(req);
  if (!tk) return;

  const ciphertextBuf = decode(req.ciphertext);

  try {
    const plaintext = decryptContent(
      ciphertextBuf as Ciphertext,
      tk as SymmetricKey,
    );

    try {
      const msg: WorkerResponse = {
        id: req.id,
        ok: true,
        type: "decryptContent",
        plaintext: textDecoder.decode(plaintext),
      };
      self.postMessage(msg);
    } finally {
      sodium.memzero(plaintext);
    }
  } catch (err: unknown) {
    postError(
      req.id,
      "decryptContent",
      err instanceof Error ? err.message : String(err),
      "DECRYPT_FAILED",
    );
  }
}

function unwrapTkTemp(req: DecryptAndRewrapRequest): Uint8Array | null {
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
      req.id,
      "decryptAndRewrap",
      err instanceof Error ? err.message : String(err),
      "DECRYPT_FAILED",
    );
    return null;
  }
}

function handleDecryptAndRewrap(req: DecryptAndRewrapRequest): void {
  if (!requireKeyed(req.id, "decryptAndRewrap")) return;

  const sodium = requireSodium();
  const tkTemp = unwrapTkTemp(req);
  if (!tkTemp) return;

  // Cache tk_temp for later blob re-wrap requests from the main thread.
  // Evicted when RewrapResultEvent arrives.
  rewrapTkTempCache.set(req.followUpId, tkTemp);

  const ciphertextBuf = decode(req.ciphertext);

  try {
    const plaintext = decryptContent(
      ciphertextBuf as Ciphertext,
      tkTemp as SymmetricKey,
    );

    try {
      const msg: WorkerResponse = {
        id: req.id,
        ok: true,
        type: "decryptAndRewrap",
        plaintext: textDecoder.decode(plaintext),
      };
      self.postMessage(msg);
    } finally {
      triggerRewrap(req.followUpId, req.ticketId, plaintext, sodium);
    }
  } catch (err: unknown) {
    postError(
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
  sodium: ReturnType<typeof requireSodium>,
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
    const reEncrypted = encryptContent(plaintext, canonicalTk as SymmetricKey);
    pendingRewraps.add(followUpId);
    const event: RewrapEvent = {
      kind: "rewrap",
      followUpId,
      ticketId,
      encryptedContent: encode(reEncrypted),
    };
    self.postMessage(event);
  } catch (err: unknown) {
    pendingRewraps.delete(followUpId);
    if (import.meta.env.DEV) {
      console.warn("[triggerRewrap] failed for", followUpId, err);
    }
  } finally {
    sodium.memzero(plaintext);
  }
}

function handleRewrapBlob(req: RewrapBlobRequest): void {
  if (!requireKeyed(req.id, "rewrapBlob")) return;

  const sodium = requireSodium();
  const tkTemp = rewrapTkTempCache.get(req.followUpId);
  if (!tkTemp) {
    postError(
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
      req.id,
      "rewrapBlob",
      `No cached tk for ticket ${req.ticketId}`,
      "TK_NOT_CACHED",
    );
    return;
  }

  const ciphertextBuf = decode(req.ciphertext);

  try {
    const blobPlaintext = decryptContent(
      ciphertextBuf as Ciphertext,
      tkTemp as SymmetricKey,
    );
    try {
      const reEncrypted = encryptContent(
        blobPlaintext,
        canonicalTk as SymmetricKey,
      );
      const msg: WorkerResponse = {
        id: req.id,
        ok: true,
        type: "rewrapBlob",
        encryptedData: encode(reEncrypted),
        blobKey: req.blobKey,
        category: req.category,
      };
      self.postMessage(msg);
    } finally {
      sodium.memzero(blobPlaintext);
    }
  } catch (err: unknown) {
    postError(
      req.id,
      "rewrapBlob",
      err instanceof Error ? err.message : String(err),
      "REWRAP_FAILED",
    );
  }
}

function handleRewrapResult(event: RewrapResultEvent): void {
  pendingRewraps.delete(event.followUpId);
  const tkTemp = rewrapTkTempCache.get(event.followUpId);
  if (tkTemp) {
    requireSodium().memzero(tkTemp);
    rewrapTkTempCache.delete(event.followUpId);
  }
}

function handleDecryptBlob(req: DecryptBlobRequest): void {
  if (!requireKeyed(req.id, "decryptBlob")) return;

  const sodium = requireSodium();
  const tk = resolveTk(req);
  if (!tk) return;

  try {
    const ciphertextBuf = decode(req.ciphertext);
    const plainBytes = decryptContent(
      ciphertextBuf as Ciphertext,
      tk as SymmetricKey,
    );

    // Copy into a fresh ArrayBuffer for Transferable ownership.
    const abuf = new ArrayBuffer(plainBytes.byteLength);
    new Uint8Array(abuf).set(plainBytes);
    sodium.memzero(plainBytes);

    const msg: WorkerResponse = {
      id: req.id,
      ok: true,
      type: "decryptBlob",
      data: abuf,
    };
    self.postMessage(msg, { transfer: [abuf] });
  } catch (err: unknown) {
    postError(
      req.id,
      "decryptBlob",
      err instanceof Error ? err.message : String(err),
      "DECRYPT_FAILED",
    );
  }
}

function handleEncryptContent(req: EncryptContentRequest): void {
  if (!requireKeyed(req.id, "encryptContent")) return;

  const tk = tkCache.get(req.ticketId);
  if (!tk) {
    postError(
      req.id,
      "encryptContent",
      `No cached tk for ticket ${req.ticketId}`,
      "TK_NOT_CACHED",
    );
    return;
  }

  const plaintextBuf = textEncoder.encode(req.plaintext);

  try {
    const ciphertext = encryptContent(plaintextBuf, tk as SymmetricKey);

    const msg: WorkerResponse = {
      id: req.id,
      ok: true,
      type: "encryptContent",
      ciphertext: encode(ciphertext),
    };
    self.postMessage(msg);
  } catch (err: unknown) {
    postError(
      req.id,
      "encryptContent",
      err instanceof Error ? err.message : String(err),
      "ENCRYPT_FAILED",
    );
  }
}

function handleEvictTk(req: EvictTkRequest): void {
  tkCache.evict(req.ticketId);
  const msg: WorkerResponse = { id: req.id, ok: true, type: "evictTk" };
  self.postMessage(msg);
}

/** Zero a key buffer and null the reference. */
function zeroAndClear(
  sodium: ReturnType<typeof requireSodium>,
  buf: Uint8Array | null,
): null {
  if (buf) sodium.memzero(buf);
  return null;
}

function handleZeroAll(id: number): void {
  const sodium = requireSodium();

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

  // Public keys are not secret, no memzero needed
  volPublic = null;
  orgPublicKey = null;
  state = "READY";

  const msg: WorkerResponse = { id, ok: true, type: "zeroAll" };
  self.postMessage(msg);
}

function handleGetVolPublic(id: number): void {
  if (!requireKeyed(id, "getVolPublic")) return;

  const msg: WorkerResponse = {
    id,
    ok: true,
    type: "getVolPublic",
    volPublic: encode(assertPresent(volPublic, "volPublic")),
  };
  self.postMessage(msg);
}

function handleUnwrapOrgKey(req: UnwrapOrgKeyRequest): void {
  if (!requireKeyed(req.id, "unwrapOrgKey")) return;

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

    // Zero any previous org key before storing the new one
    orgSecret = zeroAndClear(sodium, orgSecret);
    orgPublicKey = null;

    // Keep the secret in the Worker. Derive the Curve25519 public key.
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
    self.postMessage(msg);
  } catch (err: unknown) {
    postError(
      req.id,
      "unwrapOrgKey",
      err instanceof Error ? err.message : String(err),
      "UNWRAP_FAILED",
    );
  }
}

function handleUnwrapTk(req: UnwrapTkRequest): void {
  if (!requireKeyed(req.id, "unwrapTk")) return;

  // resolveTk unwraps via ECIES and caches the tk as a side effect.
  // The returned value is unused here; the goal is the cache fill.
  const tk = resolveTk(req);
  if (!tk) return;

  const msg: WorkerResponse = { id: req.id, ok: true, type: "unwrapTk" };
  self.postMessage(msg);
}

function handleWrapWithVolPublic(req: WrapWithVolPublicRequest): void {
  if (!requireKeyed(req.id, "wrapWithVolPublic")) return;

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
    self.postMessage(msg);
  } catch (err: unknown) {
    postError(
      req.id,
      "wrapWithVolPublic",
      err instanceof Error ? err.message : String(err),
      "ENCRYPT_FAILED",
    );
  }
}

function handleRewrapTk(req: RewrapTkRequest): void {
  if (!requireKeyed(req.id, "rewrapTk")) return;

  const tk = tkCache.get(req.ticketId);
  if (!tk) {
    postError(
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
    self.postMessage(msg);
  } catch (err: unknown) {
    postError(
      req.id,
      "rewrapTk",
      err instanceof Error ? err.message : String(err),
      "REWRAP_FAILED",
    );
  }
}

function handleCreateTicketKey(req: CreateTicketKeyRequest): void {
  if (!requireKeyed(req.id, "createTicketKey")) return;

  const sodium = requireSodium();
  const tk = generateContentKey();

  try {
    const encryptedFields = req.fields.map((f) => {
      const plaintextBuf = textEncoder.encode(f.plaintext);
      const ciphertext = encryptContent(plaintextBuf, tk);
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
    self.postMessage(msg);
  } catch (err: unknown) {
    postError(
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

function handleOrgDecrypt(req: OrgDecryptRequest): void {
  if (!requireOrgKeyed(req.id, "orgDecrypt")) return;

  const sodium = requireSodium();
  const ciphertext = decode(req.ciphertext);

  try {
    const plainBytes = sodium.crypto_box_seal_open(
      ciphertext,
      assertPresent(orgPublicKey, "orgPublicKey"),
      assertPresent(orgSecret, "orgSecret"),
    );

    try {
      // Return base64 of raw bytes (not UTF-8 text) to support binary content
      const msg: WorkerResponse = {
        id: req.id,
        ok: true,
        type: "orgDecrypt",
        plaintext: encode(plainBytes),
      };
      self.postMessage(msg);
    } finally {
      sodium.memzero(plainBytes);
    }
  } catch (err: unknown) {
    postError(
      req.id,
      "orgDecrypt",
      err instanceof Error ? err.message : String(err),
      "DECRYPT_FAILED",
    );
  }
}

function handleOrgEncrypt(req: OrgEncryptRequest): void {
  if (!requireOrgKeyed(req.id, "orgEncrypt")) return;

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
    self.postMessage(msg);
  } catch (err: unknown) {
    postError(
      req.id,
      "orgEncrypt",
      err instanceof Error ? err.message : String(err),
      "ENCRYPT_FAILED",
    );
  }
}

function handleOrgDecryptBatch(req: OrgDecryptBatchRequest): void {
  if (!requireOrgKeyed(req.id, "orgDecryptBatch")) return;

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
  self.postMessage(msg);
}

function handleExportOrgSecretKey(req: ExportOrgSecretKeyRequest): void {
  if (!requireOrgKeyed(req.id, "exportOrgSecretKey")) return;

  const sk = assertPresent(orgSecret, "orgSecret");
  const abuf = new ArrayBuffer(sk.byteLength);
  new Uint8Array(abuf).set(sk);

  const msg: WorkerResponse = {
    id: req.id,
    ok: true,
    type: "exportOrgSecretKey",
    orgSecretKey: abuf,
  };
  self.postMessage(msg, { transfer: [abuf] });
}

function handleGetOrgPublicKey(id: number): void {
  if (!requireOrgKeyed(id, "getOrgPublicKey")) return;

  const msg: WorkerResponse = {
    id,
    ok: true,
    type: "getOrgPublicKey",
    orgPublicKey: encode(assertPresent(orgPublicKey, "orgPublicKey")),
  };
  self.postMessage(msg);
}

// ── Message dispatcher ──────────────────────────────────────────────

self.addEventListener(
  "message",
  (event: MessageEvent<WorkerRequest | RewrapResultEvent>): void => {
    const req = event.data;

    // Handle main-thread events (not request-response)
    if ("kind" in req) {
      handleRewrapResult(req);
      return;
    }

    const handle = async (): Promise<void> => {
      switch (req.type) {
        case "init":
          await handleInit(req.id);
          break;
        case "argon2id":
          handleArgon2id(req);
          break;
        case "oprfBlind":
          handleOprfBlind(req.id);
          break;
        case "deriveKeys":
          handleDeriveKeys(req);
          break;
        case "decryptContent":
          handleDecryptContent(req);
          break;
        case "decryptAndRewrap":
          handleDecryptAndRewrap(req);
          break;
        case "rewrapBlob":
          handleRewrapBlob(req);
          break;
        case "encryptContent":
          handleEncryptContent(req);
          break;
        case "decryptBlob":
          handleDecryptBlob(req);
          break;
        case "evictTk":
          handleEvictTk(req);
          break;
        case "zeroAll":
          handleZeroAll(req.id);
          break;
        case "getVolPublic":
          handleGetVolPublic(req.id);
          break;
        case "unwrapOrgKey":
          handleUnwrapOrgKey(req);
          break;
        case "unwrapTk":
          handleUnwrapTk(req);
          break;
        case "wrapWithVolPublic":
          handleWrapWithVolPublic(req);
          break;
        case "rewrapTk":
          handleRewrapTk(req);
          break;
        case "createTicketKey":
          handleCreateTicketKey(req);
          break;
        case "orgDecrypt":
          handleOrgDecrypt(req);
          break;
        case "orgEncrypt":
          handleOrgEncrypt(req);
          break;
        case "orgDecryptBatch":
          handleOrgDecryptBatch(req);
          break;
        case "exportOrgSecretKey":
          handleExportOrgSecretKey(req);
          break;
        case "getOrgPublicKey":
          handleGetOrgPublicKey(req.id);
          break;
      }
    };

    handle().catch((err: unknown) => {
      postError(
        req.id,
        req.type,
        err instanceof Error ? err.message : String(err),
        "WORKER_ERROR",
      );
    });
  },
);
