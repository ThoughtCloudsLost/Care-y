import { z } from "zod";

const brandingFieldSchema = z.enum([
  "name",
  "logo",
  "primary_color",
  "accent_color",
  "client_text",
  "terminology",
]);

export type BrandingField = z.infer<typeof brandingFieldSchema>;

export const saveBrandingFieldInputSchema = z.object({
  field: brandingFieldSchema,
  encryptedValue: z.string().min(1),
  clientEncryptedBranding: z.string().optional(),
});

export type SaveBrandingFieldInput = z.infer<
  typeof saveBrandingFieldInputSchema
>;

export const uploadIconsInputSchema = z.object({
  icon192: z.string().min(1),
  icon512: z.string().min(1),
  iconMaskable: z.string().min(1),
});

export type UploadIconsInput = z.infer<typeof uploadIconsInputSchema>;

/** Wire format for branding data. All values are base64-encoded ciphertext. */
export interface BrandingData {
  readonly encryptedName: string | null;
  readonly encryptedLogo: string | null;
  readonly encryptedPrimaryColor: string | null;
  readonly encryptedAccentColor: string | null;
  readonly encryptedClientText: string | null;
  readonly clientEncryptedBranding: string | null;
  readonly encryptedTerminology: string | null;
  readonly hasIcons: boolean;
  readonly iconVersion: string | null;
}
