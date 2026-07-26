import { describe, it, expect, beforeEach } from "vitest";
import { trpc, demoResetTrpc, isDevDelayEnabled, setDevDelay } from "./trpc.js";

describe("trpc mock", () => {
  beforeEach(() => {
    demoResetTrpc();
  });

  describe("auth.me.query", () => {
    it("returns a user with expected shape", async () => {
      const result = await trpc.auth.me.query();
      expect(result.user.id).toBe("demo-user-001");
      expect(result.user.encryptedDisplayName).toBeDefined();
      expect(result.user.roleId).toBe("demo-role-001");
    });
  });

  describe("auth.listUsers.query", () => {
    it("returns an array of users", async () => {
      const result = await trpc.auth.listUsers.query();
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0]?.id).toBe("demo-user-001");
    });
  });

  describe("tickets.myQueues.query", () => {
    it("returns an empty array (mobile layout)", async () => {
      const result = await trpc.tickets.myQueues.query();
      expect(result).toEqual([]);
    });
  });

  describe("tickets.list.query", () => {
    it("returns a flat array of TicketLikeRecord items", async () => {
      const result = await trpc.tickets.list.query({ limit: 3 });
      expect(result.length).toBe(3);
      // Each item has TicketLikeRecord fields
      const first = result[0];
      expect(first).toBeDefined();
      if (first) {
        expect(first).toHaveProperty("id");
        expect(first).toHaveProperty("encryptedQueueName");
        expect(first).toHaveProperty("encryptedTitle");
      }
    });

    it("returns all items without limit", async () => {
      const result = await trpc.tickets.list.query();
      expect(result.length).toBeGreaterThanOrEqual(5);
    });

    it("supports cursor-based pagination", async () => {
      const firstPage = await trpc.tickets.list.query({ limit: 2 });
      expect(firstPage.length).toBe(2);
      const secondId = firstPage[1]?.id;
      expect(secondId).toBeDefined();
      if (secondId) {
        const secondPage = await trpc.tickets.list.query({
          limit: 2,
          cursor: secondId,
        });
        // Second page starts after the cursor
        expect(secondPage[0]?.id).not.toBe(secondId);
      }
    });
  });

  describe("tickets.get.query", () => {
    it("returns a ticket by ID", async () => {
      const allResult = await trpc.tickets.list.query();
      const firstId = allResult[0]?.id;
      expect(firstId).toBeDefined();
      if (!firstId) return;

      const ticket = await trpc.tickets.get.query({ ticketId: firstId });
      expect(ticket.id).toBe(firstId);
    });

    it("throws DemoStubError for unknown ticket ID", async () => {
      await expect(
        trpc.tickets.get.query({ ticketId: "nonexistent" }),
      ).rejects.toThrow("not implemented");
    });
  });

  describe("tickets.contentSearch.query", () => {
    it("returns followups and total", async () => {
      const result = await trpc.tickets.contentSearch.query({
        ticketIds: ["search-e-001"],
        page: 0,
        pageSize: 10,
      });
      expect(result).toHaveProperty("followups");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.followups)).toBe(true);
    });

    it("followup items have correct field names", async () => {
      const result = await trpc.tickets.contentSearch.query({
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
        trpc.tickets.contentSearch.query({
          ticketIds: ["search-e-001"],
          page: 0,
          pageSize: 10,
          signal: controller.signal,
        }),
      ).rejects.toThrow();
    });
  });

  describe("tickets.noteTypes", () => {
    it("is explicitly undefined", () => {
      expect(trpc.tickets.noteTypes).toBeUndefined();
    });
  });

  describe("recentViews", () => {
    it("get.query returns null envelope", async () => {
      const result = await trpc.recentViews.get.query();
      expect(result.envelope).toBeNull();
    });

    it("put.mutate is a no-op", async () => {
      await expect(trpc.recentViews.put.mutate({})).resolves.toBeUndefined();
    });
  });

  describe("unstubbed sub-trees return undefined", () => {
    it("kb is undefined", () => {
      expect(trpc.kb).toBeUndefined();
    });

    it("arbitrary unknown routers resolve to undefined", () => {
      expect((trpc as Record<string, unknown>).unknown).toBeUndefined();
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
