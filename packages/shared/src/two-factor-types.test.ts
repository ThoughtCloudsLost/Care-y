import { describe, expect, it } from "vitest";
import {
  TwoFactorMethod,
  METHOD_INFO,
  type TwoFactorMethodType,
} from "./two-factor-types.js";

describe("METHOD_INFO", () => {
  it("covers all TwoFactorMethod values", () => {
    const allValues = Object.values(TwoFactorMethod) as TwoFactorMethodType[];
    const infoTypes = new Set(METHOD_INFO.map((m) => m.type));
    for (const method of allValues) {
      expect(infoTypes.has(method)).toBe(true);
    }
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

  it("has valid securityLevel values", () => {
    const validLevels = new Set(["strongest", "strong", "moderate", "weak"]);
    for (const entry of METHOD_INFO) {
      expect(validLevels.has(entry.securityLevel)).toBe(true);
    }
  });

  // Policy assertion: WebAuthn > OTP > SMS ordering must not regress silently.
  // UI severity indicators and onboarding copy depend on this ranking.
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
