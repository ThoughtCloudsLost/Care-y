import { createHmac } from "node:crypto";
import { describe, it, expect } from "vitest";
import { generateTwilioAccessToken } from "./twilio-token.js";

const TEST_CONFIG = {
  accountSid: "ACtest123456",
  apiKeySid: "SKtest789",
  apiKeySecret: "test-api-key-secret",
  twimlAppSid: "APtestapp",
};

function decodeJwtPart(b64url: string): unknown {
  return JSON.parse(Buffer.from(b64url, "base64url").toString("utf-8"));
}

function splitToken(token: string): [string, string, string] {
  const parts = token.split(".");
  const header = parts[0];
  const payload = parts[1];
  const signature = parts[2];
  if (!header || !payload || !signature) {
    expect.fail("Token does not have three segments");
  }
  return [header, payload, signature];
}

describe("generateTwilioAccessToken", () => {
  it("returns a token with three base64url-separated segments", () => {
    const token = generateTwilioAccessToken(TEST_CONFIG, {
      identity: "vol-1",
    });

    const parts = token.split(".");
    expect(parts).toHaveLength(3);
    for (const part of parts) {
      expect(part.length).toBeGreaterThan(0);
    }
  });

  it("sets header alg to HS256, typ to JWT, and cty to twilio-fpa;v=1", () => {
    const token = generateTwilioAccessToken(TEST_CONFIG, {
      identity: "vol-1",
    });
    const [headerB64] = splitToken(token);
    const header = decodeJwtPart(headerB64) as Record<string, unknown>;

    expect(header.alg).toBe("HS256");
    expect(header.typ).toBe("JWT");
    expect(header.cty).toBe("twilio-fpa;v=1");
  });

  it("sets iss to API Key SID and sub to Account SID", () => {
    const token = generateTwilioAccessToken(TEST_CONFIG, {
      identity: "vol-1",
    });
    const [, payloadB64] = splitToken(token);
    const payload = decodeJwtPart(payloadB64) as Record<string, unknown>;

    expect(payload.iss).toBe(TEST_CONFIG.apiKeySid);
    expect(payload.sub).toBe(TEST_CONFIG.accountSid);
  });

  it("includes voice outgoing application_sid matching twimlAppSid", () => {
    const token = generateTwilioAccessToken(TEST_CONFIG, {
      identity: "vol-1",
    });
    const [, payloadB64] = splitToken(token);
    const payload = decodeJwtPart(payloadB64) as Record<string, unknown>;
    const grants = payload.grants as {
      voice: { outgoing: { application_sid: string } };
    };

    expect(grants.voice.outgoing.application_sid).toBe(TEST_CONFIG.twimlAppSid);
  });

  it("includes identity in grants matching the identity param", () => {
    const token = generateTwilioAccessToken(TEST_CONFIG, {
      identity: "volunteer-42",
    });
    const [, payloadB64] = splitToken(token);
    const payload = decodeJwtPart(payloadB64) as Record<string, unknown>;
    const grants = payload.grants as { identity: string };

    expect(grants.identity).toBe("volunteer-42");
  });

  it("sets exp to iat plus ttl", () => {
    const token = generateTwilioAccessToken(TEST_CONFIG, {
      identity: "vol-1",
      ttl: 600,
    });
    const [, payloadB64] = splitToken(token);
    const payload = decodeJwtPart(payloadB64) as Record<string, unknown>;

    expect(payload.exp).toBe((payload.iat as number) + 600);
  });

  it("produces a valid HMAC-SHA256 signature over header.payload", () => {
    const token = generateTwilioAccessToken(TEST_CONFIG, {
      identity: "vol-1",
    });
    const [headerB64, payloadB64, sigB64] = splitToken(token);

    const expectedSig = createHmac("sha256", TEST_CONFIG.apiKeySecret)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");

    expect(sigB64).toBe(expectedSig);
  });

  it("uses custom TTL when provided", () => {
    const token = generateTwilioAccessToken(TEST_CONFIG, {
      identity: "vol-1",
      ttl: 900,
    });
    const [, payloadB64] = splitToken(token);
    const payload = decodeJwtPart(payloadB64) as Record<string, unknown>;

    expect(payload.exp).toBe((payload.iat as number) + 900);
  });

  it("contains no +, /, or = characters in any segment", () => {
    const token = generateTwilioAccessToken(TEST_CONFIG, {
      identity: "vol-1",
    });

    for (const segment of token.split(".")) {
      expect(segment).not.toMatch(/[+/=]/);
    }
  });

  it("defaults TTL to 300 when not specified", () => {
    const token = generateTwilioAccessToken(TEST_CONFIG, {
      identity: "vol-1",
    });
    const [, payloadB64] = splitToken(token);
    const payload = decodeJwtPart(payloadB64) as Record<string, unknown>;

    expect(payload.exp).toBe((payload.iat as number) + 300);
  });
});
