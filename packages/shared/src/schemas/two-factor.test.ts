import { describe, expect, it } from "vitest";
import { TwoFactorMethod } from "../two-factor-types.js";
import {
  totpVerifySchema,
  emailCodeVerifySchema,
  smsEnrollSchema,
  smsCodeVerifySchema,
  backupCodeVerifySchema,
  webauthnRegistrationResponseSchema,
  webauthnAssertionResponseSchema,
  removeMethodSchema,
  enrolledMethodResponseSchema,
  twoFactorStatusResponseSchema,
} from "./two-factor.js";

// --- TOTP ---

describe("totpVerifySchema", () => {
  it("accepts a valid 6-digit code", () => {
    const result = totpVerifySchema.safeParse({ code: "123456" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe("123456");
    }
  });

  it("accepts all-zeros", () => {
    expect(totpVerifySchema.safeParse({ code: "000000" }).success).toBe(true);
  });

  it("rejects code shorter than 6 digits", () => {
    expect(totpVerifySchema.safeParse({ code: "12345" }).success).toBe(false);
  });

  it("rejects code longer than 6 digits", () => {
    expect(totpVerifySchema.safeParse({ code: "1234567" }).success).toBe(false);
  });

  it("rejects non-numeric code", () => {
    expect(totpVerifySchema.safeParse({ code: "12345a" }).success).toBe(false);
    expect(totpVerifySchema.safeParse({ code: "abcdef" }).success).toBe(false);
  });

  it("rejects code with spaces", () => {
    expect(totpVerifySchema.safeParse({ code: "123 56" }).success).toBe(false);
    expect(totpVerifySchema.safeParse({ code: " 12345" }).success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(totpVerifySchema.safeParse({ code: "" }).success).toBe(false);
  });

  it("rejects missing code field", () => {
    expect(totpVerifySchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(totpVerifySchema.safeParse({ code: 123456 }).success).toBe(false);
    expect(totpVerifySchema.safeParse({ code: null }).success).toBe(false);
  });
});

// --- Email codes ---

describe("emailCodeVerifySchema", () => {
  it("accepts a valid 6-digit code", () => {
    const result = emailCodeVerifySchema.safeParse({ code: "789012" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe("789012");
    }
  });

  it("rejects non-numeric code", () => {
    expect(emailCodeVerifySchema.safeParse({ code: "abc123" }).success).toBe(
      false,
    );
  });

  it("rejects wrong length", () => {
    expect(emailCodeVerifySchema.safeParse({ code: "12345" }).success).toBe(
      false,
    );
    expect(emailCodeVerifySchema.safeParse({ code: "1234567" }).success).toBe(
      false,
    );
  });

  it("rejects missing code", () => {
    expect(emailCodeVerifySchema.safeParse({}).success).toBe(false);
  });
});

// --- SMS enroll ---

describe("smsEnrollSchema", () => {
  it("accepts a valid phone number", () => {
    const result = smsEnrollSchema.safeParse({ phone: "+15551234567" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+15551234567");
    }
  });

  it("accepts a national format phone number", () => {
    expect(smsEnrollSchema.safeParse({ phone: "2125551234" }).success).toBe(
      true,
    );
  });

  it("rejects empty phone", () => {
    expect(smsEnrollSchema.safeParse({ phone: "" }).success).toBe(false);
  });

  it("rejects phone longer than 20 characters", () => {
    expect(smsEnrollSchema.safeParse({ phone: "1".repeat(21) }).success).toBe(
      false,
    );
  });

  it("rejects missing phone field", () => {
    expect(smsEnrollSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(smsEnrollSchema.safeParse({ phone: 15551234567 }).success).toBe(
      false,
    );
  });
});

// --- SMS code verify ---

describe("smsCodeVerifySchema", () => {
  it("accepts a valid 6-digit code", () => {
    const result = smsCodeVerifySchema.safeParse({ code: "345678" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe("345678");
    }
  });

  it("rejects non-numeric code", () => {
    expect(smsCodeVerifySchema.safeParse({ code: "abc123" }).success).toBe(
      false,
    );
  });

  it("rejects wrong length", () => {
    expect(smsCodeVerifySchema.safeParse({ code: "12345" }).success).toBe(
      false,
    );
    expect(smsCodeVerifySchema.safeParse({ code: "1234567" }).success).toBe(
      false,
    );
  });

  it("rejects missing code", () => {
    expect(smsCodeVerifySchema.safeParse({}).success).toBe(false);
  });
});

// --- Backup codes ---

describe("backupCodeVerifySchema", () => {
  it("accepts a plain alphanumeric code", () => {
    const result = backupCodeVerifySchema.safeParse({ code: "abcd1234" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe("abcd1234");
    }
  });

  it("strips hyphens from code", () => {
    const result = backupCodeVerifySchema.safeParse({ code: "abcd-1234" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe("abcd1234");
    }
  });

  it("strips whitespace from code", () => {
    const result = backupCodeVerifySchema.safeParse({ code: "abcd 1234" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe("abcd1234");
    }
  });

  it("lowercases the code", () => {
    const result = backupCodeVerifySchema.safeParse({ code: "ABCD-1234" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe("abcd1234");
    }
  });

  it("trims leading and trailing whitespace", () => {
    const result = backupCodeVerifySchema.safeParse({ code: "  abcd1234  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe("abcd1234");
    }
  });

  it("rejects empty string", () => {
    expect(backupCodeVerifySchema.safeParse({ code: "" }).success).toBe(false);
  });

  it("rejects whitespace-only string", () => {
    // After trim, the string is empty, which fails min(1)
    expect(backupCodeVerifySchema.safeParse({ code: "   " }).success).toBe(
      false,
    );
  });

  it("rejects code longer than 20 characters", () => {
    expect(
      backupCodeVerifySchema.safeParse({ code: "a".repeat(21) }).success,
    ).toBe(false);
  });

  it("accepts code at exactly 20 characters", () => {
    expect(
      backupCodeVerifySchema.safeParse({ code: "a".repeat(20) }).success,
    ).toBe(true);
  });

  it("rejects missing code", () => {
    expect(backupCodeVerifySchema.safeParse({}).success).toBe(false);
  });
});

// --- WebAuthn registration ---

describe("webauthnRegistrationResponseSchema", () => {
  const validRegistration = {
    id: "credential-id-base64",
    rawId: "raw-id-base64",
    type: "public-key" as const,
    authenticatorAttachment: "platform" as const,
    response: {
      clientDataJSON: "eyJ0eXBlIjoiY3JlYXRlIn0",
      attestationObject: "o2NmbXRkbm9uZQ",
      authenticatorData: "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2M",
      publicKey: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE",
      publicKeyAlgorithm: -7,
      transports: ["internal"],
    },
  };

  it("accepts a valid registration response", () => {
    const result =
      webauthnRegistrationResponseSchema.safeParse(validRegistration);
    expect(result.success).toBe(true);
  });

  it("accepts without authenticatorAttachment (optional)", () => {
    const { authenticatorAttachment: _, ...without } = validRegistration;
    expect(webauthnRegistrationResponseSchema.safeParse(without).success).toBe(
      true,
    );
  });

  it("accepts null authenticatorAttachment", () => {
    const result = webauthnRegistrationResponseSchema.safeParse({
      ...validRegistration,
      authenticatorAttachment: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts cross-platform attachment", () => {
    const result = webauthnRegistrationResponseSchema.safeParse({
      ...validRegistration,
      authenticatorAttachment: "cross-platform",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid authenticatorAttachment value", () => {
    const result = webauthnRegistrationResponseSchema.safeParse({
      ...validRegistration,
      authenticatorAttachment: "hybrid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts without transports (optional)", () => {
    const { transports: _, ...responseWithoutTransports } =
      validRegistration.response;
    const noTransports = {
      ...validRegistration,
      response: responseWithoutTransports,
    };
    expect(
      webauthnRegistrationResponseSchema.safeParse(noTransports).success,
    ).toBe(true);
  });

  it("rejects wrong type literal", () => {
    const result = webauthnRegistrationResponseSchema.safeParse({
      ...validRegistration,
      type: "secret-key",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty id", () => {
    const result = webauthnRegistrationResponseSchema.safeParse({
      ...validRegistration,
      id: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty rawId", () => {
    const result = webauthnRegistrationResponseSchema.safeParse({
      ...validRegistration,
      rawId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty clientDataJSON", () => {
    const result = webauthnRegistrationResponseSchema.safeParse({
      ...validRegistration,
      response: { ...validRegistration.response, clientDataJSON: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty attestationObject", () => {
    const result = webauthnRegistrationResponseSchema.safeParse({
      ...validRegistration,
      response: { ...validRegistration.response, attestationObject: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty authenticatorData", () => {
    const result = webauthnRegistrationResponseSchema.safeParse({
      ...validRegistration,
      response: { ...validRegistration.response, authenticatorData: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty publicKey", () => {
    const result = webauthnRegistrationResponseSchema.safeParse({
      ...validRegistration,
      response: { ...validRegistration.response, publicKey: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing publicKeyAlgorithm", () => {
    const { publicKeyAlgorithm: _, ...responseWithout } =
      validRegistration.response;
    const result = webauthnRegistrationResponseSchema.safeParse({
      ...validRegistration,
      response: responseWithout,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-number publicKeyAlgorithm", () => {
    const result = webauthnRegistrationResponseSchema.safeParse({
      ...validRegistration,
      response: { ...validRegistration.response, publicKeyAlgorithm: "ES256" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing response object", () => {
    const { response: _, ...noResponse } = validRegistration;
    expect(
      webauthnRegistrationResponseSchema.safeParse(noResponse).success,
    ).toBe(false);
  });
});

// --- WebAuthn assertion ---

describe("webauthnAssertionResponseSchema", () => {
  const validAssertion = {
    id: "credential-id-base64",
    rawId: "raw-id-base64",
    type: "public-key" as const,
    authenticatorAttachment: "platform" as const,
    response: {
      clientDataJSON: "eyJ0eXBlIjoiZ2V0In0",
      authenticatorData: "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2M",
      signature: "MEUCIQCYnA",
      userHandle: "dXNlci1pZA",
    },
  };

  it("accepts a valid assertion response", () => {
    const result = webauthnAssertionResponseSchema.safeParse(validAssertion);
    expect(result.success).toBe(true);
  });

  it("accepts without authenticatorAttachment", () => {
    const { authenticatorAttachment: _, ...without } = validAssertion;
    expect(webauthnAssertionResponseSchema.safeParse(without).success).toBe(
      true,
    );
  });

  it("accepts null userHandle", () => {
    const result = webauthnAssertionResponseSchema.safeParse({
      ...validAssertion,
      response: { ...validAssertion.response, userHandle: null },
    });
    expect(result.success).toBe(true);
  });

  it("accepts missing userHandle (optional)", () => {
    const { userHandle: _, ...responseWithout } = validAssertion.response;
    const result = webauthnAssertionResponseSchema.safeParse({
      ...validAssertion,
      response: responseWithout,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty signature", () => {
    const result = webauthnAssertionResponseSchema.safeParse({
      ...validAssertion,
      response: { ...validAssertion.response, signature: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty authenticatorData", () => {
    const result = webauthnAssertionResponseSchema.safeParse({
      ...validAssertion,
      response: { ...validAssertion.response, authenticatorData: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong type literal", () => {
    const result = webauthnAssertionResponseSchema.safeParse({
      ...validAssertion,
      type: "hmac-secret",
    });
    expect(result.success).toBe(false);
  });
});

// --- Remove method ---

describe("removeMethodSchema", () => {
  it("accepts a valid available method", () => {
    const result = removeMethodSchema.safeParse({ method: "webauthn" });
    expect(result.success).toBe(true);
  });

  it("accepts totp method", () => {
    expect(removeMethodSchema.safeParse({ method: "totp" }).success).toBe(true);
  });

  it("accepts email method", () => {
    expect(removeMethodSchema.safeParse({ method: "email" }).success).toBe(
      true,
    );
  });

  it("accepts optional credentialId for webauthn", () => {
    const result = removeMethodSchema.safeParse({
      method: "webauthn",
      credentialId: "cred-abc123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.credentialId).toBe("cred-abc123");
    }
  });

  it("accepts every TwoFactorMethod value", () => {
    for (const method of Object.values(TwoFactorMethod)) {
      expect(
        removeMethodSchema.safeParse({ method }).success,
        `expected ${method} to be accepted`,
      ).toBe(true);
    }
  });

  it("rejects unknown method", () => {
    expect(
      removeMethodSchema.safeParse({ method: "carrier-pigeon" }).success,
    ).toBe(false);
  });

  it("rejects missing method", () => {
    expect(removeMethodSchema.safeParse({}).success).toBe(false);
  });
});

// --- Enrolled method response ---

describe("enrolledMethodResponseSchema", () => {
  it("accepts a valid enrolled method", () => {
    const result = enrolledMethodResponseSchema.safeParse({
      type: "webauthn",
      webauthnAttachment: "platform",
      label: "Screen lock",
      index: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts without webauthnAttachment (optional for non-webauthn)", () => {
    const result = enrolledMethodResponseSchema.safeParse({
      type: "totp",
      label: "Authenticator app",
      index: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects index below 1", () => {
    const result = enrolledMethodResponseSchema.safeParse({
      type: "totp",
      label: "App",
      index: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer index", () => {
    const result = enrolledMethodResponseSchema.safeParse({
      type: "totp",
      label: "App",
      index: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = enrolledMethodResponseSchema.safeParse({
      type: "carrier-pigeon",
      label: "Bird",
      index: 1,
    });
    expect(result.success).toBe(false);
  });
});

// --- 2FA status response ---

describe("twoFactorStatusResponseSchema", () => {
  it("accepts a valid status with enrolled methods", () => {
    const result = twoFactorStatusResponseSchema.safeParse({
      enrolled: true,
      methods: [
        {
          type: "webauthn",
          webauthnAttachment: "platform",
          label: "Face ID",
          index: 1,
        },
        { type: "totp", label: "Authy", index: 2 },
      ],
      backupCodesRemaining: 6,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty methods when not enrolled", () => {
    const result = twoFactorStatusResponseSchema.safeParse({
      enrolled: false,
      methods: [],
      backupCodesRemaining: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative backupCodesRemaining", () => {
    const result = twoFactorStatusResponseSchema.safeParse({
      enrolled: false,
      methods: [],
      backupCodesRemaining: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer backupCodesRemaining", () => {
    const result = twoFactorStatusResponseSchema.safeParse({
      enrolled: false,
      methods: [],
      backupCodesRemaining: 3.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing enrolled field", () => {
    const result = twoFactorStatusResponseSchema.safeParse({
      methods: [],
      backupCodesRemaining: 0,
    });
    expect(result.success).toBe(false);
  });
});
