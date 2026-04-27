// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const { mockSetPiiRetention, mockToastShow, mockHaptic } = vi.hoisted(() => ({
  mockSetPiiRetention: vi.fn().mockResolvedValue({ success: true }),
  mockToastShow: vi.fn(),
  mockHaptic: vi.fn(),
}));

let mockHubStatusData: { retentionDays: number | null } | undefined;

vi.mock("$lib/paraglide/messages.js", () => ({
  admin_retention_toggle_label: () => "Auto-delete PII",
  admin_retention_active_description: ({ days }: { days: number }) =>
    `Deleting after ${days} days`,
  admin_retention_inactive_description: () => "Auto-delete is disabled",
  admin_retention_days_label: () => "Days",
  admin_retention_days_placeholder: () => "e.g. 365",
  admin_retention_range_hint: () => "1-3650",
  admin_retention_unsaved_hint: () => "Unsaved changes",
  admin_retention_confirm: () => "Save",
  admin_retention_saved: () => "Saved",
  admin_retention_error: () => "Error saving",
  admin_retention_set_title: ({ days }: { days: number }) =>
    `Set to ${days} days?`,
  admin_retention_set_body: ({ days }: { days: number }) =>
    `PII older than ${days} days will be deleted.`,
  admin_retention_clear_title: () => "Disable auto-delete?",
  admin_retention_clear_body: () => "PII will be retained indefinitely.",
  admin_retention_disable: () => "Disable",
  common_cancel: () => "Cancel",
  common_loading: () => "Loading",
  error_generic: () => "Something went wrong",
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    auth: {
      hubStatus: { query: vi.fn() },
      setPiiRetention: { mutate: mockSetPiiRetention },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  createQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    return {
      get isLoading() {
        return !mockHubStatusData;
      },
      get isError() {
        return false;
      },
      error: null,
      get data() {
        return mockHubStatusData;
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

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));

vi.mock("$lib/utils/haptic.js", () => ({ haptic: mockHaptic }));

vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));

vi.mock("$lib/shell/ShellDialog.svelte", async () => ({
  default: (await import("./test-helpers/StubShellDialog.svelte")).default,
}));

vi.mock("$lib/components/QueryError.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

import RetentionSection from "./RetentionSection.svelte";

describe("RetentionSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHubStatusData = undefined;
  });

  afterEach(cleanup);

  it("renders disabled toggle during loading", () => {
    mockHubStatusData = undefined;
    render(RetentionSection);
    expect(screen.getByText("Auto-delete PII")).toBeTruthy();
  });

  it("initializes enabled with days when server has retention configured", () => {
    mockHubStatusData = { retentionDays: 90 };
    render(RetentionSection);

    expect(screen.getByText("Deleting after 90 days")).toBeTruthy();
    const input = document.querySelector<HTMLInputElement>("#retention-days");
    expect(input?.value).toBe("90");
    expect(input?.disabled).toBe(false);
  });

  it("initializes disabled when server has no retention", () => {
    mockHubStatusData = { retentionDays: null };
    render(RetentionSection);

    expect(screen.getByText("Auto-delete is disabled")).toBeTruthy();
    const input = document.querySelector<HTMLInputElement>("#retention-days");
    expect(input?.disabled).toBe(true);
  });

  it("shows unsaved hint when days differ from server value", async () => {
    mockHubStatusData = { retentionDays: 90 };
    render(RetentionSection);

    const input = document.querySelector<HTMLInputElement>("#retention-days")!;
    await fireEvent.input(input, { target: { value: "180" } });

    expect(screen.getByText("Unsaved changes")).toBeTruthy();
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it("does not show unsaved hint when days match server value", () => {
    mockHubStatusData = { retentionDays: 90 };
    render(RetentionSection);

    expect(screen.queryByText("Unsaved changes")).toBeNull();
  });

  // Toggle and dialog interaction tests are skipped: Konsta Toggle's
  // onchange handler is wired to the Konsta component wrapper, not the
  // raw <input>. fireEvent.click/change on the checkbox doesn't trigger
  // the Svelte handler in jsdom. These flows are verified via Playwright.

  it("calls mutation with null on confirm clear", async () => {
    mockHubStatusData = { retentionDays: 90 };
    render(RetentionSection);

    const toggle = document.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    )!;
    await fireEvent.click(toggle);

    await fireEvent.click(screen.getByText("Disable"));

    expect(mockSetPiiRetention).toHaveBeenCalledWith({ days: null });
  });

  it("renders range hint text", () => {
    mockHubStatusData = { retentionDays: 90 };
    render(RetentionSection);

    expect(screen.getByText("1-3650")).toBeTruthy();
  });
});
