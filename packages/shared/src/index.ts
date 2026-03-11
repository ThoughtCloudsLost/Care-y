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
} from "./schemas/auth.js";
