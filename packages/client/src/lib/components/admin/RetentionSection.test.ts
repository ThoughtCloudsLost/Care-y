// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const { mockSetPiiRetention, mockHubRetention, mockInvalidateQueries } =
  vi.hoisted(() => ({
    mockSetPiiRetention: vi.fn().mockResolvedValue({ success: true }),
    mockHubRetention: vi.fn(),
    mockInvalidateQueries: vi.fn(),
  }));

let mockRetentionData: { retentionDays: number | null } | undefined;
let lastQueryOpts: Record<string, unknown> | undefined;

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesNS>()),
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

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    auth: {
      hubRetention: { query: mockHubRetention },
      setPiiRetention: { mutate: mockSetPiiRetention },
    },
  },
}));

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryNS>()),
  createQuery: (optsFn: () => Record<string, unknown>) => {
    lastQueryOpts = optsFn();
    return {
      get isLoading() {
        return !mockRetentionData;
      },
      get isError() {
        return false;
      },
      error: null,
      get data() {
        return mockRetentionData;
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
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

vi.mock(
  "$lib/stores/toast.svelte.js",
  async () =>
    (await import("$mocks/toast.js")).toastMock() satisfies typeof ToastNS,
);

vi.mock("$lib/utils/haptic.js", async (importOriginal) =>
  (await import("$mocks/haptic.js")).hapticMock(
    await importOriginal<typeof HapticNS>(),
  ),
);

vi.mock("$lib/utils/announce.js", async (importOriginal) =>
  (await import("$mocks/announce.js")).announceMock(
    await importOriginal<typeof AnnounceNS>(),
  ),
);

vi.mock(
  "$lib/shell/ShellDialog.svelte",
  async () =>
    ({
      default: (await import("./test-helpers/StubShellDialog.svelte"))
        .default as unknown as (typeof ShellDialogNS)["default"],
    }) satisfies typeof ShellDialogNS,
);

vi.mock(
  "$lib/components/QueryError.svelte",
  async () =>
    ({
      default: (
        await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
      ).default as unknown as (typeof QueryErrorNS)["default"],
    }) satisfies typeof QueryErrorNS,
);

import RetentionSection from "./RetentionSection.svelte";
import { adminKeys } from "$lib/query/keys.js";
import type * as AnnounceNS from "$lib/utils/announce.js";
import type * as HapticNS from "$lib/utils/haptic.js";
import type * as ToastNS from "$lib/stores/toast.svelte.js";
import type * as SvelteQueryNS from "@tanstack/svelte-query";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as MessagesNS from "$lib/paraglide/messages.js";
import type * as QueryErrorNS from "$lib/components/QueryError.svelte";
import type * as ShellDialogNS from "$lib/shell/ShellDialog.svelte";

describe("RetentionSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRetentionData = undefined;
    lastQueryOpts = undefined;
  });

  afterEach(cleanup);

  it("reads the retention setting from auth.hubRetention", async () => {
    mockRetentionData = { retentionDays: 90 };
    render(RetentionSection);

    expect(lastQueryOpts?.queryKey).toEqual(adminKeys.hubRetention());
    const queryFn = lastQueryOpts?.queryFn as () => Promise<unknown>;
    await queryFn();
    expect(mockHubRetention).toHaveBeenCalledOnce();
  });

  it("renders disabled toggle during loading", () => {
    mockRetentionData = undefined;
    render(RetentionSection);
    expect(screen.getByText("Auto-delete PII")).toBeTruthy();
  });

  it("initializes enabled with days when server has retention configured", () => {
    mockRetentionData = { retentionDays: 90 };
    render(RetentionSection);

    expect(screen.getByText("Deleting after 90 days")).toBeTruthy();
    const input = document.querySelector<HTMLInputElement>("#retention-days");
    expect(input?.value).toBe("90");
    expect(input?.disabled).toBe(false);
  });

  it("initializes disabled when server has no retention", () => {
    mockRetentionData = { retentionDays: null };
    render(RetentionSection);

    expect(screen.getByText("Auto-delete is disabled")).toBeTruthy();
    const input = document.querySelector<HTMLInputElement>("#retention-days");
    expect(input?.disabled).toBe(true);
  });

  it("shows unsaved hint when days differ from server value", async () => {
    mockRetentionData = { retentionDays: 90 };
    render(RetentionSection);

    const input = document.querySelector<HTMLInputElement>("#retention-days")!;
    await fireEvent.input(input, { target: { value: "180" } });

    expect(screen.getByText("Unsaved changes")).toBeTruthy();
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it("does not show unsaved hint when days match server value", () => {
    mockRetentionData = { retentionDays: 90 };
    render(RetentionSection);

    expect(screen.queryByText("Unsaved changes")).toBeNull();
  });

  // Toggle and dialog interaction tests are skipped: Konsta Toggle's
  // onchange handler is wired to the Konsta component wrapper, not the
  // raw <input>. fireEvent.click/change on the checkbox doesn't trigger
  // the Svelte handler in jsdom. These flows are verified via Playwright.

  it("calls mutation with null on confirm clear", async () => {
    mockRetentionData = { retentionDays: 90 };
    render(RetentionSection);

    const toggle = document.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    )!;
    await fireEvent.click(toggle);

    await fireEvent.click(screen.getByText("Disable"));

    expect(mockSetPiiRetention).toHaveBeenCalledWith({ days: null });
    await vi.waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: adminKeys.hubRetention(),
      });
    });
  });

  it("renders range hint text", () => {
    mockRetentionData = { retentionDays: 90 };
    render(RetentionSection);

    expect(screen.getByText("1-3650")).toBeTruthy();
  });
});
