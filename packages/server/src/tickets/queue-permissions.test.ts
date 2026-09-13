import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  createTestQueue,
  seedOrgPublicKey,
  type TestDb,
} from "../test-utils.js";
import {
  createQueuePermissionsService,
  type QueuePermissionsService,
} from "./queue-permissions.js";
import type { UserId, QueueId } from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)(
  "QueuePermissionsService (DB)",
  () => {
    let testDb: TestDb;
    let svc: QueuePermissionsService;
    let userA: UserId;
    let userB: UserId;
    let queueA: QueueId;
    let queueB: QueueId;

    beforeAll(async () => {
      testDb = await createTestDb();
      await seedOrgPublicKey(testDb.db);
      svc = createQueuePermissionsService(testDb.db);

      const uA = await createTestUser(testDb.db);
      const uB = await createTestUser(testDb.db);
      userA = uA.id;
      userB = uB.id;

      const qA = await createTestQueue(testDb.db);
      const qB = await createTestQueue(testDb.db);
      queueA = qA.id;
      queueB = qB.id;
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("getUserQueues returns empty array for unassigned user", async () => {
      expect(await svc.getUserQueues(userA)).toEqual([]);
    });

    it("addMember assigns user to queue", async () => {
      await svc.addMember(queueA, userA);
      expect(await svc.isMember(userA, queueA)).toBe(true);
    });

    it("addMember is idempotent (calling twice does not throw)", async () => {
      await svc.addMember(queueA, userA);
      await svc.addMember(queueA, userA);
      expect(await svc.isMember(userA, queueA)).toBe(true);
    });

    it("getUserQueues returns correct queue IDs for multi-queue user", async () => {
      await svc.addMember(queueB, userA);
      const queues = await svc.getUserQueues(userA);
      expect(queues).toContain(queueA);
      expect(queues).toContain(queueB);
      expect(queues).toHaveLength(2);
    });

    it("isMember returns false for non-member", async () => {
      expect(await svc.isMember(userB, queueA)).toBe(false);
    });

    it("getQueueMembers returns all members of a queue", async () => {
      await svc.addMember(queueA, userB);
      const members = await svc.getQueueMembers(queueA);
      expect(members).toContain(userA);
      expect(members).toContain(userB);
      expect(members).toHaveLength(2);
    });

    it("removeMember removes a user from the queue", async () => {
      await svc.removeMember(queueA, userB);
      expect(await svc.isMember(userB, queueA)).toBe(false);
    });

    it("removeMember is idempotent (removing non-member does not throw)", async () => {
      await svc.removeMember(queueA, userB);
      await svc.removeMember(queueA, userB);
      expect(await svc.isMember(userB, queueA)).toBe(false);
    });

    it("removing from one queue does not affect membership in another", async () => {
      await svc.addMember(queueA, userB);
      await svc.addMember(queueB, userB);
      await svc.removeMember(queueA, userB);
      expect(await svc.isMember(userB, queueA)).toBe(false);
      expect(await svc.isMember(userB, queueB)).toBe(true);
    });

    it("listAllAssignments returns all queue-user pairs", async () => {
      await svc.addMember(queueA, userA);
      await svc.addMember(queueA, userB);
      const all = await svc.listAllAssignments();
      const forQueueA = all.filter((a) => a.queueId === queueA);
      expect(forQueueA.length).toBeGreaterThanOrEqual(2);
      expect(forQueueA.map((a) => a.userId)).toContain(userA);
      expect(forQueueA.map((a) => a.userId)).toContain(userB);
    });

    it("listAllAssignments returns entries for all queues", async () => {
      const all = await svc.listAllAssignments();
      const queueIds = new Set(all.map((a) => a.queueId));
      expect(queueIds.has(queueA)).toBe(true);
      expect(queueIds.has(queueB)).toBe(true);
    });
  },
);
