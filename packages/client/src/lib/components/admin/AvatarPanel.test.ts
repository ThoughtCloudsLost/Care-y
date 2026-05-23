// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent, screen } from "@testing-library/svelte";
import { Permission, RoleId } from "@care-y/shared";

// --- IntersectionObserver stub (jsdom lacks it, DecryptPlaceholder needs it) ---
vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(function (this: {
    observe: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    unobserve: ReturnType<typeof vi.fn>;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

// --- Hoisted mock fns ---
const { mockToastShow, mockOrgDecrypt } = vi.hoisted(() => ({
  mockToastShow: vi.fn(),
  mockOrgDecrypt: vi.fn().mockReturnValue("Jane Doe"),
}));

// --- Mock i18n ---
vi.mock("$lib/paraglide/messages.js", () => ({
  role_admin: () => "Admin",
  role_manager: () => "Manager",
  role_volunteer: () => "Volunteer",
  panel_group_people: () => "People",
  panel_group_communications: () => "Communications",
  panel_group_organization: () => "Organization",
  panel_users: () => "Users",
  panel_queues: () => "Queues",
  panel_telephony: () => "Telephony",
  panel_blocklist: () => "Blocklist",
  panel_greetings: () => "Greetings",
  panel_sms_templates: () => "SMS Templates",
  panel_general: () => "General",
  panel_branding: () => "Branding",
  panel_terminology: () => "Terminology",
  panel_keys: () => "Keys",
  panel_retention: () => "Retention",
  panel_reports: () => "Reports",
  panel_note_types: () => "Follow-Up Types",
  hub_general_subtitle: () => "Organization settings",
  hub_terminology_subtitle: () => "Custom terms",
  hub_note_types_subtitle: () => "Note categories",
  panel_group_analytics: () => "Analytics",
  panel_analytics_overview: () => "Overview",
  panel_analytics_operations: () => "Operations",
  panel_analytics_deep: () => "Deep Analytics",
  hub_analytics_overview_subtitle: () => "Dashboard overview",
  hub_analytics_operations_subtitle: () => "Operational metrics",
  hub_analytics_deep_subtitle: () => "Advanced analytics",
  panel_settings: () => "Settings",
  panel_logout: () => "Log out",
  admin_coming_soon: () => "Coming soon",
  hub_users_subtitle: () => "Manage users",
  hub_queues_subtitle: () => "Manage queues",
  hub_telephony_subtitle: () => "Phone numbers",
  hub_blocklist_subtitle: () => "Blocked numbers",
  hub_greetings_subtitle: () => "Greetings",
  hub_sms_templates_subtitle: () => "SMS templates",
  hub_branding_subtitle: () => "Branding",
  hub_keys_subtitle: () => "Key status",
  hub_retention_subtitle: () => "Data retention",
  hub_reports_subtitle: () => "Reports",
  decrypt_loading: () => "Loading...",
  decrypt_error: () => "Error",
  decrypt_denied: () => "Denied",
}));

// --- Mock crypto context ---
vi.mock("$lib/crypto/context.js", () => ({
  getOrgDecryptCache: () => ({
    decrypt: mockOrgDecrypt,
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
  }),
  getOrgKeyManager: () => ({ isLoaded: true }),
}));

// --- Mock buffer encoding ---
vi.mock("$lib/utils/buffer-encoding.js", () => ({
  base64ToUint8Array: vi.fn(
    (s: string) => new Uint8Array([...s].map((c) => c.charCodeAt(0))),
  ),
}));

// --- Mock toast store ---
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));

// --- Mock shell context ---
vi.mock("$lib/shell/context.js", () => ({
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

import AvatarPanel from "./AvatarPanel.svelte";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const ADMIN_PERMISSIONS = new Set([
  Permission.MANAGE_USERS,
  Permission.MANAGE_QUEUES,
  Permission.MANAGE_INFRASTRUCTURE,
  Permission.MANAGE_ORG_CONFIG,
  Permission.MANAGE_KEYS,
  Permission.VIEW_REPORTS,
  Permission.MANAGE_ROLES,
]);

const VOLUNTEER_PERMISSIONS = new Set([
  Permission.VIEW_TICKETS,
  Permission.MANAGE_OWN_TICKETS,
  Permission.VIEW_KNOWLEDGE_BASE,
]);

function renderPanel(
  overrides: Partial<{
    roleId: string;
    permissions: ReadonlySet<Permission>;
    onnavigate: (path: string) => void;
    onlogout: () => void;
  }> = {},
) {
  return render(AvatarPanel, {
    props: {
      encryptedDisplayName: "AQID",
      roleId: overrides.roleId ?? RoleId.ADMIN,
      permissions: overrides.permissions ?? ADMIN_PERMISSIONS,
      onnavigate: overrides.onnavigate ?? vi.fn(),
      onlogout: overrides.onlogout ?? vi.fn(),
    },
  });
}

describe("AvatarPanel", () => {
  it("renders PEOPLE group when permissions include MANAGE_USERS", () => {
    renderPanel({ permissions: new Set([Permission.MANAGE_USERS]) });
    expect(screen.getByText("People")).toBeTruthy();
    expect(screen.getByText("Users")).toBeTruthy();
  });

  it("hides COMMUNICATIONS group for volunteer role", () => {
    renderPanel({
      roleId: RoleId.VOLUNTEER,
      permissions: VOLUNTEER_PERMISSIONS,
    });
    expect(screen.queryByText("Communications")).toBeNull();
  });

  it("hides admin groups when no admin permissions", () => {
    renderPanel({
      roleId: RoleId.VOLUNTEER,
      permissions: VOLUNTEER_PERMISSIONS,
    });
    expect(screen.queryByText("People")).toBeNull();
    expect(screen.queryByText("Organization")).toBeNull();
  });

  it("fires onnavigate with correct path for implemented destination", async () => {
    const onnavigate = vi.fn();
    renderPanel({ onnavigate });

    const usersItem = screen.getByText("Users");
    await fireEvent.click(usersItem);

    expect(onnavigate).toHaveBeenCalledWith("/admin/people?tab=users");
  });

  it("fires onnavigate for communications destination", async () => {
    const onnavigate = vi.fn();
    renderPanel({ onnavigate });

    const telephonyItem = screen.getByText("Telephony");
    await fireEvent.click(telephonyItem);

    expect(onnavigate).toHaveBeenCalledWith(
      "/admin/communications?tab=telephony",
    );
  });

  it("fires onnavigate with admin hub path when admin role label tapped", async () => {
    const onnavigate = vi.fn();
    renderPanel({ onnavigate, roleId: RoleId.ADMIN });

    const roleBtn = screen.getByText("Admin");
    await fireEvent.click(roleBtn);

    expect(onnavigate).toHaveBeenCalledWith("/admin");
  });

  it("fires onnavigate with volunteer path when volunteer role label tapped", async () => {
    const onnavigate = vi.fn();
    renderPanel({
      onnavigate,
      roleId: RoleId.VOLUNTEER,
      permissions: VOLUNTEER_PERMISSIONS,
    });

    const roleBtn = screen.getByText("Volunteer");
    await fireEvent.click(roleBtn);

    expect(onnavigate).toHaveBeenCalledWith("/admin/volunteer");
  });

  it("fires onlogout when logout tapped", async () => {
    const onlogout = vi.fn();
    renderPanel({ onlogout });

    const logoutItem = screen.getByText("Log out");
    await fireEvent.click(logoutItem);

    expect(onlogout).toHaveBeenCalledOnce();
  });

  it("renders Settings and Log out in footer always", () => {
    renderPanel({
      roleId: RoleId.VOLUNTEER,
      permissions: VOLUNTEER_PERMISSIONS,
    });
    expect(screen.getByText("Settings")).toBeTruthy();
    expect(screen.getByText("Log out")).toBeTruthy();
  });

  it("renders DecryptPlaceholder for display name", () => {
    renderPanel();
    expect(mockOrgDecrypt).toHaveBeenCalledWith(
      "me:display_name",
      expect.any(Uint8Array),
    );
  });

  it("shows initials derived from decrypted name", () => {
    renderPanel();
    const avatar = document.querySelector(".panel-avatar");
    expect(avatar?.textContent).toBe("JD");
  });
});
