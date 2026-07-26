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
  mockUndoMerge,
  mockLockMerge,
  mockToastShow,
  mockClientGet,
} = vi.hoisted(() => ({
  mockUpdateAlias: vi.fn().mockResolvedValue(undefined),
  mockUndoMerge: vi.fn().mockResolvedValue({}),
  mockLockMerge: vi.fn().mockResolvedValue({}),
  mockToastShow: vi.fn(),
  mockClientGet: vi.fn(),
}));

interface ClientListItem {
  id: string;
  alias: string;
  phone: string;
  ticketCount: number;
  createdAt: string;
  mergedInto: string | null;
}

interface ClientDetail {
  id: string;
  alias: string;
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
    sort: { field: "alias", direction: "asc" },
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
    alias: `client-${id}`,
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
    alias: `client-${id}`,
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
      const shell = screen.getByTestId("passthrough-shell");
      expect(shell).toBeTruthy();
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
      expect(sheet.getAttribute("data-title")).toBe("client-c-1");
    });

    it("renders alias input in the detail sheet", async () => {
      mockDetailData = makeDetail("c-1");
      const clients = [makeClient("c-1")];
      const { component } = render(ClientsSection, { props: { clients } });

      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      // The section label "Alias" should be visible
      expect(within(sheet).getByText("Alias")).toBeTruthy();
    });

    it("renders phone number in the detail sheet", async () => {
      mockDetailData = makeDetail("c-1", { phone: "+1 (555) 000-1234" });
      const clients = [makeClient("c-1")];
      const { component } = render(ClientsSection, { props: { clients } });

      component.openClientDetail("c-1");
      const sheet = await findDetailSheet();

      expect(within(sheet).getByText("Phone")).toBeTruthy();
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
          alias: "new-alias-name",
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
        });
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
