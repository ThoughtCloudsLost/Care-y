import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";
import { SvelteSet } from "svelte/reactivity";
import { createBulkActions } from "./create-bulk-actions.svelte.js";
import type * as ToastModule from "$lib/stores/toast.svelte.js";
import type * as HapticModule from "$lib/utils/haptic.js";
import type * as Messages from "$lib/paraglide/messages.js";

// vi.mock required: toast store is a $state rune module and haptic touches
// navigator.vibrate; the tests assert on both spies. Stubs cover the full
// module surfaces via satisfies.
vi.mock(
  "$lib/stores/toast.svelte.js",
  () =>
    ({
      toastStore: { current: null, show: vi.fn(), dismiss: vi.fn() },
    }) satisfies typeof ToastModule,
);
vi.mock(
  "$lib/utils/haptic.js",
  () => ({ haptic: vi.fn() }) satisfies typeof HapticModule,
);
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Messages>()),
  ticket_toast_bulk_assigned: ({
    count,
    name,
  }: {
    count: string;
    name: string;
  }) => `Assigned ${count} to ${name}`,
  ticket_toast_bulk_held: ({ count }: { count: string }) => `Held ${count}`,
  error_generic: () => "Error",
}));

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

describe("createBulkActions", () => {
  let selectedIds: SvelteSet<string>;
  let exitMultiSelect: Mock<() => void>;
  let assignTo: Mock<
    (ticketId: string, targetUserId: string) => Promise<unknown>
  >;
  let holdTicket: Mock<(ticketId: string) => Promise<unknown>>;
  let resolveVolunteerName: Mock<(userId: string) => string>;
  let qc: QueryClient;

  beforeEach(async () => {
    selectedIds = new SvelteSet(["t1", "t2", "t3"]);
    exitMultiSelect = vi.fn<() => void>();
    assignTo = vi
      .fn<(id: string, uid: string) => Promise<unknown>>()
      .mockResolvedValue(undefined);
    holdTicket = vi
      .fn<(id: string) => Promise<unknown>>()
      .mockResolvedValue(undefined);
    resolveVolunteerName = vi
      .fn<(uid: string) => string>()
      .mockReturnValue("Alice");
    qc = makeQueryClient();

    const { toastStore } = await import("$lib/stores/toast.svelte.js");
    vi.mocked(toastStore.show).mockClear();
    const { haptic } = await import("$lib/utils/haptic.js");
    vi.mocked(haptic).mockClear();
  });

  function make() {
    return createBulkActions({
      selectedIds,
      exitMultiSelect,
      queryClient: qc,
      assignTo,
      holdTicket,
      resolveVolunteerName,
    });
  }

  describe("handleBulkAssignTo", () => {
    it("calls assignTo for each selected ticket", async () => {
      const bulk = make();
      await bulk.handleBulkAssignTo("", "user-1");
      expect(assignTo).toHaveBeenCalledTimes(3);
      expect(assignTo).toHaveBeenCalledWith("t1", "user-1");
      expect(assignTo).toHaveBeenCalledWith("t2", "user-1");
      expect(assignTo).toHaveBeenCalledWith("t3", "user-1");
    });

    it("exits multi-select after completion", async () => {
      const bulk = make();
      await bulk.handleBulkAssignTo("", "user-1");
      expect(exitMultiSelect).toHaveBeenCalledOnce();
    });

    it("returns early for null targetUserId", async () => {
      const bulk = make();
      await bulk.handleBulkAssignTo("", null);
      expect(assignTo).not.toHaveBeenCalled();
      expect(exitMultiSelect).not.toHaveBeenCalled();
    });

    it("reports partial success on failure", async () => {
      assignTo
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error("net"));
      const { toastStore } = await import("$lib/stores/toast.svelte.js");

      const bulk = make();
      await bulk.handleBulkAssignTo("", "user-1");

      expect(assignTo).toHaveBeenCalledTimes(2);
      expect(exitMultiSelect).toHaveBeenCalledOnce();
      expect(toastStore.show).toHaveBeenCalledWith(
        expect.stringContaining("2 failed"),
        3000,
      );
    });

    it("shows success toast with haptic on full success", async () => {
      const { toastStore } = await import("$lib/stores/toast.svelte.js");
      const { haptic } = await import("$lib/utils/haptic.js");

      const bulk = make();
      await bulk.handleBulkAssignTo("", "user-1");

      expect(haptic).toHaveBeenCalledOnce();
      expect(toastStore.show).toHaveBeenCalledWith("Assigned 3 to Alice");
    });

    it("resolves volunteer name for the target user", async () => {
      resolveVolunteerName.mockReturnValue("Dr. Finch");
      const { toastStore } = await import("$lib/stores/toast.svelte.js");

      const bulk = make();
      await bulk.handleBulkAssignTo("", "user-2");

      expect(resolveVolunteerName).toHaveBeenCalledWith("user-2");
      expect(toastStore.show).toHaveBeenCalledWith("Assigned 3 to Dr. Finch");
    });

    it("invalidates ticket list queries after assign", async () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      const bulk = make();
      await bulk.handleBulkAssignTo("", "user-1");

      expect(invalidateSpy).toHaveBeenCalled();
      invalidateSpy.mockRestore();
    });

    it("includes partial failure count in assign toast message", async () => {
      // All three fail after the first succeeds
      assignTo
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error("fail"));
      const { toastStore } = await import("$lib/stores/toast.svelte.js");

      const bulk = make();
      await bulk.handleBulkAssignTo("", "user-1");

      const showCall = vi.mocked(toastStore.show).mock.calls[0]!;
      const message = showCall[0] as string;
      expect(message).toContain("Assigned 1 to Alice");
      expect(message).toContain("2 failed");
    });

    it("does not fire haptic on partial failure", async () => {
      assignTo
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error("fail"));
      const { haptic } = await import("$lib/utils/haptic.js");

      const bulk = make();
      await bulk.handleBulkAssignTo("", "user-1");

      expect(haptic).not.toHaveBeenCalled();
    });
  });

  describe("handleBulkHold", () => {
    it("calls holdTicket for each selected ticket", async () => {
      const bulk = make();
      await bulk.handleBulkHold();
      expect(holdTicket).toHaveBeenCalledTimes(3);
    });

    it("does nothing with empty selection", async () => {
      selectedIds.clear();
      const bulk = make();
      await bulk.handleBulkHold();
      expect(holdTicket).not.toHaveBeenCalled();
      expect(exitMultiSelect).not.toHaveBeenCalled();
    });

    it("reports partial success on failure", async () => {
      holdTicket
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error("net"));
      const { toastStore } = await import("$lib/stores/toast.svelte.js");

      const bulk = make();
      await bulk.handleBulkHold();

      expect(holdTicket).toHaveBeenCalledTimes(3);
      expect(exitMultiSelect).toHaveBeenCalledOnce();
      expect(toastStore.show).toHaveBeenCalledWith(
        expect.stringContaining("1 failed"),
        3000,
      );
    });

    it("shows success toast with haptic on full success", async () => {
      const { toastStore } = await import("$lib/stores/toast.svelte.js");
      const { haptic } = await import("$lib/utils/haptic.js");

      const bulk = make();
      await bulk.handleBulkHold();

      expect(haptic).toHaveBeenCalledOnce();
      expect(toastStore.show).toHaveBeenCalledWith("Held 3");
    });

    it("invalidates ticket list queries after hold", async () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      const bulk = make();
      await bulk.handleBulkHold();

      expect(invalidateSpy).toHaveBeenCalled();
      invalidateSpy.mockRestore();
    });

    it("does not fire haptic on partial hold failure", async () => {
      holdTicket
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error("fail"));
      const { haptic } = await import("$lib/utils/haptic.js");

      const bulk = make();
      await bulk.handleBulkHold();

      expect(haptic).not.toHaveBeenCalled();
    });

    it("stops at first failure in batch", async () => {
      holdTicket.mockRejectedValueOnce(new Error("first fails"));

      const { toastStore } = await import("$lib/stores/toast.svelte.js");
      const bulk = make();
      await bulk.handleBulkHold();

      expect(holdTicket).toHaveBeenCalledTimes(1);
      const showCall = vi.mocked(toastStore.show).mock.calls[0]!;
      const message = showCall[0] as string;
      expect(message).toContain("3 failed");
    });
  });
});
