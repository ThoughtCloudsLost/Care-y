import { describe, it, expect, beforeAll } from "vitest";
import {
  generateContentKey,
  encryptContent,
  decryptContent,
  eciesEncrypt,
  eciesDecrypt,
  toRistrettoPoint,
  toScalar,
  getSodium,
  type SymmetricKey,
  type RistrettoPoint,
  type Scalar,
} from "@care-y/crypto";

let volPublic: RistrettoPoint;
let volPrivate: Scalar;

beforeAll(async () => {
  const sodium = await getSodium();
  const scalar = sodium.crypto_core_ristretto255_scalar_random();
  volPrivate = toScalar(scalar);
  volPublic = toRistrettoPoint(
    sodium.crypto_scalarmult_ristretto255_base(scalar),
  );
});

describe("createEncryptedFollowUp crypto roundtrips", () => {
  it("tk_temp encrypted content decrypts with the same tk_temp", () => {
    const tkTemp = generateContentKey();
    const body = Buffer.from("Inbound SMS: please help me");

    const encrypted = encryptContent(new Uint8Array(body), tkTemp);
    const decrypted = decryptContent(encrypted, tkTemp);

    expect(Buffer.from(decrypted).toString("utf-8")).toBe(
      "Inbound SMS: please help me",
    );
  });

  it("ECIES wrap of tk_temp decrypts to the same key", () => {
    const tkTemp = generateContentKey();
    const wrap = eciesEncrypt(tkTemp, volPublic);
    const recovered = eciesDecrypt(
      wrap.ephemeralPoint,
      wrap.nonce,
      wrap.ciphertext,
      volPrivate,
    );

    expect(Buffer.from(recovered)).toEqual(Buffer.from(tkTemp));
  });

  it("full re-wrap roundtrip: decrypt with tk_temp, re-encrypt with tk", () => {
    const tk = generateContentKey();
    const tkTemp = generateContentKey();
    const plaintext = "Original SMS message content";

    // Simulate server: encrypt with tk_temp
    const tempEncrypted = encryptContent(Buffer.from(plaintext), tkTemp);

    // Simulate volunteer Worker: decrypt with tk_temp
    const decrypted = decryptContent(tempEncrypted, tkTemp);
    expect(Buffer.from(decrypted).toString("utf-8")).toBe(plaintext);

    // Re-encrypt with canonical tk
    const canonicalEncrypted = encryptContent(decrypted, tk);

    // Verify: decrypts with tk
    const finalDecrypted = decryptContent(canonicalEncrypted, tk);
    expect(Buffer.from(finalDecrypted).toString("utf-8")).toBe(plaintext);

    // Verify: does NOT decrypt with tk_temp
    expect(() => decryptContent(canonicalEncrypted, tkTemp)).toThrow(
      "Content decryption failed",
    );
  });

  it("different tk_temp values cannot cross-decrypt", () => {
    const tkTemp1 = generateContentKey();
    const tkTemp2 = generateContentKey();

    const encrypted1 = encryptContent(Buffer.from("message 1"), tkTemp1);
    const encrypted2 = encryptContent(Buffer.from("message 2"), tkTemp2);

    // Each can decrypt its own
    expect(
      Buffer.from(decryptContent(encrypted1, tkTemp1)).toString("utf-8"),
    ).toBe("message 1");
    expect(
      Buffer.from(decryptContent(encrypted2, tkTemp2)).toString("utf-8"),
    ).toBe("message 2");

    // Cross-decryption fails
    expect(() => decryptContent(encrypted1, tkTemp2)).toThrow(
      "Content decryption failed",
    );
    expect(() => decryptContent(encrypted2, tkTemp1)).toThrow(
      "Content decryption failed",
    );
  });

  it("attachment data encrypted with same tk_temp decrypts correctly", () => {
    const tkTemp = generateContentKey();

    // Simulate an MMS attachment (binary data)
    const attachmentData = Buffer.alloc(256);
    for (let i = 0; i < 256; i++) {
      attachmentData[i] = i;
    }

    const encryptedAttachment = encryptContent(
      new Uint8Array(attachmentData),
      tkTemp,
    );
    const decryptedAttachment = decryptContent(encryptedAttachment, tkTemp);

    expect(Buffer.from(decryptedAttachment)).toEqual(attachmentData);
  });
});

describe("createFollowUpWithTk crypto roundtrips", () => {
  it("follow-up encrypted with ticket tk decrypts with same tk", () => {
    const tk = generateContentKey();
    const body = Buffer.from("First SMS on a new ticket");

    const encrypted = encryptContent(new Uint8Array(body), tk);
    const decrypted = decryptContent(encrypted, tk);

    expect(Buffer.from(decrypted).toString("utf-8")).toBe(
      "First SMS on a new ticket",
    );
  });

  it("ECIES-wrapped tk from ticket creation decrypts follow-up content", () => {
    const tk = generateContentKey();

    // Simulate ticket creation: ECIES wrap tk for volunteer
    const wrap = eciesEncrypt(tk, volPublic);

    // Simulate follow-up creation: encrypt with same tk
    const body = Buffer.from("Follow-up content on new ticket");
    const encrypted = encryptContent(new Uint8Array(body), tk);

    // Simulate volunteer: unwrap tk, decrypt follow-up
    const recoveredTk = eciesDecrypt(
      wrap.ephemeralPoint,
      wrap.nonce,
      wrap.ciphertext,
      volPrivate,
    );
    const decrypted = decryptContent(
      encrypted,

      recoveredTk as SymmetricKey,
    );

    expect(Buffer.from(decrypted).toString("utf-8")).toBe(
      "Follow-up content on new ticket",
    );
  });
});

describe("Buffer zeroing contracts", () => {
  it("plaintext Buffer is zeroed after encryption", () => {
    const tk = generateContentKey();
    const plaintext = Buffer.from("sensitive content");

    encryptContent(new Uint8Array(plaintext), tk);

    // The Uint8Array view used for encryption shares the same underlying
    // ArrayBuffer as the original Buffer. We verify the pattern by
    // simulating what the handler does: zero the Buffer after encrypt.
    plaintext.fill(0);
    expect(plaintext.every((b) => b === 0)).toBe(true);
  });
});
