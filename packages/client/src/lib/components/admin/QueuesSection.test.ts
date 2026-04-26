// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";

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

const { mockReorderQueues, mockDeleteQueue, mockRemoveMember, mockToastShow } =
  vi.hoisted(() => ({
    mockReorderQueues: vi.fn().mockResolvedValue({}),
    mockDeleteQueue: vi.fn().mockResolvedValue({}),
    mockRemoveMember: vi.fn().mockResolvedValue({}),
    mockToastShow: vi.fn(),
  }));

interface QueueData {
  id: string;
  encryptedName: string;
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

vi.mock("$lib/paraglide/messages.js", () => ({
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
  common_cancel: () => "Cancel",
  common_loading: () => "Loading",
  error_generic: () => "Something went wrong",
  decrypt_loading: () => "Loading...",
  decrypt_error: () => "Error",
  decrypt_denied: () => "Denied",
}));

vi.mock("$lib/trpc/index.js", () => ({
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
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  createQuery: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const key = (opts.queryKey as string[])[0];
    if (key === "queues") {
      return {
        get isLoading() {
          return mockQueuesLoading;
        },
        get isError() {
          return false;
        },
        error: null,
        get data() {
          return mockQueuesData;
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
  createQueries: () => [],
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as
      | ((data: unknown, vars: unknown) => void)
      | undefined;
    const onError = opts.onError as ((err: unknown) => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      mutate(input: unknown, overrides?: { onError?: (e: unknown) => void }) {
        mutationFn(input).then(
          (data) => onSuccess?.(data, input),
          (err: unknown) => {
            if (overrides?.onError) overrides.onError(err);
            else onError?.(err);
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

vi.mock("$lib/crypto/context.js", () => ({
  getOrgDecryptCache: () => ({
    decrypt: () => "Decrypted Queue",
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
  }),
}));

vi.mock("$lib/utils/buffer-encoding.js", () => ({
  base64ToUint8Array: (s: string) => new Uint8Array(Buffer.from(s, "base64")),
  uint8ArrayToBase64: () => "AQID",
}));

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));

vi.mock("$lib/utils/haptic.js", () => ({ haptic: vi.fn() }));
vi.mock("$lib/utils/announce.js", () => ({ announceToLiveRegion: vi.fn() }));
vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
}));
vi.mock("$lib/utils/a11y.js", () => ({
  onKeyActivate: (fn: () => void) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") fn();
  },
}));

vi.mock("$lib/components/QueryError.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/DecryptPlaceholder.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/shell/ShellDialog.svelte", async () => ({
  default: (await import("./test-helpers/StubShellDialog.svelte")).default,
}));

vi.mock("$lib/shell/ShellSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/shell/ShellActionSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("./QueueMemberPicker.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("./QueueEditor.svelte", async () => ({
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

function makeQueue(id: string, sortOrder: number): QueueData {
  return {
    id,
    encryptedName: btoa("encrypted"),
    sortOrder,
    escalateDays: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    openCount: "3",
    closedCount: "1",
    holdCount: "0",
    memberCount: "2",
  };
}

import QueuesSection from "./QueuesSection.svelte";

describe("QueuesSection", () => {
  beforeEach(() => {
    mockQueuesData = undefined;
    mockQueuesLoading = false;
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("shows loading skeletons when query is loading", () => {
    mockQueuesLoading = true;
    const { container } = render(QueuesSection);
    const cards = container.querySelectorAll(".queue-card");
    expect(cards.length).toBe(3);
  });

  it("shows empty message when no queues exist", () => {
    mockQueuesData = [];
    render(QueuesSection);
    expect(screen.getByText("No queues yet")).toBeTruthy();
  });

  it("renders queue cards when data is present", () => {
    mockQueuesData = [makeQueue("q-1", 0), makeQueue("q-2", 1)];
    const { container } = render(QueuesSection);
    const cards = container.querySelectorAll(".queue-card");
    expect(cards.length).toBe(2);
  });

  it("shows No members text for queues without members", () => {
    mockQueuesData = [{ ...makeQueue("q-1", 0), memberCount: "0" }];
    render(QueuesSection);
    expect(screen.getAllByText("No members").length).toBeGreaterThanOrEqual(1);
  });

  it("queue headers have aria-expanded attribute", () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    const { container } = render(QueuesSection);
    const header = container.querySelector(".queue-header");
    expect(header?.getAttribute("aria-expanded")).toBeTruthy();
  });

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

  it("hides reorder arrows when not in reorder mode", () => {
    mockQueuesData = [makeQueue("q-1", 0), makeQueue("q-2", 1)];
    render(QueuesSection);
    expect(screen.queryAllByLabelText("Move up")).toHaveLength(0);
    expect(screen.queryAllByLabelText("Move down")).toHaveLength(0);
  });

  it("renders queues-page container", () => {
    mockQueuesData = [makeQueue("q-1", 0)];
    const { container } = render(QueuesSection);
    expect(container.querySelector(".queues-page")).toBeTruthy();
  });
});
