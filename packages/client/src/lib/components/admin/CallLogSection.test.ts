// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as CryptoContext from "$lib/crypto/context.js";
import type * as ShellContext from "$lib/shell/context.js";

// vi.mock required: tests pin deterministic message strings for assertions.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  logs_calls_empty_title: () => "No calls found",
  logs_calls_empty_subtitle: () =>
    "Call and voicemail records will appear here as they are logged.",
  logs_direction_inbound: () => "Inbound",
  logs_direction_outbound: () => "Outbound",
  logs_type_voicemail: () => "Voicemail",
  logs_call_status_completed: () => "Completed",
  logs_call_status_no_answer: () => "No answer",
  logs_call_status_busy: () => "Busy",
  logs_call_status_failed: () => "Failed",
  logs_call_status_canceled: () => "Canceled",
  logs_load_more: () => "Load more",
  app_retry: () => "Retry",
  empty_no_data: () => "No data",
  decrypt_placeholder_loading: () => "Decrypting...",
  dashboard_time_just_now: () => "just now",
  dashboard_time_minutes_ago: ({ count }: { count: number }) =>
    `${String(count)}m ago`,
  dashboard_time_hours_ago: ({ count }: { count: number }) =>
    `${String(count)}h ago`,
  dashboard_time_days_ago: ({ count }: { count: number }) =>
    `${String(count)}d ago`,
}));

// vi.mock required: createContext from Svelte 5 throws "missing_context"
// outside a live component tree.
vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
  getOrgDecryptCache: () => ({
    decrypt: (_id: string, _data: string | null) => "Decrypted Alias",
    isFailed: () => false,
  }),
  getOrgKeyManager: () => ({
    get isLoaded() {
      return true;
    },
  }),
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

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export
vi.mock("$lib/components/EmptyState.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// DecryptPlaceholder observes the viewport via IntersectionObserver.
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

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

interface CallLogRow {
  id: string;
  type: string;
  source: string;
  callStatus: string | null;
  callDurationSeconds: number | null;
  createdAt: string;
  ticketId: string;
  clientId: string;
  encryptedClientAlias: string;
}

function makeRow(id: string, overrides: Partial<CallLogRow> = {}): CallLogRow {
  return {
    id,
    type: "phone_call",
    source: "client",
    callStatus: "completed",
    callDurationSeconds: 120,
    createdAt: new Date().toISOString(),
    ticketId: `ticket-${id}`,
    clientId: `client-${id}`,
    encryptedClientAlias: `enc-alias-${id}`,
    ...overrides,
  };
}

import CallLogSection from "./CallLogSection.svelte";

describe("CallLogSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  describe("four-branch rendering", () => {
    it("renders skeletons when isLoading is true", () => {
      const { container } = render(CallLogSection, {
        props: {
          rows: [],
          isLoading: true,
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      const skeletons = container.querySelectorAll("[data-skeleton]");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("renders QueryError when isError is true", () => {
      render(CallLogSection, {
        props: {
          rows: [],
          isError: true,
          error: new Error("network fail"),
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      expect(screen.getByText("Retry")).toBeTruthy();
    });

    it("fires onretry when retry is triggered in error state", async () => {
      const onretry = vi.fn();
      render(CallLogSection, {
        props: {
          rows: [],
          isError: true,
          error: new Error("network fail"),
          onfetchnext: vi.fn(),
          onretry,
          onticketopen: vi.fn(),
        },
      });
      const retryBtn = screen.getByText("Retry");
      await fireEvent.click(retryBtn);
      expect(onretry).toHaveBeenCalled();
    });

    it("renders EmptyState when rows array is empty", () => {
      render(CallLogSection, {
        props: {
          rows: [],
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      expect(screen.getByTestId("passthrough-shell")).toBeTruthy();
    });

    it("renders rows when data is present", () => {
      const rows = [makeRow("1"), makeRow("2")];
      const { container } = render(CallLogSection, {
        props: {
          rows,
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      expect(container.querySelector(".call-log-section")).toBeTruthy();
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("row content", () => {
    it("renders direction and status labels", () => {
      const rows = [
        makeRow("1", {
          source: "client",
          callStatus: "completed",
          callDurationSeconds: 252,
        }),
      ];
      const { container } = render(CallLogSection, {
        props: {
          rows,
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      const meta = container.querySelector(".row-meta");
      expect(meta?.textContent).toContain("Inbound");
      expect(meta?.textContent).toContain("Completed");
      expect(meta?.textContent).toContain("4:12");
    });

    it("renders voicemail glyph for voicemail type", () => {
      const rows = [makeRow("1", { type: "voicemail" })];
      const { container } = render(CallLogSection, {
        props: {
          rows,
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      const meta = container.querySelector(".row-meta");
      expect(meta?.textContent).toContain("Voicemail");
    });

    it("omits duration when callDurationSeconds is null", () => {
      const rows = [
        makeRow("1", { callDurationSeconds: null, callStatus: "no_answer" }),
      ];
      const { container } = render(CallLogSection, {
        props: {
          rows,
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      const meta = container.querySelector(".row-meta");
      expect(meta?.textContent).toContain("No answer");
      expect(meta?.textContent).not.toMatch(/\d+:\d{2}/);
    });
  });

  describe("interactions", () => {
    it("fires onticketopen when Enter is pressed on a row", async () => {
      const onticketopen = vi.fn();
      const rows = [makeRow("1")];
      render(CallLogSection, {
        props: {
          rows,
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen,
        },
      });
      const button = screen.getAllByRole("button")[0]!;
      await fireEvent.keyDown(button, { key: "Enter" });
      expect(onticketopen).toHaveBeenCalledWith("ticket-1");
    });

    it("fires onticketopen on click", async () => {
      const onticketopen = vi.fn();
      const rows = [makeRow("1")];
      render(CallLogSection, {
        props: {
          rows,
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen,
        },
      });
      const button = screen.getAllByRole("button")[0]!;
      await fireEvent.click(button);
      expect(onticketopen).toHaveBeenCalledWith("ticket-1");
    });
  });

  describe("load more", () => {
    it("shows load-more button when hasNextPage is true", () => {
      const rows = [makeRow("1")];
      render(CallLogSection, {
        props: {
          rows,
          hasNextPage: true,
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      expect(screen.getByText("Load more")).toBeTruthy();
    });

    it("hides load-more when hasNextPage is false", () => {
      const rows = [makeRow("1")];
      render(CallLogSection, {
        props: {
          rows,
          hasNextPage: false,
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      expect(screen.queryByText("Load more")).toBeNull();
    });

    it("calls onfetchnext when load-more is clicked", async () => {
      const onfetchnext = vi.fn();
      const rows = [makeRow("1")];
      render(CallLogSection, {
        props: {
          rows,
          hasNextPage: true,
          onfetchnext,
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      await fireEvent.click(screen.getByText("Load more"));
      expect(onfetchnext).toHaveBeenCalled();
    });
  });
});
