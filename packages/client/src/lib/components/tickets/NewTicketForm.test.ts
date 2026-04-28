// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import NewTicketForm from "./NewTicketForm.svelte";

// --- Mocks ---

const mockCreateTicketEncryption = vi.fn();

vi.mock("$lib/crypto/context.js", () => ({
  getCryptoBridge: () => ({
    createTicketEncryption: mockCreateTicketEncryption,
  }),
}));

vi.mock("$lib/paraglide/messages.js", () => ({
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

vi.mock("$lib/shell/context.js", () => ({
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      searchClients: {
        query: vi.fn().mockResolvedValue([]),
      },
    },
  },
}));

vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
}));

vi.mock("$lib/utils/org-slug.js", () => ({
  DEV_ORG_SLUG: "test-org",
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const defaultQueues = [
  { id: "q1", name: "General Intake" },
  { id: "q2", name: "Evening Line" },
];

describe("NewTicketForm", () => {
  describe("rendering", () => {
    it("renders title and description inputs", () => {
      const { container } = render(NewTicketForm, {
        props: {
          queues: defaultQueues,
          onsubmit: vi.fn(),
          oncancel: vi.fn(),
        },
      });

      const inputs = container.querySelectorAll("input, textarea");
      expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it("renders priority segmented buttons", () => {
      const { getByText } = render(NewTicketForm, {
        props: {
          queues: defaultQueues,
          onsubmit: vi.fn(),
          oncancel: vi.fn(),
        },
      });

      expect(getByText("ticket_new_priority_low")).toBeTruthy();
      expect(getByText("ticket_new_priority_normal")).toBeTruthy();
      expect(getByText("ticket_new_priority_high")).toBeTruthy();
      expect(getByText("ticket_new_priority_urgent")).toBeTruthy();
    });

    it("renders submit and cancel buttons", () => {
      const { getByText } = render(NewTicketForm, {
        props: {
          queues: defaultQueues,
          onsubmit: vi.fn(),
          oncancel: vi.fn(),
        },
      });

      expect(getByText("ticket_new_submit")).toBeTruthy();
      expect(getByText("common_cancel")).toBeTruthy();
    });
  });

  describe("validation", () => {
    it("does not call bridge or onsubmit when all fields empty", async () => {
      const onsubmit = vi.fn();
      const { container } = render(NewTicketForm, {
        props: {
          queues: defaultQueues,
          onsubmit,
          oncancel: vi.fn(),
        },
      });

      const form = container.querySelector("form")!;
      await fireEvent.submit(form);

      expect(onsubmit).not.toHaveBeenCalled();
      expect(mockCreateTicketEncryption).not.toHaveBeenCalled();
    });

    it("does not call bridge when only title is filled", async () => {
      const onsubmit = vi.fn();
      const { container } = render(NewTicketForm, {
        props: {
          queues: defaultQueues,
          onsubmit,
          oncancel: vi.fn(),
        },
      });

      const titleInput = container.querySelector('input[type="text"]')!;
      await fireEvent.input(titleInput, { target: { value: "Test ticket" } });

      const form = container.querySelector("form")!;
      await fireEvent.submit(form);

      expect(onsubmit).not.toHaveBeenCalled();
      expect(mockCreateTicketEncryption).not.toHaveBeenCalled();
    });

    it("shows title validation error in DOM after submit", async () => {
      const { container } = render(NewTicketForm, {
        props: {
          queues: defaultQueues,
          onsubmit: vi.fn(),
          oncancel: vi.fn(),
        },
      });

      const form = container.querySelector("form")!;
      await fireEvent.submit(form);

      expect(container.textContent).toContain("Title is required");
    });
  });

  describe("cancel", () => {
    it("calls oncancel when cancel button is clicked", async () => {
      const oncancel = vi.fn();
      const { getByText } = render(NewTicketForm, {
        props: {
          queues: defaultQueues,
          onsubmit: vi.fn(),
          oncancel,
        },
      });

      await fireEvent.click(getByText("common_cancel"));
      expect(oncancel).toHaveBeenCalledOnce();
    });
  });

  describe("submitting state", () => {
    it("shows submitting text when submitting prop is true", () => {
      const { getByText } = render(NewTicketForm, {
        props: {
          queues: defaultQueues,
          onsubmit: vi.fn(),
          oncancel: vi.fn(),
          submitting: true,
        },
      });

      expect(getByText("ticket_new_submitting")).toBeTruthy();
    });
  });
});
