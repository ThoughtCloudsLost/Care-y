import { describe, it, expect, vi, beforeEach } from "vitest";
import { sanitizeOrgName } from "./index";

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
