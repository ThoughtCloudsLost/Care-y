// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const { mockCreateQueue, mockUpdateQueue, mockToastShow, mockOrgCacheDelete } =
  vi.hoisted(() => ({
    mockCreateQueue: vi.fn().mockResolvedValue({}),
    mockUpdateQueue: vi.fn().mockResolvedValue({}),
    mockToastShow: vi.fn(),
    mockOrgCacheDelete: vi.fn(),
  }));

let mockOrgKeyLoaded = true;

vi.mock("$lib/paraglide/messages.js", () => ({
  register_note: () => "Note",
  register_careful: () => "Careful",
  register_warning: () => "Warning",
  register_protected: () => "Protected",
  admin_queue_editor_create_title: () => "Create Queue",
  admin_queue_editor_edit_title: () => "Edit Queue",
  admin_queue_editor_name_label: () => "Queue name",
  admin_queue_editor_name_placeholder: () => "e.g. Intake",
  admin_queue_editor_name_required: () => "Name is required",
  admin_queue_editor_escalation_label: () => "Escalation (days)",
  admin_queue_editor_escalation_hint: () => "0 = no auto-escalation",
  admin_queue_editor_escalation_range: ({ min }: { min: string }) =>
    `Escalation days must be between ${min} and 365.`,
  admin_queue_editor_no_org_key: () => "Organization key not loaded.",
  admin_queue_editor_pii_warning: () => "Queue names are encrypted.",
  admin_queue_editor_color_label: () => "Color",
  admin_queue_editor_icon_label: () => "Icon",
  admin_queue_editor_save_create: () => "Save queue",
  admin_queue_editor_save_edit: () => "Save changes",
  admin_queue_editor_delete: () => "Delete Queue",
  admin_queue_created: () => "Queue created",
  admin_queue_updated: () => "Queue updated",
  common_loading: () => "Loading",
  error_generic: () => "Something went wrong",
  onboarding_queue_submit: () => "Create Queue",
}));

vi.mock("$lib/terminology/with-terms.js", () => ({
  withTerms: () => ({}),
}));

vi.mock("$lib/crypto/context.js", () => ({
  getOrgKeyManager: () => ({
    get isLoaded() {
      return mockOrgKeyLoaded;
    },
    encrypt: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
    encryptText: vi.fn().mockResolvedValue("encrypted-text"),
  }),
  getOrgDecryptCache: () => ({
    decrypt: () => "Decrypted Name",
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
    delete: mockOrgCacheDelete,
  }),
}));

vi.mock("$lib/crypto/org-key-ready.svelte.js", () => ({
  isOrgKeyReady: () => mockOrgKeyLoaded,
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      createQueue: { mutate: mockCreateQueue },
      updateQueue: { mutate: mockUpdateQueue },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as (() => void) | undefined;
    const onError = opts.onError as (() => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      mutate(input: unknown) {
        mutationFn(input).then(
          () => onSuccess?.(),
          () => onError?.(),
        );
      },
    };
  },
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
    getQueriesData: vi.fn().mockReturnValue([]),
  }),
}));

vi.mock("@care-y/shared", () => ({
  MAX_ESCALATION_DAYS: 365,
}));

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));

vi.mock("$lib/utils/haptic.js", () => ({ haptic: vi.fn() }));

vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));

vi.mock("$lib/utils/buffer-encoding.js", () => ({
  uint8ArrayToBase64: () => "AQID",
  base64ToUint8Array: (s: string) =>
    new Uint8Array([...s].map((c) => c.charCodeAt(0))),
}));

vi.mock("$lib/shell/ShellSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/shell/context.js", () => ({
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

vi.mock("$lib/query/keys.js", () => ({
  queueKeys: { all: ["queues"] },
}));

vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
}));

import QueueEditor from "./QueueEditor.svelte";

function renderEditor(
  overrides: Partial<{
    queueId: string | null;
    queueEncryptedName: string | null;
    queueEncryptedColor: string | null;
    queueEncryptedIcon: string | null;
    queueEscalateDays: number;
    ondeletequeue: ((id: string) => void) | undefined;
  }> = {},
) {
  return render(QueueEditor, {
    props: {
      opened: true,
      ondismiss: vi.fn(),
      queueId: overrides.queueId ?? null,
      queueEncryptedName: overrides.queueEncryptedName ?? null,
      queueEncryptedColor: overrides.queueEncryptedColor ?? null,
      queueEncryptedIcon: overrides.queueEncryptedIcon ?? null,
      queueEscalateDays: overrides.queueEscalateDays ?? 0,
      ondeletequeue: overrides.ondeletequeue,
    },
  });
}

describe("QueueEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrgKeyLoaded = true;
  });

  afterEach(cleanup);

  it("shows Create Queue title when queueId is null", () => {
    renderEditor();
    expect(screen.getByText("Create Queue")).toBeTruthy();
  });

  it("shows Edit Queue title when queueId is provided", () => {
    renderEditor({
      queueId: "q-1",
      queueEncryptedName: "AQI=",
    });
    expect(screen.getByText("Edit Queue")).toBeTruthy();
  });

  it("shows org key warning when key is not loaded", () => {
    mockOrgKeyLoaded = false;
    renderEditor();
    expect(screen.getByText("Organization key not loaded.")).toBeTruthy();
  });

  it("shows PII warning", () => {
    renderEditor();
    expect(screen.getByText("Queue names are encrypted.")).toBeTruthy();
  });

  it("calls createQueue.mutate on submit in create mode", async () => {
    renderEditor();

    const inputs = document.querySelectorAll<HTMLInputElement>(
      ".k-list-input input",
    );
    const nameInput = inputs[0]!;
    await fireEvent.input(nameInput, { target: { value: "Intake" } });

    const form = document.querySelector<HTMLFormElement>(
      '[data-testid="queue-form"]',
    );
    expect(form).toBeTruthy();
    if (form) await fireEvent.submit(form);

    await vi.waitFor(() => {
      expect(mockCreateQueue).toHaveBeenCalledWith({
        encryptedName: "encrypted-text",
        encryptedColor: "encrypted-text",
        encryptedIcon: "encrypted-text",
        escalateDays: 7,
      });
    });
  });

  it("calls updateQueue.mutate on submit in edit mode", async () => {
    renderEditor({
      queueId: "q-1",
      queueEncryptedName: "AQI=",
      queueEscalateDays: 5,
    });

    const inputs = document.querySelectorAll<HTMLInputElement>(
      ".k-list-input input",
    );
    const nameInput = inputs[0]!;
    await fireEvent.input(nameInput, { target: { value: "Updated Queue" } });

    const form = document.getElementById("queue-editor-form");
    if (form instanceof HTMLFormElement) {
      await fireEvent.submit(form);
    }

    await vi.waitFor(() => {
      expect(mockUpdateQueue).toHaveBeenCalledWith(
        expect.objectContaining({
          queueId: "q-1",
          encryptedName: "encrypted-text",
        }),
      );
    });
  });

  it("evicts orgCache entry on successful update", async () => {
    renderEditor({
      queueId: "q-1",
      queueEncryptedName: "AQI=",
    });

    const inputs = document.querySelectorAll<HTMLInputElement>(
      ".k-list-input input",
    );
    const nameInput = inputs[0]!;
    await fireEvent.input(nameInput, { target: { value: "Renamed Queue" } });

    const form = document.getElementById("queue-editor-form");
    if (form instanceof HTMLFormElement) {
      await fireEvent.submit(form);
    }

    await vi.waitFor(() => {
      expect(mockOrgCacheDelete).toHaveBeenCalledWith("queue:q-1");
    });
  });

  it("does not evict orgCache on create (no existing entry)", async () => {
    renderEditor();

    const inputs = document.querySelectorAll<HTMLInputElement>(
      ".k-list-input input",
    );
    const nameInput = inputs[0]!;
    await fireEvent.input(nameInput, { target: { value: "New" } });

    const form = document.getElementById("queue-editor-form");
    if (form instanceof HTMLFormElement) {
      await fireEvent.submit(form);
    }

    await vi.waitFor(() => {
      expect(mockCreateQueue).toHaveBeenCalled();
    });
    expect(mockOrgCacheDelete).not.toHaveBeenCalled();
  });

  it("shows delete button in edit mode with ondeletequeue provided", () => {
    renderEditor({
      queueId: "q-1",
      queueEncryptedName: "AQI=",
      ondeletequeue: vi.fn(),
    });
    expect(screen.getByText("Delete Queue")).toBeTruthy();
  });

  it("hides delete button in create mode", () => {
    renderEditor();
    expect(screen.queryByText("Delete Queue")).toBeNull();
  });

  it("hides delete button in edit mode without ondeletequeue", () => {
    renderEditor({
      queueId: "q-1",
      queueEncryptedName: "AQI=",
      ondeletequeue: undefined,
    });
    expect(screen.queryByText("Delete Queue")).toBeNull();
  });

  it("calls ondeletequeue when delete button is clicked", async () => {
    const ondeletequeue = vi.fn();
    const ondismiss = vi.fn();
    render(QueueEditor, {
      props: {
        opened: true,
        ondismiss,
        queueId: "q-1",
        queueEncryptedName: "AQI=",
        queueEncryptedColor: null,
        queueEncryptedIcon: null,
        queueEscalateDays: 0,
        ondeletequeue,
      },
    });

    await fireEvent.click(screen.getByText("Delete Queue"));
    expect(ondeletequeue).toHaveBeenCalledWith("q-1");
  });
});
