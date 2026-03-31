/** Supported 2FA method types. */
export const TwoFactorMethod = {
  WEBAUTHN: "webauthn",
  TOTP: "totp",
  EMAIL: "email",
  SMS: "sms",
  PUSH: "push",
} as const;

export type TwoFactorMethodType =
  (typeof TwoFactorMethod)[keyof typeof TwoFactorMethod];

// --- WebAuthn credential types ---

/** The two WebAuthn attachment types, used to group credentials in the management view. */
export type WebauthnCategory = "platform" | "cross-platform";

// --- Method info for enrollment/verification UI ---

/**
 * Metadata for a single entry in the enrollment picker and verification screen.
 * WebAuthn is split into two entries (platform and cross-platform) so users
 * pick the specific type directly without an extra step.
 *
 * `webauthnAttachment` is set only on WebAuthn entries. The client uses it
 * to pass `authenticatorAttachment` to the browser's WebAuthn API.
 */
export interface TwoFactorMethodInfo {
  readonly type: TwoFactorMethodType;
  readonly webauthnAttachment?: WebauthnCategory;
  readonly labelKey: string;
  readonly descriptionKey: string;
  readonly securityLevel: "strongest" | "strong" | "moderate" | "weak";
}

const METHOD_WEBAUTHN_PLATFORM: TwoFactorMethodInfo = {
  type: TwoFactorMethod.WEBAUTHN,
  webauthnAttachment: "platform",
  labelKey: "twofa_webauthn_platform_label",
  descriptionKey: "twofa_webauthn_platform_desc",
  securityLevel: "strongest",
};

const METHOD_WEBAUTHN_CROSSPLATFORM: TwoFactorMethodInfo = {
  type: TwoFactorMethod.WEBAUTHN,
  webauthnAttachment: "cross-platform",
  labelKey: "twofa_webauthn_crossplatform_label",
  descriptionKey: "twofa_webauthn_crossplatform_desc",
  securityLevel: "strongest",
};

const METHOD_TOTP: TwoFactorMethodInfo = {
  type: TwoFactorMethod.TOTP,
  labelKey: "twofa_totp_label",
  descriptionKey: "twofa_totp_desc",
  securityLevel: "strong",
};

const METHOD_EMAIL: TwoFactorMethodInfo = {
  type: TwoFactorMethod.EMAIL,
  labelKey: "twofa_email_label",
  descriptionKey: "twofa_email_desc",
  securityLevel: "moderate",
};

const METHOD_SMS: TwoFactorMethodInfo = {
  type: TwoFactorMethod.SMS,
  labelKey: "twofa_sms_label",
  descriptionKey: "twofa_sms_desc",
  securityLevel: "weak",
};

const METHOD_PUSH: TwoFactorMethodInfo = {
  type: TwoFactorMethod.PUSH,
  labelKey: "twofa_push_label",
  descriptionKey: "twofa_push_desc",
  securityLevel: "moderate",
};

export const METHOD_INFO: readonly TwoFactorMethodInfo[] = [
  METHOD_WEBAUTHN_PLATFORM,
  METHOD_WEBAUTHN_CROSSPLATFORM,
  METHOD_TOTP,
  METHOD_EMAIL,
  METHOD_SMS,
  METHOD_PUSH,
];

// --- Enrolled method response types ---

/** Enrolled method summary returned by the status endpoint. */
export interface EnrolledMethod {
  readonly type: TwoFactorMethodType;
  readonly webauthnAttachment?: WebauthnCategory;
  readonly labelKey: string;
  readonly index: number;
}

/** 2FA status response from the server. */
export interface TwoFactorStatus {
  readonly enrolled: boolean;
  readonly methods: readonly EnrolledMethod[];
  readonly backupCodesRemaining: number;
}
