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
  ChannelSessionRestartResponse,
  ChannelSessionFinishResponse,
  ChannelPassphraseDeriveResponse,
  ChannelPassphraseFinishResponse,
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

/**
 * Run the full account session flow: init -> accountSessionStart ->
 * (simulate OPRF) -> accountSessionFinish. Leaves the core ACCOUNT_KEYED.
 */
async function fullAccountSessionFlow(
  password: string,
  oprfKey: Uint8Array,
): Promise<{ clientPublic: string }> {
  await dispatchAndWait({ type: "init", id: 110 });

  const salt = generateSalt();
  const passwordBytes = new TextEncoder().encode(password);
  const pwBuf = new ArrayBuffer(passwordBytes.byteLength);
  new Uint8Array(pwBuf).set(passwordBytes);

  const startResp = (await dispatchAndWait({
    type: "accountSessionStart",
    id: 111,
    password: pwBuf,
    salt: encode(new Uint8Array(salt)),
  })) as AccountSessionStartResponse;

  expect(startResp.ok).toBe(true);

  const evaluatedB64 = simulateOprfEvaluate(startResp.blindedElement, oprfKey);

  const finishResp = (await dispatchAndWait({
    type: "accountSessionFinish",
    id: 112,
    evaluated: evaluatedB64,
  })) as AccountSessionFinishResponse;

  expect(finishResp.ok).toBe(true);

  return { clientPublic: finishResp.clientPublic };
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

  describe("channelSessionRestart", () => {
    it("recovers from a wrong passphrase without re-posting the seed", async () => {
      // Regression: the main thread zeroes its seed copy after
      // channelSessionStart, so a passphrase retry must re-derive from
      // the Worker-held seed. Before the restart op existed, a failed
      // attempt discarded the Worker and the retry derived from zeroes.
      handleZeroAll(-1, testSink);
      sinkMessages = [];

      const sodium = requireSodium();
      const seed = generatePortalSeed();
      const oprfKey = sodium.crypto_core_ristretto255_scalar_random();
      const passphrase = "correct horse battery staple five";

      // Mint side: derive the real keypair and build the key check.
      const { clientPublic } = await fullChannelSessionFlow(
        seed,
        oprfKey,
        passphrase,
      );
      const keyCheck = eciesEncrypt(
        new TextEncoder().encode(PORTAL_KEY_CHECK),
        toRistrettoPoint(decode(clientPublic)),
      );

      // Gate side, attempt 1: wrong passphrase fails the key check.
      handleZeroAll(-1, testSink);
      await fullChannelSessionFlow(seed, oprfKey, "wrong words entirely");
      const failResp = (await dispatchAndWait({
        type: "verifyKeyCheck",
        id: 120,
        ephemeralPoint: encode(keyCheck.ephemeralPoint),
        nonce: encode(keyCheck.nonce),
        ciphertext: encode(keyCheck.ciphertext),
      })) as VerifyKeyCheckResponse;
      expect(failResp.passed).toBe(false);

      // Gate side, attempt 2: restart from the held seed with the
      // correct passphrase. No seed crosses the boundary.
      const restartResp = (await dispatchAndWait({
        type: "channelSessionRestart",
        id: 121,
        passphrase,
      })) as ChannelSessionRestartResponse;
      expect(restartResp.ok).toBe(true);
      expect(restartResp.channelId).toBe(deriveChannelId(seed));

      const evaluatedB64 = simulateOprfEvaluate(
        restartResp.blindedElement,
        oprfKey,
      );
      const finishResp = (await dispatchAndWait({
        type: "channelSessionFinish",
        id: 122,
        evaluated: evaluatedB64,
      })) as ChannelSessionFinishResponse;
      expect(finishResp.ok).toBe(true);
      expect(finishResp.clientPublic).toBe(clientPublic);

      const passResp = (await dispatchAndWait({
        type: "verifyKeyCheck",
        id: 123,
        ephemeralPoint: encode(keyCheck.ephemeralPoint),
        nonce: encode(keyCheck.nonce),
        ciphertext: encode(keyCheck.ciphertext),
      })) as VerifyKeyCheckResponse;
      expect(passResp.passed).toBe(true);

      sodium.memzero(oprfKey);
    });

    it("restarts from CHANNEL_BLINDED after an abandoned round", async () => {
      // An evaluate that never finished leaves the round half-open; a
      // retry must still work.
      handleZeroAll(-1, testSink);
      sinkMessages = [];

      const sodium = requireSodium();
      const seed = generatePortalSeed();
      await dispatchAndWait({ type: "init", id: 130 });

      const seedBuf = new ArrayBuffer(seed.byteLength);
      new Uint8Array(seedBuf).set(seed);
      await dispatchAndWait({
        type: "channelSessionStart",
        id: 131,
        seed: seedBuf,
        passphrase: "first try words",
      });

      // No finish: state is CHANNEL_BLINDED. Restart directly.
      const restartResp = (await dispatchAndWait({
        type: "channelSessionRestart",
        id: 132,
        passphrase: "second try words",
      })) as ChannelSessionRestartResponse;
      expect(restartResp.ok).toBe(true);
      expect(restartResp.channelId).toBe(deriveChannelId(seed));

      sodium.memzero(seed);
    });

    it("rejects channelSessionRestart when no channel round exists", async () => {
      handleZeroAll(-1, testSink);
      sinkMessages = [];
      await dispatchAndWait({ type: "init", id: 140 });

      const resp = await dispatchAndWait({
        type: "channelSessionRestart",
        id: 141,
        passphrase: "any words at all",
      });
      expect(resp.ok).toBe(false);
      expect((resp as PortalErrorResponse).code).toBe("INVALID_STATE");
    });
  });

  describe("channelPassphraseDerive / channelPassphraseFinish", () => {
    it("derives a new keypair without disturbing the active session", async () => {
      handleZeroAll(-1, testSink);
      sinkMessages = [];

      const sodium = requireSodium();
      const seed = generatePortalSeed();
      const oprfKey = sodium.crypto_core_ristretto255_scalar_random();

      // Establish a plain-link session (no passphrase)
      const { clientPublic: originalPublic } = await fullChannelSessionFlow(
        seed,
        oprfKey,
      );

      // Derive a new keypair with passphrase, via the side-channel ops
      const deriveResp = (await dispatchAndWait({
        type: "channelPassphraseDerive",
        id: 200,
        passphrase: "new passphrase words",
      })) as ChannelPassphraseDeriveResponse;
      expect(deriveResp.ok).toBe(true);
      expect(deriveResp.channelId).toBe(deriveChannelId(seed));
      expect(deriveResp.blindedElement.length).toBeGreaterThan(0);

      // Simulate OPRF evaluation for the derive round
      const evaluatedB64 = simulateOprfEvaluate(
        deriveResp.blindedElement,
        oprfKey,
      );

      const finishResp = (await dispatchAndWait({
        type: "channelPassphraseFinish",
        id: 201,
        evaluated: evaluatedB64,
      })) as ChannelPassphraseFinishResponse;
      expect(finishResp.ok).toBe(true);
      expect(finishResp.clientPublic.length).toBeGreaterThan(0);

      // The new public key differs from the original (passphrase changes it)
      expect(finishResp.clientPublic).not.toBe(originalPublic);

      // The active session's key material is untouched: decrypt still works
      // with the original keypair
      const clientPub = toRistrettoPoint(decode(originalPublic));
      const triple = eciesEncrypt(
        new TextEncoder().encode("still works"),
        clientPub,
      );
      const decResp = (await dispatchAndWait({
        type: "decryptMessage",
        id: 202,
        ephemeralPoint: encode(triple.ephemeralPoint),
        nonce: encode(triple.nonce),
        ciphertext: encode(triple.ciphertext),
      })) as DecryptMessageResponse;
      expect(decResp.ok).toBe(true);
      expect(decResp.plaintext).toBe("still works");

      sodium.memzero(oprfKey);
    });

    it("rejects when not CHANNEL_KEYED", async () => {
      handleZeroAll(-1, testSink);
      sinkMessages = [];
      await dispatchAndWait({ type: "init", id: 210 });

      const resp = await dispatchAndWait({
        type: "channelPassphraseDerive",
        id: 211,
        passphrase: "any words",
      });
      expect(resp.ok).toBe(false);
      expect((resp as PortalErrorResponse).code).toBe("NOT_READY");
    });

    it("rejects a second concurrent derive", async () => {
      handleZeroAll(-1, testSink);
      sinkMessages = [];

      const sodium = requireSodium();
      const seed = generatePortalSeed();
      const oprfKey = sodium.crypto_core_ristretto255_scalar_random();

      await fullChannelSessionFlow(seed, oprfKey);

      // First derive: succeeds
      const resp1 = (await dispatchAndWait({
        type: "channelPassphraseDerive",
        id: 220,
        passphrase: "first derive",
      })) as ChannelPassphraseDeriveResponse;
      expect(resp1.ok).toBe(true);

      // Second derive before finish: rejected
      const resp2 = await dispatchAndWait({
        type: "channelPassphraseDerive",
        id: 221,
        passphrase: "second derive",
      });
      expect(resp2.ok).toBe(false);
      expect((resp2 as PortalErrorResponse).code).toBe("INVALID_STATE");

      sodium.memzero(oprfKey);
    });

    it("rejects channelPassphraseFinish when no derive is pending", async () => {
      handleZeroAll(-1, testSink);
      sinkMessages = [];

      const sodium = requireSodium();
      const seed = generatePortalSeed();
      const oprfKey = sodium.crypto_core_ristretto255_scalar_random();

      await fullChannelSessionFlow(seed, oprfKey);

      const resp = await dispatchAndWait({
        type: "channelPassphraseFinish",
        id: 230,
        evaluated: encode(new Uint8Array(32)),
      });
      expect(resp.ok).toBe(false);
      expect((resp as PortalErrorResponse).code).toBe("INVALID_STATE");

      sodium.memzero(oprfKey);
    });

    it("allows a new derive after a completed round", async () => {
      handleZeroAll(-1, testSink);
      sinkMessages = [];

      const sodium = requireSodium();
      const seed = generatePortalSeed();
      const oprfKey = sodium.crypto_core_ristretto255_scalar_random();

      await fullChannelSessionFlow(seed, oprfKey);

      // First complete round
      const d1 = (await dispatchAndWait({
        type: "channelPassphraseDerive",
        id: 240,
        passphrase: "round one",
      })) as ChannelPassphraseDeriveResponse;
      const ev1 = simulateOprfEvaluate(d1.blindedElement, oprfKey);
      const f1 = (await dispatchAndWait({
        type: "channelPassphraseFinish",
        id: 241,
        evaluated: ev1,
      })) as ChannelPassphraseFinishResponse;
      expect(f1.ok).toBe(true);

      // Second round: allowed because the first finished and cleared ppDerivePending
      const d2 = (await dispatchAndWait({
        type: "channelPassphraseDerive",
        id: 242,
        passphrase: "round two",
      })) as ChannelPassphraseDeriveResponse;
      expect(d2.ok).toBe(true);

      const ev2 = simulateOprfEvaluate(d2.blindedElement, oprfKey);
      const f2 = (await dispatchAndWait({
        type: "channelPassphraseFinish",
        id: 243,
        evaluated: ev2,
      })) as ChannelPassphraseFinishResponse;
      expect(f2.ok).toBe(true);

      // Different passphrases produce different keys
      expect(f1.clientPublic).not.toBe(f2.clientPublic);

      sodium.memzero(oprfKey);
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

    it("decrypts a message sealed to the account public key", async () => {
      // Regression: the intake opt-in self copy is sealed to the account
      // keypair and decrypted in an ACCOUNT_KEYED session, which the
      // channel-only gate used to reject with NOT_READY.
      handleZeroAll(-1, testSink);
      sinkMessages = [];

      const sodium = requireSodium();
      const oprfKey = sodium.crypto_core_ristretto255_scalar_random();
      const { clientPublic } = await fullAccountSessionFlow(
        "account-op-password",
        oprfKey,
      );

      const accountPub = toRistrettoPoint(decode(clientPublic));
      const triple = eciesEncrypt(
        new TextEncoder().encode("Intake self copy"),
        accountPub,
      );

      const resp = (await dispatchAndWait({
        type: "decryptMessage",
        id: 84,
        ephemeralPoint: encode(triple.ephemeralPoint),
        nonce: encode(triple.nonce),
        ciphertext: encode(triple.ciphertext),
      })) as DecryptMessageResponse;

      expect(resp.ok).toBe(true);
      expect(resp.plaintext).toBe("Intake self copy");

      sodium.memzero(oprfKey);
    });

    it("encrypts a reply whose self-copy decrypts under the account key", async () => {
      // Worker is still ACCOUNT_KEYED from the previous test
      const sodium = requireSodium();
      const orgSecret = sodium.randombytes_buf(32);
      const orgPublic = sodium.crypto_scalarmult_base(orgSecret);

      const encResp = (await dispatchAndWait({
        type: "encryptReply",
        id: 85,
        text: "Account reply text",
        orgPublicKey: encode(orgPublic),
        ticketId: "ticket-acct",
        followUpId: "fu-acct",
        keyGeneration: "gen-acct",
        attachments: [],
      })) as EncryptReplyResponse;

      expect(encResp.ok).toBe(true);
      expect(encResp.wrappedTkTemp.length).toBeGreaterThan(0);

      // The self copy round-trips through the account keypair held in
      // the worker.
      const selfResp = (await dispatchAndWait({
        type: "decryptMessage",
        id: 86,
        ephemeralPoint: encResp.selfCopy.ephemeralPoint,
        nonce: encResp.selfCopy.nonce,
        ciphertext: encResp.selfCopy.ciphertext,
      })) as DecryptMessageResponse;

      expect(selfResp.ok).toBe(true);
      expect(selfResp.plaintext).toBe("Account reply text");

      sodium.memzero(orgSecret);
    });

    it("round-trips an attachment key in an account session", async () => {
      // Worker is still ACCOUNT_KEYED
      const sodium = requireSodium();
      const orgSecret = sodium.randombytes_buf(32);
      const orgPublic = sodium.crypto_scalarmult_base(orgSecret);

      const fileContent = new TextEncoder().encode("account attachment");
      const fileBuffer = new ArrayBuffer(fileContent.byteLength);
      new Uint8Array(fileBuffer).set(fileContent);

      const encResp = (await dispatchAndWait({
        type: "encryptReply",
        id: 87,
        text: "With account attachment",
        orgPublicKey: encode(orgPublic),
        ticketId: "ticket-acct-2",
        followUpId: "fu-acct-2",
        keyGeneration: "gen-acct-2",
        attachments: [
          {
            attachmentId: "att-acct",
            filename: "account.txt",
            contentType: "text/plain",
            data: fileBuffer,
          },
        ],
      })) as EncryptReplyResponse;

      expect(encResp.ok).toBe(true);
      const att = encResp.attachments[0]!;

      const keyResp = (await dispatchAndWait({
        type: "decryptAttachmentKey",
        id: 88,
        ephemeralPoint: att.selfCopy.ephemeralPoint,
        nonce: att.selfCopy.nonce,
        ciphertext: att.selfCopy.ciphertext,
      })) as DecryptAttachmentKeyResponse;

      expect(keyResp.ok).toBe(true);
      expect(keyResp.filename).toBe("account.txt");

      sodium.memzero(orgSecret);
    });

    it("keeps verifyKeyCheck channel-only in an account session", async () => {
      // Worker is still ACCOUNT_KEYED. The passphrase gate has no account
      // counterpart, so the op stays gated on CHANNEL_KEYED.
      const resp = await dispatchAndWait({
        type: "verifyKeyCheck",
        id: 89,
        ephemeralPoint: encode(new Uint8Array(32)),
        nonce: encode(new Uint8Array(24)),
        ciphertext: encode(new Uint8Array(48)),
      });
      expect(resp.ok).toBe(false);
      expect((resp as PortalErrorResponse).code).toBe("NOT_READY");
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
