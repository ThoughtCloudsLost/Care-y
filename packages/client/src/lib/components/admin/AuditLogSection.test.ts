// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as CryptoContext from "$lib/crypto/context.js";
import type * as ShellContext from "$lib/shell/context.js";
import type * as WithTerms from "$lib/terminology/with-terms.js";

// vi.mock required: tests pin deterministic message strings for assertions.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  logs_audit_empty_title: () => "No audit events found",
  logs_audit_empty_subtitle: () =>
    "System activity will appear here as changes are made.",
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
  audit_event_ticket_created: () => "Ticket created",
  audit_event_ticket_closed: () => "Ticket closed",
  audit_event_ticket_reopened: () => "Ticket reopened",
  audit_event_ticket_assigned: () => "Ticket assigned",
  audit_event_ticket_escalated: () => "Ticket escalated",
  audit_event_ticket_merged: () => "Ticket merged",
  audit_event_followup_added: () => "Follow-up added",
  audit_event_media_soft_deleted: () => "Media soft deleted",
  audit_event_media_hard_deleted: () => "Media hard deleted",
  audit_event_queue_created: () => "Queue created",
  audit_event_queue_updated: () => "Queue updated",
  audit_event_queue_deleted: () => "Queue deleted",
  audit_event_preset_created: () => "Preset created",
  audit_event_preset_updated: () => "Preset updated",
  audit_event_note_type_created: () => "Note type created",
  audit_event_note_type_updated: () => "Note type updated",
  audit_event_merge_undone: () => "Merge undone",
  audit_event_merge_lock_changed: () => "Merge lock changed",
  audit_event_voicemail_quarantined: () => "Voicemail quarantined",
  audit_event_voicemail_quarantine_routed: () => "Voicemail quarantine routed",
  audit_event_voicemail_quarantine_dismissed: () =>
    "Voicemail quarantine dismissed",
  audit_event_client_alias_changed: () => "Client alias changed",
  audit_event_client_phone_changed: () => "Client phone changed",
  audit_event_ticket_content_updated: () => "Case edited",
  audit_metadata_title_changed: () => "Title changed",
  audit_metadata_description_changed: () => "Description changed",
  audit_metadata_title_and_description_changed: () =>
    "Title and description changed",
}));

// vi.mock required: withTerms calls getContext which is not available
// outside a live component tree.
vi.mock("$lib/terminology/with-terms.js", async (importOriginal) => ({
  ...(await importOriginal<typeof WithTerms>()),
  withTerms: () => ({ Ticket: "Ticket", Client: "Client" }),
}));

// vi.mock required: createContext from Svelte 5 throws "missing_context"
// outside a live component tree.
vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
  getOrgDecryptCache: () => ({
    decrypt: (_id: string, _data: string | null) => "Decrypted Name",
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
vi.mock("$lib/components/QueryError.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
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

interface AuditRow {
  id: string;
  eventType: string;
  actorId: string;
  ticketId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

function makeRow(id: string, overrides: Partial<AuditRow> = {}): AuditRow {
  return {
    id,
    eventType: "ticket_closed",
    actorId: `actor-${id}`,
    ticketId: `ticket-${id}`,
    metadata: {},
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

import AuditLogSection from "./AuditLogSection.svelte";
import {
  summarizeAuditMetadata,
  auditEventLabel,
} from "$lib/admin/audit-log-labels.js";

describe("AuditLogSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  describe("four-branch rendering", () => {
    it("renders skeletons when isLoading is true", () => {
      const { container } = render(AuditLogSection, {
        props: {
          rows: [],
          isLoading: true,
          actorNames: new Map(),
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      const skeletons = container.querySelectorAll("[data-skeleton]");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("renders QueryError when isError is true", () => {
      render(AuditLogSection, {
        props: {
          rows: [],
          isError: true,
          error: new Error("network fail"),
          actorNames: new Map(),
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      expect(screen.getByTestId("passthrough-shell")).toBeTruthy();
    });

    it("renders EmptyState when rows array is empty", () => {
      render(AuditLogSection, {
        props: {
          rows: [],
          actorNames: new Map(),
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      expect(screen.getByTestId("passthrough-shell")).toBeTruthy();
    });

    it("renders rows when data is present", () => {
      const rows = [
        makeRow("1", { eventType: "ticket_closed" }),
        makeRow("2", { eventType: "ticket_reopened" }),
      ];
      const actorNames = new Map([
        ["actor-1", "enc-name-1"],
        ["actor-2", "enc-name-2"],
      ]);
      render(AuditLogSection, {
        props: {
          rows,
          actorNames,
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      expect(screen.getByText("Ticket closed")).toBeTruthy();
      expect(screen.getByText("Ticket reopened")).toBeTruthy();
    });
  });

  describe("event labels", () => {
    it("renders known event labels from i18n", () => {
      const rows = [makeRow("1", { eventType: "ticket_closed" })];
      const actorNames = new Map([["actor-1", "enc-name-1"]]);
      const { container } = render(AuditLogSection, {
        props: {
          rows,
          actorNames,
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      const label = container.querySelector(".event-label");
      expect(label?.textContent).toBe("Ticket closed");
    });

    it("falls back to raw event type for unknown types", () => {
      const rows = [makeRow("1", { eventType: "some_future_event" })];
      const actorNames = new Map([["actor-1", "enc-name-1"]]);
      const { container } = render(AuditLogSection, {
        props: {
          rows,
          actorNames,
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      const label = container.querySelector(".event-label");
      expect(label?.textContent).toBe("some_future_event");
    });
  });

  describe("actor name rendering", () => {
    it("renders placeholder dash when actor is missing from actorNames", () => {
      const rows = [makeRow("1", { actorId: "unknown-actor" })];
      const actorNames = new Map<string, string>();
      const { container } = render(AuditLogSection, {
        props: {
          rows,
          actorNames,
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      const placeholder = container.querySelector(".actor-placeholder");
      expect(placeholder?.textContent).toBe("-");
    });
  });

  describe("ticketless rows", () => {
    it("ticketless rows are not activatable", () => {
      const rows = [makeRow("1", { ticketId: null })];
      const actorNames = new Map([["actor-1", "enc-name-1"]]);
      render(AuditLogSection, {
        props: {
          rows,
          actorNames,
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      // No role="button" on ticketless rows
      const buttons = screen.queryAllByRole("button");
      expect(buttons.length).toBe(0);
    });

    it("rows with ticketId fire onticketopen on click", async () => {
      const onticketopen = vi.fn();
      const rows = [makeRow("1", { ticketId: "t-abc" })];
      const actorNames = new Map([["actor-1", "enc-name-1"]]);
      render(AuditLogSection, {
        props: {
          rows,
          actorNames,
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen,
        },
      });
      const button = screen.getAllByRole("button")[0]!;
      await fireEvent.click(button);
      expect(onticketopen).toHaveBeenCalledWith("t-abc");
    });
  });

  describe("load more", () => {
    it("shows load-more when hasNextPage is true", () => {
      const rows = [makeRow("1")];
      const actorNames = new Map([["actor-1", "enc-name-1"]]);
      render(AuditLogSection, {
        props: {
          rows,
          actorNames,
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
      const actorNames = new Map([["actor-1", "enc-name-1"]]);
      render(AuditLogSection, {
        props: {
          rows,
          actorNames,
          hasNextPage: false,
          onfetchnext: vi.fn(),
          onretry: vi.fn(),
          onticketopen: vi.fn(),
        },
      });
      expect(screen.queryByText("Load more")).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// Module-level exported function unit tests
// ---------------------------------------------------------------------------

describe("summarizeAuditMetadata", () => {
  it("returns title changed for title-only edit", () => {
    const result = summarizeAuditMetadata("ticket_content_updated", {
      previousEncryptedTitle: "abc",
      keyGeneration: "kg-1",
    });
    expect(result).toBe("Title changed");
  });

  it("returns description changed for description-only edit", () => {
    const result = summarizeAuditMetadata("ticket_content_updated", {
      previousEncryptedDescription: "def",
      keyGeneration: "kg-1",
    });
    expect(result).toBe("Description changed");
  });

  it("returns combined label for both fields", () => {
    const result = summarizeAuditMetadata("ticket_content_updated", {
      previousEncryptedTitle: "abc",
      previousEncryptedDescription: "def",
      keyGeneration: "kg-1",
    });
    expect(result).toBe("Title and description changed");
  });

  it("returns null for ticket_content_updated with no snapshot keys", () => {
    const result = summarizeAuditMetadata("ticket_content_updated", {
      keyGeneration: "kg-1",
    });
    expect(result).toBeNull();
  });

  it("returns null for unrelated event types", () => {
    expect(summarizeAuditMetadata("ticket_closed", {})).toBeNull();
    expect(summarizeAuditMetadata("queue_updated", { foo: "bar" })).toBeNull();
  });
});

describe("auditEventLabel", () => {
  it("returns i18n label for known event types", () => {
    expect(auditEventLabel("ticket_closed")).toBe("Ticket closed");
    expect(auditEventLabel("queue_created")).toBe("Queue created");
    expect(auditEventLabel("ticket_content_updated")).toBe("Case edited");
  });

  it("returns raw value for unknown event types", () => {
    expect(auditEventLabel("some_future_event")).toBe("some_future_event");
  });
});
