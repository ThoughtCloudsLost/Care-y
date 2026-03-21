import { z } from "zod";
import {
  TwoFactorMethod,
  AVAILABLE_METHODS,
  type TwoFactorMethodType,
} from "../two-factor-types.js";

// --- Shared validation ---

/** Generated from TwoFactorMethod to prevent drift when new methods are added. */
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- z.enum() requires non-empty tuple; Object.values always has 5+ entries
const allMethods = Object.values(TwoFactorMethod) as [
  TwoFactorMethodType,
  ...TwoFactorMethodType[],
];
const twoFactorMethodSchema = z.enum(allMethods);

const availableMethodSchema = z
  .string()
  .refine(
    (v): v is (typeof AVAILABLE_METHODS)[number] =>
      (AVAILABLE_METHODS as readonly string[]).includes(v),
    { message: "Method not available for enrollment" },
  );

// --- Shared 6-digit code validation ---

/** Validates a 6-digit numeric code (used by both TOTP and email verification). */
const sixDigitCodeSchema = z
  .string()
  .length(6, "Code must be 6 digits")
  .regex(/^\d{6}$/, "Code must be numeric");

// --- TOTP ---

/** Verify a 6-digit TOTP code. */
export const totpVerifySchema = z.object({ code: sixDigitCodeSchema });

// --- Email codes ---

/** Verify a 6-digit email code. */
export const emailCodeVerifySchema = z.object({ code: sixDigitCodeSchema });

// --- SMS codes ---

/** Enroll SMS 2FA: provide the phone number to receive codes. */
export const smsEnrollSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .max(20, "Phone number too long"),
});

/** Verify a 6-digit SMS code. */
export const smsCodeVerifySchema = z.object({ code: sixDigitCodeSchema });

// --- Backup codes ---

/** Verify a backup code. Alphanumeric, whitespace and hyphens stripped for usability. */
export const backupCodeVerifySchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code too long")
    .transform((s) => s.trim().toLowerCase().replace(/[\s-]/g, ""))
    .refine((s) => s.length > 0, "Code is required"),
});

// --- WebAuthn ---

/**
 * WebAuthn registration response from the browser.
 *
 * Includes Level 3 fields (authenticatorData, publicKey, publicKeyAlgorithm)
 * which modern browsers provide. The vendored server verification code reads
 * these fields in toRegistrationResult() (parsers.ts).
 *
 * authenticatorAttachment is nullable because Firefox historically omits it
 * and browsers may send null (W3C spec allows it).
 */
export const webauthnRegistrationResponseSchema = z.object({
  id: z.string().min(1),
  rawId: z.string().min(1),
  type: z.literal("public-key"),
  authenticatorAttachment: z
    .enum(["platform", "cross-platform"])
    .optional()
    .nullable(),
  response: z.object({
    clientDataJSON: z.string().min(1),
    attestationObject: z.string().min(1),
    authenticatorData: z.string().min(1),
    publicKey: z.string().min(1),
    publicKeyAlgorithm: z.number(),
    transports: z.array(z.string()).optional(),
  }),
});

/**
 * WebAuthn assertion response from the browser.
 * authenticatorAttachment and userHandle are nullable (see registration schema).
 */
export const webauthnAssertionResponseSchema = z.object({
  id: z.string().min(1),
  rawId: z.string().min(1),
  type: z.literal("public-key"),
  authenticatorAttachment: z
    .enum(["platform", "cross-platform"])
    .optional()
    .nullable(),
  response: z.object({
    clientDataJSON: z.string().min(1),
    authenticatorData: z.string().min(1),
    signature: z.string().min(1),
    userHandle: z.string().optional().nullable(),
  }),
});

// --- Method management ---

/** Remove an enrolled 2FA method. */
export const removeMethodSchema = z.object({
  method: availableMethodSchema,
  credentialId: z.string().optional(),
});

// --- Status response shapes (for type inference) ---

export const enrolledMethodResponseSchema = z.object({
  type: twoFactorMethodSchema,
  webauthnAttachment: z.enum(["platform", "cross-platform"]).optional(),
  label: z.string(),
  index: z.number().int().min(1),
});

export const twoFactorStatusResponseSchema = z.object({
  enrolled: z.boolean(),
  methods: z.array(enrolledMethodResponseSchema),
  backupCodesRemaining: z.number().int().min(0),
});

// --- Inferred types ---

export type TotpVerifyInput = z.infer<typeof totpVerifySchema>;
export type EmailCodeVerifyInput = z.infer<typeof emailCodeVerifySchema>;
export type SmsEnrollInput = z.infer<typeof smsEnrollSchema>;
export type SmsCodeVerifyInput = z.infer<typeof smsCodeVerifySchema>;
export type BackupCodeVerifyInput = z.infer<typeof backupCodeVerifySchema>;
export type WebauthnRegistrationResponse = z.infer<
  typeof webauthnRegistrationResponseSchema
>;
export type WebauthnAssertionResponse = z.infer<
  typeof webauthnAssertionResponseSchema
>;
export type RemoveMethodInput = z.infer<typeof removeMethodSchema>;
