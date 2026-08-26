import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import {
  generateOrgKeypair,
  decryptContent,
  buildContentAad,
  followupSlot,
  getSodium,
  type SodiumBackend,
  type SymmetricKey,
  type Ciphertext,
  decode,
} from "@care-y/crypto";
import { encryptIntake, type IntakeAnswer } from "./intake-crypto.js";

describe("intake-crypto", () => {
  let sodium: SodiumBackend;
  let orgPublicKey: Uint8Array;
  let orgSecretKey: Uint8Array;

  beforeAll(async () => {
    sodium = await getSodium();
    const kp = generateOrgKeypair();
    orgPublicKey = kp.publicKey;
    orgSecretKey = kp.secretKey;
  });

  const FORM_RESPONSE_SLOT = "intake-form-response";

  function makeIds(): {
    ticketId: string;
    followUpId: string;
  } {
    return {
      ticketId: crypto.randomUUID(),
      followUpId: crypto.randomUUID(),
    };
  }

  function recoverTk(wrappedTkB64: string): SymmetricKey {
    const sealedBytes = decode(wrappedTkB64);
    return sodium.crypto_box_seal_open(
      sealedBytes,
      orgPublicKey,
      orgSecretKey,
    ) as SymmetricKey;
  }

  function decryptField(
    ciphertextB64: string,
    tk: SymmetricKey,
    aad: Uint8Array,
  ): string {
    const plainBytes = decryptContent(
      decode(ciphertextB64) as Ciphertext,
      tk,
      aad,
    );
    return new TextDecoder().decode(plainBytes);
  }

  describe("encryptIntake roundtrip", () => {
    it("recovers all fields from a default form submission", () => {
      const ids = makeIds();
      const answers: IntakeAnswer[] = [
        {
          fieldKey: "default:name",
          fieldType: "text",
          label: "Your name",
          value: "Alice",
        },
        {
          fieldKey: "default:contact-method",
          fieldType: "text",
          label: "How should we reach you?",
          value: "Text or call my phone",
        },
        {
          fieldKey: "default:contact-detail",
          fieldType: "text",
          label: "Phone number",
          value: "+1-555-0123",
        },
        {
          fieldKey: "default:message",
          fieldType: "textarea",
          label: "Your message",
          value: "I need help with housing.",
        },
      ];

      const result = encryptIntake(null, answers, orgPublicKey, {
        ticketId: ids.ticketId,
        followUpId: ids.followUpId,
      });

      // Recover tk from the sealed wrap
      const tk = recoverTk(result.wrappedTk);

      // Title includes the name for default form
      const title = decryptField(
        result.encryptedTitle,
        tk,
        buildContentAad(ids.ticketId, "title"),
      );
      expect(title).toBe("Web intake - Alice");

      // Description contains all answered fields
      const description = decryptField(
        result.encryptedDescription,
        tk,
        buildContentAad(ids.ticketId, "description"),
      );
      expect(description).toContain("Your name: Alice");
      expect(description).toContain("Phone number: +1-555-0123");
      expect(description).toContain("Your message: I need help with housing.");

      // Message follow-up is the textarea content
      expect(result.encryptedMessage).not.toBeNull();
      const message = decryptField(
        result.encryptedMessage!,
        tk,
        buildContentAad(ids.ticketId, followupSlot(ids.followUpId)),
      );
      expect(message).toBe("I need help with housing.");

      // Form response blob is valid JSON with the expected shape
      const responseJson = decryptField(
        result.encryptedFormResponse,
        tk,
        buildContentAad(ids.ticketId, FORM_RESPONSE_SLOT),
      );
      const response: unknown = JSON.parse(responseJson);
      expect(response).toEqual({
        formId: null,
        answers: [
          { fieldKey: "default:name", fieldType: "text", value: "Alice" },
          {
            fieldKey: "default:contact-method",
            fieldType: "text",
            value: "Text or call my phone",
          },
          {
            fieldKey: "default:contact-detail",
            fieldType: "text",
            value: "+1-555-0123",
          },
          {
            fieldKey: "default:message",
            fieldType: "textarea",
            value: "I need help with housing.",
          },
        ],
      });
    });

    it("produces bare 'Web intake' title when name is empty", () => {
      const ids = makeIds();
      const answers: IntakeAnswer[] = [
        {
          fieldKey: "default:name",
          fieldType: "text",
          label: "Your name",
          value: "",
        },
        {
          fieldKey: "default:message",
          fieldType: "textarea",
          label: "Your message",
          value: "Help.",
        },
      ];

      const result = encryptIntake(null, answers, orgPublicKey, {
        ticketId: ids.ticketId,
        followUpId: ids.followUpId,
      });

      const tk = recoverTk(result.wrappedTk);
      const title = decryptField(
        result.encryptedTitle,
        tk,
        buildContentAad(ids.ticketId, "title"),
      );
      expect(title).toBe("Web intake");
    });

    it("produces bare 'Web intake' title for custom form (no default:name field)", () => {
      const ids = makeIds();
      const answers: IntakeAnswer[] = [
        {
          fieldKey: "custom-1",
          fieldType: "textarea",
          label: "Situation",
          value: "Need assistance.",
        },
      ];

      const result = encryptIntake("form-abc", answers, orgPublicKey, {
        ticketId: ids.ticketId,
        followUpId: ids.followUpId,
      });

      const tk = recoverTk(result.wrappedTk);
      const title = decryptField(
        result.encryptedTitle,
        tk,
        buildContentAad(ids.ticketId, "title"),
      );
      expect(title).toBe("Web intake");
    });

    it("sets encryptedMessage to null when no textarea answer exists", () => {
      const ids = makeIds();
      const answers: IntakeAnswer[] = [
        {
          fieldKey: "field-1",
          fieldType: "text",
          label: "Full name",
          value: "Bob",
        },
        {
          fieldKey: "field-2",
          fieldType: "select",
          label: "Service",
          value: "housing",
        },
      ];

      const result = encryptIntake("form-xyz", answers, orgPublicKey, {
        ticketId: ids.ticketId,
        followUpId: null,
      });

      expect(result.encryptedMessage).toBeNull();
    });

    it("handles multiselect values in the description and response", () => {
      const ids = makeIds();
      const answers: IntakeAnswer[] = [
        {
          fieldKey: "field-ms",
          fieldType: "multiselect",
          label: "Services",
          value: ["Housing", "Legal", "Medical"],
        },
      ];

      const result = encryptIntake("form-ms", answers, orgPublicKey, {
        ticketId: ids.ticketId,
        followUpId: null,
      });

      const tk = recoverTk(result.wrappedTk);
      const description = decryptField(
        result.encryptedDescription,
        tk,
        buildContentAad(ids.ticketId, "description"),
      );
      expect(description).toContain("Services: Housing, Legal, Medical");

      const responseJson = decryptField(
        result.encryptedFormResponse,
        tk,
        buildContentAad(ids.ticketId, FORM_RESPONSE_SLOT),
      );
      const response = JSON.parse(responseJson) as {
        answers: { value: unknown }[];
      };
      expect(response.answers[0]?.value).toEqual([
        "Housing",
        "Legal",
        "Medical",
      ]);
    });

    it("handles availability values in the description and response", () => {
      const ids = makeIds();
      const answers: IntakeAnswer[] = [
        {
          fieldKey: "field-av",
          fieldType: "availability",
          label: "When available",
          value: {
            timezone: "America/Chicago",
            recurring: [{ day: "monday", start: "09:00", end: "12:00" }],
            specific: [],
          },
        },
      ];

      const result = encryptIntake("form-av", answers, orgPublicKey, {
        ticketId: ids.ticketId,
        followUpId: null,
      });

      const tk = recoverTk(result.wrappedTk);
      const description = decryptField(
        result.encryptedDescription,
        tk,
        buildContentAad(ids.ticketId, "description"),
      );
      expect(description).toContain("monday 09:00-12:00");
      expect(description).toContain("America/Chicago");

      const responseJson = decryptField(
        result.encryptedFormResponse,
        tk,
        buildContentAad(ids.ticketId, FORM_RESPONSE_SLOT),
      );
      const response = JSON.parse(responseJson) as {
        answers: { value: unknown }[];
      };
      expect(response.answers[0]?.value).toEqual({
        timezone: "America/Chicago",
        recurring: [{ day: "monday", start: "09:00", end: "12:00" }],
        specific: [],
      });
    });
  });

  describe("tampered ciphertext", () => {
    it("throws when title ciphertext is tampered", () => {
      const ids = makeIds();
      const answers: IntakeAnswer[] = [
        {
          fieldKey: "default:message",
          fieldType: "textarea",
          label: "Message",
          value: "Hello",
        },
      ];

      const result = encryptIntake(null, answers, orgPublicKey, {
        ticketId: ids.ticketId,
        followUpId: ids.followUpId,
      });

      const tk = recoverTk(result.wrappedTk);

      // Tamper with the ciphertext by flipping a byte
      const titleBytes = decode(result.encryptedTitle);
      titleBytes[titleBytes.length - 1] =
        (titleBytes[titleBytes.length - 1] ?? 0) ^ 0xff;

      expect(() =>
        decryptContent(
          titleBytes as Ciphertext,
          tk,
          buildContentAad(ids.ticketId, "title"),
        ),
      ).toThrow();
    });

    it("throws when AAD slot does not match", () => {
      const ids = makeIds();
      const answers: IntakeAnswer[] = [
        {
          fieldKey: "default:message",
          fieldType: "textarea",
          label: "Message",
          value: "Hello",
        },
      ];

      const result = encryptIntake(null, answers, orgPublicKey, {
        ticketId: ids.ticketId,
        followUpId: ids.followUpId,
      });

      const tk = recoverTk(result.wrappedTk);

      // Try to decrypt title ciphertext with the wrong AAD slot
      expect(() =>
        decryptContent(
          decode(result.encryptedTitle) as Ciphertext,
          tk,
          buildContentAad(ids.ticketId, "description"),
        ),
      ).toThrow();
    });
  });

  describe("fast-check properties", () => {
    it("roundtrips arbitrary unicode fields", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 5_000 }),
          (name, message) => {
            const ids = makeIds();
            const answers: IntakeAnswer[] = [
              {
                fieldKey: "default:name",
                fieldType: "text",
                label: "Name",
                value: name,
              },
              {
                fieldKey: "default:message",
                fieldType: "textarea",
                label: "Message",
                value: message,
              },
            ];

            const result = encryptIntake(null, answers, orgPublicKey, {
              ticketId: ids.ticketId,
              followUpId: ids.followUpId,
            });

            const tk = recoverTk(result.wrappedTk);

            // Verify description roundtrips
            const description = decryptField(
              result.encryptedDescription,
              tk,
              buildContentAad(ids.ticketId, "description"),
            );
            if (name !== "") {
              expect(description).toContain(`Name: ${name}`);
            }
            expect(description).toContain(`Message: ${message}`);

            // Verify message follow-up roundtrips
            expect(result.encryptedMessage).not.toBeNull();
            const recovered = decryptField(
              result.encryptedMessage!,
              tk,
              buildContentAad(ids.ticketId, followupSlot(ids.followUpId)),
            );
            expect(recovered).toBe(message);
          },
        ),
        { numRuns: 20 },
      );
    });
  });

  describe("wrappedTk", () => {
    it("produces an 80-byte sealed box (32-byte key + 48-byte seal overhead)", () => {
      const ids = makeIds();
      const answers: IntakeAnswer[] = [
        {
          fieldKey: "default:message",
          fieldType: "textarea",
          label: "Message",
          value: "test",
        },
      ];

      const result = encryptIntake(null, answers, orgPublicKey, {
        ticketId: ids.ticketId,
        followUpId: ids.followUpId,
      });

      const sealedBytes = decode(result.wrappedTk);
      expect(sealedBytes).toHaveLength(80);
    });
  });
});
