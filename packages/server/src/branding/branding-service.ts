import type { Kysely } from "kysely";
import sodium from "sodium-native";
import type { OrgConfigTable, TenantDatabase } from "../db/types.js";
import type { BlobStore } from "../storage/store.js";
import type {
  BrandingData,
  SaveBrandingFieldInput,
  UploadIconsInput,
  OrgSchema,
} from "@care-y/shared";
import { validateMagicBytes } from "../telephony/attachment-validator.js";
import { ValidationError } from "../errors.js";
import { deriveBrandingKey, decryptBrandingBlob } from "./branding-crypto.js";

const ICON_MAX_BYTES = 2 * 1024 * 1024; // 2 MB per icon

function noop(): void {
  // intentional no-op for best-effort catch
}

function bufferToBase64(buf: Buffer | null): string | null {
  return buf === null ? null : buf.toString("base64url");
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
    | "encrypted_accent_color"
    | "encrypted_client_text"
    | "encrypted_terminology"
  >
> {
  switch (field) {
    case "name":
      return { encrypted_name: value };
    case "logo":
      return { encrypted_logo: value };
    case "primary_color":
      return { encrypted_primary_color: value };
    case "accent_color":
      return { encrypted_accent_color: value };
    case "client_text":
      return { encrypted_client_text: value };
    case "terminology":
      return { encrypted_terminology: value };
  }
}

export interface PublicBrandingData {
  readonly orgPublicKey: string | null;
  readonly clientEncryptedBranding: string | null;
  readonly hasIcons: boolean;
  readonly iconVersion: string | null;
}

export interface BrandingService {
  getBranding(): Promise<BrandingData>;
  getPublicBranding(): Promise<PublicBrandingData>;
  saveBrandingField(input: SaveBrandingFieldInput): Promise<void>;
  uploadIcons(
    store: BlobStore,
    orgSchema: OrgSchema,
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
          "encrypted_accent_color",
          "encrypted_client_text",
          "client_encrypted_branding",
          "encrypted_terminology",
          "icon_192_blob_key",
        ])
        .executeTakeFirstOrThrow();

      return {
        encryptedName: bufferToBase64(config.encrypted_name),
        encryptedLogo: bufferToBase64(config.encrypted_logo),
        encryptedPrimaryColor: bufferToBase64(config.encrypted_primary_color),
        encryptedAccentColor: bufferToBase64(config.encrypted_accent_color),
        encryptedClientText: bufferToBase64(config.encrypted_client_text),
        clientEncryptedBranding: bufferToBase64(
          config.client_encrypted_branding,
        ),
        encryptedTerminology: bufferToBase64(config.encrypted_terminology),
        hasIcons: config.icon_192_blob_key !== null,
        iconVersion: config.icon_192_blob_key?.slice(0, 8) ?? null,
      };
    },

    async getPublicBranding(): Promise<PublicBrandingData> {
      const config = await tenantDb
        .selectFrom("org_config")
        .select([
          "org_public_key",
          "client_encrypted_branding",
          "icon_192_blob_key",
        ])
        .executeTakeFirst();

      return {
        orgPublicKey: bufferToBase64(config?.org_public_key ?? null),
        clientEncryptedBranding: bufferToBase64(
          config?.client_encrypted_branding ?? null,
        ),
        hasIcons: config?.icon_192_blob_key != null,
        iconVersion: config?.icon_192_blob_key?.slice(0, 8) ?? null,
      };
    },

    async saveBrandingField(input: SaveBrandingFieldInput): Promise<void> {
      const value = Buffer.from(input.encryptedValue, "base64");

      // Both volunteer-side and client-side blobs saved atomically
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
      orgSchema: OrgSchema,
      input: UploadIconsInput,
    ): Promise<void> {
      const buf192 = Buffer.from(input.icon192, "base64");
      const buf512 = Buffer.from(input.icon512, "base64");
      const bufMaskable = Buffer.from(input.iconMaskable, "base64");

      for (const buf of [buf192, buf512, bufMaskable]) {
        if (buf.byteLength > ICON_MAX_BYTES) {
          throw new ValidationError(
            `Icon exceeds ${String(ICON_MAX_BYTES)} byte limit`,
          );
        }
      }

      const config = await tenantDb
        .selectFrom("org_config")
        .select([
          "org_public_key",
          "icon_192_blob_key",
          "icon_512_blob_key",
          "icon_maskable_blob_key",
        ])
        .executeTakeFirstOrThrow();

      if (config.org_public_key === null) {
        throw new ValidationError("Org public key not available");
      }

      const brandingKey = deriveBrandingKey(config.org_public_key);
      try {
        for (const buf of [buf192, buf512, bufMaskable]) {
          const plaintext = decryptBrandingBlob(buf, brandingKey);
          if (plaintext === null) {
            throw new ValidationError("Icon decryption failed");
          }
          validateMagicBytes(plaintext, "image/png");
        }
      } finally {
        sodium.sodium_memzero(brandingKey);
      }

      const existing = config;

      const [key192, key512, keyMaskable] = await Promise.all([
        store.put(orgSchema, "branding", buf192),
        store.put(orgSchema, "branding", buf512),
        store.put(orgSchema, "branding", bufMaskable),
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
