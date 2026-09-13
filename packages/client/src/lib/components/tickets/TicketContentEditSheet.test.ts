// @vitest-environment jsdom
/**
 * TicketContentEditSheet tests: prefill, dirty detection, changed-field-only
 * encryption, save flow (evictTk + re-derive + encrypt + mutate + seed),
 * stale-key error handling, and empty-title guard.
 *
 * Mirrors the InternalNoteSheet.test.ts harness pattern: mock bridge, tRPC
 * router, query client, and crypto contexts.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/svelte";
import type * as SvelteQuery from "@tanstack/svelte-query";
import type * as Trpc from "$lib/trpc/index.js";
import type * as Errors from "$lib/errors.js";
import type * as CryptoContext from "$lib/crypto/context.js";
import type * as WithTerms from "$lib/terminology/with-terms.js";
import type * as Haptic from "$lib/utils/haptic.js";
import type * as Announce from "$lib/utils/announce.js";
import type * as ShellSheetMod from "$lib/shell/ShellSheet.svelte";
import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";
import { toastStore } from "$lib/stores/toast.svelte.js";
import { ErrorCode } from "@care-y/shared";

// ---- Hoisted mocks ----

interface UpdateContentPayload {
  ticketId: string;
  encryptedTitle?: string;
  encryptedDescription?: string;
  keyGeneration: string;
}

const {
  mockEvictTk,
  mockDecrypt,
  mockEncrypt,
  mockUpdateContent,
  mockSeed,
  mockInvalidateQueries,
} = vi.hoisted(() => ({
  mockEvictTk: vi
    .fn<(ticketId: string) => Promise<void>>()
    .mockResolvedValue(undefined),
  mockDecrypt: vi
    .fn<
      (
        ticketId: string,
        slot: string,
        keyCacheId: string,
        ephemeralPoint: string,
        nonce: string,
        wrappedKey: string,
        ciphertext: string,
      ) => Promise<string>
    >()
    .mockResolvedValue("decrypted-title"),
  mockEncrypt: vi
    .fn<(ticketId: string, slot: string, text: string) => Promise<string>>()
    .mockResolvedValue("sealed-b64"),
  mockUpdateContent: vi
    .fn<(input: UpdateContentPayload) => Promise<unknown>>()
    .mockResolvedValue({}),
  mockSeed: vi.fn<(key: string, value: string) => void>(),
  mockInvalidateQueries: vi
    .fn<(opts: { queryKey: readonly unknown[] }) => Promise<void>>()
    .mockResolvedValue(undefined),
}));

const toastShowSpy = vi
  .spyOn(toastStore, "show")
  .mockImplementation(() => undefined);

const baseTicket = {
  id: "ticket-001",
  encryptedTitle: "enc-title-b64",
  encryptedDescription: "enc-desc-b64",
  keyGeneration: "gen-001",
  keyWrap: {
    ephemeralPoint: "ep-base64",
    nonce: "nonce-base64",
    wrappedKey: "wk-base64",
  },
  status: "open",
  priority: "normal",
  onHold: false,
  assignedTo: null,
  clientPhone: null,
  clientPhoneId: null,
  createdAt: "2026-04-05T09:00:00Z",
};

let ticketQueryState: Record<string, unknown> = {};

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQuery>()),
  createQuery: () => ticketQueryState,
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    getQueriesData: vi.fn().mockReturnValue([]),
  }),
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Trpc>()),
  trpc: {
    tickets: {
      get: { query: vi.fn() },
      updateContent: { mutate: mockUpdateContent },
    },
  },
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Errors>()),
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
}));

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
  getCryptoBridge: () => ({
    evictTk: mockEvictTk,
    decrypt: mockDecrypt,
    encrypt: mockEncrypt,
  }),
  getTicketDecryptCache: () => ({
    decryptTitle: vi.fn().mockReturnValue("Original Title"),
    decryptDescription: vi.fn().mockReturnValue("Original Description"),
    seed: mockSeed,
    has: vi.fn().mockReturnValue(false),
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
    isLoaded: true,
  }),
}));

vi.mock("$lib/terminology/with-terms.js", async (importOriginal) => ({
  ...(await importOriginal<typeof WithTerms>()),
  withTerms: (o?: Record<string, string>) => ({ ...o }),
}));

vi.mock("$lib/shell/ShellSheet.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellSheetMod>()),
  default: (await import("./test-helpers/PassthroughShell.svelte")).default,
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Haptic>()),
  haptic: vi.fn(),
}));

vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Announce>()),
  announceToLiveRegion: vi.fn(),
}));

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

const baseProps = {
  opened: true,
  ondismiss: vi.fn(),
  ticketId: "ticket-001",
};

beforeEach(() => {
  ticketQueryState = {
    isLoading: false,
    isError: false,
    error: null,
    data: { ...baseTicket },
  };
  mockEvictTk.mockClear();
  mockDecrypt.mockClear();
  mockEncrypt.mockClear();
  mockUpdateContent.mockClear();
  mockSeed.mockClear();
  mockInvalidateQueries.mockClear();
  toastShowSpy.mockClear();
  baseProps.ondismiss = vi.fn();
});

afterEach(cleanup);

const TicketContentEditSheet = (await import("./TicketContentEditSheet.svelte"))
  .default;

describe("TicketContentEditSheet", () => {
  it("prefills inputs once decrypts resolve", async () => {
    render(TicketContentEditSheet, { props: baseProps });

    // The prefill happens in an effect after first render.
    expect(await screen.findByDisplayValue("Original Title")).toBeTruthy();
    expect(
      await screen.findByDisplayValue("Original Description"),
    ).toBeTruthy();
  });

  it("save is disabled until dirty", async () => {
    render(TicketContentEditSheet, { props: baseProps });

    await screen.findByDisplayValue("Original Title");

    const saveButton = screen.getByRole("button", { name: m.common_save() });
    expect(saveButton.hasAttribute("disabled")).toBe(true);
  });

  it("title-only edit calls encrypt once with slot 'title' and mutation omits encryptedDescription", async () => {
    render(TicketContentEditSheet, { props: baseProps });

    const titleInput = await screen.findByDisplayValue("Original Title");
    await fireEvent.input(titleInput, {
      target: { value: "Updated Title" },
    });

    const saveButton = screen.getByRole("button", { name: m.common_save() });
    expect(saveButton.hasAttribute("disabled")).toBe(false);

    await fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateContent).toHaveBeenCalledTimes(1);
    });

    // Encrypt was called once for title only.
    expect(mockEncrypt).toHaveBeenCalledTimes(1);
    expect(mockEncrypt).toHaveBeenCalledWith(
      "ticket-001",
      "title",
      "Updated Title",
    );

    // Mutation omits encryptedDescription entirely.
    const payload = mockUpdateContent.mock.calls.at(0)?.[0] as
      UpdateContentPayload | undefined;
    expect(payload).toMatchObject({
      ticketId: "ticket-001",
      encryptedTitle: "sealed-b64",
      keyGeneration: "gen-001",
    });
    expect(payload?.encryptedDescription).toBeUndefined();
  });

  it("success path seeds both cache keys, shows toast, haptic, dismisses, invalidates", async () => {
    render(TicketContentEditSheet, { props: baseProps });

    const titleInput = await screen.findByDisplayValue("Original Title");
    await fireEvent.input(titleInput, {
      target: { value: "New Title" },
    });

    const descInput = await screen.findByDisplayValue("Original Description");
    await fireEvent.input(descInput, {
      target: { value: "New Description" },
    });

    await fireEvent.click(
      screen.getByRole("button", { name: m.common_save() }),
    );

    await waitFor(() => {
      expect(baseProps.ondismiss).toHaveBeenCalled();
    });

    // Seeds for both fields
    expect(mockSeed).toHaveBeenCalledWith("ticket-001", "New Title");
    expect(mockSeed).toHaveBeenCalledWith("desc:ticket-001", "New Description");

    // Toast + invalidations
    expect(toastShowSpy).toHaveBeenCalledWith(
      m.ticket_content_saved(withTerms()),
    );
    expect(mockInvalidateQueries).toHaveBeenCalled();
  });

  it("evicts tk and re-derives before encrypting", async () => {
    render(TicketContentEditSheet, { props: baseProps });

    const titleInput = await screen.findByDisplayValue("Original Title");
    await fireEvent.input(titleInput, {
      target: { value: "Changed" },
    });

    await fireEvent.click(
      screen.getByRole("button", { name: m.common_save() }),
    );

    await waitFor(() => {
      expect(mockEvictTk).toHaveBeenCalledWith("ticket-001");
    });

    // Re-derive happens before encrypt
    expect(mockDecrypt).toHaveBeenCalledWith(
      "ticket-001",
      "title",
      "ticket-001",
      "ep-base64",
      "nonce-base64",
      "wk-base64",
      "enc-title-b64",
    );
  });

  it("TICKET_KEY_GENERATION_STALE error shows stale toast and keeps sheet open", async () => {
    mockUpdateContent.mockRejectedValueOnce(
      new Error(ErrorCode.TICKET_KEY_GENERATION_STALE),
    );

    render(TicketContentEditSheet, { props: baseProps });

    const titleInput = await screen.findByDisplayValue("Original Title");
    await fireEvent.input(titleInput, {
      target: { value: "Doomed Edit" },
    });

    await fireEvent.click(
      screen.getByRole("button", { name: m.common_save() }),
    );

    await waitFor(() => {
      expect(toastShowSpy).toHaveBeenCalledWith(
        m.error_ticket_key_generation_stale(withTerms()),
        3000,
      );
    });

    // Sheet stays open (ondismiss not called).
    expect(baseProps.ondismiss).not.toHaveBeenCalled();

    // Save button re-enables for retry.
    const saveButton = screen.getByRole("button", { name: m.common_save() });
    expect(saveButton.hasAttribute("disabled")).toBe(false);
  });

  it("empty title cannot save", async () => {
    render(TicketContentEditSheet, { props: baseProps });

    const titleInput = await screen.findByDisplayValue("Original Title");
    await fireEvent.input(titleInput, { target: { value: "" } });

    const saveButton = screen.getByRole("button", { name: m.common_save() });
    expect(saveButton.hasAttribute("disabled")).toBe(true);
  });

  it("emptied description saves (empty descriptions are valid)", async () => {
    render(TicketContentEditSheet, { props: baseProps });

    // Wait for prefill
    await screen.findByDisplayValue("Original Title");
    const descInput = await screen.findByDisplayValue("Original Description");
    await fireEvent.input(descInput, { target: { value: "" } });

    const saveButton = screen.getByRole("button", { name: m.common_save() });
    expect(saveButton.hasAttribute("disabled")).toBe(false);

    await fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockEncrypt).toHaveBeenCalledWith("ticket-001", "description", "");
    });
  });

  it("resets the form when sheet reopens", async () => {
    const { rerender } = render(TicketContentEditSheet, {
      props: baseProps,
    });

    const titleInput = await screen.findByDisplayValue("Original Title");
    await fireEvent.input(titleInput, {
      target: { value: "Draft in progress" },
    });
    expect(screen.getByDisplayValue("Draft in progress")).toBeTruthy();

    await rerender({
      opened: false,
      ondismiss: vi.fn(),
      ticketId: "ticket-001",
    });
    await rerender({
      opened: true,
      ondismiss: vi.fn(),
      ticketId: "ticket-001",
    });

    // After reopen, should prefill from decrypt again (not keep draft).
    expect(await screen.findByDisplayValue("Original Title")).toBeTruthy();
  });
});
