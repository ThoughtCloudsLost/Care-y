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
import { twilioConfigSchema, type TwilioConfig } from "./schemas.js";
import { twilioHmacValidator } from "./webhook-crypto.js";
import { createProviderHttpClient } from "./provider-http.js";
import { renderVoiceXml } from "./voice-xml.js";
import { TelephonyConfigError, TelephonyError } from "../errors.js";
import { type OrgId, callSidSchema, e164Schema } from "@care-y/shared";

const TWILIO_API_BASE = "https://api.twilio.com/2010-04-01/Accounts" as const;

/** Mask all but the first 2 and last 4 characters. Short strings (<=6) become all dots. */
function maskAccountSid(sid: string): string {
  if (sid.length <= 6) {
    return "\u2022\u2022\u2022\u2022\u2022\u2022";
  }
  const prefix = sid.slice(0, 2);
  const suffix = sid.slice(-4);
  const masked = "\u2022".repeat(sid.length - 6);
  return `${prefix}${masked}${suffix}`;
}

function accountBaseUrl(accountSid: string): string {
  return `${TWILIO_API_BASE}/${accountSid}`;
}

interface TwilioSmsResponse {
  sid: string;
}

interface TwilioCallResponse {
  sid: string;
}

interface TwilioCallResource {
  from?: string;
  to?: string;
}

interface TwilioPhoneNumberResource {
  sid: string;
  phone_number: string;
  friendly_name: string;
}

interface TwilioPhoneNumberListResponse {
  incoming_phone_numbers: TwilioPhoneNumberResource[];
}

/**
 * Build a TelephonyProvider backed by Twilio's REST API.
 * One instance per org; holds that org's decrypted credentials.
 */
export function createTwilioProvider(config: unknown): TelephonyProvider {
  const parseResult = twilioConfigSchema.safeParse(config);
  if (!parseResult.success) {
    throw new TelephonyConfigError(
      `Corrupt Twilio config: ${parseResult.error.issues.map((i) => i.message).join(", ")}`,
    );
  }
  const { accountSid, authToken, mode, phoneNumbers } = parseResult.data;

  const http = createProviderHttpClient({
    baseUrl: accountBaseUrl(accountSid),
    auth: { username: accountSid, password: authToken },
  });

  return {
    providerId: "twilio",

    async sendSms(
      to: string,
      body: string,
      callerId: string,
    ): Promise<SendSmsResult> {
      const result = await http.post<TwilioSmsResponse>("/Messages.json", {
        To: to,
        From: callerId,
        Body: body,
      });
      return { messageId: result.data.sid };
    },

    async initiateOutboundCall(params: OutboundCallParams): Promise<string> {
      const result = await http.post<TwilioCallResponse>("/Calls.json", {
        To: params.consultantPhone,
        From: params.callerId,
        Url: params.confirmWebhookUrl,
        StatusCallback: params.statusWebhookUrl,
        Method: "POST",
        StatusCallbackMethod: "POST",
      });
      return result.data.sid;
    },

    async initiateWebRtcCall(params: WebRtcCallParams): Promise<string> {
      const result = await http.post<TwilioCallResponse>("/Calls.json", {
        To: params.clientPhone,
        From: params.callerId,
        StatusCallback: params.statusWebhookUrl,
        Method: "POST",
        StatusCallbackMethod: "POST",
      });
      return result.data.sid;
    },

    validateWebhook(request: WebhookValidationRequest): boolean {
      return twilioHmacValidator.validate(
        request.url,
        request.body,
        request.authToken,
        request.signature,
      );
    },

    parseIncomingCall(body: Record<string, string>): IncomingCallData {
      const callId = body.CallSid;
      const from = body.From;
      const to = body.To;

      if (callId === undefined || from === undefined || to === undefined) {
        throw new TelephonyError(
          "Missing required fields in incoming call webhook (CallSid, From, To)",
          400,
        );
      }

      return {
        callId: callSidSchema.parse(callId),
        from: e164Schema.parse(from),
        to: e164Schema.parse(to),
        direction: "inbound",
      };
    },

    parseIncomingSms(body: Record<string, string>): IncomingSmsData {
      const messageId = body.MessageSid;
      const from = body.From;
      const to = body.To;

      if (messageId === undefined || from === undefined || to === undefined) {
        throw new TelephonyError(
          "Missing required fields in incoming SMS webhook (MessageSid, From, To)",
          400,
        );
      }

      const smsBody = body.Body ?? "";
      const numMedia = parseInt(body.NumMedia ?? "0", 10) || 0;
      const { mediaUrls, mediaContentTypes } = extractMediaFromWebhookBody(
        body,
        numMedia,
      );

      return {
        messageId,
        from: e164Schema.parse(from),
        to: e164Schema.parse(to),
        body: smsBody,
        numMedia,
        mediaUrls,
        mediaContentTypes,
      };
    },

    generateVoiceResponse(instructions: readonly VoiceInstruction[]): string {
      return renderVoiceXml(instructions);
    },

    async getRecording(recordingId: string): Promise<Buffer> {
      return http.getBuffer(`/Recordings/${recordingId}.wav`);
    },

    async getCallDetails(callId: string): Promise<CallDetails> {
      const result = await http.get<TwilioCallResource>(
        "/Calls/" + callId + ".json",
      );
      const { from, to } = result.data;
      if (from === undefined || to === undefined) {
        throw new TelephonyError(
          `Missing from/to fields in call resource for ${callId}`,
          502,
        );
      }
      return { from: e164Schema.parse(from), to: e164Schema.parse(to) };
    },

    async deleteRecording(recordingId: string): Promise<void> {
      await http.delete(`/Recordings/${recordingId}.json`);
    },

    async deleteCallLog(callId: string): Promise<void> {
      await http.delete(`/Calls/${callId}.json`);
    },

    async deleteMessageLog(messageId: string): Promise<void> {
      await http.delete(`/Messages/${messageId}.json`);
    },

    maskConfig(): MaskedTelephonyConfig {
      return {
        provider: "twilio",
        mode,
        maskedAccountId: maskAccountSid(accountSid),
        maskedAuthToken: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
        phoneNumbers: phoneNumbers.map((pn) => ({ number: pn.number })),
      };
    },
  };
}

/** Static factory methods for the Twilio provider. */
export const twilioProviderStatic: TelephonyProviderStatic = {
  validateConfig(raw: unknown): TwilioConfig {
    const result = twilioConfigSchema.safeParse(raw);
    if (!result.success) {
      throw new TelephonyConfigError(
        `Invalid Twilio config: ${result.error.issues.map((i) => i.message).join(", ")}`,
      );
    }
    return result.data;
  },

  async provisionWebhooks(
    config: unknown,
    orgId: OrgId,
    baseUrl: string,
  ): Promise<TwilioConfig> {
    const parseResult = twilioConfigSchema.safeParse(config);
    if (!parseResult.success) {
      throw new TelephonyConfigError(
        `Invalid Twilio config for webhook provisioning: ${parseResult.error.issues.map((i) => i.message).join(", ")}`,
      );
    }
    const parsed: TwilioConfig = parseResult.data;
    const { accountSid, authToken, mode } = parsed;

    const http = createProviderHttpClient({
      baseUrl: accountBaseUrl(accountSid),
      auth: { username: accountSid, password: authToken },
    });

    // Cache-bust parameter to force Twilio to re-fetch webhook URLs (M8)
    const ts = Math.floor(Date.now() / 1000).toString();
    const smsUrl = `${baseUrl}/webhooks/twilio/${orgId}/sms?ts=${ts}`;
    const voiceUrl = `${baseUrl}/webhooks/twilio/${orgId}/voice?ts=${ts}`;
    const statusUrl = `${baseUrl}/webhooks/twilio/${orgId}/status?ts=${ts}`;

    // Fetch current phone numbers on the account
    const listResult = await http.get<TwilioPhoneNumberListResponse>(
      "/IncomingPhoneNumbers.json",
    );

    const updatedNumbers: TwilioConfig["phoneNumbers"] = [];

    for (const pn of listResult.data.incoming_phone_numbers) {
      await http.post(`/IncomingPhoneNumbers/${pn.sid}.json`, {
        SmsUrl: smsUrl,
        SmsMethod: "POST",
        VoiceUrl: voiceUrl,
        VoiceMethod: "POST",
        StatusCallback: statusUrl,
        StatusCallbackMethod: "POST",
      });

      updatedNumbers.push({
        number: pn.phone_number,
        sid: pn.sid,
      });
    }

    return {
      mode,
      accountSid,
      authToken,
      phoneNumbers: updatedNumbers,
    };
  },
};

function masterHttpClient(
  masterSid: string,
  masterAuthToken: string,
): ReturnType<typeof createProviderHttpClient> {
  return createProviderHttpClient({
    baseUrl: TWILIO_API_BASE,
    auth: { username: masterSid, password: masterAuthToken },
  });
}

/**
 * Create a Twilio subaccount under the master account (managed mode).
 * Returns the new subaccount's SID and auth token.
 */
export async function createTwilioSubaccount(
  masterSid: string,
  masterAuthToken: string,
  friendlyName: string,
): Promise<{ accountSid: string; authToken: string }> {
  const http = masterHttpClient(masterSid, masterAuthToken);
  const result = await http.post<{ sid: string; auth_token: string }>(
    "/.json",
    { FriendlyName: friendlyName },
  );

  return {
    accountSid: result.data.sid,
    authToken: result.data.auth_token,
  };
}

/**
 * Suspend a Twilio subaccount. Prevents it from making or receiving calls/messages.
 */
export async function suspendTwilioSubaccount(
  masterSid: string,
  masterAuthToken: string,
  subaccountSid: string,
): Promise<void> {
  const http = masterHttpClient(masterSid, masterAuthToken);
  await http.post(`/${subaccountSid}.json`, { Status: "suspended" });
}

/**
 * Permanently close a Twilio subaccount. Cannot be undone.
 */
export async function closeTwilioSubaccount(
  masterSid: string,
  masterAuthToken: string,
  subaccountSid: string,
): Promise<void> {
  const http = masterHttpClient(masterSid, masterAuthToken);
  await http.post(`/${subaccountSid}.json`, { Status: "closed" });
}
