import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import {
  quarantineReasonSchema,
  quarantineStatusSchema,
  listQuarantineInputSchema,
  downloadQuarantineInputSchema,
  routeQuarantineInputSchema,
  dismissQuarantineInputSchema,
  setIntakeQueueInputSchema,
  VOICEMAIL_QUARANTINE_MAX_BYTES,
  VOICEMAIL_QUARANTINE_MAX_BASE64_LENGTH,
  SYSTEM_ACTOR_ID,
} from "./voicemail-quarantine.js";

const VALID_UUID = randomUUID();
const VALID_UUID_2 = randomUUID();

describe("quarantineReasonSchema", () => {
  const validReasons = ["tracker_miss", "no_intake_queue", "unresolved_client"];

  it.each(validReasons)("accepts '%s'", (reason) => {
    expect(quarantineReasonSchema.safeParse(reason).success).toBe(true);
  });

  it("rejects unknown reason", () => {
    expect(quarantineReasonSchema.safeParse("bad_reason").success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(quarantineReasonSchema.safeParse("").success).toBe(false);
  });
});

describe("quarantineStatusSchema", () => {
  const validStatuses = ["pending", "routed", "dismissed"];

  it.each(validStatuses)("accepts '%s'", (status) => {
    expect(quarantineStatusSchema.safeParse(status).success).toBe(true);
  });

  it("rejects unknown status", () => {
    expect(quarantineStatusSchema.safeParse("archived").success).toBe(false);
  });
});

describe("listQuarantineInputSchema", () => {
  it("accepts minimal input with defaults", () => {
    const result = listQuarantineInputSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
      expect(result.data.status).toBeUndefined();
    }
  });

  it("accepts explicit status filter", () => {
    const result = listQuarantineInputSchema.safeParse({ status: "pending" });
    expect(result.success).toBe(true);
  });

  it("enforces limit cap at 200", () => {
    expect(listQuarantineInputSchema.safeParse({ limit: 201 }).success).toBe(
      false,
    );
  });

  it("rejects limit below 1", () => {
    expect(listQuarantineInputSchema.safeParse({ limit: 0 }).success).toBe(
      false,
    );
  });

  it("rejects non-integer limit", () => {
    expect(listQuarantineInputSchema.safeParse({ limit: 1.5 }).success).toBe(
      false,
    );
  });
});

describe("downloadQuarantineInputSchema", () => {
  it("accepts valid uuid", () => {
    expect(
      downloadQuarantineInputSchema.safeParse({ quarantineId: VALID_UUID })
        .success,
    ).toBe(true);
  });

  it("rejects non-uuid", () => {
    expect(
      downloadQuarantineInputSchema.safeParse({ quarantineId: "not-uuid" })
        .success,
    ).toBe(false);
  });
});

describe("routeQuarantineInputSchema", () => {
  const baseInput = {
    quarantineId: VALID_UUID,
    audioData: "AQID", // valid short base64
  };

  it("accepts clientId target variant", () => {
    const result = routeQuarantineInputSchema.safeParse({
      ...baseInput,
      target: { type: "clientId", clientId: VALID_UUID_2 },
    });
    expect(result.success).toBe(true);
  });

  it("accepts clientToken target variant", () => {
    const result = routeQuarantineInputSchema.safeParse({
      ...baseInput,
      target: { type: "clientToken", clientToken: "abc-token" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts ticketId target variant", () => {
    const result = routeQuarantineInputSchema.safeParse({
      ...baseInput,
      target: { type: "ticketId", ticketId: VALID_UUID_2 },
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional durationSeconds", () => {
    const result = routeQuarantineInputSchema.safeParse({
      ...baseInput,
      target: { type: "clientId", clientId: VALID_UUID_2 },
      durationSeconds: 42,
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown target type", () => {
    const result = routeQuarantineInputSchema.safeParse({
      ...baseInput,
      target: { type: "unknown", id: VALID_UUID_2 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty target object", () => {
    const result = routeQuarantineInputSchema.safeParse({
      ...baseInput,
      target: {},
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing target", () => {
    const result = routeQuarantineInputSchema.safeParse({
      quarantineId: VALID_UUID,
      audioData: "AQID",
    });
    expect(result.success).toBe(false);
  });

  it("rejects oversized audioData", () => {
    const oversized = "A".repeat(VOICEMAIL_QUARANTINE_MAX_BASE64_LENGTH + 1);
    const result = routeQuarantineInputSchema.safeParse({
      ...baseInput,
      audioData: oversized,
      target: { type: "clientId", clientId: VALID_UUID_2 },
    });
    expect(result.success).toBe(false);
  });

  it("accepts audioData at exact max length", () => {
    const maxLen = "A".repeat(VOICEMAIL_QUARANTINE_MAX_BASE64_LENGTH);
    const result = routeQuarantineInputSchema.safeParse({
      ...baseInput,
      audioData: maxLen,
      target: { type: "clientId", clientId: VALID_UUID_2 },
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty audioData", () => {
    const result = routeQuarantineInputSchema.safeParse({
      quarantineId: VALID_UUID,
      audioData: "",
      target: { type: "clientId", clientId: VALID_UUID_2 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects clientToken with empty string", () => {
    const result = routeQuarantineInputSchema.safeParse({
      ...baseInput,
      target: { type: "clientToken", clientToken: "" },
    });
    expect(result.success).toBe(false);
  });
});

describe("dismissQuarantineInputSchema", () => {
  it("accepts valid uuid", () => {
    expect(
      dismissQuarantineInputSchema.safeParse({ quarantineId: VALID_UUID })
        .success,
    ).toBe(true);
  });

  it("rejects non-uuid", () => {
    expect(
      dismissQuarantineInputSchema.safeParse({ quarantineId: "bad" }).success,
    ).toBe(false);
  });
});

describe("setIntakeQueueInputSchema", () => {
  it("accepts a uuid queueId", () => {
    const result = setIntakeQueueInputSchema.safeParse({
      queueId: VALID_UUID,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null queueId", () => {
    const result = setIntakeQueueInputSchema.safeParse({ queueId: null });
    expect(result.success).toBe(true);
  });

  it("rejects non-uuid string", () => {
    expect(
      setIntakeQueueInputSchema.safeParse({ queueId: "not-a-uuid" }).success,
    ).toBe(false);
  });

  it("rejects missing queueId", () => {
    expect(setIntakeQueueInputSchema.safeParse({}).success).toBe(false);
  });
});

describe("constants", () => {
  it("VOICEMAIL_QUARANTINE_MAX_BYTES is 10 MB", () => {
    expect(VOICEMAIL_QUARANTINE_MAX_BYTES).toBe(10 * 1024 * 1024);
  });

  it("base64 max length correctly derives from byte cap", () => {
    // ceil(10485760 / 3) * 4
    const expected = Math.ceil(VOICEMAIL_QUARANTINE_MAX_BYTES / 3) * 4;
    expect(VOICEMAIL_QUARANTINE_MAX_BASE64_LENGTH).toBe(expected);
  });

  it("SYSTEM_ACTOR_ID is a nil UUID", () => {
    expect(SYSTEM_ACTOR_ID).toBe("00000000-0000-0000-0000-000000000000");
  });
});
