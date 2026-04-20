import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sanitizeOrgName,
  updateBrandingCache,
  getCachedBranding,
} from "./index";

// Cache API mock for branding cache tests
const mockCache = {
  match: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

const mockCaches = {
  open: vi.fn().mockResolvedValue(mockCache),
  delete: vi.fn(),
};

vi.stubGlobal("caches", mockCaches);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("sanitizeOrgName", () => {
  it("strips HTML tag markers", () => {
    expect(sanitizeOrgName('<script>alert("xss")</script>Org')).toBe(
      'alert("xss")Org',
    );
  });

  it("strips arbitrary HTML tags", () => {
    expect(sanitizeOrgName("<b>Bold</b> <i>Italic</i>")).toBe("Bold Italic");
  });

  it("preserves normal text", () => {
    expect(sanitizeOrgName("My Organization")).toBe("My Organization");
  });

  it("handles empty string", () => {
    expect(sanitizeOrgName("")).toBe("");
  });

  it("trims whitespace", () => {
    expect(sanitizeOrgName("  Org Name  ")).toBe("Org Name");
  });

  it("handles nested tags", () => {
    expect(sanitizeOrgName("<div><span>Nested</span></div>")).toBe("Nested");
  });
});

describe("updateBrandingCache", () => {
  it("writes merged data to cache when no existing entry", async () => {
    mockCache.match.mockResolvedValue(null);

    await updateBrandingCache({ orgName: "Test Org", hasIcons: true });

    expect(mockCache.put).toHaveBeenCalledTimes(1);
    const [, response] = mockCache.put.mock.calls[0] as [string, Response];
    const body = JSON.parse(await response.text()) as Record<string, unknown>;
    expect(body.orgName).toBe("Test Org");
    expect(body.hasIcons).toBe(true);
    expect(body.primaryColor).toBe("#98a448");
    expect(body.orgSlug).toBeNull();
  });

  it("merges patch over existing cached data", async () => {
    const existing = JSON.stringify({
      orgName: "Existing Org",
      primaryColor: "#ff0000",
      accentColor: "#00ff00",
      orgSlug: "test-org",
      hasIcons: false,
      logoBlobUrl: null,
    });
    mockCache.match.mockResolvedValue(
      new Response(existing, {
        headers: { "Content-Type": "application/json" },
      }),
    );

    await updateBrandingCache({ hasIcons: true });

    const [, response] = mockCache.put.mock.calls[0] as [string, Response];
    const body = JSON.parse(await response.text()) as Record<string, unknown>;
    expect(body.orgName).toBe("Existing Org");
    expect(body.primaryColor).toBe("#ff0000");
    expect(body.orgSlug).toBe("test-org");
    expect(body.hasIcons).toBe(true);
  });

  it("serializes writes sequentially", async () => {
    mockCache.match.mockResolvedValue(null);

    const p1 = updateBrandingCache({ orgName: "First" });
    const p2 = updateBrandingCache({ hasIcons: true });

    await p1;
    await p2;

    expect(mockCache.put).toHaveBeenCalledTimes(2);
  });
});

describe("getCachedBranding", () => {
  it("returns null when cache is empty", async () => {
    mockCache.match.mockResolvedValue(null);
    const result = await getCachedBranding();
    expect(result).toBeNull();
  });

  it("normalizes missing orgSlug and hasIcons from old entries", async () => {
    const old = JSON.stringify({ orgName: "Old", primaryColor: "#000000" });
    mockCache.match.mockResolvedValue(
      new Response(old, { headers: { "Content-Type": "application/json" } }),
    );

    const result = await getCachedBranding();
    expect(result).not.toBeNull();
    expect(result!.orgSlug).toBeNull();
    expect(result!.hasIcons).toBe(false);
  });

  it("returns null for malformed data", async () => {
    mockCache.match.mockResolvedValue(
      new Response("not json", { headers: { "Content-Type": "text/plain" } }),
    );
    const result = await getCachedBranding();
    expect(result).toBeNull();
  });
});
