import { describe, expect, it } from "vitest";
import {
  ticketStatusSchema,
  ticketPrioritySchema,
  followUpSourceSchema,
  followUpTypeSchema,
  createTicketInputSchema,
  createFollowUpInputSchema,
  ticketListInputSchema,
  uploadAttachmentInputSchema,
  mergeClientsInputSchema,
  createQueueInputSchema,
  updateQueueInputSchema,
  createPresetReplyInputSchema,
  updatePresetReplyInputSchema,
  addDependencyInputSchema,
  markReadInputSchema,
  undoMergeInputSchema,
  updateTicketInputSchema,
  followUpListInputSchema,
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
  const validInput = {
    queueId: VALID_UUID,
    clientId: VALID_UUID_2,
    encryptedTitle: VALID_BASE64,
    encryptedDescription: VALID_BASE64,
    keyGeneration: VALID_UUID,
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
    ticketId: VALID_UUID,
    encryptedContent: VALID_BASE64,
    encryptedReadState: VALID_BASE64,
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
});

describe("markReadInputSchema", () => {
  it("accepts valid input", () => {
    const result = markReadInputSchema.safeParse({
      followUpId: VALID_UUID,
      encryptedReadState: VALID_BASE64,
    });
    expect(result.success).toBe(true);
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

describe("followUpListInputSchema", () => {
  it("requires ticketId", () => {
    expect(followUpListInputSchema.safeParse({}).success).toBe(false);
  });

  it("defaults limit to 50", () => {
    const result = followUpListInputSchema.safeParse({
      ticketId: VALID_UUID,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
    }
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
    const result = createQueueInputSchema.safeParse({ name: "General" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.escalateDays).toBe(0);
    }
  });

  it("rejects empty name", () => {
    expect(createQueueInputSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects name over 100 chars", () => {
    expect(
      createQueueInputSchema.safeParse({ name: "a".repeat(101) }).success,
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
