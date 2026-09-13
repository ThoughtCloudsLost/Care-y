import { describe, it, expect } from "vitest";
import { createStubShiftProvider } from "./shift-provider.js";
import type { QueueId, UserId } from "@care-y/shared";

describe("StubShiftProvider", () => {
  const membersByQueue: Record<string, UserId[]> = {
    "queue-1": ["user-a" as UserId, "user-b" as UserId],
    "queue-2": ["user-c" as UserId],
  };

  const stub = createStubShiftProvider(async (queueId) => {
    return membersByQueue[queueId] ?? [];
  });

  it("getCurrentShiftVolunteers returns all queue members", async () => {
    expect(await stub.getCurrentShiftVolunteers("queue-1" as QueueId)).toEqual([
      "user-a",
      "user-b",
    ]);
  });

  it("getNextShiftVolunteers returns all queue members", async () => {
    expect(await stub.getNextShiftVolunteers("queue-2" as QueueId)).toEqual([
      "user-c",
    ]);
  });

  it("returns empty array when getQueueMembers returns empty", async () => {
    expect(
      await stub.getCurrentShiftVolunteers("nonexistent" as QueueId),
    ).toEqual([]);
    expect(await stub.getNextShiftVolunteers("nonexistent" as QueueId)).toEqual(
      [],
    );
  });
});
