import { describe, expect, it } from "vitest";
import {
  newOrgId,
  orgSchemaFor,
  newRecordingId,
  newVoicemailQuarantineId,
  newClientAccountId,
  newFormAssetId,
  channelSecretSchema,
  phoneMatchHashSchema,
  emailMatchHashSchema,
  aliasHashSchema,
} from "./ids.js";
import type { OrgId } from "./ids.js";

// UUID v4 lowercase hex with hyphens, 36 chars total.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("newOrgId", () => {
  it("returns a UUID-shaped string", () => {
    expect(newOrgId()).toMatch(UUID_PATTERN);
  });

  it("produces distinct values on consecutive calls", () => {
    expect(newOrgId()).not.toBe(newOrgId());
  });
});

describe("orgSchemaFor", () => {
  it("prefixes the org id with org_ to form the tenant schema name", () => {
    // Justification: the schema name is used as a PostgreSQL schema
    // identifier via Kysely .withSchema(); the org_ prefix and the
    // exact UUID concatenation are the contract the migration system
    // and tenantDb() depend on (ADR-004).
    const id = "550e8400-e29b-41d4-a716-446655440000" as OrgId;
    expect(orgSchemaFor(id)).toBe("org_550e8400-e29b-41d4-a716-446655440000");
  });

  it("returns a value matching the orgSchemaNameSchema regex", () => {
    const schema = orgSchemaFor(newOrgId());
    expect(schema).toMatch(
      /^org_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});

describe("newRecordingId", () => {
  it("returns a UUID-shaped string", () => {
    expect(newRecordingId()).toMatch(UUID_PATTERN);
  });

  it("produces distinct values on consecutive calls", () => {
    expect(newRecordingId()).not.toBe(newRecordingId());
  });
});

describe("newVoicemailQuarantineId", () => {
  it("returns a UUID-shaped string", () => {
    expect(newVoicemailQuarantineId()).toMatch(UUID_PATTERN);
  });

  it("produces distinct values on consecutive calls", () => {
    expect(newVoicemailQuarantineId()).not.toBe(newVoicemailQuarantineId());
  });
});

describe("newClientAccountId", () => {
  it("returns a UUID-shaped string", () => {
    expect(newClientAccountId()).toMatch(UUID_PATTERN);
  });

  it("produces distinct values on consecutive calls", () => {
    expect(newClientAccountId()).not.toBe(newClientAccountId());
  });
});

describe("newFormAssetId", () => {
  it("returns a UUID-shaped string", () => {
    expect(newFormAssetId()).toMatch(UUID_PATTERN);
  });

  it("produces distinct values on consecutive calls", () => {
    expect(newFormAssetId()).not.toBe(newFormAssetId());
  });
});

// ---------------------------------------------------------------------------
// Branded hash schema validation (A1#17)
// ---------------------------------------------------------------------------

const VALID_HEX_128 = "a".repeat(128);

describe("phoneMatchHashSchema", () => {
  it("accepts 128 lowercase hex characters", () => {
    expect(phoneMatchHashSchema.safeParse(VALID_HEX_128).success).toBe(true);
  });

  it("rejects 127 characters", () => {
    expect(phoneMatchHashSchema.safeParse("a".repeat(127)).success).toBe(false);
  });

  it("rejects 129 characters", () => {
    expect(phoneMatchHashSchema.safeParse("a".repeat(129)).success).toBe(false);
  });

  it("rejects uppercase hex", () => {
    expect(phoneMatchHashSchema.safeParse("A".repeat(128)).success).toBe(false);
  });

  it("rejects non-hex characters", () => {
    expect(phoneMatchHashSchema.safeParse("g" + "a".repeat(127)).success).toBe(
      false,
    );
  });
});

describe("emailMatchHashSchema", () => {
  it("accepts 128 lowercase hex characters", () => {
    expect(emailMatchHashSchema.safeParse(VALID_HEX_128).success).toBe(true);
  });

  it("rejects 127 characters", () => {
    expect(emailMatchHashSchema.safeParse("a".repeat(127)).success).toBe(false);
  });

  it("rejects 129 characters", () => {
    expect(emailMatchHashSchema.safeParse("a".repeat(129)).success).toBe(false);
  });

  it("rejects uppercase hex", () => {
    expect(emailMatchHashSchema.safeParse("A".repeat(128)).success).toBe(false);
  });

  it("rejects non-hex characters", () => {
    expect(emailMatchHashSchema.safeParse("z" + "a".repeat(127)).success).toBe(
      false,
    );
  });
});

describe("aliasHashSchema", () => {
  it("accepts 128 lowercase hex characters", () => {
    expect(aliasHashSchema.safeParse(VALID_HEX_128).success).toBe(true);
  });

  it("rejects 127 characters", () => {
    expect(aliasHashSchema.safeParse("a".repeat(127)).success).toBe(false);
  });

  it("rejects 129 characters", () => {
    expect(aliasHashSchema.safeParse("a".repeat(129)).success).toBe(false);
  });

  it("rejects uppercase hex", () => {
    expect(aliasHashSchema.safeParse("A".repeat(128)).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// channelSecretSchema validation (A1#4)
// ---------------------------------------------------------------------------

describe("channelSecretSchema", () => {
  it("accepts 48 lowercase hex characters", () => {
    expect(channelSecretSchema.safeParse("a".repeat(48)).success).toBe(true);
  });

  it("rejects 47 characters", () => {
    expect(channelSecretSchema.safeParse("a".repeat(47)).success).toBe(false);
  });

  it("rejects 49 characters", () => {
    expect(channelSecretSchema.safeParse("a".repeat(49)).success).toBe(false);
  });

  it("rejects uppercase hex", () => {
    expect(channelSecretSchema.safeParse("A".repeat(48)).success).toBe(false);
  });

  it("rejects non-hex characters", () => {
    expect(channelSecretSchema.safeParse("g" + "a".repeat(47)).success).toBe(
      false,
    );
  });
});
