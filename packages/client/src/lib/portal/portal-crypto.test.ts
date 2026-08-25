import { describe, it, expect, beforeAll } from "vitest";
import {
  generatePortalSeed,
  deriveChannelId,
  derivePortalKeypair,
  eciesEncrypt,
  eciesDecrypt,
  PORTAL_KEY_CHECK,
  encode,
  decode,
  buildContentAad,
  followupSlot,
  generateOrgKeypair,
  requireSodium,
  toNonce,
} from "@care-y/crypto";
import { getSodium } from "@care-y/crypto";
import {
  parseFragment,
  verifyKeyCheck,
  decryptPortalMessage,
  encryptReply,
  createPortalSession,
  decodeEciesTriple,
} from "./portal-crypto.js";

beforeAll(async () => {
  await getSodium();
});

describe("parseFragment", () => {
  it("parses a valid fragment and returns seed, auth, channelId", () => {
    const seed = generatePortalSeed();
    const encoded = encode(seed);
    const result = parseFragment(`#${encoded}`);
    expect(result).not.toBeNull();
    expect(result!.channelId).toBe(deriveChannelId(seed));
    expect(result!.seed).toEqual(seed);
    expect(result!.auth.length).toBe(32);
  });

  it("returns null for empty hash", () => {
    expect(parseFragment("")).toBeNull();
    expect(parseFragment("#")).toBeNull();
  });

  it("returns null for malformed base64", () => {
    expect(parseFragment("#!!!invalid!!!")).toBeNull();
  });

  it("returns null for truncated seed (< 18 bytes)", () => {
    const shortSeed = new Uint8Array(10);
    crypto.getRandomValues(shortSeed);
    expect(parseFragment(`#${encode(shortSeed)}`)).toBeNull();
  });

  it("roundtrips: compose link client-side idiom, parse back", () => {
    const seed = generatePortalSeed();
    const channelId = deriveChannelId(seed);
    const link = `https://org.care-y.app/portal/${channelId}#${encode(seed)}`;
    const url = new URL(link);
    const result = parseFragment(url.hash);
    expect(result).not.toBeNull();
    expect(result!.channelId).toBe(channelId);
  });
});

describe("verifyKeyCheck", () => {
  it("returns true for correct keypair", () => {
    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);
    const keyCheck = eciesEncrypt(
      new TextEncoder().encode(PORTAL_KEY_CHECK),
      keypair.clientPublic,
    );
    const decoded = decodeEciesTriple({
      ephemeralPoint: encode(keyCheck.ephemeralPoint),
      nonce: encode(keyCheck.nonce),
      ciphertext: encode(keyCheck.ciphertext),
    });
    expect(verifyKeyCheck(keypair, decoded)).toBe(true);
  });

  it("returns false for wrong keypair (wrong passphrase)", () => {
    const seed = generatePortalSeed();
    const correctKeypair = derivePortalKeypair(seed, "correct words here");
    const wrongKeypair = derivePortalKeypair(seed, "wrong words here");
    const keyCheck = eciesEncrypt(
      new TextEncoder().encode(PORTAL_KEY_CHECK),
      correctKeypair.clientPublic,
    );
    const decoded = decodeEciesTriple({
      ephemeralPoint: encode(keyCheck.ephemeralPoint),
      nonce: encode(keyCheck.nonce),
      ciphertext: encode(keyCheck.ciphertext),
    });
    expect(verifyKeyCheck(wrongKeypair, decoded)).toBe(false);
  });
});

describe("decryptPortalMessage", () => {
  it("decrypts an ECIES-encrypted message", () => {
    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);
    const msg = "Hello from a volunteer";
    const encrypted = eciesEncrypt(
      new TextEncoder().encode(msg),
      keypair.clientPublic,
    );
    const decoded = decodeEciesTriple({
      ephemeralPoint: encode(encrypted.ephemeralPoint),
      nonce: encode(encrypted.nonce),
      ciphertext: encode(encrypted.ciphertext),
    });
    expect(decryptPortalMessage(decoded, keypair.clientPrivate)).toBe(msg);
  });
});

describe("encryptReply", () => {
  it("produces a payload that server can unseal and volunteer can decrypt", () => {
    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);
    const orgKeypair = generateOrgKeypair();
    const ids = {
      ticketId: crypto.randomUUID(),
      followUpId: crypto.randomUUID(),
      keyGeneration: crypto.randomUUID(),
    };

    const payload = encryptReply(
      "Client reply text",
      orgKeypair.publicKey,
      keypair.clientPublic,
      ids,
    );

    // Sealed wrap can be opened by the org keypair
    const wrappedBytes = decode(payload.wrappedTkTemp);
    const sodium = requireSodium();
    const tkTemp = sodium.crypto_box_seal_open(
      wrappedBytes,
      orgKeypair.publicKey,
      orgKeypair.secretKey,
    );
    expect(tkTemp.length).toBe(32);

    // Content decrypts with tkTemp and correct AAD
    const contentBytes = decode(payload.encryptedContent);
    const aad = buildContentAad(ids.ticketId, followupSlot(ids.followUpId));
    const nonce = contentBytes.subarray(0, 24);
    const ct = contentBytes.subarray(24);
    const plaintext = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      ct,
      aad,
      nonce,
      tkTemp,
    );
    expect(new TextDecoder().decode(plaintext)).toBe("Client reply text");

    // Self copy decrypts with clientPrivate
    const selfCopyDecoded = decodeEciesTriple(payload.selfCopy);
    const selfPlain = eciesDecrypt(
      selfCopyDecoded.ephemeralPoint,
      toNonce(selfCopyDecoded.nonce),
      selfCopyDecoded.ciphertext,
      keypair.clientPrivate,
    );
    expect(new TextDecoder().decode(selfPlain)).toBe("Client reply text");
  });

  it("generates a fresh tk_temp per call", () => {
    // We verify this indirectly: encryptReply does not throw and
    // subsequent calls produce different wrappedTkTemp values
    // (fresh tk_temp each time).
    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);
    const orgKeypair = generateOrgKeypair();
    const ids = {
      ticketId: crypto.randomUUID(),
      followUpId: crypto.randomUUID(),
      keyGeneration: crypto.randomUUID(),
    };
    const p1 = encryptReply(
      "test",
      orgKeypair.publicKey,
      keypair.clientPublic,
      ids,
    );
    const ids2 = { ...ids, keyGeneration: crypto.randomUUID() };
    const p2 = encryptReply(
      "test",
      orgKeypair.publicKey,
      keypair.clientPublic,
      ids2,
    );
    expect(p1.wrappedTkTemp).not.toBe(p2.wrappedTkTemp);
  });
});

describe("createPortalSession", () => {
  it("zeroes key material on destroy", () => {
    const seed = generatePortalSeed();
    const auth = new Uint8Array(32);
    crypto.getRandomValues(auth);
    const keypair = derivePortalKeypair(seed);

    const seedCopy = seed.slice();
    const session = createPortalSession("abc123", auth, keypair, seedCopy);

    session.destroy();

    // After destroy, auth and seed should be zeroed
    expect(auth.every((b) => b === 0)).toBe(true);
    expect(seedCopy.every((b) => b === 0)).toBe(true);
    expect(keypair.clientPrivate.every((b) => b === 0)).toBe(true);
  });

  it("destroy is idempotent", () => {
    const seed = generatePortalSeed();
    const auth = new Uint8Array(32);
    const keypair = derivePortalKeypair(seed);
    const session = createPortalSession("x", auth, keypair, null);
    session.destroy();
    session.destroy(); // should not throw
  });
});

describe("decodeEciesTriple", () => {
  it("decodes wire-format base64 strings to binary", () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const nonce = new Uint8Array(24);
    crypto.getRandomValues(nonce);
    const ct = new Uint8Array(50);
    crypto.getRandomValues(ct);

    const decoded = decodeEciesTriple({
      ephemeralPoint: encode(bytes),
      nonce: encode(nonce),
      ciphertext: encode(ct),
    });

    expect(decoded.ephemeralPoint).toEqual(bytes);
    expect(decoded.nonce).toEqual(nonce);
    expect(decoded.ciphertext).toEqual(ct);
  });
});
