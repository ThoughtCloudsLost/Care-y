import { describe, expect, it } from "vitest";
import {
  createKbCategoryInputSchema,
  updateKbCategoryInputSchema,
  createKbItemInputSchema,
  updateKbItemInputSchema,
  kbItemListInputSchema,
  voteDirectionSchema,
  castVoteInputSchema,
  removeVoteInputSchema,
} from "./kb.js";

/** Base64-encode a string of n arbitrary bytes. */
function fakeBase64(n: number): string {
  const bytes = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    bytes[i] = (i + 65) % 256;
  }
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440001";
const VALID_BASE64 = fakeBase64(32);

describe("voteDirectionSchema", () => {
  it("accepts 'up' and 'down'", () => {
    expect(voteDirectionSchema.safeParse("up").success).toBe(true);
    expect(voteDirectionSchema.safeParse("down").success).toBe(true);
  });

  it("rejects invalid directions", () => {
    expect(voteDirectionSchema.safeParse("left").success).toBe(false);
    expect(voteDirectionSchema.safeParse("").success).toBe(false);
    expect(voteDirectionSchema.safeParse(1).success).toBe(false);
  });
});

describe("createKbCategoryInputSchema", () => {
  it("accepts valid input with description", () => {
    const result = createKbCategoryInputSchema.safeParse({
      encryptedName: VALID_BASE64,
      encryptedDescription: VALID_BASE64,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input without description", () => {
    const result = createKbCategoryInputSchema.safeParse({
      encryptedName: VALID_BASE64,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty encryptedName", () => {
    expect(
      createKbCategoryInputSchema.safeParse({ encryptedName: "" }).success,
    ).toBe(false);
  });

  it("rejects name over 100 characters", () => {
    expect(
      createKbCategoryInputSchema.safeParse({ name: "a".repeat(101) }).success,
    ).toBe(false);
  });

  it("rejects non-base64 description", () => {
    expect(
      createKbCategoryInputSchema.safeParse({
        name: "Test",
        encryptedDescription: "not base64!!!",
      }).success,
    ).toBe(false);
  });
});

describe("updateKbCategoryInputSchema", () => {
  it("accepts valid update with both fields", () => {
    const result = updateKbCategoryInputSchema.safeParse({
      categoryId: VALID_UUID,
      name: "Updated",
      encryptedDescription: VALID_BASE64,
    });
    expect(result.success).toBe(true);
  });

  it("accepts update with only categoryId (no-op update)", () => {
    const result = updateKbCategoryInputSchema.safeParse({
      categoryId: VALID_UUID,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing categoryId", () => {
    expect(
      updateKbCategoryInputSchema.safeParse({ name: "Test" }).success,
    ).toBe(false);
  });

  it("rejects non-UUID categoryId", () => {
    expect(
      updateKbCategoryInputSchema.safeParse({ categoryId: "not-a-uuid" })
        .success,
    ).toBe(false);
  });
});

describe("createKbItemInputSchema", () => {
  it("accepts valid input", () => {
    const result = createKbItemInputSchema.safeParse({
      categoryId: VALID_UUID,
      encryptedTitle: VALID_BASE64,
      encryptedBody: VALID_BASE64,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing categoryId", () => {
    expect(
      createKbItemInputSchema.safeParse({
        encryptedTitle: VALID_BASE64,
        encryptedBody: VALID_BASE64,
      }).success,
    ).toBe(false);
  });

  it("rejects missing encryptedTitle", () => {
    expect(
      createKbItemInputSchema.safeParse({
        categoryId: VALID_UUID,
        encryptedBody: VALID_BASE64,
      }).success,
    ).toBe(false);
  });

  it("rejects missing encryptedBody", () => {
    expect(
      createKbItemInputSchema.safeParse({
        categoryId: VALID_UUID,
        encryptedTitle: VALID_BASE64,
      }).success,
    ).toBe(false);
  });

  it("rejects non-base64 encrypted fields", () => {
    expect(
      createKbItemInputSchema.safeParse({
        categoryId: VALID_UUID,
        encryptedTitle: "not base64!!!",
        encryptedBody: VALID_BASE64,
      }).success,
    ).toBe(false);
  });
});

describe("updateKbItemInputSchema", () => {
  it("accepts full update", () => {
    const result = updateKbItemInputSchema.safeParse({
      itemId: VALID_UUID,
      categoryId: VALID_UUID_2,
      encryptedTitle: VALID_BASE64,
      encryptedBody: VALID_BASE64,
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update (title only)", () => {
    const result = updateKbItemInputSchema.safeParse({
      itemId: VALID_UUID,
      encryptedTitle: VALID_BASE64,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing itemId", () => {
    expect(
      updateKbItemInputSchema.safeParse({
        encryptedTitle: VALID_BASE64,
      }).success,
    ).toBe(false);
  });
});

describe("kbItemListInputSchema", () => {
  it("accepts minimal input (defaults apply)", () => {
    const result = kbItemListInputSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
      expect(result.data.categoryId).toBeUndefined();
      expect(result.data.cursor).toBeUndefined();
    }
  });

  it("accepts full input with category filter and cursor", () => {
    const result = kbItemListInputSchema.safeParse({
      categoryId: VALID_UUID,
      limit: 25,
      cursor: "2026-03-24T00:00:00.000Z|550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(kbItemListInputSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(kbItemListInputSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects non-integer limit", () => {
    expect(kbItemListInputSchema.safeParse({ limit: 2.5 }).success).toBe(false);
  });
});

describe("castVoteInputSchema", () => {
  it("accepts valid upvote", () => {
    const result = castVoteInputSchema.safeParse({
      itemId: VALID_UUID,
      direction: "up",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid downvote", () => {
    const result = castVoteInputSchema.safeParse({
      itemId: VALID_UUID,
      direction: "down",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid direction", () => {
    expect(
      castVoteInputSchema.safeParse({
        itemId: VALID_UUID,
        direction: "sideways",
      }).success,
    ).toBe(false);
  });

  it("rejects missing itemId", () => {
    expect(castVoteInputSchema.safeParse({ direction: "up" }).success).toBe(
      false,
    );
  });
});

describe("removeVoteInputSchema", () => {
  it("accepts valid input", () => {
    const result = removeVoteInputSchema.safeParse({ itemId: VALID_UUID });
    expect(result.success).toBe(true);
  });

  it("rejects missing itemId", () => {
    expect(removeVoteInputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-UUID itemId", () => {
    expect(
      removeVoteInputSchema.safeParse({ itemId: "not-a-uuid" }).success,
    ).toBe(false);
  });
});
