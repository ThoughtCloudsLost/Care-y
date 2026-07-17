// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent, screen } from "@testing-library/svelte";
import { ROLE_ID_VALUES } from "@care-y/shared";
import DesktopSidebar from "./DesktopSidebar.svelte";
import type { DesktopSidebarProps } from "./types";

const VOLUNTEER_ID = ROLE_ID_VALUES[0]!;
const MANAGER_ID = ROLE_ID_VALUES[1]!;
const ADMIN_ID = ROLE_ID_VALUES[2]!;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderSidebar(overrides: Partial<DesktopSidebarProps> = {}) {
  return render(DesktopSidebar, {
    props: {
      activeTab: "home",
      activeArea: null,
      ontabchange: vi.fn(),
      expanded: false,
      subItems: [],
      orgName: "Test Org",
      userName: "Jane Doe",
      userInitials: "JD",
      onAdmin: vi.fn(),
      onSettings: vi.fn(),
      onLogout: vi.fn(),
      roleId: ADMIN_ID,
      onNavigate: vi.fn(),
      ...overrides,
    },
  });
}

describe("DesktopSidebar role badge", () => {
  it("labels the badge with the role name and shows the compact initial at rail width", () => {
    renderSidebar({ roleId: ADMIN_ID, expanded: false });

    const badge = screen.getByRole("button", { name: "Your role: Admin" });
    expect(badge.textContent!.trim()).toBe("A");
  });

  it("shows the full stamp label when the sidebar is expanded", () => {
    renderSidebar({ roleId: ADMIN_ID, expanded: true });

    const badge = screen.getByRole("button", { name: "Your role: Admin" });
    expect(badge.textContent!.trim()).toBe("Admin");
  });

  it("navigates to /admin when the admin badge is activated", async () => {
    const onNavigate = vi.fn();
    renderSidebar({ roleId: ADMIN_ID, onNavigate });

    await fireEvent.click(
      screen.getByRole("button", { name: "Your role: Admin" }),
    );

    expect(onNavigate).toHaveBeenCalledWith("/admin");
  });

  it("navigates to /admin/manager for the manager role", async () => {
    const onNavigate = vi.fn();
    renderSidebar({ roleId: MANAGER_ID, onNavigate });

    await fireEvent.click(
      screen.getByRole("button", { name: "Your role: Coordinator" }),
    );

    expect(onNavigate).toHaveBeenCalledWith("/admin/manager");
  });

  it("navigates to /admin/volunteer for the volunteer role", async () => {
    const onNavigate = vi.fn();
    renderSidebar({ roleId: VOLUNTEER_ID, onNavigate });

    await fireEvent.click(
      screen.getByRole("button", { name: "Your role: Volunteer" }),
    );

    expect(onNavigate).toHaveBeenCalledWith("/admin/volunteer");
  });

  it("joins the roving tabindex between the tab list and the settings button", async () => {
    renderSidebar();

    const nav = screen.getByRole("navigation");
    const badge = screen.getByRole("button", { name: "Your role: Admin" });
    expect(badge.getAttribute("tabindex")).toBe("-1");

    // End lands on logout; two ArrowUps walk back over settings to the badge.
    await fireEvent.keyDown(nav, { key: "End" });
    await fireEvent.keyDown(nav, { key: "ArrowUp" });
    await fireEvent.keyDown(nav, { key: "ArrowUp" });

    expect(badge.getAttribute("tabindex")).toBe("0");
    expect(document.activeElement).toBe(badge);

    // One ArrowDown returns to settings, confirming the badge sits
    // directly before it in the order.
    await fireEvent.keyDown(nav, { key: "ArrowDown" });
    const settings = nav.querySelector('[data-sidebar-id="settings"]');
    expect(document.activeElement).toBe(settings);
  });
});
