import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";
import { ErrorCode } from "@care-y/shared";
import { createAssignFlow } from "./create-assign-flow.svelte.js";
import type * as WithTermsNS from "$lib/terminology/with-terms.js";
import type * as HapticNS from "$lib/utils/haptic.js";
import type * as ToastNS from "$lib/stores/toast.svelte.js";
import type * as MessagesNS from "$lib/paraglide/messages.js";
import { ticketsKeys } from "$lib/query/keys.js";

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
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesNS>()),
  ticket_toast_assigned: ({ name }: { name: string }) => `Assigned to ${name}`,
  ticket_toast_unassigned: () => "Unassigned",
  error_generic: () => "Error",
  error_insufficient_permissions: () => "No permission",
}));
vi.mock("$lib/terminology/with-terms.js", async (importOriginal) =>
  (await import("$mocks/with-terms.js")).withTermsMock(
    await importOriginal<typeof WithTermsNS>(),
  ),
);

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
      assignMutate.mockRejectedValueOnce(new Error("net"));

      const { toastStore } = await import("$lib/stores/toast.svelte.js");
      const flow = make();
      await flow.handleAssign("t1", "user-3");
      expect(toastStore.show).toHaveBeenCalledWith("Error", 3000);
    });

    it("shows the permission message when the server refuses the assignment", async () => {
      assignMutate.mockRejectedValueOnce(
        new Error(ErrorCode.INSUFFICIENT_PERMISSIONS),
      );

      const { toastStore } = await import("$lib/stores/toast.svelte.js");
      const flow = make();
      await flow.handleAssign("t1", "user-3");
      expect(toastStore.show).toHaveBeenCalledWith("No permission", 3000);
    });

    describe("cached lists", () => {
      interface Paged {
        pages: { id: string; assignedTo: string | null }[][];
        pageParams: unknown[];
      }

      // Two lists holding the same ticket, as two dashboard lanes do.
      const LANE_A = ticketsKeys.list({ lane: "a" });
      const LANE_B = ticketsKeys.list({ lane: "b" });

      function assigneeIn(key: readonly unknown[]): (string | null)[] {
        return (qc.getQueryData<Paged>(key)?.pages.flat() ?? [])
          .filter((t) => t.id === "t1")
          .map((t) => t.assignedTo);
      }

      beforeEach(() => {
        qc.setQueryData<Paged>(LANE_A, {
          pages: [[{ id: "t1", assignedTo: "user-1" }]],
          pageParams: [undefined],
        });
        qc.setQueryData<Paged>(LANE_B, {
          pages: [
            [{ id: "t2", assignedTo: null }],
            [{ id: "t1", assignedTo: "user-1" }],
          ],
          pageParams: [undefined, "t2"],
        });
      });

      it("reassigns the ticket in every cached list at once", async () => {
        let seenDuringMutate: (string | null)[][] = [];
        assignMutate.mockImplementationOnce(async () => {
          seenDuringMutate = [assigneeIn(LANE_A), assigneeIn(LANE_B)];
          return undefined;
        });

        await make().handleAssign("t1", "user-3");

        expect(seenDuringMutate).toEqual([["user-3"], ["user-3"]]);
      });

      it("rolls every list back when the server refuses", async () => {
        assignMutate.mockRejectedValueOnce(new Error("net"));

        await make().handleAssign("t1", "user-3");

        expect(assigneeIn(LANE_A)).toEqual(["user-1"]);
        expect(assigneeIn(LANE_B)).toEqual(["user-1"]);
      });

      it("invalidates the lists and the facet index on success", async () => {
        const invalidate = vi.spyOn(qc, "invalidateQueries");

        await make().handleAssign("t1", null);

        expect(invalidate).toHaveBeenCalledWith({
          queryKey: ticketsKeys.lists(),
        });
        expect(invalidate).toHaveBeenCalledWith({
          queryKey: ticketsKeys.facetIndex(),
        });
      });
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
