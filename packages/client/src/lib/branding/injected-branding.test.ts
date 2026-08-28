// @vitest-environment jsdom

import { describe, it, expect, afterEach } from "vitest";
import {
  readInjectedOrgName,
  readInjectedSafeExitUrl,
} from "./injected-branding.js";

afterEach(() => {
  document.documentElement.removeAttribute("data-org-name");
  document.documentElement.removeAttribute("data-safe-exit-url");
});

describe("readInjectedOrgName", () => {
  it("returns the injected name", () => {
    document.documentElement.setAttribute("data-org-name", "Harbor House");
    expect(readInjectedOrgName()).toBe("Harbor House");
  });

  it("returns null when the attribute is absent", () => {
    expect(readInjectedOrgName()).toBeNull();
  });

  it("treats an empty attribute as absent", () => {
    // The handle always substitutes, writing "" when it has no value, so
    // the attribute is present on every page whether or not it carries one.
    document.documentElement.setAttribute("data-org-name", "");
    expect(readInjectedOrgName()).toBeNull();
  });

  it("returns the name verbatim once the parser has decoded entities", () => {
    // The server escapes before injection; the browser decodes on parse.
    // What reaches this reader is the original text, not the escaped form.
    document.documentElement.setAttribute("data-org-name", 'A "B" & C');
    expect(readInjectedOrgName()).toBe('A "B" & C');
  });
});

describe("readInjectedSafeExitUrl", () => {
  it("returns the injected URL", () => {
    document.documentElement.setAttribute(
      "data-safe-exit-url",
      "https://weather.example.org/",
    );
    expect(readInjectedSafeExitUrl()).toBe("https://weather.example.org/");
  });

  it("returns null when the org has configured nothing", () => {
    document.documentElement.setAttribute("data-safe-exit-url", "");
    expect(readInjectedSafeExitUrl()).toBeNull();
  });
});
