import { describe, expect, it } from "vitest";
import { RESERVED_SLUGS, orgSlugSchema, createOrgInputSchema } from "./org.js";

describe("orgSlugSchema", () => {
  const valid = [
    "safe-harbor",
    "abc",
    "a01",
    "my-org-123",
    "a".repeat(3),
    "a" + "b".repeat(61) + "c",
  ];

  for (const slug of valid) {
    it(`accepts "${slug}"`, () => {
      expect(orgSlugSchema.safeParse(slug).success).toBe(true);
    });
  }

  const invalid: { input: string; reason: string }[] = [
    { input: "ab", reason: "too short (2 chars)" },
    { input: "A-bc", reason: "uppercase letter" },
    { input: "-abc", reason: "starts with hyphen" },
    { input: "abc-", reason: "ends with hyphen" },
    { input: "a--b", reason: "consecutive hyphens" },
    { input: "1abc", reason: "starts with digit" },
    { input: "a".repeat(64), reason: "too long (64 chars)" },
    { input: "ab_c", reason: "underscore not allowed" },
    { input: "ab.c", reason: "dot not allowed" },
    { input: "ab c", reason: "space not allowed" },
    { input: "", reason: "empty string" },
    { input: "café", reason: "non-ASCII (accented)" },
    { input: "org-\u{1F600}", reason: "emoji character" },
    { input: "org\ttab", reason: "tab character" },
  ];

  for (const { input, reason } of invalid) {
    it(`rejects "${input}" (${reason})`, () => {
      expect(orgSlugSchema.safeParse(input).success).toBe(false);
    });
  }

  it("accepts exactly 63 characters (max boundary)", () => {
    const slug = "a" + "b".repeat(61) + "c"; // 63 chars
    expect(orgSlugSchema.safeParse(slug).success).toBe(true);
  });

  it("accepts all-digit body with letter bookends", () => {
    expect(orgSlugSchema.safeParse("a123456b").success).toBe(true);
  });

  it("rejects non-string input", () => {
    expect(orgSlugSchema.safeParse(123).success).toBe(false);
    expect(orgSlugSchema.safeParse(null).success).toBe(false);
    expect(orgSlugSchema.safeParse(undefined).success).toBe(false);
    expect(orgSlugSchema.safeParse({}).success).toBe(false);
  });

  it("rejects all reserved slugs", () => {
    for (const slug of RESERVED_SLUGS) {
      const result = orgSlugSchema.safeParse(slug);
      expect(result.success, `"${slug}" should be reserved`).toBe(false);
    }
  });
});

describe("RESERVED_SLUGS", () => {
  it("is frozen (ReadonlySet)", () => {
    expect(RESERVED_SLUGS).toBeInstanceOf(Set);
    expect(RESERVED_SLUGS.has("admin")).toBe(true);
    expect(RESERVED_SLUGS.has("care-y")).toBe(true);
    expect(RESERVED_SLUGS.has("not-reserved")).toBe(false);
  });
});

describe("createOrgInputSchema", () => {
  it("validates a complete org creation input", () => {
    const result = createOrgInputSchema.safeParse({ slug: "safe-harbor" });
    expect(result.success).toBe(true);
  });

  it("rejects missing slug", () => {
    const result = createOrgInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects invalid slug within object", () => {
    const result = createOrgInputSchema.safeParse({ slug: "admin" });
    expect(result.success).toBe(false);
  });
});
