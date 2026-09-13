// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/svelte";
import { LogOut } from "@lucide/svelte";
import ClientDrawer from "./ClientDrawer.svelte";
import type { ClientDrawerAction } from "./context.js";
import type * as PathsNS from "$app/paths";
import type * as NavigationNS from "$app/navigation";

const { mockGoto } = vi.hoisted(() => ({ mockGoto: vi.fn() }));

// vi.mock required: $app/navigation is a SvelteKit virtual module with no
// on-disk source. The Vite alias resolves it to a stub; this overrides goto
// so the privacy entry's navigation is observable.
vi.mock("$app/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof NavigationNS>()),
  goto: mockGoto,
}));

vi.mock("$app/paths", async (importOriginal) => ({
  ...(await importOriginal<typeof PathsNS>()),
  resolve: (path: string) => path,
}));

// jsdom lacks the Web Animations API that Konsta transitions call.
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

function renderDrawer(overrides: Record<string, unknown> = {}) {
  return render(ClientDrawer, {
    props: {
      opened: true,
      ondismiss: vi.fn(),
      actions: [] as readonly ClientDrawerAction[],
      logoUrl: null,
      orgName: "Safe Harbor",
      ...overrides,
    },
  });
}

describe("ClientDrawer", () => {
  afterEach(() => {
    cleanup();
    mockGoto.mockClear();
  });

  it("renders the page actions it is given", () => {
    const { container } = renderDrawer({
      actions: [
        { id: "upgrade", label: "Add a password", onclick: vi.fn() },
        { id: "settings", label: "Account settings", onclick: vi.fn() },
      ],
    });

    expect(
      container.querySelector("[data-testid='drawer-action-upgrade']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='drawer-action-settings']"),
    ).toBeTruthy();
  });

  it("runs an action and closes the drawer when one is tapped", async () => {
    const onclick = vi.fn();
    const ondismiss = vi.fn();
    const { container } = renderDrawer({
      ondismiss,
      actions: [{ id: "upgrade", label: "Add a password", onclick }],
    });

    const item = container.querySelector(
      "[data-testid='drawer-action-upgrade']",
    ) as HTMLElement;
    await fireEvent.click(item);

    expect(onclick).toHaveBeenCalledOnce();
    expect(ondismiss).toHaveBeenCalledOnce();
  });

  it("navigates to the privacy notice and closes the drawer", async () => {
    const ondismiss = vi.fn();
    const { container } = renderDrawer({ ondismiss });

    const privacy = container.querySelector(
      "[data-testid='drawer-privacy']",
    ) as HTMLElement;
    await fireEvent.click(privacy);

    expect(mockGoto).toHaveBeenCalledWith("/intake/privacy");
    expect(ondismiss).toHaveBeenCalledOnce();
  });

  // The picker used to sit in this footer while the org app, the
  // onboarding layout, and the login page all put it in the navbar. It
  // lives in the navbar now, so it must not be here.
  it("holds no language picker", () => {
    const { container } = renderDrawer();
    expect(container.querySelector("select")).toBeNull();
  });

  describe("identity header", () => {
    it("renders the org logo when the org has one", () => {
      const { container } = renderDrawer({
        logoUrl: "/api/branding/safe-harbor/icon.png",
      });

      const logo = container.querySelector(".panel-avatar-logo");
      expect(logo?.getAttribute("src")).toBe(
        "/api/branding/safe-harbor/icon.png",
      );
      expect(logo?.getAttribute("alt")).toBe("");
    });

    it("falls back to the org's initials when it has no logo", () => {
      const { container } = renderDrawer({ orgName: "Safe Harbor" });

      const avatar = container.querySelector(".panel-avatar");
      expect(avatar?.querySelector("img")).toBeNull();
      expect(avatar?.textContent.trim()).toBe("SH");
    });

    it("falls back to an icon before the org name arrives", () => {
      const { container } = renderDrawer({ orgName: "", orgNamePending: true });

      const avatar = container.querySelector(".panel-avatar");
      expect(avatar?.textContent.trim()).toBe("");
      expect(avatar?.querySelector("svg")).toBeTruthy();
    });

    it("names the org so a client can confirm who they are talking to", () => {
      const { container } = renderDrawer({ orgName: "Harbor Line" });
      expect(container.querySelector(".panel-name")?.textContent).toContain(
        "Harbor Line",
      );
    });

    it("falls back to initials when the logo image fails to load", async () => {
      const { container } = renderDrawer({
        logoUrl: "/api/branding/test/icon-192.png",
        orgName: "Safe Harbor",
      });

      const logo = container.querySelector(
        ".panel-avatar-logo",
      ) as HTMLImageElement;
      expect(logo).toBeTruthy();

      await fireEvent.error(logo);

      expect(container.querySelector(".panel-avatar-logo")).toBeNull();
      const avatar = container.querySelector(".panel-avatar");
      expect(avatar?.textContent.trim()).toBe("SH");
    });
  });

  it("gives a destructive action the danger treatment", () => {
    const { container } = renderDrawer({
      actions: [
        {
          id: "logout",
          label: "Sign out",
          icon: LogOut,
          destructive: true,
          onclick: vi.fn(),
        },
      ],
    });

    const item = container.querySelector(
      "[data-testid='drawer-action-logout']",
    );
    expect(item?.querySelector(".drawer-icon--destructive")).toBeTruthy();
  });

  it("drops the privacy entry while on the privacy notice itself", async () => {
    const appState = await import("$app/state");
    const original = appState.page.url;
    // defineProperty rather than assignment: SvelteKit types page.url with a
    // route-literal pathname union that a plain URL does not satisfy.
    const setUrl = (url: URL): void => {
      Object.defineProperty(appState.page, "url", {
        value: url,
        configurable: true,
        writable: true,
      });
    };
    setUrl(new URL("http://localhost/intake/privacy"));

    try {
      const { container } = renderDrawer();
      expect(
        container.querySelector("[data-testid='drawer-privacy']"),
      ).toBeNull();
    } finally {
      setUrl(original);
    }
  });

  describe("appearance toggle", () => {
    it("switches the color scheme in place without closing the drawer", async () => {
      const ondismiss = vi.fn();
      const { container } = renderDrawer({ ondismiss });

      const toggle = container.querySelector(
        "[data-testid='drawer-theme-toggle']",
      ) as HTMLElement;
      expect(toggle).toBeTruthy();

      const before = document.documentElement.classList.contains("dark");
      await fireEvent.click(toggle);

      expect(document.documentElement.classList.contains("dark")).toBe(!before);
      expect(ondismiss).not.toHaveBeenCalled();

      // Restore so the singleton store does not leak scheme state.
      await fireEvent.click(toggle);
      expect(document.documentElement.classList.contains("dark")).toBe(before);
    });
  });

  it("does not render its contents while closed", () => {
    const { container } = renderDrawer({
      opened: false,
      actions: [{ id: "upgrade", label: "Add a password", onclick: vi.fn() }],
    });

    expect(
      container.querySelector("[data-testid='drawer-action-upgrade']"),
    ).toBeNull();
  });
});
