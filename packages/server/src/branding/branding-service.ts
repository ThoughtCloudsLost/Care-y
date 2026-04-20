import type { Kysely } from "kysely";
import type { OrgConfigTable, TenantDatabase } from "../db/types.js";
import type { BlobStore } from "../storage/store.js";
import type {
  BrandingData,
  SaveBrandingFieldInput,
  UploadIconsInput,
} from "@care-y/shared";

function noop(): void {
  // intentional no-op for best-effort catch
}

function bufferToBase64(buf: Buffer | null): string | null {
  return buf === null ? null : buf.toString("base64");
}

function brandingColumnUpdate(
  field: SaveBrandingFieldInput["field"],
  value: Buffer,
): Partial<
  Pick<
    OrgConfigTable,
    | "encrypted_name"
    | "encrypted_logo"
    | "encrypted_primary_color"
    | "encrypted_client_text"
  >
> {
  switch (field) {
    case "name":
      return { encrypted_name: value };
    case "logo":
      return { encrypted_logo: value };
    case "primary_color":
      return { encrypted_primary_color: value };
    case "client_text":
      return { encrypted_client_text: value };
  }
}

export interface BrandingService {
  getBranding(): Promise<BrandingData>;
  saveBrandingField(input: SaveBrandingFieldInput): Promise<void>;
  uploadIcons(
    store: BlobStore,
    orgSchema: string,
    input: UploadIconsInput,
  ): Promise<void>;
}

export function createBrandingService(
  tenantDb: Kysely<TenantDatabase>,
): BrandingService {
  return {
    async getBranding(): Promise<BrandingData> {
      const config = await tenantDb
        .selectFrom("org_config")
        .select([
          "encrypted_name",
          "encrypted_logo",
          "encrypted_primary_color",
          "encrypted_client_text",
          "client_encrypted_branding",
        ])
        .executeTakeFirstOrThrow();

      return {
        encryptedName: bufferToBase64(config.encrypted_name),
        encryptedLogo: bufferToBase64(config.encrypted_logo),
        encryptedPrimaryColor: bufferToBase64(config.encrypted_primary_color),
        encryptedClientText: bufferToBase64(config.encrypted_client_text),
        clientEncryptedBranding: bufferToBase64(
          config.client_encrypted_branding,
        ),
      };
    },

    async saveBrandingField(input: SaveBrandingFieldInput): Promise<void> {
      const value = Buffer.from(input.encryptedValue, "base64");

      // SOG-14: both volunteer-side and client-side blobs saved atomically
      await tenantDb.transaction().execute(async (tx) => {
        const columnUpdate = brandingColumnUpdate(input.field, value);
        const updates =
          input.clientEncryptedBranding !== undefined
            ? {
                ...columnUpdate,
                client_encrypted_branding: Buffer.from(
                  input.clientEncryptedBranding,
                  "base64",
                ),
              }
            : columnUpdate;
        await tx.updateTable("org_config").set(updates).execute();
      });
    },

    async uploadIcons(
      store: BlobStore,
      orgSchema: string,
      input: UploadIconsInput,
    ): Promise<void> {
      const existing = await tenantDb
        .selectFrom("org_config")
        .select([
          "icon_192_blob_key",
          "icon_512_blob_key",
          "icon_maskable_blob_key",
        ])
        .executeTakeFirstOrThrow();

      const [key192, key512, keyMaskable] = await Promise.all([
        store.put(orgSchema, "branding", Buffer.from(input.icon192, "base64")),
        store.put(orgSchema, "branding", Buffer.from(input.icon512, "base64")),
        store.put(
          orgSchema,
          "branding",
          Buffer.from(input.iconMaskable, "base64"),
        ),
      ]);

      await tenantDb.transaction().execute(async (tx) => {
        await tx
          .updateTable("org_config")
          .set({
            icon_192_blob_key: key192,
            icon_512_blob_key: key512,
            icon_maskable_blob_key: keyMaskable,
          })
          .execute();
      });

      // Best-effort cleanup of old blobs (orphaned blobs are harmless)
      const oldKeys = [
        existing.icon_192_blob_key,
        existing.icon_512_blob_key,
        existing.icon_maskable_blob_key,
      ];
      for (const oldKey of oldKeys) {
        if (oldKey !== null) void store.delete(oldKey).catch(noop);
      }
    },
  };
}
