# Telephony Development Guide

## Local Development Without Twilio

Set the provider to `"mock"` in the test org's `telephony_config`. The mock provider accepts all method calls, returns predictable SIDs (`SM_mock_*` for SMS, `CA_mock_*` for calls), and logs each call to `console.warn`.

```bash
# The mock provider is auto-registered when NODE_ENV !== "production"
# No Twilio credentials needed
```

### Mock Webhook Sender

Send test inbound webhooks to the local server with valid HMAC-SHA1 signatures:

```typescript
import { sendMockSmsWebhook, sendMockCallWebhook } from "./mock-webhook.js";

const config = {
  authToken: "your_test_auth_token", // must match the test org's config
  baseUrl: "http://localhost:3000",
  orgId: "your-org-uuid",
};

// Send a test inbound SMS
await sendMockSmsWebhook(config, {
  from: "+15551112222",
  to: "+15553334444",
  body: "Test message",
});

// Send a test inbound voice call
await sendMockCallWebhook(config, {
  from: "+15551112222",
  to: "+15553334444",
});
```

## Local Development With Twilio

### ngrok Setup

Twilio webhooks need a publicly reachable URL. Use ngrok to tunnel:

```bash
ngrok http 3000
```

Set `WEBHOOK_BASE_URL` in your `.env` to the ngrok URL:

```
WEBHOOK_BASE_URL=https://abc123.ngrok-free.app
```

### Twilio Console Configuration

1. Create a test phone number in Twilio Console
2. Webhook URLs are auto-provisioned via the admin tRPC endpoint (`provisionWebhooks`)
3. Verify webhooks arrive by checking server logs for inbound SMS/call events

## Relay Endpoint Testing

Relay endpoints require an authenticated session with 2FA verified. Use `curl` with a session cookie:

```bash
# SMS relay
curl -X POST http://localhost:3000/relay/sms \
  -H "Content-Type: application/json" \
  -H "Cookie: care_y_session=YOUR_SESSION_TOKEN" \
  -H "X-Org-Slug: test-org" \
  -d '{"to":"+15551234567","body":"Test message"}'

# Call relay (phone callback)
curl -X POST http://localhost:3000/relay/call \
  -H "Content-Type: application/json" \
  -H "Cookie: care_y_session=YOUR_SESSION_TOKEN" \
  -H "X-Org-Slug: test-org" \
  -d '{"clientPhone":"+15551234567","consultantPhone":"+15559876543"}'

# WebRTC token
curl -X POST http://localhost:3000/relay/webrtc-token \
  -H "Cookie: care_y_session=YOUR_SESSION_TOKEN" \
  -H "X-Org-Slug: test-org"
```

The `X-Org-Slug` header is the dev-mode org resolver (replaces subdomain routing in production).

## WebRTC Local Testing

Browser-based calling requires Twilio API Keys and a TwiML Application.

### Setup

1. Create an API Key in Twilio Console (Account > API Keys)
2. Create a TwiML Application (Programmable Voice > TwiML Apps)
3. Set the TwiML App's Voice Request URL to `{WEBHOOK_BASE_URL}/relay/call-confirm/{org-uuid}`
4. Add to `.env`:

```
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=your_api_key_secret
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### How It Works

1. Volunteer's browser requests a token from `/relay/webrtc-token`
2. Server generates an HS256 JWT (Twilio Access Token) with 5-minute TTL
3. Browser initializes `@twilio/voice-sdk` Device with the token
4. On `connect()`, the SDK opens a WebSocket to Twilio's signaling server
5. Twilio places the PSTN call to the client's phone number

## Architecture Notes

### Buffer Zeroing

Relay endpoints handle decrypted plaintext (phone numbers, SMS bodies). All sensitive data is read as `Buffer` (not JS strings), forwarded to the provider, and `.fill(0)` in `finally` blocks. This is a security requirement for the project.

### Caller ID Resolution

Outbound caller ID is resolved server-side via `org_config.phone_outbound_sid`:

```
"outbound" -> phone_outbound_sid -> first provisioned number
"system"   -> phone_system_sid -> phone_outbound_sid -> first provisioned number
```

Single-number orgs work without configuration. Multi-number orgs assign purposes via the admin UI.

### Two-Leg Call Flow

1. Browser sends `{ clientPhone, consultantPhone }` to `/relay/call`
2. Server calls consultant's phone (leg 1) via Twilio API
3. Consultant picks up, hears "Press any digit to connect"
4. Twilio POSTs DTMF result to `/relay/call-confirm/{org}`
5. Server responds with TwiML `<Dial>` to bridge to client (leg 2)

The client phone number is stored in a `pendingCalls` Map (keyed by CallSid) during the confirmation window. Entries expire after 2 minutes and buffers are zeroed on eviction.
