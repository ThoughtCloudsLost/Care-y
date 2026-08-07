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
  sectionForRoute,
  slugForRoute,
  routeForSlug,
  pathnameForRouteId,
  SECTIONS,
  ENTRY_SECTION,
  SECTION_ROUTES,
  SUB_ROUTES,
  UNNARRATED_ROUTES,
} from "./scroll-sections.js";
import { listRouteIds } from "./engine/route-manifest.js";

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

  it("parses dashboard section", () => {
    expect(parseHash("#dashboard")).toEqual({
      sectionId: "dashboard",
      subSlug: null,
    });
  });

  it("parses dashboard/intro sub", () => {
    expect(parseHash("#dashboard/intro")).toEqual({
      sectionId: "dashboard",
      subSlug: "intro",
    });
  });

  it("parses library section", () => {
    expect(parseHash("#library")).toEqual({
      sectionId: "library",
      subSlug: null,
    });
  });

  it("parses library/intro sub", () => {
    expect(parseHash("#library/intro")).toEqual({
      sectionId: "library",
      subSlug: "intro",
    });
  });

  it("parses admin section", () => {
    expect(parseHash("#admin")).toEqual({
      sectionId: "admin",
      subSlug: null,
    });
  });

  it("parses schedule section", () => {
    expect(parseHash("#schedule")).toEqual({
      sectionId: "schedule",
      subSlug: null,
    });
  });

  it("parses settings section", () => {
    expect(parseHash("#settings")).toEqual({
      sectionId: "settings",
      subSlug: null,
    });
  });

  it("parses settings/profile-identity sub", () => {
    expect(parseHash("#settings/profile-identity")).toEqual({
      sectionId: "settings",
      subSlug: "profile-identity",
    });
  });

  it("parses settings/password-keys sub", () => {
    expect(parseHash("#settings/password-keys")).toEqual({
      sectionId: "settings",
      subSlug: "password-keys",
    });
  });

  it("parses settings/two-factor-methods sub", () => {
    expect(parseHash("#settings/two-factor-methods")).toEqual({
      sectionId: "settings",
      subSlug: "two-factor-methods",
    });
  });

  it("parses admin/people-queues sub", () => {
    expect(parseHash("#admin/people-queues")).toEqual({
      sectionId: "admin",
      subSlug: "people-queues",
    });
  });

  it("parses admin/org-config-keys sub", () => {
    expect(parseHash("#admin/org-config-keys")).toEqual({
      sectionId: "admin",
      subSlug: "org-config-keys",
    });
  });

  it("parses admin/communications sub", () => {
    expect(parseHash("#admin/communications")).toEqual({
      sectionId: "admin",
      subSlug: "communications",
    });
  });

  it("parses coming-soon/reports as a valid location", () => {
    expect(parseHash("#coming-soon/reports")).toEqual({
      sectionId: "coming-soon",
      subSlug: "reports",
    });
  });

  it("returns null for a bare #coming-soon with no slug", () => {
    expect(parseHash("#coming-soon")).toBeNull();
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
  const ARTICLE_ID = "test-article-id";

  it("resolves login/credentials to the sign-in form screen", () => {
    const cmd = resolvePhoneCommand(
      "login",
      "credentials",
      TICKET_ID,
      ARTICLE_ID,
    );
    expect(cmd.feature).toBe("login");
    expect(cmd.loginTarget).toBe("form");
    expect(cmd.pulseTopic).toBe("credentials");
  });

  it("resolves login/language to the form (where the picker lives)", () => {
    const cmd = resolvePhoneCommand("login", "language", TICKET_ID, ARTICLE_ID);
    expect(cmd.loginTarget).toBe("form");
    expect(cmd.pulseTopic).toBe("language");
  });

  it("resolves login/two-factor to the method picker screen", () => {
    const cmd = resolvePhoneCommand(
      "login",
      "two-factor",
      TICKET_ID,
      ARTICLE_ID,
    );
    expect(cmd.feature).toBe("login");
    expect(cmd.loginTarget).toBe("twofa-picker");
    expect(cmd.pulseTopic).toBe("twofa");
  });

  it("resolves each 2FA method sub to its method screen", () => {
    expect(
      resolvePhoneCommand("login", "totp", TICKET_ID, ARTICLE_ID).loginTarget,
    ).toBe("method-totp");
    expect(
      resolvePhoneCommand("login", "passkey", TICKET_ID, ARTICLE_ID)
        .loginTarget,
    ).toBe("method-passkey");
    expect(
      resolvePhoneCommand("login", "email", TICKET_ID, ARTICLE_ID).loginTarget,
    ).toBe("method-email");
    expect(
      resolvePhoneCommand("login", "sms", TICKET_ID, ARTICLE_ID).loginTarget,
    ).toBe("method-sms");
    expect(
      resolvePhoneCommand("login", "push", TICKET_ID, ARTICLE_ID).loginTarget,
    ).toBe("method-push");
    expect(
      resolvePhoneCommand("login", "backup-codes", TICKET_ID, ARTICLE_ID)
        .loginTarget,
    ).toBe("method-backup");
  });

  it("resolves login/key-derivation without advancing (narration only)", () => {
    const cmd = resolvePhoneCommand(
      "login",
      "key-derivation",
      TICKET_ID,
      ARTICLE_ID,
    );
    expect(cmd.feature).toBe("login");
    expect(cmd.loginTarget).toBeNull();
    expect(cmd.pulseTopic).toBe("key-derivation");
  });

  it("resolves tickets section to tickets feature", () => {
    const cmd = resolvePhoneCommand("tickets", "sort", TICKET_ID, ARTICLE_ID);
    expect(cmd.feature).toBe("tickets");
    expect(cmd.detail).toBeNull();
    expect(cmd.pulseTopic).toBe("sort");
  });

  it("resolves ticket-detail to tickets with detail ID", () => {
    const cmd = resolvePhoneCommand(
      "ticket-detail",
      "reply",
      TICKET_ID,
      ARTICLE_ID,
    );
    expect(cmd.feature).toBe("tickets");
    expect(cmd.detail).toBe(TICKET_ID);
    expect(cmd.pulseTopic).toBe("reply");
  });

  it("resolves search section to openSearch", () => {
    const cmd = resolvePhoneCommand("search", "intro", TICKET_ID, ARTICLE_ID);
    expect(cmd.openSearch).toBe(true);
    expect(cmd.pulseTopic).toBeNull();
  });

  it("resolves section-only (no sub) with null topic", () => {
    const cmd = resolvePhoneCommand("tickets", null, TICKET_ID, ARTICLE_ID);
    expect(cmd.pulseTopic).toBeNull();
  });

  it("resolves dashboard section to home feature", () => {
    const cmd = resolvePhoneCommand(
      "dashboard",
      "intro",
      TICKET_ID,
      ARTICLE_ID,
    );
    expect(cmd.feature).toBe("home");
    expect(cmd.detail).toBeNull();
    expect(cmd.pulseTopic).toBeNull();
  });

  it("resolves dashboard/queues to home with topic", () => {
    const cmd = resolvePhoneCommand(
      "dashboard",
      "queues",
      TICKET_ID,
      ARTICLE_ID,
    );
    expect(cmd.feature).toBe("home");
    expect(cmd.detail).toBeNull();
    expect(cmd.pulseTopic).toBe("dashboard-queues");
  });

  it("resolves dashboard/activity to home with topic", () => {
    const cmd = resolvePhoneCommand(
      "dashboard",
      "activity",
      TICKET_ID,
      ARTICLE_ID,
    );
    expect(cmd.feature).toBe("home");
    expect(cmd.detail).toBeNull();
    expect(cmd.pulseTopic).toBe("dashboard-activity");
  });

  it("resolves library section to library feature", () => {
    const cmd = resolvePhoneCommand("library", "intro", TICKET_ID, ARTICLE_ID);
    expect(cmd.feature).toBe("library");
    expect(cmd.detail).toBeNull();
    expect(cmd.pulseTopic).toBeNull();
  });

  it("resolves library/vote to library with article detail", () => {
    const cmd = resolvePhoneCommand("library", "vote", TICKET_ID, ARTICLE_ID);
    expect(cmd.feature).toBe("library");
    expect(cmd.detail).toBe(ARTICLE_ID);
    expect(cmd.pulseTopic).toBe("library-vote");
  });

  it("resolves library/categories to library list", () => {
    const cmd = resolvePhoneCommand(
      "library",
      "categories",
      TICKET_ID,
      ARTICLE_ID,
    );
    expect(cmd.feature).toBe("library");
    expect(cmd.detail).toBeNull();
    expect(cmd.pulseTopic).toBe("library-categories");
  });

  it("resolves library/editor to library with 'new' detail", () => {
    const cmd = resolvePhoneCommand("library", "editor", TICKET_ID, ARTICLE_ID);
    expect(cmd.feature).toBe("library");
    expect(cmd.detail).toBe("new");
    expect(cmd.pulseTopic).toBe("library-editor");
  });

  it("resolves admin section to admin feature", () => {
    const cmd = resolvePhoneCommand("admin", "intro", TICKET_ID, ARTICLE_ID);
    expect(cmd.feature).toBe("admin");
    expect(cmd.detail).toBeNull();
    expect(cmd.pulseTopic).toBeNull();
  });

  it("resolves admin/people-queues to admin with people detail", () => {
    const cmd = resolvePhoneCommand(
      "admin",
      "people-queues",
      TICKET_ID,
      ARTICLE_ID,
    );
    expect(cmd.feature).toBe("admin");
    expect(cmd.detail).toBe("people");
    expect(cmd.pulseTopic).toBe("admin-roster-edit");
  });

  it("resolves admin/org-config-keys to admin with organization detail", () => {
    const cmd = resolvePhoneCommand(
      "admin",
      "org-config-keys",
      TICKET_ID,
      ARTICLE_ID,
    );
    expect(cmd.feature).toBe("admin");
    expect(cmd.detail).toBe("organization");
    expect(cmd.pulseTopic).toBeNull();
  });

  it("resolves admin/communications to admin with communications detail", () => {
    const cmd = resolvePhoneCommand(
      "admin",
      "communications",
      TICKET_ID,
      ARTICLE_ID,
    );
    expect(cmd.feature).toBe("admin");
    expect(cmd.detail).toBe("communications");
    expect(cmd.pulseTopic).toBeNull();
  });

  it("resolves admin/greetings to admin with communications detail", () => {
    const cmd = resolvePhoneCommand(
      "admin",
      "greetings",
      TICKET_ID,
      ARTICLE_ID,
    );
    expect(cmd.feature).toBe("admin");
    expect(cmd.detail).toBe("communications");
    expect(cmd.pulseTopic).toBe("admin-greetings");
  });

  it("resolves admin/quarantine to admin with communications detail", () => {
    const cmd = resolvePhoneCommand(
      "admin",
      "quarantine",
      TICKET_ID,
      ARTICLE_ID,
    );
    expect(cmd.feature).toBe("admin");
    expect(cmd.detail).toBe("communications");
    expect(cmd.pulseTopic).toBe("admin-quarantine");
  });

  it("resolves schedule section to schedule feature", () => {
    const cmd = resolvePhoneCommand("schedule", "intro", TICKET_ID, ARTICLE_ID);
    expect(cmd.feature).toBe("schedule");
    expect(cmd.detail).toBeNull();
  });

  it("resolves settings section to settings feature", () => {
    const cmd = resolvePhoneCommand("settings", "intro", TICKET_ID, ARTICLE_ID);
    expect(cmd.feature).toBe("settings");
    expect(cmd.detail).toBeNull();
  });

  it("resolves settings sub-sections to settings feature with topics", () => {
    const profileCmd = resolvePhoneCommand(
      "settings",
      "profile-identity",
      TICKET_ID,
      ARTICLE_ID,
    );
    expect(profileCmd.feature).toBe("settings");
    expect(profileCmd.detail).toBeNull();
    expect(profileCmd.pulseTopic).toBe("settings-profile");

    const passwordCmd = resolvePhoneCommand(
      "settings",
      "password-keys",
      TICKET_ID,
      ARTICLE_ID,
    );
    expect(passwordCmd.pulseTopic).toBe("settings-password");

    const twofaCmd = resolvePhoneCommand(
      "settings",
      "two-factor-methods",
      TICKET_ID,
      ARTICLE_ID,
    );
    expect(twofaCmd.pulseTopic).toBe("settings-2fa");
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

  it("maps home feature to dashboard section", () => {
    const loc = bridgeStateToLocation("home", null, false, null, null);
    expect(loc).toEqual({ sectionId: "dashboard", subSlug: "intro" });
  });

  it("maps library feature to library section", () => {
    const loc = bridgeStateToLocation("library", null, false, null, null);
    expect(loc).toEqual({ sectionId: "library", subSlug: "intro" });
  });

  it("maps library feature with detail to library section", () => {
    const loc = bridgeStateToLocation("library", "art-001", false, null, null);
    expect(loc).toEqual({ sectionId: "library", subSlug: "intro" });
  });

  it("maps admin feature to admin section", () => {
    const loc = bridgeStateToLocation("admin", null, false, null, null);
    expect(loc).toEqual({ sectionId: "admin", subSlug: "intro" });
  });

  it("maps admin feature with volunteer detail to admin intro", () => {
    const loc = bridgeStateToLocation("admin", "volunteer", false, null, null);
    expect(loc).toEqual({ sectionId: "admin", subSlug: "intro" });
  });

  it("maps admin feature with people detail to people-queues sub", () => {
    const loc = bridgeStateToLocation("admin", "people", false, null, null);
    expect(loc).toEqual({ sectionId: "admin", subSlug: "people-queues" });
  });

  it("maps admin feature with organization detail to org-config-keys sub", () => {
    const loc = bridgeStateToLocation(
      "admin",
      "organization",
      false,
      null,
      null,
    );
    expect(loc).toEqual({ sectionId: "admin", subSlug: "org-config-keys" });
  });

  it("maps admin feature with communications detail to communications sub", () => {
    const loc = bridgeStateToLocation(
      "admin",
      "communications",
      false,
      null,
      null,
    );
    expect(loc).toEqual({ sectionId: "admin", subSlug: "communications" });
  });

  it("maps schedule feature to schedule section", () => {
    const loc = bridgeStateToLocation("schedule", null, false, null, null);
    expect(loc).toEqual({ sectionId: "schedule", subSlug: "intro" });
  });

  it("maps settings feature to settings section", () => {
    const loc = bridgeStateToLocation("settings", null, false, null, null);
    expect(loc).toEqual({ sectionId: "settings", subSlug: "intro" });
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

  it("matches dashboard section only while the home feature is shown", () => {
    expect(sectionMatchesPhone("dashboard", "home", null, false)).toBe(true);
    expect(sectionMatchesPhone("dashboard", "tickets", null, false)).toBe(
      false,
    );
  });

  it("matches library section only for library feature", () => {
    expect(sectionMatchesPhone("library", "library", null, false)).toBe(true);
    expect(sectionMatchesPhone("library", "library", "art-001", false)).toBe(
      true,
    );
    expect(sectionMatchesPhone("library", "tickets", null, false)).toBe(false);
  });

  it("matches admin section for any admin detail", () => {
    expect(sectionMatchesPhone("admin", "admin", null, false)).toBe(true);
    expect(sectionMatchesPhone("admin", "admin", "volunteer", false)).toBe(
      true,
    );
    expect(sectionMatchesPhone("admin", "tickets", null, false)).toBe(false);
  });

  it("matches schedule section only for schedule feature", () => {
    expect(sectionMatchesPhone("schedule", "schedule", null, false)).toBe(true);
    expect(sectionMatchesPhone("schedule", "tickets", null, false)).toBe(false);
  });

  it("matches settings section only for settings feature", () => {
    expect(sectionMatchesPhone("settings", "settings", null, false)).toBe(true);
    expect(sectionMatchesPhone("settings", "tickets", null, false)).toBe(false);
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
  it("has nine sections", () => {
    expect(SECTIONS).toHaveLength(9);
  });

  it("section IDs are in visitor-journey order", () => {
    expect(SECTIONS.map((s) => s.id)).toEqual([
      "login",
      "dashboard",
      "tickets",
      "ticket-detail",
      "search",
      "library",
      "admin",
      "schedule",
      "settings",
    ]);
  });

  it("login has 10 subs", () => {
    const login = SECTIONS.find((s) => s.id === "login");
    expect(login?.subs).toHaveLength(10);
  });

  it("dashboard has 3 subs", () => {
    const dashboard = SECTIONS.find((s) => s.id === "dashboard");
    expect(dashboard?.subs).toHaveLength(3);
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

  it("library has 4 subs", () => {
    const library = SECTIONS.find((s) => s.id === "library");
    expect(library?.subs).toHaveLength(4);
  });

  it("admin has 6 subs", () => {
    const admin = SECTIONS.find((s) => s.id === "admin");
    expect(admin?.subs).toHaveLength(6);
  });

  it("schedule has 1 sub", () => {
    const schedule = SECTIONS.find((s) => s.id === "schedule");
    expect(schedule?.subs).toHaveLength(1);
  });

  it("settings has 4 subs", () => {
    const settings = SECTIONS.find((s) => s.id === "settings");
    expect(settings?.subs).toHaveLength(4);
  });
});

// -----------------------------------------------------------------------
// Route mapping completeness
// -----------------------------------------------------------------------

describe("route mapping completeness", () => {
  /** Collect every route ID that appears in any mapping array. */
  function allMappedRoutes(): Set<string> {
    const mapped = new Set<string>();
    for (const routes of Object.values(SECTION_ROUTES)) {
      for (const r of routes) mapped.add(r);
    }
    for (const routes of Object.values(SUB_ROUTES)) {
      for (const r of routes) mapped.add(r);
    }
    for (const r of UNNARRATED_ROUTES) {
      mapped.add(r);
    }
    return mapped;
  }

  it("every manifest route appears in exactly one of SECTION_ROUTES, SUB_ROUTES, or UNNARRATED_ROUTES", () => {
    const manifestIds = listRouteIds();
    const mapped = allMappedRoutes();
    const unmapped = manifestIds.filter((id) => !mapped.has(id));
    expect(unmapped).toEqual([]);
  });

  it("every mapped route ID exists in the manifest (no stale references)", () => {
    const manifestSet = new Set(listRouteIds());
    const mapped = allMappedRoutes();
    const stale = [...mapped].filter((id) => !manifestSet.has(id));
    expect(stale).toEqual([]);
  });
});

// -----------------------------------------------------------------------
// Route mapping structure
// -----------------------------------------------------------------------

describe("route mapping structure", () => {
  it("every SUB_ROUTES key resolves via getSub", () => {
    for (const compositeKey of Object.keys(SUB_ROUTES)) {
      const slashIdx = compositeKey.indexOf("/");
      const sectionId = compositeKey.slice(0, slashIdx);
      const subSlug = compositeKey.slice(slashIdx + 1);
      expect(getSub(sectionId, subSlug)).toBeDefined();
    }
  });

  it("every SUB_ROUTES value is a subset of its section's SECTION_ROUTES", () => {
    for (const [compositeKey, subRoutes] of Object.entries(SUB_ROUTES)) {
      const sectionId = compositeKey.slice(
        0,
        compositeKey.indexOf("/"),
      ) as keyof typeof SECTION_ROUTES;
      const sectionRoutes = new Set(SECTION_ROUTES[sectionId]);
      for (const route of subRoutes) {
        expect(sectionRoutes.has(route)).toBe(true);
      }
    }
  });

  it("UNNARRATED_ROUTES ids appear in no SECTION_ROUTES or SUB_ROUTES array", () => {
    const narrated = new Set<string>();
    for (const routes of Object.values(SECTION_ROUTES)) {
      for (const r of routes) narrated.add(r);
    }
    for (const routes of Object.values(SUB_ROUTES)) {
      for (const r of routes) narrated.add(r);
    }
    for (const unnarrated of UNNARRATED_ROUTES) {
      expect(narrated.has(unnarrated)).toBe(false);
    }
  });
});

// -----------------------------------------------------------------------
// sectionForRoute
// -----------------------------------------------------------------------

describe("sectionForRoute", () => {
  it("resolves /(app)/tickets/[id] to the ticket-detail section", () => {
    const result = sectionForRoute("/(app)/tickets/[id]");
    expect(result).toEqual({ sectionId: "ticket-detail", subSlug: null });
  });

  it("resolves /(app)/admin/people to admin/people-queues sub", () => {
    const result = sectionForRoute("/(app)/admin/people");
    expect(result).toEqual({ sectionId: "admin", subSlug: "people-queues" });
  });

  it("resolves /(app) to dashboard with null sub", () => {
    const result = sectionForRoute("/(app)");
    expect(result).toEqual({ sectionId: "dashboard", subSlug: null });
  });

  it("returns null for the catch-all not-found route", () => {
    expect(sectionForRoute("/(app)/[...path]")).toBeNull();
  });

  it("returns null for an unknown route ID", () => {
    expect(sectionForRoute("/(app)/nonexistent")).toBeNull();
  });

  it("resolves /(app)/library/[articleId] to library/vote sub", () => {
    const result = sectionForRoute("/(app)/library/[articleId]");
    expect(result).toEqual({ sectionId: "library", subSlug: "vote" });
  });

  it("resolves /(app)/library/new to library/editor sub", () => {
    const result = sectionForRoute("/(app)/library/new");
    expect(result).toEqual({ sectionId: "library", subSlug: "editor" });
  });

  it("resolves /(app)/library/[articleId]/edit to library/editor sub", () => {
    const result = sectionForRoute("/(app)/library/[articleId]/edit");
    expect(result).toEqual({ sectionId: "library", subSlug: "editor" });
  });
});

// -----------------------------------------------------------------------
// slugForRoute / routeForSlug
// -----------------------------------------------------------------------

describe("slugForRoute", () => {
  it("strips the (app) group and joins remaining segments", () => {
    expect(slugForRoute("/(app)/reports")).toBe("reports");
  });

  it("removes brackets from param segments", () => {
    expect(slugForRoute("/(app)/a/[x]")).toBe("a-x");
  });

  it("handles multi-segment paths", () => {
    expect(slugForRoute("/(app)/more/settings")).toBe("more-settings");
  });

  it("handles ticket detail param route", () => {
    expect(slugForRoute("/(app)/tickets/[id]")).toBe("tickets-id");
  });

  it("handles deeply nested param route", () => {
    expect(slugForRoute("/(app)/library/[articleId]/edit")).toBe(
      "library-articleId-edit",
    );
  });

  it("strips rest-param dots", () => {
    expect(slugForRoute("/(app)/[...path]")).toBe("path");
  });

  it("round-trips every manifest route to a non-empty slug", () => {
    for (const rid of listRouteIds()) {
      const slug = slugForRoute(rid);
      expect(slug.length).toBeGreaterThan(0);
    }
  });
});

describe("routeForSlug", () => {
  it("returns the first unmapped route whose slug matches", () => {
    // The catch-all is unnarrated, so its slug should resolve.
    const slug = slugForRoute("/(app)/[...path]");
    const result = routeForSlug(slug, listRouteIds());
    expect(result).toBe("/(app)/[...path]");
  });

  it("returns null when the slug matches a mapped (narrated) route", () => {
    // "/(app)/tickets" is narrated. Its slug should not resolve through
    // routeForSlug because that function filters to unmapped only.
    const slug = slugForRoute("/(app)/tickets");
    const result = routeForSlug(slug, listRouteIds());
    expect(result).toBeNull();
  });

  it("returns null for a slug that matches no route", () => {
    expect(routeForSlug("nonexistent-page", listRouteIds())).toBeNull();
  });
});

// -----------------------------------------------------------------------
// coming-soon: bridgeStateToLocation
// -----------------------------------------------------------------------

describe("bridgeStateToLocation (coming-soon)", () => {
  it("maps feature other with an unmapped routeId to coming-soon", () => {
    const loc = bridgeStateToLocation(
      "other",
      null,
      false,
      null,
      null,
      "/(app)/[...path]",
    );
    expect(loc.sectionId).toBe("coming-soon");
    expect(loc.subSlug).toBe(slugForRoute("/(app)/[...path]"));
  });

  it("does not yield coming-soon for a MAPPED routeId", () => {
    const loc = bridgeStateToLocation(
      "tickets",
      null,
      false,
      null,
      null,
      "/(app)/tickets",
    );
    expect(loc.sectionId).toBe("tickets");
  });
});

// -----------------------------------------------------------------------
// coming-soon: sectionMatchesPhone
// -----------------------------------------------------------------------

describe("sectionMatchesPhone (coming-soon)", () => {
  it("matches when the routeId is unmapped and the slug equals the subSlug", () => {
    const rid = "/(app)/[...path]";
    const slug = slugForRoute(rid);
    expect(
      sectionMatchesPhone("coming-soon", "other", null, false, rid, slug),
    ).toBe(true);
  });

  it("does not match when the routeId is mapped (narrated)", () => {
    const rid = "/(app)/tickets";
    const slug = slugForRoute(rid);
    expect(
      sectionMatchesPhone("coming-soon", "other", null, false, rid, slug),
    ).toBe(false);
  });

  it("does not match when routeId is null", () => {
    expect(
      sectionMatchesPhone("coming-soon", "other", null, false, null, "path"),
    ).toBe(false);
  });

  it("does not match when the slug does not correspond to the routeId", () => {
    const rid = "/(app)/[...path]";
    expect(
      sectionMatchesPhone("coming-soon", "other", null, false, rid, "wrong"),
    ).toBe(false);
  });
});

// -----------------------------------------------------------------------
// coming-soon: resolvePhoneCommand
// -----------------------------------------------------------------------

describe("resolvePhoneCommand (coming-soon)", () => {
  const TICKET_ID = "test-ticket-id";
  const ARTICLE_ID = "test-article-id";

  it("resolves coming-soon to feature other with routeSlug", () => {
    const cmd = resolvePhoneCommand(
      "coming-soon",
      "reports",
      TICKET_ID,
      ARTICLE_ID,
    );
    expect(cmd.feature).toBe("other");
    expect(cmd.routeSlug).toBe("reports");
    expect(cmd.pulseTopic).toBeNull();
    expect(cmd.loginTarget).toBeNull();
  });

  it("narrated sections have null routeSlug", () => {
    const cmd = resolvePhoneCommand("tickets", "sort", TICKET_ID, ARTICLE_ID);
    expect(cmd.routeSlug).toBeNull();
  });
});

describe("ENTRY_SECTION", () => {
  it("is not in SECTIONS", () => {
    expect(SECTIONS).not.toContain(ENTRY_SECTION);
    expect(SECTIONS.some((s) => s === ENTRY_SECTION)).toBe(false);
  });

  it("every sub has topic: null", () => {
    for (const sub of ENTRY_SECTION.subs) {
      expect(sub.topic).toBeNull();
    }
  });
});

// -----------------------------------------------------------------------
// pathnameForRouteId
// -----------------------------------------------------------------------

describe("pathnameForRouteId", () => {
  it("strips the (app) group segment", () => {
    expect(pathnameForRouteId("/(app)/tickets")).toBe("/tickets");
  });

  it("strips nested group segments", () => {
    expect(pathnameForRouteId("/(app)/(auth)/login")).toBe("/login");
  });

  it("returns / for a bare group route", () => {
    expect(pathnameForRouteId("/(app)")).toBe("/");
  });

  it("preserves non-group segments including params", () => {
    expect(pathnameForRouteId("/(app)/tickets/[id]")).toBe("/tickets/[id]");
  });

  it("agrees with the slug builder's group stripping", () => {
    // pathnameForRouteId and slugForRoute both strip group segments;
    // slugForRoute also strips brackets and joins with dashes.
    const rid = "/(app)/library/[articleId]/edit";
    const pathname = pathnameForRouteId(rid);
    expect(pathname).toBe("/library/[articleId]/edit");
  });
});
