// Wire format + crypto contract: tests verify webhook URL patterns, required form fields,
// and HMAC-SHA1 signature computation that must match the provider's algorithm exactly.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHmac } from "node:crypto";
import { sendMockSmsWebhook, sendMockCallWebhook } from "./mock-webhook.js";
import type { MockWebhookConfig } from "./mock-webhook.js";
import { DEV_MOCK_ACCOUNT_SID } from "./mock-provider.js";
import type { OrgId } from "@care-y/shared";

const config: MockWebhookConfig = {
  authToken: "test-auth-token-for-hmac",
  baseUrl: "https://care-y.example.com",
  orgId: "org-abc-123" as OrgId,
};

function recomputeSignature(
  url: string,
  body: Record<string, string>,
  authToken: string,
): string {
  const keys = Object.keys(body).sort();
  let payload = url;
  for (const key of keys) {
    payload += key + (body[key] ?? "");
  }
  return createHmac("sha1", authToken).update(payload).digest("base64");
}

describe("sendMockSmsWebhook", () => {
  let fetchStub: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchStub = vi.fn().mockResolvedValue(new Response("OK", { status: 200 }));
    vi.stubGlobal("fetch", fetchStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("constructs correct URL path for SMS using mock provider segment", async () => {
    await sendMockSmsWebhook(config);

    expect(fetchStub).toHaveBeenCalledOnce();
    const [url] = fetchStub.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(
      /^https:\/\/care-y\.example\.com\/webhooks\/mock\/org-abc-123\/sms\?ts=\d+$/,
    );
  });

  it("generates HMAC-SHA1 signature matching manual computation", async () => {
    const result = await sendMockSmsWebhook(config);

    const expected = recomputeSignature(
      result.url,
      result.body,
      config.authToken,
    );
    expect(result.signature).toBe(expected);
  });

  it("includes all required webhook fields in body with DEV_MOCK_ACCOUNT_SID", async () => {
    const result = await sendMockSmsWebhook(config);

    expect(result.body).toHaveProperty("MessageSid");
    expect(result.body).toHaveProperty("AccountSid", DEV_MOCK_ACCOUNT_SID);
    expect(result.body).toHaveProperty("From", "+15550001111");
    expect(result.body).toHaveProperty("To", "+15550002222");
    expect(result.body).toHaveProperty(
      "Body",
      "Test message from mock webhook sender",
    );
    expect(result.body).toHaveProperty("NumMedia", "0");
    expect(result.body.MessageSid).toMatch(/^SM_test_/);
  });

  it("applies custom payload overrides to default values", async () => {
    const result = await sendMockSmsWebhook(config, {
      from: "+15559999999",
      body: "Custom body text",
    });

    expect(result.body.From).toBe("+15559999999");
    expect(result.body.Body).toBe("Custom body text");
    expect(result.body.To).toBe("+15550002222");
  });

  it("sends X-Twilio-Signature header in fetch call", async () => {
    const result = await sendMockSmsWebhook(config);

    const [, init] = fetchStub.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["X-Twilio-Signature"]).toBe(result.signature);
    expect(headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
  });
});

describe("sendMockCallWebhook", () => {
  let fetchStub: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchStub = vi.fn().mockResolvedValue(new Response("OK", { status: 200 }));
    vi.stubGlobal("fetch", fetchStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("constructs correct URL path for voice using mock provider segment", async () => {
    await sendMockCallWebhook(config);

    expect(fetchStub).toHaveBeenCalledOnce();
    const [url] = fetchStub.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(
      /^https:\/\/care-y\.example\.com\/webhooks\/mock\/org-abc-123\/voice\?ts=\d+$/,
    );
  });

  it("includes all required call fields with DEV_MOCK_ACCOUNT_SID", async () => {
    const result = await sendMockCallWebhook(config);

    expect(result.body).toHaveProperty("CallSid");
    expect(result.body).toHaveProperty("AccountSid", DEV_MOCK_ACCOUNT_SID);
    expect(result.body).toHaveProperty("From", "+15550001111");
    expect(result.body).toHaveProperty("To", "+15550002222");
    expect(result.body).toHaveProperty("CallStatus", "ringing");
    expect(result.body).toHaveProperty("Direction", "inbound");
    expect(result.body.CallSid).toMatch(/^CA_test_/);
  });

  it("uses explicit provider override in URL path when specified", async () => {
    const customConfig: MockWebhookConfig = {
      ...config,
      provider: "twilio",
    };
    await sendMockCallWebhook(customConfig);

    expect(fetchStub).toHaveBeenCalledOnce();
    const [url] = fetchStub.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(
      /^https:\/\/care-y\.example\.com\/webhooks\/twilio\/org-abc-123\/voice\?ts=\d+$/,
    );
  });

  it("generates signature following HMAC-SHA1 algorithm with sorted key-value pairs", async () => {
    const result = await sendMockCallWebhook(config);

    // Manually reconstruct the payload: URL + sorted keys concatenated
    const sortedKeys = Object.keys(result.body).sort();
    let payload = result.url;
    for (const key of sortedKeys) {
      payload += key + (result.body[key] ?? "");
    }

    const expected = createHmac("sha1", config.authToken)
      .update(payload)
      .digest("base64");

    expect(result.signature).toBe(expected);
  });
});
