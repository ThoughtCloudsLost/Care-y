import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Builds a payload string from a webhook URL and body parameters.
 * Each provider defines how URL + body are concatenated for HMAC signing.
 */
export type PayloadBuilder = (
  url: string,
  body: Record<string, string>,
) => string;

export interface HmacValidatorConfig {
  readonly algorithm: string;
  readonly buildPayload: PayloadBuilder;
}

export interface HmacValidator {
  /** Compute the base64-encoded HMAC signature for a webhook request. */
  computeSignature(
    url: string,
    body: Record<string, string>,
    authToken: string,
  ): string;

  /**
   * Validate a received signature against the expected HMAC.
   * Uses constant-time comparison to prevent timing attacks.
   */
  validate(
    url: string,
    body: Record<string, string>,
    authToken: string,
    receivedSignature: string,
  ): boolean;
}

/**
 * Twilio's payload format: URL followed by body params sorted alphabetically
 * by key, each concatenated as key+value with no delimiters.
 *
 * Reference: https://www.twilio.com/docs/usage/webhooks/webhooks-security
 */
export function twilioPayloadBuilder(
  url: string,
  body: Record<string, string>,
): string {
  const keys = Object.keys(body).sort();
  let payload = url;
  for (const key of keys) {
    // eslint-disable-next-line security/detect-object-injection -- key is from Object.keys(body), not user-controlled index
    payload += key + (body[key] ?? "");
  }
  return payload;
}

/** Create an HmacValidator with the given algorithm and payload builder. */
export function createHmacValidator(
  config: HmacValidatorConfig,
): HmacValidator {
  return {
    computeSignature(
      url: string,
      body: Record<string, string>,
      authToken: string,
    ): string {
      const payload = config.buildPayload(url, body);
      // Standard base64 per Twilio's signature spec. Not base64url.
      return createHmac(config.algorithm, authToken)
        .update(payload)
        .digest("base64");
    },

    validate(
      url: string,
      body: Record<string, string>,
      authToken: string,
      receivedSignature: string,
    ): boolean {
      const expected = this.computeSignature(url, body, authToken);
      const expectedBuf = Buffer.from(expected, "utf-8");
      const receivedBuf = Buffer.from(receivedSignature, "utf-8");

      if (expectedBuf.length !== receivedBuf.length) {
        return false;
      }

      return timingSafeEqual(expectedBuf, receivedBuf);
    },
  };
}

/** Pre-configured HMAC-SHA1 validator using Twilio's payload format. */
export const twilioHmacValidator: HmacValidator = createHmacValidator({
  algorithm: "sha1",
  buildPayload: twilioPayloadBuilder,
});
