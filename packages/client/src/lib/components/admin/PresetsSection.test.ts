// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

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

const {
  mockCreatePreset,
  mockUpdatePreset,
  mockDeletePreset,
  mockEncryptText,
  mockOrgCacheDelete,
} = vi.hoisted(() => ({
  mockCreatePreset: vi.fn().mockResolvedValue({
    id: "p-new",
    encryptedTitle: "enc-title",
    encryptedBody: "enc-body",
    queueId: null,
  }),
  mockUpdatePreset: vi.fn().mockResolvedValue({
    id: "p-1",
    encryptedTitle: "enc-title",
    encryptedBody: "enc-body",
    queueId: null,
  }),
  mockDeletePreset: vi.fn().mockResolvedValue({ success: true }),
  mockEncryptText: vi.fn().mockResolvedValue("encrypted-text"),
  mockOrgCacheDelete: vi.fn(),
}));

interface PresetRecord {
  id: string;
  encryptedTitle: string;
  encryptedBody: string;
  queueId: string | null;
}

let mockPresetsData: PresetRecord[] | undefined;
let mockPresetsLoading: boolean;
let mockQueuesData: { id: string; encryptedName: string }[] | undefined;

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesNS>()),
  admin_presets_empty: () => "No saved replies yet.",
  admin_presets_empty_hint: () => "Tap Add reply to create one.",
  admin_presets_add_button: () => "Add reply",
  admin_presets_add_title: () => "New Saved Reply",
  admin_presets_edit_title: () => "Edit Saved Reply",
  admin_presets_title_label: () => "Title",
  admin_presets_title_placeholder: () => "A short name for this reply",
  admin_presets_body_label: () => "Reply text",
  admin_presets_body_placeholder: () => "The message body...",
  admin_presets_queue_label: () => "Queue (optional)",
  admin_presets_queue_global: () => "All queues",
  admin_presets_save_create: () => "Save reply",
  admin_presets_save_edit: () => "Save changes",
  admin_presets_saved: () => "Saved reply updated.",
  admin_presets_created: () => "Saved reply created.",
  admin_presets_deleted: () => "Saved reply deleted.",
  admin_presets_delete: () => "Delete",
  admin_presets_delete_title: () => "Delete saved reply",
  admin_presets_delete_confirm: () =>
    "Are you sure you want to remove this saved reply?",
  admin_presets_description: () => "Saved replies appear in the compose bar.",
  common_loading: () => "Loading",
  common_cancel: () => "Cancel",
  error_generic: () => "Something went wrong",
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    tickets: {
      listPresets: { query: vi.fn() },
      listQueues: { query: vi.fn() },
      createPreset: { mutate: mockCreatePreset },
      updatePreset: { mutate: mockUpdatePreset },
      deletePreset: { mutate: mockDeletePreset },
    },
  },
}));

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContextNS2>()),
  getOrgKeyManager: () => ({
    encryptText: mockEncryptText,
    get isLoaded() {
      return true;
    },
  }),
  getOrgDecryptCache: () => ({
    decrypt: (_key: string, cipher: string | null) => {
      if (cipher === null) return null;
      return `decrypted:${cipher}`;
    },
    delete: mockOrgCacheDelete,
  }),
}));

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryNS>()),
  createQuery: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const key = opts.queryKey as readonly string[];
    const isQueues = key.includes("queues");
    return {
      get isLoading() {
        return isQueues ? false : mockPresetsLoading;
      },
      get isError() {
        return false;
      },
      error: null,
      get data() {
        return isQueues ? mockQueuesData : mockPresetsData;
      },
      refetch: vi.fn(),
    };
  },
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input?: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as (() => void) | undefined;
    const onError = opts.onError as (() => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      mutate(input?: unknown) {
        mutationFn(input).then(
          () => onSuccess?.(),
          () => onError?.(),
        );
      },
    };
  },
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) =>
  (await import("$mocks/haptic.js")).hapticMock(
    await importOriginal<typeof HapticNS>(),
  ),
);
vi.mock(
  "$lib/stores/toast.svelte.js",
  async () =>
    (await import("$mocks/toast.js")).toastMock() satisfies typeof ToastNS,
);
vi.mock("$lib/utils/announce.js", async (importOriginal) =>
  (await import("$mocks/announce.js")).announceMock(
    await importOriginal<typeof AnnounceNS>(),
  ),
);
vi.mock(
  "$lib/shell/context.js",
  async () =>
    (
      await import("$mocks/shell-context.js")
    ).shellContextMock() satisfies typeof ContextNS,
);
vi.mock(
  "$lib/shell/ShellSheet.svelte",
  async () =>
    ({
      default: (
        await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
      ).default as unknown as (typeof ShellSheetNS)["default"],
    }) satisfies typeof ShellSheetNS,
);
vi.mock("$lib/errors.js", async (importOriginal) =>
  (await import("$mocks/errors.js")).errorsMock(
    await importOriginal<typeof ErrorsNS>(),
  ),
);
vi.mock("$lib/terminology/with-terms.js", async (importOriginal) =>
  (await import("$mocks/with-terms.js")).withTermsMock(
    await importOriginal<typeof WithTermsNS>(),
  ),
);

import PresetsSection from "./PresetsSection.svelte";
import type * as ErrorsNS from "$lib/errors.js";
import type * as ContextNS from "$lib/shell/context.js";
import type * as AnnounceNS from "$lib/utils/announce.js";
import type * as HapticNS from "$lib/utils/haptic.js";
import type * as ToastNS from "$lib/stores/toast.svelte.js";
import type * as WithTermsNS from "$lib/terminology/with-terms.js";
import type * as SvelteQueryNS from "@tanstack/svelte-query";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as ContextNS2 from "$lib/crypto/context.js";
import type * as MessagesNS from "$lib/paraglide/messages.js";
import type * as ShellSheetNS from "$lib/shell/ShellSheet.svelte";
import { mockToastShow } from "$mocks/toast.js";
import { mockHaptic } from "$mocks/haptic.js";

const PRESETS: PresetRecord[] = [
  {
    id: "p-1",
    encryptedTitle: "title-1",
    encryptedBody: "body-1",
    queueId: null,
  },
  {
    id: "p-2",
    encryptedTitle: "title-2",
    encryptedBody: "body-2",
    queueId: "q-1",
  },
];

describe("PresetsSection", () => {
  beforeEach(() => {
    mockPresetsData = undefined;
    mockPresetsLoading = true;
    mockQueuesData = [{ id: "q-1", encryptedName: "queue-name" }];
    mockCreatePreset.mockClear();
    mockUpdatePreset.mockClear();
    mockDeletePreset.mockClear();
    mockEncryptText.mockClear();
    mockOrgCacheDelete.mockClear();
    mockToastShow.mockClear();
    mockHaptic.mockClear();
  });

  afterEach(cleanup);

  it("shows empty state when no presets exist", () => {
    mockPresetsLoading = false;
    mockPresetsData = [];
    render(PresetsSection);

    expect(screen.getByText("No saved replies yet.")).toBeTruthy();
    expect(screen.getByText("Tap Add reply to create one.")).toBeTruthy();
    expect(screen.getByText("Add reply")).toBeTruthy();
  });

  it("renders presets with decrypted titles", () => {
    mockPresetsLoading = false;
    mockPresetsData = PRESETS;
    render(PresetsSection);

    expect(screen.getByText("decrypted:title-1")).toBeTruthy();
    expect(screen.getByText("decrypted:title-2")).toBeTruthy();
  });

  it("shows queue badge for queue-scoped presets", () => {
    mockPresetsLoading = false;
    mockPresetsData = PRESETS;
    render(PresetsSection);

    expect(screen.getByText("decrypted:queue-name")).toBeTruthy();
  });

  it("opens add sheet and calls createPreset on save", async () => {
    mockPresetsLoading = false;
    mockPresetsData = [];
    render(PresetsSection);

    await fireEvent.click(screen.getByText("Add reply"));
    expect(screen.getByText("New Saved Reply")).toBeTruthy();

    const titleInput = screen.getByPlaceholderText(
      "A short name for this reply",
    );
    await fireEvent.input(titleInput, {
      target: { value: "Welcome" },
    });

    const bodyInput = screen.getByPlaceholderText("The message body...");
    await fireEvent.input(bodyInput, {
      target: { value: "Thanks for contacting us." },
    });

    await fireEvent.click(screen.getByText("Save reply"));
    await vi.waitFor(() => {
      expect(mockCreatePreset).toHaveBeenCalled();
      expect(mockEncryptText).toHaveBeenCalledTimes(2);
    });
  });

  it("opens edit sheet when tapping a preset edit button", async () => {
    mockPresetsLoading = false;
    mockPresetsData = PRESETS;
    render(PresetsSection);

    const editBtns = screen.getAllByLabelText(/Edit Saved Reply:/);
    await fireEvent.click(editBtns[0]!);

    expect(screen.getByText("Edit Saved Reply")).toBeTruthy();
  });

  it("calls updatePreset and evicts cache on save in edit mode", async () => {
    mockPresetsLoading = false;
    mockPresetsData = PRESETS;
    render(PresetsSection);

    const editBtns = screen.getAllByLabelText(/Edit Saved Reply:/);
    await fireEvent.click(editBtns[0]!);

    const bodyInput = screen.getByPlaceholderText("The message body...");
    await fireEvent.input(bodyInput, {
      target: { value: "Updated reply body." },
    });

    await fireEvent.click(screen.getByText("Save changes"));
    await vi.waitFor(() => {
      expect(mockUpdatePreset).toHaveBeenCalled();
      expect(mockOrgCacheDelete).toHaveBeenCalledWith("preset:p-1:title");
      expect(mockOrgCacheDelete).toHaveBeenCalledWith("preset:p-1:body");
    });
  });

  it("shows delete confirmation dialog from edit sheet", async () => {
    mockPresetsLoading = false;
    mockPresetsData = PRESETS;
    render(PresetsSection);

    const editBtns = screen.getAllByLabelText(/Edit Saved Reply:/);
    await fireEvent.click(editBtns[0]!);

    const deleteBtns = screen.getAllByText("Delete");
    await fireEvent.click(deleteBtns[0]!);

    expect(
      screen.getByText("Are you sure you want to remove this saved reply?"),
    ).toBeTruthy();
  });

  it("shows success toast after creating a preset", async () => {
    mockPresetsLoading = false;
    mockPresetsData = [];
    render(PresetsSection);

    await fireEvent.click(screen.getByText("Add reply"));

    const titleInput = screen.getByPlaceholderText(
      "A short name for this reply",
    );
    await fireEvent.input(titleInput, {
      target: { value: "Welcome" },
    });

    const bodyInput = screen.getByPlaceholderText("The message body...");
    await fireEvent.input(bodyInput, {
      target: { value: "Thanks!" },
    });

    await fireEvent.click(screen.getByText("Save reply"));

    await vi.waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Saved reply created.");
      expect(mockHaptic).toHaveBeenCalled();
    });
  });

  it("shows description text", () => {
    mockPresetsLoading = false;
    mockPresetsData = [];
    render(PresetsSection);

    expect(
      screen.getByText("Saved replies appear in the compose bar."),
    ).toBeTruthy();
  });
});
