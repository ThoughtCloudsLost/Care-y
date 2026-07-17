// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import TabbarNav from "./TabbarNav.svelte";

afterEach(() => {
  cleanup();
});

function renderNav(
  overrides: Partial<{
    activeTab: "home" | "tickets" | "library" | null;
    activeArea: "admin" | "settings" | "schedule" | null;
  }> = {},
): { tablist: HTMLElement } {
  render(TabbarNav, {
    props: {
      activeTab: overrides.activeTab ?? "home",
      activeArea: overrides.activeArea ?? null,
      ontabchange: vi.fn(),
      onareatap: vi.fn(),
    },
  });
  const tablist = document.querySelector('[role="tablist"]');
  if (!(tablist instanceof HTMLElement)) {
    throw new Error("tablist not rendered");
  }
  return { tablist };
}

describe("TabbarNav", () => {
  it("renders 3 tabs when no area is active", () => {
    const { tablist } = renderNav();
    const tabs = tablist.querySelectorAll('[role="tab"]');
    expect(tabs).toHaveLength(3);
  });

  it("marks only the active tab as selected", () => {
    const { tablist } = renderNav({ activeTab: "tickets" });
    const tabs = tablist.querySelectorAll('[role="tab"]');
    const selected = Array.from(tabs).filter(
      (t) => t.getAttribute("aria-selected") === "true",
    );
    expect(selected).toHaveLength(1);
    expect(selected[0]?.getAttribute("aria-label")).toContain("Tickets");
  });

  it("deselects all tabs when an area is active", () => {
    const { tablist } = renderNav({ activeTab: null, activeArea: "admin" });
    const tabs = tablist.querySelectorAll('[role="tab"]');
    const mainTabs = Array.from(tabs).slice(0, 3);
    const mainSelected = mainTabs.filter(
      (t) => t.getAttribute("aria-selected") === "true",
    );
    expect(mainSelected).toHaveLength(0);
  });

  it("renders 4 tabs when an area is active (3 + area pill)", () => {
    const { tablist } = renderNav({ activeTab: null, activeArea: "admin" });
    const tabs = tablist.querySelectorAll('[role="tab"]');
    expect(tabs).toHaveLength(4);
  });

  it("does not render the area pill when on a tab page", () => {
    const { tablist } = renderNav({ activeTab: "home", activeArea: null });
    const tabs = tablist.querySelectorAll('[role="tab"]');
    expect(tabs).toHaveLength(3);
  });

  it("area pill has aria-selected=true", () => {
    const { tablist } = renderNav({ activeTab: null, activeArea: "settings" });
    const tabs = tablist.querySelectorAll('[role="tab"]');
    const areaPill = tabs[tabs.length - 1];
    expect(areaPill?.getAttribute("aria-selected")).toBe("true");
  });

  it("calls ontabchange when a tab is clicked", () => {
    const ontabchange = vi.fn();
    render(TabbarNav, {
      props: {
        activeTab: "home",
        activeArea: null,
        ontabchange,
        onareatap: vi.fn(),
      },
    });
    const tabs = document.querySelectorAll('[role="tab"]');
    // Click the second tab (Tickets)
    (tabs[1] as HTMLElement).click();
    expect(ontabchange).toHaveBeenCalledWith("tickets");
  });

  it("calls onareatap when the area pill is clicked", () => {
    const onareatap = vi.fn();
    render(TabbarNav, {
      props: {
        activeTab: null,
        activeArea: "admin",
        ontabchange: vi.fn(),
        onareatap,
      },
    });
    const tabs = document.querySelectorAll('[role="tab"]');
    const areaPill = tabs[tabs.length - 1] as HTMLElement;
    areaPill.click();
    expect(onareatap).toHaveBeenCalledWith("admin");
  });
});
