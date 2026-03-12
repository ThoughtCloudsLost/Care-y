// @care-y/shared - barrel export
// Shared types, Zod schemas, and enums consumed by all packages.

/** Placeholder constant to verify cross-package imports work. */
export const PACKAGE_NAME = "@care-y/shared" as const;

// --- Authentication schemas ---
export {
  RESERVED_SLUGS,
  orgSlugSchema,
  createOrgInputSchema,
} from "./schemas/org.js";

// --- Utilities ---
export { extractSubdomain } from "./utils/subdomain.js";

export {
  emailSchema,
  notificationEmailSchema,
  passwordSchema,
  displayNameSchema,
  identifierSchema,
  loginInputSchema,
  registerInputSchema,
  getSaltInputSchema,
  assignRoleInputSchema,
  setPiiRetentionInputSchema,
} from "./schemas/auth.js";

// --- Roles and permissions ---
export {
  RoleId,
  type RoleIdValue,
  ROLE_ID_VALUES,
  ROLE_ID_VALUES_TUPLE,
  Permission,
} from "./roles.js";

// --- Two-factor authentication ---
export {
  TwoFactorMethod,
  AVAILABLE_METHODS,
  STUBBED_METHODS,
  METHOD_INFO,
  type TwoFactorMethodType,
  type WebauthnCategory,
  type TwoFactorMethodInfo,
  type EnrolledMethod,
  type TwoFactorStatus,
} from "./two-factor-types.js";

export {
  totpVerifySchema,
  emailCodeVerifySchema,
  backupCodeVerifySchema,
  webauthnRegistrationResponseSchema,
  webauthnAssertionResponseSchema,
  removeMethodSchema,
  enrolledMethodResponseSchema,
  twoFactorStatusResponseSchema,
  type TotpVerifyInput,
  type EmailCodeVerifyInput,
  type BackupCodeVerifyInput,
  type WebauthnRegistrationResponse,
  type WebauthnAssertionResponse,
  type RemoveMethodInput,
} from "./schemas/two-factor.js";
