import { describe, expect, it } from "vitest";
import {
  putRecentViewsSchema,
  RECENT_VIEWS_MAX_PAYLOAD_BYTES,
} from "./recent-views.js";

// 32 bytes and 24 bytes, base64-encoded.
const EPHEMERAL_POINT = Buffer.alloc(32, 1).toString("base64");
const NONCE = Buffer.alloc(24, 2).toString("base64");

describe("putRecentViewsSchema", () => {
  it("accepts a well-formed envelope", () => {
    const result = putRecentViewsSchema.safeParse({
      ephemeralPoint: EPHEMERAL_POINT,
      nonce: NONCE,
      wrappedPayload: Buffer.alloc(128, 3).toString("base64"),
    });
    expect(result.success).toBe(true);
  });

  it("rejects an ephemeralPoint of the wrong length", () => {
    const result = putRecentViewsSchema.safeParse({
      ephemeralPoint: Buffer.alloc(16, 1).toString("base64"),
      nonce: NONCE,
      wrappedPayload: Buffer.alloc(128, 3).toString("base64"),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a nonce of the wrong length", () => {
    const result = putRecentViewsSchema.safeParse({
      ephemeralPoint: EPHEMERAL_POINT,
      nonce: Buffer.alloc(12, 2).toString("base64"),
      wrappedPayload: Buffer.alloc(128, 3).toString("base64"),
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-base64 wrappedPayload", () => {
    const result = putRecentViewsSchema.safeParse({
      ephemeralPoint: EPHEMERAL_POINT,
      nonce: NONCE,
      wrappedPayload: "not base64!!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty wrappedPayload", () => {
    const result = putRecentViewsSchema.safeParse({
      ephemeralPoint: EPHEMERAL_POINT,
      nonce: NONCE,
      wrappedPayload: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a wrappedPayload above the size cap", () => {
    const result = putRecentViewsSchema.safeParse({
      ephemeralPoint: EPHEMERAL_POINT,
      nonce: NONCE,
      wrappedPayload: Buffer.alloc(
        RECENT_VIEWS_MAX_PAYLOAD_BYTES + 1,
        3,
      ).toString("base64"),
    });
    expect(result.success).toBe(false);
  });

  it("accepts a wrappedPayload exactly at the size cap", () => {
    const result = putRecentViewsSchema.safeParse({
      ephemeralPoint: EPHEMERAL_POINT,
      nonce: NONCE,
      wrappedPayload: Buffer.alloc(RECENT_VIEWS_MAX_PAYLOAD_BYTES, 3).toString(
        "base64",
      ),
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing fields", () => {
    const result = putRecentViewsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
