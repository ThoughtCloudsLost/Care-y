import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";
import { SvelteSet } from "svelte/reactivity";
import { createBulkActions } from "./create-bulk-actions.svelte.js";

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn() },
}));
vi.mock("$lib/utils/haptic.js", () => ({ haptic: vi.fn() }));
vi.mock("$lib/paraglide/messages.js", () => ({
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

  beforeEach(() => {
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
  });
});
