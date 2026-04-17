// @vitest-environment jsdom
/**
 * People page behavior tests.
 *
 * Tests tab switching, deep-link URL handling, permission-based segment
 * visibility, and autoAction passthrough.
 *
 * Note: Konsta SegmentedButton renders <button role="button"> internally,
 * overriding any role="tab" prop (H-011 ARIA gap). Tests query by
 * role="button" to match actual rendered output. The tablist wrapper and
 * tabpanel associations (aria-controls, aria-labelledby) are ours and
 * work correctly.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

// --- Controllable mock state ---

let mockPermissions = new Set<string>();

let mockPageUrl = new URL("http://localhost/admin/people");

const mockGoto = vi.fn();

// --- Mocks ---

vi.mock("$app/state", () => ({
  get page() {
    return {
      url: mockPageUrl,
      params: {},
    };
  },
}));

vi.mock("$app/navigation", () => ({
  goto: mockGoto,
  onNavigate: vi.fn(),
}));

vi.mock("$app/paths", () => ({
  resolve: (path: string) => path,
  base: "",
  assets: "",
}));

vi.mock("$lib/crypto/context.js", () => ({
  getCurrentPermissions: () => () => mockPermissions,
}));

const mockNavbarCtx = { current: undefined as unknown };

vi.mock("$lib/shell/context.js", () => ({
  getNavbarOverrideCtx: () => mockNavbarCtx,
}));

vi.mock("$lib/paraglide/messages.js", () => ({
  admin_people_title: () => "People",
  admin_tab_users: () => "Users",
  admin_tab_queues: () => "Queues",
  admin_users_placeholder: () => "User management loading...",
  admin_queues_placeholder: () => "Queue management loading...",
}));

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

// --- Helpers ---

function setPermissions(...perms: string[]): void {
  mockPermissions = new Set(perms);
}

function setUrl(path: string): void {
  mockPageUrl = new URL(`http://localhost${path}`);
}

function getSegmentButton(name: string): HTMLElement {
  return screen.getByRole("button", { name });
}

function querySegmentButton(name: string): HTMLElement | null {
  return screen.queryByRole("button", { name });
}

// --- Setup ---

beforeEach(() => {
  mockPermissions = new Set(["manage_users", "manage_queues"]);
  mockPageUrl = new URL("http://localhost/admin/people");
  mockNavbarCtx.current = undefined;
  mockGoto.mockClear();
});

afterEach(cleanup);

const PageModule = await import("./+page.svelte");

// --- Tests ---

describe("People page", () => {
  describe("segment visibility by permission", () => {
    it("renders both segment buttons when user has both permissions", () => {
      setPermissions("manage_users", "manage_queues");
      render(PageModule.default);

      expect(getSegmentButton("Users")).toBeTruthy();
      expect(getSegmentButton("Queues")).toBeTruthy();
    });

    it("renders only Users segment when user lacks MANAGE_QUEUES", () => {
      setPermissions("manage_users");
      render(PageModule.default);

      expect(getSegmentButton("Users")).toBeTruthy();
      expect(querySegmentButton("Queues")).toBeNull();
    });

    it("renders only Queues segment when user lacks MANAGE_USERS", () => {
      setPermissions("manage_queues");
      render(PageModule.default);

      expect(querySegmentButton("Users")).toBeNull();
      expect(getSegmentButton("Queues")).toBeTruthy();
    });
  });

  describe("tab switching", () => {
    it("shows Users section by default when user has MANAGE_USERS", () => {
      setPermissions("manage_users", "manage_queues");
      render(PageModule.default);

      const usersBtn = getSegmentButton("Users");
      expect(usersBtn.getAttribute("aria-selected")).toBe("true");
      expect(screen.getByText("User management loading...")).toBeTruthy();
    });

    it("switches to Queues section on segment click", async () => {
      setPermissions("manage_users", "manage_queues");
      render(PageModule.default);

      await fireEvent.click(getSegmentButton("Queues"));

      expect(getSegmentButton("Queues").getAttribute("aria-selected")).toBe(
        "true",
      );
      expect(getSegmentButton("Users").getAttribute("aria-selected")).toBe(
        "false",
      );
      expect(screen.getByText("Queue management loading...")).toBeTruthy();
      expect(screen.queryByText("User management loading...")).toBeNull();
    });

    it("switches back to Users section on segment click", async () => {
      setPermissions("manage_users", "manage_queues");
      render(PageModule.default);

      await fireEvent.click(getSegmentButton("Queues"));
      await fireEvent.click(getSegmentButton("Users"));

      expect(getSegmentButton("Users").getAttribute("aria-selected")).toBe(
        "true",
      );
      expect(screen.getByText("User management loading...")).toBeTruthy();
    });
  });

  describe("deep-link via URL params", () => {
    it("opens Queues section when URL has ?tab=queues", () => {
      setPermissions("manage_users", "manage_queues");
      setUrl("/admin/people?tab=queues");
      render(PageModule.default);

      expect(getSegmentButton("Queues").getAttribute("aria-selected")).toBe(
        "true",
      );
      expect(screen.getByText("Queue management loading...")).toBeTruthy();
    });

    it("ignores invalid tab param and defaults to Users", () => {
      setPermissions("manage_users", "manage_queues");
      setUrl("/admin/people?tab=invalid");
      render(PageModule.default);

      expect(getSegmentButton("Users").getAttribute("aria-selected")).toBe(
        "true",
      );
    });

    it("defaults to Queues when user only has MANAGE_QUEUES and no tab param", () => {
      setPermissions("manage_queues");
      setUrl("/admin/people");
      render(PageModule.default);

      expect(screen.getByText("Queue management loading...")).toBeTruthy();
    });
  });

  describe("permission guard", () => {
    it("redirects to home when user has neither permission", () => {
      setPermissions();
      render(PageModule.default);

      expect(mockGoto).toHaveBeenCalledWith("/");
    });
  });

  describe("navbar override", () => {
    it("sets navbar title to People on mount", () => {
      setPermissions("manage_users", "manage_queues");
      render(PageModule.default);

      expect(mockNavbarCtx.current).toEqual({ title: "People" });
    });
  });

  describe("ARIA structure", () => {
    it("wraps segments in a labeled tablist", () => {
      setPermissions("manage_users", "manage_queues");
      render(PageModule.default);

      const tablist = screen.getByRole("tablist");
      expect(tablist.getAttribute("aria-label")).toBe("People");
    });

    it("associates segment button with tabpanel via aria-controls", () => {
      setPermissions("manage_users", "manage_queues");
      render(PageModule.default);

      const usersBtn = getSegmentButton("Users");
      expect(usersBtn.getAttribute("aria-controls")).toBe("panel-users");
      expect(usersBtn.id).toBe("tab-users");

      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-users");
      expect(panel.getAttribute("aria-labelledby")).toBe("tab-users");
    });

    it("switches tabpanel association when tab changes", async () => {
      setPermissions("manage_users", "manage_queues");
      render(PageModule.default);

      await fireEvent.click(getSegmentButton("Queues"));

      const panel = screen.getByRole("tabpanel");
      expect(panel.id).toBe("panel-queues");
      expect(panel.getAttribute("aria-labelledby")).toBe("tab-queues");
    });
  });
});
