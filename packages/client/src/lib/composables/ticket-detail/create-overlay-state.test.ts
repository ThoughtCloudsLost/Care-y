// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";
import {
  createDeleteConfirm,
  createNoteEdit,
} from "./create-overlay-state.svelte.js";

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn() },
}));

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

describe("createDeleteConfirm", () => {
  let qc: QueryClient;
  let deleteNoteMutate: Mock<(id: string) => Promise<unknown>>;
  let toastStore: { current: null; show: Mock; dismiss: Mock };

  beforeEach(() => {
    qc = makeQueryClient();
    deleteNoteMutate = vi
      .fn<(id: string) => Promise<unknown>>()
      .mockResolvedValue(undefined);
    toastStore = { current: null, show: vi.fn(), dismiss: vi.fn() };
  });

  function make(ticketId = "t-001") {
    return createDeleteConfirm({
      getTicketId: () => ticketId,
      queryClient: qc,
      toastStore,
      deleteNoteMutate,
      labels: { deleteError: "Could not delete" },
    });
  }

  it("starts closed with no target", () => {
    const dc = make();
    expect(dc.open).toBe(false);
    expect(dc.targetId).toBeNull();
  });

  it("openConfirm sets targetId and opens", () => {
    const dc = make();
    dc.openConfirm("fu-123");
    expect(dc.open).toBe(true);
    expect(dc.targetId).toBe("fu-123");
  });

  it("close resets open and targetId", () => {
    const dc = make();
    dc.openConfirm("fu-123");
    dc.close();
    expect(dc.open).toBe(false);
    expect(dc.targetId).toBeNull();
  });

  it("confirm calls deleteNoteMutate with the target id", async () => {
    const dc = make();
    dc.openConfirm("fu-456");
    await dc.confirm();
    expect(deleteNoteMutate).toHaveBeenCalledWith("fu-456");
  });

  it("confirm does nothing when targetId is null", async () => {
    const dc = make();
    await dc.confirm();
    expect(deleteNoteMutate).not.toHaveBeenCalled();
  });

  it("confirm optimistically removes the entry from cache", async () => {
    const ticketId = "t-opt";
    const followUpsKey = ["ticket", ticketId, "followUps", "initial"];
    qc.setQueryData(followUpsKey, [
      { id: "fu-1" },
      { id: "fu-2" },
      { id: "fu-3" },
    ]);

    const dc = make(ticketId);
    dc.openConfirm("fu-2");
    await dc.confirm();

    const cached = qc.getQueryData<{ id: string }[]>(followUpsKey);
    expect(cached?.map((fu) => fu.id)).toEqual(["fu-1", "fu-3"]);
  });

  it("rolls back cache on mutation failure and shows toast", async () => {
    const ticketId = "t-rollback";
    const followUpsKey = ["ticket", ticketId, "followUps", "initial"];
    qc.setQueryData(followUpsKey, [{ id: "fu-1" }, { id: "fu-2" }]);

    deleteNoteMutate.mockRejectedValueOnce(new Error("server error"));

    const dc = make(ticketId);
    dc.openConfirm("fu-1");
    await dc.confirm();

    const cached = qc.getQueryData<{ id: string }[]>(followUpsKey);
    expect(cached?.map((fu) => fu.id)).toEqual(["fu-1", "fu-2"]);
    expect(toastStore.show).toHaveBeenCalledWith("Could not delete");
  });
});

describe("createNoteEdit", () => {
  it("starts closed with no data", () => {
    const ne = createNoteEdit();
    expect(ne.sheetOpen).toBe(false);
    expect(ne.followUpId).toBeUndefined();
    expect(ne.content).toBeUndefined();
    expect(ne.noteTypeId).toBeUndefined();
  });

  it("open sets all fields and opens the sheet", () => {
    const ne = createNoteEdit();
    ne.open("fu-789", "note content", "nt-1");
    expect(ne.sheetOpen).toBe(true);
    expect(ne.followUpId).toBe("fu-789");
    expect(ne.content).toBe("note content");
    expect(ne.noteTypeId).toBe("nt-1");
  });

  it("open converts null noteTypeId to undefined", () => {
    const ne = createNoteEdit();
    ne.open("fu-789", "content", null);
    expect(ne.noteTypeId).toBeUndefined();
  });

  it("dismiss resets all fields", () => {
    const ne = createNoteEdit();
    ne.open("fu-789", "content", "nt-1");
    ne.dismiss();
    expect(ne.sheetOpen).toBe(false);
    expect(ne.followUpId).toBeUndefined();
    expect(ne.content).toBeUndefined();
    expect(ne.noteTypeId).toBeUndefined();
  });
});
