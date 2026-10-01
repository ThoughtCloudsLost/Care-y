import { describe, expect, it } from "vitest";
import { requestOrgDeletionInputSchema } from "./org-deletion.js";

describe("requestOrgDeletionInputSchema", () => {
  it("accepts a confirmation string", () => {
    const result = requestOrgDeletionInputSchema.safeParse({
      confirmSlug: "example-org",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing confirmation", () => {
    expect(requestOrgDeletionInputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects a non-string confirmation", () => {
    expect(
      requestOrgDeletionInputSchema.safeParse({ confirmSlug: 42 }).success,
    ).toBe(false);
  });

  it("drops an org id supplied alongside the confirmation", () => {
    const result = requestOrgDeletionInputSchema.safeParse({
      confirmSlug: "example-org",
      orgId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Object.keys(result.data)).toEqual(["confirmSlug"]);
    }
  });
});
