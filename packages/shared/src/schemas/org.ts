import { z } from "zod";

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
  .refine((s) => !RESERVED_SLUGS.has(s), "This slug is reserved");

export const createOrgInputSchema = z.object({
  slug: orgSlugSchema,
});

export const updateOrgBasicsAdminInputSchema = z.object({
  encryptedOrgName: z.string().min(1),
  defaultLanguage: z.string().min(2).max(10),
  countryCode: z.string().min(1).max(5),
});
