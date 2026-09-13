import { describe, it, expect, vi, beforeAll } from "vitest";
import fc from "fast-check";
import {
  generateOrgKeypair,
  decryptContent,
  buildContentAad,
  followupSlot,
  getSodium,
  deriveChannelId,
  deriveChannelAuth,
  hashChannelAuth,
  eciesDecrypt,
  PORTAL_KEY_CHECK,
  encode,
  requireSodium,
  oprfBlind,
  oprfFinalize,
  portalOprfInput,
  derivePortalKeypairFromOprf,
  toRistrettoPoint,
  type SodiumBackend,
  type SymmetricKey,
  type Ciphertext,
  type Nonce,
  type RistrettoPoint,
  decode,
} from "@care-y/crypto";
import type { ChannelEvaluateCallback } from "$lib/portal/portal-crypto.js";
import { queueIdSchema } from "@care-y/shared";
import {
  encryptIntake,
  buildContinuationPayload,
  resolveSubmitMetadata,
  type IntakeAnswer,
} from "./intake-crypto.js";

/** Fixed test "server key" for local OPRF evaluation. */
const TEST_SERVER_KEY = new Uint8Array(32).fill(0xaa);

function localEvaluate(blindedB64: string): string {
  const sodium = requireSodium();
  const blinded = decode(blindedB64);
  const evaluated = sodium.crypto_scalarmult_ristretto255(
    TEST_SERVER_KEY,
    blinded,
  );
  return encode(evaluated);
}

/** Derive a keypair through local OPRF simulation (for test assertions). */
function deriveViaLocalOprf(
  seed: Uint8Array,
): ReturnType<typeof derivePortalKeypairFromOprf> {
  const input = portalOprfInput(seed);
  const { blindedElement, blindState } = oprfBlind(input);
  const evaluatedB64 = localEvaluate(encode(blindedElement));
  const evaluatedBytes = decode(evaluatedB64);
  const oprfOutput = oprfFinalize(
    blindState,
    toRistrettoPoint(evaluatedBytes),
    input,
  );
  const kp = derivePortalKeypairFromOprf(oprfOutput);
  requireSodium().memzero(input);
  requireSodium().memzero(oprfOutput);
  return kp;
}

function makeStubEvaluate(): ChannelEvaluateCallback {
  return vi.fn(
    (
      _channelId: string,
      blindedB64: string,
      _auth?: string,
    ): Promise<{ evaluated: string }> =>
      Promise.resolve({ evaluated: localEvaluate(blindedB64) }),
  );
}

const noopPow = vi.fn().mockResolvedValue("noop");

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

  describe("buildContinuationPayload", () => {
    it("produces a channelId matching deriveChannelId of the decoded seed", async () => {
      const { payload, channelId, encodedSeed } =
        await buildContinuationPayload(
          "Test message",
          makeStubEvaluate(),
          noopPow,
        );
      const decodedSeed = decode(encodedSeed);
      expect(channelId).toBe(deriveChannelId(decodedSeed));
      expect(payload.channelId).toBe(channelId);
    });

    it("produces an authHash matching hashChannelAuth(deriveChannelAuth(seed))", async () => {
      const { payload, encodedSeed } = await buildContinuationPayload(
        "Test message",
        makeStubEvaluate(),
        noopPow,
      );
      const decodedSeed = decode(encodedSeed);
      const expectedAuth = hashChannelAuth(deriveChannelAuth(decodedSeed));
      expect(decode(payload.authHash)).toEqual(expectedAuth);
    });

    it("keyCheck decrypts to PORTAL_KEY_CHECK with the OPRF-derived keypair", async () => {
      const { payload, encodedSeed } = await buildContinuationPayload(
        "Test message",
        makeStubEvaluate(),
        noopPow,
      );
      const decodedSeed = decode(encodedSeed);
      const keypair = deriveViaLocalOprf(decodedSeed);

      try {
        const plaintext = eciesDecrypt(
          decode(payload.keyCheck.ephemeralPoint) as RistrettoPoint,
          decode(payload.keyCheck.nonce) as Nonce,
          decode(payload.keyCheck.ciphertext),
          keypair.clientPrivate,
        );
        expect(new TextDecoder().decode(plaintext)).toBe(PORTAL_KEY_CHECK);
      } finally {
        sodium.memzero(keypair.clientPrivate);
      }
    });

    it("selfCopy decrypts to the message text", async () => {
      const message = "I need to correct my phone number.";
      const { payload, encodedSeed } = await buildContinuationPayload(
        message,
        makeStubEvaluate(),
        noopPow,
      );
      const decodedSeed = decode(encodedSeed);
      const keypair = deriveViaLocalOprf(decodedSeed);

      try {
        expect(payload.selfCopy).toBeDefined();
        const plaintext = eciesDecrypt(
          decode(payload.selfCopy!.ephemeralPoint) as RistrettoPoint,
          decode(payload.selfCopy!.nonce) as Nonce,
          decode(payload.selfCopy!.ciphertext),
          keypair.clientPrivate,
        );
        expect(new TextDecoder().decode(plaintext)).toBe(message);
      } finally {
        sodium.memzero(keypair.clientPrivate);
      }
    });

    it("selfCopy is absent when message is null", async () => {
      const { payload } = await buildContinuationPayload(
        null,
        makeStubEvaluate(),
        noopPow,
      );
      expect(payload.selfCopy).toBeUndefined();
    });

    it("selfCopy is absent when message is empty", async () => {
      const { payload } = await buildContinuationPayload(
        "",
        makeStubEvaluate(),
        noopPow,
      );
      expect(payload.selfCopy).toBeUndefined();
    });

    it("channelId is 48 lowercase hex chars", async () => {
      const { channelId } = await buildContinuationPayload(
        null,
        makeStubEvaluate(),
        noopPow,
      );
      expect(channelId).toMatch(/^[0-9a-f]{48}$/);
    });

    it("authHash is base64url of 32 bytes", async () => {
      const { payload } = await buildContinuationPayload(
        null,
        makeStubEvaluate(),
        noopPow,
      );
      const decoded = decode(payload.authHash);
      expect(decoded).toHaveLength(32);
    });

    it("clientPublic is base64url of 32 bytes", async () => {
      const { payload } = await buildContinuationPayload(
        null,
        makeStubEvaluate(),
        noopPow,
      );
      const decoded = decode(payload.clientPublic);
      expect(decoded).toHaveLength(32);
    });
  });
});

// ---------------------------------------------------------------------------
// resolveSubmitMetadata
// ---------------------------------------------------------------------------

type Fields = Parameters<typeof resolveSubmitMetadata>[0];
type FieldEntry = Fields[number];
type Values = Parameters<typeof resolveSubmitMetadata>[1];

function testQueueId(): ReturnType<typeof queueIdSchema.parse> {
  return queueIdSchema.parse(crypto.randomUUID());
}

function field(
  overrides: Partial<FieldEntry> & Pick<FieldEntry, "config">,
): FieldEntry {
  return {
    role: null,
    fieldKey: `fk-${crypto.randomUUID().slice(0, 8)}`,
    ...overrides,
  };
}

const ALL_NULL = {
  resolvedQueueId: null,
  resolvedPriority: null,
  resolvedEscalationLevel: null,
};

describe("resolveSubmitMetadata", () => {
  describe("field skipping", () => {
    it("skips a field with role null and leaves all results null", () => {
      const fields: Fields = [
        field({
          fieldKey: "unroled-key",
          config: {
            type: "select",
            options: [{ key: "opt-a", label: { en: "A" } }],
            queueRoutingMapping: { "opt-a": testQueueId() },
          },
        }),
      ];
      const values: Values = { "unroled-key": "opt-a" };
      expect(resolveSubmitMetadata(fields, values)).toEqual(ALL_NULL);
    });

    it("resolves nothing when a role-carrying field has no matching value", () => {
      const queueId = testQueueId();
      const fields: Fields = [
        field({
          role: "queue-routing",
          fieldKey: "present-key",
          config: {
            type: "select",
            options: [{ key: "opt-a", label: { en: "A" } }],
            queueRoutingMapping: { "opt-a": queueId },
          },
        }),
      ];
      // "present-key" is absent from the values record
      const values: Values = {};
      expect(resolveSubmitMetadata(fields, values)).toEqual(ALL_NULL);
    });

    it("returns all three as null for an empty fields array", () => {
      expect(resolveSubmitMetadata([], { x: "y" })).toEqual(ALL_NULL);
    });
  });

  describe("queue-routing", () => {
    it("resolves the mapped queue id when the selected option is in the mapping", () => {
      const queueId = testQueueId();
      const fields: Fields = [
        field({
          role: "queue-routing",
          fieldKey: "q",
          config: {
            type: "select",
            options: [
              { key: "opt-x", label: { en: "X" } },
              { key: "opt-y", label: { en: "Y" } },
            ],
            queueRoutingMapping: { "opt-x": queueId },
          },
        }),
      ];
      const result = resolveSubmitMetadata(fields, { q: "opt-x" });
      expect(result.resolvedQueueId).toBe(queueId);
      expect(result.resolvedPriority).toBeNull();
      expect(result.resolvedEscalationLevel).toBeNull();
    });

    it("leaves the queue id null when the selected option is absent from the mapping", () => {
      const fields: Fields = [
        field({
          role: "queue-routing",
          fieldKey: "q",
          config: {
            type: "select",
            options: [
              { key: "opt-a", label: { en: "A" } },
              { key: "opt-b", label: { en: "B" } },
            ],
            queueRoutingMapping: { "opt-a": testQueueId() },
          },
        }),
      ];
      const result = resolveSubmitMetadata(fields, { q: "opt-b" });
      expect(result.resolvedQueueId).toBeNull();
    });

    it("leaves the queue id null when the select has no queueRoutingMapping", () => {
      const fields: Fields = [
        field({
          role: "queue-routing",
          fieldKey: "q",
          config: {
            type: "select",
            options: [{ key: "opt-a", label: { en: "A" } }],
          },
        }),
      ];
      const result = resolveSubmitMetadata(fields, { q: "opt-a" });
      expect(result.resolvedQueueId).toBeNull();
    });

    it("leaves the queue id null when the config type cannot hold a routing mapping", () => {
      const fields: Fields = [
        field({
          role: "queue-routing",
          fieldKey: "q",
          config: { type: "text" },
        }),
      ];
      const result = resolveSubmitMetadata(fields, { q: "anything" });
      expect(result.resolvedQueueId).toBeNull();
    });
  });

  describe("urgency", () => {
    it("resolves the mapped priority when the selected option is in the mapping", () => {
      const fields: Fields = [
        field({
          role: "urgency",
          fieldKey: "u",
          config: {
            type: "select",
            options: [
              { key: "opt-lo", label: { en: "Low" } },
              { key: "opt-ur", label: { en: "Urgent" } },
            ],
            urgencyMapping: { "opt-lo": "low", "opt-ur": "urgent" },
          },
        }),
      ];
      const result = resolveSubmitMetadata(fields, { u: "opt-ur" });
      expect(result.resolvedPriority).toBe("urgent");
    });

    it("leaves the priority null when the selected option is absent from the mapping", () => {
      const fields: Fields = [
        field({
          role: "urgency",
          fieldKey: "u",
          config: {
            type: "select",
            options: [
              { key: "opt-a", label: { en: "A" } },
              { key: "opt-b", label: { en: "B" } },
            ],
            urgencyMapping: { "opt-a": "high" },
          },
        }),
      ];
      const result = resolveSubmitMetadata(fields, { u: "opt-b" });
      expect(result.resolvedPriority).toBeNull();
    });

    it("leaves the priority null when the select has no urgencyMapping", () => {
      const fields: Fields = [
        field({
          role: "urgency",
          fieldKey: "u",
          config: {
            type: "select",
            options: [{ key: "opt-a", label: { en: "A" } }],
          },
        }),
      ];
      const result = resolveSubmitMetadata(fields, { u: "opt-a" });
      expect(result.resolvedPriority).toBeNull();
    });
  });

  describe("escalation (select)", () => {
    it("resolves the mapped escalation level when the selected option is in the mapping", () => {
      const fields: Fields = [
        field({
          role: "escalation",
          fieldKey: "e",
          config: {
            type: "select",
            options: [
              { key: "opt-s", label: { en: "Standard" } },
              { key: "opt-c", label: { en: "Critical" } },
            ],
            escalationMapping: { "opt-c": "critical-review" },
          },
        }),
      ];
      const result = resolveSubmitMetadata(fields, { e: "opt-c" });
      expect(result.resolvedEscalationLevel).toBe("critical-review");
    });

    it("leaves the escalation level null when the selected option is absent from the mapping", () => {
      const fields: Fields = [
        field({
          role: "escalation",
          fieldKey: "e",
          config: {
            type: "select",
            options: [
              { key: "opt-a", label: { en: "A" } },
              { key: "opt-b", label: { en: "B" } },
            ],
            escalationMapping: { "opt-a": "flagged" },
          },
        }),
      ];
      const result = resolveSubmitMetadata(fields, { e: "opt-b" });
      expect(result.resolvedEscalationLevel).toBeNull();
    });

    it("leaves the escalation level null when the select has no escalationMapping", () => {
      const fields: Fields = [
        field({
          role: "escalation",
          fieldKey: "e",
          config: {
            type: "select",
            options: [{ key: "opt-a", label: { en: "A" } }],
          },
        }),
      ];
      const result = resolveSubmitMetadata(fields, { e: "opt-a" });
      expect(result.resolvedEscalationLevel).toBeNull();
    });
  });

  describe("escalation (checkbox)", () => {
    it("resolves the level to 'triggered' when the checkbox is checked", () => {
      const fields: Fields = [
        field({
          role: "escalation",
          fieldKey: "cb",
          config: { type: "checkbox" },
        }),
      ];
      const result = resolveSubmitMetadata(fields, { cb: true });
      expect(result.resolvedEscalationLevel).toBe("triggered");
    });

    it("leaves the level null when the checkbox is unchecked", () => {
      const fields: Fields = [
        field({
          role: "escalation",
          fieldKey: "cb",
          config: { type: "checkbox" },
        }),
      ];
      const result = resolveSubmitMetadata(fields, { cb: false });
      expect(result.resolvedEscalationLevel).toBeNull();
    });

    it("leaves the level null when the checkbox value was never set", () => {
      const fields: Fields = [
        field({
          role: "escalation",
          fieldKey: "cb",
          config: { type: "checkbox" },
        }),
      ];
      const result = resolveSubmitMetadata(fields, {});
      expect(result.resolvedEscalationLevel).toBeNull();
    });
  });

  describe("combined", () => {
    it("resolves all three signals in a single pass when the form carries all roles", () => {
      const queueId = testQueueId();
      const fields: Fields = [
        field({
          role: "queue-routing",
          fieldKey: "route",
          config: {
            type: "select",
            options: [{ key: "opt-r", label: { en: "Route" } }],
            queueRoutingMapping: { "opt-r": queueId },
          },
        }),
        field({
          role: "urgency",
          fieldKey: "prio",
          config: {
            type: "select",
            options: [{ key: "opt-h", label: { en: "High" } }],
            urgencyMapping: { "opt-h": "high" },
          },
        }),
        field({
          role: "escalation",
          fieldKey: "esc",
          config: { type: "checkbox" },
        }),
      ];
      const values: Values = { route: "opt-r", prio: "opt-h", esc: true };
      const result = resolveSubmitMetadata(fields, values);
      expect(result).toEqual({
        resolvedQueueId: queueId,
        resolvedPriority: "high",
        resolvedEscalationLevel: "triggered",
      });
    });
  });
});
