import { describe, it, expect } from "vitest";
import type { BrowserCallService } from "@care-y/shared";

/**
 * Type-level conformance test for TwilioBrowserCallService.
 *
 * The adapter is thin glue between @twilio/voice-sdk and BrowserCallService.
 * Heavy mocking of the SDK's Device/Call classes couples tests to SDK internals
 * (event names, constructor shapes) and gives false confidence. Behavioral
 * testing of WebRTC calls belongs in E2E (Playwright).
 *
 * This test verifies:
 * 1. The module exports a factory function
 * 2. The returned object satisfies the BrowserCallService interface
 * 3. Initial state is correct
 */

// We can't import the real implementation without the @twilio/voice-sdk
// being available in the test environment (it's browser-only). Instead,
// verify the module structure via a dynamic import with the SDK mocked.

import { vi } from "vitest";

vi.mock("@twilio/voice-sdk", () => ({
  Device: class MockDevice {
    on(): void {
      /* noop stub */
    }
    async register(): Promise<void> {
      /* noop stub */
    }
    async connect(): Promise<{
      on(): void;
      disconnect(): void;
      mute(): void;
      sendDigits(): void;
    }> {
      return {
        on() {
          /* noop stub */
        },
        disconnect() {
          /* noop stub */
        },
        mute() {
          /* noop stub */
        },
        sendDigits() {
          /* noop stub */
        },
      };
    }
    destroy(): void {
      /* noop stub */
    }
  },
  Call: {},
}));

const { createTwilioBrowserCallService } =
  await import("./twilio-call-service.js");

describe("TwilioBrowserCallService", () => {
  it("satisfies the BrowserCallService interface", () => {
    const service: BrowserCallService = createTwilioBrowserCallService();

    // All interface methods exist and are callable
    expect(typeof service.register).toBe("function");
    expect(typeof service.connect).toBe("function");
    expect(typeof service.disconnect).toBe("function");
    expect(typeof service.toggleMute).toBe("function");
    expect(typeof service.sendDtmf).toBe("function");
    expect(typeof service.getState).toBe("function");
    expect(typeof service.destroy).toBe("function");
  });

  it("starts in idle state", () => {
    const service = createTwilioBrowserCallService();
    expect(service.getState()).toBe("idle");
  });

  it("toggleMute returns false when no active call", () => {
    const service = createTwilioBrowserCallService();
    expect(service.toggleMute()).toBe(false);
  });
});
