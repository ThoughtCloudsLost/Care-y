import { describe, expect, it, vi } from "vitest";
import {
  createNotificationSmsJobHandler,
  type NotificationSmsJobDeps,
} from "./notification-sms.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import type {
  TelephonyProvider,
  SendSmsResult,
} from "../telephony/provider.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { ValidationError } from "../errors.js";

// --- Stubs ---

function stubEncryptor(phone: string): FieldEncryptor {
  const phoneBuf = Buffer.from(phone, "utf-8");
  return {
    encrypt: vi.fn(() => Buffer.from("encrypted")),
    encryptBuffer: vi.fn(() => Buffer.from("encrypted")),
    decrypt: vi.fn(() => phone),
    decryptToBuffer: vi.fn(() => Buffer.from(phoneBuf)),
  };
}

function stubProvider(
  behavior: "success" | "fail" = "success",
): TelephonyProvider & {
  sendSmsCalls: Array<{ to: string; body: string; from: string }>;
} {
  const sendSmsCalls: Array<{ to: string; body: string; from: string }> = [];
  return {
    sendSmsCalls,
    providerId: "mock",
    async sendSms(
      to: string,
      body: string,
      callerId: string,
    ): Promise<SendSmsResult> {
      sendSmsCalls.push({ to, body, from: callerId });
      if (behavior === "fail") {
        throw new Error("Carrier rejected");
      }
      return { messageId: "SM_test_123" };
    },
    async initiateOutboundCall() {
      return "";
    },
    async initiateWebRtcCall() {
      return "";
    },
    validateWebhook() {
      return true;
    },
    parseIncomingCall() {
      return {} as ReturnType<TelephonyProvider["parseIncomingCall"]>;
    },
    parseIncomingSms() {
      return {} as ReturnType<TelephonyProvider["parseIncomingSms"]>;
    },
    generateVoiceResponse() {
      return "";
    },
    async getRecording() {
      return Buffer.alloc(0);
    },
    async getCallDetails() {
      return { from: "+15550000001", to: "+15550000002" };
    },
    async deleteRecording() {
      // stub
    },
    async deleteCallLog() {
      // stub
    },
    async deleteMessageLog() {
      // stub
    },
    maskConfig() {
      return {} as ReturnType<TelephonyProvider["maskConfig"]>;
    },
  };
}

/**
 * Builds a minimal Kysely mock that returns preconfigured consultant rows.
 * Only the selectFrom("consultants") chain is stubbed.
 */
function stubTenantDb(
  consultantRows: Array<{
    user_id: string;
    ops_encrypted_phone: Buffer | null;
    sms_pings_enabled: boolean;
  }>,
): Kysely<TenantDatabase> {
  const execute = vi.fn(async () =>
    consultantRows
      .filter((r) => r.sms_pings_enabled)
      .map((r) => ({
        user_id: r.user_id,
        ops_encrypted_phone: r.ops_encrypted_phone,
      })),
  );

  const chainMethods = {
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    execute,
  };

  return {
    selectFrom: vi.fn(() => chainMethods),
  } as unknown as Kysely<TenantDatabase>;
}

function buildDeps(
  overrides?: Partial<NotificationSmsJobDeps>,
): NotificationSmsJobDeps & {
  provider: ReturnType<typeof stubProvider>;
} {
  const provider = overrides?.getProvider ? stubProvider() : stubProvider();
  const enc = stubEncryptor("+15551234567");
  const tDb = stubTenantDb([
    {
      user_id: "user-a",
      ops_encrypted_phone: Buffer.from("encrypted-phone"),
      sms_pings_enabled: true,
    },
  ]);

  const actualProvider = overrides?.getProvider ? stubProvider() : provider;

  return {
    provider: actualProvider,
    encryptor: overrides?.encryptor ?? enc,
    getTenantDb: overrides?.getTenantDb ?? vi.fn(() => tDb),
    getProvider: overrides?.getProvider ?? vi.fn(async () => actualProvider),
    resolveCallerIdByPurpose:
      overrides?.resolveCallerIdByPurpose ?? vi.fn(async () => "+15559990000"),
  };
}

const VALID_PAYLOAD = {
  orgSchema: "org_abc",
  orgSlug: "test-org",
  recipientUserIds: ["user-a"],
  eventType: "ticket_assigned" as const,
};

describe("notification-sms job handler", () => {
  it("sends exactly one SMS ping to an opted-in recipient with the org caller ID", async () => {
    const provider = stubProvider();
    const enc = stubEncryptor("+15551234567");
    const tDb = stubTenantDb([
      {
        user_id: "user-a",
        ops_encrypted_phone: Buffer.from("encrypted-phone"),
        sms_pings_enabled: true,
      },
    ]);
    const callerFrom = "+15559990000";

    const deps: NotificationSmsJobDeps = {
      encryptor: enc,
      getTenantDb: vi.fn(() => tDb),
      getProvider: vi.fn(async () => provider),
      resolveCallerIdByPurpose: vi.fn(async () => callerFrom),
    };

    const handler = createNotificationSmsJobHandler(deps);
    await handler(VALID_PAYLOAD);

    expect(provider.sendSmsCalls).toHaveLength(1);
    const call = provider.sendSmsCalls[0]!;
    expect(call.to).toBe("+15551234567");
    expect(call.from).toBe(callerFrom);
    // Body is metadata-only (login URL), no event details
    expect(call.body).toContain("test-org.care-y.app");
    expect(call.body).not.toContain("ticket_assigned");
  });

  it("silently skips a recipient who is not opted in (no consultant row)", async () => {
    const provider = stubProvider();
    // Empty consultant rows: the recipient has no consultant entry
    const tDb = stubTenantDb([]);

    const deps: NotificationSmsJobDeps = {
      encryptor: stubEncryptor("+15551234567"),
      getTenantDb: vi.fn(() => tDb),
      getProvider: vi.fn(async () => provider),
      resolveCallerIdByPurpose: vi.fn(async () => "+15559990000"),
    };

    const handler = createNotificationSmsJobHandler(deps);
    await handler(VALID_PAYLOAD);

    // No SMS sent
    expect(provider.sendSmsCalls).toHaveLength(0);
  });

  it("silently skips a recipient with null ops_encrypted_phone", async () => {
    const provider = stubProvider();
    const tDb = stubTenantDb([
      {
        user_id: "user-a",
        ops_encrypted_phone: null,
        sms_pings_enabled: true,
      },
    ]);

    const deps: NotificationSmsJobDeps = {
      encryptor: stubEncryptor("+15551234567"),
      getTenantDb: vi.fn(() => tDb),
      getProvider: vi.fn(async () => provider),
      resolveCallerIdByPurpose: vi.fn(async () => "+15559990000"),
    };

    const handler = createNotificationSmsJobHandler(deps);
    await handler(VALID_PAYLOAD);

    expect(provider.sendSmsCalls).toHaveLength(0);
  });

  it("isolates per-recipient failures (sender throw does not block next recipient)", async () => {
    let callCount = 0;
    const sendSmsCalls: Array<{ to: string }> = [];
    const failingProvider: TelephonyProvider = {
      ...stubProvider(),
      async sendSms(
        to: string,
        _body: string,
        _callerId: string,
      ): Promise<SendSmsResult> {
        callCount++;
        sendSmsCalls.push({ to });
        if (callCount === 1) {
          throw new Error("First recipient fails");
        }
        return { messageId: "SM_ok" };
      },
    };

    const encryptor: FieldEncryptor = {
      encrypt: vi.fn(() => Buffer.from("encrypted")),
      encryptBuffer: vi.fn(() => Buffer.from("encrypted")),
      decrypt: vi.fn(),
      decryptToBuffer: vi.fn((ct: Buffer) => {
        // Return different numbers for different ciphertexts
        const tag = ct.toString("utf-8");
        if (tag === "enc-phone-a") return Buffer.from("+15551111111");
        return Buffer.from("+15552222222");
      }),
    };

    const tDb = stubTenantDb([
      {
        user_id: "user-a",
        ops_encrypted_phone: Buffer.from("enc-phone-a"),
        sms_pings_enabled: true,
      },
      {
        user_id: "user-b",
        ops_encrypted_phone: Buffer.from("enc-phone-b"),
        sms_pings_enabled: true,
      },
    ]);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
      // suppress log noise in test
    });

    const deps: NotificationSmsJobDeps = {
      encryptor,
      getTenantDb: vi.fn(() => tDb),
      getProvider: vi.fn(async () => failingProvider),
      resolveCallerIdByPurpose: vi.fn(async () => "+15559990000"),
    };

    const handler = createNotificationSmsJobHandler(deps);
    await handler({
      ...VALID_PAYLOAD,
      recipientUserIds: ["user-a", "user-b"],
    });

    // Both recipients were attempted
    expect(sendSmsCalls).toHaveLength(2);
    // Error was logged for the first recipient
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("user-a"));
    // The log message must not contain any phone number
    for (const call of consoleSpy.mock.calls) {
      const msg = String(call[0]);
      expect(msg).not.toContain("+1555");
    }

    consoleSpy.mockRestore();
  });

  it("throws ValidationError on invalid payload schema", async () => {
    const { provider, ...depsWithoutProvider } = buildDeps();
    const deps: NotificationSmsJobDeps = {
      ...depsWithoutProvider,
      getProvider: vi.fn(async () => provider),
    };
    const handler = createNotificationSmsJobHandler(deps);

    // Missing required fields
    await expect(handler({ orgSchema: "x" })).rejects.toThrow(ValidationError);

    // Invalid eventType
    await expect(
      handler({
        orgSchema: "x",
        orgSlug: "y",
        recipientUserIds: ["user-a"],
        eventType: "not_a_real_event",
      }),
    ).rejects.toThrow(ValidationError);

    // Provider should not have been called
    expect(provider.sendSmsCalls).toHaveLength(0);
  });

  it("returns early without querying when recipientUserIds is empty", async () => {
    const getTenantDb = vi.fn();
    const deps: NotificationSmsJobDeps = {
      encryptor: stubEncryptor("+15551234567"),
      getTenantDb,
      getProvider: vi.fn(async () => stubProvider()),
      resolveCallerIdByPurpose: vi.fn(async () => "+15559990000"),
    };

    const handler = createNotificationSmsJobHandler(deps);
    await handler({ ...VALID_PAYLOAD, recipientUserIds: [] });

    // getTenantDb should not have been called (no DB work)
    expect(getTenantDb).not.toHaveBeenCalled();
  });
});
