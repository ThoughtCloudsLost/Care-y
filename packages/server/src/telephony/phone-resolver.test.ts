import { describe, it, expect } from "vitest";
import {
  createPhoneResolver,
  type OrgIdentifiers,
  type PhoneResolverDeps,
} from "./phone-resolver.js";

const TEST_ORG_ID = "bcc8e4b4-059b-406c-a455-af40861fbedb";
const TEST_ORG: OrgIdentifiers = {
  orgId: TEST_ORG_ID,
  orgSchema: `org_${TEST_ORG_ID}`,
};

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
      const result = await resolver(TEST_ORG, "outbound");
      expect(result).toBe("+15551111111");
    });

    it("falls back to first provisioned when phone_outbound_sid is null", async () => {
      const resolver = createPhoneResolver(
        makeDeps({ phone_outbound_sid: null, phone_system_sid: null }),
      );
      const result = await resolver(TEST_ORG, "outbound");
      expect(result).toBe("+15551111111");
    });

    it("falls back to first provisioned when SID does not match any number", async () => {
      const resolver = createPhoneResolver(
        makeDeps({
          phone_outbound_sid: "PN_nonexistent",
          phone_system_sid: null,
        }),
      );
      const result = await resolver(TEST_ORG, "outbound");
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
      const result = await resolver(TEST_ORG, "system");
      expect(result).toBe("+15552222222");
    });

    it("falls back to phone_outbound_sid when phone_system_sid is null", async () => {
      const resolver = createPhoneResolver(
        makeDeps({ phone_outbound_sid: "PN_hotline", phone_system_sid: null }),
      );
      const result = await resolver(TEST_ORG, "system");
      expect(result).toBe("+15551111111");
    });

    it("falls back to first provisioned when both SIDs are null", async () => {
      const resolver = createPhoneResolver(
        makeDeps({ phone_outbound_sid: null, phone_system_sid: null }),
      );
      const result = await resolver(TEST_ORG, "system");
      expect(result).toBe("+15551111111");
    });

    it("falls back through chain when phone_system_sid is stale", async () => {
      const resolver = createPhoneResolver(
        makeDeps({
          phone_outbound_sid: "PN_hotline",
          phone_system_sid: "PN_removed",
        }),
      );
      const result = await resolver(TEST_ORG, "system");
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
      const result = await resolver(TEST_ORG, "outbound");
      expect(result).toBeNull();
    });

    it("returns null when no phones are provisioned (system)", async () => {
      const resolver = createPhoneResolver(
        makeDeps({ phone_outbound_sid: null, phone_system_sid: null }, []),
      );
      const result = await resolver(TEST_ORG, "system");
      expect(result).toBeNull();
    });

    it("picks correct number from multiple provisioned", async () => {
      const resolver = createPhoneResolver(
        makeDeps({ phone_outbound_sid: "PN_backup", phone_system_sid: null }),
      );
      const result = await resolver(TEST_ORG, "outbound");
      expect(result).toBe("+15553333333");
    });
  });

  describe("identifier routing", () => {
    it("gives the schema name to the tenant read and the UUID to the platform read", async () => {
      const seen: { orgConfigArg?: string; provisionedArg?: string } = {};
      const resolver = createPhoneResolver({
        getOrgConfig: async (orgSchema) => {
          seen.orgConfigArg = orgSchema;
          return { phone_outbound_sid: null, phone_system_sid: null };
        },
        getProvisionedPhones: async (orgId) => {
          seen.provisionedArg = orgId;
          return PHONES;
        },
      });

      await resolver(TEST_ORG, "outbound");

      // org_config lives in the tenant schema, telephony_config is a platform
      // table keyed by uuid. Swapping these makes Postgres reject the value.
      expect(seen.orgConfigArg).toBe(TEST_ORG.orgSchema);
      expect(seen.provisionedArg).toBe(TEST_ORG_ID);
      expect(seen.provisionedArg).not.toContain("org_");
    });
  });
});
