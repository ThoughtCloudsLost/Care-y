// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import { Permission, ROLE_ID_VALUES } from "@care-y/shared";

// Type-only imports for mock surface tracking (erased at compile time)
import type * as ParaMessages from "$lib/paraglide/messages.js";
import type * as WithTermsMod from "$lib/terminology/with-terms.js";
import type * as TrpcMod from "$lib/trpc/index.js";
import type * as KeysMod from "$lib/query/keys.js";
import type * as ToastMod from "$lib/stores/toast.svelte.js";
import type * as HapticMod from "$lib/utils/haptic.js";
import type * as AnnounceMod from "$lib/utils/announce.js";
import type * as ShellCtxMod from "$lib/shell/context.js";
import type * as TanstackQueryMod from "@tanstack/svelte-query";

// ── Controllable mock state ──

const {
  mockGetRolePermissions,
  mockSetRolePermission,
  mockResetRolePermissions,
  mockToastShow,
  mockHaptic,
  mockAnnounce,
  mockInvalidateQueries,
} = vi.hoisted(() => ({
  mockGetRolePermissions: vi.fn(),
  mockSetRolePermission: vi.fn().mockResolvedValue({}),
  mockResetRolePermissions: vi.fn().mockResolvedValue({}),
  mockToastShow: vi.fn(),
  mockHaptic: vi.fn(),
  mockAnnounce: vi.fn(),
  mockInvalidateQueries: vi.fn(),
}));

function buildFixtureData(): {
  roles: {
    roleId: string;
    permissions: Permission[];
    overridden: Permission[];
  }[];
  locked: Permission[];
} {
  return {
    roles: [
      {
        roleId: ROLE_ID_VALUES[0] ?? "",
        permissions: [
          Permission.VIEW_TICKETS,
          Permission.MANAGE_OWN_TICKETS,
          Permission.VIEW_KNOWLEDGE_BASE,
          Permission.EDIT_KNOWLEDGE_BASE,
          Permission.VIEW_OWN_SHIFTS,
        ],
        overridden: [Permission.EDIT_KNOWLEDGE_BASE],
      },
      {
        roleId: ROLE_ID_VALUES[1] ?? "",
        permissions: [
          Permission.VIEW_TICKETS,
          Permission.MANAGE_OWN_TICKETS,
          Permission.VIEW_KNOWLEDGE_BASE,
          Permission.EDIT_KNOWLEDGE_BASE,
          Permission.VIEW_OWN_SHIFTS,
          Permission.MODERATE_CONTENT,
          Permission.MANAGE_USERS,
          Permission.MANAGE_QUEUES,
          Permission.MANAGE_PRESETS,
          Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES,
          Permission.VIEW_REPORTS,
          Permission.DELETE_CLIENTS,
          Permission.VIEW_CLIENTS,
        ],
        overridden: [Permission.VIEW_REPORTS],
      },
      {
        roleId: ROLE_ID_VALUES[2] ?? "",
        permissions: Object.values(Permission),
        overridden: [],
      },
    ],
    locked: [
      Permission.MANAGE_KEYS,
      Permission.MANAGE_ROLES,
      Permission.MANAGE_INFRASTRUCTURE,
    ],
  };
}

// vi.mock required: paraglide messages are compile-generated, no on-disk source in test env
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaMessages>()),
  admin_role_volunteer: () => "Volunteer",
  admin_role_manager: () => "Manager",
  admin_role_admin: () => "Admin",
  permission_view_tickets: () => "View cases",
  permission_manage_own_tickets: () => "Work on own cases",
  permission_view_knowledge_base: () => "View knowledge base",
  permission_edit_knowledge_base: () => "Edit knowledge base",
  permission_view_own_shifts: () => "View own shifts",
  permission_moderate_content: () => "Review content",
  permission_manage_users: () => "Manage users",
  permission_manage_queues: () => "Manage queues",
  permission_manage_presets: () => "Manage reply templates",
  permission_manage_knowledge_base_categories: () =>
    "Manage knowledge base categories",
  permission_view_reports: () => "View reports",
  permission_delete_clients: () => "Delete client records",
  permission_view_clients: () => "View client records",
  permission_manage_roles: () => "Manage roles",
  permission_manage_org_config: () => "Manage organization settings",
  permission_manage_keys: () => "Manage encryption keys",
  permission_manage_infrastructure: () => "Manage server and infrastructure",
  roles_toggle_aria: ({
    permission,
    role,
  }: {
    permission: string;
    role: string;
  }) => `${permission} for ${role}`,
  roles_locked_toggle_aria: ({
    permission,
    role,
  }: {
    permission: string;
    role: string;
  }) => `${permission} for ${role}, locked to Admin`,
  roles_locked_explainer: () =>
    "These stay with Admin to protect keys and roles.",
  roles_override_edited: () => "edited",
  roles_reset_defaults: () => "Reset to defaults",
  roles_reset_title: () => "Reset role permissions?",
  roles_reset_confirm: () =>
    "All permission changes will revert to the defaults.",
  roles_reset_action: () => "Reset",
  roles_perm_saved: () => "Permission updated",
  roles_perm_reset_success: () => "Role permissions reset to defaults",
  roles_group_volunteer: () => "Volunteer level",
  roles_group_manager: () => "Manager level",
  roles_group_admin: () => "Admin level",
  error_generic: () => "Something went wrong",
  common_cancel: () => "Cancel",
  register_note: () => "Note",
  register_careful: () => "Careful",
  register_warning: () => "Warning",
  register_protected: () => "Protected",
}));

// vi.mock required: withTerms calls getContext which is not available
// outside a live component tree.
vi.mock("$lib/terminology/with-terms.js", async (importOriginal) => ({
  ...(await importOriginal<typeof WithTermsMod>()),
  withTerms: () => ({}),
}));

// vi.mock required: tRPC client creates live HTTP connection on import
vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcMod>()),
  trpc: {
    auth: {
      getRolePermissions: { query: mockGetRolePermissions },
      setRolePermission: { mutate: mockSetRolePermission },
      resetRolePermissions: { mutate: mockResetRolePermissions },
    },
  },
}));

// vi.mock required: TanStack Query hooks need Svelte component context
vi.mock("@tanstack/svelte-query", async (importOriginal) => {
  const original = await importOriginal<typeof TanstackQueryMod>();
  let queryData: unknown = undefined;
  let queryIsLoading = false;
  let queryIsError = false;
  const queryError: Error | null = null;

  return {
    ...original,
    createQuery: (optsFn: () => Record<string, unknown>) => {
      const opts = optsFn();
      const queryFn = opts.queryFn as () => Promise<unknown>;

      queryFn()
        .then((data) => {
          queryData = data;
          queryIsLoading = false;
        })
        .catch(() => {
          queryIsError = true;
          queryIsLoading = false;
        });

      return {
        get data() {
          return queryData;
        },
        get isLoading() {
          return queryIsLoading;
        },
        get isError() {
          return queryIsError;
        },
        get error() {
          return queryError;
        },
        refetch: vi.fn(),
      };
    },
    createMutation: (optsFn: () => Record<string, unknown>) => {
      const opts = optsFn();
      const mutationFn = opts.mutationFn as (
        input: unknown,
      ) => Promise<unknown>;
      const onSuccess = opts.onSuccess as (() => void) | undefined;
      const onError = opts.onError as (() => void) | undefined;
      return {
        get isPending() {
          return false;
        },
        mutate(input: unknown) {
          mutationFn(input).then(
            () => onSuccess?.(),
            () => onError?.(),
          );
        },
      };
    },
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  };
});

// vi.mock required: query keys module
vi.mock("$lib/query/keys.js", async (importOriginal) => ({
  ...(await importOriginal<typeof KeysMod>()),
  adminKeys: {
    rolePermissions: () => ["admin", "rolePermissions"],
  },
  authKeys: {
    me: () => ["auth", "me"],
  },
}));

// vi.mock required: toast store uses Svelte 5 module-level $state singleton
vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastMod>()),
  toastStore: { show: mockToastShow },
}));

// vi.mock required: haptic uses navigator.vibrate, unavailable in jsdom
vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<typeof HapticMod>()),
  haptic: mockHaptic,
}));

// vi.mock required: announce uses DOM live region API not present in jsdom
vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AnnounceMod>()),
  announceToLiveRegion: mockAnnounce,
}));

// vi.mock required: shell context uses Svelte context API unavailable in test env
vi.mock("$lib/shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellCtxMod>()),
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

import RolePermissionsSection from "./RolePermissionsSection.svelte";

function renderSection(): ReturnType<typeof render> {
  return render(RolePermissionsSection);
}

describe("RolePermissionsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRolePermissions.mockResolvedValue(buildFixtureData());
  });

  afterEach(cleanup);

  it("renders all Permission rows across three groups", async () => {
    renderSection();
    await vi.waitFor(() => {
      expect(screen.getByText("View cases")).toBeTruthy();
    });
    // Volunteer-level group
    expect(screen.getByText("Volunteer level")).toBeTruthy();
    expect(screen.getByText("Work on own cases")).toBeTruthy();
    expect(screen.getByText("View knowledge base")).toBeTruthy();

    // Manager-level group
    expect(screen.getByText("Manager level")).toBeTruthy();
    expect(screen.getByText("Manage users")).toBeTruthy();
    expect(screen.getByText("View reports")).toBeTruthy();

    // Admin-level group
    expect(screen.getByText("Admin level")).toBeTruthy();
    expect(screen.getByText("Manage encryption keys")).toBeTruthy();
    expect(screen.getByText("Manage roles")).toBeTruthy();
    expect(screen.getByText("Manage server and infrastructure")).toBeTruthy();
  });

  it("renders three role column headers per group", async () => {
    renderSection();
    await vi.waitFor(() => {
      expect(screen.getByText("View cases")).toBeTruthy();
    });
    // Three groups, each with Volunteer/Manager/Admin headers = 9 total
    const volHeaders = screen.getAllByText("Volunteer");
    expect(volHeaders.length).toBe(3);
    const mgrHeaders = screen.getAllByText("Manager");
    expect(mgrHeaders.length).toBe(3);
    const admHeaders = screen.getAllByText("Admin");
    expect(admHeaders.length).toBe(3);
  });

  it("renders locked cells as disabled toggles", async () => {
    renderSection();
    await vi.waitFor(() => {
      expect(screen.getByText("Manage encryption keys")).toBeTruthy();
    });

    // Each locked permission produces 3 toggle cells (one per role column),
    // and each is disabled. The aria-label includes "locked to Admin".
    const lockedLabel = screen.getByLabelText(
      "Manage encryption keys for Admin, locked to Admin",
    );
    expect(lockedLabel).toBeTruthy();

    const volLabel = screen.getByLabelText(
      "Manage encryption keys for Volunteer, locked to Admin",
    );
    expect(volLabel).toBeTruthy();
  });

  it("shows override marker for overridden cells", async () => {
    renderSection();
    await vi.waitFor(() => {
      expect(screen.getByText("View cases")).toBeTruthy();
    });
    // The fixture has VIEW_REPORTS overridden for Manager and
    // EDIT_KNOWLEDGE_BASE overridden for Volunteer.
    const editedMarkers = screen.getAllByText("edited");
    expect(editedMarkers.length).toBe(2);
  });

  it("fires mutation with correct payload on toggle", async () => {
    renderSection();
    await vi.waitFor(() => {
      expect(screen.getByText("View cases")).toBeTruthy();
    });

    // Toggle "View reports" for Volunteer (currently off).
    const toggle = screen.getByLabelText("View reports for Volunteer");
    toggle.click();

    await vi.waitFor(() => {
      expect(mockSetRolePermission).toHaveBeenCalledWith({
        roleId: ROLE_ID_VALUES[0],
        permission: Permission.VIEW_REPORTS,
        enabled: true,
      });
    });
  });

  it("invalidates both rolePermissions and auth.me on success", async () => {
    renderSection();
    await vi.waitFor(() => {
      expect(screen.getByText("View cases")).toBeTruthy();
    });

    const toggle = screen.getByLabelText("View reports for Volunteer");
    toggle.click();

    await vi.waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["admin", "rolePermissions"],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["auth", "me"],
      });
    });
  });

  it("shows mutation feedback quartet on success", async () => {
    renderSection();
    await vi.waitFor(() => {
      expect(screen.getByText("View cases")).toBeTruthy();
    });

    const toggle = screen.getByLabelText("View reports for Volunteer");
    toggle.click();

    await vi.waitFor(() => {
      expect(mockHaptic).toHaveBeenCalled();
      expect(mockToastShow).toHaveBeenCalledWith("Permission updated");
      expect(mockAnnounce).toHaveBeenCalledWith("polite", "Permission updated");
    });
  });

  it("shows Protected register explainer", async () => {
    renderSection();
    await vi.waitFor(() => {
      expect(screen.getByText("View cases")).toBeTruthy();
    });

    expect(
      screen.getByText("These stay with Admin to protect keys and roles."),
    ).toBeTruthy();
    // The register eyebrow
    expect(screen.getByText("Protected")).toBeTruthy();
  });

  it("shows reset to defaults button", async () => {
    renderSection();
    await vi.waitFor(() => {
      expect(screen.getByText("View cases")).toBeTruthy();
    });

    expect(screen.getByText("Reset to defaults")).toBeTruthy();
  });

  it("calls resetRolePermissions on confirm", async () => {
    renderSection();
    await vi.waitFor(() => {
      expect(screen.getByText("View cases")).toBeTruthy();
    });

    // Click reset button to open confirm dialog
    screen.getByText("Reset to defaults").click();

    await vi.waitFor(() => {
      expect(screen.getByText("Reset role permissions?")).toBeTruthy();
    });

    // Click the confirm button in the dialog
    screen.getByText("Reset").click();

    await vi.waitFor(() => {
      expect(mockResetRolePermissions).toHaveBeenCalled();
    });
  });

  it("shows assertive announcement on reset success", async () => {
    renderSection();
    await vi.waitFor(() => {
      expect(screen.getByText("View cases")).toBeTruthy();
    });

    screen.getByText("Reset to defaults").click();
    await vi.waitFor(() => {
      expect(screen.getByText("Reset role permissions?")).toBeTruthy();
    });

    screen.getByText("Reset").click();

    await vi.waitFor(() => {
      expect(mockAnnounce).toHaveBeenCalledWith(
        "assertive",
        "Role permissions reset to defaults",
      );
    });
  });
});
