import { describe, it, expect, beforeEach } from "vitest";
import { auditLogFilterStore } from "./audit-log-filters.svelte.js";

describe("auditLogFilterStore", () => {
  beforeEach(() => {
    auditLogFilterStore.clearAll();
  });

  describe("eventType", () => {
    it("defaults to null", () => {
      expect(auditLogFilterStore.eventType).toBeNull();
    });

    it("sets an event type", () => {
      auditLogFilterStore.setEventType("ticket_created");
      expect(auditLogFilterStore.eventType).toBe("ticket_created");
    });

    it("sets back to null", () => {
      auditLogFilterStore.setEventType("ticket_closed");
      auditLogFilterStore.setEventType(null);
      expect(auditLogFilterStore.eventType).toBeNull();
    });
  });

  describe("actorId", () => {
    it("defaults to null", () => {
      expect(auditLogFilterStore.actorId).toBeNull();
    });

    it("sets an actor id", () => {
      auditLogFilterStore.setActorId("user-123");
      expect(auditLogFilterStore.actorId).toBe("user-123");
    });

    it("sets back to null", () => {
      auditLogFilterStore.setActorId("user-123");
      auditLogFilterStore.setActorId(null);
      expect(auditLogFilterStore.actorId).toBeNull();
    });
  });

  describe("date range", () => {
    it("defaults to null for both bounds", () => {
      expect(auditLogFilterStore.dateFrom).toBeNull();
      expect(auditLogFilterStore.dateTo).toBeNull();
    });

    it("sets dateFrom only", () => {
      const d = new Date("2024-01-01");
      auditLogFilterStore.setDateRange(d, null);
      expect(auditLogFilterStore.dateFrom).toEqual(d);
      expect(auditLogFilterStore.dateTo).toBeNull();
    });

    it("sets dateTo only", () => {
      const d = new Date("2024-12-31");
      auditLogFilterStore.setDateRange(null, d);
      expect(auditLogFilterStore.dateFrom).toBeNull();
      expect(auditLogFilterStore.dateTo).toEqual(d);
    });

    it("sets both bounds", () => {
      const from = new Date("2024-01-01");
      const to = new Date("2024-12-31");
      auditLogFilterStore.setDateRange(from, to);
      expect(auditLogFilterStore.dateFrom).toEqual(from);
      expect(auditLogFilterStore.dateTo).toEqual(to);
    });
  });

  describe("activeCount", () => {
    it("is 0 when no filters are active", () => {
      expect(auditLogFilterStore.activeCount).toBe(0);
    });

    it("counts eventType as 1", () => {
      auditLogFilterStore.setEventType("ticket_created");
      expect(auditLogFilterStore.activeCount).toBe(1);
    });

    it("counts actorId as 1", () => {
      auditLogFilterStore.setActorId("user-456");
      expect(auditLogFilterStore.activeCount).toBe(1);
    });

    it("counts date range as 1 even with both bounds", () => {
      auditLogFilterStore.setDateRange(
        new Date("2024-01-01"),
        new Date("2024-12-31"),
      );
      expect(auditLogFilterStore.activeCount).toBe(1);
    });

    it("sums all active dimensions", () => {
      auditLogFilterStore.setEventType("ticket_assigned");
      auditLogFilterStore.setActorId("user-789");
      auditLogFilterStore.setDateRange(new Date("2024-06-01"), null);
      expect(auditLogFilterStore.activeCount).toBe(3);
    });
  });

  describe("clearAll", () => {
    it("resets all filter state", () => {
      auditLogFilterStore.setEventType("ticket_merged");
      auditLogFilterStore.setActorId("user-111");
      auditLogFilterStore.setDateRange(
        new Date("2024-01-01"),
        new Date("2024-12-31"),
      );

      auditLogFilterStore.clearAll();

      expect(auditLogFilterStore.eventType).toBeNull();
      expect(auditLogFilterStore.actorId).toBeNull();
      expect(auditLogFilterStore.dateFrom).toBeNull();
      expect(auditLogFilterStore.dateTo).toBeNull();
      expect(auditLogFilterStore.activeCount).toBe(0);
    });
  });
});
