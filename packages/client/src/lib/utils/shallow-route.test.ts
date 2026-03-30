import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPushState = vi.fn();

vi.mock("$app/navigation", () => ({
  pushState: mockPushState,
}));

const { openModal } = await import("./shallow-route.js");

beforeEach(() => {
  mockPushState.mockClear();
});

describe("openModal", () => {
  it("calls pushState with the state key set to true", () => {
    openModal("showDetail");

    expect(mockPushState).toHaveBeenCalledWith("", { showDetail: true });
  });

  it("merges additional data into the state", () => {
    openModal("showDetail", { ticketId: "abc-123" });

    expect(mockPushState).toHaveBeenCalledWith("", {
      showDetail: true,
      ticketId: "abc-123",
    });
  });
});
