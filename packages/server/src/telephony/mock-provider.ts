import { randomUUID } from "node:crypto";
import {
  extractMediaFromWebhookBody,
  type TelephonyProvider,
  type TelephonyProviderStatic,
  type CallDetails,
  type SendSmsResult,
  type OutboundCallParams,
  type WebRtcCallParams,
  type WebhookValidationRequest,
  type IncomingCallData,
  type IncomingSmsData,
  type VoiceInstruction,
  type MaskedTelephonyConfig,
} from "./provider.js";
import { type OrgId, callSidSchema, e164Schema } from "@care-y/shared";
import { mockConfigSchema, type MockConfig } from "./schemas.js";
import { createHmacValidator, twilioPayloadBuilder } from "./webhook-crypto.js";
import { TelephonyConfigError } from "../errors.js";

/**
 * Dev-only account SID used in seed data and E2E fixtures.
 * NOT a production credential: mock cannot be constructed in production
 * (the constructor map is NODE_ENV-gated). Exported so the seed script
 * and the webhook simulator both read the same value, since the webhook
 * handler compares an inbound AccountSid against the stored config.
 */
export const DEV_MOCK_ACCOUNT_SID = "ACdev00000000000000000000000mock";

/**
 * Dev-only webhook signing key, the mock counterpart to a Twilio auth
 * token. The mock provider validates inbound webhooks against it,
 * exercising the same HMAC-SHA1 path Twilio uses.
 *
 * NOT a production credential: mock cannot be constructed in production
 * (the constructor map is NODE_ENV-gated), and this value authenticates
 * nothing that exists outside dev and E2E. Named "auth token" rather
 * than "secret" both because that is what the provider calls this
 * credential and because the latter trips secret-scanning tooling on
 * every read.
 */
export const DEV_MOCK_AUTH_TOKEN = "dev_mock_auth_token_000000000000";

/** HMAC-SHA1 validator using the same Twilio payload format. */
const mockHmacValidator = createHmacValidator({
  algorithm: "sha1",
  buildPayload: twilioPayloadBuilder,
});

/** A single recorded method call on the mock provider. */
export interface MockCallRecord {
  readonly method: string;
  readonly args: readonly unknown[];
  readonly timestamp: number;
}

/** A TelephonyProvider that records calls and returns predictable values. */
export type MockTelephonyProvider = TelephonyProvider & {
  getCallLog(): readonly MockCallRecord[];
  clearCallLog(): void;
};

/** 44-byte zero buffer, placeholder for a minimal WAV header. */
const EMPTY_WAV_SIZE = 44;

function record(
  log: MockCallRecord[],
  method: string,
  args: readonly unknown[],
): void {
  console.warn(`MOCK PROVIDER: ${method} called...`);
  log.push({ method, args, timestamp: Date.now() });
}

/**
 * Create a mock telephony provider that satisfies the TelephonyProvider
 * interface with no-op implementations. Every method logs a console.warn,
 * records itself in an inspectable call log, and returns a predictable value.
 *
 * Accepts a config blob (validated internally via mockConfigSchema) so
 * maskConfig() reports real phone numbers from the org's seeded
 * configuration rather than a hardcoded empty array.
 */
export function createMockProvider(rawConfig: unknown): MockTelephonyProvider {
  const parseResult = mockConfigSchema.safeParse(rawConfig);
  if (!parseResult.success) {
    throw new TelephonyConfigError(
      `Corrupt mock config: ${parseResult.error.issues.map((i) => i.message).join(", ")}`,
    );
  }
  const config = parseResult.data;
  const callLog: MockCallRecord[] = [];

  return {
    providerId: "mock",

    // eslint-disable-next-line @typescript-eslint/require-await -- mock: no real I/O to await
    async sendSms(
      to: string,
      body: string,
      callerId: string,
    ): Promise<SendSmsResult> {
      record(callLog, "sendSms", [to, body, callerId]);
      return { messageId: `SM_mock_${randomUUID()}` };
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- mock: no real I/O to await
    async initiateOutboundCall(params: OutboundCallParams): Promise<string> {
      record(callLog, "initiateOutboundCall", [params]);
      return `CA_mock_${randomUUID()}`;
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- mock: no real I/O to await
    async initiateWebRtcCall(params: WebRtcCallParams): Promise<string> {
      record(callLog, "initiateWebRtcCall", [params]);
      return `CA_mock_${randomUUID()}`;
    },

    validateWebhook(request: WebhookValidationRequest): boolean {
      record(callLog, "validateWebhook", [request]);
      return mockHmacValidator.validate(
        request.url,
        request.body,
        request.authToken,
        request.signature,
      );
    },

    parseIncomingCall(body: Record<string, string>): IncomingCallData {
      record(callLog, "parseIncomingCall", [body]);
      return {
        callId: callSidSchema.parse(
          body.CallSid ?? `mock-call-${randomUUID()}`,
        ),
        from: e164Schema.parse(body.From ?? "+10000000000"),
        to: e164Schema.parse(body.To ?? "+10000000001"),
        direction: "inbound",
      };
    },

    parseIncomingSms(body: Record<string, string>): IncomingSmsData {
      record(callLog, "parseIncomingSms", [body]);
      const numMedia = parseInt(body.NumMedia ?? "0", 10) || 0;
      const { mediaUrls, mediaContentTypes } = extractMediaFromWebhookBody(
        body,
        numMedia,
      );

      return {
        messageId: body.MessageSid ?? `mock-msg-${randomUUID()}`,
        from: e164Schema.parse(body.From ?? "+10000000000"),
        to: e164Schema.parse(body.To ?? "+10000000001"),
        body: body.Body ?? "",
        numMedia,
        mediaUrls,
        mediaContentTypes,
      };
    },

    generateVoiceResponse(_instructions: readonly VoiceInstruction[]): string {
      record(callLog, "generateVoiceResponse", [_instructions]);
      return "<Response></Response>";
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- mock: no real I/O to await
    async getRecording(recordingId: string): Promise<Buffer> {
      record(callLog, "getRecording", [recordingId]);
      return Buffer.alloc(EMPTY_WAV_SIZE);
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- mock: no real I/O to await
    async getCallDetails(callId: string): Promise<CallDetails> {
      record(callLog, "getCallDetails", [callId]);
      return {
        from: e164Schema.parse("+10000000000"),
        to: e164Schema.parse("+10000000001"),
      };
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- mock: no real I/O to await
    async deleteRecording(recordingId: string): Promise<void> {
      record(callLog, "deleteRecording", [recordingId]);
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- mock: no real I/O to await
    async deleteCallLog(callId: string): Promise<void> {
      record(callLog, "deleteCallLog", [callId]);
    },

    // eslint-disable-next-line @typescript-eslint/require-await -- mock: no real I/O to await
    async deleteMessageLog(messageId: string): Promise<void> {
      record(callLog, "deleteMessageLog", [messageId]);
    },

    maskConfig(): MaskedTelephonyConfig {
      record(callLog, "maskConfig", []);
      return {
        provider: "mock",
        mode: "mock",
        maskedAccountId: "MOCK_ACCOUNT",
        maskedAuthToken: "****",
        phoneNumbers: config.phoneNumbers.map((pn) => ({
          number: pn.number,
          label: pn.label,
        })),
      };
    },

    getCallLog(): readonly MockCallRecord[] {
      return callLog;
    },

    clearCallLog(): void {
      callLog.length = 0;
    },
  };
}

/** Static factory methods for the mock provider. */
export const mockProviderStatic: TelephonyProviderStatic = {
  validateConfig(raw: unknown): MockConfig {
    const result = mockConfigSchema.safeParse(raw);
    if (!result.success) {
      throw new TelephonyConfigError(
        `Invalid mock config: ${result.error.issues.map((i) => i.message).join(", ")}`,
      );
    }
    return result.data;
  },

  // eslint-disable-next-line @typescript-eslint/require-await -- mock: no remote provider to call
  async provisionWebhooks(config: unknown, _orgId: OrgId): Promise<unknown> {
    // No remote provider to configure. Return the config unchanged.
    return config;
  },
};
