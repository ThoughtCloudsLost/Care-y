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
  blobSlot,
  fileKeySlot,
  filenameSlot,
  decryptContent,
  toSymmetricKey,
  generateOrgKeypair,
  requireSodium,
  toNonce,
  type Ciphertext,
  type SymmetricKey,
} from "@care-y/crypto";
import { getSodium } from "@care-y/crypto";
import {
  parseFragment,
  verifyKeyCheck,
  decryptPortalMessage,
  encryptReply,
  createPortalSession,
  decodeEciesTriple,
  decryptAttachmentKey,
  decryptAttachmentBlob,
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

describe("reply attachments", () => {
  function setup(): {
    keypair: ReturnType<typeof derivePortalKeypair>;
    orgKeypair: ReturnType<typeof generateOrgKeypair>;
    ids: { ticketId: string; followUpId: string; keyGeneration: string };
    file: Uint8Array;
    attachmentId: string;
  } {
    const seed = generatePortalSeed();
    return {
      keypair: derivePortalKeypair(seed),
      orgKeypair: generateOrgKeypair(),
      ids: {
        ticketId: crypto.randomUUID(),
        followUpId: crypto.randomUUID(),
        keyGeneration: crypto.randomUUID(),
      },
      file: new Uint8Array([0x25, 0x50, 0x44, 0x46, 1, 2, 3, 4, 5]),
      attachmentId: crypto.randomUUID(),
    };
  }

  function unsealTkTemp(
    payload: { wrappedTkTemp: string },
    orgKeypair: ReturnType<typeof generateOrgKeypair>,
  ): SymmetricKey {
    return toSymmetricKey(
      requireSodium().crypto_box_seal_open(
        decode(payload.wrappedTkTemp),
        orgKeypair.publicKey,
        orgKeypair.secretKey,
      ),
    );
  }

  it("carries no attachments when none are sent", () => {
    const { keypair, orgKeypair, ids } = setup();
    const payload = encryptReply(
      "text only",
      orgKeypair.publicKey,
      keypair.clientPublic,
      ids,
    );

    expect(payload.attachments).toEqual([]);
  });

  it("lets the org open the file through the reply's tk_temp", () => {
    const { keypair, orgKeypair, ids, file, attachmentId } = setup();

    const payload = encryptReply(
      "here is the document",
      orgKeypair.publicKey,
      keypair.clientPublic,
      ids,
      [
        {
          attachmentId,
          filename: "letter.pdf",
          contentType: "application/pdf",
          data: file,
        },
      ],
    );

    const att = payload.attachments[0]!;
    const tkTemp = unsealTkTemp(payload, orgKeypair);

    // The org unwraps the file key with the same tk_temp the message text
    // uses, which is the whole point of the files riding the reply.
    const fileKey = toSymmetricKey(
      decryptContent(
        decode(att.fileKeyWrap) as Ciphertext,
        tkTemp,
        buildContentAad(ids.ticketId, fileKeySlot(attachmentId)),
      ),
    );
    const opened = decryptContent(
      decode(att.blob) as Ciphertext,
      fileKey,
      buildContentAad(ids.ticketId, blobSlot(attachmentId)),
    );

    expect(opened).toEqual(file);
  });

  it("gives the org the filename under the same key", () => {
    const { keypair, orgKeypair, ids, file, attachmentId } = setup();
    const payload = encryptReply(
      "doc",
      orgKeypair.publicKey,
      keypair.clientPublic,
      ids,
      [
        {
          attachmentId,
          filename: "eviction notice.pdf",
          contentType: "application/pdf",
          data: file,
        },
      ],
    );

    const att = payload.attachments[0]!;
    const name = decryptContent(
      decode(att.encryptedFilename) as Ciphertext,
      unsealTkTemp(payload, orgKeypair),
      buildContentAad(ids.ticketId, filenameSlot(attachmentId)),
    );

    expect(new TextDecoder().decode(name)).toBe("eviction notice.pdf");
  });

  it("lets the sender reopen their own file after tk_temp is gone", () => {
    const { keypair, orgKeypair, ids, file, attachmentId } = setup();
    const payload = encryptReply(
      "doc",
      orgKeypair.publicKey,
      keypair.clientPublic,
      ids,
      [
        {
          attachmentId,
          filename: "letter.pdf",
          contentType: "application/pdf",
          data: file,
        },
      ],
    );

    const att = payload.attachments[0]!;
    const { fileKey, filename } = decryptAttachmentKey(
      decodeEciesTriple(att.selfCopy),
      keypair.clientPrivate,
    );

    expect(filename).toBe("letter.pdf");
    expect(
      decryptAttachmentBlob(
        decode(att.blob),
        fileKey,
        ids.ticketId,
        attachmentId,
      ),
    ).toEqual(file);
  });

  it("reports the ciphertext size, which is what the server measures", () => {
    const { keypair, orgKeypair, ids, file, attachmentId } = setup();
    const payload = encryptReply(
      "doc",
      orgKeypair.publicKey,
      keypair.clientPublic,
      ids,
      [
        {
          attachmentId,
          filename: "f.pdf",
          contentType: "application/pdf",
          data: file,
        },
      ],
    );

    const att = payload.attachments[0]!;
    expect(att.sizeBytes).toBe(decode(att.blob).length);
    // Nonce and tag: a declared plaintext size would fail the server check.
    expect(att.sizeBytes).toBe(file.length + 40);
  });

  it("will not open a file under another attachment's id", () => {
    const { keypair, orgKeypair, ids, file, attachmentId } = setup();
    const payload = encryptReply(
      "doc",
      orgKeypair.publicKey,
      keypair.clientPublic,
      ids,
      [
        {
          attachmentId,
          filename: "f.pdf",
          contentType: "application/pdf",
          data: file,
        },
      ],
    );

    const att = payload.attachments[0]!;
    const { fileKey } = decryptAttachmentKey(
      decodeEciesTriple(att.selfCopy),
      keypair.clientPrivate,
    );

    expect(() =>
      decryptAttachmentBlob(
        decode(att.blob),
        fileKey,
        ids.ticketId,
        crypto.randomUUID(),
      ),
    ).toThrow();
  });

  it("will not open a tampered file", () => {
    const { keypair, orgKeypair, ids, file, attachmentId } = setup();
    const payload = encryptReply(
      "doc",
      orgKeypair.publicKey,
      keypair.clientPublic,
      ids,
      [
        {
          attachmentId,
          filename: "f.pdf",
          contentType: "application/pdf",
          data: file,
        },
      ],
    );

    const att = payload.attachments[0]!;
    const { fileKey } = decryptAttachmentKey(
      decodeEciesTriple(att.selfCopy),
      keypair.clientPrivate,
    );
    const tampered = decode(att.blob);
    const last = tampered.length - 1;
    tampered[last] = (tampered[last] ?? 0) ^ 0xff;

    expect(() =>
      decryptAttachmentBlob(tampered, fileKey, ids.ticketId, attachmentId),
    ).toThrow();
  });

  it("gives every file on one message its own key", () => {
    const { keypair, orgKeypair, ids, file } = setup();
    const first = crypto.randomUUID();
    const second = crypto.randomUUID();

    const payload = encryptReply(
      "two files",
      orgKeypair.publicKey,
      keypair.clientPublic,
      ids,
      [
        {
          attachmentId: first,
          filename: "a.pdf",
          contentType: "application/pdf",
          data: file,
        },
        {
          attachmentId: second,
          filename: "b.pdf",
          contentType: "application/pdf",
          data: file,
        },
      ],
    );

    const keys = payload.attachments.map(
      (att) =>
        decryptAttachmentKey(
          decodeEciesTriple(att.selfCopy),
          keypair.clientPrivate,
        ).fileKey,
    );

    expect(payload.attachments).toHaveLength(2);
    expect(encode(keys[0]!)).not.toBe(encode(keys[1]!));
  });
});
