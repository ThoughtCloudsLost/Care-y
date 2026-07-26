import { describe, it, expect, beforeEach } from "vitest";
import {
  trpc,
  demoTrpcMock,
  demoResetTrpc,
  isDevDelayEnabled,
  setDevDelay,
} from "./trpc.js";

describe("trpc mock", () => {
  beforeEach(() => {
    demoResetTrpc();
  });

  describe("auth.me.query", () => {
    it("returns a user with expected shape", async () => {
      const result = await demoTrpcMock.auth.me.query();
      expect(result.user.id).toBe("demo-user-001");
      expect(result.user.encryptedDisplayName).toBeDefined();
      expect(result.user.roleId).toBe("demo-role-001");
    });
  });

  describe("auth.listUsers.query", () => {
    it("returns an array of users", async () => {
      const result = await demoTrpcMock.auth.listUsers.query();
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0]?.id).toBe("demo-user-001");
    });
  });

  describe("tickets.myQueues.query", () => {
    it("returns real queues from DEMO_QUEUES", async () => {
      const result = await demoTrpcMock.tickets.myQueues.query();
      expect(result.length).toBe(3);
      const ids = result.map((q) => q.id);
      expect(ids).toContain("q-housing");
      expect(ids).toContain("q-intake");
      expect(ids).toContain("q-crisis");
    });

    it("returns queue records with encrypted name and counts", async () => {
      const result = await demoTrpcMock.tickets.myQueues.query();
      const first = result[0];
      expect(first).toBeDefined();
      if (first !== undefined) {
        expect(first.encryptedName).toBeDefined();
        expect(typeof first.openCount).toBe("string");
        expect(typeof first.sortOrder).toBe("number");
      }
    });
  });

  describe("tickets.listQueues.query", () => {
    it("returns same queues as myQueues", async () => {
      const result = await demoTrpcMock.tickets.listQueues.query();
      expect(result.length).toBe(3);
    });
  });

  describe("tickets.list.query", () => {
    it("returns a flat array of TicketLikeRecord items", async () => {
      const result = await demoTrpcMock.tickets.list.query({ limit: 3 });
      expect(result.length).toBe(3);
      const first = result[0];
      expect(first).toBeDefined();
      if (first !== undefined) {
        expect(first).toHaveProperty("id");
        expect(first).toHaveProperty("encryptedQueueName");
        expect(first).toHaveProperty("encryptedTitle");
        expect(first).toHaveProperty("hasPhone");
        expect(first).toHaveProperty("encryptedDescription");
      }
    });

    it("returns all items without limit", async () => {
      const result = await demoTrpcMock.tickets.list.query();
      expect(result.length).toBeGreaterThanOrEqual(5);
    });

    it("supports cursor-based pagination", async () => {
      const firstPage = await demoTrpcMock.tickets.list.query({ limit: 2 });
      expect(firstPage.length).toBe(2);
      const secondId = firstPage[1]?.id;
      expect(secondId).toBeDefined();
      if (secondId !== undefined) {
        const secondPage = await demoTrpcMock.tickets.list.query({
          limit: 2,
          cursor: secondId,
        });
        expect(secondPage[0]?.id).not.toBe(secondId);
      }
    });

    it("filters by statuses", async () => {
      const open = await demoTrpcMock.tickets.list.query({
        statuses: ["open"],
      });
      for (const t of open) {
        expect(t.status).toBe("open");
      }
    });

    it("filters by queueIds", async () => {
      const housing = await demoTrpcMock.tickets.list.query({
        queueIds: ["q-housing"],
      });
      for (const t of housing) {
        expect(t.queueId).toBe("q-housing");
      }
      expect(housing.length).toBeGreaterThan(0);
    });

    it("filters by priorities", async () => {
      const urgent = await demoTrpcMock.tickets.list.query({
        priorities: ["urgent"],
      });
      for (const t of urgent) {
        expect(t.priority).toBe("urgent");
      }
    });

    it("filters by assignedTo", async () => {
      const mine = await demoTrpcMock.tickets.list.query({
        assignedTo: "demo-user-001",
      });
      for (const t of mine) {
        expect(t.assignedTo).toBe("demo-user-001");
      }
      expect(mine.length).toBeGreaterThan(0);
    });

    it("filters unassigned with assignedTo null", async () => {
      const unassigned = await demoTrpcMock.tickets.list.query({
        assignedTo: null,
      });
      for (const t of unassigned) {
        expect(t.assignedTo).toBeNull();
      }
      expect(unassigned.length).toBeGreaterThan(0);
    });
  });

  describe("tickets.get.query", () => {
    it("returns a ticket by ID with hasPhone and encryptedDescription", async () => {
      const allResult = await demoTrpcMock.tickets.list.query();
      const firstId = allResult[0]?.id;
      expect(firstId).toBeDefined();
      if (firstId === undefined) return;

      const ticket = await demoTrpcMock.tickets.get.query({
        ticketId: firstId,
      });
      expect(ticket.id).toBe(firstId);
      expect(ticket.hasPhone).toBe(true);
      expect(typeof ticket.encryptedDescription).toBe("string");
    });

    it("throws DemoStubError for unknown ticket ID", async () => {
      await expect(
        demoTrpcMock.tickets.get.query({ ticketId: "nonexistent" }),
      ).rejects.toThrow("not implemented");
    });
  });

  describe("tickets.counts.query", () => {
    it("returns counts with expected shape", async () => {
      const counts = await demoTrpcMock.tickets.counts.query();
      expect(typeof counts.total).toBe("number");
      expect(typeof counts.new).toBe("number");
      expect(typeof counts.active).toBe("number");
      expect(typeof counts.closed).toBe("number");
      expect(typeof counts.onHold).toBe("number");
      expect(typeof counts.unassigned).toBe("number");
      expect(typeof counts.mine).toBe("number");
      expect(typeof counts.byPriority.low).toBe("number");
      expect(typeof counts.byPriority.normal).toBe("number");
      expect(typeof counts.byPriority.high).toBe("number");
      expect(typeof counts.byPriority.urgent).toBe("number");
    });

    it("total equals the sum of all tickets", async () => {
      const counts = await demoTrpcMock.tickets.counts.query();
      expect(counts.total).toBe(10);
    });
  });

  describe("tickets.noteTypes", () => {
    it("noteTypes.listActive returns types array", async () => {
      const result = await demoTrpcMock.tickets.noteTypes.listActive.query();
      expect(result.types.length).toBeGreaterThan(0);
      expect(result.defaultNoteTypeId).toBeNull();
      const first = result.types[0];
      if (first !== undefined) {
        expect(first).toHaveProperty("id");
        expect(first).toHaveProperty("encryptedIcon");
        expect(first).toHaveProperty("encryptedName");
      }
    });

    it("noteTypes.list returns same shape", async () => {
      const result = await demoTrpcMock.tickets.noteTypes.list.query();
      expect(result.types.length).toBeGreaterThan(0);
    });
  });

  describe("tickets.listFollowUps.query", () => {
    it("returns follow-ups for a known ticket", async () => {
      const allTickets = await demoTrpcMock.tickets.list.query();
      const firstId = allTickets[0]?.id;
      expect(firstId).toBeDefined();
      if (firstId === undefined) return;

      const result = await demoTrpcMock.tickets.listFollowUps.query({
        ticketId: firstId,
      });
      expect(result.followUps.length).toBeGreaterThan(0);
      expect(result).toHaveProperty("reactions");
    });

    it("returns empty for unknown ticket", async () => {
      const result = await demoTrpcMock.tickets.listFollowUps.query({
        ticketId: "nonexistent",
      });
      expect(result.followUps).toEqual([]);
    });
  });

  describe("tickets.listVolunteers.query", () => {
    it("returns volunteer list", async () => {
      const result = await demoTrpcMock.tickets.listVolunteers.query();
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("tickets.listParticipants.query", () => {
    it("returns participant list", async () => {
      const result = await demoTrpcMock.tickets.listParticipants.query({
        ticketId: "any",
      });
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("tickets.contentSearch.query", () => {
    it("returns followups and total", async () => {
      const result = await demoTrpcMock.tickets.contentSearch.query({
        ticketIds: ["search-e-001"],
        page: 0,
        pageSize: 10,
      });
      expect(result).toHaveProperty("followups");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.followups)).toBe(true);
    });

    it("followup items have correct field names", async () => {
      const result = await demoTrpcMock.tickets.contentSearch.query({
        ticketIds: ["search-e-001"],
        page: 0,
        pageSize: 10,
      });
      if (result.followups.length > 0) {
        const first = result.followups[0];
        expect(first).toHaveProperty("ticketId");
        expect(first).toHaveProperty("followupId");
        expect(first).toHaveProperty("encryptedContent");
        // No keyWrap on the contentSearch response (provider does not expect it)
        expect(first).not.toHaveProperty("keyWrap");
      }
    });

    it("respects AbortSignal", async () => {
      const controller = new AbortController();
      controller.abort();

      await expect(
        demoTrpcMock.tickets.contentSearch.query(
          { ticketIds: ["search-e-001"], page: 0, pageSize: 10 },
          { signal: controller.signal },
        ),
      ).rejects.toThrow();
    });
  });

  describe("benign endpoint stubs", () => {
    it("isWatching returns false", async () => {
      const result = await demoTrpcMock.tickets.isWatching.query({
        ticketId: "any",
      });
      expect(result).toBe(false);
    });

    it("getReactions returns empty object", async () => {
      const result = await demoTrpcMock.tickets.getReactions.query({
        followUpIds: [],
      });
      expect(result).toEqual({});
    });

    it("listAttachments returns empty array", async () => {
      const result = await demoTrpcMock.tickets.listAttachments.query({
        ticketId: "any",
      });
      expect(result).toEqual([]);
    });

    it("listRecordings returns empty array", async () => {
      const result = await demoTrpcMock.tickets.listRecordings.query({
        ticketId: "any",
      });
      expect(result).toEqual([]);
    });

    it("listPresets returns empty array", async () => {
      const result = await demoTrpcMock.tickets.listPresets.query();
      expect(result).toEqual([]);
    });

    it("readStateSweep returns empty items", async () => {
      const result = await demoTrpcMock.tickets.readStateSweep.query({});
      expect(result.items).toEqual([]);
      expect(result.nextCursor).toBeNull();
    });

    it("listReadState returns empty object", async () => {
      const result = await demoTrpcMock.tickets.listReadState.query({
        ticketIds: [],
      });
      expect(result).toEqual({});
    });

    it("getReadCursor returns null cursor", async () => {
      const result = await demoTrpcMock.tickets.getReadCursor.query({
        ticketId: "any",
      });
      expect(result.encryptedReadCursor).toBeNull();
    });
  });

  describe("mutation stubs", () => {
    it("createFollowUp returns a follow-up record", async () => {
      const result = await demoTrpcMock.tickets.createFollowUp.mutate({
        id: "fu-new",
        ticketId: "tk-0001",
        encryptedContent: "test",
        source: "volunteer",
        type: "message",
        isPrivate: false,
      });
      expect(result.id).toBe("fu-new");
      expect(result.ticketId).toBe("tk-0001");
    });

    it("update resolves to ok", async () => {
      const result = await demoTrpcMock.tickets.update.mutate({});
      expect(result).toEqual({ ok: true });
    });

    it("assignTo resolves to ok", async () => {
      const result = await demoTrpcMock.tickets.assignTo.mutate({});
      expect(result).toEqual({ ok: true });
    });
  });

  describe("recentViews", () => {
    it("get.query returns null envelope", async () => {
      const result = await demoTrpcMock.recentViews.get.query();
      expect(result.envelope).toBeNull();
    });

    it("put.mutate is a no-op", async () => {
      await expect(
        demoTrpcMock.recentViews.put.mutate({}),
      ).resolves.toBeUndefined();
    });
  });

  describe("unstubbed sub-trees return undefined", () => {
    it("kb is undefined", () => {
      expect(trpc.kb).toBeUndefined();
    });

    it("arbitrary unknown routers resolve to undefined", () => {
      expect(
        (trpc as unknown as Record<string, unknown>).unknown,
      ).toBeUndefined();
    });
  });

  describe("dev delay toggle", () => {
    it("defaults to false", () => {
      expect(isDevDelayEnabled()).toBe(false);
    });

    it("can be toggled", () => {
      setDevDelay(true);
      expect(isDevDelayEnabled()).toBe(true);
      setDevDelay(false);
      expect(isDevDelayEnabled()).toBe(false);
    });
  });
});
