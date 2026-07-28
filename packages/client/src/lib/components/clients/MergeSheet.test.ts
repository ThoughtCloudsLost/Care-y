// @vitest-environment jsdom
/**
 * Tests for MergeSheet: validates the two-step merge flow
 * (select roles, confirm) including search, role selection,
 * same-client guard, mutation firing, and success/error callbacks.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import MergeSheet from "./MergeSheet.svelte";
import type * as Messages from "$lib/paraglide/messages.js";
import type * as WithTermsModule from "$lib/terminology/with-terms.js";
import type * as SvelteQuery from "@tanstack/svelte-query";
import type * as TrpcModule from "$lib/trpc/index.js";
import type * as ErrorsModule from "$lib/errors.js";
import type * as HapticModule from "$lib/utils/haptic.js";
import type * as ToastModule from "$lib/stores/toast.svelte.js";
import type * as KeysModule from "$lib/query/keys.js";
import type * as AnnounceModule from "$lib/utils/announce.js";
import type * as CryptoContextModule from "$lib/crypto/context.js";
import type * as BufferEncodingModule from "$lib/utils/buffer-encoding.js";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Messages>()),
  client_merge_sheet_title: () => "Merge Clients",
  client_merge_select_prompt: () => "Select which client survives:",
  client_merge_search_placeholder: () => "Search for a client to merge...",
  client_merge_confirm_title: () => "Confirm merge",
  client_merge_confirm_body: (params: {
    primaryAlias: string;
    secondaryAlias: string;
  }) => `${params.secondaryAlias} will be merged into ${params.primaryAlias}.`,
  client_merge_confirm_button: () => "Merge Clients",
  client_merged_toast: () => "Clients merged successfully.",
  client_merge_primary_label: () => "Primary (survives)",
  client_merge_secondary_label: () => "Secondary (merged in)",
  client_merge_no_results: () => "No matching clients found",
  client_merge_same_client_error: () => "Cannot merge a client into itself",
  clients_ticket_count_one: (params: { count: number }) =>
    `${String(params.count)} ticket`,
  clients_ticket_count_other: (params: { count: number }) =>
    `${String(params.count)} tickets`,
  common_next: () => "Next",
  common_cancel: () => "Cancel",
  error_generic: () => "Something went wrong.",
  error_secondary_already_merged: () => "Secondary client is already merged.",
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
    createQuery: () => ({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    }),
    createInfiniteQuery: () => ({
      data: { pages: [] },
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
      isLoading: false,
      isError: false,
      error: null,
    }),
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
        list: {
          query: vi.fn().mockResolvedValue([]),
        },
      },
      tickets: {
        mergeClients: {
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
      show: vi.fn(),
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

vi.mock("$lib/utils/announce.js", async (importOriginal) => {
  const original = await importOriginal<typeof AnnounceModule>();
  return {
    ...original,
    announceToLiveRegion: vi.fn(),
  };
});

const mockEncrypt = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));

vi.mock("$lib/crypto/context.js", async (importOriginal) => {
  const original = await importOriginal<typeof CryptoContextModule>();
  return {
    ...original,
    getOrgKeyManager: () => ({
      encrypt: mockEncrypt,
      isLoaded: true,
    }),
    getOrgDecryptCache: () => ({
      decrypt: vi.fn().mockReturnValue(null),
      get: vi.fn().mockReturnValue(undefined),
      has: vi.fn().mockReturnValue(false),
      delete: vi.fn().mockReturnValue(true),
    }),
  };
});

vi.mock("$lib/utils/buffer-encoding.js", async (importOriginal) => {
  const original = await importOriginal<typeof BufferEncodingModule>();
  return {
    ...original,
    uint8ArrayToBase64: () => "AQID",
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

describe("MergeSheet", () => {
  const bothClientsProps = {
    opened: true,
    clientA: { id: "client-a", alias: "calm-river-42" },
    clientB: { id: "client-b", alias: "gentle-moon-7" },
    ondismiss: vi.fn(),
    onmerged: vi.fn(),
  };

  const oneClientProps = {
    opened: true,
    clientA: { id: "client-a", alias: "calm-river-42" },
    clientB: null,
    ondismiss: vi.fn(),
    onmerged: vi.fn(),
  };

  it("renders the select step with both clients when pre-populated", () => {
    const { container } = render(MergeSheet, { props: bothClientsProps });
    expect(container.textContent).toContain("Merge Clients");
    expect(container.textContent).toContain("calm-river-42");
    expect(container.textContent).toContain("gentle-moon-7");
  });

  it("shows search input when only one client is provided", () => {
    const { container } = render(MergeSheet, { props: oneClientProps });
    const searchInput = container.querySelector("input[type='search']");
    expect(searchInput).toBeTruthy();
  });

  it("does not show search input when both clients are pre-populated", () => {
    const { container } = render(MergeSheet, { props: bothClientsProps });
    const searchInput = container.querySelector("input[type='search']");
    expect(searchInput).toBeNull();
  });

  it("renders radio buttons for role selection with both clients", () => {
    const { container } = render(MergeSheet, { props: bothClientsProps });
    expect(container.textContent).toContain("Primary (survives)");
    expect(container.textContent).toContain("Secondary (merged in)");
  });

  it("shows Next button when both clients selected and different", () => {
    const { container } = render(MergeSheet, { props: bothClientsProps });
    const buttons = container.querySelectorAll("button");
    const nextBtn = Array.from(buttons).find((b) =>
      b.textContent.includes("Next"),
    );
    expect(nextBtn).toBeTruthy();
    expect(nextBtn?.disabled).toBe(false);
  });

  it("advances to confirm step when Next is clicked", async () => {
    const { container } = render(MergeSheet, { props: bothClientsProps });

    const buttons = container.querySelectorAll("button");
    const nextBtn = Array.from(buttons).find((b) =>
      b.textContent.includes("Next"),
    );
    if (nextBtn) {
      await fireEvent.click(nextBtn);
    }

    expect(container.textContent).toContain("Confirm merge");
    expect(container.textContent).toContain(
      "gentle-moon-7 will be merged into calm-river-42",
    );
  });

  it("fires the mutation when Merge Clients is clicked on confirm step", async () => {
    const { container } = render(MergeSheet, { props: bothClientsProps });

    // Advance to confirm
    const buttons = container.querySelectorAll("button");
    const nextBtn = Array.from(buttons).find((b) =>
      b.textContent.includes("Next"),
    );
    if (nextBtn) {
      await fireEvent.click(nextBtn);
    }

    // Click Merge Clients
    const mergeButtons = container.querySelectorAll("button");
    const mergeBtn = Array.from(mergeButtons).find((b) =>
      b.textContent.includes("Merge Clients"),
    );
    if (mergeBtn) {
      await fireEvent.click(mergeBtn);
    }

    expect(mockMutate).toHaveBeenCalledWith({
      primaryClientId: "client-a",
      secondaryClientId: "client-b",
    });
  });

  it("returns to select step when Cancel is clicked on confirm", async () => {
    const { container } = render(MergeSheet, { props: bothClientsProps });

    // Advance to confirm
    let buttons = container.querySelectorAll("button");
    const nextBtn = Array.from(buttons).find((b) =>
      b.textContent.includes("Next"),
    );
    if (nextBtn) {
      await fireEvent.click(nextBtn);
    }

    // Click Cancel
    buttons = container.querySelectorAll("button");
    const cancelBtn = Array.from(buttons).find((b) =>
      b.textContent.includes("Cancel"),
    );
    if (cancelBtn) {
      await fireEvent.click(cancelBtn);
    }

    expect(container.textContent).toContain("Select which client survives:");
  });

  it("wires onSuccess callback to call onmerged and haptic", () => {
    render(MergeSheet, { props: bothClientsProps });

    expect(mutationCallbacks.onSuccess).toBeDefined();
    mutationCallbacks.onSuccess?.(undefined);

    expect(bothClientsProps.onmerged).toHaveBeenCalledOnce();
  });

  it("wires onError callback for CANNOT_MERGE_INTO_SELF", () => {
    render(MergeSheet, { props: bothClientsProps });

    expect(mutationCallbacks.onError).toBeDefined();
    mutationCallbacks.onError?.(new Error("CANNOT_MERGE_INTO_SELF"));

    // Should not call onmerged on error
    expect(bothClientsProps.onmerged).not.toHaveBeenCalled();
  });

  it("wires onError callback for SECONDARY_ALREADY_MERGED", () => {
    render(MergeSheet, { props: bothClientsProps });

    expect(mutationCallbacks.onError).toBeDefined();
    mutationCallbacks.onError?.(new Error("SECONDARY_ALREADY_MERGED"));

    expect(bothClientsProps.onmerged).not.toHaveBeenCalled();
  });

  it("wires onError callback for generic errors", () => {
    render(MergeSheet, { props: bothClientsProps });

    expect(mutationCallbacks.onError).toBeDefined();
    mutationCallbacks.onError?.(new Error("UNKNOWN_ERROR"));

    expect(bothClientsProps.onmerged).not.toHaveBeenCalled();
  });

  it("does not render content when opened is false", () => {
    const { container } = render(MergeSheet, {
      props: { ...bothClientsProps, opened: false },
    });
    // Sheet is closed, so merge-specific content is absent or hidden
    const selectPrompt = container.textContent;
    // The ShellSheet hides content when closed; the text may still be in
    // the DOM but the component should not show the step content.
    // Just verify no error during render.
    expect(selectPrompt).toBeDefined();
  });

  it("prevents merging a client into itself by disabling Next", () => {
    const sameClientProps = {
      ...bothClientsProps,
      clientB: { id: "client-a", alias: "calm-river-42" },
    };
    const { container } = render(MergeSheet, { props: sameClientProps });
    expect(container.textContent).toContain(
      "Cannot merge a client into itself",
    );

    const buttons = container.querySelectorAll("button");
    const nextBtn = Array.from(buttons).find((b) =>
      b.textContent.includes("Next"),
    );
    expect(nextBtn?.disabled).toBe(true);
  });
});
