import { z } from "zod";
import { isValidCountryCode } from "../telephony/country-codes.js";

/**
 * Slugs that conflict with infrastructure subdomains or platform routes.
 * Immutable at runtime. Extend this set when new platform subdomains are added.
 */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "billing",
  "blog",
  "cdn",
  "console",
  "dashboard",
  "dev",
  "docs",
  "ftp",
  "git",
  "graphql",
  "help",
  "imap",
  "mail",
  "manage",
  "ns1",
  "ns2",
  "pop",
  "pop3",
  "portal",
  "smtp",
  "ssh",
  "ssl",
  "staging",
  "status",
  "support",
  "test",
  "webmail",
  "www",
  "care-y",
]);

/**
 * DNS-safe org slug: 3-63 chars, starts with letter, ends with letter/digit,
 * lowercase alphanumeric + hyphens only, no consecutive hyphens.
 * Compliant with RFC 1035 DNS label rules.
 */
export const orgSlugSchema = z
  .string()
  .min(3)
  .max(63)
  .regex(
    /^[a-z][a-z0-9-]{1,61}[a-z0-9]$/,
    "Must start with a letter, end with letter/digit, contain only lowercase letters, digits, or hyphens",
  )
  .refine((s) => !s.includes("--"), "Must not contain consecutive hyphens")
  .refine((s) => !RESERVED_SLUGS.has(s), "This slug is reserved")
  .brand<"OrgSlug">();

export const createOrgInputSchema = z.object({
  slug: orgSlugSchema,
});

/**
 * The org's quick-exit target.
 *
 * `z.url()` alone is not enough here. Zod validates through the `new URL()`
 * constructor, which the library's own documentation calls "quite
 * permissive", and it accepts any scheme that constructor accepts,
 * `javascript:` included. This value becomes the argument to
 * `location.replace()` on the client portal, so an unconstrained scheme is
 * script execution on the surface a person reaches when they need to leave
 * fast. Pin it to an absolute https URL with a real hostname.
 *
 * Source: https://zod.dev (Strings > URLs, and the `protocol` param)
 */
export const safeExitUrlSchema = z
  .url({ protocol: /^https$/, hostname: z.regexes.domain })
  .max(2048);

export const updateOrgGeneralAdminInputSchema = z.object({
  orgName: z.string().min(1).max(120),
  defaultLanguage: z.string().min(2).max(10),
  countryCode: z
    .string()
    .min(1)
    .max(5)
    .refine(isValidCountryCode, "Invalid country code"),
  portalSafeExitUrl: safeExitUrlSchema.nullish(),
});
