import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toastStore } from "./toast.svelte.js";

describe("toastStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    while (toastStore.current !== null) {
      toastStore.dismiss();
    }
  });

  afterEach(() => {
    while (toastStore.current !== null) {
      toastStore.dismiss();
    }
    vi.useRealTimers();
  });

  it("starts with no toast visible", () => {
    expect(toastStore.current).toBe(null);
  });

  describe("show", () => {
    it("displays a toast with the given message", () => {
      toastStore.show("Hello");
      expect(toastStore.current).not.toBe(null);
      expect(toastStore.current!.message).toBe("Hello");
    });

    it("uses default duration of 2500ms", () => {
      toastStore.show("Default");
      expect(toastStore.current!.duration).toBe(2500);
    });

    it("accepts a custom duration", () => {
      toastStore.show("Custom", 5000);
      expect(toastStore.current!.duration).toBe(5000);
    });

    it("assigns unique IDs to each toast", () => {
      toastStore.show("First");
      const firstId = toastStore.current!.id;
      toastStore.dismiss();
      toastStore.show("Second");
      expect(toastStore.current!.id).not.toBe(firstId);
    });
  });

  describe("auto-dismiss", () => {
    it("clears the toast after its duration elapses", () => {
      toastStore.show("Temporary", 1000);
      expect(toastStore.current).not.toBe(null);
      vi.advanceTimersByTime(1000);
      expect(toastStore.current).toBe(null);
    });

    it("does not clear before the duration", () => {
      toastStore.show("Still here", 2000);
      vi.advanceTimersByTime(1999);
      expect(toastStore.current).not.toBe(null);
    });
  });

  describe("dismiss", () => {
    it("clears the current toast immediately", () => {
      toastStore.show("Will dismiss");
      toastStore.dismiss();
      expect(toastStore.current).toBe(null);
    });

    it("is a no-op when no toast is showing", () => {
      toastStore.dismiss();
      expect(toastStore.current).toBe(null);
    });
  });

  describe("queue", () => {
    it("queues a second toast while one is visible", () => {
      toastStore.show("First");
      toastStore.show("Second");
      expect(toastStore.current!.message).toBe("First");
    });

    it("advances to queued toast after dismiss", () => {
      toastStore.show("First");
      toastStore.show("Second");
      toastStore.dismiss();
      expect(toastStore.current!.message).toBe("Second");
    });

    it("advances to queued toast after auto-dismiss", () => {
      toastStore.show("First", 1000);
      toastStore.show("Second", 2000);
      vi.advanceTimersByTime(1000);
      expect(toastStore.current!.message).toBe("Second");
    });

    it("auto-dismisses queued toasts with their own duration", () => {
      toastStore.show("First", 1000);
      toastStore.show("Second", 500);
      vi.advanceTimersByTime(1000);
      expect(toastStore.current!.message).toBe("Second");
      vi.advanceTimersByTime(500);
      expect(toastStore.current).toBe(null);
    });

    it("processes a multi-item queue in FIFO order", () => {
      toastStore.show("A", 100);
      toastStore.show("B", 100);
      toastStore.show("C", 100);

      expect(toastStore.current!.message).toBe("A");
      vi.advanceTimersByTime(100);
      expect(toastStore.current!.message).toBe("B");
      vi.advanceTimersByTime(100);
      expect(toastStore.current!.message).toBe("C");
      vi.advanceTimersByTime(100);
      expect(toastStore.current).toBe(null);
    });
  });
});
