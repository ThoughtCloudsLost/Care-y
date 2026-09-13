import { z } from "zod";
import { base64String } from "./validators.js";

/**
 * Org branding is stored and served in plaintext (ADR-094). The save input
 * is a per-field discriminated union so the server validates each value at
 * the trust boundary. Colors must be six-digit hex, text fields carry
 * length caps, and byte fields must be base64. Terminology is the one field
 * that still carries opaque org-key ciphertext and is exempt from content
 * validation by design.
 *
 * Validation here is defense in depth, not the XSS control. Admin-authored
 * text is made safe by per-context escaping at the injection point and
 * sanitization at render, never by what this schema accepts.
 */

/** Six-digit hex color, e.g. #4A90D9. Matches the client's isValidHexColor. */
export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Must be a 6-digit hex color");

export const BRANDING_NAME_MAX = 120;
export const BRANDING_CLIENT_TEXT_MAX = 2000;
export const BRANDING_SUPPORT_LABEL_MAX = 120;

export const saveBrandingFieldInputSchema = z.discriminatedUnion("field", [
  z.object({
    field: z.literal("name"),
    value: z.string().min(1).max(BRANDING_NAME_MAX),
  }),
  z.object({
    // Raw image bytes, base64. Magic bytes and size cap are checked in the
    // service against the decoded bytes, which is what actually gets stored.
    field: z.literal("logo"),
    // base64String's regex requires at least one character, so empty rejects.
    value: base64String("logo"),
  }),
  z.object({ field: z.literal("primary_color"), value: hexColorSchema }),
  z.object({ field: z.literal("accent_color"), value: hexColorSchema }),
  z.object({
    field: z.literal("client_text"),
    value: z.string().min(1).max(BRANDING_CLIENT_TEXT_MAX),
  }),
  z.object({
    /** Name clients see above messages from the org. Org-level, never a person. */
    field: z.literal("support_label"),
    value: z.string().min(1).max(BRANDING_SUPPORT_LABEL_MAX),
  }),
  z.object({
    // Org-key ciphertext, opaque to the server (ADR-043; unchanged by ADR-094).
    field: z.literal("terminology"),
    value: base64String("terminology"),
  }),
]);

export type SaveBrandingFieldInput = z.infer<
  typeof saveBrandingFieldInputSchema
>;

export type BrandingField = SaveBrandingFieldInput["field"];

export const uploadIconsInputSchema = z.object({
  icon192: z.string().min(1),
  icon512: z.string().min(1),
  iconMaskable: z.string().min(1),
});

export type UploadIconsInput = z.infer<typeof uploadIconsInputSchema>;

/** Admin branding read. Plaintext except terminology (org-key ciphertext). */
export interface BrandingData {
  readonly name: string | null;
  /** Raw uploaded logo bytes, base64url. */
  readonly logo: string | null;
  readonly primaryColor: string | null;
  readonly accentColor: string | null;
  readonly clientText: string | null;
  /** Name clients see above messages from the org. Org-level, never a person. */
  readonly clientSupportLabel: string | null;
  readonly encryptedTerminology: string | null;
  readonly hasIcons: boolean;
  readonly iconVersion: string | null;
}

/**
 * Unauthenticated branding read for public pages and first-paint injection.
 * orgPublicKey stays on the payload: intake form crypto derives its asset
 * key from it (ADR-026), independent of branding.
 */
export interface PublicBrandingData {
  readonly orgPublicKey: string | null;
  readonly name: string | null;
  readonly primaryColor: string | null;
  readonly accentColor: string | null;
  readonly clientText: string | null;
  readonly supportLabel: string | null;
  readonly hasIcons: boolean;
  readonly iconVersion: string | null;
  readonly safeExitUrl: string | null;
}
