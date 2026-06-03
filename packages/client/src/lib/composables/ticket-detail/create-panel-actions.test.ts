import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { createPanelActions } from "./create-panel-actions.svelte.js";

vi.mock("$lib/paraglide/messages.js", () => ({
  error_generic: () => "Error",
}));

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn() },
}));

describe("createPanelActions", () => {
  let takeMutate: Mock<(id: string) => Promise<unknown>>;
  let releaseMutate: Mock<(id: string) => Promise<unknown>>;
  let updateMutate: Mock<
    (args: { ticketId: string; onHold: boolean }) => Promise<unknown>
  >;
  let reopenMutate: Mock<
    (args: { ticketId: string; newKeyGeneration: string }) => Promise<unknown>
  >;
  let watchMutate: Mock<(id: string) => Promise<unknown>>;
  let unwatchMutate: Mock<(id: string) => Promise<unknown>>;
  let onclose: Mock;
  let oncall: Mock;
  let onassign: Mock;
  let toastStore: { show: Mock; current: null; dismiss: Mock };

  beforeEach(() => {
    takeMutate = vi.fn().mockResolvedValue(undefined);
    releaseMutate = vi.fn().mockResolvedValue(undefined);
    updateMutate = vi.fn().mockResolvedValue(undefined);
    reopenMutate = vi.fn().mockResolvedValue(undefined);
    watchMutate = vi.fn().mockResolvedValue(undefined);
    unwatchMutate = vi.fn().mockResolvedValue(undefined);
    onclose = vi.fn();
    oncall = vi.fn();
    onassign = vi.fn();
    toastStore = { show: vi.fn(), current: null, dismiss: vi.fn() };
  });

  function make(ticketId = "t-001") {
    return createPanelActions({
      getTicketId: () => ticketId,
      toastStore,
      takeMutate,
      releaseMutate,
      updateMutate,
      reopenMutate,
      watchMutate,
      unwatchMutate,
      onclose,
      oncall,
      onassign,
    });
  }

  it("dispatches call to oncall callback", () => {
    make().dispatch("call");
    expect(oncall).toHaveBeenCalledOnce();
  });

  it("dispatches take mutation with ticketId", () => {
    make("t-42").dispatch("take");
    expect(takeMutate).toHaveBeenCalledWith("t-42");
  });

  it("dispatches release mutation with ticketId", () => {
    make().dispatch("release");
    expect(releaseMutate).toHaveBeenCalledWith("t-001");
  });

  it("dispatches assign to onassign callback", () => {
    make().dispatch("assign");
    expect(onassign).toHaveBeenCalledOnce();
  });

  it("dispatches hold mutation with onHold true", () => {
    make().dispatch("hold");
    expect(updateMutate).toHaveBeenCalledWith({
      ticketId: "t-001",
      onHold: true,
    });
  });

  it("dispatches unhold mutation with onHold false", () => {
    make().dispatch("unhold");
    expect(updateMutate).toHaveBeenCalledWith({
      ticketId: "t-001",
      onHold: false,
    });
  });

  it("dispatches close to onclose callback", () => {
    make().dispatch("close");
    expect(onclose).toHaveBeenCalledOnce();
  });

  it("dispatches reopen mutation with new key generation", () => {
    make().dispatch("reopen");
    expect(reopenMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: "t-001",
        newKeyGeneration: expect.any(String),
      }),
    );
  });

  it("dispatches watch mutation", () => {
    make().dispatch("watch");
    expect(watchMutate).toHaveBeenCalledWith("t-001");
  });

  it("dispatches unwatch mutation", () => {
    make().dispatch("unwatch");
    expect(unwatchMutate).toHaveBeenCalledWith("t-001");
  });

  it("cancel is a no-op", () => {
    make().dispatch("cancel");
    expect(takeMutate).not.toHaveBeenCalled();
    expect(onclose).not.toHaveBeenCalled();
    expect(oncall).not.toHaveBeenCalled();
  });

  it("shows toast on mutation failure", async () => {
    takeMutate.mockRejectedValueOnce(new Error("network"));
    make().dispatch("take");
    await vi.waitFor(() => {
      expect(toastStore.show).toHaveBeenCalledWith("Error", 3000);
    });
  });
});
