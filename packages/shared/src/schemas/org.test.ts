import { describe, expect, it } from "vitest";
import {
  RESERVED_SLUGS,
  orgSlugSchema,
  createOrgInputSchema,
  safeExitUrlSchema,
  updateOrgGeneralAdminInputSchema,
} from "./org.js";

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

describe("safeExitUrlSchema", () => {
  it("accepts an absolute https URL", () => {
    expect(safeExitUrlSchema.safeParse("https://weather.gov").success).toBe(
      true,
    );
    expect(
      safeExitUrlSchema.safeParse("https://www.bbc.co.uk/weather").success,
    ).toBe(true);
  });

  // The value becomes the argument to location.replace() on the client
  // portal. z.url() alone would accept every one of these, because it
  // validates through new URL(), which parses any scheme.
  const dangerous = [
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
  ];

  for (const url of dangerous) {
    it(`rejects ${url.split(":")[0]!} scheme`, () => {
      expect(safeExitUrlSchema.safeParse(url).success).toBe(false);
    });
  }

  it("rejects plain http, which downgrades the exit hop", () => {
    expect(safeExitUrlSchema.safeParse("http://weather.gov").success).toBe(
      false,
    );
  });

  it("rejects a relative path, which would keep the client on this origin", () => {
    expect(safeExitUrlSchema.safeParse("/weather").success).toBe(false);
  });

  it("rejects a URL longer than the column allows", () => {
    const long = `https://example.com/${"a".repeat(2048)}`;
    expect(safeExitUrlSchema.safeParse(long).success).toBe(false);
  });
});

describe("updateOrgGeneralAdminInputSchema", () => {
  // countryCode is an E.164 dialing code, not an ISO country code.
  const base = {
    orgName: "Harbor Support",
    defaultLanguage: "en",
    countryCode: "+1",
  };

  it("accepts an https exit URL", () => {
    const result = updateOrgGeneralAdminInputSchema.safeParse({
      ...base,
      portalSafeExitUrl: "https://weather.gov",
    });
    expect(result.success).toBe(true);
  });

  it("accepts no exit URL, leaving the client default in place", () => {
    const result = updateOrgGeneralAdminInputSchema.safeParse({
      ...base,
      portalSafeExitUrl: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a script-scheme exit URL at the write boundary", () => {
    const result = updateOrgGeneralAdminInputSchema.safeParse({
      ...base,
      portalSafeExitUrl: "javascript:alert(1)",
    });
    expect(result.success).toBe(false);
  });
});
