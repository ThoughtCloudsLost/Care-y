// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

// --- Controllable mock state ---

let mockAllQueuesData:
  | Array<{
      id: string;
      encryptedName: string;
      sortOrder: number;
      openCount: string;
    }>
  | undefined;
let mockAllQueuesLoading = false;

let mockMyQueuesData:
  | Array<{
      id: string;
      encrypted_name: string;
      sort_order: number;
      openCount: string;
    }>
  | undefined;
let mockMyQueuesLoading = false;

const mockToastShow = vi.fn();
const mockGoto = vi.fn();

// --- Mocks ---

vi.mock("$app/navigation", () => ({
  goto: (...args: unknown[]): void => {
    mockGoto(...args);
  },
}));

vi.mock("$app/paths", () => ({
  resolve: (path: string) => path,
  base: "",
  assets: "",
}));

const mockNavbarCtx = { current: undefined as unknown };
let mockPermissions = new Set([
  "manage_users",
  "view_reports",
  "manage_queues",
]);

vi.mock("$lib/shell/context.js", () => ({
  getNavbarOverrideCtx: () => mockNavbarCtx,
  getScrollContainer: () => () => null,
  getTabbarOverrideCtx: () => ({ current: undefined }),
}));

vi.mock("$lib/crypto/context.js", () => ({
  getCurrentPermissions: () => () => mockPermissions,
  getOrgDecryptCache: () => ({
    decrypt: (_id: string, _data: unknown) => "Decrypted Queue",
  }),
}));

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow, current: null, dismiss: vi.fn() },
}));

vi.mock("$lib/utils/buffer-encoding.js", () => ({
  base64ToUint8Array: (s: string) => new Uint8Array(Buffer.from(s, "base64")),
}));

vi.mock("@tanstack/svelte-query", () => ({
  useQueryClient: () => ({
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  }),
  createQuery: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const key = (opts.queryKey as string[])[0];
    if (key === "queues") {
      return {
        get isPending() {
          return mockAllQueuesLoading;
        },
        get isLoading() {
          return mockAllQueuesLoading;
        },
        isError: false,
        error: null,
        get data() {
          return mockAllQueuesData;
        },
      };
    }
    return {
      get isPending() {
        return mockMyQueuesLoading;
      },
      get isLoading() {
        return mockMyQueuesLoading;
      },
      isError: false,
      error: null,
      get data() {
        return mockMyQueuesData;
      },
    };
  },
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      listQueues: { query: vi.fn().mockResolvedValue([]) },
      myQueues: { query: vi.fn().mockResolvedValue([]) },
    },
  },
}));

vi.mock("$lib/paraglide/messages.js", () => ({
  mgr_page_title: () => "Manager",
  mgr_section_role: () => "Your Role",
  mgr_role_reports: () => "View reports and team metrics",
  mgr_role_queues: () => "See all queues, not just your assignments",
  mgr_role_tickets: () => "Elevated ticket management permissions",
  mgr_section_ops: () => "Operations Snapshot",
  mgr_ops_total_tickets: ({ count }: { count: string }) =>
    `${count} open tickets`,
  mgr_ops_queue_depth: ({ count }: { count: string }) => `${count} open`,
  mgr_ops_no_queues: () => "No active queues",
  mgr_section_queues: () => "Your Queues",
  mgr_section_protected: () => "Protection",
  mgr_protected_summary: () =>
    "Your identity and client data are end-to-end encrypted. The server never holds plaintext.",
  mgr_link_reports: () => "View Reports",
  mgr_link_security_status: () => "View Security Status",
  vol_queues_empty: () => "You are not assigned to any queues yet.",
  admin_coming_soon: () => "Coming soon",
}));

vi.mock("$lib/components/DecryptPlaceholder.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/SectionScrollNav.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/useSectionScroll.svelte.js", () => ({
  createSectionScroll: () => ({ active: "role", scrollTo: vi.fn() }),
}));

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

// --- Setup ---

beforeEach(() => {
  mockAllQueuesData = undefined;
  mockAllQueuesLoading = false;
  mockMyQueuesData = undefined;
  mockMyQueuesLoading = false;
  mockNavbarCtx.current = undefined;
  mockToastShow.mockClear();
  mockGoto.mockClear();
  mockPermissions = new Set(["manage_users", "view_reports", "manage_queues"]);
});

afterEach(cleanup);

const PageModule = await import("./+page.svelte");

function renderPage(): ReturnType<typeof render> {
  return render(PageModule.default);
}

// --- Tests ---

describe("Manager role page", () => {
  describe("section rendering", () => {
    it("renders all four section headings", () => {
      renderPage();

      expect(screen.getByText("Your Role")).toBeTruthy();
      expect(screen.getByText("Operations Snapshot")).toBeTruthy();
      expect(screen.getByText("Your Queues")).toBeTruthy();
      expect(screen.getByText("Protection")).toBeTruthy();
    });

    it("renders all role capability items", () => {
      renderPage();

      expect(screen.getByText("View reports and team metrics")).toBeTruthy();
      expect(
        screen.getByText("See all queues, not just your assignments"),
      ).toBeTruthy();
      expect(
        screen.getByText("Elevated ticket management permissions"),
      ).toBeTruthy();
    });

    it("renders protection summary", () => {
      renderPage();

      expect(
        screen.getByText(
          "Your identity and client data are end-to-end encrypted. The server never holds plaintext.",
        ),
      ).toBeTruthy();
    });
  });

  describe("operations snapshot", () => {
    it("shows total open tickets count", () => {
      mockAllQueuesData = [
        {
          id: "q-1",
          encryptedName: btoa("encrypted"),
          sortOrder: 0,
          openCount: "5",
        },
        {
          id: "q-2",
          encryptedName: btoa("encrypted2"),
          sortOrder: 1,
          openCount: "3",
        },
      ];
      renderPage();

      expect(screen.getByText("8 open tickets")).toBeTruthy();
    });

    it("shows queue depths with decrypted names", () => {
      mockAllQueuesData = [
        {
          id: "q-1",
          encryptedName: btoa("encrypted"),
          sortOrder: 0,
          openCount: "5",
        },
      ];
      renderPage();

      expect(screen.getByText("Decrypted Queue")).toBeTruthy();
      expect(screen.getByText("5 open")).toBeTruthy();
    });

    it("shows no queues message when empty", () => {
      mockAllQueuesData = [];
      renderPage();

      expect(screen.getByText("No active queues")).toBeTruthy();
    });
  });

  describe("personal queue list", () => {
    it("shows empty message when user has no queue assignments", () => {
      mockMyQueuesData = [];
      renderPage();

      expect(
        screen.getByText("You are not assigned to any queues yet."),
      ).toBeTruthy();
    });

    it("shows decrypted queue names for assigned queues", () => {
      mockMyQueuesData = [
        {
          id: "q-1",
          encrypted_name: btoa("encrypted"),
          sort_order: 0,
          openCount: "3",
        },
        {
          id: "q-2",
          encrypted_name: btoa("encrypted2"),
          sort_order: 1,
          openCount: "0",
        },
      ];
      renderPage();

      const queueItems = screen.getAllByText("Decrypted Queue");
      expect(queueItems.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("footer links", () => {
    it("navigates to reports on View Reports click", async () => {
      renderPage();

      const btn = screen.getByText("View Reports");
      await fireEvent.click(btn);

      expect(mockGoto).toHaveBeenCalledWith("/admin/organization?tab=reports");
    });

    it("fires coming soon toast for View Security Status", async () => {
      renderPage();

      const btn = screen.getByText("View Security Status");
      await fireEvent.click(btn);

      expect(mockToastShow).toHaveBeenCalledWith("Coming soon");
    });
  });

  describe("access control", () => {
    it("redirects volunteer-role users", () => {
      mockPermissions = new Set(["view_tickets"]);
      renderPage();

      expect(mockGoto).toHaveBeenCalledWith("/");
    });
  });

  describe("navbar context", () => {
    it("sets navbar title to Manager", () => {
      renderPage();

      expect(mockNavbarCtx.current).toEqual(
        expect.objectContaining({ title: "Manager" }),
      );
    });

    it("sets subnavbar snippet for section scroll nav", () => {
      renderPage();

      expect(mockNavbarCtx.current).toHaveProperty("subnavbar");
    });
  });

  describe("accessibility", () => {
    it("has scroll-anchored section divs for each content group", () => {
      const { container } = renderPage();

      expect(container.querySelector("#section-role")).toBeTruthy();
      expect(container.querySelector("#section-ops")).toBeTruthy();
      expect(container.querySelector("#section-queues")).toBeTruthy();
      expect(container.querySelector("#section-protected")).toBeTruthy();
    });
  });
});
