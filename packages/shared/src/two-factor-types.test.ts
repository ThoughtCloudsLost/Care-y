import { describe, expect, it } from "vitest";
import {
  TwoFactorMethod,
  AVAILABLE_METHODS,
  STUBBED_METHODS,
  METHOD_INFO,
  type TwoFactorMethodType,
} from "./two-factor-types.js";

describe("TwoFactorMethod enum", () => {
  it("contains all five method types", () => {
    expect(TwoFactorMethod.WEBAUTHN).toBe("webauthn");
    expect(TwoFactorMethod.TOTP).toBe("totp");
    expect(TwoFactorMethod.EMAIL).toBe("email");
    expect(TwoFactorMethod.SMS).toBe("sms");
    expect(TwoFactorMethod.PUSH).toBe("push");
  });
});

describe("AVAILABLE_METHODS", () => {
  it("contains webauthn, totp, email, and sms", () => {
    expect(AVAILABLE_METHODS).toContain("webauthn");
    expect(AVAILABLE_METHODS).toContain("totp");
    expect(AVAILABLE_METHODS).toContain("email");
    expect(AVAILABLE_METHODS).toContain("sms");
  });

  it("does not include stubbed methods", () => {
    expect(AVAILABLE_METHODS).not.toContain("push");
  });
});

describe("STUBBED_METHODS", () => {
  it("contains push", () => {
    expect(STUBBED_METHODS).toContain("push");
  });

  it("does not contain sms (now available)", () => {
    expect(STUBBED_METHODS).not.toContain("sms");
  });
});

describe("AVAILABLE_METHODS + STUBBED_METHODS completeness", () => {
  it("together cover all TwoFactorMethod values", () => {
    const allValues = Object.values(TwoFactorMethod) as TwoFactorMethodType[];
    const combined = [...AVAILABLE_METHODS, ...STUBBED_METHODS];

    for (const method of allValues) {
      expect(combined).toContain(method);
    }
  });

  it("have no overlap", () => {
    const overlap = AVAILABLE_METHODS.filter((m) =>
      (STUBBED_METHODS as readonly string[]).includes(m),
    );
    expect(overlap).toHaveLength(0);
  });
});

describe("METHOD_INFO", () => {
  it("covers all five method types", () => {
    const types = new Set(METHOD_INFO.map((m) => m.type));
    expect(types).toContain("webauthn");
    expect(types).toContain("totp");
    expect(types).toContain("email");
    expect(types).toContain("sms");
    expect(types).toContain("push");
  });

  it("has two webauthn entries with different attachments", () => {
    const webauthnEntries = METHOD_INFO.filter((m) => m.type === "webauthn");
    expect(webauthnEntries).toHaveLength(2);

    const attachments = webauthnEntries.map((m) => m.webauthnAttachment);
    expect(attachments).toContain("platform");
    expect(attachments).toContain("cross-platform");
  });

  it("non-webauthn entries have no webauthnAttachment", () => {
    const nonWebauthn = METHOD_INFO.filter((m) => m.type !== "webauthn");
    for (const entry of nonWebauthn) {
      expect(entry.webauthnAttachment).toBeUndefined();
    }
  });

  it("every entry has a non-empty label and description", () => {
    for (const entry of METHOD_INFO) {
      expect(entry.label.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
    }
  });

  it("available entries match AVAILABLE_METHODS", () => {
    const availableTypes = METHOD_INFO.filter((m) => m.available).map(
      (m) => m.type,
    );
    const uniqueAvailable = [...new Set(availableTypes)];

    for (const method of AVAILABLE_METHODS) {
      expect(uniqueAvailable).toContain(method);
    }
  });

  it("unavailable entries match STUBBED_METHODS", () => {
    const unavailableTypes = METHOD_INFO.filter((m) => !m.available).map(
      (m) => m.type,
    );
    const uniqueUnavailable = [...new Set(unavailableTypes)];

    for (const method of STUBBED_METHODS) {
      expect(uniqueUnavailable).toContain(method);
    }
  });

  // Policy assertion: WebAuthn > OTP > SMS ordering must not regress silently. UI severity indicators and onboarding copy depend on this ranking.
  it("has valid securityLevel values", () => {
    const validLevels = new Set(["strongest", "strong", "moderate", "weak"]);
    for (const entry of METHOD_INFO) {
      expect(validLevels.has(entry.securityLevel)).toBe(true);
    }
  });

  it("webauthn entries are rated strongest", () => {
    const webauthn = METHOD_INFO.filter((m) => m.type === "webauthn");
    for (const entry of webauthn) {
      expect(entry.securityLevel).toBe("strongest");
    }
  });

  it("sms is rated weak", () => {
    const sms = METHOD_INFO.find((m) => m.type === "sms");
    expect(sms?.securityLevel).toBe("weak");
  });
});
