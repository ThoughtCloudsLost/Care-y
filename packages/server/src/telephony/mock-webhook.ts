import { createHmac, randomUUID } from "node:crypto";
import { DEV_MOCK_ACCOUNT_SID } from "./mock-provider.js";

export interface MockWebhookConfig {
  readonly authToken: string;
  readonly baseUrl: string;
  readonly orgId: string;
  /** Provider segment for the webhook URL path (defaults to "mock"). */
  readonly provider?: string;
}

export interface MockSmsPayload {
  readonly from?: string;
  readonly to?: string;
  readonly body?: string;
  readonly numMedia?: string;
}

export interface MockCallPayload {
  readonly from?: string;
  readonly to?: string;
  readonly callStatus?: string;
  readonly direction?: string;
}

export interface MockWebhookResult {
  readonly response: Response;
  readonly signature: string;
  readonly url: string;
  readonly body: Record<string, string>;
}

function computeTwilioSignature(
  url: string,
  body: Record<string, string>,
  authToken: string,
): string {
  const keys = Object.keys(body).sort();
  let payload = url;
  for (const key of keys) {
    // eslint-disable-next-line security/detect-object-injection -- key from Object.keys, not user input
    payload += key + (body[key] ?? "");
  }
  // Standard base64 to match Twilio's signature format. Not base64url.
  return createHmac("sha1", authToken).update(payload).digest("base64");
}

async function sendSignedWebhook(
  config: MockWebhookConfig,
  endpoint: string,
  body: Record<string, string>,
): Promise<MockWebhookResult> {
  // Include a current timestamp in the URL to pass the webhook handler's
  // replay protection (5-minute window). Matches production URL format
  // where provisioned webhooks include ?ts=<epoch_seconds>.
  const ts = Math.floor(Date.now() / 1000);
  const provider = config.provider ?? "mock";
  const url = `${config.baseUrl}/webhooks/${provider}/${config.orgId}/${endpoint}?ts=${String(ts)}`;
  const signature = computeTwilioSignature(url, body, config.authToken);
  const params = new URLSearchParams(body);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Twilio-Signature": signature,
    },
    body: params,
  });

  return { response, signature, url, body };
}

export async function sendMockSmsWebhook(
  config: MockWebhookConfig,
  payload?: MockSmsPayload,
): Promise<MockWebhookResult> {
  const body: Record<string, string> = {
    MessageSid: `SM_test_${randomUUID()}`,
    AccountSid: DEV_MOCK_ACCOUNT_SID,
    From: payload?.from ?? "+15550001111",
    To: payload?.to ?? "+15550002222",
    Body: payload?.body ?? "Test message from mock webhook sender",
    NumMedia: payload?.numMedia ?? "0",
  };

  return sendSignedWebhook(config, "sms", body);
}

export async function sendMockCallWebhook(
  config: MockWebhookConfig,
  payload?: MockCallPayload,
): Promise<MockWebhookResult> {
  const body: Record<string, string> = {
    CallSid: `CA_test_${randomUUID()}`,
    AccountSid: DEV_MOCK_ACCOUNT_SID,
    From: payload?.from ?? "+15550001111",
    To: payload?.to ?? "+15550002222",
    CallStatus: payload?.callStatus ?? "ringing",
    Direction: payload?.direction ?? "inbound",
  };

  return sendSignedWebhook(config, "voice", body);
}
