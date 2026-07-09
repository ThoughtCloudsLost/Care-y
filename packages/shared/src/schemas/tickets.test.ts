import { describe, expect, it } from "vitest";
import {
  ticketStatusSchema,
  ticketPrioritySchema,
  followUpSourceSchema,
  followUpTypeSchema,
  createTicketInputSchema,
  createFollowUpInputSchema,
  resolveCreateTargetInputSchema,
  ticketListInputSchema,
  uploadAttachmentInputSchema,
  mergeClientsInputSchema,
  createQueueInputSchema,
  updateQueueInputSchema,
  deleteQueueInputSchema,
  createPresetReplyInputSchema,
  updatePresetReplyInputSchema,
  addDependencyInputSchema,
  undoMergeInputSchema,
  updateTicketInputSchema,
  followUpListInputSchema,
  listReadStateInputSchema,
  sweepReadStateInputSchema,
  searchClientsInputSchema,
  callStatusSchema,
} from "./tickets.js";

/** Base64-encode a string of n arbitrary bytes. */
function fakeBase64(n: number): string {
  const bytes = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    bytes[i] = (i + 65) % 256;
  }
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440001";
const VALID_UUID_3 = "770e8400-e29b-41d4-a716-446655440002";
const VALID_BASE64 = fakeBase64(32);

describe("ticketStatusSchema", () => {
  it("accepts 'open' and 'closed'", () => {
    expect(ticketStatusSchema.safeParse("open").success).toBe(true);
    expect(ticketStatusSchema.safeParse("closed").success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(ticketStatusSchema.safeParse("pending").success).toBe(false);
    expect(ticketStatusSchema.safeParse("").success).toBe(false);
  });
});

describe("ticketPrioritySchema", () => {
  it("accepts all valid priorities", () => {
    for (const p of ["low", "normal", "high", "urgent"]) {
      expect(ticketPrioritySchema.safeParse(p).success).toBe(true);
    }
  });

  it("rejects invalid priority", () => {
    expect(ticketPrioritySchema.safeParse("critical").success).toBe(false);
  });
});

describe("followUpSourceSchema", () => {
  it("accepts all valid sources", () => {
    for (const s of ["client", "volunteer", "system"]) {
      expect(followUpSourceSchema.safeParse(s).success).toBe(true);
    }
  });

  it("rejects invalid source", () => {
    expect(followUpSourceSchema.safeParse("admin").success).toBe(false);
  });
});

describe("followUpTypeSchema", () => {
  it("accepts all valid types", () => {
    const valid = [
      "message",
      "status_change",
      "merge_note",
      "hold_change",
      "priority_change",
      "assignment_change",
      "internal_note",
      "sms_outbound",
      "sms_inbound",
      "phone_call",
      "voicemail",
    ];
    for (const t of valid) {
      expect(followUpTypeSchema.safeParse(t).success).toBe(true);
    }
  });

  it("rejects invalid type", () => {
    expect(followUpTypeSchema.safeParse("comment").success).toBe(false);
  });
});

describe("createTicketInputSchema", () => {
  const validKeyWrap = {
    ephemeralPoint: VALID_BASE64,
    nonce: VALID_BASE64,
    wrappedKey: VALID_BASE64,
  };

  const validInput = {
    id: VALID_UUID_3,
    queueId: VALID_UUID,
    clientId: VALID_UUID_2,
    encryptedTitle: VALID_BASE64,
    encryptedDescription: VALID_BASE64,
    keyGeneration: VALID_UUID,
    keyWrap: validKeyWrap,
  };

  it("accepts valid input with default priority", () => {
    const result = createTicketInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe("normal");
    }
  });

  it("accepts explicit priority", () => {
    const result = createTicketInputSchema.safeParse({
      ...validInput,
      priority: "urgent",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe("urgent");
    }
  });

  it("rejects missing required fields", () => {
    expect(createTicketInputSchema.safeParse({}).success).toBe(false);
    expect(
      createTicketInputSchema.safeParse({ queueId: VALID_UUID }).success,
    ).toBe(false);
  });

  it("rejects non-UUID strings", () => {
    expect(
      createTicketInputSchema.safeParse({
        ...validInput,
        queueId: "not-a-uuid",
      }).success,
    ).toBe(false);
  });

  it("rejects a non-UUID client-minted id", () => {
    // The id is generated in the browser and bound into the content AAD
    // before the row exists; the server accepts only UUID-shaped ids.
    expect(
      createTicketInputSchema.safeParse({
        ...validInput,
        id: "not-a-uuid",
      }).success,
    ).toBe(false);
  });

  it("rejects non-base64 encrypted fields", () => {
    expect(
      createTicketInputSchema.safeParse({
        ...validInput,
        encryptedTitle: "not base64!!!",
      }).success,
    ).toBe(false);
  });
});

describe("createFollowUpInputSchema", () => {
  const validInput = {
    id: VALID_UUID_3,
    ticketId: VALID_UUID,
    encryptedContent: VALID_BASE64,
    source: "volunteer" as const,
    type: "message" as const,
  };

  it("accepts valid input with defaults", () => {
    const result = createFollowUpInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPrivate).toBe(false);
      expect(result.data.mentionedPseudonyms).toEqual([]);
    }
  });

  it("accepts explicit isPrivate and mentionedPseudonyms", () => {
    const result = createFollowUpInputSchema.safeParse({
      ...validInput,
      isPrivate: true,
      mentionedPseudonyms: ["user-abc"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPrivate).toBe(true);
      expect(result.data.mentionedPseudonyms).toEqual(["user-abc"]);
    }
  });

  it("rejects a non-UUID client-minted id", () => {
    expect(
      createFollowUpInputSchema.safeParse({
        ...validInput,
        id: "not-a-uuid",
      }).success,
    ).toBe(false);
  });
});

describe("resolveCreateTargetInputSchema", () => {
  it("accepts a UUID clientId", () => {
    expect(
      resolveCreateTargetInputSchema.safeParse({ clientId: VALID_UUID })
        .success,
    ).toBe(true);
  });

  it("rejects a non-UUID clientId", () => {
    expect(
      resolveCreateTargetInputSchema.safeParse({ clientId: "not-a-uuid" })
        .success,
    ).toBe(false);
  });
});

describe("updateTicketInputSchema", () => {
  it("accepts partial updates", () => {
    const result = updateTicketInputSchema.safeParse({
      ticketId: VALID_UUID,
      onHold: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects without ticketId", () => {
    expect(updateTicketInputSchema.safeParse({ status: "open" }).success).toBe(
      false,
    );
  });
});

describe("ticketListInputSchema", () => {
  it("defaults limit to 50", () => {
    const result = ticketListInputSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts optional filters", () => {
    const result = ticketListInputSchema.safeParse({
      queueId: VALID_UUID,
      status: "open",
      limit: 25,
      cursor: VALID_UUID_2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects limit above 100", () => {
    expect(ticketListInputSchema.safeParse({ limit: 200 }).success).toBe(false);
  });
});

describe("listReadStateInputSchema", () => {
  /** Valid v4-shaped UUIDs varying only the final node segment. */
  function uuidBatch(n: number): string[] {
    return Array.from(
      { length: n },
      (_, i) => `550e8400-e29b-41d4-a716-${i.toString(16).padStart(12, "0")}`,
    );
  }

  it("accepts a batch of valid ticket ids", () => {
    const result = listReadStateInputSchema.safeParse({
      ticketIds: [VALID_UUID, VALID_UUID_2],
    });
    expect(result.success).toBe(true);
  });

  it("accepts exactly 50 ids", () => {
    expect(
      listReadStateInputSchema.safeParse({ ticketIds: uuidBatch(50) }).success,
    ).toBe(true);
  });

  it("rejects an empty batch", () => {
    expect(listReadStateInputSchema.safeParse({ ticketIds: [] }).success).toBe(
      false,
    );
  });

  it("rejects more than 50 ids", () => {
    expect(
      listReadStateInputSchema.safeParse({ ticketIds: uuidBatch(51) }).success,
    ).toBe(false);
  });

  it("rejects non-uuid entries", () => {
    expect(
      listReadStateInputSchema.safeParse({ ticketIds: ["not-a-uuid"] }).success,
    ).toBe(false);
  });
});

describe("sweepReadStateInputSchema", () => {
  it("defaults limit to 200 with no cursor", () => {
    const result = sweepReadStateInputSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(200);
      expect(result.data.cursor).toBeUndefined();
    }
  });

  it("accepts a uuid cursor with an explicit limit", () => {
    const result = sweepReadStateInputSchema.safeParse({
      cursor: VALID_UUID,
      limit: 50,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cursor).toBe(VALID_UUID);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects a non-uuid cursor", () => {
    expect(
      sweepReadStateInputSchema.safeParse({ cursor: "not-a-uuid" }).success,
    ).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(sweepReadStateInputSchema.safeParse({ limit: 0 }).success).toBe(
      false,
    );
  });

  it("rejects limit above 200", () => {
    expect(sweepReadStateInputSchema.safeParse({ limit: 201 }).success).toBe(
      false,
    );
  });

  it("rejects a non-integer limit", () => {
    expect(sweepReadStateInputSchema.safeParse({ limit: 10.5 }).success).toBe(
      false,
    );
  });
});

describe("followUpListInputSchema", () => {
  it("requires ticketId", () => {
    expect(followUpListInputSchema.safeParse({}).success).toBe(false);
  });

  it("defaults limit to 50 and direction to newer", () => {
    const result = followUpListInputSchema.safeParse({
      ticketId: VALID_UUID,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
      expect(result.data.direction).toBe("newer");
    }
  });

  it("accepts direction older", () => {
    const result = followUpListInputSchema.safeParse({
      ticketId: VALID_UUID,
      direction: "older",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.direction).toBe("older");
    }
  });

  it("rejects invalid direction", () => {
    expect(
      followUpListInputSchema.safeParse({
        ticketId: VALID_UUID,
        direction: "sideways",
      }).success,
    ).toBe(false);
  });
});

describe("uploadAttachmentInputSchema", () => {
  it("accepts valid input", () => {
    const result = uploadAttachmentInputSchema.safeParse({
      ticketId: VALID_UUID,
      followUpId: VALID_UUID_2,
      encryptedBlob: VALID_BASE64,
      sizeBytes: 1024,
    });
    expect(result.success).toBe(true);
  });

  it("rejects size above 50MB", () => {
    expect(
      uploadAttachmentInputSchema.safeParse({
        ticketId: VALID_UUID,
        followUpId: VALID_UUID_2,
        encryptedBlob: VALID_BASE64,
        sizeBytes: 60 * 1024 * 1024,
      }).success,
    ).toBe(false);
  });

  it("rejects zero size", () => {
    expect(
      uploadAttachmentInputSchema.safeParse({
        ticketId: VALID_UUID,
        followUpId: VALID_UUID_2,
        encryptedBlob: VALID_BASE64,
        sizeBytes: 0,
      }).success,
    ).toBe(false);
  });
});

describe("createQueueInputSchema", () => {
  it("accepts valid input with default escalateDays", () => {
    const result = createQueueInputSchema.safeParse({
      encryptedName: "AQIDBA==",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.escalateDays).toBe(0);
    }
  });

  it("rejects empty encryptedName", () => {
    expect(
      createQueueInputSchema.safeParse({ encryptedName: "" }).success,
    ).toBe(false);
  });

  it("rejects non-base64 encryptedName", () => {
    expect(
      createQueueInputSchema.safeParse({ encryptedName: "not!base64" }).success,
    ).toBe(false);
  });

  it("rejects escalateDays above 365", () => {
    expect(
      createQueueInputSchema.safeParse({ name: "Q", escalateDays: 400 })
        .success,
    ).toBe(false);
  });
});

describe("updateQueueInputSchema", () => {
  it("accepts partial update", () => {
    const result = updateQueueInputSchema.safeParse({
      queueId: VALID_UUID,
      escalateDays: 7,
    });
    expect(result.success).toBe(true);
  });
});

describe("deleteQueueInputSchema", () => {
  it("accepts queueId only (no tickets to reassign)", () => {
    const result = deleteQueueInputSchema.safeParse({
      queueId: VALID_UUID,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reassignTo).toBeUndefined();
    }
  });

  it("accepts queueId with reassignTo", () => {
    const result = deleteQueueInputSchema.safeParse({
      queueId: VALID_UUID,
      reassignTo: VALID_UUID_2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing queueId", () => {
    expect(deleteQueueInputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-UUID queueId", () => {
    expect(
      deleteQueueInputSchema.safeParse({ queueId: "not-a-uuid" }).success,
    ).toBe(false);
  });

  it("rejects non-UUID reassignTo", () => {
    expect(
      deleteQueueInputSchema.safeParse({
        queueId: VALID_UUID,
        reassignTo: "not-a-uuid",
      }).success,
    ).toBe(false);
  });

  it("rejects reassignTo equal to queueId", () => {
    expect(
      deleteQueueInputSchema.safeParse({
        queueId: VALID_UUID,
        reassignTo: VALID_UUID,
      }).success,
    ).toBe(false);
  });
});

describe("createPresetReplyInputSchema", () => {
  it("accepts valid input with default null queueId", () => {
    const result = createPresetReplyInputSchema.safeParse({
      encryptedTitle: VALID_BASE64,
      encryptedBody: VALID_BASE64,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.queueId).toBeNull();
    }
  });

  it("accepts explicit queueId", () => {
    const result = createPresetReplyInputSchema.safeParse({
      encryptedTitle: VALID_BASE64,
      encryptedBody: VALID_BASE64,
      queueId: VALID_UUID,
    });
    expect(result.success).toBe(true);
  });
});

describe("updatePresetReplyInputSchema", () => {
  it("accepts partial update", () => {
    const result = updatePresetReplyInputSchema.safeParse({
      presetId: VALID_UUID,
      encryptedTitle: VALID_BASE64,
    });
    expect(result.success).toBe(true);
  });
});

describe("addDependencyInputSchema", () => {
  it("accepts valid input", () => {
    const result = addDependencyInputSchema.safeParse({
      ticketId: VALID_UUID,
      dependsOnTicketId: VALID_UUID_2,
    });
    expect(result.success).toBe(true);
  });
});

describe("mergeClientsInputSchema", () => {
  it("accepts valid input with all required fields", () => {
    const result = mergeClientsInputSchema.safeParse({
      primaryClientId: VALID_UUID,
      secondaryClientId: VALID_UUID_2,
      encryptedSnapshot: VALID_BASE64,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing snapshot", () => {
    expect(
      mergeClientsInputSchema.safeParse({
        primaryClientId: VALID_UUID,
        secondaryClientId: VALID_UUID_2,
      }).success,
    ).toBe(false);
  });
});

describe("undoMergeInputSchema", () => {
  it("accepts valid input", () => {
    const result = undoMergeInputSchema.safeParse({
      mergeEventId: VALID_UUID,
      encryptedSnapshot: VALID_BASE64,
    });
    expect(result.success).toBe(true);
  });
});

describe("searchClientsInputSchema", () => {
  it("accepts valid query with default limit", () => {
    const result = searchClientsInputSchema.safeParse({ query: "calm" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts query with explicit limit", () => {
    const result = searchClientsInputSchema.safeParse({
      query: "pebble",
      limit: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(5);
    }
  });

  it("rejects empty query", () => {
    expect(searchClientsInputSchema.safeParse({ query: "" }).success).toBe(
      false,
    );
  });

  it("rejects query exceeding max length", () => {
    expect(
      searchClientsInputSchema.safeParse({ query: "a".repeat(101) }).success,
    ).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(
      searchClientsInputSchema.safeParse({ query: "x", limit: 0 }).success,
    ).toBe(false);
  });

  it("rejects limit above 20", () => {
    expect(
      searchClientsInputSchema.safeParse({ query: "x", limit: 21 }).success,
    ).toBe(false);
  });
});

describe("callStatusSchema", () => {
  it("accepts all valid statuses", () => {
    const valid = ["completed", "no_answer", "busy", "failed", "canceled"];
    for (const s of valid) {
      expect(callStatusSchema.safeParse(s).success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    expect(callStatusSchema.safeParse("ringing").success).toBe(false);
  });

  it("rejects Twilio's hyphenated format", () => {
    expect(callStatusSchema.safeParse("no-answer").success).toBe(false);
  });
});
