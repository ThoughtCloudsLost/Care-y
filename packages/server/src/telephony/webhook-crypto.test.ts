import { createHmac } from "node:crypto";
import { describe, it, expect } from "vitest";
import {
  twilioPayloadBuilder,
  createHmacValidator,
  twilioHmacValidator,
} from "./webhook-crypto.js";

describe("twilioPayloadBuilder", () => {
  it("produces correct payload for URL with sorted body params", () => {
    const url = "https://example.com/webhooks/twilio/org-1/sms";
    const body = {
      To: "+15551234567",
      From: "+15559876543",
      Body: "hello",
    };

    const result = twilioPayloadBuilder(url, body);

    // Body < From < To (alphabetical)
    expect(result).toBe(
      "https://example.com/webhooks/twilio/org-1/sms" +
        "Bodyhello" +
        "From+15559876543" +
        "To+15551234567",
    );
  });

  it("returns just the URL when body is empty", () => {
    const url = "https://example.com/webhooks/twilio/org-1/voice";
    const result = twilioPayloadBuilder(url, {});
    expect(result).toBe(url);
  });
});

describe("twilioHmacValidator", () => {
  const url = "https://example.com/webhooks/twilio/org-1/sms";
  const body = { From: "+15559876543", To: "+15551234567", Body: "test" };
  const authToken = "test-auth-token-abc123";

  it("produces known HMAC-SHA1 digest matching manual computation", () => {
    const payload = twilioPayloadBuilder(url, body);
    const expectedDigest = createHmac("sha1", authToken)
      .update(payload)
      .digest("base64");

    const result = twilioHmacValidator.computeSignature(url, body, authToken);

    expect(result).toBe(expectedDigest);
  });

  it("returns true for correct signature", () => {
    const signature = twilioHmacValidator.computeSignature(
      url,
      body,
      authToken,
    );

    expect(twilioHmacValidator.validate(url, body, authToken, signature)).toBe(
      true,
    );
  });

  it("returns false for wrong signature", () => {
    const wrongSignature = twilioHmacValidator.computeSignature(
      url,
      body,
      "wrong-auth-token",
    );

    expect(
      twilioHmacValidator.validate(url, body, authToken, wrongSignature),
    ).toBe(false);
  });

  it("returns false for empty signature", () => {
    expect(twilioHmacValidator.validate(url, body, authToken, "")).toBe(false);
  });

  it("returns false for signature with different length", () => {
    // SHA1 base64 is 28 chars. Provide a shorter string to hit the length mismatch branch.
    expect(twilioHmacValidator.validate(url, body, authToken, "short")).toBe(
      false,
    );
  });
});

describe("createHmacValidator", () => {
  it("with sha256 produces different digest than sha1", () => {
    const sha256Validator = createHmacValidator({
      algorithm: "sha256",
      buildPayload: twilioPayloadBuilder,
    });

    const url = "https://example.com/webhook";
    const body = { Key: "value" };
    const token = "secret";

    const sha1Sig = twilioHmacValidator.computeSignature(url, body, token);
    const sha256Sig = sha256Validator.computeSignature(url, body, token);

    expect(sha1Sig).not.toBe(sha256Sig);

    // Verify the sha256 one is valid via its own validator
    expect(sha256Validator.validate(url, body, token, sha256Sig)).toBe(true);
    // And that the sha1 signature does not pass sha256 validation
    expect(sha256Validator.validate(url, body, token, sha1Sig)).toBe(false);
  });
});
