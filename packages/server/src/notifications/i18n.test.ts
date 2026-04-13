import { describe, expect, it } from "vitest";
import { getStrings, buildLoginUrl } from "./i18n.js";

describe("getStrings", () => {
  it("returns English strings for 'en'", () => {
    const strings = getStrings("en");
    expect(strings.emailSubjectPrefix).toBe("CARE-Y");
    expect(strings.ticketAssigned("https://org.care-y.app/login")).toContain(
      "https://org.care-y.app/login",
    );
  });

  it("returns Spanish strings for 'es'", () => {
    const strings = getStrings("es");
    expect(strings.emailSubjectPrefix).toBe("CARE-Y");
    expect(strings.ticketAssigned("https://org.care-y.app/login")).toContain(
      "asignado",
    );
  });

  it("falls back to English for unknown locales", () => {
    const strings = getStrings("fr");
    expect(strings.emailSubjectPrefix).toBe("CARE-Y");
    expect(strings.ticketCreated("url")).toContain("new ticket");
  });

  it("handles locale with region code (e.g., 'en-US')", () => {
    const strings = getStrings("en-US");
    expect(strings.ticketCreated("url")).toContain("new ticket");
  });

  it("handles locale with region code (e.g., 'es-MX')", () => {
    const strings = getStrings("es-MX");
    expect(strings.ticketCreated("url")).toContain("nuevo caso");
  });

  it("handles empty string locale (falls back to English)", () => {
    const strings = getStrings("");
    expect(strings.emailSubjectPrefix).toBe("CARE-Y");
  });

  it("includes login URL in all string functions", () => {
    const strings = getStrings("en");
    const url = "https://test.care-y.app/login";

    expect(strings.ticketAssigned(url)).toContain(url);
    expect(strings.ticketCreated(url)).toContain(url);
    expect(strings.ticketEscalated(url)).toContain(url);
    expect(strings.followupAdded(url)).toContain(url);
    expect(strings.mentionNotification(url)).toContain(url);
    expect(strings.smsPing(url)).toContain(url);
  });
});

describe("buildLoginUrl", () => {
  it("produces correct URL from slug", () => {
    expect(buildLoginUrl("myorg")).toBe("https://myorg.care-y.app/login");
  });

  it("handles hyphenated slugs", () => {
    expect(buildLoginUrl("my-org")).toBe("https://my-org.care-y.app/login");
  });
});
