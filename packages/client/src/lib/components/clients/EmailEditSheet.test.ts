// @vitest-environment jsdom
/**
 * Tests for EmailEditSheet: validates the three-step email edit flow
 * (input, confirm, conflict) including Zod email validation, mutation
 * firing, conflict handling, and merge callback wiring.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/svelte";
import EmailEditSheet from "./EmailEditSheet.svelte";
import type * as Messages from "$lib/paraglide/messages.js";
import type * as WithTermsModule from "$lib/terminology/with-terms.js";
import type * as SvelteQuery from "@tanstack/svelte-query";
import type * as TrpcModule from "$lib/trpc/index.js";
import type * as ErrorsModule from "$lib/errors.js";
import type * as HapticModule from "$lib/utils/haptic.js";
import type * as ToastModule from "$lib/stores/toast.svelte.js";
import type * as KeysModule from "$lib/query/keys.js";
import type * as CryptoContextModule from "$lib/crypto/context.js";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Messages>()),
  client_email_edit: () => "Edit email",
  client_email_label: () => "Email",
  client_email_placeholder: () => "name@example.com",
  admin_user_save_changes: () => "Save",
  client_email_confirm_title: () => "Confirm email change",
  client_email_confirm_body: (params: { alias: string; tickets: string }) =>
    `This changes the email for ${params.alias} across all their ${params.tickets}.`,
  client_email_changed_toast: () => "Email address updated",
  client_email_conflict_title: () => "Email conflict",
  client_email_conflict_body: (params: { alias: string }) =>
    `This address belongs to ${params.alias}.`,
  client_email_conflict_merge: () => "Merge Clients",
  common_cancel: () => "Cancel",
  error_generic: () => "Something went wrong.",
}));

vi.mock("$lib/terminology/with-terms.js", async (importOriginal) => {
  const original = await importOriginal<typeof WithTermsModule>();
  return {
    ...original,
    withTerms: (extra?: Record<string, unknown>) => ({
      volunteer: "volunteer",
      volunteers: "volunteers",
      client: "client",
      clients: "clients",
      ticket: "ticket",
      tickets: "tickets",
      manager: "manager",
      managers: "managers",
      queue: "queue",
      queues: "queues",
      knowledgeBase: "knowledge base",
      Volunteer: "Volunteer",
      Volunteers: "Volunteers",
      Client: "Client",
      Clients: "Clients",
      Ticket: "Ticket",
      Tickets: "Tickets",
      Manager: "Manager",
      Managers: "Managers",
      Queue: "Queue",
      Queues: "Queues",
      KnowledgeBase: "Knowledge base",
      ...extra,
    }),
  };
});

const mockMutate = vi.fn();
const mockInvalidateQueries = vi.fn();
const { mockToastShow } = vi.hoisted(() => ({ mockToastShow: vi.fn() }));

let mutationCallbacks: {
  onSuccess?: (result: unknown) => void;
  onError?: (err: Error) => void;
} = {};

vi.mock("@tanstack/svelte-query", async (importOriginal) => {
  const original = await importOriginal<typeof SvelteQuery>();
  return {
    ...original,
    createMutation: (fn: () => Record<string, unknown>) => {
      const config = fn();
      mutationCallbacks = {
        onSuccess: config.onSuccess as (result: unknown) => void,
        onError: config.onError as (err: Error) => void,
      };
      return {
        mutate: mockMutate,
        get isPending() {
          return false;
        },
      };
    },
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  };
});

vi.mock("$lib/trpc/index.js", async (importOriginal) => {
  const original = await importOriginal<typeof TrpcModule>();
  return {
    ...original,
    trpc: {
      clients: {
        updateEmail: {
          mutate: vi.fn(),
        },
      },
    },
  };
});

vi.mock("$lib/errors.js", async (importOriginal) => {
  const original = await importOriginal<typeof ErrorsModule>();
  return {
    ...original,
    requireRouter: (router: unknown) => router,
  };
});

vi.mock("$lib/utils/haptic.js", async (importOriginal) => {
  const original = await importOriginal<typeof HapticModule>();
  return {
    ...original,
    haptic: vi.fn(),
  };
});

vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => {
  const original = await importOriginal<typeof ToastModule>();
  return {
    ...original,
    toastStore: {
      show: mockToastShow,
      current: null,
      dismiss: vi.fn(),
    },
  };
});

vi.mock("$lib/query/keys.js", async (importOriginal) => {
  const original = await importOriginal<typeof KeysModule>();
  return {
    ...original,
    clientKeys: {
      all: ["clients"],
      list: () => ["clients", "list"],
      detail: (id: string) => ["clients", "detail", id],
    },
    ticketsKeys: {
      all: ["tickets"],
    },
  };
});

vi.mock("$lib/crypto/context.js", async (importOriginal) => {
  const original = await importOriginal<typeof CryptoContextModule>();
  return {
    ...original,
    getOrgDecryptCache: () => ({
      decrypt: vi
        .fn()
        .mockImplementation((key: string) =>
          key === "client-alias:client-456" ? "gentle-moon-7" : null,
        ),
      get: vi.fn().mockReturnValue(undefined),
      has: vi.fn().mockReturnValue(false),
      delete: vi.fn().mockReturnValue(true),
    }),
    getOrgKeyManager: () => ({
      emailMatchHash: vi.fn().mockResolvedValue("cd".repeat(64)),
    }),
  };
});

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  mutationCallbacks = {};
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("EmailEditSheet", () => {
  const baseProps = {
    opened: true,
    clientId: "client-123",
    clientAlias: "calm-river-42",
    ondismiss: vi.fn(),
    onmerge: vi.fn(),
  };

  async function reachConflictStep(container: HTMLElement): Promise<void> {
    mutationCallbacks.onSuccess?.({
      success: true,
      conflict: {
        conflictingClientId: "client-456",
        conflictingClientEncryptedAlias: "enc-gentle-moon-7",
      },
    });
    await waitFor(() => {
      expect(container.textContent).toContain("Email conflict");
    });
  }

  function findButton(
    container: HTMLElement,
    text: string,
  ): HTMLButtonElement | undefined {
    return Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent.includes(text),
    );
  }

  it("renders the input step with email field and Save button", () => {
    const { container } = render(EmailEditSheet, { props: baseProps });
    expect(container.textContent).toContain("Edit email");
    expect(container.textContent).toContain("Save");
  });

  it("disables Save button when email is empty", () => {
    const { container } = render(EmailEditSheet, { props: baseProps });
    const saveBtn = findButton(container, "Save");
    expect(saveBtn?.disabled).toBe(true);
  });

  it("rejects invalid email addresses", async () => {
    const { container } = render(EmailEditSheet, { props: baseProps });

    const input = container.querySelector("input[type='email']");
    expect(input).toBeTruthy();
    if (input) {
      await fireEvent.input(input, { target: { value: "not-an-email" } });
    }

    const saveBtn = findButton(container, "Save");
    expect(saveBtn?.disabled).toBe(true);
  });

  it("accepts valid email addresses", async () => {
    const { container } = render(EmailEditSheet, { props: baseProps });

    const input = container.querySelector("input[type='email']");
    if (input) {
      await fireEvent.input(input, {
        target: { value: "user@example.com" },
      });
    }

    const saveBtn = findButton(container, "Save");
    expect(saveBtn?.disabled).toBe(false);
  });

  it("advances to confirm step when Save is clicked with valid email", async () => {
    const { container } = render(EmailEditSheet, { props: baseProps });

    const input = container.querySelector("input[type='email']");
    if (input) {
      await fireEvent.input(input, {
        target: { value: "user@example.com" },
      });
    }

    const saveBtn = findButton(container, "Save");
    if (saveBtn) {
      await fireEvent.click(saveBtn);
    }

    expect(container.textContent).toContain("Confirm email change");
    expect(container.textContent).toContain(
      "This changes the email for calm-river-42",
    );
  });

  it("fires the mutation when Confirm is clicked", async () => {
    const { container } = render(EmailEditSheet, { props: baseProps });

    const input = container.querySelector("input[type='email']");
    if (input) {
      await fireEvent.input(input, {
        target: { value: "user@example.com" },
      });
    }

    const saveBtn = findButton(container, "Save");
    if (saveBtn) {
      await fireEvent.click(saveBtn);
    }

    const confirmBtn = findButton(container, "Confirm email change");
    if (confirmBtn) {
      await fireEvent.click(confirmBtn);
    }

    expect(mockMutate).toHaveBeenCalledWith({
      clientId: "client-123",
      emailAddress: "user@example.com",
    });
  });

  it("wires onSuccess callback for conflict detection", () => {
    render(EmailEditSheet, { props: baseProps });

    expect(mutationCallbacks.onSuccess).toBeDefined();

    mutationCallbacks.onSuccess?.({
      success: true,
      conflict: {
        conflictingClientId: "client-456",
        conflictingClientEncryptedAlias: "enc-gentle-moon-7",
      },
    });
    expect(baseProps.ondismiss).not.toHaveBeenCalled();
  });

  it("wires onSuccess callback for successful email change", () => {
    const ondismiss = vi.fn();
    render(EmailEditSheet, {
      props: { ...baseProps, ondismiss },
    });

    mutationCallbacks.onSuccess?.({
      success: true,
      conflict: null,
    });

    expect(ondismiss).toHaveBeenCalledOnce();
  });

  it("surfaces a generic toast when the email write fails", () => {
    render(EmailEditSheet, { props: baseProps });

    mutationCallbacks.onError?.(new Error("NETWORK_ERROR"));

    expect(mockToastShow).toHaveBeenCalledWith("Something went wrong.", 3000);
  });

  it("hands the conflicting client to onmerge from the conflict step", async () => {
    const onmerge = vi.fn();
    const { container } = render(EmailEditSheet, {
      props: { ...baseProps, onmerge },
    });

    await reachConflictStep(container);

    const mergeBtn = findButton(container, "Merge Clients");
    expect(mergeBtn).toBeDefined();
    await fireEvent.click(mergeBtn!);

    expect(onmerge).toHaveBeenCalledWith("client-456", "gentle-moon-7");
  });

  it("returns to input step when Cancel is clicked on confirm step", async () => {
    const { container } = render(EmailEditSheet, { props: baseProps });

    const input = container.querySelector("input[type='email']");
    if (input) {
      await fireEvent.input(input, {
        target: { value: "user@example.com" },
      });
    }

    const saveBtn = findButton(container, "Save");
    if (saveBtn) {
      await fireEvent.click(saveBtn);
    }

    const cancelBtn = findButton(container, "Cancel");
    if (cancelBtn) {
      await fireEvent.click(cancelBtn);
    }

    expect(container.textContent).toContain("Save");
  });
});
