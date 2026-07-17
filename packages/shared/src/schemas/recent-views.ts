import { z } from "zod";
import { base64ByteLength, base64Bytes, base64String } from "./validators.js";

/**
 * Recently-viewed history envelope. The client seals the whole history
 * (entity type + id + viewed-at, JSON) to the user's own vol_public via
 * ECIES; the server stores the envelope verbatim and can read none of it.
 * Size cap bounds server storage: the payload is a capped entry list, so
 * a legitimate envelope stays far below this limit.
 */
export const RECENT_VIEWS_MAX_PAYLOAD_BYTES = 16_384;

export const putRecentViewsSchema = z.object({
  ephemeralPoint: base64Bytes(32, "ephemeralPoint (ristretto255)"),
  nonce: base64Bytes(24, "nonce"),
  wrappedPayload: base64String("wrappedPayload")
    .refine((s) => base64ByteLength(s) > 0, {
      message: "wrappedPayload must not be empty",
    })
    .refine((s) => base64ByteLength(s) <= RECENT_VIEWS_MAX_PAYLOAD_BYTES, {
      message: `wrappedPayload must be at most ${String(RECENT_VIEWS_MAX_PAYLOAD_BYTES)} bytes`,
    }),
});

export type PutRecentViewsInput = z.infer<typeof putRecentViewsSchema>;
