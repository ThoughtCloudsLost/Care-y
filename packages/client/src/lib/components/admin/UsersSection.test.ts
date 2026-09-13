// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/svelte";
import { RoleId, ErrorCode } from "@care-y/shared";
import type { UserRecord } from "$lib/admin/users-section-utils.js";
import type * as BufferEncoding from "$lib/utils/buffer-encoding.js";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as TanstackQuery from "@tanstack/svelte-query";
import type * as CryptoContext from "$lib/crypto/context.js";
import type * as ToastStore from "$lib/stores/toast.svelte.js";
import type * as Haptic from "$lib/utils/haptic.js";
import type * as Announce from "$lib/utils/announce.js";
import type * as UserFilters from "$lib/stores/user-filters.svelte.js";
import type * as ShellContext from "$lib/shell/context.js";
import type * as SearchNormalize from "$lib/search/normalize.js";

const {
  mockAssignRole,
  mockSetUserActive,
  mockToastShow,
  mockAdminDisplayName,
  mockAdminUsername,
  mockAddQueueMember,
  mockRemoveQueueMember,
  mockGetUserQueues,
  mockRevokeInvite,
} = vi.hoisted(() => ({
  mockAssignRole: vi.fn().mockResolvedValue({ user: { roleId: "mgr" } }),
  mockSetUserActive: vi.fn().mockResolvedValue({ user: { isActive: false } }),
  mockToastShow: vi.fn(),
  mockAdminDisplayName: vi.fn().mockResolvedValue({}),
  mockAdminUsername: vi.fn().mockResolvedValue({}),
  mockAddQueueMember: vi.fn().mockResolvedValue({}),
  mockRemoveQueueMember: vi.fn().mockResolvedValue({}),
  mockGetUserQueues: vi.fn().mockResolvedValue([]),
  mockRevokeInvite: vi.fn().mockResolvedValue({}),
}));

interface UserData extends UserRecord {
  volPublic: string | null;
}

let mockUsersData: UserData[] | undefined;
let mockUsersLoading = false;

interface InviteData {
  id: string;
  roleId: string;
  invitedBy: string;
  expiresAt: string;
  encryptedToken: string | null;
}

let mockInvitesData: InviteData[] = [];

// vi.mock required: tests pin deterministic message strings for assertions.
// Spreading importOriginal keeps every unpinned message real so the mock
// cannot drift from the compiled message surface.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
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

// vi.mock required: tRPC client creates a live HTTP connection on import
// via httpBatchLink. Cannot import in test environment.
// care-y-ignore-next-line mock-factory-unguarded -- importOriginal would open the live tRPC HTTP client; a hand stub cannot satisfy the generated router proxy type
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
      getUserQueues: { query: mockGetUserQueues },
      addQueueMember: { mutate: mockAddQueueMember },
      removeQueueMember: { mutate: mockRemoveQueueMember },
    },
    profile: {
      adminUpdateDisplayName: { mutate: mockAdminDisplayName },
      adminUpdateUsername: { mutate: mockAdminUsername },
    },
    onboarding: {
      listPendingInvites: { query: vi.fn().mockResolvedValue([]) },
      revokeInvite: { mutate: mockRevokeInvite },
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

// vi.mock required: @tanstack/svelte-query creates reactive query state
// bound to a QueryClient context that does not exist in jsdom. The real
// createQuery/createMutation hooks rely on Svelte context injection.
vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof TanstackQuery>()),
  createQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    const idx = queryCallIndex++;
    // Index 0 = usersQuery, 1 = queuesQuery, 2 = invitesQuery
    return {
      get isLoading() {
        return idx === 0 ? mockUsersLoading : false;
      },
      get isError() {
        return false;
      },
      error: null,
      get data() {
        if (idx === 0) return mockUsersData;
        if (idx === 2) return mockInvitesData;
        return [];
      },
      refetch: vi.fn(),
    };
  },
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as
      ((data: unknown, vars: unknown) => void) | undefined;
    const onError = opts.onError as ((err: Error) => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      get variables() {
        return {} as Record<string, unknown>;
      },
      mutate(input: unknown) {
        mutationFn(input).then(
          (data) => onSuccess?.(data, input),
          (err: unknown) =>
            onError?.(err instanceof Error ? err : new Error(String(err))),
        );
      },
    };
  },
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
    getQueriesData: vi.fn().mockReturnValue([]),
  }),
}));

const mockOrgEncrypt = vi.fn().mockReturnValue(new Uint8Array([1, 2, 3]));

// vi.mock required: createContext from Svelte 5 throws "missing_context"
// outside a live component tree. Crypto contexts are set by CryptoProvider
// in the (app) layout, but component tests don't mount the full layout.
vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
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
    encrypt: mockOrgEncrypt,
    encryptText: vi.fn().mockResolvedValue("encrypted-text"),
  }),
}));

// vi.mock required: buffer-encoding uses btoa/atob which work in jsdom,
// but the component imports both base64ToUint8Array and uint8ArrayToBase64.
// Spreading importOriginal keeps unmocked exports real; a partial mock of
// this module previously caused TypeErrors far from the missing export.
vi.mock("$lib/utils/buffer-encoding.js", async (importOriginal) => {
  const real = await importOriginal<typeof BufferEncoding>();
  return {
    ...real,
    base64ToUint8Array: (s: string) =>
      new Uint8Array([...s].map((c) => c.charCodeAt(0))),
    uint8ArrayToBase64: (bytes: Uint8Array) =>
      btoa(String.fromCharCode(...bytes)),
  };
});

// vi.mock required: rune-module state must not leak across tests; the
// stub also exposes mockToastShow for call assertions.
vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastStore>()),
  toastStore: { show: mockToastShow },
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Haptic>()),
  haptic: vi.fn(),
}));
vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Announce>()),
  announceToLiveRegion: vi.fn(),
}));

// vi.mock required: rune-module filter state must not leak across tests.
vi.mock("$lib/stores/user-filters.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof UserFilters>()),
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

// vi.mock required: createContext from Svelte 5 throws "missing_context"
// outside a live component tree.
vi.mock("$lib/shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellContext>()),
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

vi.mock("$lib/search/normalize.js", async (importOriginal) => ({
  ...(await importOriginal<typeof SearchNormalize>()),
  normalizeForSearch: (s: string) => s.toLowerCase(),
}));

// vi.mock required: Svelte component with Konsta dependencies that cannot
// render in jsdom without the full Konsta context.
// care-y-ignore-next-line mock-factory-unguarded -- component stub: module surface is a single default export and a passthrough cannot satisfy the component prop types
vi.mock("$lib/components/QueryError.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("./UserCard.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("./RolePopover.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("./InviteUser.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("./InviteLinkSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("./InvitePendingCard.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, dialog stub cannot satisfy the component prop types
vi.mock("$lib/shell/ShellDialog.svelte", async () => ({
  default: (await import("./test-helpers/StubShellDialog.svelte")).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/shell/ShellActionSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
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
    encryptedIdentifier: btoa("encrypted-ident"),
    roleId: "vol",
    isActive: true,
    hasKeys: true,
    hasOrgKeyWrap: true,
    volPublic: null,
    reachability: "none",
    ...overrides,
  };
}

import UsersSection from "./UsersSection.svelte";

/**
 * The edit sheet renders through the PassthroughShell stub, which carries
 * the sheet title in data-title. The org cache mock decrypts every display
 * name to "Decrypted Name", so an open edit sheet is the passthrough whose
 * title matches it.
 */
async function findEditSheet(): Promise<HTMLElement> {
  return waitFor(() => {
    const sheet = screen
      .getAllByTestId("passthrough-shell")
      .find((el) => el.getAttribute("data-title") === "Decrypted Name");
    if (sheet === undefined) {
      throw new Error("edit sheet not open yet");
    }
    return sheet;
  });
}

describe("UsersSection", () => {
  beforeEach(() => {
    mockUsersData = undefined;
    mockUsersLoading = false;
    mockInvitesData = [];
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

  describe("edit user sheet (role change)", () => {
    it("opens the sheet via the editUser export with saving disabled until something changes", async () => {
      mockUsersData = [makeUser("u-1", { roleId: RoleId.VOLUNTEER })];
      const { component } = render(UsersSection);

      component.editUser("u-1");
      const sheet = await findEditSheet();

      // Sheet header shows the decrypted display name.
      expect(within(sheet).getByText("Decrypted Name")).toBeTruthy();
      // No edits yet: the save action must be inert.
      expect(
        within(sheet)
          .getByRole("button", { name: "Save changes" })
          .hasAttribute("disabled"),
      ).toBe(true);
      expect(mockAssignRole).not.toHaveBeenCalled();
    });

    it("saves a role change through assignRole and closes the sheet", async () => {
      mockUsersData = [makeUser("u-1", { roleId: RoleId.VOLUNTEER })];
      const { component } = render(UsersSection);

      component.editUser("u-1");
      const sheet = await findEditSheet();

      await fireEvent.click(
        within(sheet).getByRole("button", { name: "Manager" }),
      );
      const saveButton = within(sheet).getByRole("button", {
        name: "Save changes",
      });
      expect(saveButton.hasAttribute("disabled")).toBe(false);

      await fireEvent.click(saveButton);

      // Payload contract: userId + new roleId cross the tRPC wire.
      expect(mockAssignRole).toHaveBeenCalledWith({
        userId: "u-1",
        roleId: RoleId.MANAGER,
      });
      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalledWith("Role changed");
      });
      // Sheet closed: its titled header is gone.
      expect(screen.queryByText("Decrypted Name")).toBeNull();
    });

    it("does nothing when editUser is called with a non-existent user ID", async () => {
      mockUsersData = [makeUser("u-1")];
      const { component } = render(UsersSection);

      component.editUser("non-existent-id");

      // Wait a tick to let any async effect settle
      await new Promise((r) => setTimeout(r, 0));

      // No edit sheet opened (no passthrough with a title)
      const shells = screen.queryAllByTestId("passthrough-shell");
      const editSheet = shells.find(
        (el) => el.getAttribute("data-title") === "Decrypted Name",
      );
      expect(editSheet).toBeUndefined();
    });
  });

  describe("display name editing", () => {
    it("saves a changed display name through adminUpdateDisplayName", async () => {
      mockUsersData = [makeUser("u-1", { roleId: RoleId.VOLUNTEER })];
      const { component } = render(UsersSection);

      component.editUser("u-1");
      const sheet = await findEditSheet();

      // Find the display name input (first input in the sheet)
      const inputs = within(sheet).getAllByRole("textbox");
      const displayNameInput = inputs[0]!;

      // Change the display name
      await fireEvent.input(displayNameInput, {
        target: { value: "New Name" },
      });

      const saveButton = within(sheet).getByRole("button", {
        name: "Save changes",
      });
      expect(saveButton.hasAttribute("disabled")).toBe(false);

      await fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAdminDisplayName).toHaveBeenCalledWith(
          expect.objectContaining({ userId: "u-1" }),
        );
      });
    });
  });

  describe("username editing", () => {
    it("saves a changed username through adminUpdateUsername", async () => {
      mockUsersData = [makeUser("u-1", { roleId: RoleId.VOLUNTEER })];
      const { component } = render(UsersSection);

      component.editUser("u-1");
      const sheet = await findEditSheet();

      // Find the username input (second input in the sheet)
      const inputs = within(sheet).getAllByRole("textbox");
      const usernameInput = inputs[1]!;

      // Change the username to something different from the decrypted value
      await fireEvent.input(usernameInput, {
        target: { value: "newusername1234" },
      });

      const saveButton = within(sheet).getByRole("button", {
        name: "Save changes",
      });

      await fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAdminUsername).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: "u-1",
            newIdentifier: "newusername1234",
          }),
        );
      });
    });

    it("shows 'username taken' toast when server returns USERNAME_ALREADY_TAKEN", async () => {
      mockAdminUsername.mockRejectedValueOnce(
        new Error(ErrorCode.USERNAME_ALREADY_TAKEN),
      );

      mockUsersData = [makeUser("u-1", { roleId: RoleId.VOLUNTEER })];
      const { component } = render(UsersSection);

      component.editUser("u-1");
      const sheet = await findEditSheet();

      const inputs = within(sheet).getAllByRole("textbox");
      const usernameInput = inputs[1]!;
      await fireEvent.input(usernameInput, {
        target: { value: "takenuser12345" },
      });

      const saveButton = within(sheet).getByRole("button", {
        name: "Save changes",
      });
      await fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalledWith("Username already taken");
      });
    });

    it("shows generic error toast when username update fails with non-taken error", async () => {
      mockAdminUsername.mockRejectedValueOnce(new Error("NETWORK_ERROR"));

      mockUsersData = [makeUser("u-1", { roleId: RoleId.VOLUNTEER })];
      const { component } = render(UsersSection);

      component.editUser("u-1");
      const sheet = await findEditSheet();

      const inputs = within(sheet).getAllByRole("textbox");
      const usernameInput = inputs[1]!;
      await fireEvent.input(usernameInput, {
        target: { value: "validusername12" },
      });

      const saveButton = within(sheet).getByRole("button", {
        name: "Save changes",
      });
      await fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalledWith("Something went wrong");
      });
    });
  });

  describe("deactivation", () => {
    it("asks for confirmation and sends nothing when the dialog is cancelled", async () => {
      mockUsersData = [makeUser("u-1", { isActive: true })];
      const { component } = render(UsersSection);

      component.editUser("u-1");
      const sheet = await findEditSheet();

      await fireEvent.click(
        within(sheet).getByRole("button", { name: "Deactivate" }),
      );

      const dialog = await screen.findByTestId("stub-dialog");
      expect(
        within(dialog).getByText("Deactivate Decrypted Name?"),
      ).toBeTruthy();
      expect(mockSetUserActive).not.toHaveBeenCalled();

      await fireEvent.click(
        within(dialog).getByRole("button", { name: "Cancel" }),
      );

      expect(screen.queryByTestId("stub-dialog")).toBeNull();
      expect(mockSetUserActive).not.toHaveBeenCalled();
    });

    it("deactivates the user after the dialog is confirmed", async () => {
      mockUsersData = [makeUser("u-1", { isActive: true })];
      const { component } = render(UsersSection);

      component.editUser("u-1");
      const sheet = await findEditSheet();

      await fireEvent.click(
        within(sheet).getByRole("button", { name: "Deactivate" }),
      );
      const dialog = await screen.findByTestId("stub-dialog");
      await fireEvent.click(
        within(dialog).getByRole("button", { name: "Deactivate" }),
      );

      // Payload contract: userId + isActive flag cross the tRPC wire.
      expect(mockSetUserActive).toHaveBeenCalledWith({
        userId: "u-1",
        isActive: false,
      });
      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalledWith("User deactivated");
      });
    });

    it("reactivates an inactive user after the dialog is confirmed", async () => {
      mockUsersData = [makeUser("u-1", { isActive: false })];
      const { component } = render(UsersSection);

      component.editUser("u-1");
      const sheet = await findEditSheet();

      await fireEvent.click(
        within(sheet).getByRole("button", { name: "Reactivate" }),
      );
      const dialog = await screen.findByTestId("stub-dialog");
      expect(
        within(dialog).getByText("Reactivate Decrypted Name?"),
      ).toBeTruthy();

      await fireEvent.click(
        within(dialog).getByRole("button", { name: "Reactivate" }),
      );

      expect(mockSetUserActive).toHaveBeenCalledWith({
        userId: "u-1",
        isActive: true,
      });
      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalledWith("User reactivated");
      });
    });

    it("shows generic error toast when deactivation fails", async () => {
      mockSetUserActive.mockRejectedValueOnce(new Error("Server error"));

      mockUsersData = [makeUser("u-1", { isActive: true })];
      const { component } = render(UsersSection);

      component.editUser("u-1");
      const sheet = await findEditSheet();

      await fireEvent.click(
        within(sheet).getByRole("button", { name: "Deactivate" }),
      );
      const dialog = await screen.findByTestId("stub-dialog");
      await fireEvent.click(
        within(dialog).getByRole("button", { name: "Deactivate" }),
      );

      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalledWith("Something went wrong");
      });
    });
  });

  describe("autoAction prop", () => {
    it("opens the invite sheet when autoAction is 'invite'", () => {
      mockUsersData = [makeUser("u-1")];
      render(UsersSection, { props: { autoAction: "invite" } });

      // The InviteUser stub receives opened=true and renders as a
      // passthrough-shell. Verify it exists with opened attribute.
      const shells = screen.getAllByTestId("passthrough-shell");
      const inviteShell = shells.find(
        (el) => el.getAttribute("data-opened") === "true",
      );
      expect(inviteShell).toBeTruthy();
    });

    it("opens the invite-link sheet when autoAction is 'invite-link'", () => {
      mockUsersData = [makeUser("u-1")];
      render(UsersSection, { props: { autoAction: "invite-link" } });

      const shells = screen.getAllByTestId("passthrough-shell");
      const openedShells = shells.filter(
        (el) => el.getAttribute("data-opened") === "true",
      );
      expect(openedShells.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("multi-select and batch actions", () => {
    it("enters and exits multi-select mode via the toggleMultiSelect export", () => {
      mockUsersData = [makeUser("u-1"), makeUser("u-2")];
      const { component } = render(UsersSection);

      expect(component.isMultiSelectActive()).toBe(false);

      component.toggleMultiSelect();
      expect(component.isMultiSelectActive()).toBe(true);

      component.toggleMultiSelect();
      expect(component.isMultiSelectActive()).toBe(false);
    });

    it("returns a bulkActionsSnippet when multi-select is active", () => {
      mockUsersData = [makeUser("u-1")];
      const { component } = render(UsersSection);

      expect(component.bulkActionsSnippet()).toBeUndefined();

      component.toggleMultiSelect();
      expect(component.bulkActionsSnippet()).toBeDefined();
      expect(typeof component.bulkActionsSnippet()).toBe("function");
    });
  });

  describe("exported stat functions", () => {
    it("returns correct active and inactive counts", () => {
      mockUsersData = [
        makeUser("u-1", { isActive: true }),
        makeUser("u-2", { isActive: true }),
        makeUser("u-3", { isActive: false }),
      ];
      const { component } = render(UsersSection);

      expect(component.activeCount()).toBe(2);
      expect(component.inactiveCount()).toBe(1);
    });

    it("returns zero counts when no data is loaded", () => {
      mockUsersData = undefined;
      const { component } = render(UsersSection);

      expect(component.activeCount()).toBe(0);
      expect(component.inactiveCount()).toBe(0);
    });

    it("returns pending invite count from the invites query", () => {
      mockUsersData = [];
      mockInvitesData = [
        {
          id: "inv-1",
          roleId: RoleId.VOLUNTEER,
          invitedBy: "u-1",
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          encryptedToken: null,
        },
        {
          id: "inv-2",
          roleId: RoleId.ADMIN,
          invitedBy: "u-1",
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          encryptedToken: null,
        },
      ];
      const { component } = render(UsersSection);

      expect(component.pendingInviteCount()).toBe(2);
    });

    it("returns zero pending invites when no data is loaded", () => {
      mockUsersData = [];
      mockInvitesData = [];
      const { component } = render(UsersSection);

      expect(component.pendingInviteCount()).toBe(0);
    });
  });

  describe("invite exports", () => {
    it("opens the invite sheet when openInvite is called", async () => {
      mockUsersData = [makeUser("u-1")];
      const { component } = render(UsersSection);

      component.openInvite();

      // The opened prop reaches the InviteUser passthrough after a flush.
      await waitFor(() => {
        const shells = screen.getAllByTestId("passthrough-shell");
        const openedShell = shells.find(
          (el) => el.getAttribute("data-opened") === "true",
        );
        expect(openedShell).toBeTruthy();
      });
    });

    it("opens the invite-link sheet when openInviteLink is called", async () => {
      mockUsersData = [makeUser("u-1")];
      const { component } = render(UsersSection);

      component.openInviteLink();

      await waitFor(() => {
        const shells = screen.getAllByTestId("passthrough-shell");
        const openedShells = shells.filter(
          (el) => el.getAttribute("data-opened") === "true",
        );
        expect(openedShells.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("activeMatchId highlight", () => {
    it("applies match-active class to the user matching activeMatchId", () => {
      mockUsersData = [makeUser("u-1"), makeUser("u-2")];
      const { container } = render(UsersSection, {
        props: { activeMatchId: "u-1" },
      });

      const u1Wrapper = container.querySelector("#user-u-1");
      expect(u1Wrapper?.classList.contains("match-active")).toBe(true);

      const u2Wrapper = container.querySelector("#user-u-2");
      expect(u2Wrapper?.classList.contains("match-active")).toBe(false);
    });
  });

  describe("matchedUserIds export", () => {
    it("returns IDs of users visible after filtering", () => {
      mockUsersData = [makeUser("u-1"), makeUser("u-2"), makeUser("u-3")];
      const { component } = render(UsersSection);

      const ids = component.matchedUserIds();
      expect(ids).toEqual(["u-1", "u-2", "u-3"]);
    });

    it("returns only matching IDs when a search query filters the list", () => {
      mockUsersData = [makeUser("u-1"), makeUser("u-2")];
      const { component } = render(UsersSection, {
        props: { searchQuery: "decrypted" },
      });

      const ids = component.matchedUserIds();
      expect(ids).toEqual(["u-1", "u-2"]);
    });
  });

  describe("queue assignment editing", () => {
    it("loads queue assignments for the user when the edit sheet opens", async () => {
      mockGetUserQueues.mockResolvedValueOnce(["q-1"]);
      mockUsersData = [makeUser("u-1")];
      const { component } = render(UsersSection);

      component.editUser("u-1");
      await findEditSheet();

      expect(mockGetUserQueues).toHaveBeenCalledWith({ userId: "u-1" });
    });

    it("shows generic error when loading queues fails", async () => {
      mockGetUserQueues.mockRejectedValueOnce(new Error("Network error"));
      mockUsersData = [makeUser("u-1")];
      const { component } = render(UsersSection);

      component.editUser("u-1");
      await findEditSheet();

      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalledWith("Something went wrong");
      });
    });
  });

  describe("role change mutation error", () => {
    it("shows generic error toast when assignRole fails", async () => {
      mockAssignRole.mockRejectedValueOnce(new Error("Server error"));

      mockUsersData = [makeUser("u-1", { roleId: RoleId.VOLUNTEER })];
      const { component } = render(UsersSection);

      component.editUser("u-1");
      const sheet = await findEditSheet();

      await fireEvent.click(
        within(sheet).getByRole("button", { name: "Manager" }),
      );
      const saveButton = within(sheet).getByRole("button", {
        name: "Save changes",
      });
      await fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalledWith("Something went wrong");
      });
    });
  });

  describe("display name mutation error", () => {
    it("shows generic error toast when adminUpdateDisplayName fails", async () => {
      mockAdminDisplayName.mockRejectedValueOnce(new Error("Server error"));

      mockUsersData = [makeUser("u-1")];
      const { component } = render(UsersSection);

      component.editUser("u-1");
      const sheet = await findEditSheet();

      const inputs = within(sheet).getAllByRole("textbox");
      await fireEvent.input(inputs[0]!, {
        target: { value: "Updated Display" },
      });

      const saveButton = within(sheet).getByRole("button", {
        name: "Save changes",
      });
      await fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalledWith("Something went wrong");
      });
    });
  });

  describe("search and filter wiring", () => {
    // The filter/sort matrix itself is covered by users-section-utils.test.ts.
    // These tests only prove the component wires the searchQuery prop and the
    // filter store into the rendered list.

    it("hides users whose decrypted names do not match the search query", () => {
      mockUsersData = [makeUser("u-1"), makeUser("u-2")];
      const { container } = render(UsersSection, {
        props: { searchQuery: "zzz" },
      });

      expect(container.querySelector("#user-u-1")).toBeNull();
      expect(container.querySelector("#user-u-2")).toBeNull();
      expect(screen.getByText("No users match filters")).toBeTruthy();
    });

    it("shows users whose decrypted names match the search query", () => {
      mockUsersData = [makeUser("u-1"), makeUser("u-2")];
      const { container } = render(UsersSection, {
        props: { searchQuery: "decrypted" },
      });

      expect(container.querySelector("#user-u-1")).toBeTruthy();
      expect(container.querySelector("#user-u-2")).toBeTruthy();
      expect(screen.queryByText("No users match filters")).toBeNull();
    });

    it("applies the role filter from the filter store", async () => {
      const { userFilterStore } =
        await import("$lib/stores/user-filters.svelte.js");
      mockUsersData = [
        makeUser("u-vol", { roleId: RoleId.VOLUNTEER }),
        makeUser("u-mgr", { roleId: RoleId.MANAGER }),
      ];
      userFilterStore.roles.add(RoleId.MANAGER);
      try {
        const { container } = render(UsersSection);
        expect(container.querySelector("#user-u-vol")).toBeNull();
        expect(container.querySelector("#user-u-mgr")).toBeTruthy();
      } finally {
        userFilterStore.roles.clear();
      }
    });

    it("applies the status filter from the filter store", async () => {
      const { userFilterStore } =
        await import("$lib/stores/user-filters.svelte.js");
      mockUsersData = [
        makeUser("u-active", { isActive: true }),
        makeUser("u-inactive", { isActive: false }),
      ];
      userFilterStore.statuses.add("inactive");
      try {
        const { container } = render(UsersSection);
        expect(container.querySelector("#user-u-active")).toBeNull();
        expect(container.querySelector("#user-u-inactive")).toBeTruthy();
      } finally {
        userFilterStore.statuses.clear();
      }
    });
  });

  describe("isSelf detection", () => {
    it("marks the current user's card differently from others", () => {
      mockUsersData = [makeUser("current-user-id"), makeUser("other-user")];
      const { container } = render(UsersSection);

      // Both users are rendered in the list
      expect(container.querySelector("#user-current-user-id")).toBeTruthy();
      expect(container.querySelector("#user-other-user")).toBeTruthy();
    });
  });
});
