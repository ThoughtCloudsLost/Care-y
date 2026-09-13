import { describe, expect, it } from "vitest";
import {
  notificationEventTypeSchema,
  sseEventSchema,
  systemSseEventSchema,
  pushSubscriptionInputSchema,
  unsubscribePushInputSchema,
  metadataSearchInputSchema,
  contentSearchInputSchema,
  auditEventTypeSchema,
  auditLogQueryInputSchema,
} from "./notifications.js";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440001";
const VALID_ISO = "2026-03-24T12:00:00.000Z";

describe("notificationEventTypeSchema", () => {
  const validTypes = [
    "ticket_created",
    "ticket_assigned",
    "ticket_closed",
    "ticket_reopened",
    "ticket_escalated",
    "followup_added",
    "mention",
    "merge_completed",
    "voicemail_quarantined",
  ];

  it.each(validTypes)("accepts '%s'", (type) => {
    expect(notificationEventTypeSchema.safeParse(type).success).toBe(true);
  });

  it("rejects unknown event type", () => {
    expect(
      notificationEventTypeSchema.safeParse("ticket_deleted").success,
    ).toBe(false);
  });

  it("rejects empty string", () => {
    expect(notificationEventTypeSchema.safeParse("").success).toBe(false);
  });

  it("rejects non-string", () => {
    expect(notificationEventTypeSchema.safeParse(42).success).toBe(false);
  });
});

describe("sseEventSchema", () => {
  it("accepts valid SSE event", () => {
    const result = sseEventSchema.safeParse({
      type: "ticket_assigned",
      ticketId: VALID_UUID,
      queueId: VALID_UUID_2,
      timestamp: VALID_ISO,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing type", () => {
    expect(
      sseEventSchema.safeParse({
        ticketId: VALID_UUID,
        queueId: VALID_UUID_2,
        timestamp: VALID_ISO,
      }).success,
    ).toBe(false);
  });

  it("rejects invalid ticketId", () => {
    expect(
      sseEventSchema.safeParse({
        type: "ticket_created",
        ticketId: "not-a-uuid",
        queueName: "Intake",
        timestamp: VALID_ISO,
      }).success,
    ).toBe(false);
  });

  it("rejects invalid timestamp", () => {
    expect(
      sseEventSchema.safeParse({
        type: "ticket_created",
        ticketId: VALID_UUID,
        queueName: "Intake",
        timestamp: "not-a-date",
      }).success,
    ).toBe(false);
  });
});

describe("systemSseEventSchema", () => {
  it("accepts valid system SSE event", () => {
    const result = systemSseEventSchema.safeParse({
      type: "voicemail_quarantined",
      timestamp: VALID_ISO,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing type", () => {
    expect(
      systemSseEventSchema.safeParse({
        timestamp: VALID_ISO,
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type value", () => {
    expect(
      systemSseEventSchema.safeParse({
        type: "ticket_created",
        timestamp: VALID_ISO,
      }).success,
    ).toBe(false);
  });

  it("rejects missing timestamp", () => {
    expect(
      systemSseEventSchema.safeParse({
        type: "voicemail_quarantined",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid timestamp", () => {
    expect(
      systemSseEventSchema.safeParse({
        type: "voicemail_quarantined",
        timestamp: "not-a-date",
      }).success,
    ).toBe(false);
  });

  it("rejects extra ticket/queue fields (strict shape)", () => {
    // System events must not carry ticket or queue context.
    // The schema should only accept type + timestamp.
    const result = systemSseEventSchema.safeParse({
      type: "voicemail_quarantined",
      timestamp: VALID_ISO,
      ticketId: VALID_UUID,
      queueId: VALID_UUID_2,
    });
    // Zod object schemas strip unknown keys by default; verify
    // that a successful parse produces only type + timestamp.
    if (result.success) {
      const keys = Object.keys(result.data);
      expect(keys).toEqual(["type", "timestamp"]);
    }
  });
});

describe("pushSubscriptionInputSchema", () => {
  const validInput = {
    endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
    keys: {
      p256dh: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      auth: "AAAAAAAAAAAAAAAA",
    },
  };

  it("accepts valid subscription", () => {
    expect(pushSubscriptionInputSchema.safeParse(validInput).success).toBe(
      true,
    );
  });

  it("rejects non-URL endpoint", () => {
    expect(
      pushSubscriptionInputSchema.safeParse({
        ...validInput,
        endpoint: "not-a-url",
      }).success,
    ).toBe(false);
  });

  it("rejects empty p256dh key", () => {
    expect(
      pushSubscriptionInputSchema.safeParse({
        ...validInput,
        keys: { ...validInput.keys, p256dh: "" },
      }).success,
    ).toBe(false);
  });

  it("rejects empty auth key", () => {
    expect(
      pushSubscriptionInputSchema.safeParse({
        ...validInput,
        keys: { ...validInput.keys, auth: "" },
      }).success,
    ).toBe(false);
  });

  it("rejects missing keys", () => {
    expect(
      pushSubscriptionInputSchema.safeParse({
        endpoint: validInput.endpoint,
      }).success,
    ).toBe(false);
  });
});

describe("unsubscribePushInputSchema", () => {
  it("accepts valid endpoint", () => {
    expect(
      unsubscribePushInputSchema.safeParse({
        endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
      }).success,
    ).toBe(true);
  });

  it("rejects non-URL endpoint", () => {
    expect(
      unsubscribePushInputSchema.safeParse({ endpoint: "not-a-url" }).success,
    ).toBe(false);
  });
});

describe("metadataSearchInputSchema", () => {
  it("accepts minimal input (defaults apply)", () => {
    const result = metadataSearchInputSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(50);
      expect(result.data.status).toBeUndefined();
      expect(result.data.queueId).toBeUndefined();
    }
  });

  it("accepts full filter set", () => {
    const result = metadataSearchInputSchema.safeParse({
      status: "open",
      queueId: VALID_UUID,
      assignedTo: VALID_UUID_2,
      dateFrom: VALID_ISO,
      dateTo: VALID_ISO,
      page: 2,
      pageSize: 25,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(
      metadataSearchInputSchema.safeParse({ status: "pending" }).success,
    ).toBe(false);
  });

  it("rejects page=0", () => {
    expect(metadataSearchInputSchema.safeParse({ page: 0 }).success).toBe(
      false,
    );
  });

  it("rejects pageSize above 100", () => {
    expect(metadataSearchInputSchema.safeParse({ pageSize: 101 }).success).toBe(
      false,
    );
  });

  it("rejects non-integer page", () => {
    expect(metadataSearchInputSchema.safeParse({ page: 1.5 }).success).toBe(
      false,
    );
  });

  it("rejects non-UUID queueId", () => {
    expect(
      metadataSearchInputSchema.safeParse({ queueId: "not-uuid" }).success,
    ).toBe(false);
  });

  it("strips unknown field clientAlias (removed from schema)", () => {
    // clientAlias was removed because the server cannot substring-match
    // ciphertext. The field should be silently stripped by Zod.
    const result = metadataSearchInputSchema.safeParse({
      clientAlias: "a".repeat(101),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("clientAlias" in result.data).toBe(false);
    }
  });

  it("rejects invalid dateFrom", () => {
    expect(
      metadataSearchInputSchema.safeParse({ dateFrom: "not-a-date" }).success,
    ).toBe(false);
  });
});

describe("contentSearchInputSchema", () => {
  it("accepts minimal input (defaults apply)", () => {
    const result = contentSearchInputSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(50);
    }
  });

  it("accepts filters", () => {
    const result = contentSearchInputSchema.safeParse({
      queueId: VALID_UUID,
      status: "closed",
      page: 3,
      pageSize: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejects pageSize above 50", () => {
    expect(contentSearchInputSchema.safeParse({ pageSize: 51 }).success).toBe(
      false,
    );
  });

  it("rejects page=0", () => {
    expect(contentSearchInputSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

describe("auditEventTypeSchema", () => {
  const validTypes = [
    "ticket_created",
    "ticket_closed",
    "ticket_reopened",
    "ticket_assigned",
    "ticket_escalated",
    "ticket_merged",
    "followup_added",
    "media_soft_deleted",
    "media_hard_deleted",
    "queue_created",
    "queue_updated",
    "queue_deleted",
    "preset_created",
    "preset_updated",
    "note_type_created",
    "note_type_updated",
    "merge_undone",
    "merge_lock_changed",
    "voicemail_quarantined",
    "voicemail_quarantine_routed",
    "voicemail_quarantine_dismissed",
    "client_alias_changed",
    "client_phone_changed",
    "ticket_content_updated",
  ];

  it.each(validTypes)("accepts '%s'", (type) => {
    expect(auditEventTypeSchema.safeParse(type).success).toBe(true);
  });

  it("rejects unknown event type", () => {
    expect(auditEventTypeSchema.safeParse("user_created").success).toBe(false);
  });
});

describe("auditLogQueryInputSchema", () => {
  it("accepts minimal input (defaults apply)", () => {
    const result = auditLogQueryInputSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(50);
    }
  });

  it("accepts full filter set", () => {
    const result = auditLogQueryInputSchema.safeParse({
      eventType: "ticket_created",
      actorId: VALID_UUID,
      ticketId: VALID_UUID_2,
      dateFrom: VALID_ISO,
      dateTo: VALID_ISO,
      page: 5,
      pageSize: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid eventType", () => {
    expect(
      auditLogQueryInputSchema.safeParse({ eventType: "unknown_event" })
        .success,
    ).toBe(false);
  });

  it("rejects non-UUID actorId", () => {
    expect(
      auditLogQueryInputSchema.safeParse({ actorId: "not-uuid" }).success,
    ).toBe(false);
  });

  it("rejects pageSize above 100", () => {
    expect(auditLogQueryInputSchema.safeParse({ pageSize: 101 }).success).toBe(
      false,
    );
  });
});

describe("ticket_content_updated audit-only boundary", () => {
  it("auditEventTypeSchema accepts ticket_content_updated", () => {
    expect(
      auditEventTypeSchema.safeParse("ticket_content_updated").success,
    ).toBe(true);
  });

  it("notificationEventTypeSchema rejects ticket_content_updated", () => {
    expect(
      notificationEventTypeSchema.safeParse("ticket_content_updated").success,
    ).toBe(false);
  });
});
