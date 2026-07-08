// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { applyKonstaPalette, resetKonstaPalette } from "./konsta-palette";

// Mock the Material Color Utilities dynamic import.
// We verify Material tokens are set; we don't test the library's color math.
vi.mock("@material/material-color-utilities", () => {
  // Minimal mock: SchemeTonalSpot returns a few colors so the iteration works.
  const fakeColor = (name: string) => ({
    name,
    getArgb: () => 0xff336699,
  });
  const fakeAllColors = [
    fakeColor("primary"),
    fakeColor("on_primary"),
    fakeColor("surface_container"),
  ];

  class MockSchemeTonalSpot {
    colors = { allColors: fakeAllColors };
  }

  return {
    argbFromHex: () => 0xff000000,
    Hct: { fromInt: () => ({}) },
    SchemeTonalSpot: MockSchemeTonalSpot,
    hexFromArgb: () => "#336699",
  };
});

/**
 * Parse a hex color to [r, g, b].
 */
function parseHex(hex: string): [number, number, number] {
  const m = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m?.[1] || !m[2] || !m[3]) throw new TypeError(`Invalid hex: ${hex}`);
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

/**
 * WCAG 2.1 relative luminance.
 * Source: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function luminance(r: number, g: number, b: number): number {
  function lin(c: number): number {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * WCAG contrast ratio between two hex colors.
 */
function contrast(hex1: string, hex2: string): number {
  const l1 = luminance(...parseHex(hex1));
  const l2 = luminance(...parseHex(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getProp(name: string): string {
  return document.documentElement.style.getPropertyValue(name);
}

describe("applyKonstaPalette", () => {
  beforeEach(() => {
    // Clean slate
    document.documentElement.setAttribute("style", "");
    document.documentElement.classList.remove("dark", "light");
  });

  afterEach(() => {
    document.documentElement.setAttribute("style", "");
    document.documentElement.classList.remove("dark", "light");
  });

  describe("primary token derivation", () => {
    it("sets --brand-text with WCAG AA 4.5:1 contrast against dark surfaces", async () => {
      document.documentElement.classList.add("dark");
      // Light pastel that would fail contrast on dark backgrounds without adjustment
      await applyKonstaPalette("#F5F1E6");
      const brandText = getProp("--brand-text");
      expect(brandText).toBeTruthy();
      // Verify contrast against worst-case dark surface (#2c2a2c)
      const ratio = contrast(brandText, "#2c2a2c");
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("sets --brand-text with WCAG AA 4.5:1 contrast against light surfaces", async () => {
      document.documentElement.classList.add("light");
      // Dark color that might need lightening... actually dark colors
      // pass easily on light surfaces. Use a mid-tone that might not.
      await applyKonstaPalette("#999999");
      const brandText = getProp("--brand-text");
      expect(brandText).toBeTruthy();
      // Verify contrast against worst-case light surface (#e5e1da)
      const ratio = contrast(brandText, "#e5e1da");
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("sets --brand-fill so white text passes WCAG AA 4.5:1", async () => {
      // Yellow is a classic fail case for white-on-fill contrast
      await applyKonstaPalette("#FFD700");
      const brandFill = getProp("--brand-fill");
      expect(brandFill).toBeTruthy();
      const ratio = contrast(brandFill, "#ffffff");
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("preserves the original color when it already meets contrast", async () => {
      // Deep blue already passes white-on-fill
      await applyKonstaPalette("#1a237e");
      const brandFill = getProp("--brand-fill");
      expect(brandFill).toBe("#1a237e");
    });

    it("sets shorthand aliases (--brand-text = --brand-primary-text)", async () => {
      await applyKonstaPalette("#f05030");
      expect(getProp("--brand-text")).toBe(getProp("--brand-primary-text"));
      expect(getProp("--brand-fill")).toBe(getProp("--brand-primary-fill"));
    });

    it("sets --brand-on to white for a dark fill", async () => {
      await applyKonstaPalette("#1a237e");
      expect(getProp("--brand-on")).toBe("#ffffff");
    });

    it("derives --brand-on from the adjusted fill, not the raw brand hex", async () => {
      // Gold gets darkened until white passes on it, so the on-color must
      // be computed against the darkened fill (white), not raw #FFD700
      // (which would pick black).
      await applyKonstaPalette("#FFD700");
      const fill = getProp("--brand-fill");
      const on = getProp("--brand-on");
      expect(on).toMatch(/^#(ffffff|000000)$/);
      expect(contrast(on, fill)).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe("accent tokens", () => {
    it("sets accent tokens when accent color is provided", async () => {
      await applyKonstaPalette({ primary: "#f05030", accent: "#2563eb" });
      expect(getProp("--brand-accent")).toBe("#2563eb");
      expect(getProp("--brand-accent-on")).toMatch(/^#(ffffff|000000)$/);
      expect(getProp("--brand-accent-text")).toBeTruthy();
      expect(getProp("--brand-accent-fill")).toBeTruthy();
      expect(getProp("--brand-accent-40")).toContain("color-mix");
      expect(getProp("--brand-accent-20")).toContain("color-mix");
    });

    it("removes accent tokens when no accent is provided", async () => {
      // First set accent
      await applyKonstaPalette({ primary: "#f05030", accent: "#2563eb" });
      expect(getProp("--brand-accent")).toBe("#2563eb");

      // Then apply without accent
      await applyKonstaPalette({ primary: "#f05030" });
      expect(getProp("--brand-accent")).toBe("");
      expect(getProp("--brand-accent-on")).toBe("");
      expect(getProp("--brand-accent-text")).toBe("");
      expect(getProp("--brand-accent-fill")).toBe("");
    });

    it("picks white on-color for dark accent backgrounds", async () => {
      await applyKonstaPalette({ primary: "#f05030", accent: "#1a1a1a" });
      expect(getProp("--brand-accent-on")).toBe("#ffffff");
    });

    it("picks black on-color for light accent backgrounds", async () => {
      await applyKonstaPalette({ primary: "#f05030", accent: "#F5F1E6" });
      expect(getProp("--brand-accent-on")).toBe("#000000");
    });
  });

  describe("Konsta integration tokens", () => {
    it("sets --k-color-primary as rgb from fill-safe value", async () => {
      await applyKonstaPalette("#1a237e");
      const kPrimary = getProp("--k-color-primary");
      expect(kPrimary).toMatch(/^rgb\(\d+ \d+ \d+\)$/);
    });

    it("sets iOS shade and tint tokens", async () => {
      await applyKonstaPalette("#f05030");
      expect(getProp("--k-color-ios-primary")).toBeTruthy();
      expect(getProp("--k-color-ios-primary-shade")).toBeTruthy();
      expect(getProp("--k-color-ios-primary-tint")).toBeTruthy();
    });

    it("sets Material Design tokens via dynamic import", async () => {
      await applyKonstaPalette("#f05030");
      // Our mock returns "primary" and "on_primary" as md-light and md-dark tokens
      expect(getProp("--k-color-md-light-primary")).toBeTruthy();
      expect(getProp("--k-color-md-dark-primary")).toBeTruthy();
    });
  });

  describe("input handling", () => {
    it("accepts a string as shorthand for { primary: string }", async () => {
      await applyKonstaPalette("#f05030");
      expect(getProp("--brand-text")).toBeTruthy();
      expect(getProp("--brand-fill")).toBeTruthy();
    });

    it("accepts a BrandColors object", async () => {
      await applyKonstaPalette({ primary: "#f05030", accent: "#2563eb" });
      expect(getProp("--brand-text")).toBeTruthy();
      expect(getProp("--brand-accent")).toBe("#2563eb");
    });
  });
});

describe("resetKonstaPalette", () => {
  beforeEach(() => {
    document.documentElement.setAttribute("style", "");
  });

  afterEach(() => {
    document.documentElement.setAttribute("style", "");
  });

  it("removes all --brand-* properties", async () => {
    await applyKonstaPalette({ primary: "#f05030", accent: "#2563eb" });
    expect(getProp("--brand-text")).toBeTruthy();
    expect(getProp("--brand-on")).toBeTruthy();
    expect(getProp("--brand-accent")).toBeTruthy();

    resetKonstaPalette();
    expect(getProp("--brand-text")).toBe("");
    expect(getProp("--brand-fill")).toBe("");
    expect(getProp("--brand-on")).toBe("");
    expect(getProp("--brand-accent")).toBe("");
    expect(getProp("--brand-accent-on")).toBe("");
  });

  it("removes all --k-color-* properties", async () => {
    await applyKonstaPalette("#f05030");
    expect(getProp("--k-color-primary")).toBeTruthy();

    resetKonstaPalette();
    expect(getProp("--k-color-primary")).toBe("");
    expect(getProp("--k-color-ios-primary")).toBe("");
  });

  it("preserves non-brand CSS properties", async () => {
    document.documentElement.style.setProperty("--custom-prop", "red");
    await applyKonstaPalette("#f05030");

    resetKonstaPalette();
    expect(getProp("--custom-prop")).toBe("red");
  });
});

describe("WCAG contrast guarantees across brand colors", () => {
  beforeEach(() => {
    document.documentElement.setAttribute("style", "");
    document.documentElement.classList.remove("dark", "light");
  });

  afterEach(() => {
    document.documentElement.setAttribute("style", "");
    document.documentElement.classList.remove("dark", "light");
  });

  // These colors are chosen to stress the contrast adjustment algorithm.
  // Each represents a category that commonly fails naive contrast checks.
  const stressColors = [
    { hex: "#FFD700", name: "gold (fails white-on-fill)" },
    { hex: "#00FF00", name: "lime green (low luminance contrast)" },
    { hex: "#FF69B4", name: "hot pink (mid-range)" },
    { hex: "#F5F1E6", name: "linen (very light)" },
    { hex: "#1a1a1a", name: "near-black" },
    { hex: "#808080", name: "mid-gray (worst case for both modes)" },
  ];

  for (const { hex, name } of stressColors) {
    it(`--brand-fill for ${name} passes white-on-fill 4.5:1`, async () => {
      await applyKonstaPalette(hex);
      const fill = getProp("--brand-fill");
      expect(contrast(fill, "#ffffff")).toBeGreaterThanOrEqual(4.5);
    });

    it(`--brand-on for ${name} passes 4.5:1 on the derived fill`, async () => {
      await applyKonstaPalette(hex);
      const fill = getProp("--brand-fill");
      const on = getProp("--brand-on");
      expect(contrast(on, fill)).toBeGreaterThanOrEqual(4.5);
    });

    it(`--brand-text for ${name} passes dark-surface 4.5:1`, async () => {
      document.documentElement.classList.add("dark");
      await applyKonstaPalette(hex);
      const text = getProp("--brand-text");
      expect(contrast(text, "#2c2a2c")).toBeGreaterThanOrEqual(4.5);
    });

    it(`--brand-text for ${name} passes light-surface 4.5:1`, async () => {
      document.documentElement.classList.add("light");
      await applyKonstaPalette(hex);
      const text = getProp("--brand-text");
      expect(contrast(text, "#e5e1da")).toBeGreaterThanOrEqual(4.5);
    });
  }
});

describe("Ledger (default theme) surface coverage", () => {
  // The Ledger surfaces from themes/default.css. The WORST_* constants in
  // konsta-palette.ts must remain strict supersets of these; asserting
  // against the Ledger hexes directly means a future constant change
  // cannot silently drop coverage of the shipping theme.
  const LEDGER_LIGHT_WORST = "#ede7d8"; // --paper-deep (darkest light surface)
  const LEDGER_DARK_RAISED = "#252017"; // --raised
  const LEDGER_DARK_OVERLAY = "#2f2a1e"; // Konsta elevated overlay step

  beforeEach(() => {
    document.documentElement.setAttribute("style", "");
    document.documentElement.classList.remove("dark", "light");
  });

  afterEach(() => {
    document.documentElement.setAttribute("style", "");
    document.documentElement.classList.remove("dark", "light");
  });

  const probes = ["#FFD700", "#808080", "#F5F1E6", "#1a1a1a"];

  for (const hex of probes) {
    it(`--brand-text for ${hex} passes 4.5:1 on Ledger paper-deep (light)`, async () => {
      document.documentElement.classList.add("light");
      await applyKonstaPalette(hex);
      const text = getProp("--brand-text");
      expect(contrast(text, LEDGER_LIGHT_WORST)).toBeGreaterThanOrEqual(4.5);
    });

    it(`--brand-text for ${hex} passes 4.5:1 on Ledger dark surfaces`, async () => {
      document.documentElement.classList.add("dark");
      await applyKonstaPalette(hex);
      const text = getProp("--brand-text");
      expect(contrast(text, LEDGER_DARK_RAISED)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(text, LEDGER_DARK_OVERLAY)).toBeGreaterThanOrEqual(4.5);
    });
  }
});

describe("unbranded Ledger defaults (static hexes in themes/default.css)", () => {
  // These lock the theme file's unbranded brand constants. If a value
  // changes there, it must keep 4.5:1 here; adjust by lightness steps.
  const LIGHT = {
    brandText: "#635a48",
    brandFill: "#6e6553",
    brandOn: "#fff9f0",
    paper: "#f5f1e8",
    paperDeep: "#ede7d8",
    raised: "#fcfaf3",
  };
  const DARK = {
    brandText: "#a89b80",
    paper: "#1a1713",
    paperDeep: "#141210",
    raised: "#252017",
    overlay: "#2f2a1e",
  };

  it("light --brand-text passes 4.5:1 on every light surface", () => {
    for (const surface of [LIGHT.paper, LIGHT.paperDeep, LIGHT.raised]) {
      expect(contrast(LIGHT.brandText, surface)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("dark --brand-text passes 4.5:1 on every dark surface", () => {
    for (const surface of [
      DARK.paper,
      DARK.paperDeep,
      DARK.raised,
      DARK.overlay,
    ]) {
      expect(contrast(DARK.brandText, surface)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("--brand-on passes 4.5:1 on the unbranded fill", () => {
    expect(contrast(LIGHT.brandOn, LIGHT.brandFill)).toBeGreaterThanOrEqual(
      4.5,
    );
  });
});
