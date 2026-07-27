import { describe, it, expect } from "vitest";
import {
  parseHash,
  buildHash,
  resolvePhoneCommand,
  bridgeStateToLocation,
  sectionMatchesPhone,
  loginTopicMatchesStage,
  loginStageTopics,
  getSection,
  getSubByTopic,
  getSub,
  sectionElementId,
  subElementId,
  SECTIONS,
} from "./scroll-sections.js";

describe("parseHash", () => {
  it("returns null for empty hash", () => {
    expect(parseHash("")).toBeNull();
    expect(parseHash("#")).toBeNull();
  });

  it("parses a section-only hash", () => {
    expect(parseHash("#login")).toEqual({
      sectionId: "login",
      subSlug: null,
    });
  });

  it("parses a section/sub hash", () => {
    expect(parseHash("#login/credentials")).toEqual({
      sectionId: "login",
      subSlug: "credentials",
    });
  });

  it("parses ticket-detail section", () => {
    expect(parseHash("#ticket-detail/timeline")).toEqual({
      sectionId: "ticket-detail",
      subSlug: "timeline",
    });
  });

  it("returns null sub for unknown sub-slug", () => {
    expect(parseHash("#login/bogus")).toEqual({
      sectionId: "login",
      subSlug: null,
    });
  });

  it("returns null for unknown section", () => {
    expect(parseHash("#nonexistent")).toBeNull();
  });

  it("handles hash without # prefix", () => {
    expect(parseHash("tickets/sort")).toEqual({
      sectionId: "tickets",
      subSlug: "sort",
    });
  });
});

describe("buildHash", () => {
  it("builds section-only hash", () => {
    expect(buildHash("login")).toBe("#login");
  });

  it("builds section/sub hash", () => {
    expect(buildHash("tickets", "filters")).toBe("#tickets/filters");
  });

  it("ignores null sub", () => {
    expect(buildHash("search", null)).toBe("#search");
  });
});

describe("sectionElementId / subElementId", () => {
  it("generates section element ID", () => {
    expect(sectionElementId("login")).toBe("section-login");
  });

  it("generates sub element ID", () => {
    expect(subElementId("tickets", "sort")).toBe("sub-tickets-sort");
  });
});

describe("getSection", () => {
  it("returns section by ID", () => {
    const s = getSection("tickets");
    expect(s).toBeDefined();
    expect(s?.id).toBe("tickets");
  });

  it("returns undefined for unknown ID", () => {
    expect(getSection("bogus")).toBeUndefined();
  });
});

describe("getSubByTopic", () => {
  it("returns location for a known topic", () => {
    const result = getSubByTopic("sort");
    expect(result).toEqual({ sectionId: "tickets", subSlug: "sort" });
  });

  it("returns location for login topic", () => {
    const result = getSubByTopic("twofa");
    expect(result).toEqual({ sectionId: "login", subSlug: "two-factor" });
  });

  it("returns location for detail topic", () => {
    const result = getSubByTopic("timeline");
    expect(result).toEqual({
      sectionId: "ticket-detail",
      subSlug: "timeline",
    });
  });
});

describe("getSub", () => {
  it("returns sub and parent section", () => {
    const result = getSub("login", "credentials");
    expect(result?.sub.slug).toBe("credentials");
    expect(result?.section.id).toBe("login");
  });

  it("returns undefined for non-existent combo", () => {
    expect(getSub("login", "sort")).toBeUndefined();
  });
});

describe("resolvePhoneCommand", () => {
  const TICKET_ID = "test-ticket-id";

  it("resolves login/credentials to the sign-in form screen", () => {
    const cmd = resolvePhoneCommand("login", "credentials", TICKET_ID);
    expect(cmd.feature).toBe("login");
    expect(cmd.loginTarget).toBe("form");
    expect(cmd.pulseTopic).toBe("credentials");
  });

  it("resolves login/language to the form (where the picker lives)", () => {
    const cmd = resolvePhoneCommand("login", "language", TICKET_ID);
    expect(cmd.loginTarget).toBe("form");
    expect(cmd.pulseTopic).toBe("language");
  });

  it("resolves login/two-factor to the method picker screen", () => {
    const cmd = resolvePhoneCommand("login", "two-factor", TICKET_ID);
    expect(cmd.feature).toBe("login");
    expect(cmd.loginTarget).toBe("twofa-picker");
    expect(cmd.pulseTopic).toBe("twofa");
  });

  it("resolves each 2FA method sub to its method screen", () => {
    expect(resolvePhoneCommand("login", "totp", TICKET_ID).loginTarget).toBe(
      "method-totp",
    );
    expect(resolvePhoneCommand("login", "passkey", TICKET_ID).loginTarget).toBe(
      "method-passkey",
    );
    expect(resolvePhoneCommand("login", "email", TICKET_ID).loginTarget).toBe(
      "method-email",
    );
    expect(resolvePhoneCommand("login", "sms", TICKET_ID).loginTarget).toBe(
      "method-sms",
    );
    expect(resolvePhoneCommand("login", "push", TICKET_ID).loginTarget).toBe(
      "method-push",
    );
    expect(
      resolvePhoneCommand("login", "backup-codes", TICKET_ID).loginTarget,
    ).toBe("method-backup");
  });

  it("resolves login/key-derivation without advancing (narration only)", () => {
    const cmd = resolvePhoneCommand("login", "key-derivation", TICKET_ID);
    expect(cmd.feature).toBe("login");
    expect(cmd.loginTarget).toBeNull();
    expect(cmd.pulseTopic).toBe("key-derivation");
  });

  it("resolves tickets section to tickets feature", () => {
    const cmd = resolvePhoneCommand("tickets", "sort", TICKET_ID);
    expect(cmd.feature).toBe("tickets");
    expect(cmd.detail).toBeNull();
    expect(cmd.pulseTopic).toBe("sort");
  });

  it("resolves ticket-detail to tickets with detail ID", () => {
    const cmd = resolvePhoneCommand("ticket-detail", "reply", TICKET_ID);
    expect(cmd.feature).toBe("tickets");
    expect(cmd.detail).toBe(TICKET_ID);
    expect(cmd.pulseTopic).toBe("reply");
  });

  it("resolves search section to openSearch", () => {
    const cmd = resolvePhoneCommand("search", "intro", TICKET_ID);
    expect(cmd.openSearch).toBe(true);
    expect(cmd.pulseTopic).toBeNull();
  });

  it("resolves section-only (no sub) with null topic", () => {
    const cmd = resolvePhoneCommand("tickets", null, TICKET_ID);
    expect(cmd.pulseTopic).toBeNull();
  });
});

describe("bridgeStateToLocation", () => {
  it("maps topic to its sub-section", () => {
    const loc = bridgeStateToLocation("tickets", null, false, "sort", null);
    expect(loc).toEqual({ sectionId: "tickets", subSlug: "sort" });
  });

  it("maps searchOpen to search section", () => {
    const loc = bridgeStateToLocation("tickets", null, true, null, null);
    expect(loc).toEqual({ sectionId: "search", subSlug: "intro" });
  });

  it("maps the resting login form to no sub (helper tip state)", () => {
    const loc = bridgeStateToLocation("login", null, false, null, "form");
    expect(loc).toEqual({ sectionId: "login", subSlug: null });
  });

  it("maps a credentials interaction on the form to its sub", () => {
    const loc = bridgeStateToLocation(
      "login",
      null,
      false,
      "credentials",
      "form",
    );
    expect(loc).toEqual({ sectionId: "login", subSlug: "credentials" });
  });

  it("maps login twofa-picker to two-factor", () => {
    const loc = bridgeStateToLocation(
      "login",
      null,
      false,
      null,
      "twofa-picker",
    );
    expect(loc).toEqual({ sectionId: "login", subSlug: "two-factor" });
  });

  it("maps login deriving to key-derivation", () => {
    const loc = bridgeStateToLocation("login", null, false, null, "deriving");
    expect(loc).toEqual({ sectionId: "login", subSlug: "key-derivation" });
  });

  it("maps tickets with detail to ticket-detail section", () => {
    const loc = bridgeStateToLocation("tickets", "some-id", false, null, null);
    expect(loc).toEqual({ sectionId: "ticket-detail", subSlug: null });
  });

  it("consistent topic takes priority (detail topic while in detail)", () => {
    const loc = bridgeStateToLocation(
      "tickets",
      "some-id",
      false,
      "case-fold",
      null,
    );
    expect(loc).toEqual({ sectionId: "ticket-detail", subSlug: "case-fold" });
  });

  it("stale login topic is ignored once the phone lands on tickets", () => {
    const loc = bridgeStateToLocation("tickets", null, false, "twofa", null);
    expect(loc).toEqual({ sectionId: "tickets", subSlug: null });
  });

  it("stale detail topic is ignored when search opens over the list", () => {
    const loc = bridgeStateToLocation("tickets", null, true, "case-fold", null);
    expect(loc).toEqual({ sectionId: "search", subSlug: "intro" });
  });

  it("stale list topic is ignored inside the detail view", () => {
    const loc = bridgeStateToLocation(
      "tickets",
      "some-id",
      false,
      "sort",
      null,
    );
    expect(loc).toEqual({ sectionId: "ticket-detail", subSlug: null });
  });

  it("deriving stage outranks the last-clicked 2FA topic", () => {
    const loc = bridgeStateToLocation(
      "login",
      null,
      false,
      "twofa-totp",
      "deriving",
    );
    expect(loc).toEqual({ sectionId: "login", subSlug: "key-derivation" });
  });
});

describe("sectionMatchesPhone", () => {
  it("matches login section only while the login feature is shown", () => {
    expect(sectionMatchesPhone("login", "login", null, false)).toBe(true);
    expect(sectionMatchesPhone("login", "tickets", null, false)).toBe(false);
  });

  it("matches tickets section only on the bare list", () => {
    expect(sectionMatchesPhone("tickets", "tickets", null, false)).toBe(true);
    expect(sectionMatchesPhone("tickets", "tickets", "tk-1", false)).toBe(
      false,
    );
    expect(sectionMatchesPhone("tickets", "tickets", null, true)).toBe(false);
  });

  it("matches ticket-detail section only with a detail open", () => {
    expect(sectionMatchesPhone("ticket-detail", "tickets", "tk-1", false)).toBe(
      true,
    );
    expect(sectionMatchesPhone("ticket-detail", "tickets", null, false)).toBe(
      false,
    );
    expect(sectionMatchesPhone("ticket-detail", "tickets", "tk-1", true)).toBe(
      false,
    );
  });

  it("matches search section only while the overlay is open", () => {
    expect(sectionMatchesPhone("search", "tickets", null, true)).toBe(true);
    expect(sectionMatchesPhone("search", "tickets", null, false)).toBe(false);
  });
});

describe("loginTopicMatchesStage", () => {
  it("keeps form topics only on the form stage", () => {
    expect(loginTopicMatchesStage("credentials", "form")).toBe(true);
    expect(loginTopicMatchesStage("language", "form")).toBe(true);
    expect(loginTopicMatchesStage("credentials", "twofa-picker")).toBe(false);
  });

  it("keeps method topics through picker and open method", () => {
    expect(loginTopicMatchesStage("twofa-totp", "twofa-picker")).toBe(true);
    expect(loginTopicMatchesStage("twofa-totp", "twofa-method")).toBe(true);
    expect(loginTopicMatchesStage("twofa-totp", "deriving")).toBe(false);
  });

  it("keeps key-derivation only while deriving", () => {
    expect(loginTopicMatchesStage("key-derivation", "deriving")).toBe(true);
    expect(loginTopicMatchesStage("key-derivation", "form")).toBe(false);
  });

  it("always passes non-login topics (section check owns them)", () => {
    expect(loginTopicMatchesStage("sort", null)).toBe(true);
    expect(loginTopicMatchesStage("case-fold", "form")).toBe(true);
  });
});

describe("loginStageTopics", () => {
  it("marks nothing for the resting form stage", () => {
    expect(loginStageTopics("form")).toEqual([]);
  });

  it("credits credentials once the picker is reached", () => {
    expect(loginStageTopics("twofa-picker")).toEqual(["credentials"]);
  });

  it("credits credentials + twofa once a method is open", () => {
    expect(loginStageTopics("twofa-method")).toEqual(["credentials", "twofa"]);
  });

  it("credits all three topics while deriving", () => {
    expect(loginStageTopics("deriving")).toEqual([
      "credentials",
      "twofa",
      "key-derivation",
    ]);
  });

  it("marks nothing for null (post-auth states carry no login stage)", () => {
    expect(loginStageTopics(null)).toEqual([]);
  });
});

describe("SECTIONS taxonomy", () => {
  it("has four sections", () => {
    expect(SECTIONS).toHaveLength(4);
  });

  it("section IDs are login, tickets, ticket-detail, search", () => {
    expect(SECTIONS.map((s) => s.id)).toEqual([
      "login",
      "tickets",
      "ticket-detail",
      "search",
    ]);
  });

  it("login has 4 subs", () => {
    const login = SECTIONS.find((s) => s.id === "login");
    expect(login?.subs).toHaveLength(10);
  });

  it("tickets has 5 subs", () => {
    const tickets = SECTIONS.find((s) => s.id === "tickets");
    expect(tickets?.subs).toHaveLength(5);
  });

  it("ticket-detail has 6 subs", () => {
    const detail = SECTIONS.find((s) => s.id === "ticket-detail");
    expect(detail?.subs).toHaveLength(6);
  });

  it("search has 1 sub", () => {
    const search = SECTIONS.find((s) => s.id === "search");
    expect(search?.subs).toHaveLength(1);
  });
});
