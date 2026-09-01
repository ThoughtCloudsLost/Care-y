import { describe, expect, it } from "vitest";
// The real template, so a new %carey.*% token reaching the splash block
// fails here instead of painting literally in the simulator.
import appHtml from "../../client/src/app.html?raw";
import { injectDemoSplash } from "../vite.js";
import { DEMO_ORG_NAME } from "./lib/engine/server/org-identity.js";

const shell = '<html><body>\n<div id="app"></div></body></html>';

describe("injectDemoSplash", () => {
  it("substitutes the seeded org name for the splash name token", () => {
    const result = injectDemoSplash(shell, appHtml);
    expect(result).toContain(`<span id="splash-name">${DEMO_ORG_NAME}</span>`);
  });

  it("leaves no branding placeholder in the injected splash", () => {
    const result = injectDemoSplash(shell, appHtml);
    // Same token grammar as branding-inject.ts's PLACEHOLDER_RE; the
    // scheme script legitimately mentions "%carey.*%" in a comment.
    expect(result).not.toMatch(/%carey\.\w+%/);
  });

  it("keeps the splash logo img without a src (no seeded org icon)", () => {
    const result = injectDemoSplash(shell, appHtml);
    const img = /<img[^>]*id="splash-logo"[^>]*>/.exec(result)?.[0];
    expect(img).toBeDefined();
    expect(img).not.toContain("src=");
  });

  it("injects the scheme script and splash styles before the app root", () => {
    const result = injectDemoSplash(shell, appHtml);
    expect(result).toContain("care-y-color-scheme");
    expect(result).toContain("#splash");
    expect(result.indexOf('<div id="splash"')).toBeLessThan(
      result.indexOf('<div id="app"'),
    );
  });

  it("returns the page unchanged when the template has no splash block", () => {
    expect(injectDemoSplash(shell, "<html><body></body></html>")).toBe(shell);
  });
});
