import { describe, it, expect } from "vitest";
import {
  createPhoneResolver,
  type PhoneResolverDeps,
} from "./phone-resolver.js";

const PHONES = [
  { number: "+15551111111", sid: "PN_hotline" },
  { number: "+15552222222", sid: "PN_system" },
  { number: "+15553333333", sid: "PN_backup" },
] as const;

function makeDeps(
  config: {
    phone_outbound_sid: string | null;
    phone_system_sid: string | null;
  },
  phones: readonly { number: string; sid: string }[] = PHONES,
): PhoneResolverDeps {
  return {
    getOrgConfig: async () => config,
    getProvisionedPhones: async () => phones,
  };
}

describe("resolveCallerIdByPurpose", () => {
  describe("outbound purpose", () => {
    it("returns number matching phone_outbound_sid", async () => {
      const resolver = createPhoneResolver(
        makeDeps({ phone_outbound_sid: "PN_hotline", phone_system_sid: null }),
      );
      const result = await resolver("org_test", "outbound");
      expect(result).toBe("+15551111111");
    });

    it("falls back to first provisioned when phone_outbound_sid is null", async () => {
      const resolver = createPhoneResolver(
        makeDeps({ phone_outbound_sid: null, phone_system_sid: null }),
      );
      const result = await resolver("org_test", "outbound");
      expect(result).toBe("+15551111111");
    });

    it("falls back to first provisioned when SID does not match any number", async () => {
      const resolver = createPhoneResolver(
        makeDeps({
          phone_outbound_sid: "PN_nonexistent",
          phone_system_sid: null,
        }),
      );
      const result = await resolver("org_test", "outbound");
      expect(result).toBe("+15551111111");
    });
  });

  describe("system purpose", () => {
    it("returns number matching phone_system_sid", async () => {
      const resolver = createPhoneResolver(
        makeDeps({
          phone_outbound_sid: "PN_hotline",
          phone_system_sid: "PN_system",
        }),
      );
      const result = await resolver("org_test", "system");
      expect(result).toBe("+15552222222");
    });

    it("falls back to phone_outbound_sid when phone_system_sid is null", async () => {
      const resolver = createPhoneResolver(
        makeDeps({ phone_outbound_sid: "PN_hotline", phone_system_sid: null }),
      );
      const result = await resolver("org_test", "system");
      expect(result).toBe("+15551111111");
    });

    it("falls back to first provisioned when both SIDs are null", async () => {
      const resolver = createPhoneResolver(
        makeDeps({ phone_outbound_sid: null, phone_system_sid: null }),
      );
      const result = await resolver("org_test", "system");
      expect(result).toBe("+15551111111");
    });

    it("falls back through chain when phone_system_sid is stale", async () => {
      const resolver = createPhoneResolver(
        makeDeps({
          phone_outbound_sid: "PN_hotline",
          phone_system_sid: "PN_removed",
        }),
      );
      const result = await resolver("org_test", "system");
      // Falls through stale system SID to outbound SID
      expect(result).toBe("+15551111111");
    });
  });

  describe("edge cases", () => {
    it("returns null when no phones are provisioned", async () => {
      const resolver = createPhoneResolver(
        makeDeps(
          { phone_outbound_sid: "PN_hotline", phone_system_sid: null },
          [],
        ),
      );
      const result = await resolver("org_test", "outbound");
      expect(result).toBeNull();
    });

    it("returns null when no phones are provisioned (system)", async () => {
      const resolver = createPhoneResolver(
        makeDeps({ phone_outbound_sid: null, phone_system_sid: null }, []),
      );
      const result = await resolver("org_test", "system");
      expect(result).toBeNull();
    });

    it("picks correct number from multiple provisioned", async () => {
      const resolver = createPhoneResolver(
        makeDeps({ phone_outbound_sid: "PN_backup", phone_system_sid: null }),
      );
      const result = await resolver("org_test", "outbound");
      expect(result).toBe("+15553333333");
    });
  });
});
