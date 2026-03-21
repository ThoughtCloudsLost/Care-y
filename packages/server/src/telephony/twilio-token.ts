/**
 * Generates Twilio Access Tokens (HS256 JWT) for browser-based voice calling.
 *
 * No third-party JWT library. HS256 signing is:
 *   HMAC-SHA256(apiKeySecret, base64url(header) + "." + base64url(payload))
 *
 * Token structure follows Twilio's Access Token specification:
 * - iss: API Key SID
 * - sub: Account SID
 * - grants: { voice: { incoming: { allow: false }, outgoing: { application_sid } } }
 * - identity: user ID (logged by Twilio for call attribution)
 * - exp: current time + TTL
 * - jti: API Key SID + "-" + timestamp (unique per token)
 */

import { createHmac } from "node:crypto";

export interface TwilioTokenConfig {
  /** Twilio Account SID (from org's telephony_config). */
  readonly accountSid: string;
  /** Twilio API Key SID (from env, not per-org). */
  readonly apiKeySid: string;
  /** Twilio API Key Secret (from env, not per-org). */
  readonly apiKeySecret: string;
  /** TwiML Application SID (from env). Scopes what the token can do. */
  readonly twimlAppSid: string;
}

export interface GenerateTokenParams {
  /** Volunteer's user ID. Twilio logs this as the call identity. */
  readonly identity: string;
  /** TTL in seconds. Default: 300 (5 minutes). */
  readonly ttl?: number;
}

export function generateTwilioAccessToken(
  config: TwilioTokenConfig,
  params: GenerateTokenParams,
): string {
  const ttl = params.ttl ?? 300;
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "HS256",
    typ: "JWT",
    cty: "twilio-fpa;v=1",
  };

  const payload = {
    jti: `${config.apiKeySid}-${String(now)}`,
    iss: config.apiKeySid,
    sub: config.accountSid,
    iat: now,
    exp: now + ttl,
    grants: {
      identity: params.identity,
      voice: {
        incoming: { allow: false },
        outgoing: {
          application_sid: config.twimlAppSid,
        },
      },
    },
  };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const sigInput = `${headerB64}.${payloadB64}`;

  const signature = createHmac("sha256", config.apiKeySecret)
    .update(sigInput)
    .digest();
  const sigB64 = base64url(signature);

  return `${sigInput}.${sigB64}`;
}

function base64url(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64url");
}
