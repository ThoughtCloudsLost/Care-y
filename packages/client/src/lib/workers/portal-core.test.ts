/**
 * Tests for portal-core.ts, covering the Sink abstraction, the state
 * machine, key lifecycle, and the crypto operations.
 *
 * Uses real @care-y/crypto (WASM) for crypto correctness. The core's
 * module-scoped state means tests must run sequentially and reset via
 * handleZeroAll between logical groups.
 */

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import {
  getSodium,
  requireSodium,
  encode,
  decode,
  generatePortalSeed,
  deriveChannelId,
  deriveChannelAuth,
  eciesEncrypt,
  PORTAL_KEY_CHECK,
  buildContentAad,
  followupSlot,
  generateSalt,
  toRistrettoPoint,
} from "@care-y/crypto";
import type {
  PortalWorkerResponse,
  PortalWorkerEvent,
  PortalErrorResponse,
  ChannelSessionStartResponse,
  ChannelSessionFinishResponse,
  VerifyKeyCheckResponse,
  DecryptMessageResponse,
  EncryptReplyResponse,
  DecryptAttachmentKeyResponse,
  DecryptAttachmentBlobResponse,
  AccountSessionStartResponse,
  AccountSessionFinishResponse,
} from "./portal-protocol.js";
import {
  createPortalDispatcher,
  handleZeroAll,
  type PortalSink,
} from "./portal-core.js";
import { CryptoWorkerTestError } from "$lib/errors.js";

// -- Sink capture -------------------------------------------------------------

let sinkMessages: (PortalWorkerResponse | PortalWorkerEvent)[] = [];

const testSink: PortalSink = (msg) => {
  sinkMessages.push(msg);
};

// -- Helpers ------------------------------------------------------------------

let dispatch: ReturnType<typeof createPortalDispatcher>;

async function dispatchAndWait(
  data: Record<string, unknown>,
): Promise<PortalWorkerResponse> {
  const countBefore = sinkMessages.length;
  dispatch(data as unknown as Parameters<typeof dispatch>[0]);
  await new Promise((r) => setTimeout(r, 50));
  // Find the first response (has "id") after the dispatch point
  for (let i = countBefore; i < sinkMessages.length; i++) {
    const msg = sinkMessages[i];
    if (msg && "id" in msg) return msg;
  }
  throw new CryptoWorkerTestError("No WorkerResponse in sink after dispatch");
}

/**
 * Simulate a channel OPRF server evaluation (single-server, full key).
 * Returns base64url evaluated element.
 */
function simulateOprfEvaluate(
  blindedElementB64: string,
  oprfKey: Uint8Array,
): string {
  const sodium = requireSodium();
  const blindedElem = decode(blindedElementB64);
  const evaluated = sodium.crypto_scalarmult_ristretto255(oprfKey, blindedElem);
  return encode(evaluated);
}

/**
 * Run the full channel session flow: init -> channelSessionStart ->
 * (simulate OPRF) -> channelSessionFinish.
 */
async function fullChannelSessionFlow(
  seed: Uint8Array,
  oprfKey: Uint8Array,
  passphrase?: string,
): Promise<{ clientPublic: string; channelId: string }> {
  // 1. Init
  await dispatchAndWait({ type: "init", id: 100 });

  // 2. channelSessionStart
  const seedCopy = new Uint8Array(seed.length);
  seedCopy.set(seed);
  const startResp = (await dispatchAndWait({
    type: "channelSessionStart",
    id: 101,
    seed: seedCopy.buffer,
    passphrase,
  })) as ChannelSessionStartResponse;

  expect(startResp.ok).toBe(true);

  // 3. Simulate OPRF evaluation
  const evaluatedB64 = simulateOprfEvaluate(startResp.blindedElement, oprfKey);

  // 4. channelSessionFinish
  const finishResp = (await dispatchAndWait({
    type: "channelSessionFinish",
    id: 102,
    evaluated: evaluatedB64,
  })) as ChannelSessionFinishResponse;

  expect(finishResp.ok).toBe(true);

  return {
    clientPublic: finishResp.clientPublic,
    channelId: startResp.channelId,
  };
}

// -- Test suite ---------------------------------------------------------------

describe("portal-core", () => {
  beforeAll(async () => {
    await getSodium();
    dispatch = createPortalDispatcher(testSink);
  });

  beforeEach(() => {
    sinkMessages = [];
  });

  describe("init", () => {
    it("initializes libsodium and reports ready", async () => {
      handleZeroAll(-1, testSink);
      sinkMessages = [];

      const resp = await dispatchAndWait({ type: "init", id: 1 });
      expect(resp).toEqual({ id: 1, ok: true, type: "init" });
    });
  });

  describe("channel session", () => {
    it("derives channelId, auth, and blinded element from seed", async () => {
      handleZeroAll(-1, testSink);
      sinkMessages = [];
      await dispatchAndWait({ type: "init", id: 10 });

      const seed = generatePortalSeed();
      const expectedChannelId = deriveChannelId(seed);
      const expectedAuth = deriveChannelAuth(seed);

      const seedCopy = new Uint8Array(seed.length);
      seedCopy.set(seed);

      const resp = (await dispatchAndWait({
        type: "channelSessionStart",
        id: 11,
        seed: seedCopy.buffer,
      })) as ChannelSessionStartResponse;

      expect(resp.ok).toBe(true);
      expect(resp.channelId).toBe(expectedChannelId);
      expect(resp.auth).toBe(encode(expectedAuth));
      expect(resp.blindedElement.length).toBeGreaterThan(0);
    });

    it("completes the full channel session and derives a valid keypair", async () => {
      handleZeroAll(-1, testSink);
      sinkMessages = [];

      const sodium = requireSodium();
      const seed = generatePortalSeed();
      const oprfKey = sodium.crypto_core_ristretto255_scalar_random();

      const { clientPublic } = await fullChannelSessionFlow(seed, oprfKey);

      // The clientPublic should be a valid 32-byte base64 point
      const decodedPub = decode(clientPublic);
      expect(decodedPub.length).toBe(32);

      sodium.memzero(oprfKey);
    });

    it("rejects channelSessionStart when not READY", async () => {
      // State is CHANNEL_KEYED from previous test (no zeroAll called)
      const seed = generatePortalSeed();
      const seedCopy = new Uint8Array(seed.length);
      seedCopy.set(seed);

      const resp = await dispatchAndWait({
        type: "channelSessionStart",
        id: 20,
        seed: seedCopy.buffer,
      });
      expect(resp.ok).toBe(false);
      expect((resp as PortalErrorResponse).code).toBe("INVALID_STATE");
    });

    it("rejects channelSessionFinish before channelSessionStart", async () => {
      handleZeroAll(-1, testSink);
      sinkMessages = [];
      await dispatchAndWait({ type: "init", id: 30 });

      const resp = await dispatchAndWait({
        type: "channelSessionFinish",
        id: 31,
        evaluated: encode(new Uint8Array(32)),
      });
      expect(resp.ok).toBe(false);
      expect((resp as PortalErrorResponse).code).toBe("INVALID_STATE");
    });
  });

  describe("verifyKeyCheck", () => {
    it("returns passed=true for a correct key check", async () => {
      handleZeroAll(-1, testSink);
      sinkMessages = [];

      const sodium = requireSodium();
      const seed = generatePortalSeed();
      const oprfKey = sodium.crypto_core_ristretto255_scalar_random();

      const { clientPublic } = await fullChannelSessionFlow(seed, oprfKey);

      // Create a key check by encrypting PORTAL_KEY_CHECK to clientPublic
      const clientPub = toRistrettoPoint(decode(clientPublic));
      const keyCheckTriple = eciesEncrypt(
        new TextEncoder().encode(PORTAL_KEY_CHECK),
        clientPub,
      );

      const resp = (await dispatchAndWait({
        type: "verifyKeyCheck",
        id: 40,
        ephemeralPoint: encode(keyCheckTriple.ephemeralPoint),
        nonce: encode(keyCheckTriple.nonce),
        ciphertext: encode(keyCheckTriple.ciphertext),
      })) as VerifyKeyCheckResponse;

      expect(resp.ok).toBe(true);
      expect(resp.passed).toBe(true);

      sodium.memzero(oprfKey);
    });

    it("returns passed=false for a wrong key check", async () => {
      // Worker is still CHANNEL_KEYED from previous test
      const sodium = requireSodium();

      // Encrypt some different text to a random key
      const randomScalar = sodium.crypto_core_ristretto255_scalar_random();
      const randomPub =
        sodium.crypto_scalarmult_ristretto255_base(randomScalar);
      const wrongTriple = eciesEncrypt(
        new TextEncoder().encode("wrong-check"),
        toRistrettoPoint(randomPub),
      );

      // Re-encrypt to a key the Worker does NOT hold
      const resp = (await dispatchAndWait({
        type: "verifyKeyCheck",
        id: 41,
        ephemeralPoint: encode(wrongTriple.ephemeralPoint),
        nonce: encode(wrongTriple.nonce),
        ciphertext: encode(wrongTriple.ciphertext),
      })) as VerifyKeyCheckResponse;

      expect(resp.ok).toBe(true);
      expect(resp.passed).toBe(false);

      sodium.memzero(randomScalar);
    });

    it("rejects when not CHANNEL_KEYED", async () => {
      handleZeroAll(-1, testSink);
      sinkMessages = [];
      await dispatchAndWait({ type: "init", id: 42 });

      const resp = await dispatchAndWait({
        type: "verifyKeyCheck",
        id: 43,
        ephemeralPoint: encode(new Uint8Array(32)),
        nonce: encode(new Uint8Array(24)),
        ciphertext: encode(new Uint8Array(48)),
      });
      expect(resp.ok).toBe(false);
      expect((resp as PortalErrorResponse).code).toBe("NOT_READY");
    });
  });

  describe("decryptMessage", () => {
    it("decrypts a message encrypted to clientPublic", async () => {
      handleZeroAll(-1, testSink);
      sinkMessages = [];

      const sodium = requireSodium();
      const seed = generatePortalSeed();
      const oprfKey = sodium.crypto_core_ristretto255_scalar_random();

      const { clientPublic } = await fullChannelSessionFlow(seed, oprfKey);

      // Encrypt a message to clientPublic
      const clientPub = toRistrettoPoint(decode(clientPublic));
      const triple = eciesEncrypt(
        new TextEncoder().encode("Hello from the org"),
        clientPub,
      );

      const resp = (await dispatchAndWait({
        type: "decryptMessage",
        id: 50,
        ephemeralPoint: encode(triple.ephemeralPoint),
        nonce: encode(triple.nonce),
        ciphertext: encode(triple.ciphertext),
      })) as DecryptMessageResponse;

      expect(resp.ok).toBe(true);
      expect(resp.plaintext).toBe("Hello from the org");

      sodium.memzero(oprfKey);
    });
  });

  describe("encryptReply", () => {
    it("encrypts a reply with a self-copy and wraps tk_temp for the org", async () => {
      // Worker is still CHANNEL_KEYED from previous test
      const sodium = requireSodium();

      // Create a fake org keypair
      const orgSecret = sodium.randombytes_buf(32);
      const orgPublic = sodium.crypto_scalarmult_base(orgSecret);

      const resp = (await dispatchAndWait({
        type: "encryptReply",
        id: 60,
        text: "Client reply text",
        orgPublicKey: encode(orgPublic),
        ticketId: "ticket-1",
        followUpId: "fu-1",
        keyGeneration: "gen-1",
        attachments: [],
      })) as EncryptReplyResponse;

      expect(resp.ok).toBe(true);
      expect(resp.encryptedContent.length).toBeGreaterThan(0);
      expect(resp.wrappedTkTemp.length).toBeGreaterThan(0);
      expect(resp.selfCopy.ephemeralPoint.length).toBeGreaterThan(0);
      expect(resp.attachments).toHaveLength(0);

      // Verify: unseal tk_temp with org key, decrypt the content
      const wrappedBytes = decode(resp.wrappedTkTemp);
      const tkTemp = sodium.crypto_box_seal_open(
        wrappedBytes,
        orgPublic,
        orgSecret,
      );
      const ct = decode(resp.encryptedContent);
      const aad = buildContentAad("ticket-1", followupSlot("fu-1"));
      const plainBytes = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        ct.slice(24),
        aad,
        ct.slice(0, 24),
        tkTemp,
      );
      const text = new TextDecoder().decode(plainBytes);
      expect(text).toBe("Client reply text");

      sodium.memzero(orgSecret);
      sodium.memzero(tkTemp);
      sodium.memzero(plainBytes);
    });

    it("encrypts attachments alongside the reply", async () => {
      // Worker is still CHANNEL_KEYED
      const sodium = requireSodium();
      const orgSecret = sodium.randombytes_buf(32);
      const orgPublic = sodium.crypto_scalarmult_base(orgSecret);

      const fileData = new TextEncoder().encode("file content here");
      const fileBuffer = new ArrayBuffer(fileData.byteLength);
      new Uint8Array(fileBuffer).set(fileData);

      const resp = (await dispatchAndWait({
        type: "encryptReply",
        id: 61,
        text: "Reply with file",
        orgPublicKey: encode(orgPublic),
        ticketId: "ticket-2",
        followUpId: "fu-2",
        keyGeneration: "gen-2",
        attachments: [
          {
            attachmentId: "att-1",
            filename: "test.txt",
            contentType: "text/plain",
            data: fileBuffer,
          },
        ],
      })) as EncryptReplyResponse;

      expect(resp.ok).toBe(true);
      expect(resp.attachments).toHaveLength(1);
      const att = resp.attachments[0];
      expect(att).toBeDefined();
      expect(att!.attachmentId).toBe("att-1");
      expect(att!.contentType).toBe("text/plain");
      expect(att!.blob.length).toBeGreaterThan(0);
      expect(att!.fileKeyWrap.length).toBeGreaterThan(0);
      expect(att!.encryptedFilename.length).toBeGreaterThan(0);
      expect(att!.selfCopy.ephemeralPoint.length).toBeGreaterThan(0);

      sodium.memzero(orgSecret);
    });
  });

  describe("decryptAttachmentKey + decryptAttachmentBlob", () => {
    it("round-trips an attachment through encrypt and decrypt", async () => {
      // Worker is still CHANNEL_KEYED
      const sodium = requireSodium();
      const orgSecret = sodium.randombytes_buf(32);
      const orgPublic = sodium.crypto_scalarmult_base(orgSecret);

      const fileContent = new TextEncoder().encode("attachment data roundtrip");
      const fileBuffer = new ArrayBuffer(fileContent.byteLength);
      new Uint8Array(fileBuffer).set(fileContent);

      // Encrypt reply with one attachment
      const encResp = (await dispatchAndWait({
        type: "encryptReply",
        id: 70,
        text: "With attachment",
        orgPublicKey: encode(orgPublic),
        ticketId: "ticket-3",
        followUpId: "fu-3",
        keyGeneration: "gen-3",
        attachments: [
          {
            attachmentId: "att-rt",
            filename: "roundtrip.bin",
            contentType: "application/octet-stream",
            data: fileBuffer,
          },
        ],
      })) as EncryptReplyResponse;

      expect(encResp.ok).toBe(true);
      const att = encResp.attachments[0]!;

      // Decrypt the attachment key from the self-copy
      const keyResp = (await dispatchAndWait({
        type: "decryptAttachmentKey",
        id: 71,
        ephemeralPoint: att.selfCopy.ephemeralPoint,
        nonce: att.selfCopy.nonce,
        ciphertext: att.selfCopy.ciphertext,
      })) as DecryptAttachmentKeyResponse;

      expect(keyResp.ok).toBe(true);
      expect(keyResp.filename).toBe("roundtrip.bin");

      // Decrypt the blob
      const blobCt = decode(att.blob);
      const blobBuf = new ArrayBuffer(blobCt.byteLength);
      new Uint8Array(blobBuf).set(blobCt);

      const blobResp = (await dispatchAndWait({
        type: "decryptAttachmentBlob",
        id: 72,
        ciphertext: blobBuf,
        fileKey: keyResp.fileKey,
        ticketId: "ticket-3",
        attachmentId: "att-rt",
      })) as DecryptAttachmentBlobResponse;

      expect(blobResp.ok).toBe(true);
      const decrypted = new Uint8Array(blobResp.data);
      expect(new TextDecoder().decode(decrypted)).toBe(
        "attachment data roundtrip",
      );

      sodium.memzero(orgSecret);
    });
  });

  describe("account session", () => {
    it("completes the account derivation pipeline", async () => {
      handleZeroAll(-1, testSink);
      sinkMessages = [];

      const sodium = requireSodium();
      await dispatchAndWait({ type: "init", id: 80 });

      const salt = generateSalt();
      const password = new TextEncoder().encode("test-account-password");
      const pwBuf = new ArrayBuffer(password.byteLength);
      new Uint8Array(pwBuf).set(password);

      // accountSessionStart
      const startResp = (await dispatchAndWait({
        type: "accountSessionStart",
        id: 81,
        password: pwBuf,
        salt: encode(new Uint8Array(salt)),
      })) as AccountSessionStartResponse;

      expect(startResp.ok).toBe(true);
      expect(startResp.blindedElement.length).toBeGreaterThan(0);

      // Check for derivation progress events
      const progressEvents = sinkMessages.filter(
        (m): m is PortalWorkerEvent => "kind" in m,
      );
      expect(progressEvents.some((e) => e.phase === "argon2id-start")).toBe(
        true,
      );
      expect(progressEvents.some((e) => e.phase === "argon2id-done")).toBe(
        true,
      );

      // Simulate OPRF evaluation
      const oprfKey = sodium.crypto_core_ristretto255_scalar_random();
      const evaluatedB64 = simulateOprfEvaluate(
        startResp.blindedElement,
        oprfKey,
      );

      // accountSessionFinish
      const finishResp = (await dispatchAndWait({
        type: "accountSessionFinish",
        id: 82,
        evaluated: evaluatedB64,
      })) as AccountSessionFinishResponse;

      expect(finishResp.ok).toBe(true);
      expect(finishResp.clientPublic.length).toBeGreaterThan(0);
      expect(finishResp.authToken.length).toBeGreaterThan(0);

      // Verify clientPublic is a valid 32-byte point
      const decodedPub = decode(finishResp.clientPublic);
      expect(decodedPub.length).toBe(32);

      sodium.memzero(oprfKey);
    });

    it("rejects accountSessionStart when not READY", async () => {
      // State is ACCOUNT_KEYED from previous test
      const password = new TextEncoder().encode("fail");
      const pwBuf = new ArrayBuffer(password.byteLength);
      new Uint8Array(pwBuf).set(password);

      const resp = await dispatchAndWait({
        type: "accountSessionStart",
        id: 83,
        password: pwBuf,
        salt: encode(new Uint8Array(16)),
      });
      expect(resp.ok).toBe(false);
      expect((resp as PortalErrorResponse).code).toBe("INVALID_STATE");
    });
  });

  describe("zeroAll", () => {
    it("zeros all key material and returns to READY", async () => {
      handleZeroAll(-1, testSink);
      sinkMessages = [];

      const sodium = requireSodium();
      const seed = generatePortalSeed();
      const oprfKey = sodium.crypto_core_ristretto255_scalar_random();

      await fullChannelSessionFlow(seed, oprfKey);

      // Worker is CHANNEL_KEYED, now zero
      const resp = await dispatchAndWait({ type: "zeroAll", id: 90 });
      expect(resp).toEqual({ id: 90, ok: true, type: "zeroAll" });

      // After zeroAll, decrypt should fail with NOT_READY
      const decResp = await dispatchAndWait({
        type: "decryptMessage",
        id: 91,
        ephemeralPoint: encode(new Uint8Array(32)),
        nonce: encode(new Uint8Array(24)),
        ciphertext: encode(new Uint8Array(48)),
      });
      expect(decResp.ok).toBe(false);
      expect((decResp as PortalErrorResponse).code).toBe("NOT_READY");

      sodium.memzero(oprfKey);
    });

    it("is safe to call on an already-READY Worker", async () => {
      await dispatchAndWait({ type: "init", id: 92 });
      const resp = await dispatchAndWait({ type: "zeroAll", id: 93 });
      expect(resp.ok).toBe(true);
    });
  });
});
