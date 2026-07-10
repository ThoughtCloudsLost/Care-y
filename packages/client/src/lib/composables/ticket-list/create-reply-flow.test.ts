import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";
import { createReplyFlow } from "./create-reply-flow.svelte.js";

const tickets = [
  { id: "t1", clientAlias: "Alice", followUpCount: 3 },
  { id: "t2", clientAlias: "Bob", followUpCount: 0 },
];

const previewData = [
  {
    id: "fu-1",
    source: "volunteer",
    type: "message",
    encryptedContent: "",
    keyWrap: null,
    createdAt: "2026-01-01",
    hasRecording: false,
    hasImage: false,
    hasFile: false,
    noteTypeId: null,
  },
];

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

describe("createReplyFlow", () => {
  let qc: QueryClient;
  let getPreviewFollowUps: Mock;
  let eagerLoadPreviews: Mock;

  beforeEach(() => {
    qc = makeQueryClient();
    getPreviewFollowUps = vi.fn().mockReturnValue(previewData);
    eagerLoadPreviews = vi.fn().mockResolvedValue(undefined);
  });

  function make() {
    return createReplyFlow({
      queryClient: qc,
      getTickets: () => tickets,
      getPreviewFollowUps,
      eagerLoadPreviews,
    });
  }

  describe("initial state", () => {
    it("starts closed with empty values", () => {
      const flow = make();
      expect(flow.sheetOpen).toBe(false);
      expect(flow.targetTicketId).toBe("");
      expect(flow.clientAlias).toBe("");
      expect(flow.previewFollowUps).toBeUndefined();
      expect(flow.followUpCount).toBe(0);
    });
  });

  describe("open", () => {
    it("populates all 5 state vars from ticket data", () => {
      const flow = make();
      flow.open("t1");
      expect(flow.sheetOpen).toBe(true);
      expect(flow.targetTicketId).toBe("t1");
      expect(flow.clientAlias).toBe("Alice");
      expect(flow.previewFollowUps).toBe(previewData);
      expect(flow.followUpCount).toBe(3);
    });

    it("calls getPreviewFollowUps with ticketId", () => {
      const flow = make();
      flow.open("t1");
      expect(getPreviewFollowUps).toHaveBeenCalledWith("t1");
    });

    it("does nothing for unknown ticket", () => {
      const flow = make();
      flow.open("nonexistent");
      expect(flow.sheetOpen).toBe(false);
    });

    it("sets zero followUpCount for new ticket", () => {
      const flow = make();
      flow.open("t2");
      expect(flow.followUpCount).toBe(0);
      expect(flow.clientAlias).toBe("Bob");
    });
  });

  describe("handleReplySent", () => {
    it("closes the sheet", () => {
      const flow = make();
      flow.open("t1");
      flow.handleReplySent("t1");
      expect(flow.sheetOpen).toBe(false);
    });

    it("triggers eager load for the ticket", () => {
      const flow = make();
      flow.handleReplySent("t1");
      expect(eagerLoadPreviews).toHaveBeenCalledWith(["t1"]);
    });

    it("invalidates the list and both read-state families", () => {
      const spy = vi.spyOn(qc, "invalidateQueries");
      const flow = make();
      flow.handleReplySent("t1");

      expect(spy).toHaveBeenCalledWith({ queryKey: ["tickets", "list"] });
      expect(spy).toHaveBeenCalledWith({ queryKey: ["tickets", "readState"] });
      expect(spy).toHaveBeenCalledWith({
        queryKey: ["tickets", "readStateSweep"],
      });
      spy.mockRestore();
    });
  });

  describe("dismiss", () => {
    it("resets all state", () => {
      const flow = make();
      flow.open("t1");
      flow.dismiss();
      expect(flow.sheetOpen).toBe(false);
      expect(flow.targetTicketId).toBe("");
      expect(flow.clientAlias).toBe("");
      expect(flow.previewFollowUps).toBeUndefined();
      expect(flow.followUpCount).toBe(0);
    });
  });
});
