// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import type * as ToastNS from "$lib/stores/toast.svelte.js";
import type * as ContextNS from "$lib/shell/context.js";
import { mockToastShow } from "$mocks/toast.js";
import { mockNavbarCtx } from "$mocks/shell-context.js";
import type * as MessagesNS from "$lib/paraglide/messages.js";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as SvelteQueryNS from "@tanstack/svelte-query";
import type * as BufferEncodingNS from "$lib/utils/buffer-encoding.js";
import type * as ContextNS2 from "$lib/crypto/context.js";
import type * as SectionScrollNavNS from "$lib/components/SectionScrollNav.svelte";
import type * as DecryptPlaceholderNS from "$lib/components/DecryptPlaceholder.svelte";
import type * as PathsNS from "$app/paths";
import type * as NavigationNS from "$app/navigation";
import type * as UseSectionScrollNS from "$lib/components/useSectionScroll.svelte.js";

// --- Controllable mock state ---

let mockQueuesData:
  | Array<{
      id: string;
      encrypted_name: string;
      sort_order: number;
      openCount: string;
    }>
  | undefined;
let mockQueuesLoading = false;
// --- Mocks ---

vi.mock("$app/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof NavigationNS>()),
  goto: vi.fn(),
}));

vi.mock("$app/paths", async (importOriginal) => ({
  ...(await importOriginal<typeof PathsNS>()),
  resolve: (path: string) => path,
  base: "",
  assets: "",
}));
vi.mock(
  "$lib/shell/context.js",
  async () =>
    (
      await import("$mocks/shell-context.js")
    ).shellContextMock() satisfies typeof ContextNS,
);

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContextNS2>()),
  getOrgDecryptCache: () => ({
    decrypt: (_id: string, _data: unknown) => "Decrypted Queue",
  }),
}));

vi.mock(
  "$lib/stores/toast.svelte.js",
  async () =>
    (await import("$mocks/toast.js")).toastMock() satisfies typeof ToastNS,
);

vi.mock("$lib/utils/buffer-encoding.js", async (importOriginal) => ({
  ...(await importOriginal<typeof BufferEncodingNS>()),
  base64ToUint8Array: (s: string) => new Uint8Array(Buffer.from(s, "base64")),
}));

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryNS>()),
  useQueryClient: () => ({
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  }),
  createQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    return {
      get isPending() {
        return mockQueuesLoading;
      },
      get isLoading() {
        return mockQueuesLoading;
      },
      isError: false,
      error: null,
      get data() {
        return mockQueuesData;
      },
    };
  },
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    tickets: {
      myQueues: { query: vi.fn().mockResolvedValue([]) },
    },
  },
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesNS>()),
  vol_page_title: () => "Volunteer",
  vol_section_access: () => "Your Access",
  vol_access_tickets: () => "Take and reply to tickets in your queues",
  vol_access_call: () => "Call and text clients",
  vol_access_kb: () => "Browse the Knowledge Base",
  vol_access_shifts: () => "Manage your shifts",
  vol_access_security: () => "View your security status",
  vol_section_queues: () => "Your Queues",
  vol_queues_empty: () => "You are not assigned to any queues yet.",
  vol_section_protected: () => "How You're Protected",
  vol_protected_name: () =>
    "Your real name is end-to-end encrypted. Only your team can read it.",
  vol_protected_identifier: () =>
    "Your login identifier is a pseudonym, not linked to your real identity.",
  vol_protected_keys: () =>
    "Your encryption keys are derived from your password. The server never holds them.",
  vol_section_clients: () => "How Clients Are Protected",
  vol_clients_encrypted: () =>
    "All client information is encrypted before it reaches the server. Only your team can decrypt it.",
  vol_link_security_status: () => "View Security Status",
  vol_link_replay_tour: () => "Replay App Tour",
  admin_coming_soon: () => "Coming soon",
}));

vi.mock(
  "$lib/components/DecryptPlaceholder.svelte",
  async () =>
    ({
      default: (
        await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
      ).default as unknown as (typeof DecryptPlaceholderNS)["default"],
    }) satisfies typeof DecryptPlaceholderNS,
);

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
        active: "access",
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
  mockQueuesData = undefined;
  mockQueuesLoading = false;
  mockNavbarCtx.current = undefined;
  mockToastShow.mockClear();
});

afterEach(cleanup);

const PageModule = await import("./+page.svelte");

function renderPage(): ReturnType<typeof render> {
  return render(PageModule.default);
}

// --- Tests ---

describe("Volunteer role page", () => {
  describe("section rendering", () => {
    it("renders all four section headings", () => {
      renderPage();

      expect(screen.getByText("Your Access")).toBeTruthy();
      expect(screen.getByText("Your Queues")).toBeTruthy();
      expect(screen.getByText("How You're Protected")).toBeTruthy();
      expect(screen.getByText("How Clients Are Protected")).toBeTruthy();
    });

    it("renders all access list items", () => {
      renderPage();

      expect(
        screen.getByText("Take and reply to tickets in your queues"),
      ).toBeTruthy();
      expect(screen.getByText("Call and text clients")).toBeTruthy();
      expect(screen.getByText("Browse the Knowledge Base")).toBeTruthy();
      expect(screen.getByText("Manage your shifts")).toBeTruthy();
      expect(screen.getByText("View your security status")).toBeTruthy();
    });

    it("renders all protection explanations", () => {
      renderPage();

      expect(
        screen.getByText(
          "Your real name is end-to-end encrypted. Only your team can read it.",
        ),
      ).toBeTruthy();
      expect(
        screen.getByText(
          "Your login identifier is a pseudonym, not linked to your real identity.",
        ),
      ).toBeTruthy();
      expect(
        screen.getByText(
          "Your encryption keys are derived from your password. The server never holds them.",
        ),
      ).toBeTruthy();
    });

    it("renders client protection explanation", () => {
      renderPage();

      expect(
        screen.getByText(
          "All client information is encrypted before it reaches the server. Only your team can decrypt it.",
        ),
      ).toBeTruthy();
    });
  });

  describe("queue list", () => {
    it("shows empty message when user has no queue assignments", () => {
      mockQueuesData = [];
      renderPage();

      expect(
        screen.getByText("You are not assigned to any queues yet."),
      ).toBeTruthy();
    });

    it("shows decrypted queue names for assigned queues", () => {
      mockQueuesData = [
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
      expect(queueItems).toHaveLength(2);
    });
  });

  describe("footer links", () => {
    it("fires coming soon toast for View Security Status", async () => {
      renderPage();

      const btn = screen.getByText("View Security Status");
      await fireEvent.click(btn);

      expect(mockToastShow).toHaveBeenCalledWith("Coming soon");
    });

    it("fires coming soon toast for Replay App Tour", async () => {
      renderPage();

      const btn = screen.getByText("Replay App Tour");
      await fireEvent.click(btn);

      expect(mockToastShow).toHaveBeenCalledWith("Coming soon");
    });
  });

  describe("navbar context", () => {
    it("sets navbar title to Volunteer", () => {
      renderPage();

      expect(mockNavbarCtx.current).toEqual(
        expect.objectContaining({ title: "Volunteer" }),
      );
    });

    it("sets subnavbar snippet for section scroll nav", () => {
      renderPage();

      expect(mockNavbarCtx.current).toHaveProperty("subnavbar");
    });
  });

  describe("accessibility", () => {
    it("renders without permission gating (accessible to all authenticated users)", () => {
      renderPage();

      expect(screen.getByText("Your Access")).toBeTruthy();
    });

    it("has scroll-anchored section divs for each content group", () => {
      const { container } = renderPage();

      expect(container.querySelector("#section-access")).toBeTruthy();
      expect(container.querySelector("#section-queues")).toBeTruthy();
      expect(container.querySelector("#section-protected")).toBeTruthy();
      expect(container.querySelector("#section-clients")).toBeTruthy();
    });
  });
});
