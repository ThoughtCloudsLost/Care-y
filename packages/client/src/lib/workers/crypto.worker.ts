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
  EncryptContentRequest,
  EvictTkRequest,
  UnwrapOrgKeyRequest,
  RewrapTkRequest,
  WorkerRequestType,
} from "./crypto-protocol.js";
import { TkCache } from "./tk-cache.js";

// ── Key material (Worker-only, never returned via postMessage) ──────

let stretched: Uint8Array | null = null;
let blindState: Scalar | null = null;
let masterKey: SymmetricKey | null = null;
let volPrivate: Scalar | null = null;
let volPublic: RistrettoPoint | null = null;

const tkCache = new TkCache({
  maxEntries: 50,
  memzero: (buf) => {
    requireSodium().memzero(buf);
  },
});

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

function handleDecryptContent(req: DecryptContentRequest): void {
  if (!requireKeyed(req.id, "decryptContent")) return;

  const sodium = requireSodium();

  // Check tk cache first
  let tk = tkCache.get(req.ticketId);

  if (!tk) {
    // Cache miss: unwrap tk via ECIES
    const ephemeralPoint = decode(req.ephemeralPoint);
    const nonce = decode(req.nonce);
    const wrappedKey = decode(req.wrappedKey);

    try {
      tk = eciesDecrypt(
        ephemeralPoint as RistrettoPoint,
        nonce as Nonce,
        wrappedKey,
        assertPresent(volPrivate, "volPrivate"),
      );
    } catch (err: unknown) {
      postError(
        req.id,
        "decryptContent",
        err instanceof Error ? err.message : String(err),
        "DECRYPT_FAILED",
      );
      return;
    }

    // Cache the unwrapped tk
    tkCache.set(req.ticketId, tk);
  }

  // Decrypt content with tk
  const ciphertextBuf = decode(req.ciphertext);

  try {
    const plaintext = decryptContent(
      ciphertextBuf as Ciphertext,
      tk as SymmetricKey,
    );

    const msg: WorkerResponse = {
      id: req.id,
      ok: true,
      type: "decryptContent",
      plaintext: new TextDecoder().decode(plaintext),
    };
    self.postMessage(msg);

    sodium.memzero(plaintext);
  } catch (err: unknown) {
    postError(
      req.id,
      "decryptContent",
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

  const plaintextBuf = new TextEncoder().encode(req.plaintext);

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

  volPrivate = zeroAndClear(sodium, volPrivate);
  masterKey = zeroAndClear(sodium, masterKey);
  stretched = zeroAndClear(sodium, stretched);
  blindState = zeroAndClear(sodium, blindState);

  // volPublic is public (stored on server), no memzero needed
  volPublic = null;
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

  try {
    // care-y-ignore-next-line no-org-private-key-server -- client-side Worker, not server
    const unwrappedOrgSecret = eciesDecrypt(
      ephemeralPoint as RistrettoPoint,
      nonce as Nonce,
      wrappedKey,
      assertPresent(volPrivate, "volPrivate"),
    );

    // Transfer the unwrapped org secret to the main thread (non-PII tier).
    // Using Transferable so the Worker copy is neutered.
    // Copy into a fresh ArrayBuffer to ensure correct type and clean ownership.
    const abuf = new ArrayBuffer(unwrappedOrgSecret.byteLength);
    new Uint8Array(abuf).set(unwrappedOrgSecret);
    const sodium = requireSodium();
    sodium.memzero(unwrappedOrgSecret);

    const msg: WorkerResponse = {
      id: req.id,
      ok: true,
      type: "unwrapOrgKey",
      // care-y-ignore-next-line no-org-private-key-server -- protocol field name, client-side Worker
      orgPrivateKey: abuf,
    };
    // postMessage with Transferable list. In a Worker global scope,
    // postMessage accepts (message, transfer[]) but TypeScript resolves
    // to the Window overload in this compilation target. Use the
    // structured options form which both overloads accept.
    self.postMessage(msg, { transfer: [abuf] });
  } catch (err: unknown) {
    postError(
      req.id,
      "unwrapOrgKey",
      err instanceof Error ? err.message : String(err),
      "UNWRAP_FAILED",
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

// ── Message dispatcher ──────────────────────────────────────────────

self.addEventListener("message", (event: MessageEvent<WorkerRequest>): void => {
  const req = event.data;

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
      case "encryptContent":
        handleEncryptContent(req);
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
      case "rewrapTk":
        handleRewrapTk(req);
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
});
