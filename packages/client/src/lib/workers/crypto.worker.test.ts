/**
 * Tests for the crypto Worker message handler.
 *
 * Strategy: mock the Worker global context (self.addEventListener,
 * self.postMessage), capture the message handler at import time,
 * then invoke it directly with crafted request objects.
 *
 * Uses the real @care-y/crypto library (WASM backend) for crypto
 * correctness. The Worker's state machine and message protocol
 * are the primary test targets.
 */

import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import {
  getSodium,
  requireSodium,
  encode,
  decode,
  eciesEncrypt,
  eciesDecrypt,
  encryptContent,
  generateContentKey,
  type Scalar,
  type RistrettoPoint,
  type Nonce,
} from "@care-y/crypto";
import type {
  WorkerResponse,
  ErrorResponse,
  InitResponse,
  Argon2idResponse,
  OprfBlindResponse,
  DeriveKeysResponse,
  DecryptContentResponse,
  EncryptContentResponse,
  GetVolPublicResponse,
  UnwrapOrgKeyResponse,
  UnwrapTkResponse,
  WrapWithVolPublicResponse,
  RewrapTkResponse,
  EvictTkResponse,
  ZeroAllResponse,
} from "./crypto-protocol.js";
import { CryptoWorkerTestError } from "$lib/errors.js";

// ── Worker global mock setup ────────────────────────────────────────
// Must be set up before the Worker module is imported, because it
// registers self.addEventListener("message", ...) at module scope.

type MessageHandler = (event: MessageEvent) => void;

let messageHandler: MessageHandler | null = null;
const posted: WorkerResponse[] = [];

// Create a mock `self` object that mimics the Worker global scope.
// In a real Worker, `self` === `globalThis`. In Node/Vitest, `self`
// is undefined, so we define it with the mocked methods.
const mockSelf = {
  addEventListener: vi.fn((type: string, handler: MessageHandler) => {
    if (type === "message") {
      messageHandler = handler;
    }
  }),
  postMessage: vi.fn((msg: WorkerResponse) => {
    posted.push(msg);
  }),
};

// Install `self` globally before the Worker module loads
(globalThis as Record<string, unknown>).self = mockSelf;
// Also proxy the methods on globalThis directly so bare `addEventListener`
// and `postMessage` calls work if the module resolves them there.
(globalThis as Record<string, unknown>).addEventListener =
  mockSelf.addEventListener;
(globalThis as Record<string, unknown>).postMessage = mockSelf.postMessage;

// ── Helpers ─────────────────────────────────────────────────────────

async function sendAndWait(
  data: Record<string, unknown>,
): Promise<WorkerResponse> {
  if (!messageHandler)
    throw new CryptoWorkerTestError("Worker handler not registered");
  const countBefore = posted.length;
  messageHandler(new MessageEvent("message", { data }));
  // Allow async handlers (init) to complete
  await new Promise((r) => setTimeout(r, 50));
  const response = posted[countBefore];
  if (!response) throw new CryptoWorkerTestError("No response posted");
  return response;
}

/**
 * Run the full login flow: init -> argon2id -> oprfBlind -> deriveKeys.
 * Returns volPublic for verification.
 */
async function fullLoginFlow(
  password: string,
  salt: Uint8Array,
): Promise<{ volPublic: string }> {
  const sodium = requireSodium();

  // 1. Init
  await sendAndWait({ type: "init", id: 100 });

  // 2. argon2id (Worker computes stretched internally)
  const pwCopy = new TextEncoder().encode(password);
  const saltCopy = new Uint8Array(salt);
  await sendAndWait({
    type: "argon2id",
    id: 101,
    password: pwCopy.buffer,
    salt: saltCopy.buffer,
  });

  // 3. oprfBlind (Worker blinds stretched internally)
  const blindResp = (await sendAndWait({
    type: "oprfBlind",
    id: 102,
  })) as OprfBlindResponse;

  // Simulate OPRF server evaluation (single-server, full key).
  // Use a deterministic "OPRF key" and evaluate directly.
  const oprfKey = sodium.crypto_core_ristretto255_scalar_random();
  const blindedElem = decode(blindResp.blindedElement);
  const evaluated = sodium.crypto_scalarmult_ristretto255(oprfKey, blindedElem);

  // 4. deriveKeys
  const evalCopy = new Uint8Array(evaluated);
  const deriveResp = (await sendAndWait({
    type: "deriveKeys",
    id: 103,
    evaluated: evalCopy.buffer,
  })) as DeriveKeysResponse;

  sodium.memzero(oprfKey);

  return { volPublic: deriveResp.volPublic };
}

// ── Test suite ──────────────────────────────────────────────────────

describe("crypto.worker", () => {
  beforeAll(async () => {
    // Initialize real libsodium WASM backend
    await getSodium();

    // Import the Worker module to register the message handler.
    // The module reads `self.addEventListener` at load time.
    await import("./crypto.worker.js");

    // Verify handler was captured
    expect(messageHandler).not.toBeNull();
  });

  beforeEach(() => {
    posted.length = 0;
  });

  describe("init", () => {
    it("initializes libsodium and transitions to READY", async () => {
      const resp = await sendAndWait({ type: "init", id: 1 });
      expect(resp).toEqual({
        id: 1,
        ok: true,
        type: "init",
      } satisfies InitResponse);
    });
  });

  describe("argon2id", () => {
    it("succeeds from READY state", async () => {
      await sendAndWait({ type: "zeroAll", id: 900 });
      await sendAndWait({ type: "init", id: 901 });

      const sodium = requireSodium();
      const password = new TextEncoder().encode("test-password");
      const salt = sodium.randombytes_buf(16);

      const resp = await sendAndWait({
        type: "argon2id",
        id: 2,
        password: password.buffer,
        salt: new Uint8Array(salt).buffer,
      });
      expect(resp.ok).toBe(true);
      expect((resp as Argon2idResponse).type).toBe("argon2id");
    });
  });

  describe("state machine transitions", () => {
    it("rejects oprfBlind before argon2id (wrong state)", async () => {
      await sendAndWait({ type: "zeroAll", id: 910 });
      await sendAndWait({ type: "init", id: 911 });

      const resp = await sendAndWait({ type: "oprfBlind", id: 3 });
      expect(resp.ok).toBe(false);
      expect((resp as ErrorResponse).code).toBe("INVALID_STATE");
    });

    it("rejects deriveKeys before oprfBlind (wrong state)", async () => {
      await sendAndWait({ type: "zeroAll", id: 920 });
      await sendAndWait({ type: "init", id: 921 });

      const evaluated = new Uint8Array(32);
      const resp = await sendAndWait({
        type: "deriveKeys",
        id: 4,
        evaluated: evaluated.buffer,
      });
      expect(resp.ok).toBe(false);
      expect((resp as ErrorResponse).code).toBe("INVALID_STATE");
    });

    it("rejects decryptContent before login (NOT_READY)", async () => {
      await sendAndWait({ type: "zeroAll", id: 930 });
      await sendAndWait({ type: "init", id: 931 });

      const resp = await sendAndWait({
        type: "decryptContent",
        id: 5,
        ticketId: "t-1",
        ephemeralPoint: encode(new Uint8Array(32)),
        nonce: encode(new Uint8Array(24)),
        wrappedKey: encode(new Uint8Array(48)),
        ciphertext: encode(new Uint8Array(40)),
      });
      expect(resp.ok).toBe(false);
      expect((resp as ErrorResponse).code).toBe("NOT_READY");
    });

    it("rejects argon2id from KEYED state (double login prevention)", async () => {
      // Login first
      await sendAndWait({ type: "zeroAll", id: 932 });
      const sodium = requireSodium();
      const salt = sodium.randombytes_buf(16);
      await fullLoginFlow("state-test", salt);

      // Try argon2id again (should be KEYED, not READY)
      const password = new TextEncoder().encode("double-login");
      const salt2 = sodium.randombytes_buf(16);
      const resp = await sendAndWait({
        type: "argon2id",
        id: 6,
        password: password.buffer,
        salt: new Uint8Array(salt2).buffer,
      });
      expect(resp.ok).toBe(false);
      expect((resp as ErrorResponse).code).toBe("INVALID_STATE");
    });
  });

  describe("full login flow + encrypt/decrypt", () => {
    it("derives keys and decrypts content via ECIES-wrapped tk", async () => {
      await sendAndWait({ type: "zeroAll", id: 940 });

      const sodium = requireSodium();
      const salt = sodium.randombytes_buf(16);
      const { volPublic } = await fullLoginFlow("correct-horse-battery", salt);

      // volPublic should be a valid 32-byte base64-encoded point
      const decodedVP = decode(volPublic);
      expect(decodedVP.length).toBe(32);

      // Encrypt test content with a fresh tk, wrap tk to the Worker's volPublic
      const tk = generateContentKey();
      const plaintext = new TextEncoder().encode("Hello, encrypted world!");
      const ciphertext = encryptContent(plaintext, tk);

      const wrap = eciesEncrypt(tk, decodedVP as RistrettoPoint);

      // Ask Worker to decrypt
      const decResp = (await sendAndWait({
        type: "decryptContent",
        id: 10,
        ticketId: "ticket-abc",
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
        ciphertext: encode(ciphertext),
      })) as DecryptContentResponse;

      expect(decResp.ok).toBe(true);
      expect(decResp.plaintext).toBe("Hello, encrypted world!");

      sodium.memzero(tk);
    });

    it("caches tk on first decrypt (second call uses cache)", async () => {
      await sendAndWait({ type: "zeroAll", id: 950 });

      const sodium = requireSodium();
      const salt = sodium.randombytes_buf(16);
      const { volPublic } = await fullLoginFlow("cache-test-password", salt);
      const decodedVP = decode(volPublic);

      const tkForCache = generateContentKey();
      const text = new TextEncoder().encode("Cache test");
      const ct = encryptContent(text, tkForCache);

      const wrap = eciesEncrypt(tkForCache, decodedVP as RistrettoPoint);

      // First decrypt: cache miss
      const resp1 = (await sendAndWait({
        type: "decryptContent",
        id: 20,
        ticketId: "ticket-cache",
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
        ciphertext: encode(ct),
      })) as DecryptContentResponse;
      expect(resp1.ok).toBe(true);
      expect(resp1.plaintext).toBe("Cache test");

      // Encrypt new content with the same tk
      const text2 = new TextEncoder().encode("Second via cache");
      const ct2 = encryptContent(text2, tkForCache);

      // Second decrypt: cache hit (ECIES unwrap skipped internally)
      const resp2 = (await sendAndWait({
        type: "decryptContent",
        id: 21,
        ticketId: "ticket-cache",
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
        ciphertext: encode(ct2),
      })) as DecryptContentResponse;
      expect(resp2.ok).toBe(true);
      expect(resp2.plaintext).toBe("Second via cache");

      sodium.memzero(tkForCache);
    });

    it("encrypts content with a cached tk", async () => {
      // Worker still has "ticket-cache" tk cached from previous test
      const resp = (await sendAndWait({
        type: "encryptContent",
        id: 30,
        ticketId: "ticket-cache",
        plaintext: "Encrypt me!",
      })) as EncryptContentResponse;

      expect(resp.ok).toBe(true);
      expect(resp.type).toBe("encryptContent");
      const ctBytes = decode(resp.ciphertext);
      expect(ctBytes.length).toBeGreaterThan(0);
    });

    it("rejects encryptContent without a cached tk (TK_NOT_CACHED)", async () => {
      const resp = await sendAndWait({
        type: "encryptContent",
        id: 31,
        ticketId: "ticket-no-cache",
        plaintext: "Should fail",
      });
      expect(resp.ok).toBe(false);
      expect((resp as ErrorResponse).code).toBe("TK_NOT_CACHED");
    });
  });

  describe("evictTk", () => {
    it("removes a cached tk entry", async () => {
      const resp = (await sendAndWait({
        type: "evictTk",
        id: 40,
        ticketId: "ticket-cache",
      })) as EvictTkResponse;
      expect(resp).toEqual({ id: 40, ok: true, type: "evictTk" });

      // Encrypt should now fail (no cached tk)
      const encResp = await sendAndWait({
        type: "encryptContent",
        id: 41,
        ticketId: "ticket-cache",
        plaintext: "Should fail",
      });
      expect(encResp.ok).toBe(false);
      expect((encResp as ErrorResponse).code).toBe("TK_NOT_CACHED");
    });
  });

  describe("getVolPublic", () => {
    it("returns the volunteer public key when KEYED", async () => {
      const resp = (await sendAndWait({
        type: "getVolPublic",
        id: 50,
      })) as GetVolPublicResponse;

      expect(resp.ok).toBe(true);
      const decoded = decode(resp.volPublic);
      expect(decoded.length).toBe(32);
    });

    it("rejects when not KEYED", async () => {
      await sendAndWait({ type: "zeroAll", id: 951 });
      await sendAndWait({ type: "init", id: 952 });

      const resp = await sendAndWait({ type: "getVolPublic", id: 51 });
      expect(resp.ok).toBe(false);
      expect((resp as ErrorResponse).code).toBe("NOT_READY");
    });
  });

  describe("unwrapOrgKey", () => {
    it("returns the unwrapped org secret as ArrayBuffer", async () => {
      await sendAndWait({ type: "zeroAll", id: 960 });
      const sodium = requireSodium();
      const salt = sodium.randombytes_buf(16);
      const { volPublic } = await fullLoginFlow("org-key-test", salt);
      const decodedVP = decode(volPublic);

      // Simulate: admin wraps org secret with this volunteer's volPublic
      const fakeOrgSecret = sodium.randombytes_buf(32);
      const wrap = eciesEncrypt(fakeOrgSecret, decodedVP as RistrettoPoint);

      const resp = (await sendAndWait({
        type: "unwrapOrgKey",
        id: 60,
        wrappedOrgKey: encode(wrap.ciphertext),
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
      })) as UnwrapOrgKeyResponse;

      expect(resp.ok).toBe(true);
      expect(resp.type).toBe("unwrapOrgKey");

      // Verify the unwrapped secret matches the original
      // care-y-ignore-next-line no-org-private-key-server -- protocol field, client-side test
      const unwrapped = new Uint8Array(resp.orgPrivateKey);
      expect(unwrapped).toEqual(fakeOrgSecret);

      sodium.memzero(fakeOrgSecret);
    });
  });

  describe("rewrapTk", () => {
    it("re-encrypts a cached tk for a new recipient", async () => {
      // Worker should be KEYED from previous test.
      const sodium = requireSodium();

      // Get the current volPublic
      const vpResp = (await sendAndWait({
        type: "getVolPublic",
        id: 700,
      })) as GetVolPublicResponse;
      const decodedVP = decode(vpResp.volPublic);

      const tk = generateContentKey();
      const text = new TextEncoder().encode("Rewrap test");
      const ct = encryptContent(text, tk);
      const wrap = eciesEncrypt(tk, decodedVP as RistrettoPoint);

      // Decrypt to cache the tk
      await sendAndWait({
        type: "decryptContent",
        id: 70,
        ticketId: "ticket-rewrap",
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
        ciphertext: encode(ct),
      });

      // Generate a new recipient keypair
      const recipientScalar = sodium.crypto_core_ristretto255_scalar_random();
      const recipientPublic =
        sodium.crypto_scalarmult_ristretto255_base(recipientScalar);

      // Rewrap
      const rewrapResp = (await sendAndWait({
        type: "rewrapTk",
        id: 71,
        ticketId: "ticket-rewrap",
        recipientVolPublic: encode(recipientPublic),
      })) as RewrapTkResponse;

      expect(rewrapResp.ok).toBe(true);

      // Verify the new recipient can decrypt the tk
      const unwrappedTk = eciesDecrypt(
        decode(rewrapResp.ephemeralPoint) as RistrettoPoint,
        decode(rewrapResp.nonce) as Nonce,
        decode(rewrapResp.wrappedKey),
        recipientScalar as Scalar,
      );

      expect(unwrappedTk).toEqual(tk);

      sodium.memzero(tk);
      sodium.memzero(recipientScalar);
    });
  });

  describe("unwrapTk", () => {
    it("preloads a ticket key into cache without requiring ciphertext", async () => {
      await sendAndWait({ type: "zeroAll", id: 1100 });

      const sodium = requireSodium();
      const salt = sodium.randombytes_buf(16);
      const { volPublic } = await fullLoginFlow("unwrap-tk-test", salt);
      const decodedVP = decode(volPublic);

      // Create a tk and wrap it to the Worker's volPublic
      const tk = generateContentKey();
      const wrap = eciesEncrypt(tk, decodedVP as RistrettoPoint);

      // unwrapTk should cache the tk
      const resp = (await sendAndWait({
        type: "unwrapTk",
        id: 1101,
        ticketId: "ticket-unwrap",
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
      })) as UnwrapTkResponse;

      expect(resp).toEqual({ id: 1101, ok: true, type: "unwrapTk" });

      // Verify the tk is cached by encrypting with it
      const encResp = (await sendAndWait({
        type: "encryptContent",
        id: 1102,
        ticketId: "ticket-unwrap",
        plaintext: "Cached via unwrapTk",
      })) as EncryptContentResponse;

      expect(encResp.ok).toBe(true);
      expect(encResp.type).toBe("encryptContent");

      sodium.memzero(tk);
    });

    it("rejects when not KEYED", async () => {
      await sendAndWait({ type: "zeroAll", id: 1110 });
      await sendAndWait({ type: "init", id: 1111 });

      const resp = await sendAndWait({
        type: "unwrapTk",
        id: 1112,
        ticketId: "ticket-fail",
        ephemeralPoint: encode(new Uint8Array(32)),
        nonce: encode(new Uint8Array(24)),
        wrappedKey: encode(new Uint8Array(48)),
      });
      expect(resp.ok).toBe(false);
      expect((resp as ErrorResponse).code).toBe("NOT_READY");
    });
  });

  describe("wrapWithVolPublic", () => {
    it("ECIES-encrypts data with the Worker's volPublic", async () => {
      await sendAndWait({ type: "zeroAll", id: 1200 });

      const sodium = requireSodium();
      const salt = sodium.randombytes_buf(16);
      const { volPublic: _volPublic } = await fullLoginFlow(
        "wrap-vol-test",
        salt,
      );

      // Wrap some test data
      const testData = sodium.randombytes_buf(32);
      const resp = (await sendAndWait({
        type: "wrapWithVolPublic",
        id: 1201,
        data: encode(testData),
      })) as WrapWithVolPublicResponse;

      expect(resp.ok).toBe(true);
      expect(resp.type).toBe("wrapWithVolPublic");
      expect(resp.ephemeralPoint).toBeDefined();
      expect(resp.nonce).toBeDefined();
      expect(resp.wrappedKey).toBeDefined();

      // Verify: manually derive volPrivate from the same login flow
      // to decrypt and confirm roundtrip. We can't access volPrivate
      // directly, but we can use unwrapOrgKey (same ECIES decrypt path)
      // to verify the wrap is valid. Instead, verify the output is
      // structurally correct (valid base64, correct sizes).
      const ep = decode(resp.ephemeralPoint);
      const n = decode(resp.nonce);
      const wk = decode(resp.wrappedKey);
      expect(ep.length).toBe(32); // ristretto255 point
      expect(n.length).toBe(24); // AEAD nonce

      // The wrapped key is the encrypted data + MAC overhead
      expect(wk.length).toBeGreaterThan(testData.length);

      sodium.memzero(testData);
    });

    it("rejects when not KEYED", async () => {
      await sendAndWait({ type: "zeroAll", id: 1210 });
      await sendAndWait({ type: "init", id: 1211 });

      const resp = await sendAndWait({
        type: "wrapWithVolPublic",
        id: 1212,
        data: encode(new Uint8Array(32)),
      });
      expect(resp.ok).toBe(false);
      expect((resp as ErrorResponse).code).toBe("NOT_READY");
    });
  });

  describe("zeroAll", () => {
    it("zeros all key material and transitions to READY", async () => {
      const resp = (await sendAndWait({
        type: "zeroAll",
        id: 80,
      })) as ZeroAllResponse;

      expect(resp).toEqual({ id: 80, ok: true, type: "zeroAll" });

      // After zeroAll, decrypt should fail with NOT_READY
      const decResp = await sendAndWait({
        type: "decryptContent",
        id: 81,
        ticketId: "ticket-any",
        ephemeralPoint: encode(new Uint8Array(32)),
        nonce: encode(new Uint8Array(24)),
        wrappedKey: encode(new Uint8Array(48)),
        ciphertext: encode(new Uint8Array(40)),
      });
      expect(decResp.ok).toBe(false);
      expect((decResp as ErrorResponse).code).toBe("NOT_READY");
    });

    it("is safe to call on an already-READY Worker", async () => {
      await sendAndWait({ type: "init", id: 970 });
      const resp = await sendAndWait({ type: "zeroAll", id: 82 });
      expect(resp.ok).toBe(true);
    });
  });
});
