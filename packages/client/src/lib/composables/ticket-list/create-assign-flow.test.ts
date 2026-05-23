import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";
import { createAssignFlow } from "./create-assign-flow.svelte.js";

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn() },
}));
vi.mock("$lib/utils/haptic.js", () => ({ haptic: vi.fn() }));
vi.mock("$lib/paraglide/messages.js", () => ({
  ticket_toast_assigned: ({ name }: { name: string }) => `Assigned to ${name}`,
  ticket_toast_unassigned: () => "Unassigned",
  error_generic: () => "Error",
}));
vi.mock("$lib/terminology/with-terms.js", () => ({
  withTerms: (o?: Record<string, string>) => o ?? {},
}));

let lastOptimisticOpts: {
  mutate: () => Promise<unknown>;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
  update: (old: unknown) => unknown;
  queryKey: unknown[];
} | null = null;

vi.mock("$lib/utils/optimistic-mutation.js", () => ({
  optimisticMutation: vi.fn(
    async (opts: {
      mutate: () => Promise<unknown>;
      onSuccess?: () => void;
      onError?: (err: unknown) => void;
      update: (old: unknown) => unknown;
      queryKey: unknown[];
    }) => {
      lastOptimisticOpts = opts;
      await opts.mutate();
      opts.onSuccess?.();
    },
  ),
}));

const tickets = [
  { id: "t1", assignedTo: "user-1" },
  { id: "t2", assignedTo: null },
  { id: "t3", assignedTo: "user-2" },
];

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

describe("createAssignFlow", () => {
  let assignMutate: Mock<
    (ticketId: string, targetUserId: string | null) => Promise<unknown>
  >;
  let resolveVolunteerName: Mock<(userId: string) => string>;
  let qc: QueryClient;

  beforeEach(() => {
    lastOptimisticOpts = null;
    assignMutate = vi
      .fn<(id: string, uid: string | null) => Promise<unknown>>()
      .mockResolvedValue(undefined);
    resolveVolunteerName = vi
      .fn<(uid: string) => string>()
      .mockReturnValue("Alice");
    qc = makeQueryClient();
  });

  function make() {
    return createAssignFlow({
      queryClient: qc,
      getQueryKey: () => ["tickets", "list"],
      assignMutate,
      resolveVolunteerName,
      getTickets: () => tickets,
    });
  }

  describe("open", () => {
    it("sets sheet state from ticket lookup", () => {
      const flow = make();
      flow.open("t1");
      expect(flow.sheetOpen).toBe(true);
      expect(flow.targetTicketId).toBe("t1");
      expect(flow.currentAssigneeId).toBe("user-1");
    });

    it("sets null assignee for unassigned ticket", () => {
      const flow = make();
      flow.open("t2");
      expect(flow.currentAssigneeId).toBeNull();
    });

    it("sets null assignee for unknown ticket", () => {
      const flow = make();
      flow.open("nonexistent");
      expect(flow.currentAssigneeId).toBeNull();
    });
  });

  describe("handleAssign", () => {
    it("calls assignMutate with ticketId and targetUserId", async () => {
      const flow = make();
      await flow.handleAssign("t1", "user-3");
      expect(assignMutate).toHaveBeenCalledWith("t1", "user-3");
    });

    it("shows assigned toast with volunteer name on success", async () => {
      const { toastStore } = await import("$lib/stores/toast.svelte.js");
      const flow = make();
      await flow.handleAssign("t1", "user-3");
      expect(toastStore.show).toHaveBeenCalledWith("Assigned to Alice");
    });

    it("shows unassigned toast when targetUserId is null", async () => {
      const { toastStore } = await import("$lib/stores/toast.svelte.js");
      const flow = make();
      await flow.handleAssign("t1", null);
      expect(toastStore.show).toHaveBeenCalledWith("Unassigned");
    });

    it("shows error toast on mutation failure", async () => {
      const { optimisticMutation } =
        await import("$lib/utils/optimistic-mutation.js");
      (optimisticMutation as Mock).mockImplementationOnce(
        async (opts: {
          mutate: () => Promise<unknown>;
          onError?: (err: unknown) => void;
        }) => {
          try {
            await opts.mutate();
          } catch {
            opts.onError?.(new Error("net"));
            return;
          }
        },
      );
      assignMutate.mockRejectedValueOnce(new Error("net"));

      const { toastStore } = await import("$lib/stores/toast.svelte.js");
      const flow = make();
      await flow.handleAssign("t1", "user-3");
      expect(toastStore.show).toHaveBeenCalledWith("Error", 3000);
    });

    it("passes correct queryKey to optimistic mutation", async () => {
      const flow = make();
      await flow.handleAssign("t1", "user-3");
      expect(lastOptimisticOpts?.queryKey).toEqual(["tickets", "list"]);
    });

    it("optimistic update toggles assignedTo in cache", () => {
      make();
      // Trigger to populate lastOptimisticOpts
      void make().handleAssign("t1", "user-3");

      const old = {
        pages: [
          [
            { id: "t1", assignedTo: "user-1" },
            { id: "t2", assignedTo: null },
          ],
        ],
        pageParams: [undefined],
      };
      const updated = lastOptimisticOpts?.update(old) as typeof old;
      expect(updated.pages[0]?.[0]?.assignedTo).toBe("user-3");
      expect(updated.pages[0]?.[1]?.assignedTo).toBeNull();
    });
  });

  describe("dismiss", () => {
    it("resets all state", () => {
      const flow = make();
      flow.open("t1");
      flow.dismiss();
      expect(flow.sheetOpen).toBe(false);
      expect(flow.targetTicketId).toBe("");
      expect(flow.currentAssigneeId).toBeNull();
    });
  });
});
