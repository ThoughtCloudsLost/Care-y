import { z } from "zod";
import { kbCategoryIdSchema, queueIdSchema, userIdSchema } from "../ids.js";
import { FILTER_ID_LIST_MAX } from "./limits.js";
import { selfBlobEnvelopeSchema } from "./self-blob.js";
import {
  dashboardActivityKindSchema,
  savedFilterStateSchema,
} from "./tickets.js";

// The kind enum lives beside the recentActivity input it also validates.
export {
  dashboardActivityKindSchema,
  type DashboardActivityKind,
} from "./tickets.js";

/**
 * Per-user preference documents. Each kind is one JSON document the client
 * seals to the user's own vol_public via ECIES; the server stores the
 * envelope verbatim under (user, kind) and can read none of it. The kind
 * set is closed so a client cannot create arbitrary rows.
 */
export const prefBlobKindSchema = z.enum(["dashboard_filters"]);

export type PrefBlobKind = z.infer<typeof prefBlobKindSchema>;

/**
 * Size cap bounds server storage per row. A legitimate preference document
 * stays far below this limit.
 */
export const PREF_BLOB_MAX_PAYLOAD_BYTES = 16_384;

export const prefBlobEnvelopeSchema = selfBlobEnvelopeSchema(
  PREF_BLOB_MAX_PAYLOAD_BYTES,
);

export type PrefBlobEnvelopeInput = z.infer<typeof prefBlobEnvelopeSchema>;

export const prefBlobGetInputSchema = z.object({
  kind: prefBlobKindSchema,
});

export type PrefBlobGetInput = z.infer<typeof prefBlobGetInputSchema>;

export const prefBlobPutInputSchema = z.object({
  kind: prefBlobKindSchema,
  envelope: prefBlobEnvelopeSchema,
});

export type PrefBlobPutInput = z.infer<typeof prefBlobPutInputSchema>;

// --- dashboard_filters document (sealed payload, never seen by the server) ---

/** Dashboard ticket lanes, each with its own user filter. */
export const dashboardLaneIdSchema = z.enum([
  "needs-attention",
  "my-tickets",
  "unassigned",
  "on-hold",
]);

export type DashboardLaneId = z.infer<typeof dashboardLaneIdSchema>;

/**
 * A lane's user filter: the tickets page filter state without sort, since
 * every lane has a fixed sort. The lane's own rule is never stored here.
 */
export const laneFilterStateSchema = savedFilterStateSchema.omit({
  sortField: true,
  sortDirection: true,
});

export type LaneFilterState = z.infer<typeof laneFilterStateSchema>;

export const dashboardActivityFilterSchema = z.object({
  kinds: z.array(dashboardActivityKindSchema).default([]),
  queueIds: z.array(queueIdSchema).max(FILTER_ID_LIST_MAX).default([]),
});

export type DashboardActivityFilter = z.infer<
  typeof dashboardActivityFilterSchema
>;

export const dashboardKbFilterSchema = z.object({
  categoryIds: z.array(kbCategoryIdSchema).max(FILTER_ID_LIST_MAX).default([]),
  createdBy: userIdSchema.nullable().default(null),
});

export type DashboardKbFilter = z.infer<typeof dashboardKbFilterSchema>;

/** How a merge candidate pair was matched. */
export const mergeMatchKindSchema = z.enum(["phone", "email"]);

export type MergeMatchKind = z.infer<typeof mergeMatchKindSchema>;

export const dashboardMergeFilterSchema = z.object({
  matchKinds: z.array(mergeMatchKindSchema).default([]),
});

export type DashboardMergeFilter = z.infer<typeof dashboardMergeFilterSchema>;

/**
 * The dashboard_filters payload the client seals. `type` repeats the row's
 * kind inside the ciphertext: the server cannot see it, so a row served
 * under the wrong kind fails this schema and the client loads the default.
 * Lanes missing from the record, and missing sections, mean no filter;
 * prefault runs each section schema on `{}` so its field defaults apply.
 */
export const dashboardFiltersDocumentSchema = z.object({
  v: z.literal(1),
  type: z.literal(prefBlobKindSchema.enum.dashboard_filters),
  lanes: z
    .partialRecord(dashboardLaneIdSchema, laneFilterStateSchema)
    .prefault({}),
  activity: dashboardActivityFilterSchema.prefault({}),
  kb: dashboardKbFilterSchema.prefault({}),
  merge: dashboardMergeFilterSchema.prefault({}),
});

export type DashboardFiltersDocument = z.infer<
  typeof dashboardFiltersDocumentSchema
>;
