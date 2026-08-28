// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/svelte";
import { LogOut } from "@lucide/svelte";
import ClientDrawer from "./ClientDrawer.svelte";
import type { ClientDrawerAction } from "./context.js";

const { mockGoto } = vi.hoisted(() => ({ mockGoto: vi.fn() }));

// vi.mock required: $app/navigation is a SvelteKit virtual module with no
// on-disk source. The Vite alias resolves it to a stub; this overrides goto
// so the privacy entry's navigation is observable.
vi.mock("$app/navigation", async (importOriginal) => ({
  ...(await importOriginal()),
  goto: mockGoto,
}));

vi.mock("$app/paths", async (importOriginal) => ({
  ...(await importOriginal()),
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
      locale: "en",
      onlocalechange: vi.fn(),
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

  it("reports the chosen locale through onlocalechange", async () => {
    const onlocalechange = vi.fn();
    const { container } = renderDrawer({ onlocalechange });

    const select = container.querySelector("select") as HTMLSelectElement;
    await fireEvent.change(select, { target: { value: "es" } });

    expect(onlocalechange).toHaveBeenCalledWith("es");
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
