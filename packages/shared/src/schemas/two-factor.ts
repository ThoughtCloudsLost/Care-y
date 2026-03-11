import { z } from "zod";
import { TwoFactorMethod, AVAILABLE_METHODS } from "../two-factor-types.js";

// --- Shared validation ---

const twoFactorMethodSchema = z.enum([
  TwoFactorMethod.WEBAUTHN,
  TwoFactorMethod.TOTP,
  TwoFactorMethod.EMAIL,
  TwoFactorMethod.SMS,
  TwoFactorMethod.PUSH,
]);

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
 * Fields match the PublicKeyCredential shape returned by navigator.credentials.create().
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
    transports: z.array(z.string()).optional(),
  }),
});

/**
 * WebAuthn assertion response from the browser.
 * Fields match the PublicKeyCredential shape returned by navigator.credentials.get().
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
export type BackupCodeVerifyInput = z.infer<typeof backupCodeVerifySchema>;
export type WebauthnRegistrationResponse = z.infer<
  typeof webauthnRegistrationResponseSchema
>;
export type WebauthnAssertionResponse = z.infer<
  typeof webauthnAssertionResponseSchema
>;
export type RemoveMethodInput = z.infer<typeof removeMethodSchema>;
