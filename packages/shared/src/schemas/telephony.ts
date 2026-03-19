// Shared: tRPC input/output shapes for telephony admin endpoints.

import { z } from "zod";

/** Valid telephony provider identifiers. */
export const telephonyProviderSchema = z.enum(["twilio", "signalwire"]);
export type TelephonyProviderType = z.infer<typeof telephonyProviderSchema>;

/** Input for saving BYOT telephony credentials. */
export const saveTelephonyConfigInputSchema = z.object({
  provider: telephonyProviderSchema,
  accountId: z.string().min(1, "Account ID is required"),
  authToken: z.string().min(1, "Auth token is required"),
});

export type SaveTelephonyConfigInput = z.infer<
  typeof saveTelephonyConfigInputSchema
>;

/** Input for updating the org's default country code. */
export const updateCountryCodeInputSchema = z.object({
  countryCode: z
    .string()
    .regex(
      /^\+[1-9]\d{0,2}$/,
      "Country code must be E.164 format (e.g., +1, +44)",
    ),
});

export type UpdateCountryCodeInput = z.infer<
  typeof updateCountryCodeInputSchema
>;

/** Phone number entry in masked config output. */
export const maskedPhoneNumberSchema = z.object({
  number: z.string(),
  label: z.string().optional(),
});

/** Masked telephony config output for admin UI. */
export const maskedTelephonyConfigSchema = z.object({
  provider: z.string(),
  mode: z.string(),
  maskedAccountId: z.string(),
  maskedAuthToken: z.string(),
  phoneNumbers: z.array(maskedPhoneNumberSchema),
});

export type MaskedTelephonyConfigOutput = z.infer<
  typeof maskedTelephonyConfigSchema
>;

/** Input for creating a managed-mode telephony setup. */
export const createManagedTelephonyInputSchema = z.object({
  orgName: z.string().min(1, "Organization name is required"),
});

export type CreateManagedTelephonyInput = z.infer<
  typeof createManagedTelephonyInputSchema
>;
