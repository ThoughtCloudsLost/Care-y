// Shared: tRPC input/output shapes for telephony admin endpoints.

import { z } from "zod";
import { phoneBlocklistIdSchema, phoneSidSchema } from "../ids.js";

/**
 * Providers an admin can select when saving credentials. SignalWire is
 * deliberately absent: its config schema exists but no provider module is
 * implemented, so offering it would persist credentials whose webhooks can
 * never be verified. Reinstate the entry when the provider module lands.
 */
export const telephonyProviderSchema = z.enum(["twilio"]);
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

/** Input for adding a phone number to the blocklist. E.164 format required. */
export const addToBlocklistInputSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, "Must be E.164 format"),
});

export type AddToBlocklistInput = z.infer<typeof addToBlocklistInputSchema>;

/** Input for removing a phone number from the blocklist. */
export const removeFromBlocklistInputSchema = z.object({
  id: phoneBlocklistIdSchema,
});

export type RemoveFromBlocklistInput = z.infer<
  typeof removeFromBlocklistInputSchema
>;

/** Input for assigning phone number purposes (outbound, system). */
export const setPhonePurposeInputSchema = z.object({
  outboundSid: phoneSidSchema.nullable(),
  systemSid: phoneSidSchema.nullable(),
});

export type SetPhonePurposeInput = z.infer<typeof setPhonePurposeInputSchema>;

/** Input for changing telephony mode post-setup. Discriminated union on mode. */
export const changeTelephonyModeInputSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("byot"),
    provider: telephonyProviderSchema,
    accountId: z.string().min(1, "Account ID is required"),
    authToken: z.string().min(1, "Auth token is required"),
  }),
  z.object({ mode: z.literal("managed") }),
]);

export type ChangeTelephonyModeInput = z.infer<
  typeof changeTelephonyModeInputSchema
>;
