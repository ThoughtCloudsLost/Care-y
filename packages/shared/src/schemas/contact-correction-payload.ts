import { z } from "zod";

/**
 * Structured payload for contact_correction follow-ups.
 *
 * Version 1: carries an optional phone and/or email, with at least one
 * required. The payload is serialized to JSON, encrypted with the
 * ticket key, and stored as the follow-up content. The server never
 * sees the plaintext.
 */
export const contactCorrectionPayloadSchema = z
  .object({
    v: z.literal(1),
    phone: z.string().trim().min(1).max(32).optional(),
    email: z.email().max(254).optional(),
  })
  .refine((data) => data.phone !== undefined || data.email !== undefined, {
    message: "At least one of phone or email is required",
  });

export type ContactCorrectionPayload = z.infer<
  typeof contactCorrectionPayloadSchema
>;

/**
 * Serialize a structured correction payload to the JSON string that
 * gets encrypted as the follow-up content.
 */
export function serializeContactCorrection(
  payload: ContactCorrectionPayload,
): string {
  return JSON.stringify(payload);
}

/**
 * Attempt to parse decrypted follow-up content as a structured
 * correction payload. Returns the payload on success, or null when
 * the content is not valid (legacy prose corrections fall back to
 * rendering as plain text).
 */
export function parseContactCorrection(
  content: string,
): ContactCorrectionPayload | null {
  try {
    const parsed: unknown = JSON.parse(content);
    const result = contactCorrectionPayloadSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
