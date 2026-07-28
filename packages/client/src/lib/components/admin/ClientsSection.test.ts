// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/svelte";
import { ErrorCode } from "@care-y/shared";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as TanstackQuery from "@tanstack/svelte-query";
import type * as CryptoContext from "$lib/crypto/context.js";
import type * as ToastStore from "$lib/stores/toast.svelte.js";
import type * as Haptic from "$lib/utils/haptic.js";
import type * as Announce from "$lib/utils/announce.js";
import type * as ClientFilters from "$lib/stores/client-filters.svelte.js";
import type * as ShellContext from "$lib/shell/context.js";

const {
  mockUpdateAlias,
  mockUpdatePhone,
  mockUndoMerge,
  mockLockMerge,
  mockToastShow,
  mockClientGet,
} = vi.hoisted(() => ({
  mockUpdateAlias: vi.fn().mockResolvedValue(undefined),
  mockUpdatePhone: vi.fn().mockResolvedValue({ success: true, conflict: null }),
  mockUndoMerge: vi.fn().mockResolvedValue({}),
  mockLockMerge: vi.fn().mockResolvedValue({}),
  mockToastShow: vi.fn(),
  mockClientGet: vi.fn(),
}));

interface ClientListItem {
  id: string;
  encryptedAlias: string;
  aliasHash: string | null;
  phone: string;
  ticketCount: number;
  createdAt: string;
  mergedInto: string | null;
}

interface ClientDetail {
  id: string;
  encryptedAlias: string;
  aliasHash: string | null;
  phone: string;
  phoneHash: string;
  ticketCount: number;
  createdAt: string;
  tickets: ReadonlyArray<{
    id: string;
    encryptedTitle: string;
    status: string;
    priority: string;
    createdAt: string;
    keyGeneration: string;
  }>;
  mergeHistory: ReadonlyArray<{
    id: string;
    primaryClientId: string;
    secondaryClientId: string;
    mergedAt: string;
    snapshot: string;
    undoLocked: boolean;
    isUndone: boolean;
  }>;
}

let mockDetailData: ClientDetail | undefined;
let mockDetailLoading = false;
let mockDetailError = false;

// vi.mock required: tests pin deterministic message strings for assertions.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  register_note: () => "Note",
  register_careful: () => "Careful",
  register_warning: () => "Warning",
  register_protected: () => "Protected",
  clients_empty_state: () => "No clients found",
  clients_empty_subtitle: () => "Clients are created when tickets are opened.",
  clients_search_placeholder: () => "Search by alias...",
  clients_sort_alias: () => "Alias",
  clients_sort_created: () => "Date created",
  clients_sort_tickets: () => "Ticket count",
  clients_ticket_count_one: ({ count }: { count: number }) =>
    `${String(count)} ticket`,
  clients_ticket_count_other: ({ count }: { count: number }) =>
    `${String(count)} tickets`,
  client_detail_title: () => "Client Detail",
  client_alias_label: () => "Alias",
  client_alias_placeholder: () => "lowercase-with-hyphens",
  client_alias_uniqueness_error: () => "This alias is already in use",
  client_alias_changed_toast: () => "Alias updated",
  client_phone_label: () => "Phone",
  client_phone_edit: () => "Edit phone",
  client_phone_placeholder: () => "+1 555 000 1234",
  client_phone_invalid_error: () => "Enter a number like +1 555 000 1234",
  client_phone_changed_toast: () => "Phone number updated",
  client_phone_confirm_title: () => "Confirm phone change",
  client_phone_confirm_body: ({ alias }: { alias: string }) =>
    `This changes the phone for ${alias} across all their tickets.`,
  client_phone_conflict_title: () => "Phone conflict",
  client_phone_conflict_body: ({ alias }: { alias: string }) =>
    `This number belongs to ${alias}. Merge instead?`,
  client_phone_conflict_merge: () => "Merge clients",
  client_edit_title: () => "Edit client",
  client_merge_sheet_title: () => "Merge records",
  client_tickets_heading: () => "Tickets",
  client_no_tickets: () => "No tickets for this client.",
  client_merge_history_heading: () => "Merge history",
  client_merge_undo: () => "Undo merge",
  client_merge_lock: () => "Lock merge",
  client_merge_unlock: () => "Unlock merge",
  client_merge_locked: () => "Locked",
  client_merge_event: ({ alias }: { alias: string }) => `${alias} merged here`,
  admin_user_save_changes: () => "Save changes",
  admin_clients_title: () => "Clients",
  common_cancel: () => "Cancel",
  common_loading: () => "Loading",
  common_load_more: () => "Load more",
  error_generic: () => "Something went wrong",
  shell_close: () => "Close",
  app_retry: () => "Retry",
  empty_no_data: () => "No data",
  decrypt_placeholder_loading: () => "Decrypting...",
  status_mark_new: () => "New",
  status_mark_active: () => "Active",
  status_mark_hold: () => "On hold",
  status_mark_closed: () => "Closed",
}));

// vi.mock required: tRPC client creates a live HTTP connection on import.
// care-y-ignore-next-line mock-factory-unguarded -- importOriginal would open the live tRPC HTTP client; a hand stub cannot satisfy the generated router proxy type
vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    clients: {
      list: { query: vi.fn().mockResolvedValue([]) },
      get: { query: mockClientGet },
      updateAlias: { mutate: mockUpdateAlias },
      updatePhone: { mutate: mockUpdatePhone },
      backfillAliasHash: { mutate: vi.fn().mockResolvedValue(undefined) },
    },
    tickets: {
      undoMerge: { mutate: mockUndoMerge },
      lockMerge: { mutate: mockLockMerge },
    },
  },
}));

let queryCallIndex = 0;

// vi.mock required: @tanstack/svelte-query creates reactive query state
// bound to a QueryClient context that does not exist in jsdom.
vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof TanstackQuery>()),
  createQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    const idx = queryCallIndex++;
    // Index 0 = clientDetailQuery (inside ClientsSection)
    return {
      get isLoading() {
        return idx === 0 ? mockDetailLoading : false;
      },
      get isError() {
        return idx === 0 ? mockDetailError : false;
      },
      error: null,
      get data() {
        return idx === 0 ? mockDetailData : undefined;
      },
      refetch: vi.fn(),
    };
  },
  createInfiniteQuery: () => ({
    data: { pages: [] },
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
    isLoading: false,
    isError: false,
    error: null,
  }),
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as
      ((data: unknown, vars: unknown) => void) | undefined;
    const onError = opts.onError as ((err: Error) => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      get variables() {
        return {} as Record<string, unknown>;
      },
      mutate(input: unknown) {
        mutationFn(input).then(
          (data) => onSuccess?.(data, input),
          (err: unknown) =>
            onError?.(err instanceof Error ? err : new Error(String(err))),
        );
      },
    };
  },
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

// vi.mock required: createContext from Svelte 5 throws "missing_context"
// outside a live component tree.
vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
  getOrgDecryptCache: () => ({
    decrypt: () => "Decrypted Name",
    decryptAsync: vi.fn().mockResolvedValue("decrypted-value"),
    delete: vi.fn().mockReturnValue(true),
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
  }),
  getCurrentUserId: () => () => "current-user-id",
  getOrgKeyManager: () => ({
    get isLoaded() {
      return true;
    },
    encrypt: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
    encryptText: vi.fn().mockResolvedValue("encrypted-base64"),
    aliasHash: vi.fn().mockResolvedValue("deadbeef"),
  }),
}));

// vi.mock required: rune-module state must not leak across tests.
vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastStore>()),
  toastStore: { show: mockToastShow },
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Haptic>()),
  haptic: vi.fn(),
}));

vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Announce>()),
  announceToLiveRegion: vi.fn(),
}));

vi.mock("$lib/stores/client-filters.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ClientFilters>()),
  clientFilterStore: {
    sort: { field: "created_at", direction: "desc" },
    search: "",
    setSort: vi.fn(),
    setSearch: vi.fn(),
  },
}));

// vi.mock required: createContext from Svelte 5 throws "missing_context"
// outside a live component tree.
vi.mock("$lib/shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellContext>()),
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export
vi.mock("$lib/components/QueryError.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export
vi.mock("$lib/shell/ShellSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export
vi.mock("$lib/components/EmptyState.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// DecryptPlaceholder observes the viewport before it decrypts, and jsdom has
// no IntersectionObserver. Without this stub every render that reaches the
// detail sheet throws.
vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(function (this: {
    observe: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    unobserve: ReturnType<typeof vi.fn>;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

function makeClient(
  id: string,
  overrides: Partial<ClientListItem> = {},
): ClientListItem {
  return {
    id,
    encryptedAlias: `enc-alias-${id}`,
    aliasHash: `hash-${id}`,
    phone: "***1234",
    ticketCount: 2,
    createdAt: "2026-01-15T00:00:00.000Z",
    mergedInto: null,
    ...overrides,
  };
}

function makeDetail(
  id: string,
  overrides: Partial<ClientDetail> = {},
): ClientDetail {
  return {
    id,
    encryptedAlias: `enc-alias-${id}`,
    aliasHash: `hash-${id}`,
    phone: "+1 (555) 000-1234",
    phoneHash: "abc123",
    ticketCount: 1,
    createdAt: "2026-01-15T00:00:00.000Z",
    tickets: [
      {
        id: "t-1",
        encryptedTitle: btoa("encrypted-title"),
        status: "new",
        priority: "normal",
        createdAt: "2026-01-15T00:00:00.000Z",
        keyGeneration: "1",
      },
    ],
    mergeHistory: [],
    ...overrides,
  };
}

import ClientsSection from "./ClientsSection.svelte";

async function findDetailSheet(): Promise<HTMLElement> {
  return waitFor(() => {
    const shells = screen.getAllByTestId("passthrough-shell");
    const sheet = shells.find(
      (el) =>
        el.getAttribute("data-title") !== null &&
        el.getAttribute("data-title") !== "",
    );
    if (sheet === undefined) {
      throw new Error("detail sheet not open yet");
    }
    return sheet;
  });
}

describe("ClientsSection", () => {
  beforeEach(() => {
    mockDetailData = undefined;
    mockDetailLoading = false;
    mockDetailError = false;
    queryCallIndex = 0;
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  describe("list rendering", () => {
    it("shows loading state with skeleton items", () => {
      const { container } = render(ClientsSection, {
        props: { isLoading: true },
      });
      const skeletons = container.querySelectorAll("[data-skeleton]");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("shows error state with QueryError", () => {
      render(ClientsSection, {
        props: { isError: true, error: new Error("fail") },
      });
      // The detail sheet stub is always mounted, so pick the QueryError stub
      // by the absence of a sheet title.
      const shells = screen.getAllByTestId("passthrough-shell");
      const queryError = shells.find(
        (el) => el.getAttribute("data-title") === null,
      );
      expect(queryError).toBeTruthy();
    });

    it("shows empty state when client list is empty", () => {
      render(ClientsSection, {
        props: { clients: [] },
      });
      // EmptyState is stubbed to PassthroughShell; look for it
      const shells = screen.getAllByTestId("passthrough-shell");
      expect(shells.length).toBeGreaterThanOrEqual(1);
    });

    it("renders client rows when data is present", () => {
      const clients = [makeClient("c-1"), makeClient("c-2")];
      const { container } = render(ClientsSection, {
        props: { clients },
      });
      expect(container.querySelector(".clients-section")).toBeTruthy();
    });

    it("shows correct number of client items", () => {
      const clients = [makeClient("c-1"), makeClient("c-2"), makeClient("c-3")];
      render(ClientsSection, { props: { clients } });
      // Each client has a ListItem with role="button"
      const buttons = screen.getAllByRole("button");
      // At least 3 client row buttons (the save button in the sheet may also be present)
      expect(buttons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("client detail sheet", () => {
    it("opens the sheet via the openClientDetail export", async () => {
      mockDetailData = makeDetail("c-1");
      const clients = [makeClient("c-1")];
      const { component } = render(ClientsSection, { props: { clients } });

      component.openClientDetail("c-1");

      const sheet = await findDetailSheet();
      // The title is the decrypted alias, supplied by the org cache mock,
      // rather than the raw client id it used to fall back to.
      expect(sheet.getAttribute("data-title")).toBe("Decrypted Name");
    });

    it("renders alias input in the detail sheet", async () => {
      mockDetailData = makeDetail("c-1");
      const clients = [makeClient("c-1")];
      const { component } = render(ClientsSection, { props: { clients } });

      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      // "Alias" appears twice, once as the section label and once as the
      // Konsta input label.
      expect(within(sheet).getAllByText("Alias").length).toBeGreaterThan(0);
    });

    it("renders phone number in the detail sheet", async () => {
      mockDetailData = makeDetail("c-1", { phone: "+1 (555) 000-1234" });
      const clients = [makeClient("c-1")];
      const { component } = render(ClientsSection, { props: { clients } });

      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      // "Phone" appears twice, once as the section label and once as the
      // Konsta input label.
      expect(within(sheet).getAllByText("Phone").length).toBeGreaterThan(0);
    });

    it("renders tickets section heading", async () => {
      mockDetailData = makeDetail("c-1");
      const clients = [makeClient("c-1")];
      const { component } = render(ClientsSection, { props: { clients } });

      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      // Tickets heading includes count
      const heading = within(sheet).getByText(/Tickets/);
      expect(heading).toBeTruthy();
    });

    it("shows empty tickets message when no tickets", async () => {
      mockDetailData = makeDetail("c-1", { tickets: [] });
      const clients = [makeClient("c-1")];
      const { component } = render(ClientsSection, { props: { clients } });

      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      expect(
        within(sheet).getByText("No tickets for this client."),
      ).toBeTruthy();
    });

    it("hides merge history section when empty", async () => {
      mockDetailData = makeDetail("c-1", { mergeHistory: [] });
      const clients = [makeClient("c-1")];
      const { component } = render(ClientsSection, { props: { clients } });

      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      expect(within(sheet).queryByText("Merge history")).toBeNull();
    });

    it("shows merge history when events exist", async () => {
      mockDetailData = makeDetail("c-1", {
        mergeHistory: [
          {
            id: "me-1",
            primaryClientId: "c-1",
            secondaryClientId: "c-2",
            mergedAt: "2026-03-10T00:00:00.000Z",
            snapshot: btoa("{}"),
            undoLocked: false,
            isUndone: false,
          },
        ],
      });
      const clients = [makeClient("c-1")];
      const { component } = render(ClientsSection, { props: { clients } });

      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      expect(within(sheet).getByText("Merge history")).toBeTruthy();
    });
  });

  describe("alias editing", () => {
    it("fires updateAlias mutation when alias is changed and saved", async () => {
      mockDetailData = makeDetail("c-1");
      const clients = [makeClient("c-1")];
      const { component } = render(ClientsSection, { props: { clients } });

      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      // Find the alias input
      const inputs = within(sheet).getAllByRole("textbox");
      const aliasInput = inputs[0]!;

      await fireEvent.input(aliasInput, {
        target: { value: "new-alias-name" },
      });

      const saveButton = within(sheet).getByRole("button", {
        name: "Save changes",
      });
      await fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateAlias).toHaveBeenCalledWith({
          clientId: "c-1",
          encryptedAlias: "encrypted-base64",
          aliasHash: "deadbeef",
        });
      });
    });

    it("shows alias conflict error via FieldError", async () => {
      mockUpdateAlias.mockRejectedValueOnce(
        new Error(ErrorCode.CLIENT_ALIAS_CONFLICT),
      );

      mockDetailData = makeDetail("c-1");
      const clients = [makeClient("c-1")];
      const { component } = render(ClientsSection, { props: { clients } });

      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      const inputs = within(sheet).getAllByRole("textbox");
      await fireEvent.input(inputs[0]!, {
        target: { value: "taken-alias" },
      });

      const saveButton = within(sheet).getByRole("button", {
        name: "Save changes",
      });
      await fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          within(sheet).getByText("This alias is already in use"),
        ).toBeTruthy();
      });
    });

    it("shows generic error toast for non-conflict alias errors", async () => {
      mockUpdateAlias.mockRejectedValueOnce(new Error("NETWORK_ERROR"));

      mockDetailData = makeDetail("c-1");
      const clients = [makeClient("c-1")];
      const { component } = render(ClientsSection, { props: { clients } });

      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      const inputs = within(sheet).getAllByRole("textbox");
      await fireEvent.input(inputs[0]!, {
        target: { value: "valid-alias" },
      });

      const saveButton = within(sheet).getByRole("button", {
        name: "Save changes",
      });
      await fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalledWith("Something went wrong");
      });
    });

    it("shows toast on successful alias update", async () => {
      mockDetailData = makeDetail("c-1");
      const clients = [makeClient("c-1")];
      const { component } = render(ClientsSection, { props: { clients } });

      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      const inputs = within(sheet).getAllByRole("textbox");
      await fireEvent.input(inputs[0]!, {
        target: { value: "updated-alias" },
      });

      const saveButton = within(sheet).getByRole("button", {
        name: "Save changes",
      });
      await fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalledWith("Alias updated");
      });
    });
  });

  describe("phone editing", () => {
    async function openWithPhone(value: string): Promise<HTMLElement> {
      mockDetailData = makeDetail("c-1");
      const { component } = render(ClientsSection, {
        props: { clients: [makeClient("c-1")] },
      });
      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      const phoneInput = within(sheet).getByPlaceholderText("+1 555 000 1234");
      await fireEvent.input(phoneInput, { target: { value } });
      return sheet;
    }

    it("shows the current number as read-only alongside an empty input", async () => {
      mockDetailData = makeDetail("c-1", { phone: "+1 (555) 000-1234" });
      const { component } = render(ClientsSection, {
        props: { clients: [makeClient("c-1")] },
      });
      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      expect(within(sheet).getByText("+1 (555) 000-1234")).toBeTruthy();
      const phoneInput = within(sheet).getByPlaceholderText("+1 555 000 1234");
      expect((phoneInput as HTMLInputElement).value).toBe("");
    });

    it("reports an invalid number instead of silently disabling Save", async () => {
      const sheet = await openWithPhone("555-1234");

      await waitFor(() => {
        expect(
          within(sheet).getByText("Enter a number like +1 555 000 1234"),
        ).toBeTruthy();
      });
    });

    it("routes a valid number to the confirm step rather than writing", async () => {
      const sheet = await openWithPhone("+15550001234");

      await fireEvent.click(
        within(sheet).getByRole("button", { name: "Save changes" }),
      );

      await waitFor(() => {
        expect(
          within(sheet).getByText(
            "This changes the phone for Decrypted Name across all their tickets.",
          ),
        ).toBeTruthy();
      });
      expect(mockUpdatePhone).not.toHaveBeenCalled();
    });

    it("writes the number only after the confirm step is accepted", async () => {
      const sheet = await openWithPhone("+15550001234");

      await fireEvent.click(
        within(sheet).getByRole("button", { name: "Save changes" }),
      );
      const confirm = await waitFor(() =>
        within(sheet).getByRole("button", { name: "Confirm phone change" }),
      );
      await fireEvent.click(confirm);

      await waitFor(() => {
        expect(mockUpdatePhone).toHaveBeenCalledWith({
          clientId: "c-1",
          phoneNumber: "+15550001234",
        });
      });
    });

    it("returns to editing when the confirm step is cancelled", async () => {
      const sheet = await openWithPhone("+15550001234");

      await fireEvent.click(
        within(sheet).getByRole("button", { name: "Save changes" }),
      );
      const cancel = await waitFor(() =>
        within(sheet).getByRole("button", { name: "Cancel" }),
      );
      await fireEvent.click(cancel);

      await waitFor(() => {
        expect(
          within(sheet).getByPlaceholderText("+1 555 000 1234"),
        ).toBeTruthy();
      });
      expect(mockUpdatePhone).not.toHaveBeenCalled();
    });

    it("advances to the conflict step when the number is already taken", async () => {
      mockUpdatePhone.mockResolvedValueOnce({
        success: true,
        conflict: {
          conflictingClientId: "c-2",
          conflictingClientEncryptedAlias: "enc-seaward-lamp",
        },
      });
      const sheet = await openWithPhone("+15550001234");

      await fireEvent.click(
        within(sheet).getByRole("button", { name: "Save changes" }),
      );
      const confirm = await waitFor(() =>
        within(sheet).getByRole("button", { name: "Confirm phone change" }),
      );
      await fireEvent.click(confirm);

      await waitFor(() => {
        expect(
          within(sheet).getByText(
            "This number belongs to Decrypted Name. Merge instead?",
          ),
        ).toBeTruthy();
      });
    });

    it("returns to editing and warns when the phone write fails", async () => {
      mockUpdatePhone.mockRejectedValueOnce(new Error("NETWORK_ERROR"));
      const sheet = await openWithPhone("+15550001234");

      await fireEvent.click(
        within(sheet).getByRole("button", { name: "Save changes" }),
      );
      const confirm = await waitFor(() =>
        within(sheet).getByRole("button", { name: "Confirm phone change" }),
      );
      await fireEvent.click(confirm);

      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalledWith("Something went wrong");
      });
      // Falling back to the edit step keeps the typed number recoverable.
      await waitFor(() => {
        expect(
          within(sheet).getByPlaceholderText("+1 555 000 1234"),
        ).toBeTruthy();
      });
    });

    it("clears the field and returns to editing from Try another", async () => {
      mockUpdatePhone.mockResolvedValueOnce({
        success: true,
        conflict: {
          conflictingClientId: "c-2",
          conflictingClientEncryptedAlias: "enc-seaward-lamp",
        },
      });
      const sheet = await openWithPhone("+15550001234");

      await fireEvent.click(
        within(sheet).getByRole("button", { name: "Save changes" }),
      );
      const confirm = await waitFor(() =>
        within(sheet).getByRole("button", { name: "Confirm phone change" }),
      );
      await fireEvent.click(confirm);

      const tryAnother = await waitFor(() =>
        within(sheet).getByRole("button", { name: "Edit phone" }),
      );
      await fireEvent.click(tryAnother);

      const phoneInput = await waitFor(() =>
        within(sheet).getByPlaceholderText("+1 555 000 1234"),
      );
      expect((phoneInput as HTMLInputElement).value).toBe("");
    });

    it("hands both clients to the merge sheet from the conflict step", async () => {
      mockUpdatePhone.mockResolvedValueOnce({
        success: true,
        conflict: {
          conflictingClientId: "c-2",
          conflictingClientEncryptedAlias: "enc-seaward-lamp",
        },
      });
      const sheet = await openWithPhone("+15550001234");

      await fireEvent.click(
        within(sheet).getByRole("button", { name: "Save changes" }),
      );
      const confirm = await waitFor(() =>
        within(sheet).getByRole("button", { name: "Confirm phone change" }),
      );
      await fireEvent.click(confirm);

      const merge = await waitFor(() =>
        within(sheet).getByRole("button", { name: "Merge clients" }),
      );
      await fireEvent.click(merge);

      await waitFor(() => {
        const mergeSheet = screen
          .getAllByTestId("passthrough-shell")
          .find((el) => el.getAttribute("data-title") === "Merge records");
        expect(mergeSheet).toBeTruthy();
        expect(mergeSheet!.getAttribute("data-opened")).toBe("true");
      });
    });

    it("does not stack a second sheet for phone editing", async () => {
      const sheet = await openWithPhone("+15550001234");

      // Sheets stay mounted for their animation, so count them rather than
      // look for absence. Advancing to confirm must not add one.
      const before = screen.getAllByTestId("passthrough-shell").length;

      await fireEvent.click(
        within(sheet).getByRole("button", { name: "Save changes" }),
      );
      await waitFor(() => {
        expect(
          within(sheet).getByRole("button", { name: "Confirm phone change" }),
        ).toBeTruthy();
      });

      expect(screen.getAllByTestId("passthrough-shell")).toHaveLength(before);
    });
  });

  describe("merge actions", () => {
    it("fires undoMerge mutation when undo button is clicked", async () => {
      mockDetailData = makeDetail("c-1", {
        mergeHistory: [
          {
            id: "me-1",
            primaryClientId: "c-1",
            secondaryClientId: "c-2",
            mergedAt: "2026-03-10T00:00:00.000Z",
            snapshot: btoa("{}"),
            undoLocked: false,
            isUndone: false,
          },
        ],
      });
      const clients = [makeClient("c-1")];
      const { component } = render(ClientsSection, { props: { clients } });

      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      const undoButton = within(sheet).getByRole("button", {
        name: /Undo merge/,
      });
      await fireEvent.click(undoButton);

      await waitFor(() => {
        expect(mockUndoMerge).toHaveBeenCalledWith({
          mergeEventId: "me-1",
          encryptedSnapshot: btoa("{}"),
        });
      });
    });

    it("warns when undoMerge fails", async () => {
      mockUndoMerge.mockRejectedValueOnce(new Error("NETWORK_ERROR"));
      mockDetailData = makeDetail("c-1", {
        mergeHistory: [
          {
            id: "me-1",
            primaryClientId: "c-1",
            secondaryClientId: "c-2",
            mergedAt: "2026-03-10T00:00:00.000Z",
            snapshot: btoa("{}"),
            undoLocked: false,
            isUndone: false,
          },
        ],
      });
      const { component } = render(ClientsSection, {
        props: { clients: [makeClient("c-1")] },
      });

      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      await fireEvent.click(
        within(sheet).getByRole("button", { name: /Undo merge/ }),
      );

      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalledWith("Something went wrong");
      });
    });

    it("warns when lockMerge fails", async () => {
      mockLockMerge.mockRejectedValueOnce(new Error("NETWORK_ERROR"));
      mockDetailData = makeDetail("c-1", {
        mergeHistory: [
          {
            id: "me-1",
            primaryClientId: "c-1",
            secondaryClientId: "c-2",
            mergedAt: "2026-03-10T00:00:00.000Z",
            snapshot: btoa("{}"),
            undoLocked: false,
            isUndone: false,
          },
        ],
      });
      const { component } = render(ClientsSection, {
        props: { clients: [makeClient("c-1")] },
      });

      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      await fireEvent.click(
        within(sheet).getByRole("button", { name: /Lock merge/ }),
      );

      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalledWith("Something went wrong");
      });
    });

    it("fires lockMerge mutation when lock button is clicked", async () => {
      mockDetailData = makeDetail("c-1", {
        mergeHistory: [
          {
            id: "me-1",
            primaryClientId: "c-1",
            secondaryClientId: "c-2",
            mergedAt: "2026-03-10T00:00:00.000Z",
            snapshot: btoa("{}"),
            undoLocked: false,
            isUndone: false,
          },
        ],
      });
      const clients = [makeClient("c-1")];
      const { component } = render(ClientsSection, { props: { clients } });

      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      const lockButton = within(sheet).getByRole("button", {
        name: /Lock merge/,
      });
      await fireEvent.click(lockButton);

      await waitFor(() => {
        expect(mockLockMerge).toHaveBeenCalledWith({
          mergeEventId: "me-1",
          locked: true,
        });
      });
    });
  });
});
