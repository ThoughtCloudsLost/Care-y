// @vitest-environment jsdom
/**
 * Tests for PhoneEditSheet: validates the three-step phone edit flow
 * (input, confirm, conflict) including E.164 validation, mutation
 * firing, conflict handling, merge callback wiring, and shared-line toggle.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { Permission } from "@care-y/shared";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/svelte";
import PhoneEditSheet from "./PhoneEditSheet.svelte";
import type * as Messages from "$lib/paraglide/messages.js";
import type * as WithTermsModule from "$lib/terminology/with-terms.js";
import type * as SvelteQuery from "@tanstack/svelte-query";
import type * as TrpcModule from "$lib/trpc/index.js";
import type * as ErrorsModule from "$lib/errors.js";
import type * as HapticModule from "$lib/utils/haptic.js";
import type * as ToastModule from "$lib/stores/toast.svelte.js";
import type * as KeysModule from "$lib/query/keys.js";
import type * as CryptoContextModule from "$lib/crypto/context.js";
import {
  setPermissions,
  resetPermissions,
  getMockPermissions,
} from "$mocks/permissions.js";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Messages>()),
  phone_edit: () => "Edit phone number",
  client_phone_label: () => "Phone",
  client_phone_placeholder: () => "+1 555 000 1234",
  admin_user_save_changes: () => "Save",
  client_phone_confirm_title: () => "Confirm phone change",
  client_phone_confirm_body: (params: { alias: string; tickets: string }) =>
    `This changes the phone for ${params.alias} across all their ${params.tickets}.`,
  client_phone_changed_toast: () => "Phone number updated",
  client_phone_conflict_title: () => "Phone conflict",
  client_phone_conflict_body: (params: { alias: string }) =>
    `This number belongs to ${params.alias}.`,
  client_phone_conflict_merge: () => "Merge Clients",
  client_phone_edit: () => "Try Different Number",
  common_cancel: () => "Cancel",
  error_generic: () => "Something went wrong.",
  phone_shared_line_label: () => "Shared line",
  phone_shared_line_hint: () => "Many people use this number.",
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

// Track all mutations in order (updatePhone first, then sharedLine)
const allMutationConfigs: {
  mutationFn?: (arg: unknown) => Promise<unknown>;
  onSuccess?: (result: unknown) => void;
  onError?: (err: Error) => void;
  mutate: ReturnType<typeof vi.fn>;
}[] = [];

// Shared line query result, controllable per test
let sharedLineQueryData: { shared: boolean | null } | undefined = undefined;

vi.mock("@tanstack/svelte-query", async (importOriginal) => {
  const original = await importOriginal<typeof SvelteQuery>();
  return {
    ...original,
    createQuery: vi.fn((_optsFn: () => Record<string, unknown>) => {
      return {
        get data() {
          return sharedLineQueryData;
        },
        get isLoading() {
          return false;
        },
      };
    }),
    createMutation: (fn: () => Record<string, unknown>) => {
      const config = fn();
      const entry = {
        mutationFn: config.mutationFn as
          ((arg: unknown) => Promise<unknown>) | undefined,
        onSuccess: config.onSuccess as ((result: unknown) => void) | undefined,
        onError: config.onError as ((err: Error) => void) | undefined,
        mutate: vi.fn(),
      };
      allMutationConfigs.push(entry);
      // First mutation is sharedLine (declared first in component)
      if (allMutationConfigs.length === 1) {
        return {
          mutate: entry.mutate,
          get isPending() {
            return false;
          },
        };
      }
      // Second mutation is updatePhone
      mutationCallbacks = {
        onSuccess: entry.onSuccess,
        onError: entry.onError,
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

// Hoisted because the trpc mock factory reads it while building its
// return object, which happens before top-level consts initialize.
const { mockSetPhoneSharedLine } = vi.hoisted(() => ({
  mockSetPhoneSharedLine: vi.fn(
    async () => ({ updated: 1 }) as { updated: number },
  ),
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => {
  const original = await importOriginal<typeof TrpcModule>();
  return {
    ...original,
    trpc: {
      clients: {
        updatePhone: {
          mutate: vi.fn(),
        },
        getPhoneSharedLine: {
          query: vi.fn(
            async () => ({ shared: false }) as { shared: boolean | null },
          ),
        },
        setPhoneSharedLine: { mutate: mockSetPhoneSharedLine },
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
      mergeCandidates: () => ["clients", "mergeCandidates"],
      phoneSharedLine: (clientId: string) => [
        "clients",
        "phoneSharedLine",
        clientId,
      ],
    },
    ticketsKeys: {
      all: ["tickets"],
    },
  };
});

// vi.mock required: createContext from Svelte 5 throws "missing_context"
// outside a live component tree.
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
      phoneMatchHash: vi.fn().mockResolvedValue("ab".repeat(64)),
    }),
    getCurrentPermissions: () => getMockPermissions,
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
  allMutationConfigs.length = 0;
  sharedLineQueryData = undefined;
  setPermissions(Permission.VIEW_CLIENTS);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PhoneEditSheet", () => {
  const baseProps = {
    opened: true,
    clientId: "client-123",
    clientAlias: "calm-river-42",
    ondismiss: vi.fn(),
    onmerge: vi.fn(),
  };

  /** Advances to the conflict step by replaying the server's conflict result. */
  async function reachConflictStep(container: HTMLElement): Promise<void> {
    mutationCallbacks.onSuccess?.({
      success: true,
      conflict: {
        conflictingClientId: "client-456",
        conflictingClientEncryptedAlias: "enc-gentle-moon-7",
      },
    });
    await waitFor(() => {
      expect(container.textContent).toContain("Phone conflict");
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

  it("surfaces a generic toast when the phone write fails", () => {
    render(PhoneEditSheet, { props: baseProps });

    mutationCallbacks.onError?.(new Error("NETWORK_ERROR"));

    expect(mockToastShow).toHaveBeenCalledWith("Something went wrong.", 3000);
  });

  it("hands the conflicting client to onmerge from the conflict step", async () => {
    const onmerge = vi.fn();
    const { container } = render(PhoneEditSheet, {
      props: { ...baseProps, onmerge },
    });

    await reachConflictStep(container);

    const mergeBtn = findButton(container, "Merge Clients");
    expect(mergeBtn).toBeDefined();
    await fireEvent.click(mergeBtn!);

    expect(onmerge).toHaveBeenCalledWith("client-456", "gentle-moon-7");
  });

  it("returns to the input step from the conflict step", async () => {
    const { container } = render(PhoneEditSheet, { props: baseProps });

    await reachConflictStep(container);

    const tryAgain = findButton(container, "Try Different Number");
    expect(tryAgain).toBeDefined();
    await fireEvent.click(tryAgain!);

    await waitFor(() => {
      expect(container.querySelector("input[type='tel']")).toBeTruthy();
    });
  });

  it("renders the input step with phone field and Save button", () => {
    const { container } = render(PhoneEditSheet, { props: baseProps });
    expect(container.textContent).toContain("Edit phone number");
    expect(container.textContent).toContain("Save");
  });

  it("disables Save button when phone number is empty", () => {
    const { container } = render(PhoneEditSheet, { props: baseProps });
    const buttons = container.querySelectorAll("button");
    const saveBtn = Array.from(buttons).find((b) =>
      b.textContent.includes("Save"),
    );
    expect(saveBtn?.disabled).toBe(true);
  });

  it("rejects malformed phone numbers (no + prefix)", async () => {
    const { container } = render(PhoneEditSheet, { props: baseProps });

    const input = container.querySelector("input[type='tel']");
    expect(input).toBeTruthy();
    if (input) {
      await fireEvent.input(input, { target: { value: "15551234567" } });
    }

    const buttons = container.querySelectorAll("button");
    const saveBtn = Array.from(buttons).find((b) =>
      b.textContent.includes("Save"),
    );
    expect(saveBtn?.disabled).toBe(true);
  });

  it("rejects malformed phone numbers (+ followed by 0)", async () => {
    const { container } = render(PhoneEditSheet, { props: baseProps });

    const input = container.querySelector("input[type='tel']");
    if (input) {
      await fireEvent.input(input, { target: { value: "+05551234567" } });
    }

    const buttons = container.querySelectorAll("button");
    const saveBtn = Array.from(buttons).find((b) =>
      b.textContent.includes("Save"),
    );
    expect(saveBtn?.disabled).toBe(true);
  });

  it("accepts valid E.164 phone numbers", async () => {
    const { container } = render(PhoneEditSheet, { props: baseProps });

    const input = container.querySelector("input[type='tel']");
    if (input) {
      await fireEvent.input(input, { target: { value: "+15551234567" } });
    }

    const buttons = container.querySelectorAll("button");
    const saveBtn = Array.from(buttons).find((b) =>
      b.textContent.includes("Save"),
    );
    expect(saveBtn?.disabled).toBe(false);
  });

  it("advances to confirm step when Save is clicked with valid phone", async () => {
    const { container } = render(PhoneEditSheet, { props: baseProps });

    const input = container.querySelector("input[type='tel']");
    if (input) {
      await fireEvent.input(input, { target: { value: "+15551234567" } });
    }

    const buttons = container.querySelectorAll("button");
    const saveBtn = Array.from(buttons).find((b) =>
      b.textContent.includes("Save"),
    );
    if (saveBtn) {
      await fireEvent.click(saveBtn);
    }

    expect(container.textContent).toContain("Confirm phone change");
    expect(container.textContent).toContain(
      "This changes the phone for calm-river-42",
    );
  });

  it("fires the mutation when Confirm is clicked", async () => {
    const { container } = render(PhoneEditSheet, { props: baseProps });

    // Enter phone
    const input = container.querySelector("input[type='tel']");
    if (input) {
      await fireEvent.input(input, { target: { value: "+15551234567" } });
    }

    // Click Save to reach confirm step
    let buttons = container.querySelectorAll("button");
    const saveBtn = Array.from(buttons).find((b) =>
      b.textContent.includes("Save"),
    );
    if (saveBtn) {
      await fireEvent.click(saveBtn);
    }

    // Click Confirm
    buttons = container.querySelectorAll("button");
    const confirmBtn = Array.from(buttons).find((b) =>
      b.textContent.includes("Confirm phone change"),
    );
    if (confirmBtn) {
      await fireEvent.click(confirmBtn);
    }

    expect(mockMutate).toHaveBeenCalledWith({
      clientId: "client-123",
      phoneNumber: "+15551234567",
    });
  });

  it("wires onSuccess callback for conflict detection", () => {
    render(PhoneEditSheet, { props: baseProps });

    // Verify the mutation onSuccess callback is wired.
    // In unit tests with mocked createMutation, Svelte state updates
    // from the callback do not propagate to the DOM, but we can verify
    // the callback itself handles both branches.
    expect(mutationCallbacks.onSuccess).toBeDefined();

    // Simulate conflict result: callback sets conflict state
    mutationCallbacks.onSuccess?.({
      success: true,
      conflict: {
        conflictingClientId: "client-456",
        conflictingClientEncryptedAlias: "enc-gentle-moon-7",
      },
    });
    // No ondismiss call (conflict, not success)
    expect(baseProps.ondismiss).not.toHaveBeenCalled();
  });

  it("wires onSuccess callback for successful phone change", () => {
    const ondismiss = vi.fn();
    render(PhoneEditSheet, {
      props: { ...baseProps, ondismiss },
    });

    // Simulate success result (no conflict)
    mutationCallbacks.onSuccess?.({
      success: true,
      conflict: null,
    });

    expect(ondismiss).toHaveBeenCalledOnce();
  });

  it("wires onmerge prop (called from conflict step Merge button)", () => {
    const onmerge = vi.fn();
    render(PhoneEditSheet, {
      props: { ...baseProps, onmerge },
    });

    // The actual UI flow requires real Svelte reactivity which mocked
    // createMutation does not provide. Verify the prop is accepted and
    // the component renders without error.
    expect(onmerge).not.toHaveBeenCalled();
  });

  it("returns to input step when Cancel is clicked on confirm step", async () => {
    const { container } = render(PhoneEditSheet, { props: baseProps });

    // Enter phone and advance to confirm
    const input = container.querySelector("input[type='tel']");
    if (input) {
      await fireEvent.input(input, { target: { value: "+15551234567" } });
    }

    let buttons = container.querySelectorAll("button");
    const saveBtn = Array.from(buttons).find((b) =>
      b.textContent.includes("Save"),
    );
    if (saveBtn) {
      await fireEvent.click(saveBtn);
    }

    // Click Cancel
    buttons = container.querySelectorAll("button");
    const cancelBtn = Array.from(buttons).find((b) =>
      b.textContent.includes("Cancel"),
    );
    if (cancelBtn) {
      await fireEvent.click(cancelBtn);
    }

    // Should be back on input step
    expect(container.textContent).toContain("Save");
  });

  it("rejects phone numbers with too many digits", async () => {
    const { container } = render(PhoneEditSheet, { props: baseProps });

    const input = container.querySelector("input[type='tel']");
    if (input) {
      await fireEvent.input(input, {
        target: { value: "+12345678901234567" },
      });
    }

    const buttons = container.querySelectorAll("button");
    const saveBtn = Array.from(buttons).find((b) =>
      b.textContent.includes("Save"),
    );
    expect(saveBtn?.disabled).toBe(true);
  });

  it("rejects phone number with only + sign", async () => {
    const { container } = render(PhoneEditSheet, { props: baseProps });

    const input = container.querySelector("input[type='tel']");
    if (input) {
      await fireEvent.input(input, { target: { value: "+" } });
    }

    const buttons = container.querySelectorAll("button");
    const saveBtn = Array.from(buttons).find((b) =>
      b.textContent.includes("Save"),
    );
    expect(saveBtn?.disabled).toBe(true);
  });

  // ── Shared line toggle tests ──

  it("renders toggle when user has VIEW_CLIENTS and query returns shared: false", () => {
    setPermissions(Permission.VIEW_CLIENTS);
    sharedLineQueryData = { shared: false };

    const { container } = render(PhoneEditSheet, { props: baseProps });

    expect(container.textContent).toContain("Shared line");
    expect(container.textContent).toContain("Many people use this number");
  });

  it("hides toggle when user lacks VIEW_CLIENTS", () => {
    resetPermissions();
    sharedLineQueryData = { shared: false };

    const { container } = render(PhoneEditSheet, { props: baseProps });

    expect(container.textContent).not.toContain("Shared line");
  });

  it("hides toggle when shared is null (no phone on record)", () => {
    setPermissions(Permission.VIEW_CLIENTS);
    sharedLineQueryData = { shared: null };

    const { container } = render(PhoneEditSheet, { props: baseProps });

    expect(container.textContent).not.toContain("Shared line");
  });

  it("calls setPhoneSharedLine mutation when toggle is flipped", async () => {
    setPermissions(Permission.VIEW_CLIENTS);
    sharedLineQueryData = { shared: false };

    const { container } = render(PhoneEditSheet, { props: baseProps });

    // The toggle input is inside the ListItem
    const toggle = container.querySelector("input[type='checkbox']");
    expect(toggle).toBeTruthy();

    if (toggle) {
      await fireEvent.change(toggle, { target: { checked: true } });
    }

    // The sharedLine mutation is the first one registered
    const sharedMutationEntry = allMutationConfigs[0];
    expect(sharedMutationEntry).toBeDefined();
    if (sharedMutationEntry) {
      // The mutation takes a boolean (shared), wraps it with clientId internally.
      await sharedMutationEntry.mutationFn?.(true);
      expect(mockSetPhoneSharedLine).toHaveBeenCalledWith({
        clientId: "client-123",
        shared: true,
      });
    }
  });
});
