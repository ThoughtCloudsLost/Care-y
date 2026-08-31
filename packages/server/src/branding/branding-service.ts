import type { Kysely } from "kysely";
import type { OrgConfigTable, TenantDatabase } from "../db/types.js";
import type { BlobStore } from "../storage/store.js";
import type {
  BrandingData,
  PublicBrandingData,
  SaveBrandingFieldInput,
  UploadIconsInput,
  OrgSchema,
} from "@care-y/shared";
import { safeExitUrlSchema } from "@care-y/shared";
import { validateMagicBytes } from "../telephony/attachment-validator.js";
import { ValidationError } from "../errors.js";

const ICON_MAX_BYTES = 2 * 1024 * 1024; // 2 MB per icon
const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

/** Content types accepted for the logo field. */
const LOGO_ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

function noop(): void {
  // intentional no-op for best-effort catch
}

/**
 * Re-check the stored exit URL on the way out.
 *
 * The write boundary already pins the scheme, and this pins it again,
 * because the value becomes the argument to `location.replace()` on a page
 * whose whole purpose is leaving quickly. A row that predates the tighter
 * write rule, or arrives by any path that skips it, degrades to the
 * client's default rather than to script execution.
 */
export function readSafeExitUrl(stored: string | null): string | null {
  if (stored === null) return null;
  return safeExitUrlSchema.safeParse(stored).success ? stored : null;
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
          "name",
          "logo",
          "primary_color",
          "accent_color",
          "client_text",
          "client_support_label",
          "encrypted_terminology",
          "icon_192_blob_key",
        ])
        .executeTakeFirstOrThrow();

      return {
        name: config.name,
        logo: config.logo !== null ? config.logo.toString("base64url") : null,
        primaryColor: config.primary_color,
        accentColor: config.accent_color,
        clientText: config.client_text,
        clientSupportLabel: config.client_support_label,
        encryptedTerminology:
          config.encrypted_terminology !== null
            ? config.encrypted_terminology.toString("base64url")
            : null,
        hasIcons: config.icon_192_blob_key !== null,
        iconVersion: config.icon_192_blob_key?.slice(0, 8) ?? null,
      };
    },

    async getPublicBranding(): Promise<PublicBrandingData> {
      const config = await tenantDb
        .selectFrom("org_config")
        .select([
          "org_public_key",
          "name",
          "primary_color",
          "accent_color",
          "client_text",
          "client_support_label",
          "icon_192_blob_key",
          "portal_safe_exit_url",
        ])
        .executeTakeFirst();

      return {
        orgPublicKey:
          config?.org_public_key !== null &&
          config?.org_public_key !== undefined
            ? config.org_public_key.toString("base64url")
            : null,
        name: config?.name ?? null,
        primaryColor: config?.primary_color ?? null,
        accentColor: config?.accent_color ?? null,
        clientText: config?.client_text ?? null,
        supportLabel: config?.client_support_label ?? null,
        hasIcons: config?.icon_192_blob_key != null,
        iconVersion: config?.icon_192_blob_key?.slice(0, 8) ?? null,
        safeExitUrl: readSafeExitUrl(config?.portal_safe_exit_url ?? null),
      };
    },

    async saveBrandingField(input: SaveBrandingFieldInput): Promise<void> {
      let update: Partial<
        Pick<
          OrgConfigTable,
          | "name"
          | "logo"
          | "primary_color"
          | "accent_color"
          | "client_text"
          | "client_support_label"
          | "encrypted_terminology"
        >
      >;

      switch (input.field) {
        case "name":
          update = { name: input.value };
          break;
        case "logo": {
          const buf = Buffer.from(input.value, "base64");
          if (buf.byteLength > LOGO_MAX_BYTES) {
            throw new ValidationError(
              `Logo exceeds ${String(LOGO_MAX_BYTES)} byte limit`,
            );
          }
          // Accept png, jpeg, or webp
          let matched = false;
          for (const ct of LOGO_ALLOWED_TYPES) {
            try {
              validateMagicBytes(buf, ct);
              matched = true;
              break;
            } catch {
              // Not this type, try next
            }
          }
          if (!matched) {
            throw new ValidationError(
              "Logo must be PNG, JPEG, or WebP (magic bytes did not match)",
            );
          }
          update = { logo: buf };
          break;
        }
        case "primary_color":
          update = { primary_color: input.value };
          break;
        case "accent_color":
          update = { accent_color: input.value };
          break;
        case "client_text":
          update = { client_text: input.value };
          break;
        case "support_label":
          update = { client_support_label: input.value };
          break;
        case "terminology":
          // Opaque org-key ciphertext (ADR-043, ADR-094). The server
          // stores but never interprets these bytes.
          update = {
            encrypted_terminology: Buffer.from(input.value, "base64"),
          };
          break;
      }

      await tenantDb.updateTable("org_config").set(update).execute();
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
        validateMagicBytes(buf, "image/png");
      }

      const existing = await tenantDb
        .selectFrom("org_config")
        .select([
          "icon_192_blob_key",
          "icon_512_blob_key",
          "icon_maskable_blob_key",
        ])
        .executeTakeFirstOrThrow();

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
