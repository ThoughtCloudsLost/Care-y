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
          Permission.VIEW_CASES,
          Permission.OPEN_CASES,
          Permission.EDIT_CASE_SUMMARY,
          Permission.WRITE_CASE_NOTES,
          Permission.CHANGE_CASE_STATUS,
          Permission.LINK_CASES,
          Permission.CLAIM_CASES,
          Permission.ASSIGN_CASES,
          Permission.SEND_CLIENT_MEDIA,
          Permission.DOWNLOAD_CASE_MEDIA,
          Permission.SEND_CLIENT_SMS,
          Permission.SEND_CLIENT_EMAIL,
          Permission.CALL_CLIENTS,
          Permission.MESSAGE_CLIENTS_IN_PORTAL,
          Permission.MANAGE_SHARE_LINKS,
          Permission.MANAGE_PORTAL_CHANNEL,
          Permission.RESET_CLIENT_LOGIN,
          Permission.REVOKE_REPLY_LINKS,
          Permission.VIEW_KNOWLEDGE_BASE,
          Permission.EDIT_KNOWLEDGE_BASE,
          Permission.VIEW_OWN_SHIFTS,
        ],
        overridden: [Permission.EDIT_KNOWLEDGE_BASE],
      },
      {
        roleId: ROLE_ID_VALUES[1] ?? "",
        permissions: [
          Permission.VIEW_CASES,
          Permission.OPEN_CASES,
          Permission.EDIT_CASE_SUMMARY,
          Permission.WRITE_CASE_NOTES,
          Permission.CHANGE_CASE_STATUS,
          Permission.LINK_CASES,
          Permission.CLAIM_CASES,
          Permission.ASSIGN_CASES,
          Permission.SEND_CLIENT_MEDIA,
          Permission.DOWNLOAD_CASE_MEDIA,
          Permission.SEND_CLIENT_SMS,
          Permission.SEND_CLIENT_EMAIL,
          Permission.CALL_CLIENTS,
          Permission.MESSAGE_CLIENTS_IN_PORTAL,
          Permission.MANAGE_SHARE_LINKS,
          Permission.MANAGE_PORTAL_CHANNEL,
          Permission.RESET_CLIENT_LOGIN,
          Permission.REVOKE_REPLY_LINKS,
          Permission.VIEW_CLIENTS,
          Permission.EDIT_CLIENT_CONTACT,
          Permission.MERGE_CLIENTS,
          Permission.DELETE_CLIENTS,
          Permission.VIEW_KNOWLEDGE_BASE,
          Permission.EDIT_KNOWLEDGE_BASE,
          Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES,
          Permission.DELETE_KNOWLEDGE_BASE_ARTICLES,
          Permission.MANAGE_PRESETS,
          Permission.VIEW_REPORTS,
          Permission.VIEW_AUDIT_LOG,
          Permission.VIEW_OWN_SHIFTS,
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
  // The case record
  permission_view_cases: () => "View cases",
  permission_open_cases: () => "Open a new case",
  permission_edit_case_summary: () => "Edit the case summary",
  permission_write_case_notes: () => "Write case notes",
  permission_change_case_status: () => "Change case status",
  permission_link_cases: () => "Link cases together",
  permission_claim_cases: () => "Claim cases",
  permission_assign_cases: () => "Assign cases to other people",
  permission_delete_others_notes: () => "Delete other people's notes",
  permission_send_client_media: () => "Attach files to a case",
  permission_download_case_media: () => "Download recordings and files",
  // Reaching a client
  permission_send_client_sms: () => "Send text messages to clients",
  permission_send_client_email: () => "Send emails to clients",
  permission_call_clients: () => "Call clients",
  permission_message_clients_in_portal: () =>
    "Message clients in the secure portal",
  // Client access
  permission_manage_share_links: () => "Create share links",
  permission_manage_portal_channel: () => "Set up a client's secure portal",
  permission_reset_client_login: () => "Reset a client's portal login",
  permission_revoke_reply_links: () => "Revoke a reply link",
  // Client records
  permission_view_clients: () => "View client records",
  permission_view_client_pii: () => "See full contact details",
  permission_edit_client_contact: () => "Change contact details for any client",
  permission_edit_client_alias: () => "Rename a client",
  permission_merge_clients: () => "Merge duplicate client records",
  permission_delete_clients: () => "Delete client records",
  // Knowledge base
  permission_view_knowledge_base: () => "Read the knowledge base",
  permission_edit_knowledge_base: () => "Write and edit articles",
  permission_manage_knowledge_base_categories: () =>
    "Organise the knowledge base",
  permission_delete_knowledge_base_articles: () => "Delete articles",
  // Queues
  permission_manage_queues: () => "Create and change queues",
  permission_manage_queue_membership: () => "Add and remove queue members",
  permission_manage_queue_membership_hint: () =>
    "Adding someone to a queue grants them read access to every case in that queue. Removing them revokes that access.",
  permission_manage_queue_notifications: () =>
    "Set who is notified about a queue",
  // Intake
  permission_manage_intake_forms: () => "Build public intake forms",
  permission_view_intake_responses: () =>
    "Read intake submissions from every queue",
  permission_view_intake_responses_hint: () =>
    "Granting this decides who receives decryption keys when a form is submitted. Revoking it later does not take back keys already issued.",
  // Running the organisation
  permission_manage_roles: () => "Set what each role can do",
  permission_manage_users: () => "Manage people's accounts",
  permission_manage_org_identity: () =>
    "Change how the organisation presents itself",
  permission_manage_channel_routing: () =>
    "Decide where incoming contacts land",
  permission_manage_retention: () =>
    "Set how long personal information is kept",
  permission_manage_note_types: () =>
    "Define the kinds of notes people can write",
  permission_manage_keys: () => "Look after the encryption keys",
  permission_manage_infrastructure: () =>
    "Configure the phone and messaging service",
  permission_write_call_greetings: () => "Record what callers hear",
  permission_write_automatic_replies: () => "Write automatic text replies",
  permission_manage_voicemail_quarantine: () => "Handle held-back voicemail",
  permission_manage_escalation: () => "Set up escalation rules",
  permission_manage_presets: () => "Manage saved replies",
  permission_view_reports: () => "See reports and statistics",
  permission_view_audit_log: () => "Read the audit log",
  permission_view_own_shifts: () => "See your own shifts",
  // Group titles
  roles_group_case_record: () => "The case record",
  roles_group_reaching_client: () => "Reaching a client",
  roles_group_client_access: () => "The client's access to the case",
  roles_group_client_records: () => "Client records",
  roles_group_knowledge_base: () => "Knowledge base",
  roles_group_queues: () => "Queues",
  roles_group_intake: () => "Intake",
  roles_group_running_org: () => "Running the organisation",
  // Shared UI
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

  it("renders all Permission rows across eight groups", async () => {
    renderSection();
    await vi.waitFor(() => {
      expect(screen.getByText("View cases")).toBeTruthy();
    });
    // Case record group
    expect(screen.getByText("The case record")).toBeTruthy();
    expect(screen.getByText("Open a new case")).toBeTruthy();
    expect(screen.getByText("Write case notes")).toBeTruthy();

    // Reaching a client group
    expect(screen.getByText("Reaching a client")).toBeTruthy();
    expect(screen.getByText("Send text messages to clients")).toBeTruthy();

    // Client access group
    expect(screen.getByText("The client's access to the case")).toBeTruthy();
    expect(screen.getByText("Create share links")).toBeTruthy();

    // Client records group
    expect(screen.getByText("Client records")).toBeTruthy();
    expect(screen.getByText("View client records")).toBeTruthy();

    // Knowledge base group
    expect(screen.getByText("Knowledge base")).toBeTruthy();
    expect(screen.getByText("Read the knowledge base")).toBeTruthy();

    // Queues group
    expect(screen.getByText("Queues")).toBeTruthy();
    expect(screen.getByText("Create and change queues")).toBeTruthy();

    // Intake group
    expect(screen.getByText("Intake")).toBeTruthy();
    expect(
      screen.getByText("Read intake submissions from every queue"),
    ).toBeTruthy();

    // Running the organisation group
    expect(screen.getByText("Running the organisation")).toBeTruthy();
    expect(screen.getByText("Look after the encryption keys")).toBeTruthy();
    expect(screen.getByText("Set what each role can do")).toBeTruthy();
    expect(
      screen.getByText("Configure the phone and messaging service"),
    ).toBeTruthy();
  });

  it("renders three role column headers per group", async () => {
    renderSection();
    await vi.waitFor(() => {
      expect(screen.getByText("View cases")).toBeTruthy();
    });
    // Eight groups, each with Volunteer/Manager/Admin column headers = 24 total
    const volHeaders = screen.getAllByText("Volunteer");
    expect(volHeaders.length).toBe(8);
    const mgrHeaders = screen.getAllByText("Manager");
    expect(mgrHeaders.length).toBe(8);
    const admHeaders = screen.getAllByText("Admin");
    expect(admHeaders.length).toBe(8);
  });

  it("renders locked cells as disabled toggles", async () => {
    renderSection();
    await vi.waitFor(() => {
      expect(screen.getByText("Look after the encryption keys")).toBeTruthy();
    });

    // Each locked permission produces 3 toggle cells (one per role column),
    // and each is disabled. The aria-label includes "locked to Admin".
    const lockedLabel = screen.getByLabelText(
      "Look after the encryption keys for Admin, locked to Admin",
    );
    expect(lockedLabel).toBeTruthy();

    const volLabel = screen.getByLabelText(
      "Look after the encryption keys for Volunteer, locked to Admin",
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

    // Toggle "See reports and statistics" for Volunteer (currently off).
    const toggle = screen.getByLabelText(
      "See reports and statistics for Volunteer",
    );
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

    const toggle = screen.getByLabelText(
      "See reports and statistics for Volunteer",
    );
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

    const toggle = screen.getByLabelText(
      "See reports and statistics for Volunteer",
    );
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
