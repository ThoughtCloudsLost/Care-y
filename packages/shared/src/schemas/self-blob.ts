import { z } from "zod";
import { base64ByteLength, base64Bytes, base64String } from "./validators.js";

/** Shape of a self-blob envelope schema, as built by selfBlobEnvelopeSchema. */
export type SelfBlobEnvelopeSchema = z.ZodObject<{
  ephemeralPoint: z.ZodType<string>;
  nonce: z.ZodType<string>;
  wrappedPayload: z.ZodType<string>;
}>;

/**
 * Envelope for a document the client seals to the user's own vol_public
 * via ECIES (a self-blob). The server stores the three fields verbatim and
 * can read none of them. Each caller supplies its own payload cap, which
 * bounds server storage per row.
 */
export function selfBlobEnvelopeSchema(
  maxPayloadBytes: number,
): SelfBlobEnvelopeSchema {
  return z.object({
    ephemeralPoint: base64Bytes(32, "ephemeralPoint (ristretto255)"),
    nonce: base64Bytes(24, "nonce"),
    wrappedPayload: base64String("wrappedPayload")
      .refine((s) => base64ByteLength(s) > 0, {
        message: "wrappedPayload must not be empty",
      })
      .refine((s) => base64ByteLength(s) <= maxPayloadBytes, {
        message: `wrappedPayload must be at most ${String(maxPayloadBytes)} bytes`,
      }),
  });
}
