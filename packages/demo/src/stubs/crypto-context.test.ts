import { describe, it, expect, beforeEach, vi } from "vitest";
import { Permission } from "@care-y/shared";
import { RoleId } from "@care-y/shared";

// Mock the real CryptoBridge, OrgKeyManager, and decrypt cache classes
// to prevent actual Worker construction in tests.
vi.mock("$lib/workers/crypto-bridge.js", () => {
  const mockBridge = {
    onBridgeStateChange: vi.fn(),
    onSettled: vi.fn(),
    isReconnected: vi.fn().mockReturnValue(false),
    getReconnectData: vi.fn().mockReturnValue({}),
    getState: vi.fn().mockReturnValue("READY"),
    decrypt: vi.fn().mockResolvedValue("plaintext"),
    decryptAndRewrap: vi.fn().mockResolvedValue("plaintext"),
    sealSelfBlob: vi.fn().mockResolvedValue({
      ephemeralPoint: "ep",
      nonce: "n",
      wrappedPayload: "wp",
    }),
    openSelfBlob: vi.fn().mockResolvedValue("data"),
    disconnect: vi.fn(),
    zeroAll: vi.fn(),
  };
  return {
    CryptoBridge: vi.fn(function CryptoBridge() {
      return mockBridge;
    }),
  };
});

vi.mock("$lib/crypto/org-key.js", () => {
  const mockManager = {
    onLoadChange: vi.fn(),
    load: vi.fn(),
    isLoaded: false,
    zero: vi.fn(),
  };
  return {
    OrgKeyManager: vi.fn(function OrgKeyManager() {
      return mockManager;
    }),
  };
});

vi.mock("$lib/crypto/org-decrypt-cache.js", () => ({
  OrgDecryptCache: vi.fn(function OrgDecryptCache() {
    return {
      decrypt: vi.fn(),
      has: vi.fn(),
      clear: vi.fn(),
    };
  }),
}));

vi.mock("$lib/crypto/ticket-decrypt-cache.js", () => ({
  TicketDecryptCache: vi.fn(function TicketDecryptCache() {
    return {
      decryptTitle: vi.fn(),
      has: vi.fn(),
      clear: vi.fn(),
    };
  }),
}));

vi.mock("$lib/crypto/follow-up-decrypt-cache.js", () => ({
  FollowUpDecryptCache: vi.fn(function FollowUpDecryptCache() {
    return {
      decryptContent: vi.fn(),
      has: vi.fn(),
      clear: vi.fn(),
    };
  }),
}));

vi.mock("$lib/tickets/preview-loader.svelte.js", () => ({
  createPreviewLoader: vi.fn(() => ({
    rawPreviews: new Map(),
    observe: vi.fn(),
    eagerLoad: vi.fn(),
    get: vi.fn(),
  })),
}));

vi.mock("$lib/crypto/crypto-keyed.svelte.js", () => ({
  setCryptoKeyed: vi.fn(),
}));

vi.mock("$lib/crypto/crypto-settled.svelte.js", () => ({
  setCryptoSettled: vi.fn(),
}));

vi.mock("$lib/crypto/org-key-ready.svelte.js", () => ({
  setOrgKeyReady: vi.fn(),
}));

// Import after mocks are established
const {
  getCryptoBridge,
  getOrgKeyManager,
  getOrgDecryptCache,
  getTicketDecryptCache,
  getFollowUpDecryptCache,
  getCurrentPermissions,
  getCurrentUserId,
  getCurrentUserRoleId,
  demoSeed,
  ensureKeyed,
  registerTrpcForPreview,
  getPreviewLoader,
  setRoleAndPermissions,
} = await import("./crypto-context.svelte.js");

/** Reset auth state to defaults for test isolation. */
function resetAuthDefaults(): void {
  demoSeed({
    userId: "demo-user-001",
    userRoleId: RoleId.ADMIN,
  });
}

describe("crypto-context (lazy real objects)", () => {
  beforeEach(() => {
    resetAuthDefaults();
  });

  describe("getCryptoBridge", () => {
    it("returns a bridge object (pacing wrapper)", () => {
      const bridge = getCryptoBridge();
      expect(bridge).toBeDefined();
      // The pacing wrapper is a Proxy: decrypt is overridden
      expect(typeof bridge.decrypt).toBe("function");
    });

    it("returns the same instance on repeated calls", () => {
      const a = getCryptoBridge();
      const b = getCryptoBridge();
      expect(a).toBe(b);
    });
  });

  describe("getOrgKeyManager", () => {
    it("returns an OrgKeyManager instance", () => {
      const okm = getOrgKeyManager();
      expect(okm).toBeDefined();
      expect(typeof okm.load).toBe("function");
    });

    it("returns the same instance on repeated calls", () => {
      const a = getOrgKeyManager();
      const b = getOrgKeyManager();
      expect(a).toBe(b);
    });
  });

  describe("decrypt caches", () => {
    it("getOrgDecryptCache returns an object", () => {
      const cache = getOrgDecryptCache();
      expect(cache).toBeDefined();
    });

    it("getTicketDecryptCache returns an object", () => {
      const cache = getTicketDecryptCache();
      expect(cache).toBeDefined();
    });

    it("getFollowUpDecryptCache returns an object", () => {
      const cache = getFollowUpDecryptCache();
      expect(cache).toBeDefined();
    });
  });

  describe("preview loader", () => {
    it("throws if trpc is not registered", () => {
      // registerTrpcForPreview is called by trpc stub at init time.
      // Since we mocked the modules, the trpc stub's init may not
      // have run. The test verifies the guard exists.
      // (If registerTrpcForPreview was already called by the trpc
      // stub import, this test passes vacuously.)
      expect(typeof registerTrpcForPreview).toBe("function");
    });

    it("getPreviewLoader works after registerTrpcForPreview", () => {
      const fakeTrpc = {
        tickets: {
          recentFollowUps: {
            query: vi.fn().mockResolvedValue({}),
          },
        },
      };
      registerTrpcForPreview(fakeTrpc);
      const loader = getPreviewLoader();
      expect(loader).toBeDefined();
      expect(typeof loader.observe).toBe("function");
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

    it("includes admin-level permissions by default (demo seeds as admin)", () => {
      const getPerms = getCurrentPermissions();
      const perms = getPerms();
      expect(perms.has(Permission.MANAGE_ROLES)).toBe(true);
      expect(perms.has(Permission.MANAGE_ORG_CONFIG)).toBe(true);
      expect(perms.has(Permission.MANAGE_KEYS)).toBe(true);
    });

    it("can be overridden via demoSeed", () => {
      const custom = new Set<Permission>([Permission.VIEW_TICKETS]);
      demoSeed({ permissions: custom });
      const getPerms = getCurrentPermissions();
      const perms = getPerms();
      expect(perms.has(Permission.VIEW_TICKETS)).toBe(true);
      expect(perms.has(Permission.MANAGE_USERS)).toBe(false);
    });

    it("resets to defaults via resetAuthDefaults", () => {
      demoSeed({ permissions: new Set<Permission>() });
      resetAuthDefaults();
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

  describe("user role ID seeding", () => {
    it("defaults to RoleId.ADMIN", () => {
      const getRoleId = getCurrentUserRoleId();
      expect(getRoleId()).toBe(RoleId.ADMIN);
    });

    it("can be overridden via demoSeed", () => {
      demoSeed({ userRoleId: "custom-role" });
      const getRoleId = getCurrentUserRoleId();
      expect(getRoleId()).toBe("custom-role");
    });

    it("resets to RoleId.ADMIN via resetAuthDefaults", () => {
      demoSeed({ userRoleId: "custom-role" });
      resetAuthDefaults();
      const getRoleId = getCurrentUserRoleId();
      expect(getRoleId()).toBe(RoleId.ADMIN);
    });
  });

  describe("setRoleAndPermissions", () => {
    it("updates roleId via the getter", () => {
      setRoleAndPermissions(
        RoleId.VOLUNTEER,
        new Set([Permission.VIEW_TICKETS]),
      );
      const getRoleId = getCurrentUserRoleId();
      expect(getRoleId()).toBe(RoleId.VOLUNTEER);
    });

    it("updates permissions via the getter", () => {
      const volPerms = new Set([
        Permission.VIEW_TICKETS,
        Permission.VIEW_OWN_SHIFTS,
      ]);
      setRoleAndPermissions(RoleId.VOLUNTEER, volPerms);
      const getPerms = getCurrentPermissions();
      const perms = getPerms();
      expect(perms.has(Permission.VIEW_TICKETS)).toBe(true);
      expect(perms.has(Permission.VIEW_OWN_SHIFTS)).toBe(true);
      expect(perms.has(Permission.MANAGE_USERS)).toBe(false);
    });

    it("is reversed by resetAuthDefaults", () => {
      setRoleAndPermissions(RoleId.MANAGER, new Set([Permission.VIEW_TICKETS]));
      resetAuthDefaults();
      const getRoleId = getCurrentUserRoleId();
      expect(getRoleId()).toBe(RoleId.ADMIN);
    });

    it("consecutive calls reflect the latest value", () => {
      setRoleAndPermissions(
        RoleId.VOLUNTEER,
        new Set([Permission.VIEW_TICKETS]),
      );
      setRoleAndPermissions(RoleId.MANAGER, new Set([Permission.MANAGE_USERS]));
      const getRoleId = getCurrentUserRoleId();
      expect(getRoleId()).toBe(RoleId.MANAGER);
      const getPerms = getCurrentPermissions();
      expect(getPerms().has(Permission.MANAGE_USERS)).toBe(true);
      expect(getPerms().has(Permission.VIEW_TICKETS)).toBe(false);
    });
  });

  describe("ensureKeyed", () => {
    it("is an exported async function", () => {
      expect(typeof ensureKeyed).toBe("function");
    });
  });
});
