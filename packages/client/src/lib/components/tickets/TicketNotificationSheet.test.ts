// @vitest-environment jsdom
/**
 * TicketNotificationSheet tests: renders effective states from mixed-scope
 * fixture rows, toggle emits ticket-scope mutation, reset emits scoped reset,
 * loading state shows disabled toggles, error state shows QueryError.
 *
 * Mirrors TicketContentEditSheet.test.ts harness: mock tRPC, query client,
 * ShellSheet passthrough, and paraglide messages.
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
import type * as Haptic from "$lib/utils/haptic.js";
import type * as Announce from "$lib/utils/announce.js";
import type * as ShellSheetMod from "$lib/shell/ShellSheet.svelte";
import * as m from "$lib/paraglide/messages.js";
import { toastStore } from "$lib/stores/toast.svelte.js";

// ---- Hoisted mocks ----

const {
  mockSetPreference,
  mockResetPreferences,
  mockGetPreferences,
  mockInvalidateQueries,
} = vi.hoisted(() => ({
  mockSetPreference: vi
    .fn<(input: Record<string, unknown>) => Promise<unknown>>()
    .mockResolvedValue({ saved: true }),
  mockResetPreferences: vi
    .fn<(input: Record<string, unknown>) => Promise<unknown>>()
    .mockResolvedValue({ ok: true }),
  mockGetPreferences: vi
    .fn<() => Promise<{ preferences: Array<Record<string, unknown>> }>>()
    .mockResolvedValue({ preferences: [] }),
  mockInvalidateQueries: vi
    .fn<(opts: { queryKey: readonly unknown[] }) => Promise<void>>()
    .mockResolvedValue(undefined),
}));

const toastShowSpy = vi
  .spyOn(toastStore, "show")
  .mockImplementation(() => undefined);

let preferencesQueryState: Record<string, unknown> = {};

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQuery>()),
  createQuery: () => preferencesQueryState,
  createMutation: (fn: () => Record<string, unknown>) => {
    const config = fn();
    return {
      isPending: false,
      mutate: (input: Record<string, unknown>) => {
        const mutationFn = config.mutationFn as (
          input: Record<string, unknown>,
        ) => Promise<unknown>;
        void mutationFn(input)
          .then(() => {
            const onSuccess = config.onSuccess as (() => void) | undefined;
            onSuccess?.();
          })
          .catch(() => {
            const onError = config.onError as (() => void) | undefined;
            onError?.();
          });
      },
    };
  },
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Trpc>()),
  trpc: {
    notifications: {
      getPreferences: { query: mockGetPreferences },
      setPreference: { mutate: mockSetPreference },
      resetPreferences: { mutate: mockResetPreferences },
    },
  },
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Errors>()),
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
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
  ticketId: "ticket-abc",
};

beforeEach(() => {
  preferencesQueryState = {
    isLoading: false,
    isError: false,
    error: null,
    data: { preferences: [] },
    refetch: vi.fn(),
  };
  mockSetPreference.mockClear();
  mockResetPreferences.mockClear();
  mockGetPreferences.mockClear();
  mockInvalidateQueries.mockClear();
  toastShowSpy.mockClear();
  baseProps.ondismiss = vi.fn();
});

afterEach(cleanup);

const TicketNotificationSheet = (
  await import("./TicketNotificationSheet.svelte")
).default;

describe("TicketNotificationSheet", () => {
  it("renders 6 event rows with 3 toggle columns each", () => {
    render(TicketNotificationSheet, { props: baseProps });

    // 6 event types x 3 channels = 18 toggles
    const toggleInputs = screen.getAllByRole("checkbox");
    expect(toggleInputs.length).toBe(18);
  });

  it("renders effective state from mixed-scope rows", () => {
    preferencesQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: {
        preferences: [
          // Global: push off for followup_added
          {
            scopeType: "global",
            scopeId: null,
            eventType: "followup_added",
            channel: "push",
            enabled: false,
          },
          // Ticket override: push ON for followup_added on this ticket
          {
            scopeType: "ticket",
            scopeId: "ticket-abc",
            eventType: "followup_added",
            channel: "push",
            enabled: true,
          },
        ],
      },
      refetch: vi.fn(),
    };

    render(TicketNotificationSheet, { props: baseProps });

    // The ticket override (enabled: true) should win over global (enabled: false)
    const pushFollowupToggle = screen.getByRole("checkbox", {
      name: m.notif_toggle_aria({
        channel: m.notif_channel_push(),
        event: m.notif_event_followup_added(),
      }),
    });
    expect(pushFollowupToggle).toBeTruthy();
    // Checked state reflects the ticket override
    expect((pushFollowupToggle as HTMLInputElement).checked).toBe(true);
  });

  it("toggle emits ticket-scope setPreference mutation", async () => {
    render(TicketNotificationSheet, { props: baseProps });

    // All toggles default to checked (no rows = true). Toggling one should
    // call setPreference with enabled: false (flipping the current true).
    const firstToggle = screen.getByRole("checkbox", {
      name: m.notif_toggle_aria({
        channel: m.notif_channel_push(),
        event: m.notif_event_followup_added(),
      }),
    });

    await fireEvent.click(firstToggle);

    await waitFor(() => {
      expect(mockSetPreference).toHaveBeenCalledTimes(1);
    });

    expect(mockSetPreference).toHaveBeenCalledWith({
      scopeType: "ticket",
      scopeId: "ticket-abc",
      eventType: "followup_added",
      channel: "push",
      enabled: false,
    });
  });

  it("reset button emits ticket-scope resetPreferences", async () => {
    render(TicketNotificationSheet, { props: baseProps });

    const resetButton = screen.getByRole("button", {
      name: m.notif_ticket_reset(),
    });
    await fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockResetPreferences).toHaveBeenCalledTimes(1);
    });

    expect(mockResetPreferences).toHaveBeenCalledWith({
      scopeType: "ticket",
      scopeId: "ticket-abc",
    });
  });

  it("shows disabled toggles during loading", () => {
    preferencesQueryState = {
      isLoading: true,
      isError: false,
      error: null,
      data: undefined,
      refetch: vi.fn(),
    };

    render(TicketNotificationSheet, { props: baseProps });

    const toggleInputs = screen.getAllByRole("checkbox");
    // All 18 toggles should be disabled
    for (const input of toggleInputs) {
      expect((input as HTMLInputElement).disabled).toBe(true);
    }
  });

  it("shows QueryError on error state", () => {
    preferencesQueryState = {
      isLoading: false,
      isError: true,
      error: new Error("network"),
      data: undefined,
      refetch: vi.fn(),
    };

    render(TicketNotificationSheet, { props: baseProps });

    // No toggles should render in the error branch
    const toggleInputs = screen.queryAllByRole("checkbox");
    expect(toggleInputs.length).toBe(0);
  });

  it("success mutation shows toast and invalidates preferences", async () => {
    render(TicketNotificationSheet, { props: baseProps });

    const firstToggle = screen.getByRole("checkbox", {
      name: m.notif_toggle_aria({
        channel: m.notif_channel_push(),
        event: m.notif_event_followup_added(),
      }),
    });

    await fireEvent.click(firstToggle);

    await waitFor(() => {
      expect(toastShowSpy).toHaveBeenCalledWith(m.notif_ticket_pref_saved());
    });

    expect(mockInvalidateQueries).toHaveBeenCalled();
  });
});
