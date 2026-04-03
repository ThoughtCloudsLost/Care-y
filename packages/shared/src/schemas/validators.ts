/**
 * Reusable Zod validation helpers for base64-encoded byte fields.
 *
 * Centralized here so all schema files use the same regex and byte-length
 * computation. The base64ByteLength function works without Buffer (isomorphic).
 */

import { z } from "zod";

// Accepts both standard base64 (+/=) and URL-safe base64 (-_, no padding).
// @care-y/crypto's encode() uses URL-safe (URLSAFE_NO_PADDING), so all
// crypto payloads from the client use -_ instead of +/.
const BASE64_REGEX = /^[A-Za-z0-9+/=_-]+$/;

/** Compute decoded byte length from a base64 string without Buffer (isomorphic). */
export function base64ByteLength(s: string): number {
  const stripped = s.replace(/=+$/, "");
  return Math.floor((stripped.length * 3) / 4);
}

/** Base64 string validated by regex only (no length constraint). */
export function base64String(label = "value"): z.ZodType<string> {
  return z.string().regex(BASE64_REGEX, `${label} must be base64-encoded`);
}

/** Base64 string with exact decoded byte length check. */
export function base64Bytes(
  expectedLength: number,
  label: string,
): z.ZodType<string> {
  return z
    .string()
    .regex(BASE64_REGEX, "Must be base64-encoded")
    .refine((s) => base64ByteLength(s) === expectedLength, {
      message: `${label} must be exactly ${String(expectedLength)} bytes`,
    });
}
