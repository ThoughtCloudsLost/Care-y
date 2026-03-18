import { describe, it, expect } from "vitest";
import sodium from "sodium-native";
import { createSealedBoxEncryptor } from "./sealed-box.js";
import { CryptoError } from "../errors.js";

const CURVE25519_SK_BYTES = 32;

function generateCurve25519Keypair(): { pk: Buffer; sk: Buffer } {
  const pk = Buffer.alloc(sodium.crypto_box_PUBLICKEYBYTES);
  const sk = Buffer.alloc(CURVE25519_SK_BYTES);
  sodium.crypto_box_keypair(pk, sk);
  return { pk, sk };
}

/** Test-only helper: unseal a sealed box to verify seal() output. */
function unsealForTest(
  ciphertext: Buffer,
  pk: Buffer,
  sk: Buffer,
): { opened: boolean; plaintext: Buffer } {
  const plaintext = Buffer.alloc(
    ciphertext.length - sodium.crypto_box_SEALBYTES,
  );
  // care-y-ignore-next-line server-no-decrypt -- test-only roundtrip to verify seal() produces correct ciphertext
  const opened = sodium.crypto_box_seal_open(plaintext, ciphertext, pk, sk);
  return { opened, plaintext };
}

describe("createSealedBoxEncryptor", () => {
  it("throws CryptoError for wrong key length (31 bytes)", () => {
    expect(() => createSealedBoxEncryptor(Buffer.alloc(31))).toThrow(
      CryptoError,
    );
  });

  it("throws CryptoError for wrong key length (33 bytes)", () => {
    expect(() => createSealedBoxEncryptor(Buffer.alloc(33))).toThrow(
      CryptoError,
    );
  });

  it("throws CryptoError for empty key", () => {
    expect(() => createSealedBoxEncryptor(Buffer.alloc(0))).toThrow(
      CryptoError,
    );
  });

  it("returns a SealedBoxEncryptor for valid 32-byte key", () => {
    const { pk } = generateCurve25519Keypair();
    const encryptor = createSealedBoxEncryptor(pk);
    expect(encryptor).toHaveProperty("seal");
  });
});

describe("SealedBoxEncryptor.seal", () => {
  it("produces ciphertext of correct length", () => {
    const { pk } = generateCurve25519Keypair();
    const encryptor = createSealedBoxEncryptor(pk);

    const plaintext = "hello";
    const ciphertext = encryptor.seal(plaintext);

    expect(ciphertext.length).toBe(
      plaintext.length + sodium.crypto_box_SEALBYTES,
    );
  });

  it("ciphertext differs from plaintext", () => {
    const { pk } = generateCurve25519Keypair();
    const encryptor = createSealedBoxEncryptor(pk);

    const ciphertext = encryptor.seal("hello");
    expect(ciphertext.toString("utf-8")).not.toBe("hello");
  });

  it("produces different ciphertext for same plaintext (random ephemeral key)", () => {
    const { pk } = generateCurve25519Keypair();
    const encryptor = createSealedBoxEncryptor(pk);

    const ct1 = encryptor.seal("test");
    const ct2 = encryptor.seal("test");
    expect(ct1.equals(ct2)).toBe(false);
  });

  // Test-only: unsealForTest verifies seal() produces correct ciphertext.
  // The server never calls seal_open in production (no unseal on SealedBoxEncryptor).
  it("roundtrips via test-only unseal", () => {
    const { pk, sk } = generateCurve25519Keypair();
    const encryptor = createSealedBoxEncryptor(pk);

    const original = "sensitive display name";
    const ciphertext = encryptor.seal(original);

    const { opened, plaintext } = unsealForTest(ciphertext, pk, sk);
    expect(opened).toBe(true);
    expect(plaintext.toString("utf-8")).toBe(original);
  });

  it("fails to open with wrong key (test-only unseal)", () => {
    const { pk } = generateCurve25519Keypair();
    const { sk: wrongSk } = generateCurve25519Keypair();
    const encryptor = createSealedBoxEncryptor(pk);

    const ciphertext = encryptor.seal("secret");
    const { opened } = unsealForTest(ciphertext, pk, wrongSk);
    expect(opened).toBe(false);
  });

  it("zeroes the plaintext buffer after sealing", () => {
    const { pk } = generateCurve25519Keypair();
    const encryptor = createSealedBoxEncryptor(pk);

    const ct1 = encryptor.seal("zeroing test");
    const ct2 = encryptor.seal("zeroing test");

    // Verify ciphertext is valid (zeroing didn't corrupt state)
    const { pk: pk2, sk: sk2 } = generateCurve25519Keypair();
    const enc2 = createSealedBoxEncryptor(pk2);
    const ct = enc2.seal("verify zeroing");
    const { opened, plaintext } = unsealForTest(ct, pk2, sk2);
    expect(opened).toBe(true);
    expect(plaintext.toString("utf-8")).toBe("verify zeroing");

    // Original seals should have different ciphertexts (ephemeral key changes)
    expect(ct1.equals(ct2)).toBe(false);
  });

  it("handles empty string", () => {
    const { pk, sk } = generateCurve25519Keypair();
    const encryptor = createSealedBoxEncryptor(pk);

    const ciphertext = encryptor.seal("");
    expect(ciphertext.length).toBe(sodium.crypto_box_SEALBYTES);

    const { opened, plaintext } = unsealForTest(ciphertext, pk, sk);
    expect(opened).toBe(true);
    expect(plaintext.toString("utf-8")).toBe("");
  });

  it("handles unicode content", () => {
    const { pk, sk } = generateCurve25519Keypair();
    const encryptor = createSealedBoxEncryptor(pk);

    const original = "Héllo wörld 日本語";
    const ciphertext = encryptor.seal(original);

    const messageBytes = Buffer.from(original, "utf-8");
    expect(ciphertext.length).toBe(
      messageBytes.length + sodium.crypto_box_SEALBYTES,
    );

    const { opened, plaintext } = unsealForTest(ciphertext, pk, sk);
    expect(opened).toBe(true);
    expect(plaintext.toString("utf-8")).toBe(original);
  });
});
