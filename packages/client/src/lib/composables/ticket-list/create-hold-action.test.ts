import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";
import { ClientError } from "$lib/errors.js";
import { ErrorCode } from "@care-y/shared";
import { createHoldAction } from "./create-hold-action.svelte.js";
import type * as ToastNS from "$lib/stores/toast.svelte.js";
import type * as HapticNS from "$lib/utils/haptic.js";
import type * as MessagesNS from "$lib/paraglide/messages.js";
import type * as WithTermsNS from "$lib/terminology/with-terms.js";
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
  ticket_toast_held: () => "Held",
  ticket_toast_unheld: () => "Unheld",
  error_generic: () => "Error",
  error_insufficient_permissions: () => "No permission",
}));
vi.mock("$lib/terminology/with-terms.js", async (importOriginal) =>
  (await import("$mocks/with-terms.js")).withTermsMock(
    await importOriginal<typeof WithTermsNS>(),
  ),
);

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

interface Paged {
  pages: { id: string; onHold: boolean }[][];
  pageParams: unknown[];
}

// Two lists holding the same ticket, as two dashboard lanes do.
const LANE_A = ticketsKeys.list({ lane: "a" });
const LANE_B = ticketsKeys.list({ lane: "b" });

function seed(qc: QueryClient): void {
  qc.setQueryData<Paged>(LANE_A, {
    pages: [[{ id: "t1", onHold: false }]],
    pageParams: [undefined],
  });
  qc.setQueryData<Paged>(LANE_B, {
    pages: [[{ id: "t2", onHold: false }], [{ id: "t1", onHold: false }]],
    pageParams: [undefined, "t2"],
  });
}

function heldIn(qc: QueryClient, key: readonly unknown[]): string[] {
  return (qc.getQueryData<Paged>(key)?.pages.flat() ?? [])
    .filter((t) => t.onHold)
    .map((t) => t.id);
}

describe("createHoldAction", () => {
  let holdMutate: Mock<(ticketId: string, onHold: boolean) => Promise<unknown>>;
  let qc: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    holdMutate = vi
      .fn<(id: string, onHold: boolean) => Promise<unknown>>()
      .mockResolvedValue(undefined);
    qc = makeQueryClient();
    seed(qc);
  });

  function make() {
    return createHoldAction({ queryClient: qc, holdMutate });
  }

  it("holds the ticket in every cached list at once", async () => {
    // Observe the lists mid-mutation: the optimistic write lands before
    // the server answers.
    let seenDuringMutate: string[][] = [];
    holdMutate.mockImplementationOnce(async () => {
      seenDuringMutate = [heldIn(qc, LANE_A), heldIn(qc, LANE_B)];
      return undefined;
    });

    await make().handleHold("t1", false);

    expect(seenDuringMutate).toEqual([["t1"], ["t1"]]);
  });

  it("rolls every list back when the server refuses", async () => {
    holdMutate.mockRejectedValueOnce(new ClientError("network"));

    await make().handleHold("t1", false);

    expect(heldIn(qc, LANE_A)).toEqual([]);
    expect(heldIn(qc, LANE_B)).toEqual([]);
  });

  it("invalidates the lists and the facet index on success", async () => {
    const invalidate = vi.spyOn(qc, "invalidateQueries");

    await make().handleHold("t1", false);

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ticketsKeys.lists() });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ticketsKeys.facetIndex(),
    });
  });

  it("calls holdMutate with ticketId and toggled onHold value", async () => {
    const action = make();
    await action.handleHold("t1", false);
    expect(holdMutate).toHaveBeenCalledWith("t1", true);

    holdMutate.mockClear();
    await action.handleHold("t2", true);
    expect(holdMutate).toHaveBeenCalledWith("t2", false);
  });

  it("prevents double-tap while a hold is pending", async () => {
    let resolveFirst: () => void = () => undefined;
    holdMutate.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = () => {
            resolve(undefined);
          };
        }),
    );

    const action = make();
    const first = action.handleHold("t1", false);
    const second = action.handleHold("t1", false);

    resolveFirst();
    await first;
    await second;

    expect(holdMutate).toHaveBeenCalledTimes(1);
  });

  it("clears pending state after success", async () => {
    const action = make();
    expect(action.isPending("t1")).toBe(false);

    await action.handleHold("t1", false);

    expect(action.isPending("t1")).toBe(false);
  });

  it("clears pending state after failure", async () => {
    holdMutate.mockRejectedValueOnce(new ClientError("network"));

    const action = make();
    await action.handleHold("t1", false);

    expect(action.isPending("t1")).toBe(false);
  });

  it("shows held toast on success when placing on hold", async () => {
    const { toastStore } = await import("$lib/stores/toast.svelte.js");
    await make().handleHold("t1", false);

    expect(toastStore.show).toHaveBeenCalledWith("Held");
  });

  it("shows unheld toast on success when removing hold", async () => {
    const { toastStore } = await import("$lib/stores/toast.svelte.js");
    await make().handleHold("t1", true);

    expect(toastStore.show).toHaveBeenCalledWith("Unheld");
  });

  it("shows error toast on error", async () => {
    holdMutate.mockRejectedValueOnce(new ClientError("network"));
    const { toastStore } = await import("$lib/stores/toast.svelte.js");

    await make().handleHold("t1", false);

    expect(toastStore.show).toHaveBeenCalledWith("Error", 3000);
  });

  it("shows the permission message when the server refuses the hold", async () => {
    holdMutate.mockRejectedValueOnce(
      new Error(ErrorCode.INSUFFICIENT_PERMISSIONS),
    );
    const { toastStore } = await import("$lib/stores/toast.svelte.js");

    await make().handleHold("t1", false);

    expect(toastStore.show).toHaveBeenCalledWith("No permission", 3000);
  });
});
