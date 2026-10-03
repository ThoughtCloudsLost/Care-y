// @vitest-environment jsdom
/**
 * NewTicketController tests: the two lookups the form depends on pass
 * successful results through unchanged, and a rejection reaches the form
 * as a LookupFailedError carrying the message to show.
 *
 * ShellSheet is stubbed with the PassthroughShell helper and the form
 * with NewTicketFormStub, which drives each lookup from a button.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/svelte";
import { TRPCClientError } from "@trpc/client";
import NewTicketController from "./NewTicketController.svelte";
import type * as ErrorsNS from "$lib/errors.js";
import type * as WithTermsNS from "$lib/terminology/with-terms.js";
import type * as SvelteQueryNS from "@tanstack/svelte-query";
import type * as ContextNS from "$lib/crypto/context.js";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as MessagesNS from "$lib/paraglide/messages.js";
import type * as ClientSelectSearchNS from "$lib/components/inputs/client-select-search.js";
import type * as ShellSheetNS from "$lib/shell/ShellSheet.svelte";
import type * as NewTicketFormNS from "./NewTicketForm.svelte";

interface CreateTarget {
  openTicketId: string | null;
  reopenTicketId: string | null;
}

type MemberKeys = readonly { volunteerId: string; volPublic: string }[];

const { mockResolveCreateTarget, mockListKeys } = vi.hoisted(() => ({
  mockResolveCreateTarget:
    vi.fn<(input: { clientId: string }) => Promise<CreateTarget>>(),
  mockListKeys: vi.fn<(input: { queueId: string }) => Promise<MemberKeys>>(),
}));

vi.mock(
  "$lib/shell/ShellSheet.svelte",
  async () =>
    ({
      default: (await import("./test-helpers/PassthroughShell.svelte"))
        .default as unknown as (typeof ShellSheetNS)["default"],
    }) satisfies typeof ShellSheetNS,
);

vi.mock(
  "./NewTicketForm.svelte",
  async () =>
    ({
      default: (await import("./test-helpers/NewTicketFormStub.svelte"))
        .default as unknown as (typeof NewTicketFormNS)["default"],
    }) satisfies typeof NewTicketFormNS,
);

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryNS>()),
  createQuery: () => ({ data: [] }),
  createMutation: () => ({ mutate: vi.fn(), isPending: false }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    tickets: {
      listQueues: { query: vi.fn() },
      create: { mutate: vi.fn() },
      resolveCreateTarget: { query: mockResolveCreateTarget },
      listQueueMemberPublicKeys: { query: mockListKeys },
    },
  },
}));

vi.mock(
  "$lib/components/inputs/client-select-search.js",
  async (importOriginal) => ({
    ...(await importOriginal<typeof ClientSelectSearchNS>()),
    createClientSelectSearch: () => ({
      search: vi.fn().mockResolvedValue([]),
      phoneLookup: vi.fn(),
      reset: vi.fn(),
    }),
  }),
);

vi.mock("$lib/errors.js", async (importOriginal) =>
  (await import("$mocks/errors.js")).errorsMock(
    await importOriginal<typeof ErrorsNS>(),
  ),
);

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContextNS>()),
  getOrgDecryptCache: () => ({
    decrypt: vi.fn(() => null),
  }),
  getOrgKeyManager: () => ({}),
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesNS>()),
  error_network: () => "Could not reach the server",
  error_insufficient_permissions: () =>
    "You do not have permission to do this.",
  ticket_new_title: () => "New ticket",
  ticket_new_submit: () => "Create",
  ticket_new_submitting: () => "Creating",
}));

vi.mock("$lib/terminology/with-terms.js", async (importOriginal) => ({
  ...(await importOriginal<typeof WithTermsNS>()),
  withTerms: (o?: Record<string, string>) => ({ ...o }),
}));

const baseProps = {
  opened: true,
  ondismiss: vi.fn(),
  oncollision: vi.fn(),
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("NewTicketController", () => {
  it("passes a successful create-target lookup through", async () => {
    mockResolveCreateTarget.mockResolvedValueOnce({
      openTicketId: null,
      reopenTicketId: "t-9",
    });
    render(NewTicketController, { props: baseProps });

    await fireEvent.click(await screen.findByTestId("stub-resolve"));

    await waitFor(() => {
      expect(screen.getByTestId("stub-result").textContent).toBe(
        JSON.stringify({ openTicketId: null, reopenTicketId: "t-9" }),
      );
    });
    expect(mockResolveCreateTarget).toHaveBeenCalledWith({
      clientId: "client-1",
    });
  });

  it("passes a successful recipient key lookup through", async () => {
    mockListKeys.mockResolvedValueOnce([
      { volunteerId: "v1", volPublic: "pk" },
    ]);
    render(NewTicketController, { props: baseProps });

    await fireEvent.click(await screen.findByTestId("stub-keys"));

    await waitFor(() => {
      expect(screen.getByTestId("stub-result").textContent).toBe(
        JSON.stringify([{ volunteerId: "v1", volPublic: "pk" }]),
      );
    });
    expect(mockListKeys).toHaveBeenCalledWith({ queueId: "q1" });
  });

  it("shows the mapped message when the server refuses with a known code", async () => {
    mockResolveCreateTarget.mockRejectedValueOnce(
      TRPCClientError.from(new Error("INSUFFICIENT_PERMISSIONS")),
    );
    render(NewTicketController, { props: baseProps });

    await fireEvent.click(await screen.findByTestId("stub-resolve"));

    await waitFor(() => {
      expect(screen.getByTestId("stub-error").textContent).toBe(
        "You do not have permission to do this.",
      );
    });
  });

  it("falls back to the connection message for a failure with no known code", async () => {
    mockListKeys.mockRejectedValueOnce(
      TRPCClientError.from(new TypeError("Failed to fetch")),
    );
    render(NewTicketController, { props: baseProps });

    await fireEvent.click(await screen.findByTestId("stub-keys"));

    await waitFor(() => {
      expect(screen.getByTestId("stub-error").textContent).toBe(
        "Could not reach the server",
      );
    });
  });
});
