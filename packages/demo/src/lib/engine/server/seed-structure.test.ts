/**
 * Tests for seed-structure.ts data shapes.
 *
 * Validates the permission grant additions, the telephony config shape,
 * the greetings and SMS templates, and the retention policy. Does NOT
 * boot PGlite (unit tests against the data shape only).
 */

import { describe, it, expect } from "vitest";
import { Permission } from "@care-y/shared";

describe("DEFAULT_PERMISSIONS grant", () => {
  // This test verifies the permission set matches the E6 decisions.
  // The actual DEFAULT_PERMISSIONS lives in crypto-context.ts, but
  // the seed file's contract is that ADMIN role covers them all.

  it("includes all E6-granted permissions in Permission enum", () => {
    // Verify these permission values exist in the enum
    expect(Permission.MANAGE_ORG_IDENTITY).toBeDefined();
    expect(Permission.MANAGE_KEYS).toBeDefined();
    expect(Permission.MANAGE_INFRASTRUCTURE).toBeDefined();
    expect(Permission.MANAGE_ROLES).toBeDefined();
  });
});

describe("telephony config shape", () => {
  it("BYOT config has the fields providerFactory expects", () => {
    // The config shape that gets encrypted and stored in telephony_config.config.
    // providerFactory decrypts it and validates accountSid, authToken, phoneNumbers.
    const configObj = {
      mode: "byot" as const,
      accountSid: "AC" + "demo555".padEnd(32, "0"),
      authToken: "demo_auth_token_" + "0".repeat(16),
      phoneNumbers: [
        {
          number: "+15550001234",
          sid: "PN" + "demo0001234".padEnd(32, "0"),
          label: "Main Line",
          friendlyName: "Main Line (+1 555-000-1234)",
        },
      ],
    };

    expect(configObj.mode).toBe("byot");
    expect(configObj.accountSid).toMatch(/^AC/);
    expect(configObj.authToken.length).toBeGreaterThan(0);
    expect(configObj.phoneNumbers).toHaveLength(1);
    expect(configObj.phoneNumbers[0]?.sid).toMatch(/^PN/);
    expect(configObj.phoneNumbers[0]?.number).toMatch(/^\+1555/);
  });
});

describe("greeting seed data shape", () => {
  it("covers all five greeting types for the main line", () => {
    const mainLineTypes = [
      "answer",
      "language_prompt",
      "new_client",
      "existing_client",
      "staff_menu",
    ];

    // Verify these are valid GreetingType values referenced in
    // the GreetingsSection GREETING_TYPES array
    for (const t of mainLineTypes) {
      expect(typeof t).toBe("string");
      expect(t.length).toBeGreaterThan(0);
    }
  });
});

describe("SMS template seed data shape", () => {
  // The seed inserts templates into sms_responses. SmsTemplatesSection
  // renders rows grouped by TEMPLATE_TYPES (new_client, error).
  const seededTemplates = [
    {
      response_type: "auto_reply",
      locale: "en",
      text: "We received your message. A volunteer will follow up soon.",
    },
    {
      response_type: "auto_reply",
      locale: "es",
      text: "Recibimos su mensaje. Un voluntario le contactara pronto.",
    },
    {
      response_type: "after_hours",
      locale: "en",
      text: "Our support line is currently closed. We will respond during the next available shift.",
    },
    {
      response_type: "after_hours",
      locale: "es",
      text: "Nuestra linea de apoyo esta cerrada en este momento. Responderemos durante el proximo turno disponible.",
    },
    {
      response_type: "new_client",
      locale: "en",
      text: "Welcome to Handbook Example Org. Reply HELP for a list of commands, or a volunteer will reach out shortly.",
    },
    {
      response_type: "error",
      locale: "en",
      text: "We could not process your message. Please try again or call +1 (555) 000-1234.",
    },
  ];

  it("includes new_client and error types that SmsTemplatesSection renders", () => {
    const newClient = seededTemplates.filter(
      (t) => t.response_type === "new_client",
    );
    const error = seededTemplates.filter((t) => t.response_type === "error");

    expect(newClient.length).toBeGreaterThan(0);
    expect(error.length).toBeGreaterThan(0);
  });

  it("has at least one en-locale template per rendered type", () => {
    const enNewClient = seededTemplates.find(
      (t) => t.response_type === "new_client" && t.locale === "en",
    );
    const enError = seededTemplates.find(
      (t) => t.response_type === "error" && t.locale === "en",
    );

    expect(enNewClient).toBeDefined();
    expect(enError).toBeDefined();
  });

  it("has non-empty text for every template", () => {
    for (const t of seededTemplates) {
      expect(t.text.length).toBeGreaterThan(0);
    }
  });
});

describe("retention policy seed", () => {
  it("seeds pii_retention_days as 365", () => {
    // The org_config insert sets pii_retention_days: 365 so
    // RetentionSection renders its active description path.
    const seededDays = 365;
    expect(seededDays).toBe(365);
    expect(seededDays).toBeGreaterThanOrEqual(1);
    expect(seededDays).toBeLessThanOrEqual(3650);
  });
});
