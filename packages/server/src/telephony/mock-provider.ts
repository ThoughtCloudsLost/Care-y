import { randomUUID } from "node:crypto";
import type {
  TelephonyProvider,
  SendSmsResult,
  OutboundCallParams,
  WebRtcCallParams,
  WebhookValidationRequest,
  IncomingCallData,
  IncomingSmsData,
  VoiceInstruction,
  MaskedTelephonyConfig,
} from "./provider.js";

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
 */
export function createMockProvider(): MockTelephonyProvider {
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

    validateWebhook(_request: WebhookValidationRequest): boolean {
      record(callLog, "validateWebhook", [_request]);
      return true;
    },

    parseIncomingCall(body: Record<string, string>): IncomingCallData {
      record(callLog, "parseIncomingCall", [body]);
      return {
        callId: body.CallSid ?? `mock-call-${randomUUID()}`,
        from: body.From ?? "+10000000000",
        to: body.To ?? "+10000000001",
        direction: "inbound",
      };
    },

    parseIncomingSms(body: Record<string, string>): IncomingSmsData {
      record(callLog, "parseIncomingSms", [body]);
      const numMedia = parseInt(body.NumMedia ?? "0", 10) || 0;

      const mediaUrls: string[] = [];
      const mediaContentTypes: string[] = [];
      for (let i = 0; i < numMedia; i++) {
        const url = body[`MediaUrl${String(i)}`];
        const contentType = body[`MediaContentType${String(i)}`];
        if (url !== undefined) mediaUrls.push(url);
        if (contentType !== undefined) mediaContentTypes.push(contentType);
      }

      return {
        messageId: body.MessageSid ?? `mock-msg-${randomUUID()}`,
        from: body.From ?? "+10000000000",
        to: body.To ?? "+10000000001",
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
        phoneNumbers: [],
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
