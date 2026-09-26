// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as ToastNS from "$lib/stores/toast.svelte.js";
import type * as ContextNS from "$lib/shell/context.js";
import { mockToastShow } from "$mocks/toast.js";
import { mockNavbarCtx } from "$mocks/shell-context.js";
import type * as ErrorsNS from "$lib/errors.js";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as SvelteQueryNS from "@tanstack/svelte-query";
import type * as ContextNS2 from "$lib/crypto/context.js";
import type * as SectionScrollNavNS from "$lib/components/SectionScrollNav.svelte";
import type * as PathsNS from "$app/paths";
import type * as NavigationNS from "$app/navigation";
import type * as UseSectionScrollNS from "$lib/components/useSectionScroll.svelte.js";
import { Permission } from "@care-y/shared";
import { setPermissions, getMockPermissions } from "$mocks/permissions.js";
// Data each hub query returns once fetched, keyed by the last segment of
// its query key. A key with no entry stays loading.
const mockQueryData = new Map<string, unknown>();

const hubQueries = vi.hoisted(() => ({
  hubActiveUserCount: vi.fn().mockResolvedValue({ count: 0 }),
  hubQueueCount: vi.fn().mockResolvedValue({ count: 0 }),
  hubKeyStatus: vi.fn().mockResolvedValue({ status: "ok" }),
  hubRetention: vi.fn().mockResolvedValue({ retentionDays: null }),
  hubBlocklistCount: vi.fn().mockResolvedValue({ count: 0 }),
  hubGreetingCount: vi.fn().mockResolvedValue({ count: 0 }),
  hubTemplateCount: vi.fn().mockResolvedValue({ count: 0 }),
  getProvisionedPhones: vi.fn().mockResolvedValue([]),
}));

const mockGoto = vi.fn();
// --- Mocks ---

vi.mock("$app/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof NavigationNS>()),
  goto: mockGoto,
}));

vi.mock("$app/paths", async (importOriginal) => ({
  ...(await importOriginal<typeof PathsNS>()),
  resolve: (path: string) => path,
  base: "",
  assets: "",
}));

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContextNS2>()),
  getCurrentPermissions: () => getMockPermissions,
}));
vi.mock(
  "$lib/shell/context.js",
  async () =>
    (
      await import("$mocks/shell-context.js")
    ).shellContextMock() satisfies typeof ContextNS,
);

vi.mock(
  "$lib/stores/toast.svelte.js",
  async () =>
    (await import("$mocks/toast.js")).toastMock() satisfies typeof ToastNS,
);

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryNS>()),
  useQueryClient: () => ({
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
    getQueriesData: vi.fn().mockReturnValue([]),
  }),
  // Mirrors TanStack's gate: a disabled query never runs its queryFn and
  // holds no data.
  createQuery: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const key = opts.queryKey as readonly string[];
    const name = key.at(-1) ?? "";
    const enabled = opts.enabled !== false;
    if (enabled) void (opts.queryFn as () => Promise<unknown>)();
    const data = (): unknown => (enabled ? mockQueryData.get(name) : undefined);
    return {
      get isLoading() {
        return enabled && data() === undefined;
      },
      isError: false,
      error: null,
      get data() {
        return data();
      },
    };
  },
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    auth: {
      hubActiveUserCount: { query: hubQueries.hubActiveUserCount },
      hubQueueCount: { query: hubQueries.hubQueueCount },
      hubKeyStatus: { query: hubQueries.hubKeyStatus },
      hubRetention: { query: hubQueries.hubRetention },
      hubBlocklistCount: { query: hubQueries.hubBlocklistCount },
      hubGreetingCount: { query: hubQueries.hubGreetingCount },
      hubTemplateCount: { query: hubQueries.hubTemplateCount },
    },
    telephonyAdmin: {
      getProvisionedPhones: { query: hubQueries.getProvisionedPhones },
    },
  },
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ErrorsNS>()),
  requireRouter: <T>(router: T) => router,
}));

// Spread the real module so a newly added panel key does not break this file;
// only the strings asserted below are pinned.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
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
  intake_forms_title: () => "Intake Forms",
  hub_intake_forms_subtitle: () => "Design and manage client intake forms",
  hub_general_subtitle: () => "Organization settings",
  hub_terminology_subtitle: () => "Custom terms",
  hub_note_types_subtitle: () => "Note categories",
  hub_users_subtitle: () => "Manage users, roles, and invitations",
  hub_queues_subtitle: () => "Create and assign ticket queues",
  hub_telephony_subtitle: () => "Phone numbers and call routing",
  hub_blocklist_subtitle: () => "Blocked numbers",
  hub_greetings_subtitle: () => "Recorded greetings and hold music",
  hub_sms_templates_subtitle: () => "Automated SMS message templates",
  hub_branding_subtitle: () => "Organization name, colors, and theme",
  hub_keys_subtitle: () => "Encryption key status and rotation",
  hub_retention_subtitle: () =>
    "Personal identifying information retention and lifecycle",
  hub_reports_subtitle: () => "Usage statistics and activity reports",
  admin_hub_title: () => "Admin",
  admin_hub_badge_active: ({ count }: { count: string }) => `${count} active`,
  admin_hub_badge_queues: ({ count }: { count: string }) => `${count} queues`,
  admin_hub_badge_keys_ok: () => "OK",
  admin_hub_badge_keys_missing: () => "Action needed",
  admin_hub_badge_retention_days: ({ count }: { count: string }) =>
    `${count} days`,
  admin_hub_badge_retention_disabled: () => "Disabled",
  admin_hub_badge_phones: ({ count }: { count: string }) => `${count} numbers`,
  admin_hub_badge_no_phones: () => "No phones",
  admin_hub_badge_blocked: ({ count }: { count: string }) => `${count} blocked`,
  admin_hub_badge_greetings: ({ count }: { count: string }) =>
    `${count} greetings`,
  admin_hub_badge_templates: ({ count }: { count: string }) =>
    `${count} templates`,
  admin_coming_soon: () => "Coming soon",
  panel_group_analytics: () => "Analytics",
  panel_analytics_overview: () => "Impact",
  panel_analytics_operations: () => "Operations",
  panel_analytics_deep: () => "Research",
  hub_analytics_overview_subtitle: () => "Dashboard overview",
  hub_analytics_operations_subtitle: () => "Operational metrics",
  hub_analytics_deep_subtitle: () => "Advanced analytics",
  panel_call_log: () => "Call Log",
  hub_call_log_subtitle: () => "Browse call and voicemail history",
  panel_audit_log: () => "Audit Log",
  hub_audit_log_subtitle: () => "Review system activity and change history",
  panel_presets: () => "Saved Replies",
  hub_presets_subtitle: () => "Reusable reply templates for composing messages",
}));

vi.mock(
  "$lib/components/SectionScrollNav.svelte",
  async () =>
    ({
      default: (
        await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
      ).default as unknown as (typeof SectionScrollNavNS)["default"],
    }) satisfies typeof SectionScrollNavNS,
);

vi.mock(
  "$lib/components/useSectionScroll.svelte.js",
  () =>
    ({
      createSectionScroll: (() => ({
        active: "people",
        scrollTo: vi.fn(),
      })) as unknown as typeof UseSectionScrollNS.createSectionScroll,
    }) satisfies typeof UseSectionScrollNS,
);

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

// --- Setup ---

beforeEach(() => {
  setPermissions(
    Permission.MANAGE_USERS,
    Permission.MANAGE_KEYS,
    Permission.MANAGE_ORG_IDENTITY,
    Permission.MANAGE_RETENTION,
    Permission.MANAGE_NOTE_TYPES,
    Permission.MANAGE_INTAKE_FORMS,
    Permission.MANAGE_QUEUES,
    Permission.MANAGE_INFRASTRUCTURE,
    Permission.WRITE_CALL_GREETINGS,
    Permission.WRITE_AUTOMATIC_REPLIES,
    Permission.MANAGE_VOICEMAIL_QUARANTINE,
    Permission.VIEW_AUDIT_LOG,
    Permission.VIEW_REPORTS,
    Permission.MANAGE_PRESETS,
  );
  mockQueryData.clear();
  for (const query of Object.values(hubQueries)) query.mockClear();
  mockNavbarCtx.current = undefined;
  mockGoto.mockClear();
  mockToastShow.mockClear();
});

afterEach(cleanup);

const PageModule = await import("./+page.svelte");

function renderPage(): ReturnType<typeof render> {
  return render(PageModule.default);
}

// --- Tests ---

describe("Admin hub page", () => {
  describe("permission guard (destination-derived)", () => {
    it("redirects to home when user holds no destination permission", () => {
      setPermissions();
      renderPage();

      expect(mockGoto).toHaveBeenCalledWith("/");
    });

    it("does not redirect when user has MANAGE_USERS", () => {
      setPermissions(Permission.MANAGE_USERS);
      renderPage();

      expect(mockGoto).not.toHaveBeenCalled();
    });

    it("does not redirect when user has MANAGE_KEYS", () => {
      setPermissions(Permission.MANAGE_KEYS);
      renderPage();

      expect(mockGoto).not.toHaveBeenCalled();
    });

    it("does not redirect when user has MANAGE_ORG_IDENTITY", () => {
      setPermissions(Permission.MANAGE_ORG_IDENTITY);
      renderPage();

      expect(mockGoto).not.toHaveBeenCalled();
    });

    it("admits a default Manager with MANAGE_INTAKE_FORMS (no old three)", () => {
      setPermissions(Permission.MANAGE_INTAKE_FORMS, Permission.VIEW_AUDIT_LOG);
      renderPage();

      expect(mockGoto).not.toHaveBeenCalled();
    });

    it("renders exactly the destinations the default Manager holds", () => {
      setPermissions(Permission.MANAGE_INTAKE_FORMS, Permission.VIEW_AUDIT_LOG);
      renderPage();

      // Visible destinations for these two permissions
      expect(screen.getByText("Intake Forms")).toBeTruthy();
      expect(screen.getByText("Audit Log")).toBeTruthy();

      // Destinations that require other permissions stay hidden
      expect(screen.queryByText("Users")).toBeNull();
      expect(screen.queryByText("Queues")).toBeNull();
      expect(screen.queryByText("Keys")).toBeNull();
      expect(screen.queryByText("Telephony")).toBeNull();
    });

    it("does not redirect with any single destination permission", () => {
      setPermissions(Permission.MANAGE_QUEUES);
      renderPage();

      expect(mockGoto).not.toHaveBeenCalled();
    });

    it("shows Saved Replies tile when user has MANAGE_PRESETS", () => {
      setPermissions(Permission.MANAGE_PRESETS);
      renderPage();

      expect(screen.getByText("Saved Replies")).toBeTruthy();
      expect(
        screen.getByText("Reusable reply templates for composing messages"),
      ).toBeTruthy();
      expect(mockGoto).not.toHaveBeenCalled();
    });
  });

  describe("grouped list rendering", () => {
    it("renders all three group headings for full-admin permissions", () => {
      renderPage();

      expect(screen.getByText("People")).toBeTruthy();
      expect(screen.getByText("Communications")).toBeTruthy();
      expect(screen.getByText("Organization")).toBeTruthy();
    });

    it("renders destination items with subtitles", () => {
      renderPage();

      expect(screen.getByText("Users")).toBeTruthy();
      expect(
        screen.getByText("Manage users, roles, and invitations"),
      ).toBeTruthy();
      expect(screen.getByText("Queues")).toBeTruthy();
      expect(screen.getByText("Create and assign ticket queues")).toBeTruthy();
    });

    it("only renders groups the user has permission for", () => {
      setPermissions(Permission.MANAGE_USERS, Permission.MANAGE_QUEUES);
      renderPage();

      expect(screen.getByText("People")).toBeTruthy();
      expect(screen.queryByText("Communications")).toBeNull();
      // Every Organization destination sits behind a key this caller does
      // not hold, so the whole group stays hidden. Forms moved off
      // MANAGE_QUEUES onto MANAGE_INTAKE_FORMS.
      expect(screen.queryByText("Organization")).toBeNull();
    });
  });

  describe("destination rendering", () => {
    it("renders implemented destinations without disabled styling", () => {
      renderPage();

      const usersText = screen.getByText("Users");
      expect(usersText).toBeTruthy();
    });

    it("renders unimplemented destinations (for coming-soon tap)", () => {
      renderPage();

      expect(screen.getByText("Telephony")).toBeTruthy();
      expect(screen.getByText("Phone numbers and call routing")).toBeTruthy();
    });
  });

  describe("status badges", () => {
    it("renders badges when hub data is available", () => {
      mockQueryData.set("hubActiveUserCount", { count: 5 });
      mockQueryData.set("hubQueueCount", { count: 3 });
      mockQueryData.set("hubKeyStatus", { status: "ok" });
      mockQueryData.set("hubRetention", { retentionDays: 90 });
      renderPage();

      expect(screen.getByText("5 active")).toBeTruthy();
      expect(screen.getByText("3 queues")).toBeTruthy();
      expect(screen.getByText("OK")).toBeTruthy();
      expect(screen.getByText("90 days")).toBeTruthy();
    });

    it("shows 'Action needed' when key status is missing", () => {
      mockQueryData.set("hubKeyStatus", { status: "missing" });
      mockQueryData.set("hubRetention", { retentionDays: null });
      renderPage();

      expect(screen.getByText("Action needed")).toBeTruthy();
      expect(screen.getByText("Disabled")).toBeTruthy();
    });

    it("renders communications badges with success variant when counts > 0", () => {
      mockQueryData.set("hubBlocklistCount", { count: 7 });
      mockQueryData.set("hubGreetingCount", { count: 3 });
      mockQueryData.set("hubTemplateCount", { count: 5 });
      mockQueryData.set("provisionedPhones", [
        { number: "+15550001111", sid: "PN001" },
        { number: "+15550002222", sid: "PN002" },
        { number: "+15550003333", sid: "PN003" },
        { number: "+15550004444", sid: "PN004" },
      ]);
      renderPage();

      expect(screen.getByText("4 numbers")).toBeTruthy();
      expect(screen.getByText("7 blocked")).toBeTruthy();
      expect(screen.getByText("3 greetings")).toBeTruthy();
      expect(screen.getByText("5 templates")).toBeTruthy();

      const phoneBadge = screen.getByText("4 numbers");
      expect(phoneBadge.closest(".hub-badge-ok")).toBeTruthy();

      const greetingBadge = screen.getByText("3 greetings");
      expect(greetingBadge.closest(".hub-badge-warning")).toBeNull();
      const templateBadge = screen.getByText("5 templates");
      expect(templateBadge.closest(".hub-badge-warning")).toBeNull();
    });

    it("shows warning variant when communications counts are zero", () => {
      mockQueryData.set("hubBlocklistCount", { count: 0 });
      mockQueryData.set("hubGreetingCount", { count: 0 });
      mockQueryData.set("hubTemplateCount", { count: 0 });
      mockQueryData.set("provisionedPhones", []);
      renderPage();

      expect(screen.getByText("No phones")).toBeTruthy();
      expect(screen.getByText("0 blocked")).toBeTruthy();
      expect(screen.getByText("0 greetings")).toBeTruthy();
      expect(screen.getByText("0 templates")).toBeTruthy();

      const phoneBadge = screen.getByText("No phones");
      expect(phoneBadge.closest(".hub-badge-warning")).toBeTruthy();
      const greetingBadge = screen.getByText("0 greetings");
      expect(greetingBadge.closest(".hub-badge-warning")).toBeTruthy();
      const templateBadge = screen.getByText("0 templates");
      expect(templateBadge.closest(".hub-badge-warning")).toBeTruthy();

      const blockBadge = screen.getByText("0 blocked");
      expect(blockBadge.closest(".hub-badge-warning")).toBeNull();
    });

    it("does not render badges when query has no data yet", () => {
      renderPage();

      expect(screen.queryByText(/^\d+ active$/)).toBeNull();
      expect(screen.queryByText(/^\d+ queues$/)).toBeNull();
    });

    it("shows no telephony warning while the phones query has no data", () => {
      renderPage();

      expect(screen.getByText("Telephony")).toBeTruthy();
      expect(screen.queryByText("No phones")).toBeNull();
      expect(screen.queryByText(/^\d+ numbers$/)).toBeNull();
    });

    it("makes no request for a row whose permission the account lacks", () => {
      setPermissions(Permission.MANAGE_USERS);
      renderPage();

      expect(hubQueries.hubActiveUserCount).toHaveBeenCalledOnce();
      expect(hubQueries.hubQueueCount).not.toHaveBeenCalled();
      expect(hubQueries.hubKeyStatus).not.toHaveBeenCalled();
      expect(hubQueries.hubRetention).not.toHaveBeenCalled();
      expect(hubQueries.hubBlocklistCount).not.toHaveBeenCalled();
      expect(hubQueries.hubGreetingCount).not.toHaveBeenCalled();
      expect(hubQueries.hubTemplateCount).not.toHaveBeenCalled();
      expect(hubQueries.getProvisionedPhones).not.toHaveBeenCalled();
    });

    it("shows a row's badge from its own query without MANAGE_ROLES", () => {
      setPermissions(Permission.MANAGE_RETENTION);
      mockQueryData.set("hubRetention", { retentionDays: 90 });
      mockQueryData.set("hubActiveUserCount", { count: 5 });
      renderPage();

      expect(hubQueries.hubRetention).toHaveBeenCalledOnce();
      expect(screen.getByText("90 days")).toBeTruthy();
      expect(screen.queryByText("5 active")).toBeNull();
    });
  });

  describe("navbar context", () => {
    it("sets navbar title to Admin", () => {
      renderPage();

      expect(mockNavbarCtx.current).toEqual(
        expect.objectContaining({ title: "Admin" }),
      );
    });

    it("sets subnavbar snippet", () => {
      renderPage();

      expect(mockNavbarCtx.current).toHaveProperty("subnavbar");
    });
  });

  describe("log destinations", () => {
    it("renders Call Log destination for a manager with VIEW_REPORTS", () => {
      setPermissions(
        Permission.MANAGE_USERS,
        Permission.MANAGE_KEYS,
        Permission.MANAGE_ORG_IDENTITY,
        Permission.MANAGE_QUEUES,
        Permission.MANAGE_INFRASTRUCTURE,
        Permission.VIEW_REPORTS,
        Permission.VIEW_AUDIT_LOG,
      );
      renderPage();

      expect(screen.getByText("Call Log")).toBeTruthy();
      expect(
        screen.getByText("Browse call and voicemail history"),
      ).toBeTruthy();
    });

    it("renders Audit Log destination for a manager with VIEW_AUDIT_LOG", () => {
      setPermissions(
        Permission.MANAGE_USERS,
        Permission.MANAGE_KEYS,
        Permission.MANAGE_ORG_IDENTITY,
        Permission.MANAGE_QUEUES,
        Permission.MANAGE_INFRASTRUCTURE,
        Permission.VIEW_REPORTS,
        Permission.VIEW_AUDIT_LOG,
      );
      renderPage();

      expect(screen.getByText("Audit Log")).toBeTruthy();
      expect(
        screen.getByText("Review system activity and change history"),
      ).toBeTruthy();
    });

    it("hides both log destinations when user has neither VIEW_REPORTS nor VIEW_AUDIT_LOG", () => {
      setPermissions(Permission.MANAGE_QUEUES);
      renderPage();

      expect(screen.queryByText("Call Log")).toBeNull();
      expect(screen.queryByText("Audit Log")).toBeNull();
    });

    it("shows Call Log but hides Audit Log when user has VIEW_REPORTS without VIEW_AUDIT_LOG", () => {
      setPermissions(Permission.VIEW_REPORTS);
      renderPage();

      expect(screen.getByText("Call Log")).toBeTruthy();
      expect(screen.queryByText("Audit Log")).toBeNull();
    });
  });
});
