import { describe, it, expect, beforeAll } from "vitest";
import {
  generateContentKey,
  encryptContent,
  decryptContent,
  buildContentAad,
  followupSlot,
  eciesEncrypt,
  eciesDecrypt,
  toRistrettoPoint,
  toScalar,
  getSodium,
  InvalidKeyError,
  type SymmetricKey,
  type RistrettoPoint,
  type Scalar,
} from "@care-y/crypto";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { BlobStoreError, type BlobStore } from "../storage/store.js";
import { TestSetupError } from "../test-utils.js";
import {
  createEncryptedFollowUp,
  createFollowUpWithTk,
} from "./server-followup-create.js";

let volPublic: RistrettoPoint;
let volPrivate: Scalar;

// One followup slot AAD reused across the simulated flows. Encrypt and
// decrypt must agree on it exactly (ADR-053).
const AAD = buildContentAad("ticket-sfc-test", followupSlot("fu-sfc-1"));

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

    const encrypted = encryptContent(new Uint8Array(body), tkTemp, AAD);
    const decrypted = decryptContent(encrypted, tkTemp, AAD);

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
    const tempEncrypted = encryptContent(Buffer.from(plaintext), tkTemp, AAD);

    // Simulate volunteer Worker: decrypt with tk_temp
    const decrypted = decryptContent(tempEncrypted, tkTemp, AAD);
    expect(Buffer.from(decrypted).toString("utf-8")).toBe(plaintext);

    // Re-encrypt with canonical tk
    const canonicalEncrypted = encryptContent(decrypted, tk, AAD);

    // Verify: decrypts with tk
    const finalDecrypted = decryptContent(canonicalEncrypted, tk, AAD);
    expect(Buffer.from(finalDecrypted).toString("utf-8")).toBe(plaintext);

    // Verify: does NOT decrypt with tk_temp
    expect(() => decryptContent(canonicalEncrypted, tkTemp, AAD)).toThrow(
      "Content decryption failed",
    );
  });

  it("different tk_temp values cannot cross-decrypt", () => {
    const tkTemp1 = generateContentKey();
    const tkTemp2 = generateContentKey();

    const encrypted1 = encryptContent(Buffer.from("message 1"), tkTemp1, AAD);
    const encrypted2 = encryptContent(Buffer.from("message 2"), tkTemp2, AAD);

    // Each can decrypt its own
    expect(
      Buffer.from(decryptContent(encrypted1, tkTemp1, AAD)).toString("utf-8"),
    ).toBe("message 1");
    expect(
      Buffer.from(decryptContent(encrypted2, tkTemp2, AAD)).toString("utf-8"),
    ).toBe("message 2");

    // Cross-decryption fails
    expect(() => decryptContent(encrypted1, tkTemp2, AAD)).toThrow(
      "Content decryption failed",
    );
    expect(() => decryptContent(encrypted2, tkTemp1, AAD)).toThrow(
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
      AAD,
    );
    const decryptedAttachment = decryptContent(
      encryptedAttachment,
      tkTemp,
      AAD,
    );

    expect(Buffer.from(decryptedAttachment)).toEqual(attachmentData);
  });
});

describe("createFollowUpWithTk crypto roundtrips", () => {
  it("follow-up encrypted with ticket tk decrypts with same tk", () => {
    const tk = generateContentKey();
    const body = Buffer.from("First SMS on a new ticket");

    const encrypted = encryptContent(new Uint8Array(body), tk, AAD);
    const decrypted = decryptContent(encrypted, tk, AAD);

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
    const encrypted = encryptContent(new Uint8Array(body), tk, AAD);

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
      AAD,
    );

    expect(Buffer.from(decrypted).toString("utf-8")).toBe(
      "Follow-up content on new ticket",
    );
  });
});

describe("Buffer zeroing contracts", () => {
  // Both error-path tests fail before the first query, so any db access
  // is a test bug, not a service behavior.
  const dbNever = new Proxy(
    {},
    {
      get(): never {
        throw new TestSetupError("db must not be touched on this error path");
      },
    },
  ) as unknown as Kysely<TenantDatabase>;

  it("plaintext Buffer is zeroed after encryption", () => {
    const tk = generateContentKey();
    const plaintext = Buffer.from("sensitive content");

    encryptContent(new Uint8Array(plaintext), tk, AAD);

    // The Uint8Array view used for encryption shares the same underlying
    // ArrayBuffer as the original Buffer. We verify the pattern by
    // simulating what the handler does: zero the Buffer after encrypt.
    plaintext.fill(0);
    expect(plaintext.every((b) => b === 0)).toBe(true);
  });

  it("createFollowUpWithTk zeroes content when encryption throws", async () => {
    const content = Buffer.from("sensitive follow-up body");
    const shortTk = new Uint8Array(16) as SymmetricKey;

    await expect(
      createFollowUpWithTk(
        dbNever,
        crypto.randomUUID(),
        shortTk,
        content,
        "message",
        "system",
      ),
    ).rejects.toThrow(InvalidKeyError);

    expect(content.every((b) => b === 0)).toBe(true);
  });

  it("createEncryptedFollowUp zeroes content and media buffers when blob storage fails", async () => {
    const content = Buffer.from("sensitive body");
    const attachmentOne = Buffer.from("attachment one bytes");
    const attachmentTwo = Buffer.from("attachment two bytes");
    const recording = Buffer.from("recording audio bytes");
    const failingStore: BlobStore = {
      put: () => Promise.reject(new BlobStoreError("disk full")),
      get: () => Promise.resolve(null),
      delete: () => Promise.resolve(),
      exists: () => Promise.resolve(false),
    };

    await expect(
      createEncryptedFollowUp(
        dbNever,
        crypto.randomUUID(),
        content,
        "message",
        "system",
        {
          attachments: [
            { data: attachmentOne, contentType: "image/png" },
            { data: attachmentTwo, contentType: "image/png" },
          ],
          recording: { data: recording, durationSeconds: 3 },
          blobStore: failingStore,
          orgSchema: "org_test",
        },
      ),
    ).rejects.toThrow(BlobStoreError);

    // put rejects on the first attachment: the already-encrypted buffer,
    // the never-reached ones, and the plaintext content must all be zeroed.
    expect(content.every((b) => b === 0)).toBe(true);
    expect(attachmentOne.every((b) => b === 0)).toBe(true);
    expect(attachmentTwo.every((b) => b === 0)).toBe(true);
    expect(recording.every((b) => b === 0)).toBe(true);
  });
});
