// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

const { mockAssignRole, mockSetUserActive, mockToastShow } = vi.hoisted(() => ({
  mockAssignRole: vi.fn().mockResolvedValue({ user: { roleId: "mgr" } }),
  mockSetUserActive: vi.fn().mockResolvedValue({ user: { isActive: false } }),
  mockToastShow: vi.fn(),
}));

interface UserData {
  id: string;
  encryptedDisplayName: string;
  roleId: string;
  isActive: boolean;
  hasKeys: boolean;
  hasOrgKeyWrap: boolean;
  volPublic: string | null;
}

let mockUsersData: UserData[] | undefined;
let mockUsersLoading = false;

vi.mock("$lib/paraglide/messages.js", () => ({
  register_note: () => "Note",
  register_careful: () => "Careful",
  register_warning: () => "Warning",
  register_protected: () => "Protected",
  admin_no_users: () => "No users yet",
  admin_users_empty_filter: () => "No users match filters",
  admin_role_change: () => "Change Role",
  admin_role_changed: () => "Role changed",
  admin_deactivate: () => "Deactivate",
  admin_reactivate: () => "Reactivate",
  admin_deactivate_title: ({ name }: { name: string }) => `Deactivate ${name}?`,
  admin_deactivate_body: () => "This will end their session.",
  admin_reactivate_title: ({ name }: { name: string }) => `Reactivate ${name}?`,
  admin_reactivate_body: () => "They will regain access.",
  admin_user_deactivated: () => "User deactivated",
  admin_user_reactivated: () => "User reactivated",
  admin_users_selected: ({ count }: { count: number }) => `${count} selected`,
  admin_users_batch_deactivate: () => "Deactivate selected",
  admin_users_batch_deactivated: ({ count }: { count: number }) =>
    `${count} deactivated`,
  admin_users_exit_multiselect: () => "Exit select",
  admin_role_volunteer: () => "Volunteer",
  admin_role_manager: () => "Manager",
  admin_role_admin: () => "Admin",
  admin_invite_title: () => "Invite User",
  admin_invite_cancel: () => "Cancel",
  admin_invite_send: () => "Create Account",
  admin_invite_identifier_hint: () => "Auto-generated.",
  user_field_login_username_pii_warning: () => "Weaker encryption",
  user_field_display_name_label: () => "Display Name",
  admin_invite_password_label: () => "Password",
  admin_invite_password_hint: () => "Share securely.",
  admin_invite_password_too_short: () => "Min 16 chars",
  admin_invite_role_label: () => "Role",
  admin_invite_no_org_key: () => "Org key not loaded.",
  admin_invite_success: () => "Created",
  admin_invite_credential_title: () => "Account Created",
  admin_invite_credential_instructions: () => "Share securely.",
  admin_invite_credential_identifier: () => "Identifier",
  admin_invite_credential_password: () => "Password",
  admin_invite_credential_show: () => "Show",
  admin_invite_credential_hide: () => "Hide",
  admin_invite_credential_done: () => "Done",
  admin_user_edit_actions: () => "Actions",
  admin_user_save_changes: () => "Save changes",
  admin_user_queue_assignments: () => "Queue Assignments",
  admin_display_name_label: () => "Display Name",
  admin_display_name_updated: () => "Display name updated",
  admin_username_label: () => "Username",
  admin_username_updated: () => "Username updated",
  settings_display_name: () => "Display Name",
  settings_username: () => "Username",
  settings_username_taken: () => "Username already taken",
  admin_role_unknown: () => "Unknown",
  admin_invite_pending_revoke: () => "Revoke",
  admin_invite_pending_revoke_title: () => "Revoke Invite?",
  admin_invite_pending_revoke_body: () => "This link will stop working.",
  admin_invite_pending_revoke_error: () => "Failed to revoke",
  admin_invite_pending_revoked: () => "Invite revoked",
  admin_invite_pending_expired: () => "Expired",
  admin_invite_pending_expires_in: ({ time }: { time: string }) =>
    `Expires in ${time}`,
  admin_invite_pending_invited_by: ({ name }: { name: string }) =>
    `Invited by ${name}`,
  admin_invite_pending_invited_by_unknown: () => "Invited by unknown",
  admin_invite_link_title: () => "Invite Link",
  admin_invite_link_subtext: () => "Generate a link.",
  admin_invite_link_role_label: () => "Role",
  admin_invite_link_generate: () => "Generate",
  admin_invite_link_generated: () => "Link generated",
  admin_invite_link_url_label: () => "Invite URL",
  admin_invite_link_card_label: () => "Copy link",
  admin_invite_link_copy: () => "Copy",
  admin_invite_link_copied: () => "Copied",
  admin_invite_link_done: () => "Done",
  admin_invite_link_another: () => "Generate another",
  admin_invite_link_expires: ({ time }: { time: string }) => `Expires ${time}`,
  admin_invite_link_error: () => "Failed to generate",
  common_cancel: () => "Cancel",
  common_loading: () => "Loading",
  error_generic: () => "Something went wrong",
  shell_close: () => "Close",
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    auth: {
      listUsers: { query: vi.fn() },
      listAllForAdmin: { query: vi.fn().mockResolvedValue([]) },
      assignRole: { mutate: mockAssignRole },
      setUserActive: { mutate: mockSetUserActive },
      register: { mutate: vi.fn().mockResolvedValue({ user: { id: "u1" } }) },
    },
    tickets: {
      counts: {
        query: vi.fn().mockResolvedValue({ new: 0, active: 0, onHold: 0 }),
      },
      list: { query: vi.fn() },
      myQueues: { query: vi.fn().mockResolvedValue([]) },
      listQueues: { query: vi.fn().mockResolvedValue([]) },
      getUserQueues: { query: vi.fn().mockResolvedValue([]) },
      addQueueMember: { mutate: vi.fn().mockResolvedValue({}) },
      removeQueueMember: { mutate: vi.fn().mockResolvedValue({}) },
    },
    profile: {
      adminUpdateDisplayName: { mutate: vi.fn().mockResolvedValue({}) },
      adminUpdateUsername: { mutate: vi.fn().mockResolvedValue({}) },
    },
    onboarding: {
      listPendingInvites: { query: vi.fn().mockResolvedValue([]) },
      revokeInvite: { mutate: vi.fn().mockResolvedValue({}) },
      generateInvite: {
        mutate: vi.fn().mockResolvedValue({
          url: "https://test.local/first-login/tok",
          expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        }),
      },
    },
  },
}));

let queryCallIndex = 0;

vi.mock("@tanstack/svelte-query", () => ({
  createQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    const idx = queryCallIndex++;
    return {
      get isLoading() {
        return idx === 0 ? mockUsersLoading : false;
      },
      get isError() {
        return false;
      },
      error: null,
      get data() {
        return idx === 0 ? mockUsersData : [];
      },
      refetch: vi.fn(),
    };
  },
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as
      ((data: unknown, vars: unknown) => void) | undefined;
    const onError = opts.onError as (() => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      mutate(input: unknown) {
        mutationFn(input).then(
          (data) => onSuccess?.(data, input),
          () => onError?.(),
        );
      },
    };
  },
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
    getQueriesData: vi.fn().mockReturnValue([]),
  }),
}));

vi.mock("$lib/crypto/context.js", () => ({
  getOrgDecryptCache: () => ({
    decrypt: () => "Decrypted Name",
    decryptAsync: vi.fn().mockResolvedValue("decrypted-identifier"),
    delete: vi.fn().mockReturnValue(true),
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
  }),
  getCurrentUserId: () => () => "current-user-id",
  getOrgKeyManager: () => ({
    get isLoaded() {
      return true;
    },
    encrypt: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
    encryptText: vi.fn().mockResolvedValue("encrypted-text"),
  }),
}));

vi.mock("$lib/utils/buffer-encoding.js", () => ({
  base64ToUint8Array: (s: string) =>
    new Uint8Array([...s].map((c) => c.charCodeAt(0))),
}));

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));

vi.mock("$lib/utils/haptic.js", () => ({ haptic: vi.fn() }));
vi.mock("$lib/utils/announce.js", () => ({ announceToLiveRegion: vi.fn() }));

vi.mock("$lib/stores/user-filters.svelte.js", () => ({
  userFilterStore: {
    roles: new Set(),
    statuses: new Set(),
    keyStatuses: new Set(),
    queueIds: new Set(),
    sort: { field: "name", direction: "asc" },
    activeCount: 0,
    setSort: vi.fn(),
    toggleRole: vi.fn(),
    toggleStatus: vi.fn(),
    toggleKeyStatus: vi.fn(),
    toggleQueue: vi.fn(),
    clearAll: vi.fn(),
  },
}));

vi.mock("$lib/shell/context.js", () => ({
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

vi.mock("$lib/search/normalize.js", () => ({
  normalizeForSearch: (s: string) => s.toLowerCase(),
}));

vi.mock("$lib/components/QueryError.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("./UserCard.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("./RolePopover.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("./InviteUser.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/shell/ShellDialog.svelte", async () => ({
  default: (await import("./test-helpers/StubShellDialog.svelte")).default,
}));

vi.mock("$lib/shell/ShellActionSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/shell/ShellSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

function makeUser(id: string, overrides: Partial<UserData> = {}): UserData {
  return {
    id,
    encryptedDisplayName: btoa("encrypted"),
    roleId: "vol",
    isActive: true,
    hasKeys: true,
    hasOrgKeyWrap: true,
    volPublic: null,
    ...overrides,
  };
}

import UsersSection from "./UsersSection.svelte";

describe("UsersSection", () => {
  beforeEach(() => {
    mockUsersData = undefined;
    mockUsersLoading = false;
    queryCallIndex = 0;
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("shows loading state with skeleton user cards", () => {
    mockUsersLoading = true;
    const { container } = render(UsersSection);
    const cards = container.querySelectorAll(".user-list");
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });

  it("shows no users message when user list is empty", () => {
    mockUsersData = [];
    render(UsersSection);
    expect(screen.getByText("No users yet")).toBeTruthy();
  });

  it("renders user list when data is present", () => {
    mockUsersData = [
      makeUser("u-1"),
      makeUser("u-2"),
      makeUser("u-3", { isActive: false }),
    ];
    const { container } = render(UsersSection);
    expect(container.querySelector(".user-list")).toBeTruthy();
  });

  it("renders the correct number of user entries", () => {
    mockUsersData = [makeUser("u-1"), makeUser("u-2")];
    const { container } = render(UsersSection);
    const list = container.querySelector(".user-list");
    expect(list?.children.length).toBe(2);
  });

  it("renders all roles in the user list", () => {
    mockUsersData = [
      makeUser("u-1", { roleId: "vol" }),
      makeUser("u-2", { roleId: "mgr" }),
      makeUser("u-3", { roleId: "admin" }),
    ];
    const { container } = render(UsersSection);
    expect(container.querySelector(".user-list")?.children.length).toBe(3);
  });

  it("includes inactive users in unfiltered list", () => {
    mockUsersData = [
      makeUser("u-1", { isActive: true }),
      makeUser("u-2", { isActive: false }),
    ];
    const { container } = render(UsersSection);
    expect(container.querySelector(".user-list")?.children.length).toBe(2);
  });

  it("does not show empty filter message when users exist unfiltered", () => {
    mockUsersData = [makeUser("u-1")];
    render(UsersSection);
    expect(screen.queryByText("No users match filters")).toBeNull();
  });

  it("does not render page container in loading state", () => {
    mockUsersLoading = true;
    mockUsersData = undefined;
    render(UsersSection);
    expect(screen.queryByText("No users yet")).toBeNull();
  });
});
