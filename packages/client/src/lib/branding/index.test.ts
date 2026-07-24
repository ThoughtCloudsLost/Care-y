// @vitest-environment jsdom
// applyBranding writes document.title and clearBrandingCache walks
// localStorage, so these tests need a DOM; caches stays stubbed below
// because jsdom has no CacheStorage.
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sanitizeOrgName,
  updateBrandingCache,
  getCachedBranding,
  loadBranding,
  brandingIconUrl,
  clearBrandingCache,
  DEFAULT_PRIMARY,
  DEFAULT_ACCENT,
} from "./index";
import type { BrandingData } from "./types.js";
import type * as KonstaPalette from "$lib/branding/konsta-palette.js";

// vi.mock required: konsta-palette triggers dynamic import of
// material-color-utilities which uses native ESM paths that fail
// in Node test environment
vi.mock(
  "$lib/branding/konsta-palette.js",
  () =>
    ({
      applyKonstaPalette: vi.fn().mockResolvedValue(undefined),
      resetKonstaPalette: vi.fn(),
      checkBrandProximity: vi.fn().mockReturnValue({ collides: false }),
    }) satisfies typeof KonstaPalette,
);

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

// Stub URL.createObjectURL / revokeObjectURL for logo blob tests
const mockCreateObjectURL = vi.fn((): string => "blob:mock-url");
const mockRevokeObjectURL = vi.fn();
vi.stubGlobal("URL", {
  ...URL,
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockCreateObjectURL.mockReturnValue("blob:mock-url");
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
    expect(body.primaryColor).toBe(DEFAULT_PRIMARY);
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

  it("returns null when data is missing orgName", async () => {
    const noName = JSON.stringify({ primaryColor: "#000000" });
    mockCache.match.mockResolvedValue(
      new Response(noName, {
        headers: { "Content-Type": "application/json" },
      }),
    );
    const result = await getCachedBranding();
    expect(result).toBeNull();
  });

  it("returns null when data is missing primaryColor", async () => {
    const noColor = JSON.stringify({ orgName: "Test" });
    mockCache.match.mockResolvedValue(
      new Response(noColor, {
        headers: { "Content-Type": "application/json" },
      }),
    );
    const result = await getCachedBranding();
    expect(result).toBeNull();
  });

  it("returns null when data is not an object", async () => {
    mockCache.match.mockResolvedValue(
      new Response(JSON.stringify("just a string"), {
        headers: { "Content-Type": "application/json" },
      }),
    );
    const result = await getCachedBranding();
    expect(result).toBeNull();
  });

  it("returns null when data is null", async () => {
    mockCache.match.mockResolvedValue(
      new Response(JSON.stringify(null), {
        headers: { "Content-Type": "application/json" },
      }),
    );
    const result = await getCachedBranding();
    expect(result).toBeNull();
  });
});

describe("loadBranding", () => {
  const orgContext = {
    orgSlug: "test-org",
    hasIcons: true,
    iconVersion: "v2",
  } as const;

  it("uses valid primaryColor and accentColor from fetched data", async () => {
    mockCache.match.mockResolvedValue(null);
    const data: BrandingData = {
      orgName: "Test Org",
      primaryColor: "#ff5500",
      accentColor: "#00cc88",
      logoBlob: null,
      clientText: null,
    };

    const result = await loadBranding(() => Promise.resolve(data), orgContext);

    expect(result.primaryColor).toBe("#ff5500");
    expect(result.accentColor).toBe("#00cc88");
    expect(result.orgName).toBe("Test Org");
    expect(result.orgSlug).toBe("test-org");
    expect(result.hasIcons).toBe(true);
    expect(result.iconVersion).toBe("v2");
    expect(result.logoBlobUrl).toBeNull();
  });

  it("falls back to DEFAULT_PRIMARY when primaryColor is invalid hex", async () => {
    mockCache.match.mockResolvedValue(null);
    const data: BrandingData = {
      orgName: "Bad Color Org",
      primaryColor: "not-a-color",
      accentColor: null,
      logoBlob: null,
      clientText: null,
    };

    const result = await loadBranding(() => Promise.resolve(data), orgContext);

    expect(result.primaryColor).toBe(DEFAULT_PRIMARY);
  });

  it("falls back to DEFAULT_ACCENT when accentColor is null", async () => {
    mockCache.match.mockResolvedValue(null);
    const data: BrandingData = {
      orgName: "Org",
      primaryColor: "#aabbcc",
      accentColor: null,
      logoBlob: null,
      clientText: null,
    };

    const result = await loadBranding(() => Promise.resolve(data), orgContext);

    expect(result.accentColor).toBe(DEFAULT_ACCENT);
  });

  it("falls back to DEFAULT_ACCENT when accentColor is empty string", async () => {
    mockCache.match.mockResolvedValue(null);
    const data: BrandingData = {
      orgName: "Org",
      primaryColor: "#aabbcc",
      accentColor: "",
      logoBlob: null,
      clientText: null,
    };

    const result = await loadBranding(() => Promise.resolve(data), orgContext);

    expect(result.accentColor).toBe(DEFAULT_ACCENT);
  });

  it("falls back to DEFAULT_ACCENT when accentColor is invalid hex", async () => {
    mockCache.match.mockResolvedValue(null);
    const data: BrandingData = {
      orgName: "Org",
      primaryColor: "#aabbcc",
      accentColor: "bad",
      logoBlob: null,
      clientText: null,
    };

    const result = await loadBranding(() => Promise.resolve(data), orgContext);

    expect(result.accentColor).toBe(DEFAULT_ACCENT);
  });

  it("creates a blob URL when logoBlob is provided", async () => {
    mockCache.match.mockResolvedValue(null);
    const logoData = new ArrayBuffer(8);
    const data: BrandingData = {
      orgName: "Logo Org",
      primaryColor: "#112233",
      accentColor: null,
      logoBlob: logoData,
      clientText: null,
    };

    const result = await loadBranding(() => Promise.resolve(data), orgContext);

    expect(result.logoBlobUrl).toBe("blob:mock-url");
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it("revokes previous blob URL when creating a new one", async () => {
    mockCache.match.mockResolvedValue(null);
    const data: BrandingData = {
      orgName: "Logo Org",
      primaryColor: "#112233",
      accentColor: null,
      logoBlob: new ArrayBuffer(4),
      clientText: null,
    };

    mockCreateObjectURL.mockReturnValue("blob:first-url");
    await loadBranding(() => Promise.resolve(data), orgContext);

    mockCreateObjectURL.mockReturnValue("blob:second-url");
    const result = await loadBranding(() => Promise.resolve(data), orgContext);

    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:first-url");
    expect(result.logoBlobUrl).toBe("blob:second-url");
  });
});

describe("brandingIconUrl", () => {
  it("appends version query parameter when version is not null", () => {
    const url = brandingIconUrl("my-org", "192", "abc123");
    expect(url).toBe("/api/branding/my-org/icon-192.png?v=abc123");
  });

  it("omits version query parameter when version is null", () => {
    const url = brandingIconUrl("my-org", "512", null);
    expect(url).toBe("/api/branding/my-org/icon-512.png");
  });

  it("handles maskable size parameter", () => {
    const url = brandingIconUrl("test", "maskable", "v1");
    expect(url).toBe("/api/branding/test/icon-maskable.png?v=v1");
  });
});

describe("clearBrandingCache", () => {
  it("deletes cache and removes all localStorage branding keys", async () => {
    const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");

    await clearBrandingCache();

    expect(mockCaches.delete).toHaveBeenCalledWith("care-y-branding");
    expect(removeItemSpy).toHaveBeenCalledWith("care-y-brand-primary");
    expect(removeItemSpy).toHaveBeenCalledWith("care-y-brand-accent");
    expect(removeItemSpy).toHaveBeenCalledWith("care-y-brand-name");
    expect(removeItemSpy).toHaveBeenCalledWith("care-y-brand-slug");
    expect(removeItemSpy).toHaveBeenCalledWith("care-y-brand-has-icons");
    expect(removeItemSpy).toHaveBeenCalledWith("care-y-brand-icon-v");
    expect(removeItemSpy).toHaveBeenCalledWith("care-y-brand-ts");

    removeItemSpy.mockRestore();
  });
});
