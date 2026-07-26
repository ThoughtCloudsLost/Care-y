import { describe, it, expect, beforeEach } from "vitest";
import { Permission } from "@care-y/shared";
import {
  getCryptoBridge,
  getCurrentPermissions,
  getCurrentUserId,
  demoSeed,
  demoReset,
} from "./crypto-context.js";

describe("crypto-context stub", () => {
  beforeEach(() => {
    demoReset();
  });

  describe("getCryptoBridge", () => {
    it("returns a stable bridge object instead of throwing", () => {
      const bridge = getCryptoBridge();
      expect(bridge).toBeDefined();
      expect(typeof bridge.sealSelfBlob).toBe("function");
      expect(typeof bridge.openSelfBlob).toBe("function");
      expect(typeof bridge.onStateChange).toBe("function");
      expect(typeof bridge.zeroAll).toBe("function");
    });

    it("sealSelfBlob wraps payload in a fake envelope", async () => {
      const bridge = getCryptoBridge();
      const envelope = await bridge.sealSelfBlob("dGVzdA==");
      expect(envelope.ephemeralPoint).toBe("demo-ephemeral");
      expect(envelope.nonce).toBe("demo-nonce");
      expect(envelope.wrappedPayload).toBe("dGVzdA==");
    });

    it("openSelfBlob extracts the payload from the envelope", async () => {
      const bridge = getCryptoBridge();
      const envelope = await bridge.sealSelfBlob("cGF5bG9hZA==");
      const result = await bridge.openSelfBlob(envelope);
      expect(result).toBe("cGF5bG9hZA==");
    });

    it("seal then open round-trips", async () => {
      const bridge = getCryptoBridge();
      const original = "aGVsbG8gd29ybGQ=";
      const envelope = await bridge.sealSelfBlob(original);
      const recovered = await bridge.openSelfBlob(envelope);
      expect(recovered).toBe(original);
    });
  });

  describe("permissions seeding", () => {
    it("defaults to a manager-level permission set", () => {
      const getPerms = getCurrentPermissions();
      const perms = getPerms();
      expect(perms.has(Permission.VIEW_TICKETS)).toBe(true);
      expect(perms.has(Permission.MANAGE_USERS)).toBe(true);
      expect(perms.has(Permission.MANAGE_QUEUES)).toBe(true);
    });

    it("does not include admin-only permissions by default", () => {
      const getPerms = getCurrentPermissions();
      const perms = getPerms();
      expect(perms.has(Permission.MANAGE_ROLES)).toBe(false);
      expect(perms.has(Permission.MANAGE_ORG_CONFIG)).toBe(false);
      expect(perms.has(Permission.MANAGE_KEYS)).toBe(false);
    });

    it("can be overridden via demoSeed", () => {
      const custom = new Set<Permission>([Permission.VIEW_TICKETS]);
      demoSeed({ permissions: custom });
      const getPerms = getCurrentPermissions();
      const perms = getPerms();
      expect(perms.has(Permission.VIEW_TICKETS)).toBe(true);
      expect(perms.has(Permission.MANAGE_USERS)).toBe(false);
    });

    it("resets to defaults via demoReset", () => {
      demoSeed({ permissions: new Set<Permission>() });
      demoReset();
      const getPerms = getCurrentPermissions();
      const perms = getPerms();
      expect(perms.has(Permission.MANAGE_USERS)).toBe(true);
    });
  });

  describe("user ID seeding", () => {
    it("defaults to demo-user-001", () => {
      const getUserId = getCurrentUserId();
      expect(getUserId()).toBe("demo-user-001");
    });

    it("can be overridden via demoSeed", () => {
      demoSeed({ userId: "custom-user" });
      const getUserId = getCurrentUserId();
      expect(getUserId()).toBe("custom-user");
    });
  });
});
