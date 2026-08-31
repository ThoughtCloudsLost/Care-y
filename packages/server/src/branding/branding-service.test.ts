/**
 * DB integration tests for the branding service.
 *
 * Verifies plaintext round trips for every branding field, logo magic-byte
 * and size validation, terminology ciphertext storage (opaque base64-to-Buffer
 * round trip), icon upload with PNG-only enforcement, and readSafeExitUrl
 * re-validation. Branding is stored as plaintext (ADR-094) except
 * encrypted_terminology which remains org-key ciphertext.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createBrandingService, readSafeExitUrl } from "./branding-service.js";
import type { BlobStore } from "../storage/store.js";
import {
  createTestDb,
  TEST_ORG_PUBLIC_KEY,
  type TestDb,
} from "../test-utils.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { BlobKey, OrgSchema } from "@care-y/shared";
import { ValidationError, AttachmentValidationError } from "../errors.js";

// --- Magic byte prefixes for test buffers ---

/** PNG magic bytes (8 bytes). */
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
/** JPEG magic bytes (SOI marker). */
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);
/** WebP magic bytes: RIFF + 4 size bytes + WEBP. */
const WEBP_MAGIC = Buffer.from("RIFF\x00\x00\x00\x00WEBP");

function pngBuffer(extra = "icon-bytes"): Buffer {
  return Buffer.concat([PNG_MAGIC, Buffer.from(extra)]);
}

function jpegBuffer(extra = "jpeg-data"): Buffer {
  return Buffer.concat([JPEG_MAGIC, Buffer.from(extra)]);
}

function webpBuffer(extra = "webp-data"): Buffer {
  return Buffer.concat([WEBP_MAGIC, Buffer.from(extra)]);
}

// --- Seed data ---

const SEED = {
  name: "Test Org",
  logo: pngBuffer("seed-logo"),
  primaryColor: "#4A90D9",
  accentColor: "#FF6B35",
  clientText: "Welcome to our service",
  clientSupportLabel: "Support Team",
  encryptedTerminology: Buffer.from("enc-terminology-bytes"),
};

async function seedOrgConfig(db: Kysely<TenantDatabase>): Promise<void> {
  await db
    .insertInto("org_config")
    .values({
      org_public_key: TEST_ORG_PUBLIC_KEY,
      // care-y-ignore-next-line ast-pii-in-db-write -- test seed for plaintext branding columns (ADR-094)
      name: SEED.name,
      logo: SEED.logo,
      primary_color: SEED.primaryColor,
      accent_color: SEED.accentColor,
      client_text: SEED.clientText,
      client_support_label: SEED.clientSupportLabel,
      encrypted_terminology: SEED.encryptedTerminology,
    })
    .execute();
}

async function resetOrgConfig(db: Kysely<TenantDatabase>): Promise<void> {
  await db
    .updateTable("org_config")
    .set({
      // care-y-ignore-next-line ast-pii-in-db-write -- test reset for plaintext branding columns (ADR-094)
      name: SEED.name,
      logo: SEED.logo,
      primary_color: SEED.primaryColor,
      accent_color: SEED.accentColor,
      client_text: SEED.clientText,
      client_support_label: SEED.clientSupportLabel,
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
    put: vi.fn(async () => `blob-key-${++counter}` as BlobKey),
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
    it("returns plaintext fields and logo as base64url", async () => {
      const svc = createBrandingService(db);
      const result = await svc.getBranding();

      expect(result).toEqual({
        name: SEED.name,
        logo: SEED.logo.toString("base64url"),
        primaryColor: SEED.primaryColor,
        accentColor: SEED.accentColor,
        clientText: SEED.clientText,
        clientSupportLabel: SEED.clientSupportLabel,
        encryptedTerminology: SEED.encryptedTerminology.toString("base64url"),
        hasIcons: false,
        iconVersion: null,
      });
    });

    it("returns null for unset fields", async () => {
      await db
        .updateTable("org_config")
        // care-y-ignore-next-line ast-pii-in-db-write -- test clears plaintext branding columns (ADR-094)
        .set({ name: null, logo: null })
        .execute();

      const svc = createBrandingService(db);
      const result = await svc.getBranding();

      expect(result.name).toBeNull();
      expect(result.logo).toBeNull();

      await resetOrgConfig(db);
    });

    it("hasIcons is true when icon blob keys are present", async () => {
      await db
        .updateTable("org_config")
        .set({ icon_192_blob_key: "some-key-abcdef" as BlobKey })
        .execute();

      const svc = createBrandingService(db);
      const result = await svc.getBranding();

      expect(result.hasIcons).toBe(true);
      expect(result.iconVersion).toBe("some-key");

      await resetOrgConfig(db);
    });
  });

  describe("iconBlobKey", () => {
    it("returns the stored key for each size and null for unset sizes", async () => {
      await db
        .updateTable("org_config")
        .set({
          icon_192_blob_key: "key-192" as BlobKey,
          icon_maskable_blob_key: "key-mask" as BlobKey,
        })
        .execute();

      const svc = createBrandingService(db);
      expect(await svc.iconBlobKey("192")).toBe("key-192");
      expect(await svc.iconBlobKey("maskable")).toBe("key-mask");
      expect(await svc.iconBlobKey("512")).toBeNull();

      await db
        .updateTable("org_config")
        .set({ icon_192_blob_key: null, icon_maskable_blob_key: null })
        .execute();
      await resetOrgConfig(db);
    });
  });

  describe("getPublicBranding", () => {
    it("returns plaintext branding fields and org public key", async () => {
      const svc = createBrandingService(db);
      const result = await svc.getPublicBranding();

      expect(result.orgPublicKey).toBe(
        TEST_ORG_PUBLIC_KEY.toString("base64url"),
      );
      expect(result.name).toBe(SEED.name);
      expect(result.primaryColor).toBe(SEED.primaryColor);
      expect(result.accentColor).toBe(SEED.accentColor);
      expect(result.clientText).toBe(SEED.clientText);
      expect(result.supportLabel).toBe(SEED.clientSupportLabel);
      expect(result.hasIcons).toBe(false);
      expect(result.iconVersion).toBeNull();
    });

    it("returns no exit URL when the org has configured none", async () => {
      const svc = createBrandingService(db);
      const result = await svc.getPublicBranding();
      expect(result.safeExitUrl).toBeNull();
    });

    it("returns the org's configured exit URL", async () => {
      await db
        .updateTable("org_config")
        .set({ portal_safe_exit_url: "https://weather.gov" })
        .execute();

      const svc = createBrandingService(db);
      const result = await svc.getPublicBranding();

      expect(result.safeExitUrl).toBe("https://weather.gov");
      await db
        .updateTable("org_config")
        .set({ portal_safe_exit_url: null })
        .execute();
    });

    it("drops a stored exit URL that is no longer valid", async () => {
      await db
        .updateTable("org_config")
        .set({ portal_safe_exit_url: "javascript:alert(1)" })
        .execute();

      const svc = createBrandingService(db);
      const result = await svc.getPublicBranding();

      expect(result.safeExitUrl).toBeNull();
      await db
        .updateTable("org_config")
        .set({ portal_safe_exit_url: null })
        .execute();
    });
  });

  describe("readSafeExitUrl", () => {
    it("passes an absolute https URL through", () => {
      expect(readSafeExitUrl("https://weather.gov")).toBe(
        "https://weather.gov",
      );
    });

    it("returns null for no configured URL", () => {
      expect(readSafeExitUrl(null)).toBeNull();
    });

    const rejected = [
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "http://weather.gov",
      "/weather",
      "not a url",
    ];

    for (const stored of rejected) {
      it(`returns null for ${stored}`, () => {
        expect(readSafeExitUrl(stored)).toBeNull();
      });
    }
  });

  describe("saveBrandingField", () => {
    it("saves name field as plaintext and reads it back", async () => {
      const svc = createBrandingService(db);
      await svc.saveBrandingField({ field: "name", value: "New Org Name" });

      const row = await db
        .selectFrom("org_config")
        .select("name")
        .executeTakeFirstOrThrow();

      expect(row.name).toBe("New Org Name");

      await resetOrgConfig(db);
    });

    it("saves support_label field to correct column", async () => {
      const svc = createBrandingService(db);
      await svc.saveBrandingField({
        field: "support_label",
        value: "The Night Team",
      });

      const row = await db
        .selectFrom("org_config")
        .select(["client_support_label", "client_text"])
        .executeTakeFirstOrThrow();

      expect(row.client_support_label).toBe("The Night Team");
      // The neighbouring client-text column must not be collateral.
      expect(row.client_text).toBe(SEED.clientText);

      await resetOrgConfig(db);
    });

    it("saves PNG logo field and reads it back", async () => {
      const svc = createBrandingService(db);
      const logoBuf = pngBuffer("new-logo");
      await svc.saveBrandingField({
        field: "logo",
        value: logoBuf.toString("base64"),
      });

      const row = await db
        .selectFrom("org_config")
        .select("logo")
        .executeTakeFirstOrThrow();

      expect(row.logo).toEqual(logoBuf);

      await resetOrgConfig(db);
    });

    it("accepts JPEG logo", async () => {
      const svc = createBrandingService(db);
      const logoBuf = jpegBuffer();
      await svc.saveBrandingField({
        field: "logo",
        value: logoBuf.toString("base64"),
      });

      const row = await db
        .selectFrom("org_config")
        .select("logo")
        .executeTakeFirstOrThrow();

      expect(row.logo).toEqual(logoBuf);
      await resetOrgConfig(db);
    });

    it("accepts WebP logo", async () => {
      const svc = createBrandingService(db);
      const logoBuf = webpBuffer();
      await svc.saveBrandingField({
        field: "logo",
        value: logoBuf.toString("base64"),
      });

      const row = await db
        .selectFrom("org_config")
        .select("logo")
        .executeTakeFirstOrThrow();

      expect(row.logo).toEqual(logoBuf);
      await resetOrgConfig(db);
    });

    it("rejects logo with invalid magic bytes", async () => {
      const svc = createBrandingService(db);
      const badLogo = Buffer.from("not-an-image-at-all");
      await expect(
        svc.saveBrandingField({
          field: "logo",
          value: badLogo.toString("base64"),
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects logo exceeding the 2 MB size cap", async () => {
      const svc = createBrandingService(db);
      const oversized = Buffer.alloc(2 * 1024 * 1024 + 1);
      // Write PNG magic so it passes format check before size
      PNG_MAGIC.copy(oversized);
      await expect(
        svc.saveBrandingField({
          field: "logo",
          value: oversized.toString("base64"),
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("saves primary_color field to correct column", async () => {
      const svc = createBrandingService(db);
      await svc.saveBrandingField({
        field: "primary_color",
        value: "#FF0000",
      });

      const row = await db
        .selectFrom("org_config")
        .select("primary_color")
        .executeTakeFirstOrThrow();

      expect(row.primary_color).toBe("#FF0000");

      await resetOrgConfig(db);
    });

    it("saves accent_color field to correct column", async () => {
      const svc = createBrandingService(db);
      await svc.saveBrandingField({
        field: "accent_color",
        value: "#00FF00",
      });

      const row = await db
        .selectFrom("org_config")
        .select("accent_color")
        .executeTakeFirstOrThrow();

      expect(row.accent_color).toBe("#00FF00");
      await resetOrgConfig(db);
    });

    it("saves client_text field to correct column", async () => {
      const svc = createBrandingService(db);
      await svc.saveBrandingField({
        field: "client_text",
        value: "Updated welcome text",
      });

      const row = await db
        .selectFrom("org_config")
        .select("client_text")
        .executeTakeFirstOrThrow();

      expect(row.client_text).toBe("Updated welcome text");

      await resetOrgConfig(db);
    });

    it("saves terminology as base64-decoded Buffer into encrypted_terminology", async () => {
      const svc = createBrandingService(db);
      const terminologyBytes = Buffer.from("opaque-ciphertext-blob");
      await svc.saveBrandingField({
        field: "terminology",
        value: terminologyBytes.toString("base64"),
      });

      const row = await db
        .selectFrom("org_config")
        .select("encrypted_terminology")
        .executeTakeFirstOrThrow();

      expect(row.encrypted_terminology).toEqual(terminologyBytes);

      await resetOrgConfig(db);
    });
  });

  describe("uploadIcons", () => {
    it("stores three icon blobs and saves keys to DB", async () => {
      const store = createMockBlobStore();
      const svc = createBrandingService(db);

      await svc.uploadIcons(store, testDb.schemaName as OrgSchema, {
        icon192: pngBuffer("192").toString("base64"),
        icon512: pngBuffer("512").toString("base64"),
        iconMaskable: pngBuffer("mask").toString("base64"),
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

    it("rejects non-PNG icons", async () => {
      const store = createMockBlobStore();
      const svc = createBrandingService(db);

      await expect(
        svc.uploadIcons(store, testDb.schemaName as OrgSchema, {
          icon192: jpegBuffer().toString("base64"),
          icon512: pngBuffer("512").toString("base64"),
          iconMaskable: pngBuffer("mask").toString("base64"),
        }),
      ).rejects.toThrow(AttachmentValidationError);
    });

    it("rejects icons exceeding the size cap", async () => {
      const store = createMockBlobStore();
      const svc = createBrandingService(db);
      const oversized = Buffer.alloc(2 * 1024 * 1024 + 1);
      PNG_MAGIC.copy(oversized);

      await expect(
        svc.uploadIcons(store, testDb.schemaName as OrgSchema, {
          icon192: oversized.toString("base64"),
          icon512: pngBuffer("512").toString("base64"),
          iconMaskable: pngBuffer("mask").toString("base64"),
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("cleans up old icon blobs when replacing", async () => {
      await db
        .updateTable("org_config")
        .set({
          icon_192_blob_key: "old-key-1" as BlobKey,
          icon_512_blob_key: "old-key-2" as BlobKey,
          icon_maskable_blob_key: "old-key-3" as BlobKey,
        })
        .execute();

      const store = createMockBlobStore();
      const svc = createBrandingService(db);

      await svc.uploadIcons(store, testDb.schemaName as OrgSchema, {
        icon192: pngBuffer("192").toString("base64"),
        icon512: pngBuffer("512").toString("base64"),
        iconMaskable: pngBuffer("mask").toString("base64"),
      });

      expect(store.delete).toHaveBeenCalledWith("old-key-1");
      expect(store.delete).toHaveBeenCalledWith("old-key-2");
      expect(store.delete).toHaveBeenCalledWith("old-key-3");

      await resetOrgConfig(db);
    });

    it("skips cleanup when no old icons exist", async () => {
      const store = createMockBlobStore();
      const svc = createBrandingService(db);

      await svc.uploadIcons(store, testDb.schemaName as OrgSchema, {
        icon192: pngBuffer("192").toString("base64"),
        icon512: pngBuffer("512").toString("base64"),
        iconMaskable: pngBuffer("mask").toString("base64"),
      });

      expect(store.delete).not.toHaveBeenCalled();

      await resetOrgConfig(db);
    });
  });
});
