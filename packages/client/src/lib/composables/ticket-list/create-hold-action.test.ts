import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";
import { ClientError } from "$lib/errors.js";
import { createHoldAction } from "./create-hold-action.svelte.js";

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn() },
}));
vi.mock("$lib/utils/haptic.js", () => ({ haptic: vi.fn() }));
vi.mock("$lib/paraglide/messages.js", () => ({
  ticket_toast_held: () => "Held",
  ticket_toast_unheld: () => "Unheld",
  error_generic: () => "Error",
}));
vi.mock("$lib/terminology/with-terms.js", () => ({
  withTerms: (o?: Record<string, string>) => o ?? {},
}));

let lastOptimisticOpts: Record<string, unknown> = {};
vi.mock("$lib/utils/optimistic-mutation.js", () => ({
  optimisticMutation: vi.fn(async (opts: Record<string, unknown>) => {
    lastOptimisticOpts = opts;
    await (opts.mutate as () => Promise<unknown>)();
    (opts.onSuccess as () => void)();
  }),
}));

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

describe("createHoldAction", () => {
  let holdMutate: Mock<(ticketId: string, onHold: boolean) => Promise<unknown>>;
  let qc: QueryClient;
  const queryKey = ["tickets", "list", { status: "open" }];

  beforeEach(() => {
    vi.clearAllMocks();
    lastOptimisticOpts = {};
    holdMutate = vi
      .fn<(id: string, onHold: boolean) => Promise<unknown>>()
      .mockResolvedValue(undefined);
    qc = makeQueryClient();
  });

  function make() {
    return createHoldAction({
      queryClient: qc,
      getQueryKey: () => queryKey,
      holdMutate,
    });
  }

  it("calls optimisticMutation with correct queryKey from deps", async () => {
    const { optimisticMutation } =
      await import("$lib/utils/optimistic-mutation.js");
    const action = make();
    await action.handleHold("t1", false);

    expect(optimisticMutation).toHaveBeenCalledOnce();
    expect(lastOptimisticOpts.queryKey).toEqual(queryKey);
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
    let resolveFirst: () => void;
    const firstPromise = new Promise<void>((r) => {
      resolveFirst = r;
    });
    holdMutate.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = () => {
            resolve(undefined);
          };
        }),
    );

    // Suppress unhandled rejection from the deferred promise
    void firstPromise.catch(() => undefined);

    const action = make();
    const first = action.handleHold("t1", false);
    const second = action.handleHold("t1", false);

    resolveFirst!();
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
    const { optimisticMutation } =
      await import("$lib/utils/optimistic-mutation.js");
    (optimisticMutation as Mock).mockImplementationOnce(
      async (opts: Record<string, unknown>) => {
        lastOptimisticOpts = opts;
        await (opts.mutate as () => Promise<unknown>)();
        throw new ClientError("network");
      },
    );

    const action = make();
    await action.handleHold("t1", false).catch(() => undefined);

    expect(action.isPending("t1")).toBe(false);
  });

  it("shows held toast on success when placing on hold", async () => {
    const { toastStore } = await import("$lib/stores/toast.svelte.js");
    const action = make();
    await action.handleHold("t1", false);

    expect(toastStore.show).toHaveBeenCalledWith("Held");
  });

  it("shows unheld toast on success when removing hold", async () => {
    const { toastStore } = await import("$lib/stores/toast.svelte.js");
    const action = make();
    await action.handleHold("t1", true);

    expect(toastStore.show).toHaveBeenCalledWith("Unheld");
  });

  it("shows error toast on error", async () => {
    const { optimisticMutation } =
      await import("$lib/utils/optimistic-mutation.js");
    (optimisticMutation as Mock).mockImplementationOnce(
      async (opts: Record<string, unknown>) => {
        lastOptimisticOpts = opts;
        await (opts.mutate as () => Promise<unknown>)();
        (opts.onError as (err: unknown) => void)(new ClientError("network"));
      },
    );
    const { toastStore } = await import("$lib/stores/toast.svelte.js");

    const action = make();
    await action.handleHold("t1", false);

    expect(toastStore.show).toHaveBeenCalledWith("Error", 3000);
  });
});
