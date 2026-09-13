/**
 * Shared helpers for the channel portal page and the account portal page.
 *
 * Consolidates duplicated logic that appeared in both +page.svelte files:
 *   - isPortalChannelDisabledError (shape-probe for tRPC error)
 *   - splitContactEnvelope (sealed-envelope byte layout constants + split)
 *
 * The two pages keep their own markup and query wiring; only pure logic
 * that was byte-identical across them lives here.
 */

import { decode, encode } from "@care-y/crypto";

// ---------------------------------------------------------------------------
// Channel-disabled error guard
// ---------------------------------------------------------------------------

/**
 * Shape-probe for a PORTAL_CHANNEL_DISABLED tRPC error. Checks both the
 * message field (error formatter path) and the nested data.code field.
 */
export function isPortalChannelDisabledError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  if ("message" in err && err.message === "PORTAL_CHANNEL_DISABLED") {
    return true;
  }
  if (
    "data" in err &&
    typeof err.data === "object" &&
    err.data !== null &&
    "code" in err.data &&
    err.data.code === "PORTAL_CHANNEL_DISABLED"
  ) {
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Sealed contact envelope byte layout
// ---------------------------------------------------------------------------

/**
 * The sealed contact envelope is ephemeralPoint(32) | nonce(24) | ciphertext(N)
 * concatenated as a single base64url string. These constants document the wire
 * layout from the server's sealContactInfo procedure.
 */
const EPHEMERAL_POINT_BYTES = 32;
const NONCE_BYTES = 24;

/** Byte-split triple from a sealed contact envelope. */
export interface ContactEnvelopeParts {
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly ciphertext: string;
}

/**
 * Decode a base64url sealed contact envelope and split it into the three
 * ECIES components. Each part is re-encoded to base64url for the bridge
 * decryptMessage call.
 */
export function splitContactEnvelope(sealedB64: string): ContactEnvelopeParts {
  const raw = decode(sealedB64);
  return {
    ephemeralPoint: encode(raw.subarray(0, EPHEMERAL_POINT_BYTES)),
    nonce: encode(
      raw.subarray(EPHEMERAL_POINT_BYTES, EPHEMERAL_POINT_BYTES + NONCE_BYTES),
    ),
    ciphertext: encode(raw.subarray(EPHEMERAL_POINT_BYTES + NONCE_BYTES)),
  };
}

/**
 * Parse the JSON result of a decrypted contact envelope into typed fields.
 * Returns only string-typed phone/email fields found in the parsed object.
 */
export function parseContactJson(json: string): {
  phone?: string;
  email?: string;
} {
  const parsed: unknown = JSON.parse(json);
  if (typeof parsed !== "object" || parsed === null) {
    return {};
  }
  const result: { phone?: string; email?: string } = {};
  if ("phone" in parsed && typeof parsed.phone === "string") {
    result.phone = parsed.phone;
  }
  if ("email" in parsed && typeof parsed.email === "string") {
    result.email = parsed.email;
  }
  return result;
}
