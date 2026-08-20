// @vitest-environment jsdom
/**
 * TicketPanelContent tests: phone row rendering and action emission.
 *
 * Covers: phone row visible when clientPhone is present, hidden when null,
 * tapping the phone row emits the "phone" action.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import type * as SvelteQuery from "@tanstack/svelte-query";
import type * as Messages from "$lib/paraglide/messages.js";
import type * as WithTerms from "$lib/terminology/with-terms.js";
import type * as Trpc from "$lib/trpc/index.js";
import type * as CryptoContext from "$lib/crypto/context.js";
import type * as Errors from "$lib/errors.js";
import type * as ShellContext from "$lib/shell/context.js";
import type * as PanelNotesSection from "./PanelNotesSection.svelte";
import type * as PanelMediaSection from "./PanelMediaSection.svelte";
import type * as PortalTierSection from "./PortalTierSection.svelte";

// --- Mocks ---

let ticketQueryState: Record<string, unknown> = {};
let watchingQueryState: Record<string, unknown> = {};

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQuery>()),
  createQuery: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const key = (opts.queryKey as string[] | undefined) ?? [];

    if (key[0] === "isWatching") {
      return watchingQueryState;
    }

    if (
      key[2] === "followUps" ||
      key[2] === "recordings" ||
      key[2] === "attachments"
    ) {
      return {
        isLoading: false,
        isError: false,
        error: null,
        data: [],
      };
    }

    return ticketQueryState;
  },
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    getQueriesData: vi.fn().mockReturnValue([]),
  }),
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Messages>()),
  client_phone_label: () => "Phone",
  ticket_panel_status: () => "Status",
  ticket_panel_opened: () => "Opened",
  ticket_panel_call: () => "Call",
  ticket_action_assign: () => "Assign",
  ticket_action_hold: () => "Hold",
  ticket_action_watch: () => "Watch",
  ticket_action_close: () => "Close",
  ticket_action_open: () => "Open",
  ticket_action_reopen: () => "Reopen",
  ticket_action_release: () => "Release",
  ticket_action_take: () => "Take",
  ticket_action_edit_case: () => "Edit case",
  ticket_recent_history: () => "Recent History",
  ticket_panel_recent_coming_soon: () => "Coming soon",
}));

vi.mock("$lib/terminology/with-terms.js", async (importOriginal) => ({
  ...(await importOriginal<typeof WithTerms>()),
  withTerms: () => ({}),
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Trpc>()),
  trpc: {
    tickets: {
      get: { query: vi.fn() },
      isWatching: { query: vi.fn().mockResolvedValue(false) },
    },
  },
}));

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
  getTicketDecryptCache: () => ({
    decryptTitle: vi.fn().mockReturnValue("Decrypted Title"),
    decryptDescription: vi.fn().mockReturnValue(""),
  }),
  getFollowUpDecryptCache: () => ({
    decryptContent: vi.fn().mockReturnValue(""),
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
  }),
  getOrgDecryptCache: () => ({
    decrypt: vi.fn().mockReturnValue(null),
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
  }),
  getOrgKeyManager: () => ({
    isLoaded: false,
  }),
  getCurrentUserId: () => () => "user-001",
  getCurrentUserRoleId: () => () => "dXwG0zR9BtJp",
  getCurrentPermissions: () => () => new Set(),
  getPreviewLoader: () => ({
    get: vi.fn().mockReturnValue(undefined),
    observe: vi.fn(),
    eagerLoad: vi.fn(),
  }),
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Errors>()),
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
}));

vi.mock("$lib/shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellContext>()),
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

// Stub child sections: these are fully replaced since we only test the phone row.
vi.mock("./PanelNotesSection.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof PanelNotesSection>()),
  default: () => null,
}));

vi.mock("./PanelMediaSection.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof PanelMediaSection>()),
  default: () => null,
}));

vi.mock("./PortalTierSection.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof PortalTierSection>()),
  default: () => null,
}));

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

const baseTicket = {
  id: "ticket-001",
  clientAlias: "calm-river-42",
  clientPhone: null as string | null,
  clientPhoneId: null as string | null,
  status: "open",
  priority: "normal",
  onHold: false,
  assignedTo: null,
  encryptedTitle: { type: "Buffer", data: [72, 101, 108, 108, 111] },
  encryptedDescription: { type: "Buffer", data: [] },
  keyGeneration: "gen-001",
  createdAt: "2026-04-05T09:00:00Z",
  keyWrap: {
    ephemeralPoint: "ep-base64",
    nonce: "nonce-base64",
    wrappedKey: "wk-base64",
  },
};

beforeEach(() => {
  watchingQueryState = {
    isLoading: false,
    isError: false,
    error: null,
    data: false,
  };
});

afterEach(cleanup);

const TicketPanelContent = (await import("./TicketPanelContent.svelte"))
  .default;

describe("TicketPanelContent phone row", () => {
  it("renders the phone row when clientPhone is present", () => {
    ticketQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: { ...baseTicket, clientPhone: "***1234" },
    };

    const { container } = render(TicketPanelContent, {
      props: {
        ticketId: "ticket-001",
        onaction: vi.fn(),
      },
    });

    expect(container.textContent).toContain("Phone");
    expect(container.textContent).toContain("***1234");
  });

  it("renders a full formatted number for admin", () => {
    ticketQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: { ...baseTicket, clientPhone: "+1 (555) 000-1234" },
    };

    const { container } = render(TicketPanelContent, {
      props: {
        ticketId: "ticket-001",
        onaction: vi.fn(),
      },
    });

    expect(container.textContent).toContain("+1 (555) 000-1234");
  });

  it("does not render the phone row when clientPhone is null", () => {
    ticketQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: { ...baseTicket, clientPhone: null },
    };

    const { container } = render(TicketPanelContent, {
      props: {
        ticketId: "ticket-001",
        onaction: vi.fn(),
      },
    });

    // The "Phone" label should not appear in the metadata section.
    // "Call" appears in the call button, so we check for "Phone"
    // which is the metadata row label.
    const listItems = container.querySelectorAll("li");
    const phoneItem = Array.from(listItems).find(
      (li) =>
        li.textContent.includes("Phone") && !li.textContent.includes("Call"),
    );
    expect(phoneItem).toBeUndefined();
  });

  it('emits the "phone" action when the phone row is tapped', async () => {
    const onaction = vi.fn();
    ticketQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: { ...baseTicket, clientPhone: "***1234" },
    };

    const { container } = render(TicketPanelContent, {
      props: {
        ticketId: "ticket-001",
        onaction,
      },
    });

    // Find the phone row by its role="button" and text content
    const phoneRow = Array.from(
      container.querySelectorAll('[role="button"]'),
    ).find((el) => el.textContent.includes("***1234"));

    expect(phoneRow).toBeDefined();
    if (phoneRow) {
      await fireEvent.click(phoneRow);
      expect(onaction).toHaveBeenCalledWith("phone");
    }
  });

  it("phone row has keyboard accessibility attributes", () => {
    ticketQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: { ...baseTicket, clientPhone: "***5678" },
    };

    const { container } = render(TicketPanelContent, {
      props: {
        ticketId: "ticket-001",
        onaction: vi.fn(),
      },
    });

    const phoneRow = Array.from(
      container.querySelectorAll('[role="button"]'),
    ).find((el) => el.textContent.includes("***5678"));

    expect(phoneRow).toBeDefined();
    expect(phoneRow?.getAttribute("tabindex")).toBe("0");
    expect(phoneRow?.getAttribute("role")).toBe("button");
  });
});

describe("TicketPanelContent edit case action", () => {
  it('"Edit case" item is present and dispatches editContent', async () => {
    const onaction = vi.fn();
    ticketQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: { ...baseTicket },
    };

    const { container } = render(TicketPanelContent, {
      props: {
        ticketId: "ticket-001",
        onaction,
      },
    });

    // The "Edit case" row should be in the actions list.
    expect(container.textContent).toContain("Edit case");

    // Find the list item containing "Edit case" and click it.
    const editRow = Array.from(container.querySelectorAll("li")).find((li) =>
      li.textContent.includes("Edit case"),
    );
    expect(editRow).toBeDefined();
    if (editRow) {
      await fireEvent.click(editRow);
      expect(onaction).toHaveBeenCalledWith("editContent");
    }
  });
});
