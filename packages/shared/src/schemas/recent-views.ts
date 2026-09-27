import type { z } from "zod";
import { selfBlobEnvelopeSchema } from "./self-blob.js";

/**
 * Recently-viewed history envelope. The client seals the whole history
 * (entity type + id + viewed-at, JSON) to the user's own vol_public via
 * ECIES; the server stores the envelope verbatim and can read none of it.
 * Size cap bounds server storage: the payload is a capped entry list, so
 * a legitimate envelope stays far below this limit.
 */
export const RECENT_VIEWS_MAX_PAYLOAD_BYTES = 16_384;

export const putRecentViewsSchema = selfBlobEnvelopeSchema(
  RECENT_VIEWS_MAX_PAYLOAD_BYTES,
);

export type PutRecentViewsInput = z.infer<typeof putRecentViewsSchema>;
