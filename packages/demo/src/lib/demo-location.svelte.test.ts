import { describe, it, expect, vi } from "vitest";
import { createDemoLocationStore } from "./demo-location.svelte.js";
import type { PhoneScreenState } from "./demo-location.svelte.js";
import type { PhoneCommand } from "./scroll-sections.js";
import type { DemoFeature, DemoDetail, LoginStage } from "./bridge.js";

/** Mutable phone screen state the fake driver can move. */
interface FakePhone {
  feature: DemoFeature;
  detail: DemoDetail;
  searchOpen: boolean;
  loginStage: LoginStage | null;
  routeId: string | null;
}

/**
 * Harness with a controllable ensureScreen driver: commands are
 * recorded, and each chain stays pending until the test settles it.
 */
function createHarness(initial?: Partial<FakePhone>) {
  const phone: FakePhone = {
    feature: "login",
    detail: null,
    searchOpen: false,
    loginStage: "form",
    routeId: null,
    ...initial,
  };

  const commands: PhoneCommand[] = [];
  const chainResolvers: Array<() => void> = [];

  const ensureScreen = vi.fn((cmd: PhoneCommand): Promise<void> => {
    commands.push(cmd);
    return new Promise<void>((resolve) => {
      chainResolvers.push(resolve);
    });
  });

  // Settled by default so existing convergence tests exercise the
  // correction path; boot-window tests flip it to false.
  const boot = { settled: true };

  const store = createDemoLocationStore({
    getPhone: (): PhoneScreenState => ({
      feature: phone.feature,
      detail: phone.detail,
      searchOpen: phone.searchOpen,
      loginStage: phone.loginStage,
      routeId: phone.routeId,
    }),
    ensureScreen,
    getTicketDetailId: () => "tk-0001",
    getArticleDetailId: () => "kb-0001",
    isBootSettled: () => boot.settled,
  });

  /** Resolve every pending chain and flush the .finally continuations. */
  async function settleChain(): Promise<void> {
    for (const resolve of chainResolvers.splice(0)) {
      resolve();
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }

  return { store, phone, commands, settleChain, boot };
}

describe("DemoLocationStore", () => {
  describe("initial state", () => {
    it("starts at the login section with origin init", () => {
      const { store } = createHarness();
      expect(store.location).toEqual({ sectionId: "login", subSlug: null });
      expect(store.origin).toBe("init");
      expect(store.locationSeq).toBe(0);
      expect(store.topic).toBeNull();
    });
  });

  describe("setLocation (page intents)", () => {
    it("commits the location immediately and drives the phone", () => {
      const { store, commands } = createHarness();
      store.setLocation("tickets", "filters", "page-click");

      expect(store.location).toEqual({
        sectionId: "tickets",
        subSlug: "filters",
      });
      expect(store.origin).toBe("page-click");
      expect(store.locationSeq).toBe(1);
      expect(commands).toHaveLength(1);
      expect(commands.at(0)?.feature).toBe("tickets");
      expect(commands.at(0)?.pulseTopic).toBe("filters");
    });

    it("keeps the chosen sub when the chain reaches the section", async () => {
      const { store, phone, settleChain } = createHarness();
      store.setLocation("tickets", "view-modes", "page-scroll");
      phone.feature = "tickets";
      phone.loginStage = null;
      await settleChain();

      // Sub granularity finer than the phone screen stays page-owned
      expect(store.location).toEqual({
        sectionId: "tickets",
        subSlug: "view-modes",
      });
      expect(store.origin).toBe("page-scroll");
    });

    it("snaps to the phone when both the chain and force fail to converge", async () => {
      const { store, settleChain } = createHarness();
      store.setLocation("tickets", "sort", "page-click");
      // Phone never leaves the login form. First ensureScreen attempt:
      await settleChain();
      // Force retry (second ensureScreen), still no convergence:
      await settleChain();

      expect(store.location).toEqual({ sectionId: "login", subSlug: null });
      expect(store.origin).toBe("phone-correction");
    });

    it("never corrects while the background login has not settled", async () => {
      const { store, settleChain, boot } = createHarness();
      boot.settled = false;

      // A deep link lands while the phone is still keying behind the
      // boot splash. The phone never leaves the login form, but the
      // linked location must stand: correcting would yank the visitor
      // to the login section for no visible reason.
      store.setLocation("dashboard", null, "deep-link");
      await settleChain();
      await settleChain();

      expect(store.location).toEqual({
        sectionId: "dashboard",
        subSlug: null,
      });
      expect(store.origin).toBe("deep-link");
    });

    it("corrects again once the background login settles", async () => {
      const { store, settleChain, boot } = createHarness();
      boot.settled = false;
      store.setLocation("dashboard", null, "deep-link");
      await settleChain();
      await settleChain();

      // Background login lands; PhoneApp re-selects the standing
      // location. The phone STILL failing to converge now corrects.
      boot.settled = true;
      store.setLocation("dashboard", null, "deep-link");
      await settleChain();
      await settleChain();

      expect(store.origin).toBe("phone-correction");
    });

    it("uses phone-correction origin when convergence fails after force", async () => {
      const { store, settleChain, commands } = createHarness();
      store.setLocation("library", "vote", "page-click");
      // First ensureScreen (initial attempt), phone stays on login:
      await settleChain();
      // Second ensureScreen (force retry), phone still on login:
      await settleChain();

      expect(store.origin).toBe("phone-correction");
      // Both the initial attempt and the force retry called ensureScreen
      expect(commands).toHaveLength(2);
    });

    it("does not correct when forcing succeeds", async () => {
      const { store, phone, settleChain, commands } = createHarness();
      store.setLocation("tickets", "sort", "page-click");
      // First ensureScreen fails to converge (phone still on login):
      await settleChain();
      // Before the force retry resolves, move the phone to tickets
      // to simulate the second attempt succeeding:
      phone.feature = "tickets";
      phone.detail = null;
      phone.loginStage = null;
      await settleChain();

      // The location stays at the page-requested value, no correction
      expect(store.location).toEqual({
        sectionId: "tickets",
        subSlug: "sort",
      });
      expect(store.origin).toBe("page-click");
      // Two ensureScreen calls total (initial + force)
      expect(commands).toHaveLength(2);
    });

    it("re-selecting the current location bumps the seq and re-drives", () => {
      const { store, commands } = createHarness();
      store.setLocation("login", "totp", "page-click");
      store.setLocation("login", "totp", "page-click");

      expect(store.locationSeq).toBe(2);
      expect(commands).toHaveLength(2);
    });

    it("a superseded chain's convergence check does not fire", async () => {
      const { store, phone, settleChain } = createHarness();
      store.setLocation("tickets", "sort", "page-click");
      // A newer intent supersedes before the first chain settles
      store.setLocation("ticket-detail", "reply", "page-click");
      phone.feature = "tickets";
      phone.detail = "tk-0001";
      phone.loginStage = null;
      await settleChain();

      expect(store.location).toEqual({
        sectionId: "ticket-detail",
        subSlug: "reply",
      });
    });
  });

  describe("notePhoneChange (phone-originated adoption)", () => {
    it("adopts the phone's screen when it changes", () => {
      const { store, phone } = createHarness();
      phone.feature = "tickets";
      phone.detail = "tk-0001";
      phone.loginStage = null;
      store.notePhoneChange();

      expect(store.location).toEqual({
        sectionId: "ticket-detail",
        subSlug: null,
      });
      expect(store.origin).toBe("phone");
    });

    it("follows manual login stage advances", () => {
      const { store, phone } = createHarness();
      phone.loginStage = "twofa-picker";
      store.notePhoneChange();

      expect(store.location).toEqual({
        sectionId: "login",
        subSlug: "two-factor",
      });
    });

    it("does nothing when the phone still maps to the current location", () => {
      const { store } = createHarness();
      // The resting login form maps to login/null, the initial location
      store.notePhoneChange();
      expect(store.locationSeq).toBe(0);
      expect(store.origin).toBe("init");
    });

    it("defers adoption while a page intent is reconciling", async () => {
      const { store, phone, settleChain } = createHarness();
      store.setLocation("ticket-detail", "notes", "page-click");

      // Phone passes through the list on its way to the detail
      phone.feature = "tickets";
      phone.detail = null;
      phone.loginStage = null;
      store.notePhoneChange();
      expect(store.location).toEqual({
        sectionId: "ticket-detail",
        subSlug: "notes",
      });

      phone.detail = "tk-0001";
      await settleChain();
      expect(store.location).toEqual({
        sectionId: "ticket-detail",
        subSlug: "notes",
      });
    });
  });

  describe("reportTopic", () => {
    it("moves the location to the topic's sub-section", () => {
      const { store } = createHarness({
        feature: "tickets",
        loginStage: null,
      });
      store.reportTopic("sort");

      expect(store.topic).toBe("sort");
      expect(store.location).toEqual({ sectionId: "tickets", subSlug: "sort" });
      expect(store.origin).toBe("phone");
    });

    it("defers adoption while a page intent is reconciling", () => {
      const { store } = createHarness({
        feature: "tickets",
        loginStage: null,
      });
      store.setLocation("tickets", "filters", "page-click");
      store.reportTopic("filters");

      // The synthetic pulse tap's own topic must not disturb the pin
      expect(store.location).toEqual({
        sectionId: "tickets",
        subSlug: "filters",
      });
      expect(store.origin).toBe("page-click");
    });
  });

  describe("topic staleness", () => {
    it("clears a topic when its screen family is left", () => {
      const { store, phone } = createHarness({
        feature: "tickets",
        loginStage: null,
      });
      store.reportTopic("sort");

      phone.searchOpen = true;
      store.notePhoneChange();

      expect(store.topic).toBeNull();
      expect(store.location).toEqual({
        sectionId: "search",
        subSlug: "overlay",
      });
    });

    it("clears a login topic when the stage moves past its screen", () => {
      const { store, phone } = createHarness();
      store.reportTopic("credentials");
      expect(store.location).toEqual({
        sectionId: "login",
        subSlug: "credentials",
      });

      phone.loginStage = "twofa-picker";
      store.notePhoneChange();

      expect(store.topic).toBeNull();
      expect(store.location).toEqual({
        sectionId: "login",
        subSlug: "two-factor",
      });
    });

    it("keeps a method topic while its method screen is open", () => {
      const { store, phone } = createHarness({ loginStage: "twofa-picker" });
      store.reportTopic("twofa-totp");
      expect(store.location).toEqual({ sectionId: "login", subSlug: "totp" });

      phone.loginStage = "twofa-method";
      store.notePhoneChange();

      expect(store.topic).toBe("twofa-totp");
      expect(store.location).toEqual({ sectionId: "login", subSlug: "totp" });
    });
  });

  describe("cancelChains (trusted taps)", () => {
    it("unpins a pending intent so phone changes adopt immediately", () => {
      const { store, phone } = createHarness();
      store.setLocation("ticket-detail", "reply", "page-click");

      store.cancelChains();
      phone.feature = "tickets";
      phone.detail = null;
      phone.loginStage = null;
      store.notePhoneChange();

      expect(store.location).toEqual({ sectionId: "tickets", subSlug: null });
      expect(store.origin).toBe("phone");
    });

    it("a cancelled chain's convergence check does not snap", async () => {
      const { store, phone, settleChain } = createHarness();
      store.setLocation("ticket-detail", "reply", "page-click");
      store.cancelChains();

      phone.feature = "tickets";
      phone.detail = null;
      phone.loginStage = null;
      store.notePhoneChange();
      const after = store.location;

      await settleChain();
      expect(store.location).toEqual(after);
    });

    it("marks earlier chain tokens stale", () => {
      const { store } = createHarness();
      store.setLocation("tickets", null, "page-click");
      const superseded = store.cancelChains() - 1;

      expect(store.isStale(superseded)).toBe(true);
      expect(store.isStale(store.cancelChains())).toBe(false);
    });
  });

  describe("coming-soon (phone routeId flows through)", () => {
    it("adopts coming-soon when the phone shows an unmapped route", () => {
      const { store } = createHarness({
        feature: "other",
        loginStage: null,
        routeId: "/(app)/[...path]",
      });
      store.notePhoneChange();

      expect(store.location.sectionId).toBe("coming-soon");
      expect(store.location.subSlug).toBe("path");
    });

    it("does not adopt coming-soon for a mapped route", () => {
      const { store } = createHarness({
        feature: "tickets",
        loginStage: null,
        routeId: "/(app)/tickets",
      });
      store.notePhoneChange();

      expect(store.location.sectionId).toBe("tickets");
    });
  });
});
