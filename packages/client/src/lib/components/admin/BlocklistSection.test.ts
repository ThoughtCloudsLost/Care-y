// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const {
  mockAddToBlocklist,
  mockRemoveFromBlocklist,
  mockToastShow,
  mockHaptic,
} = vi.hoisted(() => ({
  mockAddToBlocklist: vi.fn().mockResolvedValue({
    id: "new-1",
    phoneHash: "abcd1234",
    addedBy: "u1",
    createdAt: new Date(),
  }),
  mockRemoveFromBlocklist: vi.fn().mockResolvedValue(undefined),
  mockToastShow: vi.fn(),
  mockHaptic: vi.fn(),
}));

interface BlocklistEntry {
  id: string;
  encryptedNumber: string;
  addedBy: string;
  createdAt: Date;
}

let mockBlocklistData: BlocklistEntry[] | undefined;
let mockIsLoading: boolean;

vi.mock("$lib/paraglide/messages.js", () => ({
  admin_blocklist_filter: () => "Filter blocked numbers...",
  admin_blocklist_empty: () => "No blocked numbers yet.",
  admin_blocklist_add_button: () => "Add Number",
  admin_blocklist_add_title: () => "Block Number",
  admin_blocklist_country_code: () => "Code",
  admin_blocklist_phone_label: () => "Number",
  admin_blocklist_phone_hint: () =>
    "Dashes and spaces are stripped automatically.",
  admin_blocklist_block_button: () => "Block",
  admin_blocklist_remove_title: () => "Remove blocked number",
  admin_blocklist_remove_confirm: () =>
    "This number will no longer be blocked. Are you sure?",
  admin_blocklist_remove_button: () => "Remove",
  admin_blocklist_added: () => "Number blocked",
  admin_blocklist_removed: () => "Number unblocked",
  admin_blocklist_already_blocked: () => "This number is already blocked.",
  admin_blocklist_invalid_format: () =>
    "Enter a valid phone number (at least 5 digits).",
  admin_blocklist_number_placeholder: () => "555-123-4567",
  admin_blocklist_show_all: (p: { count: string }) =>
    `Show all (${p.count} more)`,
  common_loading: () => "Loading",
  admin_blocklist_placeholder: () => "Coming soon",
  common_cancel: () => "Cancel",
  error_generic: () => "Something went wrong",
  decrypt_placeholder_loading: () => "Decrypting...",
  decrypt_placeholder_denied: () => "Access denied",
  error_decryption_failed: () => "Decryption failed",
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    telephonyAdmin: {
      listBlocklist: { query: vi.fn() },
      addToBlocklist: { mutate: mockAddToBlocklist },
      removeFromBlocklist: { mutate: mockRemoveFromBlocklist },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
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
        return mockBlocklistData;
      },
      refetch: vi.fn(),
    };
  },
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
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("$lib/utils/haptic.js", () => ({ haptic: mockHaptic }));
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));
vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));
vi.mock("$lib/utils/a11y.js", () => ({
  onKeyActivate: (fn: () => void) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") fn();
  },
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

vi.mock("$lib/crypto/context.js", () => ({
  getOrgDecryptCache: () => ({
    decrypt: (_id: string, encrypted: unknown) =>
      typeof encrypted === "string" ? `+1${encrypted}` : null,
  }),
}));

vi.mock("$lib/crypto/async-decrypt-cache.js", () => ({
  DECRYPT_ERROR_SENTINEL: "\0DECRYPT_FAILED",
  isDecryptError: (v: unknown) => v === "\0DECRYPT_FAILED",
}));

vi.mock("$lib/crypto/decrypt-result.js", () => ({
  LOADING: Object.freeze({ status: "loading" }),
  ERROR: Object.freeze({ status: "error" }),
  DENIED: Object.freeze({ status: "denied" }),
}));

vi.mock("$lib/utils/format-time.js", () => ({
  formatRelativeTime: () => "2d ago",
}));

import BlocklistSection from "./BlocklistSection.svelte";

describe("BlocklistSection", () => {
  beforeEach(() => {
    mockBlocklistData = undefined;
    mockIsLoading = true;
    mockAddToBlocklist.mockClear();
    mockRemoveFromBlocklist.mockClear();
    mockToastShow.mockClear();
    mockHaptic.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows empty state when no entries", () => {
    mockIsLoading = false;
    mockBlocklistData = [];
    render(BlocklistSection);

    expect(screen.getByText("No blocked numbers yet.")).toBeTruthy();
    expect(screen.getByText("Add Number")).toBeTruthy();
  });

  it("renders decrypted numbers", async () => {
    mockIsLoading = false;
    mockBlocklistData = [
      {
        id: "bl-1",
        encryptedNumber: "5551234567",
        addedBy: "user-1",
        createdAt: new Date("2026-04-10"),
      },
      {
        id: "bl-2",
        encryptedNumber: "5559876543",
        addedBy: "user-1",
        createdAt: new Date("2026-04-12"),
      },
    ];
    render(BlocklistSection);

    expect(screen.getAllByText("+15551234567").length).toBeGreaterThan(0);
    expect(screen.getAllByText("+15559876543").length).toBeGreaterThan(0);
  });

  it("filters entries by number digits", async () => {
    mockIsLoading = false;
    mockBlocklistData = [
      {
        id: "bl-1",
        encryptedNumber: "5551234567",
        addedBy: "user-1",
        createdAt: new Date("2026-04-10"),
      },
      {
        id: "bl-2",
        encryptedNumber: "5559876543",
        addedBy: "user-1",
        createdAt: new Date("2026-04-12"),
      },
    ];
    render(BlocklistSection);

    const filterInput = screen.getByPlaceholderText(
      "Filter blocked numbers...",
    );
    await fireEvent.input(filterInput, { target: { value: "9876" } });

    expect(screen.queryAllByText("+15551234567")).toHaveLength(0);
    expect(screen.getAllByText("+15559876543").length).toBeGreaterThan(0);
  });

  it("calls addToBlocklist mutation with valid E.164 input", async () => {
    mockIsLoading = false;
    mockBlocklistData = [];
    render(BlocklistSection);

    const addBtn = screen.getByText("Add Number");
    await fireEvent.click(addBtn);

    const phoneInput = screen.getByPlaceholderText("555-123-4567");
    await fireEvent.input(phoneInput, { target: { value: "555-999-8888" } });

    const blockBtn = screen.getByText("Block");
    await fireEvent.click(blockBtn);

    expect(mockAddToBlocklist).toHaveBeenCalledWith({
      phoneNumber: "+15559998888",
    });
  });

  it("shows toast on successful add", async () => {
    mockIsLoading = false;
    mockBlocklistData = [];
    render(BlocklistSection);

    const addBtn = screen.getByText("Add Number");
    await fireEvent.click(addBtn);

    const phoneInput = screen.getByPlaceholderText("555-123-4567");
    await fireEvent.input(phoneInput, { target: { value: "555-999-8888" } });

    const blockBtn = screen.getByText("Block");
    await fireEvent.click(blockBtn);

    await vi.waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Number blocked");
    });
  });

  it("calls removeFromBlocklist mutation on confirm", async () => {
    mockIsLoading = false;
    mockBlocklistData = [
      {
        id: "bl-1",
        encryptedNumber: "5551234567",
        addedBy: "user-1",
        createdAt: new Date("2026-04-10"),
      },
    ];
    render(BlocklistSection);

    const removeBtn = screen.getByLabelText("Remove +15551234567");
    await fireEvent.click(removeBtn);

    const confirmBtn = screen.getByText("Remove");
    await fireEvent.click(confirmBtn);

    expect(mockRemoveFromBlocklist).toHaveBeenCalledWith({ id: "bl-1" });
  });
});
