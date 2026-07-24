// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { isValidRedirectTarget } from "./redirect-target.js";

describe("isValidRedirectTarget", () => {
  it("accepts simple relative paths", () => {
    expect(isValidRedirectTarget("/tickets")).toBe(true);
    expect(isValidRedirectTarget("/tickets/abc-123")).toBe(true);
    expect(isValidRedirectTarget("/")).toBe(true);
    expect(isValidRedirectTarget("/library?q=test")).toBe(true);
  });

  it("rejects protocol-relative URLs", () => {
    expect(isValidRedirectTarget("//evil.com")).toBe(false);
    expect(isValidRedirectTarget("//evil.com/path")).toBe(false);
  });

  it("rejects backslash protocol-relative URLs", () => {
    expect(isValidRedirectTarget("/\\evil.com")).toBe(false);
  });

  it("rejects non-absolute paths", () => {
    expect(isValidRedirectTarget("tickets")).toBe(false);
    expect(isValidRedirectTarget("")).toBe(false);
    expect(isValidRedirectTarget("https://evil.com")).toBe(false);
  });

  it("rejects paths with control characters", () => {
    expect(isValidRedirectTarget("/tickets\x00")).toBe(false);
    expect(isValidRedirectTarget("/tickets\n")).toBe(false);
    expect(isValidRedirectTarget("/tickets\r")).toBe(false);
    expect(isValidRedirectTarget("/tickets\t")).toBe(false);
    expect(isValidRedirectTarget("/\x7ftickets")).toBe(false);
    expect(isValidRedirectTarget("/\x01path")).toBe(false);
    expect(isValidRedirectTarget("/\x1fpath")).toBe(false);
  });
});
