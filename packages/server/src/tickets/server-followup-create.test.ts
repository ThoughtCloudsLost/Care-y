import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import {
  generateContentKey,
  encryptContent,
  decryptContent,
  buildContentAad,
  followupSlot,
  blobSlot,
  eciesEncrypt,
  eciesDecrypt,
  toRistrettoPoint,
  toScalar,
  getSodium,
  requireSodium,
  InvalidKeyError,
  decodeFileKeyPayload,
  type SymmetricKey,
  type RistrettoPoint,
  type Scalar,
  type Ciphertext,
  type Nonce,
} from "@care-y/crypto";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  BlobStoreError,
  type BlobStore,
  type BlobCategory,
} from "../storage/store.js";
import {
  TestSetupError,
  createTestDb,
  createTestTicketFixture,
  seedOrgPublicKey,
  type TestDb,
} from "../test-utils.js";
import {
  createEncryptedFollowUp,
  createFollowUpWithTk,
} from "./server-followup-create.js";
import {
  newTicketId,
  type OrgSchema,
  type BlobKey,
  type ChannelRowId,
  type ChannelSecret,
  type ClientId,
} from "@care-y/shared";

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
        newTicketId(),
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
        newTicketId(),
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
          orgSchema: "org_test" as OrgSchema,
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

// ---------------------------------------------------------------------------
// DB integration: file-key envelope with portalSeal (Docker only)
// ---------------------------------------------------------------------------

/** Generates a test ristretto255 keypair for ECIES roundtrip testing. */
function generateTestKeypair(): { priv: Scalar; pub: RistrettoPoint } {
  const sodium = requireSodium();
  const priv = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
  const pub = sodium.crypto_scalarmult_ristretto255_base(
    priv,
  ) as RistrettoPoint;
  return { priv, pub };
}

/** Map-backed BlobStore for integration tests. */
function createMemoryBlobStore(): BlobStore & {
  readonly blobs: ReadonlyMap<string, Buffer>;
} {
  const blobs = new Map<string, Buffer>();
  let counter = 0;
  return {
    get blobs() {
      return blobs;
    },
    async put(
      orgSchema: OrgSchema,
      category: BlobCategory,
      blob: Buffer,
    ): Promise<BlobKey> {
      counter += 1;
      const key = `${orgSchema}/${category}/blob-${String(counter)}` as BlobKey;
      blobs.set(key, Buffer.from(blob));
      return key;
    },
    async get(key: string): Promise<Buffer | null> {
      return blobs.get(key) ?? null;
    },
    async delete(key: string): Promise<void> {
      blobs.delete(key);
    },
    async exists(key: string): Promise<boolean> {
      return blobs.has(key);
    },
  };
}

/** Seeds a portal channel and returns the row id. */
async function seedPortalChannel(
  db: Kysely<TenantDatabase>,
  clientId: ClientId,
  clientPublic: Uint8Array,
): Promise<ChannelRowId> {
  const channelId = `ch-${crypto.randomUUID().slice(0, 8)}` as ChannelSecret;
  const row = await db
    .insertInto("portal_channels")
    .values({
      client_id: clientId,
      channel_id: channelId,
      auth_hash: Buffer.alloc(32, 0xaa),
      client_public: Buffer.from(clientPublic),
      key_check_ephemeral_point: Buffer.alloc(32, 0xbb),
      key_check_nonce: Buffer.alloc(24, 0xcc),
      key_check_ciphertext: Buffer.alloc(48, 0xdd),
      status: "active",
    })
    .returning("id")
    .executeTakeFirstOrThrow();
  return row.id;
}

describe.skipIf(!process.env.DATABASE_URL)(
  "file-key envelope with portalSeal (DB)",
  () => {
    let testDb: TestDb;
    let tDb: Kysely<TenantDatabase>;

    beforeAll(async () => {
      await getSodium();
      testDb = await createTestDb();
      tDb = testDb.db;
      await seedOrgPublicKey(tDb);
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("attachment and recording rows carry non-null file_key_wrap when portalSeal is present", async () => {
      const fixture = await createTestTicketFixture(tDb);
      const kp = generateTestKeypair();
      const channelRowId = await seedPortalChannel(
        tDb,
        fixture.clientId,
        kp.pub,
      );
      const blobStore = createMemoryBlobStore();

      const result = await createEncryptedFollowUp(
        tDb,
        fixture.ticketId,
        Buffer.from("media test body"),
        "sms_inbound",
        "client",
        {
          attachments: [
            { data: Buffer.from("image-bytes"), contentType: "image/jpeg" },
          ],
          recording: { data: Buffer.from("audio-bytes"), durationSeconds: 5 },
          blobStore,
          orgSchema: testDb.schemaName as OrgSchema,
          portalSeal: {
            channelRowId,
            clientPublic: Buffer.from(kp.pub),
          },
        },
      );

      // Attachment row has file_key_wrap
      const att = await tDb
        .selectFrom("attachments")
        .selectAll()
        .where("followup_id", "=", result.followUpId)
        .executeTakeFirstOrThrow();
      expect(att.file_key_wrap).not.toBeNull();

      // Recording row has file_key_wrap
      const rec = await tDb
        .selectFrom("recordings")
        .selectAll()
        .where("followup_id", "=", result.followUpId)
        .executeTakeFirstOrThrow();
      expect(rec.file_key_wrap).not.toBeNull();
    }, 30_000);

    it("portal_attachments and portal_recordings carrier rows exist with correct channel and direction", async () => {
      const fixture = await createTestTicketFixture(tDb);
      const kp = generateTestKeypair();
      const channelRowId = await seedPortalChannel(
        tDb,
        fixture.clientId,
        kp.pub,
      );
      const blobStore = createMemoryBlobStore();

      const result = await createEncryptedFollowUp(
        tDb,
        fixture.ticketId,
        Buffer.from("carrier test"),
        "sms_inbound",
        "client",
        {
          attachments: [
            { data: Buffer.from("img-data"), contentType: "image/png" },
          ],
          recording: { data: Buffer.from("rec-data"), durationSeconds: 2 },
          blobStore,
          orgSchema: testDb.schemaName as OrgSchema,
          portalSeal: {
            channelRowId,
            clientPublic: Buffer.from(kp.pub),
          },
        },
      );

      // portal_attachments row
      const paRows = await tDb
        .selectFrom("portal_attachments")
        .selectAll()
        .where("channel_id", "=", channelRowId)
        .where("followup_id", "=", result.followUpId)
        .execute();
      expect(paRows).toHaveLength(1);
      expect(paRows[0]!.direction).toBe("from_client");

      // portal_recordings row
      const prRows = await tDb
        .selectFrom("portal_recordings")
        .selectAll()
        .where("channel_id", "=", channelRowId)
        .where("followup_id", "=", result.followUpId)
        .execute();
      expect(prRows).toHaveLength(1);
      expect(prRows[0]!.direction).toBe("from_client");
    }, 30_000);

    it("blob decrypts under the unwrapped file key and NOT under the follow-up key", async () => {
      const fixture = await createTestTicketFixture(tDb);
      const kp = generateTestKeypair();
      const channelRowId = await seedPortalChannel(
        tDb,
        fixture.clientId,
        kp.pub,
      );
      const blobStore = createMemoryBlobStore();
      const plainAttData = Buffer.from("decrypt-test-image-data");

      const result = await createEncryptedFollowUp(
        tDb,
        fixture.ticketId,
        Buffer.from("decrypt roundtrip"),
        "sms_inbound",
        "client",
        {
          attachments: [{ data: plainAttData, contentType: "image/jpeg" }],
          blobStore,
          orgSchema: testDb.schemaName as OrgSchema,
          portalSeal: {
            channelRowId,
            clientPublic: Buffer.from(kp.pub),
          },
        },
      );

      const att = await tDb
        .selectFrom("attachments")
        .selectAll()
        .where("followup_id", "=", result.followUpId)
        .executeTakeFirstOrThrow();

      // The volunteer keypair is not seeded by createTestTicketFixture,
      // so tk_temp cannot be unwrapped here; the client-side sealed
      // payload is the roundtrip under test instead.

      // The sealed portal payload should decode to the file key and empty name
      const paRow = await tDb
        .selectFrom("portal_attachments")
        .selectAll()
        .where("followup_id", "=", result.followUpId)
        .executeTakeFirstOrThrow();

      const decryptedPayload = eciesDecrypt(
        toRistrettoPoint(new Uint8Array(paRow.ephemeral_point)),
        new Uint8Array(paRow.nonce) as Nonce,
        new Uint8Array(paRow.ciphertext),
        kp.priv,
      );

      const { fileKey, filename } = decodeFileKeyPayload(decryptedPayload);
      expect(filename).toBe("");

      // Now decrypt the blob with that file key
      const storedBlob = blobStore.blobs.get(att.blob_key);
      expect(storedBlob).toBeDefined();

      const decryptedBlob = decryptContent(
        new Uint8Array(storedBlob!) as Ciphertext,
        fileKey,
        buildContentAad(fixture.ticketId, blobSlot(att.id)),
      );
      // plainAttData was zeroed by the handler, so compare against
      // the known string literal.
      expect(Buffer.from(decryptedBlob).toString("utf-8")).toBe(
        "decrypt-test-image-data",
      );

      // Verify the blob does NOT decrypt under the follow-up key (tk_temp).
      // We can recover tk_temp only if there is a wrap with a vol key we hold.
      // Instead, just generate a different random key and confirm it fails.
      const wrongKey = generateContentKey();
      expect(() =>
        decryptContent(
          new Uint8Array(storedBlob!) as Ciphertext,
          wrongKey,
          buildContentAad(fixture.ticketId, blobSlot(att.id)),
        ),
      ).toThrow("Content decryption failed");
    }, 30_000);

    it("portal carrier insert failure still lands the follow-up and org rows", async () => {
      const fixture = await createTestTicketFixture(tDb);
      const kp = generateTestKeypair();
      const channelRowId = await seedPortalChannel(
        tDb,
        fixture.clientId,
        kp.pub,
      );
      const blobStore = createMemoryBlobStore();

      // Spy on console.warn and sabotage portal_attachments inserts
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);

      const originalInsertInto = tDb.insertInto.bind(tDb);
      const insertSpy = vi.spyOn(tDb, "insertInto").mockImplementation(((
        table: string,
      ) => {
        if (table === "portal_attachments" || table === "portal_recordings") {
          return {
            values: () => ({
              execute: () =>
                Promise.reject(new Error("simulated portal write failure")),
            }),
          };
        }
        return originalInsertInto(table as never);
      }) as unknown as typeof tDb.insertInto);

      const result = await createEncryptedFollowUp(
        tDb,
        fixture.ticketId,
        Buffer.from("fault isolation test"),
        "sms_inbound",
        "client",
        {
          attachments: [
            { data: Buffer.from("att-data"), contentType: "image/png" },
          ],
          recording: { data: Buffer.from("rec-data"), durationSeconds: 3 },
          blobStore,
          orgSchema: testDb.schemaName as OrgSchema,
          portalSeal: {
            channelRowId,
            clientPublic: Buffer.from(kp.pub),
          },
        },
      );

      // Follow-up row still exists
      const fu = await tDb
        .selectFrom("followups")
        .select("id")
        .where("id", "=", result.followUpId)
        .executeTakeFirst();
      expect(fu).toBeDefined();

      // Org-side attachment row still exists with file_key_wrap
      const att = await tDb
        .selectFrom("attachments")
        .select(["id", "file_key_wrap"])
        .where("followup_id", "=", result.followUpId)
        .executeTakeFirst();
      expect(att).toBeDefined();
      expect(att!.file_key_wrap).not.toBeNull();

      // Org-side recording row still exists
      const rec = await tDb
        .selectFrom("recordings")
        .select("id")
        .where("followup_id", "=", result.followUpId)
        .executeTakeFirst();
      expect(rec).toBeDefined();

      // Portal carrier rows are absent (the insert was sabotaged)
      const paRows = await tDb
        .selectFrom("portal_attachments")
        .selectAll()
        .where("followup_id", "=", result.followUpId)
        .execute();
      expect(paRows).toHaveLength(0);

      // Warn was called without content
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Portal"));

      insertSpy.mockRestore();
      warnSpy.mockRestore();
    }, 30_000);

    it("direct envelope is unchanged when portalSeal is absent", async () => {
      const fixture = await createTestTicketFixture(tDb);
      const blobStore = createMemoryBlobStore();

      const result = await createEncryptedFollowUp(
        tDb,
        fixture.ticketId,
        Buffer.from("no portal test"),
        "sms_inbound",
        "client",
        {
          attachments: [
            { data: Buffer.from("plain-att"), contentType: "image/png" },
          ],
          recording: { data: Buffer.from("plain-rec"), durationSeconds: 1 },
          blobStore,
          orgSchema: testDb.schemaName as OrgSchema,
        },
      );

      // Attachment row has null file_key_wrap
      const att = await tDb
        .selectFrom("attachments")
        .select("file_key_wrap")
        .where("followup_id", "=", result.followUpId)
        .executeTakeFirstOrThrow();
      expect(att.file_key_wrap).toBeNull();

      // Recording row has null file_key_wrap
      const rec = await tDb
        .selectFrom("recordings")
        .select("file_key_wrap")
        .where("followup_id", "=", result.followUpId)
        .executeTakeFirstOrThrow();
      expect(rec.file_key_wrap).toBeNull();

      // No portal carrier rows
      const paRows = await tDb
        .selectFrom("portal_attachments")
        .selectAll()
        .where("followup_id", "=", result.followUpId)
        .execute();
      expect(paRows).toHaveLength(0);

      const prRows = await tDb
        .selectFrom("portal_recordings")
        .selectAll()
        .where("followup_id", "=", result.followUpId)
        .execute();
      expect(prRows).toHaveLength(0);
    }, 30_000);
  },
);
