// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const {
  mockAddToBlacklist,
  mockRemoveFromBlacklist,
  mockToastShow,
  mockHaptic,
} = vi.hoisted(() => ({
  mockAddToBlacklist: vi.fn().mockResolvedValue({
    id: "new-1",
    phoneHash: "abcd1234",
    addedBy: "u1",
    createdAt: new Date(),
  }),
  mockRemoveFromBlacklist: vi.fn().mockResolvedValue(undefined),
  mockToastShow: vi.fn(),
  mockHaptic: vi.fn(),
}));

interface BlacklistEntry {
  id: string;
  phoneHash: string;
  addedBy: string;
  createdAt: Date;
}

let mockBlacklistData: BlacklistEntry[] | undefined;
let mockIsLoading: boolean;

vi.mock("$lib/paraglide/messages.js", () => ({
  admin_blacklist_filter: () => "Filter blocked numbers...",
  admin_blacklist_empty: () => "No blocked numbers yet.",
  admin_blacklist_add_button: () => "Add Number",
  admin_blacklist_add_title: () => "Block Number",
  admin_blacklist_country_code: () => "Code",
  admin_blacklist_phone_label: () => "Number",
  admin_blacklist_phone_hint: () =>
    "Dashes and spaces are stripped automatically.",
  admin_blacklist_block_button: () => "Block",
  admin_blacklist_remove_title: () => "Remove blocked number",
  admin_blacklist_remove_confirm: () =>
    "This number will no longer be blocked. Are you sure?",
  admin_blacklist_remove_button: () => "Remove",
  admin_blacklist_added: () => "Number blocked",
  admin_blacklist_removed: () => "Number unblocked",
  admin_blacklist_already_blocked: () => "This number is already blocked.",
  admin_blacklist_invalid_format: () =>
    "Enter a valid phone number (at least 5 digits).",
  common_loading: () => "Loading",
  admin_blacklist_placeholder: () => "Coming soon",
  common_cancel: () => "Cancel",
  error_generic: () => "Something went wrong",
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    telephonyAdmin: {
      listBlacklist: { query: vi.fn() },
      addToBlacklist: { mutate: mockAddToBlacklist },
      removeFromBlacklist: { mutate: mockRemoveFromBlacklist },
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
        return mockBlacklistData;
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

import BlacklistSection from "./BlacklistSection.svelte";

describe("BlacklistSection", () => {
  beforeEach(() => {
    mockBlacklistData = undefined;
    mockIsLoading = true;
    mockAddToBlacklist.mockClear();
    mockRemoveFromBlacklist.mockClear();
    mockToastShow.mockClear();
    mockHaptic.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows empty state when no entries", () => {
    mockIsLoading = false;
    mockBlacklistData = [];
    render(BlacklistSection);

    expect(screen.getByText("No blocked numbers yet.")).toBeTruthy();
    expect(screen.getByText("Add Number")).toBeTruthy();
  });

  it("renders entries with truncated hashes", async () => {
    mockIsLoading = false;
    mockBlacklistData = [
      {
        id: "bl-1",
        phoneHash: "abcdef1234567890",
        addedBy: "user-1",
        createdAt: new Date("2026-04-10"),
      },
      {
        id: "bl-2",
        phoneHash: "12345678deadbeef",
        addedBy: "user-1",
        createdAt: new Date("2026-04-12"),
      },
    ];
    render(BlacklistSection);

    expect(screen.getAllByText("abcd...7890").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1234...beef").length).toBeGreaterThan(0);
  });

  it("filters entries by hash text", async () => {
    mockIsLoading = false;
    mockBlacklistData = [
      {
        id: "bl-1",
        phoneHash: "abcdef1234567890",
        addedBy: "user-1",
        createdAt: new Date("2026-04-10"),
      },
      {
        id: "bl-2",
        phoneHash: "12345678deadbeef",
        addedBy: "user-1",
        createdAt: new Date("2026-04-12"),
      },
    ];
    render(BlacklistSection);

    const filterInput = screen.getByPlaceholderText(
      "Filter blocked numbers...",
    );
    await fireEvent.input(filterInput, { target: { value: "dead" } });

    expect(screen.queryAllByText("abcd...7890")).toHaveLength(0);
    expect(screen.getAllByText("1234...beef").length).toBeGreaterThan(0);
  });

  it("calls addToBlacklist mutation with valid E.164 input", async () => {
    mockIsLoading = false;
    mockBlacklistData = [];
    render(BlacklistSection);

    const addBtn = screen.getByText("Add Number");
    await fireEvent.click(addBtn);

    const phoneInput = screen.getByPlaceholderText("555-123-4567");
    await fireEvent.input(phoneInput, { target: { value: "555-999-8888" } });

    const blockBtn = screen.getByText("Block");
    await fireEvent.click(blockBtn);

    expect(mockAddToBlacklist).toHaveBeenCalledWith({
      phoneNumber: "+15559998888",
    });
  });

  it("shows toast on successful add", async () => {
    mockIsLoading = false;
    mockBlacklistData = [];
    render(BlacklistSection);

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

  it("calls removeFromBlacklist mutation on confirm", async () => {
    mockIsLoading = false;
    mockBlacklistData = [
      {
        id: "bl-1",
        phoneHash: "abcdef1234567890",
        addedBy: "user-1",
        createdAt: new Date("2026-04-10"),
      },
    ];
    render(BlacklistSection);

    const removeBtn = screen.getByLabelText("Remove abcd...7890");
    await fireEvent.click(removeBtn);

    const confirmBtn = screen.getByText("Remove");
    await fireEvent.click(confirmBtn);

    expect(mockRemoveFromBlacklist).toHaveBeenCalledWith({ id: "bl-1" });
  });
});
