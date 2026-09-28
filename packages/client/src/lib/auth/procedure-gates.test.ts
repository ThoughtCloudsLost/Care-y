import { describe, it, expect } from "vitest";
import { Permission, CLIENT_CHANNEL_PERMISSIONS } from "@care-y/shared";
import { canUseChannel } from "./procedure-gates.js";

describe("canUseChannel", () => {
  it("allows a channel when the set holds its key", () => {
    const permissions = new Set([Permission.SEND_CLIENT_SMS]);

    expect(canUseChannel(permissions, "sms")).toBe(true);
  });

  it("refuses a channel when the set lacks its key", () => {
    const permissions = new Set([Permission.SEND_CLIENT_SMS]);

    expect(canUseChannel(permissions, "portal")).toBe(false);
    expect(canUseChannel(permissions, "email")).toBe(false);
    expect(canUseChannel(permissions, "call")).toBe(false);
  });

  it("refuses every channel on an empty set", () => {
    const permissions = new Set<Permission>();

    expect(canUseChannel(permissions, "portal")).toBe(false);
    expect(canUseChannel(permissions, "sms")).toBe(false);
    expect(canUseChannel(permissions, "email")).toBe(false);
    expect(canUseChannel(permissions, "call")).toBe(false);
  });

  it("reads each channel's key from the shared manifest", () => {
    expect(
      canUseChannel(new Set([CLIENT_CHANNEL_PERMISSIONS.portal]), "portal"),
    ).toBe(true);
    expect(
      canUseChannel(new Set([CLIENT_CHANNEL_PERMISSIONS.email]), "email"),
    ).toBe(true);
    expect(
      canUseChannel(new Set([CLIENT_CHANNEL_PERMISSIONS.call]), "call"),
    ).toBe(true);
  });
});
