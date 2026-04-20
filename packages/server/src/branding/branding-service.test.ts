import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBrandingService } from "./branding-service.js";
import type { BlobStore } from "../storage/store.js";

function createMockDb(): {
  db: Parameters<typeof createBrandingService>[0];
  selectResult: Record<string, unknown>;
  txUpdateSpy: ReturnType<typeof vi.fn>;
} {
  const selectResult: Record<string, unknown> = {
    encrypted_name: Buffer.from("enc-name"),
    encrypted_logo: Buffer.from("enc-logo"),
    encrypted_primary_color: Buffer.from("enc-color"),
    encrypted_client_text: Buffer.from("enc-text"),
    client_encrypted_branding: Buffer.from("enc-client-blob"),
    icon_192_blob_key: null,
    icon_512_blob_key: null,
    icon_maskable_blob_key: null,
  };

  const txUpdateSpy = vi.fn().mockReturnValue({ execute: vi.fn() });

  const selectChain = {
    select: vi.fn().mockReturnThis(),
    executeTakeFirstOrThrow: vi.fn().mockResolvedValue(selectResult),
  };

  const txDb = {
    updateTable: vi.fn().mockReturnValue({
      set: txUpdateSpy,
    }),
  };

  const db = {
    selectFrom: vi.fn().mockReturnValue(selectChain),
    transaction: vi.fn().mockReturnValue({
      execute: vi.fn(async (fn: (tx: typeof txDb) => Promise<void>) =>
        fn(txDb),
      ),
    }),
  } as unknown as Parameters<typeof createBrandingService>[0];

  return { db, selectResult, txUpdateSpy };
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

describe("createBrandingService", () => {
  let dbMock: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    dbMock = createMockDb();
  });

  describe("getBranding", () => {
    it("returns all fields as base64 strings (wire format)", async () => {
      const svc = createBrandingService(dbMock.db);
      const result = await svc.getBranding();

      expect(result).toEqual({
        encryptedName: Buffer.from("enc-name").toString("base64"),
        encryptedLogo: Buffer.from("enc-logo").toString("base64"),
        encryptedPrimaryColor: Buffer.from("enc-color").toString("base64"),
        encryptedClientText: Buffer.from("enc-text").toString("base64"),
        clientEncryptedBranding:
          Buffer.from("enc-client-blob").toString("base64"),
      });
    });

    it("returns null for unset fields", async () => {
      dbMock.selectResult.encrypted_name = null;
      dbMock.selectResult.encrypted_logo = null;
      const svc = createBrandingService(dbMock.db);
      const result = await svc.getBranding();

      expect(result.encryptedName).toBeNull();
      expect(result.encryptedLogo).toBeNull();
    });

    it("queries org_config with correct columns", async () => {
      const svc = createBrandingService(dbMock.db);
      await svc.getBranding();

      expect(dbMock.db.selectFrom).toHaveBeenCalledWith("org_config");
    });
  });

  describe("saveBrandingField", () => {
    it("saves name field in a transaction", async () => {
      const svc = createBrandingService(dbMock.db);
      await svc.saveBrandingField({
        field: "name",
        encryptedValue: Buffer.from("new-name").toString("base64"),
      });

      expect(dbMock.db.transaction).toHaveBeenCalled();
      expect(dbMock.txUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          encrypted_name: expect.any(Buffer) as Buffer,
        }),
      );
    });

    it("saves logo field to correct column", async () => {
      const svc = createBrandingService(dbMock.db);
      await svc.saveBrandingField({
        field: "logo",
        encryptedValue: Buffer.from("logo-data").toString("base64"),
      });

      expect(dbMock.txUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          encrypted_logo: expect.any(Buffer) as Buffer,
        }),
      );
    });

    it("saves primary_color field to correct column", async () => {
      const svc = createBrandingService(dbMock.db);
      await svc.saveBrandingField({
        field: "primary_color",
        encryptedValue: Buffer.from("#ff0000").toString("base64"),
      });

      expect(dbMock.txUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          encrypted_primary_color: expect.any(Buffer) as Buffer,
        }),
      );
    });

    it("saves client_text field to correct column", async () => {
      const svc = createBrandingService(dbMock.db);
      await svc.saveBrandingField({
        field: "client_text",
        encryptedValue: Buffer.from("welcome text").toString("base64"),
      });

      expect(dbMock.txUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          encrypted_client_text: expect.any(Buffer) as Buffer,
        }),
      );
    });

    it("includes clientEncryptedBranding when provided (SOG-14 dual-blob)", async () => {
      const svc = createBrandingService(dbMock.db);
      await svc.saveBrandingField({
        field: "name",
        encryptedValue: Buffer.from("new-name").toString("base64"),
        clientEncryptedBranding: Buffer.from("client-blob").toString("base64"),
      });

      expect(dbMock.txUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          encrypted_name: expect.any(Buffer) as Buffer,
          client_encrypted_branding: expect.any(Buffer) as Buffer,
        }),
      );
    });

    it("omits clientEncryptedBranding when not provided", async () => {
      const svc = createBrandingService(dbMock.db);
      await svc.saveBrandingField({
        field: "name",
        encryptedValue: Buffer.from("new-name").toString("base64"),
      });

      const call = dbMock.txUpdateSpy.mock.calls[0] as
        | [Record<string, unknown>]
        | undefined;
      expect(call).toBeDefined();
      expect(call![0]).not.toHaveProperty("client_encrypted_branding");
    });
  });

  describe("uploadIcons", () => {
    it("stores three icon blobs and saves keys in a transaction", async () => {
      const store = createMockBlobStore();
      const svc = createBrandingService(dbMock.db);

      await svc.uploadIcons(store, "org_test", {
        icon192: Buffer.from("192").toString("base64"),
        icon512: Buffer.from("512").toString("base64"),
        iconMaskable: Buffer.from("mask").toString("base64"),
      });

      expect(store.put).toHaveBeenCalledTimes(3);
      expect(store.put).toHaveBeenCalledWith(
        "org_test",
        "branding",
        expect.any(Buffer) as Buffer,
      );
      expect(dbMock.db.transaction).toHaveBeenCalled();
      expect(dbMock.txUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          icon_192_blob_key: expect.any(String) as string,
          icon_512_blob_key: expect.any(String) as string,
          icon_maskable_blob_key: expect.any(String) as string,
        }),
      );
    });

    it("cleans up old icon blobs when replacing", async () => {
      dbMock.selectResult.icon_192_blob_key = "old-key-1";
      dbMock.selectResult.icon_512_blob_key = "old-key-2";
      dbMock.selectResult.icon_maskable_blob_key = "old-key-3";

      const store = createMockBlobStore();
      const svc = createBrandingService(dbMock.db);

      await svc.uploadIcons(store, "org_test", {
        icon192: Buffer.from("192").toString("base64"),
        icon512: Buffer.from("512").toString("base64"),
        iconMaskable: Buffer.from("mask").toString("base64"),
      });

      expect(store.delete).toHaveBeenCalledWith("old-key-1");
      expect(store.delete).toHaveBeenCalledWith("old-key-2");
      expect(store.delete).toHaveBeenCalledWith("old-key-3");
    });

    it("skips cleanup when no old icons exist", async () => {
      const store = createMockBlobStore();
      const svc = createBrandingService(dbMock.db);

      await svc.uploadIcons(store, "org_test", {
        icon192: Buffer.from("192").toString("base64"),
        icon512: Buffer.from("512").toString("base64"),
        iconMaskable: Buffer.from("mask").toString("base64"),
      });

      expect(store.delete).not.toHaveBeenCalled();
    });
  });
});
