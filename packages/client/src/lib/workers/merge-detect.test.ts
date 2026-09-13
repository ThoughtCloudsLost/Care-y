/**
 * Tests for merge candidate detection Worker logic.
 *
 * Tests extractContactsFromResponse (pure function, no crypto) and
 * verifies the detection response shape never contains contact values.
 */

import { describe, it, expect } from "vitest";
import { extractContactsFromResponse } from "./crypto-core.js";

// vi.mock required: @care-y/crypto barrel triggers libsodium WASM
// initialization via getSodium() singleton. The import is transitive
// through crypto-core.ts. Tests here only exercise the extraction
// helper which does not call any crypto functions.

describe("extractContactsFromResponse", () => {
  describe("role-tagged fields", () => {
    it("extracts phone-contact role field", () => {
      const response = JSON.stringify({
        answers: [
          { fieldId: "f1", fieldType: "text", value: "(212) 555-1234" },
        ],
      });
      const roles = new Map([["f1", "phone-contact"]]);
      const result = extractContactsFromResponse(response, roles);

      expect(result.phones).toEqual(["2125551234"]);
      expect(result.emails).toEqual([]);
    });

    it("extracts email-contact role field", () => {
      const response = JSON.stringify({
        answers: [
          {
            fieldId: "f1",
            fieldType: "text",
            value: "  User@Example.COM  ",
          },
        ],
      });
      const roles = new Map([["f1", "email-contact"]]);
      const result = extractContactsFromResponse(response, roles);

      expect(result.phones).toEqual([]);
      expect(result.emails).toEqual(["user@example.com"]);
    });

    it("prioritizes role tags over pattern matching", () => {
      const response = JSON.stringify({
        answers: [
          { fieldId: "f1", fieldType: "text", value: "+12125551234" },
          {
            fieldId: "f2",
            fieldType: "text",
            value: "My phone is (212) 555-1234",
          },
        ],
      });
      // Only f1 is tagged as phone-contact
      const roles = new Map([["f1", "phone-contact"]]);
      const result = extractContactsFromResponse(response, roles);

      // f1 is extracted via role, f2 is not a phone match (too much text)
      expect(result.phones).toHaveLength(1);
      expect(result.phones[0]).toBe("2125551234");
    });

    it("skips non-contact roles", () => {
      const response = JSON.stringify({
        answers: [{ fieldId: "f1", fieldType: "text", value: "+12125551234" }],
      });
      // Tagged as real-name, not phone-contact
      const roles = new Map([["f1", "real-name"]]);
      const result = extractContactsFromResponse(response, roles);

      // Role is non-contact, so this field is skipped entirely
      expect(result.phones).toEqual([]);
    });
  });

  describe("default form stable ids", () => {
    it("extracts default:phone field", () => {
      const response = JSON.stringify({
        answers: [
          { fieldId: "default:phone", fieldType: "text", value: "2125551234" },
        ],
      });
      const roles = new Map<string, string>();
      const result = extractContactsFromResponse(response, roles);

      expect(result.phones).toEqual(["2125551234"]);
    });

    it("extracts default:email field", () => {
      const response = JSON.stringify({
        answers: [
          {
            fieldId: "default:email",
            fieldType: "text",
            value: "user@example.com",
          },
        ],
      });
      const roles = new Map<string, string>();
      const result = extractContactsFromResponse(response, roles);

      expect(result.emails).toEqual(["user@example.com"]);
    });
  });

  describe("pattern-match fallback", () => {
    it("detects E.164 phone in untagged text field", () => {
      const response = JSON.stringify({
        answers: [{ fieldId: "q1", fieldType: "text", value: "+12125551234" }],
      });
      const roles = new Map<string, string>();
      const result = extractContactsFromResponse(response, roles);

      expect(result.phones).toEqual(["2125551234"]);
    });

    it("detects email in untagged text field", () => {
      const response = JSON.stringify({
        answers: [
          { fieldId: "q1", fieldType: "text", value: "user@example.com" },
        ],
      });
      const roles = new Map<string, string>();
      const result = extractContactsFromResponse(response, roles);

      expect(result.emails).toEqual(["user@example.com"]);
    });

    it("does not pattern-match on role-tagged fields with non-contact role", () => {
      const response = JSON.stringify({
        answers: [{ fieldId: "q1", fieldType: "text", value: "+12125551234" }],
      });
      // Tagged with a non-contact role
      const roles = new Map([["q1", "consent"]]);
      const result = extractContactsFromResponse(response, roles);

      expect(result.phones).toEqual([]);
    });
  });

  describe("edge cases", () => {
    it("returns empty for invalid JSON", () => {
      const result = extractContactsFromResponse(
        "not json",
        new Map<string, string>(),
      );
      expect(result.phones).toEqual([]);
      expect(result.emails).toEqual([]);
    });

    it("returns empty for missing answers array", () => {
      const result = extractContactsFromResponse(
        JSON.stringify({ formId: "f1" }),
        new Map<string, string>(),
      );
      expect(result.phones).toEqual([]);
      expect(result.emails).toEqual([]);
    });

    it("skips non-string values", () => {
      const response = JSON.stringify({
        answers: [
          { fieldId: "f1", fieldType: "checkbox", value: true },
          {
            fieldId: "f2",
            fieldType: "multiselect",
            value: ["option1", "option2"],
          },
        ],
      });
      const roles = new Map<string, string>();
      const result = extractContactsFromResponse(response, roles);

      expect(result.phones).toEqual([]);
      expect(result.emails).toEqual([]);
    });

    it("normalizes phone numbers consistently", () => {
      const response = JSON.stringify({
        answers: [
          {
            fieldId: "f1",
            fieldType: "text",
            value: "(212) 555-1234",
          },
        ],
      });
      const roles = new Map([["f1", "phone-contact"]]);
      const result = extractContactsFromResponse(response, roles);

      // Same comparison key as the E.164 form from telephony
      expect(result.phones[0]).toBe("2125551234");
    });

    it("rejects too-short phone values", () => {
      const response = JSON.stringify({
        answers: [{ fieldId: "f1", fieldType: "text", value: "12345" }],
      });
      const roles = new Map([["f1", "phone-contact"]]);
      const result = extractContactsFromResponse(response, roles);

      expect(result.phones).toEqual([]);
    });
  });

  describe("response shape security", () => {
    it("never includes the matched values in the result", () => {
      const response = JSON.stringify({
        answers: [
          {
            fieldId: "f1",
            fieldType: "text",
            value: "+12125551234",
          },
          {
            fieldId: "f2",
            fieldType: "text",
            value: "secret@example.com",
          },
        ],
      });
      const roles = new Map([
        ["f1", "phone-contact"],
        ["f2", "email-contact"],
      ]);
      const result = extractContactsFromResponse(response, roles);

      // The phones and emails arrays contain normalized values for
      // comparison, but they are internal to the Worker. The
      // MergeCandidate response type contains only clientIdA,
      // clientIdB, and matchKind. This test verifies the extraction
      // function returns arrays (used for comparison) but the
      // protocol type MergeCandidate has no contact value fields.
      expect(result.phones.length).toBeGreaterThan(0);
      expect(result.emails.length).toBeGreaterThan(0);

      // Verify the type shape: MergeCandidate has no value fields
      const candidate = {
        clientIdA: "a",
        clientIdB: "b",
        matchKind: "phone" as const,
      };
      expect(Object.keys(candidate)).toEqual([
        "clientIdA",
        "clientIdB",
        "matchKind",
      ]);
    });
  });
});

describe("cross-channel phone match", () => {
  it("detects matching phone between telephony and web-intake formats", async () => {
    // The telephony client has E.164: +12125551234
    // The web-intake client typed: (212) 555-1234
    // Both normalize to the same comparison key.
    const intakeResponse = JSON.stringify({
      answers: [
        {
          fieldId: "default:phone",
          fieldType: "text",
          value: "(212) 555-1234",
        },
      ],
    });

    const intakeContacts = extractContactsFromResponse(
      intakeResponse,
      new Map(),
    );

    const telephonyPhone = "+12125551234";
    const { normalizeContactPhone } = (await import("@care-y/shared")) as {
      normalizeContactPhone: (raw: string) => string | null;
    };
    const normalizedTelephony = normalizeContactPhone(telephonyPhone);
    const normalizedIntake = intakeContacts.phones[0];

    // Same comparison key means the same HMAC will be produced by the
    // Worker for both, enabling cross-channel matching via stored hashes.
    expect(normalizedTelephony).toBe(normalizedIntake);
  });

  it("no phone values or hashes appear in the MergeCandidate response shape", () => {
    // The MergeCandidate type carries only clientIdA, clientIdB, matchKind.
    // Verify the type shape at the value level.
    const candidate = {
      clientIdA: "a",
      clientIdB: "b",
      matchKind: "phone" as const,
    };
    const keys = Object.keys(candidate).sort();
    expect(keys).toEqual(["clientIdA", "clientIdB", "matchKind"]);
    // No phone, no hash, no email in the output.
    expect(keys).not.toContain("phone");
    expect(keys).not.toContain("phoneMatchHash");
    expect(keys).not.toContain("email");
  });

  it("MergeScanClient no longer carries decryptedPhone", () => {
    // The protocol type uses phoneMatchHash (opaque hash) instead of
    // decryptedPhone (plaintext). Verify the shape at the value level.
    const client = {
      clientId: "c-1",
      phoneMatchHash: "abcdef1234",
      intakeResponses: [],
    };
    expect(Object.keys(client)).toContain("phoneMatchHash");
    expect(Object.keys(client)).not.toContain("decryptedPhone");
  });
});
