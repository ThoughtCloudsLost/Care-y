import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createBrandingService } from "./branding-service.js";
import type { BlobStore } from "../storage/store.js";
import {
  createTestDb,
  TEST_ORG_PUBLIC_KEY,
  type TestDb,
} from "../test-utils.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type * as BrandingCrypto from "./branding-crypto.js";
import type * as AttachmentValidator from "../telephony/attachment-validator.js";

// Spread the original so exports this file does not stub (BRANDING_AAD,
// which test-utils imports) stay real instead of becoming undefined.
vi.mock("./branding-crypto.js", async (importOriginal) => ({
  ...(await importOriginal<typeof BrandingCrypto>()),
  deriveBrandingKey: () => Buffer.alloc(32),
  decryptBrandingBlob: (_buf: Buffer) => _buf,
}));

vi.mock("../telephony/attachment-validator.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AttachmentValidator>()),
  validateMagicBytes: vi.fn(),
}));

// --- Seed data ---

const SEED = {
  encryptedName: Buffer.from("enc-name"),
  encryptedLogo: Buffer.from("enc-logo"),
  encryptedPrimaryColor: Buffer.from("enc-color"),
  encryptedAccentColor: Buffer.from("enc-accent"),
  encryptedClientText: Buffer.from("enc-text"),
  clientEncryptedBranding: Buffer.from("enc-client-blob"),
  encryptedTerminology: Buffer.from("enc-terminology"),
};

async function seedOrgConfig(db: Kysely<TenantDatabase>): Promise<void> {
  await db
    .insertInto("org_config")
    .values({
      org_public_key: TEST_ORG_PUBLIC_KEY,
      encrypted_name: SEED.encryptedName,
      encrypted_logo: SEED.encryptedLogo,
      encrypted_primary_color: SEED.encryptedPrimaryColor,
      encrypted_accent_color: SEED.encryptedAccentColor,
      encrypted_client_text: SEED.encryptedClientText,
      client_encrypted_branding: SEED.clientEncryptedBranding,
      encrypted_terminology: SEED.encryptedTerminology,
    })
    .execute();
}

async function resetOrgConfig(db: Kysely<TenantDatabase>): Promise<void> {
  await db
    .updateTable("org_config")
    .set({
      encrypted_name: SEED.encryptedName,
      encrypted_logo: SEED.encryptedLogo,
      encrypted_primary_color: SEED.encryptedPrimaryColor,
      encrypted_accent_color: SEED.encryptedAccentColor,
      encrypted_client_text: SEED.encryptedClientText,
      client_encrypted_branding: SEED.clientEncryptedBranding,
      encrypted_terminology: SEED.encryptedTerminology,
      icon_192_blob_key: null,
      icon_512_blob_key: null,
      icon_maskable_blob_key: null,
    })
    .execute();
}

function createMockBlobStore(): BlobStore {
  let counter = 0;
  return {
    put: vi.fn(async () => `blob-key-${++counter}`),
    get: vi.fn(async () => null),
    delete: vi.fn(async () => undefined),
    exists: vi.fn(async () => false),
  };
}

describe.skipIf(!process.env.DATABASE_URL)("createBrandingService", () => {
  let testDb: TestDb;
  let db: Kysely<TenantDatabase>;

  beforeAll(async () => {
    testDb = await createTestDb();
    db = testDb.db;
    await seedOrgConfig(db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  describe("getBranding", () => {
    it("returns all fields as base64 strings (wire format)", async () => {
      const svc = createBrandingService(db);
      const result = await svc.getBranding();

      expect(result).toEqual({
        encryptedName: SEED.encryptedName.toString("base64url"),
        encryptedLogo: SEED.encryptedLogo.toString("base64url"),
        encryptedPrimaryColor: SEED.encryptedPrimaryColor.toString("base64url"),
        encryptedAccentColor: SEED.encryptedAccentColor.toString("base64url"),
        encryptedClientText: SEED.encryptedClientText.toString("base64url"),
        clientEncryptedBranding:
          SEED.clientEncryptedBranding.toString("base64url"),
        encryptedTerminology: SEED.encryptedTerminology.toString("base64url"),
        hasIcons: false,
        iconVersion: null,
      });
    });

    it("returns null for unset fields", async () => {
      await db
        .updateTable("org_config")
        .set({ encrypted_name: null, encrypted_logo: null })
        .execute();

      const svc = createBrandingService(db);
      const result = await svc.getBranding();

      expect(result.encryptedName).toBeNull();
      expect(result.encryptedLogo).toBeNull();

      await resetOrgConfig(db);
    });

    it("hasIcons is true when icon blob keys are present", async () => {
      await db
        .updateTable("org_config")
        .set({ icon_192_blob_key: "some-key-abcdef" })
        .execute();

      const svc = createBrandingService(db);
      const result = await svc.getBranding();

      expect(result.hasIcons).toBe(true);
      expect(result.iconVersion).toBe("some-key");

      await resetOrgConfig(db);
    });
  });

  describe("getPublicBranding", () => {
    it("returns org public key and client branding as base64", async () => {
      const svc = createBrandingService(db);
      const result = await svc.getPublicBranding();

      expect(result.orgPublicKey).toBe(
        TEST_ORG_PUBLIC_KEY.toString("base64url"),
      );
      expect(result.clientEncryptedBranding).toBe(
        SEED.clientEncryptedBranding.toString("base64url"),
      );
      expect(result.hasIcons).toBe(false);
      expect(result.iconVersion).toBeNull();
    });
  });

  describe("saveBrandingField", () => {
    it("saves name field and reads it back", async () => {
      const svc = createBrandingService(db);
      const newValue = Buffer.from("new-name").toString("base64");
      await svc.saveBrandingField({ field: "name", encryptedValue: newValue });

      const row = await db
        .selectFrom("org_config")
        .select("encrypted_name")
        .executeTakeFirstOrThrow();

      expect(row.encrypted_name).toEqual(Buffer.from("new-name"));

      await resetOrgConfig(db);
    });

    it("saves logo field to correct column", async () => {
      const svc = createBrandingService(db);
      const newValue = Buffer.from("logo-data").toString("base64");
      await svc.saveBrandingField({ field: "logo", encryptedValue: newValue });

      const row = await db
        .selectFrom("org_config")
        .select("encrypted_logo")
        .executeTakeFirstOrThrow();

      expect(row.encrypted_logo).toEqual(Buffer.from("logo-data"));

      await resetOrgConfig(db);
    });

    it("saves primary_color field to correct column", async () => {
      const svc = createBrandingService(db);
      const newValue = Buffer.from("#ff0000").toString("base64");
      await svc.saveBrandingField({
        field: "primary_color",
        encryptedValue: newValue,
      });

      const row = await db
        .selectFrom("org_config")
        .select("encrypted_primary_color")
        .executeTakeFirstOrThrow();

      expect(row.encrypted_primary_color).toEqual(Buffer.from("#ff0000"));

      await resetOrgConfig(db);
    });

    it("saves client_text field to correct column", async () => {
      const svc = createBrandingService(db);
      const newValue = Buffer.from("welcome text").toString("base64");
      await svc.saveBrandingField({
        field: "client_text",
        encryptedValue: newValue,
      });

      const row = await db
        .selectFrom("org_config")
        .select("encrypted_client_text")
        .executeTakeFirstOrThrow();

      expect(row.encrypted_client_text).toEqual(Buffer.from("welcome text"));

      await resetOrgConfig(db);
    });

    it("includes clientEncryptedBranding when provided (dual-blob save)", async () => {
      const svc = createBrandingService(db);
      await svc.saveBrandingField({
        field: "name",
        encryptedValue: Buffer.from("new-name").toString("base64"),
        clientEncryptedBranding: Buffer.from("client-blob").toString("base64"),
      });

      const row = await db
        .selectFrom("org_config")
        .select(["encrypted_name", "client_encrypted_branding"])
        .executeTakeFirstOrThrow();

      expect(row.encrypted_name).toEqual(Buffer.from("new-name"));
      expect(row.client_encrypted_branding).toEqual(Buffer.from("client-blob"));

      await resetOrgConfig(db);
    });

    it("does not overwrite clientEncryptedBranding when not provided", async () => {
      const svc = createBrandingService(db);
      await svc.saveBrandingField({
        field: "name",
        encryptedValue: Buffer.from("just-name").toString("base64"),
      });

      const row = await db
        .selectFrom("org_config")
        .select("client_encrypted_branding")
        .executeTakeFirstOrThrow();

      expect(row.client_encrypted_branding).toEqual(
        SEED.clientEncryptedBranding,
      );

      await resetOrgConfig(db);
    });
  });

  describe("uploadIcons", () => {
    it("stores three icon blobs and saves keys to DB", async () => {
      const store = createMockBlobStore();
      const svc = createBrandingService(db);

      await svc.uploadIcons(store, testDb.schemaName, {
        icon192: Buffer.from("192").toString("base64"),
        icon512: Buffer.from("512").toString("base64"),
        iconMaskable: Buffer.from("mask").toString("base64"),
      });

      expect(store.put).toHaveBeenCalledTimes(3);

      const row = await db
        .selectFrom("org_config")
        .select([
          "icon_192_blob_key",
          "icon_512_blob_key",
          "icon_maskable_blob_key",
        ])
        .executeTakeFirstOrThrow();

      expect(row.icon_192_blob_key).toBe("blob-key-1");
      expect(row.icon_512_blob_key).toBe("blob-key-2");
      expect(row.icon_maskable_blob_key).toBe("blob-key-3");

      await resetOrgConfig(db);
    });

    it("cleans up old icon blobs when replacing", async () => {
      await db
        .updateTable("org_config")
        .set({
          icon_192_blob_key: "old-key-1",
          icon_512_blob_key: "old-key-2",
          icon_maskable_blob_key: "old-key-3",
        })
        .execute();

      const store = createMockBlobStore();
      const svc = createBrandingService(db);

      await svc.uploadIcons(store, testDb.schemaName, {
        icon192: Buffer.from("192").toString("base64"),
        icon512: Buffer.from("512").toString("base64"),
        iconMaskable: Buffer.from("mask").toString("base64"),
      });

      expect(store.delete).toHaveBeenCalledWith("old-key-1");
      expect(store.delete).toHaveBeenCalledWith("old-key-2");
      expect(store.delete).toHaveBeenCalledWith("old-key-3");

      await resetOrgConfig(db);
    });

    it("skips cleanup when no old icons exist", async () => {
      const store = createMockBlobStore();
      const svc = createBrandingService(db);

      await svc.uploadIcons(store, testDb.schemaName, {
        icon192: Buffer.from("192").toString("base64"),
        icon512: Buffer.from("512").toString("base64"),
        iconMaskable: Buffer.from("mask").toString("base64"),
      });

      expect(store.delete).not.toHaveBeenCalled();

      await resetOrgConfig(db);
    });
  });
});
