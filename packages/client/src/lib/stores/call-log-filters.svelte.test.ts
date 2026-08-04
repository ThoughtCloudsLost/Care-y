import { describe, it, expect, beforeEach } from "vitest";
import { callLogFilterStore } from "./call-log-filters.svelte.js";

describe("callLogFilterStore", () => {
  beforeEach(() => {
    callLogFilterStore.clearAll();
  });

  describe("direction", () => {
    it("defaults to null", () => {
      expect(callLogFilterStore.direction).toBeNull();
    });

    it('sets to "inbound"', () => {
      callLogFilterStore.setDirection("inbound");
      expect(callLogFilterStore.direction).toBe("inbound");
    });

    it('sets to "outbound"', () => {
      callLogFilterStore.setDirection("outbound");
      expect(callLogFilterStore.direction).toBe("outbound");
    });

    it("sets back to null", () => {
      callLogFilterStore.setDirection("inbound");
      callLogFilterStore.setDirection(null);
      expect(callLogFilterStore.direction).toBeNull();
    });
  });

  describe("callStatus", () => {
    it("defaults to null", () => {
      expect(callLogFilterStore.callStatus).toBeNull();
    });

    it("sets a status value", () => {
      callLogFilterStore.setCallStatus("completed");
      expect(callLogFilterStore.callStatus).toBe("completed");
    });

    it("sets back to null", () => {
      callLogFilterStore.setCallStatus("completed");
      callLogFilterStore.setCallStatus(null);
      expect(callLogFilterStore.callStatus).toBeNull();
    });
  });

  describe("date range", () => {
    it("defaults to null for both bounds", () => {
      expect(callLogFilterStore.dateFrom).toBeNull();
      expect(callLogFilterStore.dateTo).toBeNull();
    });

    it("sets dateFrom only", () => {
      const d = new Date("2024-01-01");
      callLogFilterStore.setDateRange(d, null);
      expect(callLogFilterStore.dateFrom).toEqual(d);
      expect(callLogFilterStore.dateTo).toBeNull();
    });

    it("sets dateTo only", () => {
      const d = new Date("2024-12-31");
      callLogFilterStore.setDateRange(null, d);
      expect(callLogFilterStore.dateFrom).toBeNull();
      expect(callLogFilterStore.dateTo).toEqual(d);
    });

    it("sets both bounds", () => {
      const from = new Date("2024-01-01");
      const to = new Date("2024-12-31");
      callLogFilterStore.setDateRange(from, to);
      expect(callLogFilterStore.dateFrom).toEqual(from);
      expect(callLogFilterStore.dateTo).toEqual(to);
    });
  });

  describe("activeCount", () => {
    it("is 0 when no filters are active", () => {
      expect(callLogFilterStore.activeCount).toBe(0);
    });

    it("counts direction as 1", () => {
      callLogFilterStore.setDirection("inbound");
      expect(callLogFilterStore.activeCount).toBe(1);
    });

    it("counts callStatus as 1", () => {
      callLogFilterStore.setCallStatus("completed");
      expect(callLogFilterStore.activeCount).toBe(1);
    });

    it("counts date range as 1 even with both bounds", () => {
      callLogFilterStore.setDateRange(
        new Date("2024-01-01"),
        new Date("2024-12-31"),
      );
      expect(callLogFilterStore.activeCount).toBe(1);
    });

    it("sums all active dimensions", () => {
      callLogFilterStore.setDirection("outbound");
      callLogFilterStore.setCallStatus("no_answer");
      callLogFilterStore.setDateRange(new Date("2024-01-01"), null);
      expect(callLogFilterStore.activeCount).toBe(3);
    });
  });

  describe("clearAll", () => {
    it("resets all filter state", () => {
      callLogFilterStore.setDirection("inbound");
      callLogFilterStore.setCallStatus("completed");
      callLogFilterStore.setDateRange(
        new Date("2024-01-01"),
        new Date("2024-12-31"),
      );

      callLogFilterStore.clearAll();

      expect(callLogFilterStore.direction).toBeNull();
      expect(callLogFilterStore.callStatus).toBeNull();
      expect(callLogFilterStore.dateFrom).toBeNull();
      expect(callLogFilterStore.dateTo).toBeNull();
      expect(callLogFilterStore.activeCount).toBe(0);
    });
  });
});
