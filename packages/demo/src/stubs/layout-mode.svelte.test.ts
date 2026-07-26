import { describe, it, expect } from "vitest";
import { layoutMode } from "./layout-mode.svelte.js";

describe("layout-mode stub", () => {
  it("isDesktop is always false", () => {
    expect(layoutMode.isDesktop).toBe(false);
  });

  it("isTablet is always false", () => {
    expect(layoutMode.isTablet).toBe(false);
  });
});
