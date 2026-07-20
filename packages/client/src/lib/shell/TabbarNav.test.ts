// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/svelte";
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
      activeTab: "activeTab" in overrides ? overrides.activeTab! : "home",
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

  it("applies no-active-tab class when an area is active", async () => {
    renderNav({ activeTab: null, activeArea: "admin" });
    await waitFor(() => {
      const nav = document.querySelector(".tabbar-nav");
      expect(nav?.classList.contains("no-active-tab")).toBe(true);
    });
  });

  it("shows area button when an area is active", () => {
    renderNav({ activeTab: null, activeArea: "admin" });
    const areaBtn = document.querySelector(".area-btn");
    expect(areaBtn).not.toBeNull();
    expect(areaBtn?.classList.contains("area-btn-visible")).toBe(true);
    expect(areaBtn?.getAttribute("aria-hidden")).toBe("false");
  });

  it("hides area button when on a tab page", () => {
    renderNav({ activeTab: "home", activeArea: null });
    const areaBtn = document.querySelector(".area-btn");
    expect(areaBtn?.getAttribute("aria-hidden")).toBe("true");
  });

  it("area button has accessible label with area name", () => {
    renderNav({ activeTab: null, activeArea: "settings" });
    const areaBtn = document.querySelector(".area-btn");
    expect(areaBtn?.getAttribute("aria-label")).toBeTruthy();
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

  it("calls onareatap when the area button is clicked", () => {
    const onareatap = vi.fn();
    render(TabbarNav, {
      props: {
        activeTab: null,
        activeArea: "admin",
        ontabchange: vi.fn(),
        onareatap,
      },
    });
    const areaBtn = document.querySelector(".area-btn") as HTMLElement;
    areaBtn.click();
    expect(onareatap).toHaveBeenCalledWith("admin");
  });
});
