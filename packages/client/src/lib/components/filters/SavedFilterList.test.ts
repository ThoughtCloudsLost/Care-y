// @vitest-environment jsdom
/**
 * SavedFilterList generic component tests.
 *
 * The generic SavedFilterList accepts filters, count, and callbacks as props.
 * Tests verify chip rendering, tap-to-apply, and long-press menu.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";

// IntersectionObserver is not available in jsdom (needed by DecryptPlaceholder)
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

// --- Mock i18n ---
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesNS>()),
  saved_filter_apply: () => "Apply saved filter",
  saved_filter_decrypting: () => "...",
  saved_filter_shared_label: () => "Shared",
  saved_filter_share: () => "Share",
  saved_filter_unshare: () => "Unshare",
  saved_filter_delete: () => "Delete",
  shell_close: () => "Close",
  error_decryption_failed: () => "Decryption failed",
  decrypt_placeholder_loading: () => "Decrypting",
  saved_filter_shared_load_failed: () => "Shared filters could not be loaded.",
  common_retry: () => "Retry",
}));

// --- Mock crypto context ---
vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContextNS>()),
  getOrgDecryptCache: () => ({
    decrypt: vi.fn((_id: string, _data: Uint8Array) => "My Housing Filter"),
    has: vi.fn().mockReturnValue(false),
    get: vi.fn().mockReturnValue(undefined),
    clear: vi.fn(),
    size: 0,
  }),
}));

// --- Mock buffer encoding ---
vi.mock("$lib/utils/buffer-encoding.js", async (importOriginal) => ({
  ...(await importOriginal<typeof BufferEncodingNS>()),
  base64ToUint8Array: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3, 4])),
}));

// --- Mock shell action sheet: pass-through renders children ---
vi.mock(
  "$lib/shell/ShellActionSheet.svelte",
  async () =>
    ({
      default: (await import("../tickets/test-helpers/PassthroughShell.svelte"))
        .default as unknown as (typeof ShellActionSheetNS)["default"],
    }) satisfies typeof ShellActionSheetNS,
);

import SavedFilterList from "./SavedFilterList.svelte";
import type { SavedFilterRecord } from "@care-y/shared";
import type * as BufferEncodingNS from "$lib/utils/buffer-encoding.js";
import type * as ContextNS from "$lib/crypto/context.js";
import type * as MessagesNS from "$lib/paraglide/messages.js";
import type * as ShellActionSheetNS from "$lib/shell/ShellActionSheet.svelte";

const mockFilters: SavedFilterRecord[] = [
  {
    id: "sf-1",
    encryptedName: "AQIDBA==",
    color: "blue",
    icon: "tag",
    state: JSON.stringify({ statuses: ["new"], priorities: ["urgent"] }),
    shared: false,
    ownerId: "user-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sf-2",
    encryptedName: "BQYHCA==",
    color: "red",
    icon: "phone",
    state: JSON.stringify({ statuses: ["active"], queueIds: ["q-1"] }),
    shared: true,
    ownerId: "user-1",
    createdAt: new Date().toISOString(),
  },
];

describe("SavedFilterList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("renders saved filter chips", () => {
    render(SavedFilterList, {
      filters: mockFilters,
      count: 2,
      onapply: vi.fn(),
      ondelete: vi.fn(),
      ontoggleshare: vi.fn(),
      currentUserId: "user-1",
    });
    const list = screen.getByRole("list", { name: "Apply saved filter" });
    expect(list).toBeTruthy();

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("displays decrypted names on chips", () => {
    render(SavedFilterList, {
      filters: mockFilters,
      count: 2,
      onapply: vi.fn(),
      ondelete: vi.fn(),
      ontoggleshare: vi.fn(),
      currentUserId: "user-1",
    });
    const chips = screen.getAllByText("My Housing Filter");
    expect(chips.length).toBeGreaterThanOrEqual(1);
  });

  it("renders chips with correct aria-labels", () => {
    render(SavedFilterList, {
      filters: mockFilters,
      count: 2,
      onapply: vi.fn(),
      ondelete: vi.fn(),
      ontoggleshare: vi.fn(),
      currentUserId: "user-1",
    });
    const buttons = screen.getAllByRole("button", {
      name: "My Housing Filter",
    });
    expect(buttons).toHaveLength(2);
  });

  it("calls onapply on chip tap (pointerup)", () => {
    const onapply = vi.fn();
    render(SavedFilterList, {
      filters: mockFilters,
      count: 2,
      onapply,
      ondelete: vi.fn(),
      ontoggleshare: vi.fn(),
      currentUserId: "user-1",
    });
    const buttons = screen.getAllByRole("button", {
      name: "My Housing Filter",
    });
    const firstChip = buttons[0]!;

    // Simulate quick tap: pointerdown then immediate pointerup.
    firstChip.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    firstChip.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));

    expect(onapply).toHaveBeenCalledTimes(1);
    expect(onapply).toHaveBeenCalledWith(mockFilters[0]);
  });

  it("does not render when count is 0", () => {
    render(SavedFilterList, {
      filters: [],
      count: 0,
      onapply: vi.fn(),
      ondelete: vi.fn(),
      ontoggleshare: vi.fn(),
      currentUserId: "user-1",
    });
    const list = screen.queryByRole("list");
    expect(list).toBeNull();
  });

  const othersFilter: SavedFilterRecord = {
    id: "sf-3",
    encryptedName: "CQoLDA==",
    color: "green",
    icon: "star",
    state: JSON.stringify({ statuses: ["closed"] }),
    shared: true,
    ownerId: "user-2",
    createdAt: new Date().toISOString(),
  };

  it("opens the action sheet on contextmenu for an owned chip", async () => {
    render(SavedFilterList, {
      filters: [mockFilters[0]!],
      count: 1,
      onapply: vi.fn(),
      ondelete: vi.fn(),
      ontoggleshare: vi.fn(),
      currentUserId: "user-1",
    });
    const chip = screen.getByRole("button", { name: "My Housing Filter" });

    await fireEvent.contextMenu(chip);

    expect(screen.queryByText("Delete")).not.toBeNull();
  });

  it("does not open the action sheet on contextmenu for another owner's chip", async () => {
    render(SavedFilterList, {
      filters: [othersFilter],
      count: 1,
      onapply: vi.fn(),
      ondelete: vi.fn(),
      ontoggleshare: vi.fn(),
      currentUserId: "user-1",
    });
    const chip = screen.getByRole("button", { name: "My Housing Filter" });

    await fireEvent.contextMenu(chip);

    expect(screen.queryByText("Delete")).toBeNull();
    expect(screen.queryByText("Share")).toBeNull();
    expect(screen.queryByText("Unshare")).toBeNull();
    expect(screen.queryByText("Close")).toBeNull();
  });

  it("long press on another owner's chip neither opens the sheet nor applies", async () => {
    const onapply = vi.fn();
    render(SavedFilterList, {
      filters: [othersFilter],
      count: 1,
      onapply,
      ondelete: vi.fn(),
      ontoggleshare: vi.fn(),
      currentUserId: "user-1",
    });
    const chip = screen.getByRole("button", { name: "My Housing Filter" });

    vi.useFakeTimers();
    try {
      chip.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      vi.advanceTimersByTime(500);
      chip.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
      await tick();

      expect(screen.queryByText("Close")).toBeNull();
      expect(onapply).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows a retryable alert when shared filters failed to load", async () => {
    const onretryshared = vi.fn();
    render(SavedFilterList, {
      filters: [],
      count: 0,
      onapply: vi.fn(),
      ondelete: vi.fn(),
      ontoggleshare: vi.fn(),
      currentUserId: "user-1",
      sharedLoadFailed: true,
      onretryshared,
    });

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Shared filters could not be loaded.");

    await fireEvent.click(screen.getByText("Retry"));

    expect(onretryshared).toHaveBeenCalledTimes(1);
  });

  it("renders no alert when sharedLoadFailed is omitted", () => {
    render(SavedFilterList, {
      filters: mockFilters,
      count: 2,
      onapply: vi.fn(),
      ondelete: vi.fn(),
      ontoggleshare: vi.fn(),
      currentUserId: "user-1",
    });

    expect(screen.queryByRole("alert")).toBeNull();
  });
});
