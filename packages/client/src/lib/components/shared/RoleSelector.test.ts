// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

vi.mock("$lib/paraglide/messages.js", () => ({
  admin_invite_role_label: () => "Role",
  admin_role_volunteer: () => "Volunteer",
  admin_role_manager: () => "Manager",
  admin_role_admin: () => "Admin",
}));

vi.mock("$lib/terminology/with-terms.js", () => ({
  withTerms: () => ({}),
}));

import { RoleId } from "@care-y/shared";

const { default: RoleSelector } = await import("./RoleSelector.svelte");

afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

describe("RoleSelector", () => {
  it("renders all three roles when includeAdmin is true", () => {
    render(RoleSelector, {
      props: {
        selectedRole: RoleId.VOLUNTEER,
        onselect: vi.fn(),
      },
    });
    expect(screen.getByText("Volunteer")).toBeTruthy();
    expect(screen.getByText("Manager")).toBeTruthy();
    expect(screen.getByText("Admin")).toBeTruthy();
  });

  it("hides Admin button when includeAdmin is false", () => {
    render(RoleSelector, {
      props: {
        selectedRole: RoleId.VOLUNTEER,
        onselect: vi.fn(),
        includeAdmin: false,
      },
    });
    expect(screen.getByText("Volunteer")).toBeTruthy();
    expect(screen.getByText("Manager")).toBeTruthy();
    expect(screen.queryByText("Admin")).toBeNull();
  });

  it("calls onselect with role value when button clicked", async () => {
    const onselect = vi.fn();
    render(RoleSelector, {
      props: {
        selectedRole: RoleId.VOLUNTEER,
        onselect,
      },
    });

    const managerBtn = screen.getByText("Manager");
    await fireEvent.click(managerBtn);

    expect(onselect).toHaveBeenCalledWith(RoleId.MANAGER);
  });

  it("renders the Role label", () => {
    render(RoleSelector, {
      props: {
        selectedRole: RoleId.VOLUNTEER,
        onselect: vi.fn(),
      },
    });
    expect(screen.getByText("Role")).toBeTruthy();
  });
});
