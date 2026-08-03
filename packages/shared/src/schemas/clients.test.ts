import { describe, expect, it } from "vitest";
import {
  clientListInputSchema,
  clientGetInputSchema,
  updateAliasInputSchema,
  updatePhoneInputSchema,
  suggestDuplicatesInputSchema,
} from "./clients.js";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440001";

describe("clientListInputSchema", () => {
  it("accepts empty input with defaults", () => {
    const result = clientListInputSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe("");
      expect(result.data.sortBy).toBe("created_at");
      expect(result.data.sortDirection).toBe("desc");
      expect(result.data.limit).toBe(25);
      expect(result.data.cursor).toBeUndefined();
    }
  });

  it("accepts explicit sort and pagination", () => {
    const result = clientListInputSchema.safeParse({
      query: "calm",
      sortBy: "ticket_count",
      sortDirection: "desc",
      limit: 50,
      cursor: VALID_UUID,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe("calm");
      expect(result.data.sortBy).toBe("ticket_count");
      expect(result.data.sortDirection).toBe("desc");
      expect(result.data.limit).toBe(50);
      expect(result.data.cursor).toBe(VALID_UUID);
    }
  });

  it("rejects query exceeding 200 characters", () => {
    expect(
      clientListInputSchema.safeParse({ query: "a".repeat(201) }).success,
    ).toBe(false);
  });

  it("rejects invalid sortBy value", () => {
    expect(clientListInputSchema.safeParse({ sortBy: "phone" }).success).toBe(
      false,
    );
  });

  it("rejects limit above 100", () => {
    expect(clientListInputSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(clientListInputSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects non-UUID cursor", () => {
    expect(
      clientListInputSchema.safeParse({ cursor: "not-a-uuid" }).success,
    ).toBe(false);
  });
});

describe("clientGetInputSchema", () => {
  it("accepts a valid UUID clientId", () => {
    const result = clientGetInputSchema.safeParse({ clientId: VALID_UUID });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.clientId).toBe(VALID_UUID);
    }
  });

  it("rejects a non-UUID clientId", () => {
    expect(
      clientGetInputSchema.safeParse({ clientId: "not-a-uuid" }).success,
    ).toBe(false);
  });

  it("rejects missing clientId", () => {
    expect(clientGetInputSchema.safeParse({}).success).toBe(false);
  });
});

describe("updateAliasInputSchema", () => {
  it("accepts valid encrypted alias with hash", () => {
    const result = updateAliasInputSchema.safeParse({
      clientId: VALID_UUID,
      encryptedAlias: "c2VhbGVkOmNhbG0tcml2ZXItNDI=",
      aliasHash: "hmac-abc123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.encryptedAlias).toBe("c2VhbGVkOmNhbG0tcml2ZXItNDI=");
      expect(result.data.aliasHash).toBe("hmac-abc123");
    }
  });

  it("rejects empty encryptedAlias", () => {
    expect(
      updateAliasInputSchema.safeParse({
        clientId: VALID_UUID,
        encryptedAlias: "",
        aliasHash: "hmac-abc123",
      }).success,
    ).toBe(false);
  });

  it("rejects encryptedAlias exceeding 4096 characters", () => {
    expect(
      updateAliasInputSchema.safeParse({
        clientId: VALID_UUID,
        encryptedAlias: "a".repeat(4097),
        aliasHash: "hmac-abc123",
      }).success,
    ).toBe(false);
  });

  it("rejects empty aliasHash", () => {
    expect(
      updateAliasInputSchema.safeParse({
        clientId: VALID_UUID,
        encryptedAlias: "c2VhbGVk",
        aliasHash: "",
      }).success,
    ).toBe(false);
  });

  it("rejects missing aliasHash", () => {
    expect(
      updateAliasInputSchema.safeParse({
        clientId: VALID_UUID,
        encryptedAlias: "c2VhbGVk",
      }).success,
    ).toBe(false);
  });

  it("rejects non-UUID clientId", () => {
    expect(
      updateAliasInputSchema.safeParse({
        clientId: "not-a-uuid",
        encryptedAlias: "c2VhbGVk",
        aliasHash: "hmac-abc123",
      }).success,
    ).toBe(false);
  });
});

describe("updatePhoneInputSchema", () => {
  it("accepts a valid E.164 phone number", () => {
    const result = updatePhoneInputSchema.safeParse({
      clientId: VALID_UUID,
      phoneNumber: "+15551234567",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phoneNumber).toBe("+15551234567");
    }
  });

  it("accepts international numbers", () => {
    const result = updatePhoneInputSchema.safeParse({
      clientId: VALID_UUID,
      phoneNumber: "+4915551234567",
    });
    expect(result.success).toBe(true);
  });

  it("accepts shortest valid E.164 (2 digits after country code)", () => {
    const result = updatePhoneInputSchema.safeParse({
      clientId: VALID_UUID,
      phoneNumber: "+11",
    });
    expect(result.success).toBe(true);
  });

  it("rejects phone number without + prefix", () => {
    expect(
      updatePhoneInputSchema.safeParse({
        clientId: VALID_UUID,
        phoneNumber: "15551234567",
      }).success,
    ).toBe(false);
  });

  it("rejects phone number starting with +0", () => {
    expect(
      updatePhoneInputSchema.safeParse({
        clientId: VALID_UUID,
        phoneNumber: "+05551234567",
      }).success,
    ).toBe(false);
  });

  it("rejects phone number exceeding 15 digits", () => {
    expect(
      updatePhoneInputSchema.safeParse({
        clientId: VALID_UUID,
        phoneNumber: "+1234567890123456",
      }).success,
    ).toBe(false);
  });

  it("rejects empty string", () => {
    expect(
      updatePhoneInputSchema.safeParse({
        clientId: VALID_UUID,
        phoneNumber: "",
      }).success,
    ).toBe(false);
  });

  it("rejects phone number with letters", () => {
    expect(
      updatePhoneInputSchema.safeParse({
        clientId: VALID_UUID,
        phoneNumber: "+1555abc4567",
      }).success,
    ).toBe(false);
  });

  it("rejects phone number with spaces or dashes", () => {
    expect(
      updatePhoneInputSchema.safeParse({
        clientId: VALID_UUID,
        phoneNumber: "+1 555 123-4567",
      }).success,
    ).toBe(false);
  });

  it("rejects non-UUID clientId", () => {
    expect(
      updatePhoneInputSchema.safeParse({
        clientId: "not-a-uuid",
        phoneNumber: "+15551234567",
      }).success,
    ).toBe(false);
  });
});

describe("suggestDuplicatesInputSchema", () => {
  it("accepts a phone hash with no exclusion", () => {
    const result = suggestDuplicatesInputSchema.safeParse({
      phoneHash: "abc123def456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.excludeClientId).toBeUndefined();
    }
  });

  it("accepts a phone hash with excludeClientId", () => {
    const result = suggestDuplicatesInputSchema.safeParse({
      phoneHash: "abc123def456",
      excludeClientId: VALID_UUID_2,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.excludeClientId).toBe(VALID_UUID_2);
    }
  });

  it("rejects empty phoneHash", () => {
    expect(
      suggestDuplicatesInputSchema.safeParse({ phoneHash: "" }).success,
    ).toBe(false);
  });

  it("rejects missing phoneHash", () => {
    expect(suggestDuplicatesInputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-UUID excludeClientId", () => {
    expect(
      suggestDuplicatesInputSchema.safeParse({
        phoneHash: "abc123",
        excludeClientId: "not-a-uuid",
      }).success,
    ).toBe(false);
  });
});
