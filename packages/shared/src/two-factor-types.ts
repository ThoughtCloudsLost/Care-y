/** Supported 2FA method types. SMS and push are defined but stubbed until their infrastructure lands. */
export const TwoFactorMethod = {
  WEBAUTHN: "webauthn",
  TOTP: "totp",
  EMAIL: "email",
  SMS: "sms",
  PUSH: "push",
} as const;

export type TwoFactorMethodType =
  (typeof TwoFactorMethod)[keyof typeof TwoFactorMethod];

/** Methods fully implemented and available for enrollment. */
export const AVAILABLE_METHODS: readonly TwoFactorMethodType[] = [
  TwoFactorMethod.WEBAUTHN,
  TwoFactorMethod.TOTP,
  TwoFactorMethod.EMAIL,
] as const;

/** Methods defined but not yet available (infrastructure dependencies pending). */
export const STUBBED_METHODS: readonly TwoFactorMethodType[] = [
  TwoFactorMethod.SMS,
  TwoFactorMethod.PUSH,
] as const;

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
  readonly label: string;
  readonly description: string;
  readonly securityLevel: "strongest" | "strong" | "moderate" | "weak";
  readonly available: boolean;
}

const METHOD_WEBAUTHN_PLATFORM: TwoFactorMethodInfo = {
  type: TwoFactorMethod.WEBAUTHN,
  webauthnAttachment: "platform",
  label: "Screen lock verification",
  description:
    "This uses your screen lock method. The same biometrics " +
    "(fingerprint, face scan) or PIN you already use to unlock your " +
    "phone or computer to verify it's really you. It works because " +
    "even if someone learns your password, they can't unlock your " +
    "screen from far away. They would need to be holding your phone " +
    "or sitting at your computer.",
  securityLevel: "strongest",
  available: true,
};

const METHOD_WEBAUTHN_CROSSPLATFORM: TwoFactorMethodInfo = {
  type: TwoFactorMethod.WEBAUTHN,
  webauthnAttachment: "cross-platform",
  label: "Physical plug-in or tap verification",
  description:
    "This uses a small physical gadget (often a USB stick, a key fob, " +
    "or a tap card) to verify it's really you. When you log in, you " +
    "plug it into your computer or hold it against your phone. It " +
    "works because even if someone learns your password, they don't " +
    "have this physical thing. It stays with you, like a house key " +
    "on your keyring.",
  securityLevel: "strongest",
  available: true,
};

const METHOD_TOTP: TwoFactorMethodInfo = {
  type: TwoFactorMethod.TOTP,
  label: "Authenticator app",
  description:
    "A separate app on your phone generates a new 6-digit code every " +
    "30 seconds. Common apps include Google Authenticator and Authy. " +
    "Works even without an internet connection.",
  securityLevel: "strong",
  available: true,
};

const METHOD_EMAIL: TwoFactorMethodInfo = {
  type: TwoFactorMethod.EMAIL,
  label: "Email code",
  description:
    "We send a 6-digit code to your email each time you log in. " +
    "Convenient, but only as secure as your email account. Anyone " +
    "who can read your email can receive these codes.",
  securityLevel: "moderate",
  available: true,
};

const METHOD_SMS: TwoFactorMethodInfo = {
  type: TwoFactorMethod.SMS,
  label: "Text message code",
  description:
    "We send a 6-digit code to your phone number via text message. " +
    "This is the weakest option because phone numbers can be stolen " +
    "through a technique called SIM-swapping. Use only if no other " +
    "option is available for you.",
  securityLevel: "weak",
  available: false,
};

const METHOD_PUSH: TwoFactorMethodInfo = {
  type: TwoFactorMethod.PUSH,
  label: "Push notification",
  description:
    "A notification pops up on your phone asking you to approve the " +
    'login. You just tap "Yes, that\'s me" to get in. It works ' +
    "because someone would need access to your phone to tap that " +
    "button. Requires the app to be installed and an internet " +
    "connection on your phone.",
  securityLevel: "moderate",
  available: false,
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
  readonly label: string;
  readonly index: number;
}

/** 2FA status response from the server. */
export interface TwoFactorStatus {
  readonly enrolled: boolean;
  readonly methods: readonly EnrolledMethod[];
  readonly backupCodesRemaining: number;
}
