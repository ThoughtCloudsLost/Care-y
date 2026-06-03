import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BrowserCallService, BrowserCallEvents } from "@care-y/shared";

type EventHandler = (...args: unknown[]) => void;

let deviceHandlers: Map<string, EventHandler>;
let callHandlers: Map<string, EventHandler>;
let mockCallInstance: {
  on: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  mute: ReturnType<typeof vi.fn>;
  sendDigits: ReturnType<typeof vi.fn>;
};

function fireDeviceEvent(event: string, ...args: unknown[]): void {
  deviceHandlers.get(event)?.(...args);
}

function fireCallEvent(event: string, ...args: unknown[]): void {
  callHandlers.get(event)?.(...args);
}

vi.mock("@twilio/voice-sdk", () => ({
  Device: class MockDevice {
    constructor() {
      deviceHandlers = new Map();
    }
    on(event: string, handler: EventHandler): void {
      deviceHandlers.set(event, handler);
    }
    async register(): Promise<void> {
      /* noop */
    }
    async connect(): Promise<typeof mockCallInstance> {
      callHandlers = new Map();
      mockCallInstance = {
        on: vi.fn((event: string, handler: EventHandler) => {
          callHandlers.set(event, handler);
        }),
        disconnect: vi.fn(),
        mute: vi.fn(),
        sendDigits: vi.fn(),
      };
      return mockCallInstance;
    }
    destroy(): void {
      /* noop */
    }
  },
  Call: {},
}));

const { createTwilioBrowserCallService } =
  await import("./twilio-call-service.js");

describe("TwilioBrowserCallService", () => {
  let service: BrowserCallService;
  let events: BrowserCallEvents;

  beforeEach(() => {
    service = createTwilioBrowserCallService();
    events = { onStateChange: vi.fn(), onError: vi.fn() };
  });

  it("satisfies the BrowserCallService interface", () => {
    const svc: BrowserCallService = createTwilioBrowserCallService();
    expect(typeof svc.register).toBe("function");
    expect(typeof svc.connect).toBe("function");
    expect(typeof svc.disconnect).toBe("function");
    expect(typeof svc.toggleMute).toBe("function");
    expect(typeof svc.sendDtmf).toBe("function");
    expect(typeof svc.getState).toBe("function");
    expect(typeof svc.destroy).toBe("function");
  });

  it("starts in idle state", () => {
    expect(service.getState()).toBe("idle");
  });

  it("toggleMute returns false when no active call", () => {
    expect(service.toggleMute()).toBe(false);
  });

  it("sendDtmf does not throw when no active call", () => {
    expect(() => {
      service.sendDtmf("5");
    }).not.toThrow();
  });

  it("disconnect transitions state and fires callback", async () => {
    await service.register("token", events);
    service.disconnect();
    expect(service.getState()).toBe("disconnected");
    expect(events.onStateChange).toHaveBeenCalledWith("disconnected");
  });

  it("destroy resets to idle state", async () => {
    await service.register("token", events);
    service.destroy();
    expect(service.getState()).toBe("idle");
  });

  describe("connect lifecycle", () => {
    it("transitions connecting -> ringing -> connected", async () => {
      await service.register("token", events);
      await service.connect("+15551234567", "+15559876543");

      expect(service.getState()).toBe("connecting");

      fireCallEvent("ringing");
      expect(service.getState()).toBe("ringing");

      fireCallEvent("accept");
      expect(service.getState()).toBe("connected");
    });

    it("throws when device not registered", async () => {
      await expect(
        service.connect("+15551234567", "+15559876543"),
      ).rejects.toThrow("Device not registered");
    });

    it("call disconnect event transitions to disconnected", async () => {
      await service.register("token", events);
      await service.connect("+15551234567", "+15559876543");
      fireCallEvent("accept");

      fireCallEvent("disconnect");
      expect(service.getState()).toBe("disconnected");
    });

    it("call error event transitions to error and fires callback", async () => {
      await service.register("token", events);
      await service.connect("+15551234567", "+15559876543");
      fireCallEvent("accept");

      const err = new Error("network lost");
      fireCallEvent("error", err);
      expect(service.getState()).toBe("error");
      expect(events.onError).toHaveBeenCalledWith(err);
    });
  });

  describe("disconnect while ringing", () => {
    it("caller disconnect during ringing transitions to disconnected", async () => {
      await service.register("token", events);
      await service.connect("+15551234567", "+15559876543");
      fireCallEvent("ringing");
      expect(service.getState()).toBe("ringing");

      service.disconnect();
      expect(service.getState()).toBe("disconnected");
      expect(mockCallInstance.disconnect).toHaveBeenCalledOnce();
    });
  });

  describe("mute during active call", () => {
    it("toggleMute toggles and returns new state", async () => {
      await service.register("token", events);
      await service.connect("+15551234567", "+15559876543");
      fireCallEvent("accept");

      expect(service.toggleMute()).toBe(true);
      expect(mockCallInstance.mute).toHaveBeenCalledWith(true);

      expect(service.toggleMute()).toBe(false);
      expect(mockCallInstance.mute).toHaveBeenCalledWith(false);
    });

    it("sendDtmf delegates to active call", async () => {
      await service.register("token", events);
      await service.connect("+15551234567", "+15559876543");
      fireCallEvent("accept");

      service.sendDtmf("9");
      expect(mockCallInstance.sendDigits).toHaveBeenCalledWith("9");
    });
  });

  describe("device-level errors", () => {
    it("device error event transitions to error state", async () => {
      await service.register("token", events);
      const err = new Error("token expired");
      fireDeviceEvent("error", err);

      expect(service.getState()).toBe("error");
      expect(events.onError).toHaveBeenCalledWith(err);
    });

    it("device unregistered event transitions to error state", async () => {
      await service.register("token", events);
      fireDeviceEvent("unregistered");

      expect(service.getState()).toBe("error");
      expect(events.onError).toHaveBeenCalled();
    });
  });

  describe("double disconnect safety", () => {
    it("disconnect when already disconnected does not throw", async () => {
      await service.register("token", events);
      service.disconnect();
      expect(() => {
        service.disconnect();
      }).not.toThrow();
      expect(service.getState()).toBe("disconnected");
    });
  });
});
