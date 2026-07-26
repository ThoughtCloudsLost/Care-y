// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

// Type-only imports for importOriginal generics and satisfies guards.
// The inline typeof import() form is rejected by consistent-type-imports.
import type * as BufferEncoding from "$lib/utils/buffer-encoding.js";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as TrpcModule from "$lib/trpc/index.js";
import type * as TanstackQuery from "@tanstack/svelte-query";
import type * as Haptic from "$lib/utils/haptic.js";
import type * as ToastStore from "$lib/stores/toast.svelte.js";
import type * as Announce from "$lib/utils/announce.js";
import type * as OrgSlug from "$lib/utils/org-slug.js";

const { mockRouteMutate, mockToastShow, mockHaptic } = vi.hoisted(() => ({
  mockRouteMutate: vi.fn().mockResolvedValue({
    ticketId: "t-1",
    followUpId: "fu-1",
  }),
  mockToastShow: vi.fn(),
  mockHaptic: vi.fn(),
}));

// vi.mock required: $lib/paraglide/messages.js is a generated module
// whose barrel import triggers Paraglide runtime side effects.
// Spreading importOriginal keeps every unpinned message real so the mock
// cannot drift from the compiled message surface.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  admin_quarantine_route_title: () => "Route voicemail",
  admin_quarantine_route_client_label: () => "Select or create a caller",
  admin_quarantine_route_client_placeholder: () => "Search by alias...",
  admin_quarantine_route_ticket_label: () => "Or route to an existing ticket",
  admin_quarantine_route_ticket_placeholder: () => "Ticket ID",
  admin_quarantine_route_submit: () => "Route",
  admin_quarantine_route_success: () => "Voicemail routed to ticket",
  admin_quarantine_route_error: () => "Failed to route voicemail",
  admin_quarantine_player_loading: () => "Decrypting audio...",
  common_loading: () => "Loading",
  common_cancel: () => "Cancel",
  error_generic: () => "Something went wrong",
  ticket_new_create_client: () => "Create new caller",
  ticket_new_success: () => "New caller registered",
  ticket_new_error_submit_failed: () => "Submission failed",
  ticket_new_field_phone_placeholder: () => "+1 555-000-0000",
  ticket_new_field_phone: () => "Phone",
  ticket_new_back_to_search: () => "Back to search",
  empty_no_results: () => "No results found",
}));

// vi.mock required: $lib/trpc/index.js creates a live tRPC HTTP client
// on import, which fails in the Node test environment.
vi.mock(
  "$lib/trpc/index.js",
  () =>
    ({
      trpc: {
        voicemailQuarantine: {
          list: { query: vi.fn() },
          download: { query: vi.fn() },
          route: { mutate: mockRouteMutate },
          dismiss: { mutate: vi.fn() },
        },
        tickets: {
          searchClients: { query: vi.fn().mockResolvedValue([]) },
        },
      } as never,
      setDevDelay: vi.fn(),
      isDevDelayEnabled: vi.fn().mockReturnValue(false),
    }) satisfies typeof TrpcModule,
);

// vi.mock required: @tanstack/svelte-query creates reactive query state
// bound to a QueryClient context that does not exist in jsdom.
vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof TanstackQuery>()),
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as
      ((data: unknown, vars: unknown) => void) | undefined;
    const onError = opts.onError as
      ((err: unknown, vars: unknown) => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      mutate(input: unknown) {
        mutationFn(input).then(
          (data) => onSuccess?.(data, input),
          (err: unknown) => onError?.(err, input),
        );
      },
    };
  },
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Haptic>()),
  haptic: mockHaptic,
}));
// vi.mock required: rune-module state must not leak across tests; the
// stub also exposes mockToastShow for call assertions.
vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastStore>()),
  toastStore: { show: mockToastShow },
}));
vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Announce>()),
  announceToLiveRegion: vi.fn(),
}));
vi.mock("$lib/utils/org-slug.js", async (importOriginal) => ({
  ...(await importOriginal<typeof OrgSlug>()),
  DEV_ORG_SLUG: "test-org",
}));
vi.mock("$lib/utils/buffer-encoding.js", async (importOriginal) => ({
  ...(await importOriginal<typeof BufferEncoding>()),
}));

// vi.mock required: ShellSheet uses Konsta Sheet which requires
// the full Konsta provider context that jsdom cannot provide.
// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/shell/ShellSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// vi.mock required: ClientSelect uses Bits UI Combobox which requires
// browser APIs for positioning that jsdom cannot provide.
// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/components/inputs/ClientSelect.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// jsdom lacks Web Animations API
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

import QuarantineRouteSheet from "./QuarantineRouteSheet.svelte";

describe("QuarantineRouteSheet", () => {
  const baseProps = {
    opened: true,
    quarantineId: crypto.randomUUID(),
    durationSeconds: 30,
    unsealedAudio: new Uint8Array([1, 2, 3, 4]),
    ondismiss: vi.fn(),
    onsuccess: vi.fn(),
  };

  beforeEach(() => {
    mockRouteMutate.mockClear();
    mockToastShow.mockClear();
    mockHaptic.mockClear();
    baseProps.ondismiss.mockClear();
    baseProps.onsuccess.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders route title", () => {
    render(QuarantineRouteSheet, { props: baseProps });

    expect(screen.getByText("Route voicemail")).toBeTruthy();
  });

  it("renders client and ticket mode tabs", () => {
    render(QuarantineRouteSheet, { props: baseProps });

    expect(screen.getByText("Select or create a caller")).toBeTruthy();
    expect(screen.getByText("Or route to an existing ticket")).toBeTruthy();
  });

  it("renders Route submit button", () => {
    render(QuarantineRouteSheet, { props: baseProps });

    expect(screen.getByText("Route")).toBeTruthy();
  });

  it("shows ticket ID input when switching to ticket mode", async () => {
    render(QuarantineRouteSheet, { props: baseProps });

    const ticketTab = screen.getByText("Or route to an existing ticket");
    await fireEvent.click(ticketTab);

    expect(screen.getByPlaceholderText("Ticket ID")).toBeTruthy();
  });

  it("shows loading hint when no unsealed audio is available", () => {
    render(QuarantineRouteSheet, {
      props: { ...baseProps, unsealedAudio: null },
    });

    expect(screen.getByText("Decrypting audio...")).toBeTruthy();
  });

  it("disables submit button when no unsealed audio is available", () => {
    render(QuarantineRouteSheet, {
      props: { ...baseProps, unsealedAudio: null },
    });

    const routeBtn = screen.getByText("Route");
    expect(routeBtn.closest("button")?.disabled).toBe(true);
  });
});
