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
import type * as CryptoContext from "$lib/crypto/context.js";
import type * as AsyncDecryptCache from "$lib/crypto/async-decrypt-cache.js";
import type * as DecryptResult from "$lib/crypto/decrypt-result.js";
import type * as FormatTime from "$lib/utils/format-time.js";

const { mockDismiss, mockDownload, mockToastShow, mockHaptic, mockOrgDecrypt } =
  vi.hoisted(() => ({
    mockDismiss: vi.fn().mockResolvedValue(undefined),
    mockDownload: vi.fn().mockResolvedValue({
      sealedBase64: "c2VhbGVk",
      durationSeconds: 30,
    }),
    mockToastShow: vi.fn(),
    mockHaptic: vi.fn(),
    mockOrgDecrypt: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  }));

interface QuarantineEntry {
  id: string;
  reason: string;
  status: string;
  createdAt: Date;
  durationSeconds: number | null;
  encryptedCallerNumber: string | null;
  encryptedCalledNumber: string | null;
  clientId: string | null;
  routedTicketId: string | null;
  routedFollowupId: string | null;
  resolvedBy: string | null;
  resolvedAt: Date | null;
}

let mockQuarantineData: QuarantineEntry[] | undefined;
let mockIsLoading: boolean;

// vi.mock required: $lib/paraglide/messages.js is a generated module
// whose barrel import triggers side effects from the Paraglide runtime.
// Spreading importOriginal keeps every unpinned message real so the mock
// cannot drift from the compiled message surface.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  admin_quarantine_empty: () => "No quarantined voicemails.",
  admin_quarantine_reason_tracker_miss: () => "No matching call tracker",
  admin_quarantine_reason_no_intake_queue: () => "No intake queue configured",
  admin_quarantine_reason_unresolved_client: () => "Unresolved caller",
  admin_quarantine_status_pending: () => "Pending",
  admin_quarantine_status_routed: () => "Routed",
  admin_quarantine_status_dismissed: () => "Dismissed",
  admin_quarantine_play: () => "Play voicemail",
  admin_quarantine_route: () => "Route to ticket",
  admin_quarantine_dismiss: () => "Dismiss",
  admin_quarantine_dismiss_title: () => "Dismiss voicemail",
  admin_quarantine_dismiss_confirm: () =>
    "This will permanently delete the recording. Are you sure?",
  admin_quarantine_dismiss_success: () => "Voicemail dismissed",
  admin_quarantine_dismiss_error: () => "Failed to dismiss voicemail",
  admin_quarantine_player_error: () => "Could not load voicemail audio",
  admin_quarantine_player_loading: () => "Decrypting audio...",
  admin_quarantine_caller: () => "Caller",
  admin_quarantine_called: () => "Called",
  admin_quarantine_route_title: () => "Route voicemail",
  admin_quarantine_route_client_label: () => "Select or create a caller",
  admin_quarantine_route_client_placeholder: () => "Search by alias...",
  admin_quarantine_route_ticket_label: () => "Or route to an existing ticket",
  admin_quarantine_route_ticket_placeholder: () => "Ticket ID",
  admin_quarantine_route_submit: () => "Route",
  admin_quarantine_route_success: () => "Voicemail routed to ticket",
  admin_quarantine_route_error: () => "Failed to route voicemail",
  common_loading: () => "Loading",
  common_cancel: () => "Cancel",
  error_generic: () => "Something went wrong",
  decrypt_placeholder_loading: () => "Decrypting...",
  decrypt_placeholder_denied: () => "Access denied",
  error_decryption_failed: () => "Decryption failed",
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
          download: { query: mockDownload },
          route: { mutate: vi.fn() },
          dismiss: { mutate: mockDismiss },
        },
        tickets: {
          searchClients: { query: vi.fn() },
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
  createQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    return {
      get isLoading() {
        return mockIsLoading;
      },
      get isError() {
        return false;
      },
      error: null,
      get data() {
        return mockQuarantineData;
      },
      refetch: vi.fn(),
    };
  },
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
    getQueriesData: vi.fn().mockReturnValue([]),
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

// IntersectionObserver stub for DecryptPlaceholder
vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(function (this: {
    observe: () => void;
    disconnect: () => void;
    unobserve: () => void;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

// vi.mock required: createContext from Svelte 5 throws "missing_context"
// outside a live component tree. Crypto contexts are set by CryptoProvider
// in the (app) layout, but component tests don't mount the full layout.
// care-y-ignore-next-line mock-factory-unguarded -- importOriginal triggers createContext() outside component tree; return type `: typeof CryptoContext` guards against drift
vi.mock("$lib/crypto/context.js", (): typeof CryptoContext => ({
  getOrgDecryptCache: () =>
    ({
      decrypt: (_id: string, encrypted: unknown) =>
        encrypted instanceof Uint8Array ? "+15551234567" : null,
      get: vi.fn().mockReturnValue(undefined),
      has: vi.fn().mockReturnValue(false),
    }) as never,
  getOrgKeyManager: () =>
    ({
      decrypt: mockOrgDecrypt,
      isLoaded: true,
    }) as never,
  getCryptoBridge: () => ({ encrypt: vi.fn(), decrypt: vi.fn() }) as never,
  getTicketDecryptCache: () => ({ decrypt: vi.fn() }) as never,
  getCurrentUserId: () => () => undefined,
  getCurrentUserRoleId: () => () => undefined,
  getCurrentPermissions: () => () => new Set(),
  getFollowUpDecryptCache: () => ({ decryptContent: vi.fn() }) as never,
  getPreviewLoader: () => ({ load: vi.fn() }) as never,
  setCryptoBridge: (v) => v,
  setOrgKeyManager: (v) => v,
  setOrgDecryptCache: (v) => v,
  setTicketDecryptCache: (v) => v,
  setCurrentUserId: (v) => v,
  setCurrentUserRoleId: (v) => v,
  setCurrentPermissions: (v) => v,
  setFollowUpDecryptCache: (v) => v,
  setPreviewLoader: (v) => v,
}));

vi.mock("$lib/crypto/async-decrypt-cache.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AsyncDecryptCache>()),
  DECRYPT_ERROR_SENTINEL: "\0DECRYPT_FAILED",
  isDecryptError: (v: unknown) => v === "\0DECRYPT_FAILED",
}));

vi.mock("$lib/crypto/decrypt-result.js", async (importOriginal) => ({
  ...(await importOriginal<typeof DecryptResult>()),
  LOADING: Object.freeze({ status: "loading" }),
  ERROR: Object.freeze({ status: "error" }),
  DENIED: Object.freeze({ status: "denied" }),
}));

vi.mock("$lib/utils/format-time.js", async (importOriginal) => ({
  ...(await importOriginal<typeof FormatTime>()),
  formatRelativeTime: () => "2d ago",
}));

vi.mock("$lib/utils/buffer-encoding.js", async (importOriginal) => ({
  ...(await importOriginal<typeof BufferEncoding>()),
  base64ToUint8Array: () => new Uint8Array([1, 2, 3]),
}));

// vi.mock required: QuarantinePlayer and QuarantineRouteSheet import
// browser-only APIs (AudioContext, fetch) and Konsta/Bits UI components
// that cannot render in jsdom without the full Konsta/Bits setup.
// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("./QuarantinePlayer.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("./QuarantineRouteSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, dialog stub cannot satisfy the component prop types
vi.mock("$lib/shell/ShellDialog.svelte", async () => ({
  default: (await import("./test-helpers/StubShellDialog.svelte")).default,
}));

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

import QuarantineSection from "./QuarantineSection.svelte";

function makeEntry(overrides: Partial<QuarantineEntry> = {}): QuarantineEntry {
  return {
    id: crypto.randomUUID(),
    reason: "tracker_miss",
    status: "pending",
    createdAt: new Date("2026-07-20"),
    durationSeconds: 30,
    encryptedCallerNumber: "ZW5jcnlwdGVk",
    encryptedCalledNumber: null,
    clientId: null,
    routedTicketId: null,
    routedFollowupId: null,
    resolvedBy: null,
    resolvedAt: null,
    ...overrides,
  };
}

describe("QuarantineSection", () => {
  beforeEach(() => {
    mockQuarantineData = undefined;
    mockIsLoading = true;
    mockDismiss.mockClear();
    mockDownload.mockClear();
    mockToastShow.mockClear();
    mockHaptic.mockClear();
    mockOrgDecrypt.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows empty state when no entries exist", () => {
    mockIsLoading = false;
    mockQuarantineData = [];
    render(QuarantineSection);

    expect(screen.getByText("No quarantined voicemails.")).toBeTruthy();
  });

  it("renders reason labels for each quarantine reason", () => {
    mockIsLoading = false;
    mockQuarantineData = [
      makeEntry({ id: "q-1", reason: "tracker_miss" }),
      makeEntry({ id: "q-2", reason: "no_intake_queue" }),
      makeEntry({ id: "q-3", reason: "unresolved_client" }),
    ];
    render(QuarantineSection);

    expect(screen.getByText("No matching call tracker")).toBeTruthy();
    expect(screen.getByText("No intake queue configured")).toBeTruthy();
    expect(screen.getByText("Unresolved caller")).toBeTruthy();
  });

  it("renders relative time for each entry", () => {
    mockIsLoading = false;
    mockQuarantineData = [makeEntry()];
    render(QuarantineSection);

    expect(screen.getByText("2d ago")).toBeTruthy();
  });

  it("shows play, route, and dismiss action buttons", () => {
    mockIsLoading = false;
    mockQuarantineData = [makeEntry()];
    render(QuarantineSection);

    expect(screen.getByLabelText("Play voicemail")).toBeTruthy();
    expect(screen.getByLabelText("Route to ticket")).toBeTruthy();
    expect(screen.getByLabelText("Dismiss")).toBeTruthy();
  });

  it("opens dismiss dialog and calls dismiss mutation on confirm", async () => {
    mockIsLoading = false;
    const entry = makeEntry({ id: "q-dismiss" });
    mockQuarantineData = [entry];
    render(QuarantineSection);

    const dismissBtn = screen.getByLabelText("Dismiss");
    await fireEvent.click(dismissBtn);

    expect(screen.getByText("Dismiss voicemail")).toBeTruthy();
    expect(
      screen.getByText(
        "This will permanently delete the recording. Are you sure?",
      ),
    ).toBeTruthy();

    const confirmBtn = screen
      .getAllByText("Dismiss")
      .find((el) => el.closest("[data-testid='stub-dialog']") !== null);
    expect(confirmBtn).toBeTruthy();
    await fireEvent.click(confirmBtn!);

    expect(mockDismiss).toHaveBeenCalledWith({
      quarantineId: "q-dismiss",
    });
  });

  it("shows toast on successful dismiss", async () => {
    mockIsLoading = false;
    mockQuarantineData = [makeEntry({ id: "q-toast" })];
    render(QuarantineSection);

    const dismissBtn = screen.getByLabelText("Dismiss");
    await fireEvent.click(dismissBtn);

    const confirmBtn = screen
      .getAllByText("Dismiss")
      .find((el) => el.closest("[data-testid='stub-dialog']") !== null);
    await fireEvent.click(confirmBtn!);

    await vi.waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Voicemail dismissed");
    });
  });

  it("shows caller number label when encrypted number is present", () => {
    mockIsLoading = false;
    mockQuarantineData = [makeEntry({ encryptedCallerNumber: "ZW5jcnlwdGVk" })];
    render(QuarantineSection);

    expect(screen.getByText("Caller:")).toBeTruthy();
  });

  it("shows skeleton placeholders while loading", () => {
    mockIsLoading = true;
    mockQuarantineData = undefined;
    const { container } = render(QuarantineSection);

    expect(container.querySelector(".skeleton-pulse")).toBeTruthy();
  });
});
