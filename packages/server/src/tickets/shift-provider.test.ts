import { describe, it, expect } from "vitest";
import { createStubShiftProvider } from "./shift-provider.js";

describe("StubShiftProvider", () => {
  const membersByQueue: Record<string, string[]> = {
    "queue-1": ["user-a", "user-b"],
    "queue-2": ["user-c"],
  };

  const stub = createStubShiftProvider(async (queueId) => {
    return membersByQueue[queueId] ?? [];
  });

  it("getCurrentShiftVolunteers returns all queue members", async () => {
    expect(await stub.getCurrentShiftVolunteers("queue-1")).toEqual([
      "user-a",
      "user-b",
    ]);
  });

  it("getNextShiftVolunteers returns all queue members", async () => {
    expect(await stub.getNextShiftVolunteers("queue-2")).toEqual(["user-c"]);
  });

  it("returns empty array when getQueueMembers returns empty", async () => {
    expect(await stub.getCurrentShiftVolunteers("nonexistent")).toEqual([]);
    expect(await stub.getNextShiftVolunteers("nonexistent")).toEqual([]);
  });
});
