// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import NewTicketForm from "./NewTicketForm.svelte";
import { resolveQueueAppearance } from "$lib/utils/queue-appearance.js";
import type * as ErrorsNS from "$lib/errors.js";
import type * as ContextNS from "$lib/shell/context.js";
import type * as OrgSlugNS from "$lib/utils/org-slug.js";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as MessagesNS from "$lib/paraglide/messages.js";
import type * as ContextNS2 from "$lib/crypto/context.js";

// --- Mocks ---

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContextNS2>()),
  getCryptoBridge: () => ({
    createTicketEncryption: vi.fn(),
  }),
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesNS>()),
  ticket_new_field_title: () => "Title",
  ticket_new_field_title_placeholder: () => "Brief description",
  ticket_new_field_description: () => "Description",
  ticket_new_field_description_placeholder: () => "Details (optional)",
  ticket_new_field_queue: () => "Queue",
  ticket_new_field_queue_placeholder: () => "Select a queue",
  ticket_new_field_priority: () => "Priority",
  ticket_new_field_client: () => "Client",
  ticket_new_field_client_placeholder: () => "Search by alias or phone",
  ticket_new_priority_low: () => "ticket_new_priority_low",
  ticket_new_priority_normal: () => "ticket_new_priority_normal",
  ticket_new_priority_high: () => "ticket_new_priority_high",
  ticket_new_priority_urgent: () => "ticket_new_priority_urgent",
  ticket_new_submit: () => "ticket_new_submit",
  ticket_new_submitting: () => "ticket_new_submitting",
  ticket_new_error_title_required: () => "Title is required",
  ticket_new_error_queue_required: () => "Select a queue",
  ticket_new_error_client_required: () => "Select or create a client",
  ticket_new_error_encrypt_failed: () => "Could not encrypt ticket data",
  common_cancel: () => "common_cancel",
  common_loading: () => "Loading",
  ticket_new_create_client: () => "Create new client",
  ticket_new_back_to_search: () => "Back to search",
  ticket_new_field_phone_placeholder: () => "+1 (555) 123-4567",
  ticket_new_field_phone: () => "Phone number",
  ticket_new_error_submit_failed: () => "Could not create ticket",
  ticket_new_success: () => "Ticket created",
  empty_no_results: () => "No results found",
  shell_close: () => "Close",
  error_generic: () => "Something went wrong",
}));

vi.mock(
  "$lib/shell/context.js",
  async () =>
    (
      await import("$mocks/shell-context.js")
    ).shellContextMock() satisfies typeof ContextNS,
);

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    tickets: {
      resolveCreateTarget: vi
        .fn<
          () => Promise<{
            openTicketId: string | null;
            reopenTicketId: string | null;
          }>
        >()
        .mockResolvedValue({ openTicketId: null, reopenTicketId: null }),
      searchClients: {
        query: vi.fn().mockResolvedValue([]),
      },
    },
  },
}));

vi.mock("$lib/errors.js", async (importOriginal) =>
  (await import("$mocks/errors.js")).errorsMock(
    await importOriginal<typeof ErrorsNS>(),
  ),
);

vi.mock("$lib/utils/org-slug.js", async (importOriginal) => ({
  ...(await importOriginal<typeof OrgSlugNS>()),
  DEV_ORG_SLUG: "test-org",
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const defaultQueues = [
  {
    id: "q1",
    name: "General Intake",
    appearance: resolveQueueAppearance("blue", "folder"),
  },
  {
    id: "q2",
    name: "Evening Line",
    appearance: resolveQueueAppearance(null, null),
  },
];

const mockSearchClients = vi.fn().mockResolvedValue([]);

describe("NewTicketForm", () => {
  describe("rendering", () => {
    it("renders title and description inputs", () => {
      const { container } = render(NewTicketForm, {
        props: {
          queues: defaultQueues,
          resolveCreateTarget: vi
            .fn<
              () => Promise<{
                openTicketId: string | null;
                reopenTicketId: string | null;
              }>
            >()
            .mockResolvedValue({ openTicketId: null, reopenTicketId: null }),
          searchClients: mockSearchClients,
          onsubmit: vi.fn(),
          formId: "test-form",
        },
      });

      const inputs = container.querySelectorAll("input, textarea");
      expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it("renders priority select dropdown with all options", () => {
      const { container } = render(NewTicketForm, {
        props: {
          queues: defaultQueues,
          resolveCreateTarget: vi
            .fn<
              () => Promise<{
                openTicketId: string | null;
                reopenTicketId: string | null;
              }>
            >()
            .mockResolvedValue({ openTicketId: null, reopenTicketId: null }),
          searchClients: mockSearchClients,
          onsubmit: vi.fn(),
          formId: "test-form",
        },
      });

      const select = container.querySelector("select");
      expect(select).toBeTruthy();
      const options = select!.querySelectorAll("option");
      expect(options.length).toBe(4);
    });
  });

  describe("rendering structure", () => {
    it("renders as a form with the provided formId", () => {
      const { container } = render(NewTicketForm, {
        props: {
          queues: defaultQueues,
          resolveCreateTarget: vi
            .fn<
              () => Promise<{
                openTicketId: string | null;
                reopenTicketId: string | null;
              }>
            >()
            .mockResolvedValue({ openTicketId: null, reopenTicketId: null }),
          searchClients: mockSearchClients,
          onsubmit: vi.fn(),
          formId: "test-form",
        },
      });

      const form = container.querySelector("form");
      expect(form).toBeTruthy();
      expect(form!.id).toBe("test-form");
      expect(form!.classList.contains("new-ticket-body")).toBe(true);
    });
  });
});
