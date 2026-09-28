import { describe, expect, it } from "vitest";
import {
  dashboardFiltersDocumentSchema,
  prefBlobEnvelopeSchema,
  prefBlobGetInputSchema,
  prefBlobKindSchema,
  prefBlobPutInputSchema,
  PREF_BLOB_MAX_PAYLOAD_BYTES,
} from "./pref-blobs.js";

// 32 bytes and 24 bytes, base64-encoded.
const EPHEMERAL_POINT = Buffer.alloc(32, 1).toString("base64");
const NONCE = Buffer.alloc(24, 2).toString("base64");
const PAYLOAD = Buffer.alloc(128, 3).toString("base64");

const VALID_ENVELOPE = {
  ephemeralPoint: EPHEMERAL_POINT,
  nonce: NONCE,
  wrappedPayload: PAYLOAD,
};

describe("prefBlobKindSchema", () => {
  it("accepts dashboard_filters", () => {
    expect(prefBlobKindSchema.safeParse("dashboard_filters").success).toBe(
      true,
    );
  });

  it("rejects an unknown kind", () => {
    expect(prefBlobKindSchema.safeParse("recent_views").success).toBe(false);
  });

  it("rejects an empty kind", () => {
    expect(prefBlobKindSchema.safeParse("").success).toBe(false);
  });
});

describe("prefBlobEnvelopeSchema", () => {
  it("accepts a well-formed envelope", () => {
    expect(prefBlobEnvelopeSchema.safeParse(VALID_ENVELOPE).success).toBe(true);
  });

  it("rejects an ephemeralPoint of the wrong length", () => {
    const result = prefBlobEnvelopeSchema.safeParse({
      ...VALID_ENVELOPE,
      ephemeralPoint: Buffer.alloc(16, 1).toString("base64"),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a nonce of the wrong length", () => {
    const result = prefBlobEnvelopeSchema.safeParse({
      ...VALID_ENVELOPE,
      nonce: Buffer.alloc(12, 2).toString("base64"),
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-base64 wrappedPayload", () => {
    const result = prefBlobEnvelopeSchema.safeParse({
      ...VALID_ENVELOPE,
      wrappedPayload: "not base64!!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty wrappedPayload", () => {
    const result = prefBlobEnvelopeSchema.safeParse({
      ...VALID_ENVELOPE,
      wrappedPayload: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a wrappedPayload above the size cap", () => {
    const result = prefBlobEnvelopeSchema.safeParse({
      ...VALID_ENVELOPE,
      wrappedPayload: Buffer.alloc(PREF_BLOB_MAX_PAYLOAD_BYTES + 1, 3).toString(
        "base64",
      ),
    });
    expect(result.success).toBe(false);
  });

  it("accepts a wrappedPayload exactly at the size cap", () => {
    const result = prefBlobEnvelopeSchema.safeParse({
      ...VALID_ENVELOPE,
      wrappedPayload: Buffer.alloc(PREF_BLOB_MAX_PAYLOAD_BYTES, 3).toString(
        "base64",
      ),
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing fields", () => {
    expect(prefBlobEnvelopeSchema.safeParse({}).success).toBe(false);
  });
});

describe("prefBlobGetInputSchema", () => {
  it("accepts a known kind", () => {
    const result = prefBlobGetInputSchema.safeParse({
      kind: "dashboard_filters",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown kind", () => {
    const result = prefBlobGetInputSchema.safeParse({ kind: "other" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing kind", () => {
    expect(prefBlobGetInputSchema.safeParse({}).success).toBe(false);
  });
});

describe("prefBlobPutInputSchema", () => {
  it("accepts a known kind with a well-formed envelope", () => {
    const result = prefBlobPutInputSchema.safeParse({
      kind: "dashboard_filters",
      envelope: VALID_ENVELOPE,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown kind", () => {
    const result = prefBlobPutInputSchema.safeParse({
      kind: "other",
      envelope: VALID_ENVELOPE,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed envelope", () => {
    const result = prefBlobPutInputSchema.safeParse({
      kind: "dashboard_filters",
      envelope: { ...VALID_ENVELOPE, nonce: EPHEMERAL_POINT },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing envelope", () => {
    const result = prefBlobPutInputSchema.safeParse({
      kind: "dashboard_filters",
    });
    expect(result.success).toBe(false);
  });
});

describe("dashboardFiltersDocumentSchema", () => {
  const LANE = {
    statuses: ["new"],
    queueIds: ["q-1"],
    priorities: [],
    dateFrom: null,
    dateTo: null,
  };

  it("fills missing lanes and sections with empty filters", () => {
    const result = dashboardFiltersDocumentSchema.safeParse({
      v: 1,
      type: "dashboard_filters",
      lanes: { "on-hold": LANE },
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      v: 1,
      type: "dashboard_filters",
      lanes: {
        "on-hold": { ...LANE, unreadOnly: false, needsAttentionOnly: false },
      },
      activity: { kinds: [], queueIds: [] },
      kb: { categoryIds: [], createdBy: null },
      merge: { matchKinds: [] },
    });
  });

  it("drops sort fields from a lane", () => {
    const result = dashboardFiltersDocumentSchema.safeParse({
      v: 1,
      type: "dashboard_filters",
      lanes: {
        "my-tickets": {
          ...LANE,
          sortField: "date",
          sortDirection: "asc",
        },
      },
    });
    expect(result.success).toBe(true);
    expect(result.data?.lanes["my-tickets"]).not.toHaveProperty("sortField");
    expect(result.data?.lanes["my-tickets"]).not.toHaveProperty(
      "sortDirection",
    );
  });

  it("rejects a payload of another kind", () => {
    const result = dashboardFiltersDocumentSchema.safeParse({
      v: 1,
      type: "recent_views",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a payload without a type", () => {
    const result = dashboardFiltersDocumentSchema.safeParse({
      v: 1,
      entries: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown version", () => {
    const result = dashboardFiltersDocumentSchema.safeParse({
      v: 2,
      type: "dashboard_filters",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown lane id", () => {
    const result = dashboardFiltersDocumentSchema.safeParse({
      v: 1,
      type: "dashboard_filters",
      lanes: { "all-tickets": LANE },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a section filter naming a malformed queue or category id", () => {
    const badQueue = dashboardFiltersDocumentSchema.safeParse({
      v: 1,
      type: "dashboard_filters",
      activity: { queueIds: ["q-1"] },
    });
    const badCategory = dashboardFiltersDocumentSchema.safeParse({
      v: 1,
      type: "dashboard_filters",
      kb: { categoryIds: ["c-1"] },
    });
    expect(badQueue.success).toBe(false);
    expect(badCategory.success).toBe(false);
  });
});
