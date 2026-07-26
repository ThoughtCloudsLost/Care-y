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
import { tick } from "svelte";
import { ErrorCode } from "@care-y/shared";

// Type-only namespace imports for importOriginal generics (the inline
// typeof import() form is rejected by consistent-type-imports).
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as TrpcIndex from "$lib/trpc/index.js";
import type * as TanstackQuery from "@tanstack/svelte-query";
import type * as CryptoContext from "$lib/crypto/context.js";
import type * as BufferEncoding from "$lib/utils/buffer-encoding.js";
import type * as ToastStore from "$lib/stores/toast.svelte.js";
import type * as Haptic from "$lib/utils/haptic.js";
import type * as Announce from "$lib/utils/announce.js";
import type * as ClientErrors from "$lib/errors.js";
import type * as A11y from "$lib/utils/a11y.js";
import type * as QueryErrorMod from "$lib/components/QueryError.svelte";
import type * as DecryptPlaceholderMod from "$lib/components/DecryptPlaceholder.svelte";
import type * as ShellDialogMod from "$lib/shell/ShellDialog.svelte";
import type * as ShellSheetMod from "$lib/shell/ShellSheet.svelte";
import type * as ShellActionSheetMod from "$lib/shell/ShellActionSheet.svelte";
import type * as QueueMemberPickerMod from "./QueueMemberPicker.svelte";
import type * as QueueEditorMod from "./QueueEditor.svelte";

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

const {
  mockReorderQueues,
  mockDeleteQueue,
  mockRemoveMember,
  mockSetIntakeQueue,
  mockToastShow,
  mockDecrypt,
  mockAnnounce,
} = vi.hoisted(() => ({
  mockReorderQueues: vi.fn().mockResolvedValue({}),
  mockDeleteQueue: vi.fn().mockResolvedValue({}),
  mockRemoveMember: vi.fn().mockResolvedValue({}),
  mockSetIntakeQueue: vi.fn().mockResolvedValue({ success: true }),
  mockToastShow: vi.fn(),
  mockDecrypt: vi.fn().mockReturnValue("Decrypted Queue"),
  mockAnnounce: vi.fn(),
}));

// The component derives QueueRecord from the queuesQuery return type.
// This interface mirrors the server's listQueues output shape so fixtures
// include all fields the template reads (encryptedName, encryptedColor,
// encryptedIcon). Keeping it local: the shape drives the mocked
// createQuery data and is not shared across test files.
interface QueueData {
  id: string;
  encryptedName: string;
  encryptedColor: string | null;
  encryptedIcon: string | null;
  sortOrder: number;
  escalateDays: number;
  isActive: boolean;
  createdAt: string;
  openCount: string;
  closedCount: string;
  holdCount: string;
  memberCount: string;
}

let mockQueuesData: QueueData[] | undefined;
let mockQueuesLoading = false;
let mockQueuesError: Error | null = null;

// Member data per queue, keyed by queue id
let mockMembersByQueue: Record<string, string[]> = {};
let mockMembersLoading = false;

// User data for the admin user lookup map
let mockUsersData: { id: string; encryptedDisplayName: string }[] = [];

// Intake queue designation (queueId or null)
let mockIntakeQueueData: { queueId: string | null } = { queueId: null };

// vi.mock required: paraglide messages are compiled by the Vite plugin;
// the .js barrel re-exports from ./messages/_index.js which depends on
// the paraglide runtime. Override per-message to get predictable strings.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  register_note: () => "Note",
  register_careful: () => "Careful",
  register_warning: () => "Warning",
  register_protected: () => "Protected",
  admin_queues_empty: () => "No queues yet",
  admin_queue_members: ({ count }: { count: number }) => `${count} members`,
  admin_queue_no_members: () => "No members",
  admin_queue_move_up: () => "Move up",
  admin_queue_move_down: () => "Move down",
  admin_queue_edit: () => "Edit",
  admin_queue_delete: () => "Delete",
  admin_queue_delete_title: ({ name }: { name: string }) => `Delete ${name}?`,
  admin_queue_delete_confirm_empty: () => "This queue has no tickets.",
  admin_queue_delete_confirm_tickets: () => "Reassign tickets first",
  admin_queue_delete_reassign_label: () => "Reassign to",
  admin_queue_deleted: () => "Queue deleted",
  admin_queue_reordered: () => "Queues reordered",
  admin_queue_member_removed: () => "Member removed",
  admin_queue_member_added: () => "Member added",
  admin_queue_add_member: () => "Add member",
  admin_queue_remove_member: ({ name }: { name: string }) => `Remove ${name}`,
  admin_queue_collapse: () => "Collapse",
  admin_queue_expand: () => "Expand",
  admin_queue_created: () => "Queue created",
  admin_queue_updated: () => "Queue updated",
  admin_queue_escalation_days: ({ count }: { count: number }) =>
    `${count} day escalation`,
  admin_queue_editor_create_title: () => "Create Queue",
  admin_queue_editor_edit_title: () => "Edit Queue",
  admin_queue_editor_name_label: () => "Queue name",
  admin_queue_editor_name_placeholder: () => "e.g. Intake",
  admin_queue_editor_name_required: () => "Name is required",
  admin_queue_editor_escalation_label: () => "Escalation (days)",
  admin_queue_editor_escalation_hint: () => "0 = no auto-escalation",
  admin_queue_editor_no_org_key: () => "Org key not loaded",
  admin_queue_editor_pii_warning: () => "Queue names are encrypted",
  admin_queue_editor_save: () => "Save",
  admin_queue_editor_delete: () => "Delete Queue",
  admin_queue_member_picker_title: () => "Add Member",
  admin_queue_member_picker_search: () => "Search",
  admin_queue_member_picker_empty: () => "No volunteers",
  admin_queue_member_picker_no_results: () => "No results",
  admin_queues_create: () => "Create",
  admin_queue_stat_open: ({ count }: { count: number }) => `${count} open`,
  admin_queue_stat_closed: ({ count }: { count: number }) => `${count} closed`,
  admin_queue_stat_hold: ({ count }: { count: number }) => `${count} hold`,
  admin_queue_add_member_button: () => "Add member",
  admin_queue_intake_chip: () => "Intake",
  admin_queue_intake_set: () => "Use as intake queue",
  admin_queue_intake_clear: () => "Remove intake designation",
  admin_queue_intake_set_success: () => "Intake queue updated",
  admin_queue_intake_set_error: () => "Could not update intake queue",
  admin_queue_intake_clear_success: () => "Intake queue designation removed",
  admin_queue_intake_clear_error: () =>
    "Could not remove intake queue designation",
  common_cancel: () => "Cancel",
  common_loading: () => "Loading",
  error_generic: () => "Something went wrong",
  decrypt_loading: () => "Loading...",
  decrypt_error: () => "Error",
  decrypt_denied: () => "Denied",
}));

// vi.mock required: tRPC client at $lib/trpc/index.js creates a live
// HTTP connection on import (httpBatchLink), imports SvelteKit virtual
// modules ($app/navigation, $app/paths) at module scope
vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcIndex>()),
  trpc: {
    tickets: {
      listQueues: { query: vi.fn() },
      createQueue: { mutate: vi.fn().mockResolvedValue({}) },
      updateQueue: { mutate: vi.fn().mockResolvedValue({}) },
      reorderQueues: { mutate: mockReorderQueues },
      deleteQueue: { mutate: mockDeleteQueue },
      listQueueMembers: { query: vi.fn().mockResolvedValue([]) },
      removeQueueMember: { mutate: mockRemoveMember },
    },
    auth: {
      listUsers: { query: vi.fn().mockResolvedValue([]) },
    },
    org: {
      getIntakeQueue: { query: vi.fn().mockResolvedValue({ queueId: null }) },
      setIntakeQueue: { mutate: mockSetIntakeQueue },
    },
  },
}));

// vi.mock required: @tanstack/svelte-query uses Svelte context internals
// that fail outside a running SvelteKit app (QueryClient provider)
vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof TanstackQuery>()),
  createQuery: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const keys = opts.queryKey as string[];
    if (keys[0] === "queues") {
      return {
        get isLoading() {
          return mockQueuesLoading;
        },
        get isError() {
          return mockQueuesError !== null;
        },
        get error() {
          return mockQueuesError;
        },
        get data() {
          return mockQueuesData;
        },
        refetch: vi.fn(),
      };
    }
    // admin intake queue query
    if (keys[0] === "admin" && keys[1] === "intakeQueue") {
      return {
        isLoading: false,
        isError: false,
        error: null,
        get data() {
          return mockIntakeQueueData;
        },
        refetch: vi.fn(),
      };
    }
    // admin users query
    if (keys[0] === "admin") {
      return {
        isLoading: false,
        isError: false,
        error: null,
        get data() {
          return mockUsersData;
        },
        refetch: vi.fn(),
      };
    }
    return {
      isLoading: false,
      isError: false,
      error: null,
      data: [],
      refetch: vi.fn(),
    };
  },
  createQueries: () => {
    const queues = mockQueuesData ?? [];
    return queues.map((q) => ({
      get data() {
        return mockMembersByQueue[q.id] ?? undefined;
      },
      get isLoading() {
        return mockMembersLoading;
      },
    }));
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
      mutate(input: unknown, overrides?: { onError?: (e: unknown) => void }) {
        mutationFn(input).then(
          (data) => onSuccess?.(data, input),
          (err: unknown) => {
            if (overrides?.onError) overrides.onError(err);
            else onError?.(err, input);
          },
        );
      },
    };
  },
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
    getQueriesData: vi.fn().mockReturnValue([]),
  }),
}));

// vi.mock required: getOrgDecryptCache uses Svelte context (setContext/
// getContext) which is unavailable outside component initialization.
// test-setup.ts already mocks the context module globally; this override
// provides a controllable decrypt function for per-test assertions.
vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
  getOrgDecryptCache: () => ({
    decrypt: mockDecrypt,
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
  }),
}));

// vi.mock required: buffer-encoding barrel imports from @care-y/crypto
// which triggers libsodium WASM initialization via getSodium()
vi.mock("$lib/utils/buffer-encoding.js", async (importOriginal) => ({
  ...(await importOriginal<typeof BufferEncoding>()),
  base64ToUint8Array: (s: string) => new Uint8Array(Buffer.from(s, "base64")),
  uint8ArrayToBase64: () => "AQID",
}));

// vi.mock required: toast store uses $state rune; override toastStore
// with a controllable mock for assertion
vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastStore>()),
  toastStore: { show: mockToastShow },
}));

// vi.mock required: haptic uses navigator.vibrate which is absent in jsdom
vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Haptic>()),
  haptic: vi.fn(),
}));

// vi.mock required: announceToLiveRegion manipulates DOM live regions
// that may not exist in the test document
vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Announce>()),
  announceToLiveRegion: mockAnnounce,
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ClientErrors>()),
  requireRouter: <T>(r: T): T => r,
}));

vi.mock("$lib/utils/a11y.js", async (importOriginal) => ({
  ...(await importOriginal<typeof A11y>()),
  onKeyActivate: (fn: () => void) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") fn();
  },
}));

// vi.mock required: Svelte component replacements for test isolation.
// Components with internal state, Konsta UI dependencies, or context
// consumption cannot render in jsdom without their parent providers.
// importOriginal spread preserves the module shape; default is overridden.
vi.mock("$lib/components/QueryError.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof QueryErrorMod>()),
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock(
  "$lib/components/DecryptPlaceholder.svelte",
  async (importOriginal) => ({
    ...(await importOriginal<typeof DecryptPlaceholderMod>()),
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  }),
);

vi.mock("$lib/shell/ShellDialog.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellDialogMod>()),
  default: (await import("./test-helpers/StubShellDialog.svelte")).default,
}));

vi.mock("$lib/shell/ShellSheet.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellSheetMod>()),
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/shell/ShellActionSheet.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellActionSheetMod>()),
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("./QueueMemberPicker.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof QueueMemberPickerMod>()),
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// vi.mock required: QueueEditor has internal state, crypto context deps,
// and Konsta form components. Replaced with StubQueueEditor that exposes
// the ondeletequeue callback via a clickable trigger for delete-flow tests.
vi.mock("./QueueEditor.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof QueueEditorMod>()),
  default: (await import("./test-helpers/StubQueueEditor.svelte")).default,
}));

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

function makeQueue(
  id: string,
  sortOrder: number,
  overrides?: Partial<QueueData>,
): QueueData {
  return {
    id,
    encryptedName: btoa("encrypted"),
    encryptedColor: null,
    encryptedIcon: null,
    sortOrder,
    escalateDays: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    openCount: "3",
    closedCount: "1",
    holdCount: "0",
    memberCount: "2",
    ...overrides,
  };
}

import QueuesSection from "./QueuesSection.svelte";

describe("QueuesSection", () => {
  beforeEach(() => {
    mockQueuesData = undefined;
    mockQueuesLoading = false;
    mockQueuesError = null;
    mockMembersByQueue = {};
    mockMembersLoading = false;
    mockUsersData = [];
    mockIntakeQueueData = { queueId: null };
    mockDecrypt.mockReturnValue("Decrypted Queue");
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  // ── Loading state ──

  it("shows loading skeletons when query is loading", () => {
    mockQueuesLoading = true;
    const { container } = render(QueuesSection);
    const cards = container.querySelectorAll(".queue-card");
    expect(cards.length).toBe(3);
  });

  // ── Error state ──

  it("renders QueryError when the queues query fails", () => {
    mockQueuesError = new Error("NETWORK_ERROR");
    mockQueuesData = undefined;
    const { container } = render(QueuesSection);
    // QueryError is mocked with PassthroughShell which adds data-testid
    const errorShell = container.querySelector(
      '[data-testid="passthrough-shell"]',
    );
    expect(errorShell).toBeTruthy();
    // Should NOT render the empty-state or queue-list branches
    expect(screen.queryByText("No queues yet")).toBeNull();
  });

  // ── Empty state ──

  it("shows empty message when no queues exist", () => {
    mockQueuesData = [];
    render(QueuesSection);
    expect(screen.getByText("No queues yet")).toBeTruthy();
  });

  // ── Queue list rendering ──

  it("renders one queue card for a single queue", () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    const { container } = render(QueuesSection);
    expect(container.querySelectorAll(".queue-card").length).toBe(1);
  });

  it("renders multiple queue cards", () => {
    mockQueuesData = [makeQueue("q-1", 0), makeQueue("q-2", 1)];
    const { container } = render(QueuesSection);
    expect(container.querySelectorAll(".queue-card").length).toBe(2);
  });

  it("displays stat text for open, closed, and hold counts", () => {
    mockQueuesData = [
      makeQueue("q-1", 0, {
        openCount: "5",
        closedCount: "10",
        holdCount: "2",
      }),
    ];
    render(QueuesSection);
    expect(screen.getByText(/5 open/)).toBeTruthy();
    expect(screen.getByText(/10 closed/)).toBeTruthy();
    expect(screen.getByText(/2 hold/)).toBeTruthy();
  });

  it("shows No members text for queues with zero member count", () => {
    mockQueuesData = [makeQueue("q-1", 0, { memberCount: "0" })];
    render(QueuesSection);
    expect(screen.getAllByText("No members").length).toBeGreaterThanOrEqual(1);
  });

  it("shows member count text when memberCount is positive", () => {
    mockQueuesData = [makeQueue("q-1", 0, { memberCount: "4" })];
    render(QueuesSection);
    expect(screen.getByText("4 members")).toBeTruthy();
  });

  // ── Decrypt fallback ──

  it("falls back to truncated id when orgCache.decrypt returns null", () => {
    mockDecrypt.mockReturnValue(null);
    mockQueuesData = [makeQueue("q-abcdefgh-1234", 0)];
    render(QueuesSection);
    // decryptQueueName falls back to queue.id.slice(0, 8) = "q-abcdef"
    const header = screen.getByRole("button", { name: "q-abcdef" });
    expect(header).toBeTruthy();
  });

  // ── Expand / collapse ──

  it("queue headers start expanded via the $effect", () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    const { container } = render(QueuesSection);
    const header = container.querySelector(".queue-header");
    expect(header?.getAttribute("aria-expanded")).toBe("true");
  });

  it("collapses expanded queue on header click", async () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    const { container } = render(QueuesSection);
    const header = container.querySelector(".queue-header") as HTMLElement;
    expect(header.getAttribute("aria-expanded")).toBe("true");

    await fireEvent.click(header);
    await tick();
    expect(header.getAttribute("aria-expanded")).toBe("false");
  });

  it("re-expands collapsed queue on second header click", async () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    const { container } = render(QueuesSection);
    const header = container.querySelector(".queue-header") as HTMLElement;

    await fireEvent.click(header);
    await tick();
    expect(header.getAttribute("aria-expanded")).toBe("false");

    await fireEvent.click(header);
    await tick();
    expect(header.getAttribute("aria-expanded")).toBe("true");
  });

  it("toggles expansion via keyboard Enter key", async () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    const { container } = render(QueuesSection);
    const header = container.querySelector(".queue-header") as HTMLElement;
    expect(header.getAttribute("aria-expanded")).toBe("true");

    await fireEvent.keyDown(header, { key: "Enter" });
    await tick();
    expect(header.getAttribute("aria-expanded")).toBe("false");
  });

  it("hides member section when queue is collapsed", async () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    mockMembersByQueue = { "q-1": ["u-1"] };
    const { container } = render(QueuesSection);

    const header = container.querySelector(".queue-header") as HTMLElement;
    await fireEvent.click(header);
    await tick();

    expect(container.querySelectorAll(".member-section").length).toBe(0);
  });

  // ── Member rendering ──

  it("shows member chips when members are loaded", () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    mockMembersByQueue = { "q-1": ["user-a", "user-b"] };
    const { container } = render(QueuesSection);
    expect(container.querySelectorAll(".member-chip").length).toBe(2);
  });

  it("shows loading indicator when members are still loading", () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    mockMembersLoading = true;
    const { container } = render(QueuesSection);
    expect(container.querySelector(".member-loading")).toBeTruthy();
  });

  it("shows empty members text when loaded members array is empty", () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    mockMembersByQueue = { "q-1": [] };
    render(QueuesSection);
    const noMembersEls = screen.getAllByText("No members");
    // One from .queue-meta (member count 0 branch) and one from
    // .no-members in the member section
    expect(noMembersEls.length).toBeGreaterThanOrEqual(1);
  });

  it("renders Add member button in expanded member section", () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    mockMembersByQueue = { "q-1": [] };
    render(QueuesSection);
    expect(screen.getByText("Add member")).toBeTruthy();
  });

  // ── Remove member ──

  it("calls removeMember mutation when chip remove button is clicked", async () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    mockMembersByQueue = { "q-1": ["user-a"] };
    render(QueuesSection);
    await tick();

    const removeBtn = screen.getByLabelText(/Remove/);
    await fireEvent.click(removeBtn);

    expect(mockRemoveMember).toHaveBeenCalledWith({
      queueId: "q-1",
      userId: "user-a",
    });
  });

  it("shows toast after successful member removal", async () => {
    mockRemoveMember.mockResolvedValue({});
    mockQueuesData = [makeQueue("q-1", 0)];
    mockMembersByQueue = { "q-1": ["user-a"] };
    render(QueuesSection);
    await tick();

    const removeBtn = screen.getByLabelText(/Remove/);
    await fireEvent.click(removeBtn);
    await tick();

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Member removed");
    });
  });

  it("shows error toast when member removal fails", async () => {
    mockRemoveMember.mockRejectedValue(new Error("fail"));
    mockQueuesData = [makeQueue("q-1", 0)];
    mockMembersByQueue = { "q-1": ["user-a"] };
    render(QueuesSection);
    await tick();

    const removeBtn = screen.getByLabelText(/Remove/);
    await fireEvent.click(removeBtn);
    await tick();

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Something went wrong");
    });
  });

  // ── Reorder mode ──

  it("move up button is disabled on the first queue in reorder mode", async () => {
    mockQueuesData = [makeQueue("q-1", 0), makeQueue("q-2", 1)];
    const { component } = render(QueuesSection);
    component.toggleReorderMode();
    await tick();
    const moveUpBtns = screen.getAllByLabelText("Move up");
    expect((moveUpBtns[0] as HTMLButtonElement).disabled).toBe(true);
  });

  it("move down button is disabled on the last queue in reorder mode", async () => {
    mockQueuesData = [makeQueue("q-1", 0), makeQueue("q-2", 1)];
    const { component } = render(QueuesSection);
    component.toggleReorderMode();
    await tick();
    const moveDownBtns = screen.getAllByLabelText("Move down");
    expect(
      (moveDownBtns[moveDownBtns.length - 1] as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("move up calls reorder mutation in reorder mode", async () => {
    mockQueuesData = [makeQueue("q-1", 0), makeQueue("q-2", 1)];
    const { component } = render(QueuesSection);
    component.toggleReorderMode();
    await tick();

    const moveUpBtns = screen.getAllByLabelText("Move up");
    await fireEvent.click(moveUpBtns[1]!);

    expect(mockReorderQueues).toHaveBeenCalledTimes(1);
  });

  it("move down calls reorder mutation in reorder mode", async () => {
    mockQueuesData = [makeQueue("q-1", 0), makeQueue("q-2", 1)];
    const { component } = render(QueuesSection);
    component.toggleReorderMode();
    await tick();

    const moveDownBtns = screen.getAllByLabelText("Move down");
    await fireEvent.click(moveDownBtns[0]!);

    expect(mockReorderQueues).toHaveBeenCalledTimes(1);
  });

  it("shows toast after successful reorder", async () => {
    mockReorderQueues.mockResolvedValue({});
    mockQueuesData = [makeQueue("q-1", 0), makeQueue("q-2", 1)];
    const { component } = render(QueuesSection);
    component.toggleReorderMode();
    await tick();

    const moveDownBtns = screen.getAllByLabelText("Move down");
    await fireEvent.click(moveDownBtns[0]!);
    await tick();

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Queues reordered");
    });
  });

  it("shows error toast when reorder fails", async () => {
    mockReorderQueues.mockRejectedValue(new Error("fail"));
    mockQueuesData = [makeQueue("q-1", 0), makeQueue("q-2", 1)];
    const { component } = render(QueuesSection);
    component.toggleReorderMode();
    await tick();

    const moveDownBtns = screen.getAllByLabelText("Move down");
    await fireEvent.click(moveDownBtns[0]!);
    await tick();

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Something went wrong");
    });
  });

  it("does not move first queue up (out-of-bounds guard)", async () => {
    mockQueuesData = [makeQueue("q-1", 0), makeQueue("q-2", 1)];
    const { component } = render(QueuesSection);
    component.toggleReorderMode();
    await tick();

    // First move-up button is disabled, clicking it should not mutate
    const moveUpBtns = screen.getAllByLabelText("Move up");
    await fireEvent.click(moveUpBtns[0]!);
    expect(mockReorderQueues).not.toHaveBeenCalled();
  });

  it("does not move last queue down (out-of-bounds guard)", async () => {
    mockQueuesData = [makeQueue("q-1", 0), makeQueue("q-2", 1)];
    const { component } = render(QueuesSection);
    component.toggleReorderMode();
    await tick();

    const moveDownBtns = screen.getAllByLabelText("Move down");
    await fireEvent.click(moveDownBtns[moveDownBtns.length - 1]!);
    expect(mockReorderQueues).not.toHaveBeenCalled();
  });

  it("hides reorder arrows when not in reorder mode", () => {
    mockQueuesData = [makeQueue("q-1", 0), makeQueue("q-2", 1)];
    render(QueuesSection);
    expect(screen.queryAllByLabelText("Move up")).toHaveLength(0);
    expect(screen.queryAllByLabelText("Move down")).toHaveLength(0);
  });

  it("toggleReorderMode is a no-op when sort field is not 'order'", async () => {
    mockQueuesData = [makeQueue("q-1", 0), makeQueue("q-2", 1)];

    const { queueFilterStore } =
      await import("$lib/stores/queue-filters.svelte.js");
    queueFilterStore.setSort("name", "asc");

    const { component } = render(QueuesSection);
    await tick();
    component.toggleReorderMode();
    await tick();

    // Arrows should not appear; toggleReorderMode returned early
    expect(screen.queryAllByLabelText("Move up")).toHaveLength(0);
    expect(screen.queryAllByLabelText("Move down")).toHaveLength(0);

    // Reset for other tests
    queueFilterStore.setSort("order", "asc");
  });

  it("exits reorder mode when sort field changes away from 'order'", async () => {
    mockQueuesData = [makeQueue("q-1", 0), makeQueue("q-2", 1)];
    const { component } = render(QueuesSection);

    // Enter reorder mode
    component.toggleReorderMode();
    await tick();
    expect(screen.queryAllByLabelText("Move up").length).toBeGreaterThan(0);

    // Change sort field
    const { queueFilterStore } =
      await import("$lib/stores/queue-filters.svelte.js");
    queueFilterStore.setSort("name", "asc");
    await tick();

    // The $effect should reset reorderMode to false
    expect(screen.queryAllByLabelText("Move up")).toHaveLength(0);

    queueFilterStore.setSort("order", "asc");
  });

  // ── Editor ──

  it("opens editor when edit button is clicked", async () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    const { component } = render(QueuesSection);

    const editBtn = screen.getByLabelText("Edit");
    await fireEvent.click(editBtn);
    await tick();

    expect(component.getEditorQueueId()).toBe("q-1");
  });

  it("opens editor with 'new' when autoAction is 'create'", async () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    const { component } = render(QueuesSection, {
      props: { autoAction: "create" },
    });
    await tick();

    expect(component.getEditorQueueId()).toBe("new");
  });

  it("closes editor on dismiss", async () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    const { component } = render(QueuesSection);

    component.openEditor("q-1");
    await tick();
    expect(component.getEditorQueueId()).toBe("q-1");

    component.openEditor(null);
    await tick();
    expect(component.getEditorQueueId()).toBeNull();
  });

  it("editorQueue resolves to null for a 'new' editor", async () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    const { container, component } = render(QueuesSection);
    component.openEditor("new");
    await tick();

    // StubQueueEditor should render with queueId null (editorQueue is null for "new")
    const editorEl = container.querySelector(
      '[data-testid="stub-queue-editor"]',
    );
    expect(editorEl).toBeTruthy();
    // queueId prop is editorQueue?.id ?? null, which is null for "new"
    expect(editorEl?.getAttribute("data-queue-id")).toBeNull();
  });

  it("editorQueue resolves to null for a nonexistent queue id", async () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    const { container, component } = render(QueuesSection);
    component.openEditor("nonexistent");
    await tick();

    const editorEl = container.querySelector(
      '[data-testid="stub-queue-editor"]',
    );
    expect(editorEl).toBeTruthy();
    expect(editorEl?.getAttribute("data-queue-id")).toBeNull();
  });

  // ── Exported stat functions ──

  it("totalQueues returns the queue count", () => {
    mockQueuesData = [makeQueue("q-1", 0), makeQueue("q-2", 1)];
    const { component } = render(QueuesSection);
    expect(component.totalQueues()).toBe(2);
  });

  it("totalQueues returns 0 when data is undefined", () => {
    mockQueuesData = undefined;
    const { component } = render(QueuesSection);
    expect(component.totalQueues()).toBe(0);
  });

  it("totalOpenTickets sums open counts across all queues", () => {
    mockQueuesData = [
      makeQueue("q-1", 0, { openCount: "5" }),
      makeQueue("q-2", 1, { openCount: "3" }),
    ];
    const { component } = render(QueuesSection);
    expect(component.totalOpenTickets()).toBe(8);
  });

  it("totalMembers sums member counts across all queues", () => {
    mockQueuesData = [
      makeQueue("q-1", 0, { memberCount: "4" }),
      makeQueue("q-2", 1, { memberCount: "6" }),
    ];
    const { component } = render(QueuesSection);
    expect(component.totalMembers()).toBe(10);
  });

  // ── Container ──

  it("renders queues-page container", () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    const { container } = render(QueuesSection);
    expect(container.querySelector(".queues-page")).toBeTruthy();
  });
});

describe("QueuesSection delete flow", () => {
  beforeEach(() => {
    mockQueuesData = [makeQueue("q-1", 0), makeQueue("q-2", 1)];
    mockQueuesLoading = false;
    mockQueuesError = null;
    mockMembersByQueue = {};
    mockMembersLoading = false;
    mockUsersData = [];
    mockIntakeQueueData = { queueId: null };
    mockDecrypt.mockReturnValue("Decrypted Queue");
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("opens delete dialog when editor delete trigger is clicked", async () => {
    const { component, container } = render(QueuesSection);
    await tick();

    // Open editor for q-1 (which has a real queue in data)
    component.openEditor("q-1");
    await tick();

    // StubQueueEditor renders a trigger button when ondeletequeue is provided
    const deleteTrigger = container.querySelector(
      '[data-testid="editor-delete-trigger"]',
    );
    expect(deleteTrigger).toBeTruthy();

    await fireEvent.click(deleteTrigger as HTMLElement);
    await tick();

    // StubShellDialog renders when opened=true
    const dialog = container.querySelector('[data-testid="stub-dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute("data-title")).toBe("Delete Decrypted Queue?");
  });

  it("closes delete dialog when Cancel is clicked", async () => {
    const { component, container } = render(QueuesSection);
    await tick();

    component.openEditor("q-1");
    await tick();

    const deleteTrigger = container.querySelector(
      '[data-testid="editor-delete-trigger"]',
    ) as HTMLElement;
    await fireEvent.click(deleteTrigger);
    await tick();

    // Find the Cancel button inside the dialog
    const cancelBtn = screen.getByText("Cancel");
    await fireEvent.click(cancelBtn);
    await tick();

    // Dialog should be closed
    const dialog = container.querySelector('[data-testid="stub-dialog"]');
    expect(dialog).toBeNull();
  });

  it("calls delete mutation on confirm and shows toast on success", async () => {
    mockDeleteQueue.mockResolvedValue({});
    const { component, container } = render(QueuesSection);
    await tick();

    component.openEditor("q-1");
    await tick();

    const deleteTrigger = container.querySelector(
      '[data-testid="editor-delete-trigger"]',
    ) as HTMLElement;
    await fireEvent.click(deleteTrigger);
    await tick();

    // Click the Delete button (second DialogButton in the buttons snippet)
    // Scope to the dialog: the reassign sheet's always-rendered confirm
    // button also carries the text "Delete".
    const dialogEl = container.querySelector(
      '[data-testid="stub-dialog"]',
    ) as HTMLElement;
    const deleteBtn = within(dialogEl).getByText("Delete");
    await fireEvent.click(deleteBtn);
    await tick();

    expect(mockDeleteQueue).toHaveBeenCalledWith({ queueId: "q-1" });

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Queue deleted");
    });
  });

  it("opens reassign sheet when delete fails with QUEUE_HAS_TICKETS", async () => {
    mockDeleteQueue.mockRejectedValue(new Error(ErrorCode.QUEUE_HAS_TICKETS));
    const { component, container } = render(QueuesSection);
    await tick();

    component.openEditor("q-1");
    await tick();

    const deleteTrigger = container.querySelector(
      '[data-testid="editor-delete-trigger"]',
    ) as HTMLElement;
    await fireEvent.click(deleteTrigger);
    await tick();

    // Scope to the dialog: the reassign sheet's always-rendered confirm
    // button also carries the text "Delete".
    const dialogEl = container.querySelector(
      '[data-testid="stub-dialog"]',
    ) as HTMLElement;
    const deleteBtn = within(dialogEl).getByText("Delete");
    await fireEvent.click(deleteBtn);
    await tick();

    // Wait for the async error handler to fire. The sheet's content is
    // always in the DOM through the passthrough stub, so assert the
    // opened flag rather than text presence.
    await waitFor(() => {
      const reassignSheet = container
        .querySelector(".reassign-sheet-content")
        ?.closest('[data-testid="passthrough-shell"]');
      expect(reassignSheet?.getAttribute("data-opened")).toBe("true");
    });
  });

  it("shows error toast when delete fails with a non-ticket error", async () => {
    mockDeleteQueue.mockRejectedValue(new Error("SOME_OTHER_ERROR"));
    const { component, container } = render(QueuesSection);
    await tick();

    component.openEditor("q-1");
    await tick();

    const deleteTrigger = container.querySelector(
      '[data-testid="editor-delete-trigger"]',
    ) as HTMLElement;
    await fireEvent.click(deleteTrigger);
    await tick();

    // Scope to the dialog: the reassign sheet's always-rendered confirm
    // button also carries the text "Delete".
    const dialogEl = container.querySelector(
      '[data-testid="stub-dialog"]',
    ) as HTMLElement;
    const deleteBtn = within(dialogEl).getByText("Delete");
    await fireEvent.click(deleteBtn);
    await tick();

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Something went wrong");
    });
  });

  it("shows error toast when delete fails with a non-Error value", async () => {
    mockDeleteQueue.mockRejectedValue("string-error");
    const { component, container } = render(QueuesSection);
    await tick();

    component.openEditor("q-1");
    await tick();

    const deleteTrigger = container.querySelector(
      '[data-testid="editor-delete-trigger"]',
    ) as HTMLElement;
    await fireEvent.click(deleteTrigger);
    await tick();

    // Scope to the dialog: the reassign sheet's always-rendered confirm
    // button also carries the text "Delete".
    const dialogEl = container.querySelector(
      '[data-testid="stub-dialog"]',
    ) as HTMLElement;
    const deleteBtn = within(dialogEl).getByText("Delete");
    await fireEvent.click(deleteBtn);
    await tick();

    await waitFor(() => {
      // Non-Error value fails the instanceof check, falls to else branch
      expect(mockToastShow).toHaveBeenCalledWith("Something went wrong");
    });
  });

  it("does not pass ondeletequeue when only one queue exists", async () => {
    mockQueuesData = [makeQueue("q-only", 0)];
    const { component, container } = render(QueuesSection);
    await tick();

    component.openEditor("q-only");
    await tick();

    // canDelete is false (totalCount <= 1), so ondeletequeue is undefined
    // StubQueueEditor should not render the delete trigger
    const deleteTrigger = container.querySelector(
      '[data-testid="editor-delete-trigger"]',
    );
    expect(deleteTrigger).toBeNull();
  });

  it("reassign confirm is disabled when no target is selected", async () => {
    mockDeleteQueue.mockRejectedValue(new Error(ErrorCode.QUEUE_HAS_TICKETS));
    const { component, container } = render(QueuesSection);
    await tick();

    component.openEditor("q-1");
    await tick();

    const deleteTrigger = container.querySelector(
      '[data-testid="editor-delete-trigger"]',
    ) as HTMLElement;
    await fireEvent.click(deleteTrigger);
    await tick();

    // Scope to the dialog: the reassign sheet's always-rendered confirm
    // button also carries the text "Delete".
    const dialogEl = container.querySelector(
      '[data-testid="stub-dialog"]',
    ) as HTMLElement;
    const deleteBtn = within(dialogEl).getByText("Delete");
    await fireEvent.click(deleteBtn);
    await tick();

    await waitFor(() => {
      const reassignSheet = container
        .querySelector(".reassign-sheet-content")
        ?.closest('[data-testid="passthrough-shell"]');
      expect(reassignSheet?.getAttribute("data-opened")).toBe("true");
    });

    // The reassign confirm button should be disabled (no target selected)
    const reassignConfirmBtn = container.querySelector(
      ".reassign-confirm",
    ) as HTMLButtonElement;
    expect(reassignConfirmBtn).toBeTruthy();
    expect(reassignConfirmBtn.disabled).toBe(true);
  });

  it("handleEditorDeleteQueue is a no-op for an unknown queue id", async () => {
    const { component, container } = render(QueuesSection);
    await tick();

    // Open editor for a queue not in data; the queue.find returns undefined
    // so openDeleteDialog is never called
    component.openEditor("nonexistent");
    await tick();

    // StubQueueEditor should not render the delete trigger (queueId is null
    // because editorQueue resolves to null for a nonexistent id)
    const deleteTrigger = container.querySelector(
      '[data-testid="editor-delete-trigger"]',
    );
    expect(deleteTrigger).toBeNull();
  });
});

describe("QueuesSection intake queue", () => {
  beforeEach(() => {
    mockQueuesData = [makeQueue("q-1", 0), makeQueue("q-2", 1)];
    mockQueuesLoading = false;
    mockQueuesError = null;
    mockMembersByQueue = {};
    mockMembersLoading = false;
    mockUsersData = [];
    mockIntakeQueueData = { queueId: null };
    mockDecrypt.mockReturnValue("Decrypted Queue");
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  // ── Intake chip display ──

  it("shows Intake chip on the designated intake queue", () => {
    mockIntakeQueueData = { queueId: "q-1" };
    const { container } = render(QueuesSection);
    const chips = container.querySelectorAll('[data-testid="intake-chip"]');
    expect(chips.length).toBe(1);
  });

  it("does not show Intake chip when no intake queue is designated", () => {
    mockIntakeQueueData = { queueId: null };
    const { container } = render(QueuesSection);
    const chips = container.querySelectorAll('[data-testid="intake-chip"]');
    expect(chips.length).toBe(0);
  });

  it("shows Intake chip only on the matching queue, not on others", () => {
    mockIntakeQueueData = { queueId: "q-2" };
    const { container } = render(QueuesSection);
    const cards = container.querySelectorAll(".queue-card");
    // First card (q-1) should not have the chip
    expect(cards[0]?.querySelector('[data-testid="intake-chip"]')).toBeNull();
    // Second card (q-2) should have the chip
    expect(cards[1]?.querySelector('[data-testid="intake-chip"]')).toBeTruthy();
  });

  // ── Set intake queue action ──

  it("renders 'Use as intake queue' button on non-intake queues", () => {
    mockIntakeQueueData = { queueId: "q-1" };
    render(QueuesSection);
    // q-2 is not the intake queue, so it should have "Use as intake queue"
    const setBtn = screen.getByLabelText("Use as intake queue");
    expect(setBtn).toBeTruthy();
  });

  it("calls setIntakeQueue mutation when set button is clicked", async () => {
    mockIntakeQueueData = { queueId: null };
    render(QueuesSection);
    await tick();

    // Both queues should have "Use as intake queue" buttons
    const setBtns = screen.getAllByLabelText("Use as intake queue");
    await fireEvent.click(setBtns[0]!);

    expect(mockSetIntakeQueue).toHaveBeenCalledWith({ queueId: "q-1" });
  });

  it("shows success toast after setting intake queue", async () => {
    mockSetIntakeQueue.mockResolvedValue({ success: true });
    mockIntakeQueueData = { queueId: null };
    render(QueuesSection);
    await tick();

    const setBtns = screen.getAllByLabelText("Use as intake queue");
    await fireEvent.click(setBtns[0]!);
    await tick();

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Intake queue updated");
    });
  });

  it("shows error toast when setting intake queue fails", async () => {
    mockSetIntakeQueue.mockRejectedValue(new Error("fail"));
    mockIntakeQueueData = { queueId: null };
    render(QueuesSection);
    await tick();

    const setBtns = screen.getAllByLabelText("Use as intake queue");
    await fireEvent.click(setBtns[0]!);
    await tick();

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        "Could not update intake queue",
      );
    });
  });

  // ── Clear intake queue action ──

  it("renders 'Remove intake designation' button on the intake queue", () => {
    mockIntakeQueueData = { queueId: "q-1" };
    render(QueuesSection);
    const clearBtn = screen.getByLabelText("Remove intake designation");
    expect(clearBtn).toBeTruthy();
  });

  it("calls setIntakeQueue with null when clear button is clicked", async () => {
    mockIntakeQueueData = { queueId: "q-1" };
    render(QueuesSection);
    await tick();

    const clearBtn = screen.getByLabelText("Remove intake designation");
    await fireEvent.click(clearBtn);

    expect(mockSetIntakeQueue).toHaveBeenCalledWith({ queueId: null });
  });

  it("shows success toast after clearing intake queue", async () => {
    mockSetIntakeQueue.mockResolvedValue({ success: true });
    mockIntakeQueueData = { queueId: "q-1" };
    render(QueuesSection);
    await tick();

    const clearBtn = screen.getByLabelText("Remove intake designation");
    await fireEvent.click(clearBtn);
    await tick();

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        "Intake queue designation removed",
      );
    });
  });

  it("shows error toast when clearing intake queue fails", async () => {
    mockSetIntakeQueue.mockRejectedValue(new Error("fail"));
    mockIntakeQueueData = { queueId: "q-1" };
    render(QueuesSection);
    await tick();

    const clearBtn = screen.getByLabelText("Remove intake designation");
    await fireEvent.click(clearBtn);
    await tick();

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        "Could not remove intake queue designation",
      );
    });
  });

  it("announces to live region after successful set", async () => {
    mockSetIntakeQueue.mockResolvedValue({ success: true });
    mockIntakeQueueData = { queueId: null };
    render(QueuesSection);
    await tick();

    const setBtns = screen.getAllByLabelText("Use as intake queue");
    await fireEvent.click(setBtns[0]!);
    await tick();

    await waitFor(() => {
      expect(mockAnnounce).toHaveBeenCalledWith(
        "polite",
        "Intake queue updated",
      );
    });
  });
});
