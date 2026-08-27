// @vitest-environment jsdom

/**
 * Dynamic form visibility tests: proves that answers for conditionally hidden
 * fields are stripped from the encrypted payload, that in-memory values survive
 * a hide/show cycle, that hidden required fields do not block submission, and
 * that the notEquals operator treats unanswered fields as satisfying the
 * condition.
 *
 * Separate file from intake-page.test.ts because the decryptFieldContent mock
 * needs per-field return values (the existing file stubs it as a bare vi.fn()).
 * A shared mock factory would complicate both suites.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as IntakeCrypto from "./intake-crypto.js";
import type * as IntakeFormCrypto from "$lib/portal/intake-form-crypto.js";
import type * as CryptoPkg from "@care-y/crypto";
import type * as PowSolver from "$lib/auth/pow-solver.js";
import type * as AnnounceModule from "$lib/utils/announce.js";
import type { DecryptedFieldContent } from "$lib/portal/intake-form-crypto.js";
import type { IntakeFieldConfig, VisibleWhenV2 } from "@care-y/shared";

// --- Controllable mock state ---

let mockOrgKey: Uint8Array | null = new Uint8Array(32);
let mockOrgKeyLoading = false;
let mockPowRequired = false;
let mockFormData: {
  formId: string | null;
  fields: unknown[] | null;
  encryptedFormMeta?: string | null;
  intakeDisabled?: boolean;
  formClosed?: boolean;
  builtinFormDisabled?: boolean;
} = { formId: null, fields: null };

let mockMutateFn: ReturnType<typeof vi.fn>;
let mockMutationPending = false;
let mockMutateAsync: ReturnType<typeof vi.fn>;

// --- Field definitions for the dynamic form scenario ---

// Field A: a select with yes/no options
const FIELD_A_KEY = "field-a-select";
const FIELD_A_CONFIG: IntakeFieldConfig = {
  type: "select",
  options: [
    { key: "yes", label: { en: "Yes" } },
    { key: "no", label: { en: "No" } },
  ],
};

// Field B: a text field visible when A equals "yes"
const FIELD_B_KEY = "field-b-text";
const FIELD_B_VISIBLE_WHEN: VisibleWhenV2 = {
  version: 2,
  groups: [[{ fieldKey: FIELD_A_KEY, operator: "equals", optionKey: "yes" }]],
};
const FIELD_B_CONFIG: IntakeFieldConfig = {
  type: "text",
  maxLength: 200,
  placeholder: { en: "Dependent text" },
};

// Field C: a text field visible when A notEquals "yes" (visible when unanswered or "no")
const FIELD_C_KEY = "field-c-negation";
const FIELD_C_VISIBLE_WHEN: VisibleWhenV2 = {
  version: 2,
  groups: [
    [{ fieldKey: FIELD_A_KEY, operator: "notEquals", optionKey: "yes" }],
  ],
};
const FIELD_C_CONFIG: IntakeFieldConfig = {
  type: "text",
  maxLength: 200,
  placeholder: { en: "Negation text" },
};

/**
 * Map encrypted label stubs to their DecryptedFieldContent. The component
 * passes { encryptedLabel, encryptedConfig } to decryptFieldContent. We key
 * the mock on encryptedLabel since each field stub has a unique label string.
 */
const fieldContentByLabel: Record<string, DecryptedFieldContent> = {
  "enc-label-a": {
    label: { en: "Question A" },
    config: FIELD_A_CONFIG,
  },
  "enc-label-b": {
    label: { en: "Dependent field B" },
    config: FIELD_B_CONFIG,
    visibleWhen: FIELD_B_VISIBLE_WHEN,
  },
  "enc-label-c": {
    label: { en: "Negation field C" },
    config: FIELD_C_CONFIG,
    visibleWhen: FIELD_C_VISIBLE_WHEN,
  },
};

/**
 * Encrypted field stubs as returned by the intakeForm query. Each carries
 * the same shape the server returns (fieldKey, fieldType, role, isRequired,
 * encryptedLabel, encryptedConfig). The encrypted strings are opaque stubs
 * keyed to the fieldContentByLabel map.
 */
function makeServerFields(
  overrides?: Partial<{
    bRequired: boolean;
    includeC: boolean;
  }>,
): unknown[] {
  const bRequired = overrides?.bRequired ?? false;
  const includeC = overrides?.includeC ?? false;

  const fields: unknown[] = [
    {
      fieldKey: FIELD_A_KEY,
      fieldType: "select",
      role: null,
      isRequired: true,
      encryptedLabel: "enc-label-a",
      encryptedConfig: "enc-config-a",
    },
    {
      fieldKey: FIELD_B_KEY,
      fieldType: "text",
      role: null,
      isRequired: bRequired,
      encryptedLabel: "enc-label-b",
      encryptedConfig: "enc-config-b",
    },
  ];

  if (includeC) {
    fields.push({
      fieldKey: FIELD_C_KEY,
      fieldType: "text",
      role: null,
      isRequired: false,
      encryptedLabel: "enc-label-c",
      encryptedConfig: "enc-config-c",
    });
  }

  return fields;
}

// --- Mocks ---

// $app/environment: covered by test-setup.ts (global setupFile)

vi.mock("$app/paths", async (importOriginal) => ({
  ...(await importOriginal()),
  resolve: (path: string) => path,
}));

vi.mock("@tanstack/svelte-query", async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  return {
    ...original,
    createQuery: (optsFn: () => Record<string, unknown>) => {
      const opts = optsFn();
      const key = JSON.stringify(opts.queryKey);
      if (key.includes("orgPublicKey")) {
        return {
          get data() {
            return mockOrgKey;
          },
          get isLoading() {
            return mockOrgKeyLoading;
          },
          isError: false,
          error: null,
        };
      }
      if (key.includes("intakeConfig")) {
        return {
          data: { powRequired: mockPowRequired },
          isLoading: false,
          isError: false,
          error: null,
        };
      }
      if (key.includes("intakeForm")) {
        return {
          data: mockFormData,
          isLoading: false,
          isError: false,
          error: null,
        };
      }
      if (key.includes("intakeChallenge")) {
        return {
          data: null,
          isLoading: false,
          isError: false,
          error: null,
        };
      }
      return {
        data: null,
        isLoading: false,
        isError: false,
        error: null,
      };
    },
    createMutation: () => ({
      get isPending() {
        return mockMutationPending;
      },
      mutate: mockMutateFn,
      mutateAsync: mockMutateAsync,
      isError: false,
      error: null,
    }),
  };
});

const {
  mockEncryptIntake,
  mockBuildAccountPayload,
  mockBuildContinuationPayload,
} = vi.hoisted(() => ({
  mockEncryptIntake: vi.fn().mockReturnValue({
    encryptedTitle: "enc-title",
    encryptedDescription: "enc-desc",
    encryptedMessage: "enc-msg",
    encryptedFormResponse: "enc-response",
    wrappedTk: "enc-wrap",
  }),
  mockBuildAccountPayload: vi.fn().mockResolvedValue({
    accountId: "test-account-id",
    username: "testuser",
    salt: "dGVzdHNhbHQ=",
    publicKey: "dGVzdHB1YmtleQ==",
    authHash: "dGVzdGF1dGhoYXNo",
    keyCheck: {
      ephemeralPoint: "ep",
      nonce: "nc",
      ciphertext: "ct",
    },
  }),
  mockBuildContinuationPayload: vi.fn().mockReturnValue({
    payload: {
      channelId: "abc123def456abc123def456abc123def456abc123def456",
      authHash: "bW9jay1hdXRoLWhhc2g",
      clientPublic: "bW9jay1wdWJsaWMta2V5",
      keyCheck: {
        ephemeralPoint: "ep-cont",
        nonce: "nc-cont",
        ciphertext: "ct-cont",
      },
    },
    channelId: "abc123def456abc123def456abc123def456abc123def456",
    encodedSeed: "bW9jay1lbmNvZGVkLXNlZWQ",
  }),
}));

// vi.mock required: intake-crypto.ts imports @care-y/crypto barrel which
// triggers libsodium WASM initialization. Spread importOriginal to keep
// resolveSubmitMetadata and type exports.
vi.mock("./intake-crypto.js", async (importOriginal) => ({
  ...(await importOriginal<typeof IntakeCrypto>()),
  encryptIntake: mockEncryptIntake,
  buildAccountPayload: mockBuildAccountPayload,
  buildContinuationPayload: mockBuildContinuationPayload,
}));

// vi.mock required: intake-form-crypto.ts imports crypto barrel (WASM init).
// decryptFieldContent returns per-field shapes keyed by encryptedLabel.
vi.mock("$lib/portal/intake-form-crypto.js", async (importOriginal) => ({
  ...(await importOriginal<typeof IntakeFormCrypto>()),
  decryptFieldContent: vi
    .fn()
    .mockImplementation(
      (enc: { encryptedLabel: string }): DecryptedFieldContent => {
        const content = fieldContentByLabel[enc.encryptedLabel];
        if (content == null) {
          throw new Error(
            `Unexpected encryptedLabel in test: ${enc.encryptedLabel}`,
          );
        }
        return content;
      },
    ),
}));

// vi.mock required: @care-y/crypto barrel triggers libsodium WASM init.
vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoPkg>()),
  decode: (s: string) => new Uint8Array(Buffer.from(s, "base64")),
}));

// vi.mock required: pow-solver imports @care-y/crypto barrel (WASM init).
vi.mock("$lib/auth/pow-solver.js", async (importOriginal) => ({
  ...(await importOriginal<typeof PowSolver>()),
  solveProofOfWork: vi.fn().mockResolvedValue("solution-hex"),
}));

// vi.mock required: announce.js uses browser-only live region APIs.
vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AnnounceModule>()),
  announceToLiveRegion: vi.fn(),
}));

// vi.mock required: trpc/index.js creates a live HTTP client on import.
vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal()),
  trpc: {
    branding: {
      getPublicBranding: {
        query: vi.fn().mockResolvedValue({ orgPublicKey: null }),
      },
    },
    clientPortal: {
      getIntakeConfig: { query: vi.fn() },
      getIntakeForm: { query: vi.fn() },
      getIntakeChallenge: { query: vi.fn() },
      submitIntake: { mutate: vi.fn() },
    },
  },
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  intake_title: () => "Get help",
  intake_intro: () => "We're here to help.",
  intake_field_name_label: () => "Your name",
  intake_field_name_hint: () => "optional",
  intake_contact_method_label: () => "How should we reach you?",
  intake_contact_phone: () => "Text or call my phone",
  intake_contact_email: () => "Email me",
  intake_contact_none: () => "I'll check back myself",
  intake_contact_none_note: () =>
    "The organization will not be able to reach out to you.",
  intake_field_contact_detail_phone_label: () => "Phone number",
  intake_field_contact_detail_email_label: () => "Email address",
  intake_field_message_label: () => "Your message",
  intake_field_message_placeholder: () => "What's going on?",
  intake_char_count: ({ count, max }: { count: number; max: number }) =>
    `${String(count)} / ${String(max)}`,
  intake_submit: () => "Send encrypted message",
  intake_submitting: () => "Sending...",
  intake_solving_challenge: () => "Securing your message...",
  intake_success_heading: () => "Your message was sent",
  intake_success_body: () => "A volunteer will read it as soon as possible.",
  intake_reference_label: () => "Your reference code:",
  intake_reference_save: () => "Save it if you want to follow up by phone.",
  intake_submit_hint: () => "What you wrote has been encrypted.",
  intake_hint_dismiss: () => "Got it",
  intake_error_generic: () =>
    "Your message didn't go through. Nothing was sent. Try again.",
  intake_error_rate_limited: ({ minutes }: { minutes: string }) =>
    `Too many messages. Try again in about ${minutes} minutes.`,
  intake_error_encryption_unavailable: () =>
    "This form can't encrypt right now. Please call instead.",
  intake_error_field_required: () => "This field is required.",
  intake_error_message_required: () =>
    "Please write a message so we know how to help.",
  intake_not_available: () =>
    "This form is not available. Contact the organization directly.",
  intake_form_closed_default: () =>
    "This form is no longer accepting submissions.",
  intake_noscript: () => "This form needs JavaScript.",
  intake_protected_title: () => "How you're protected",
  intake_protected_summary: () => "Your data is encrypted.",
  intake_protected_encrypted_what: () => "Encrypted in browser.",
  intake_protected_encrypted_why: () => "Server cannot read.",
  intake_protected_volunteers_what: () => "Volunteers only.",
  intake_protected_volunteers_why: () => "Limited access.",
  intake_protected_server_what: () => "Server stores scrambled data.",
  intake_protected_server_why: () => "Cannot decode.",
  account_intake_optin_title: () => "Add a secure account (optional)",
  account_intake_optin_body: () => "Read replies here with a password.",
  account_login_username: () => "Username",
  account_login_password: () => "Password",
  account_create_confirm: () => "Confirm password",
  account_create_mismatch: () => "Passwords do not match.",
  account_create_username_hint: () => "Pick a username you can remember.",
  account_create_password_hint: () => "Use 8 or more characters.",
  account_create_warning_password: () =>
    "There is no way to recover this password.",
  account_create_warning_reset: () =>
    "If your password is ever reset, history is lost.",
  account_unlocking: () => "Unlocking your messages...",
  account_username_taken: () => "That username is already taken.",
  account_intake_confirm_reminder: ({ username }: { username: string }) =>
    `Your username is ${username}. Sign in at /account.`,
  intake_continuation_toggle_title: () =>
    "Save a link to add more later (optional)",
  intake_continuation_toggle_body: () =>
    "Get a link you can reopen to add information or read replies.",
  intake_continuation_expanded_text: () =>
    "After you submit, you will receive a link.",
  intake_continuation_expanded_warning: () =>
    "If you lose this link, there is no way to recover it.",
  intake_continuation_link_label: () => "Your continuation link:",
  intake_continuation_copy_button: () => "Copy link",
  intake_continuation_copied: () => "Link copied.",
  intake_continuation_copy_error: () =>
    "Could not copy the link. Select it manually and copy.",
  intake_continuation_warning: () =>
    "This link is the only way back to your conversation.",
  intake_continuation_hint: () =>
    "The link above carries the key that unlocks your conversation.",
}));

vi.mock("$lib/shell/PageShell.svelte", async (importOriginal) => ({
  ...(await importOriginal()),
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/shell/ShellToast.svelte", async (importOriginal) => ({
  ...(await importOriginal()),
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

import IntakePage from "./+page.svelte";
import type { IntakeAnswer } from "./intake-crypto.js";

// --- Helpers ---

/**
 * Set a DOM input/textarea/select value directly and dispatch the matching
 * event so Konsta's handler fires with e.target.value.
 */
function setInputValue(
  el: HTMLInputElement | HTMLTextAreaElement,
  val: string,
): void {
  Object.defineProperty(el, "value", { writable: true, value: val });
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

function setSelectValue(el: HTMLSelectElement, val: string): void {
  Object.defineProperty(el, "value", { writable: true, value: val });
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * Find the select element for field A. Konsta wraps the select inside a
 * ListInput with an id derived from the fieldKey.
 */
function findSelectA(): HTMLSelectElement {
  const el = document.getElementById(`intake-field-${FIELD_A_KEY}`);
  if (el instanceof HTMLSelectElement) return el;
  // Fallback: Konsta's ListInput may nest the select inside a wrapper
  const select = document.querySelector(
    `select#intake-field-${FIELD_A_KEY}`,
  ) as HTMLSelectElement | null;
  if (select) return select;
  throw new Error("Could not find select element for field A");
}

/**
 * Find the text input for a given field key.
 */
function findTextInput(fieldKey: string): HTMLInputElement {
  const el = document.getElementById(
    `intake-field-${fieldKey}`,
  ) as HTMLInputElement | null;
  if (el) return el;
  throw new Error(`Could not find text input for field ${fieldKey}`);
}

// --- Tests ---

describe("dynamic form conditional visibility", () => {
  beforeEach(() => {
    mockOrgKey = new Uint8Array(32);
    mockOrgKeyLoading = false;
    mockPowRequired = false;
    mockMutationPending = false;
    mockMutateFn = vi.fn();
    mockMutateAsync = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  // ---------------------------------------------------------------
  // Scenario 1: hidden field B excluded from encrypted payload
  // ---------------------------------------------------------------

  it("excludes hidden field answers from the encrypted payload", async () => {
    mockFormData = {
      formId: "test-form-1",
      fields: makeServerFields(),
      encryptedFormMeta: null,
    };
    mockMutateAsync.mockResolvedValue({ reference: "test-ref-1" });

    render(IntakePage);

    // Select "yes" on A so B becomes visible
    const selectA = findSelectA();
    setSelectValue(selectA, "yes");

    // Type into B
    const inputB = findTextInput(FIELD_B_KEY);
    setInputValue(inputB, "user typed this");

    // Now switch A to "no" so B hides
    setSelectValue(selectA, "no");

    // Submit
    const submitBtn = screen.getByTestId("intake-submit");
    await fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(mockEncryptIntake).toHaveBeenCalled();
    });

    // The second argument to encryptIntake is the answers array
    const answersArg = mockEncryptIntake.mock.calls
      .at(0)
      ?.at(1) as IntakeAnswer[];
    const answerKeys = answersArg.map((a) => a.fieldKey);

    expect(answerKeys).toContain(FIELD_A_KEY);
    expect(answerKeys).not.toContain(FIELD_B_KEY);

    // Verify A's value is correct
    const answerA = answersArg.find((a) => a.fieldKey === FIELD_A_KEY);
    expect(answerA).toBeDefined();
    expect(answerA?.value).toBe("no");
  });

  // ---------------------------------------------------------------
  // Scenario 2: in-memory retention after toggle back
  // ---------------------------------------------------------------

  it("retains typed value in memory when toggling field visibility back", async () => {
    mockFormData = {
      formId: "test-form-2",
      fields: makeServerFields(),
      encryptedFormMeta: null,
    };

    render(IntakePage);

    // Select "yes" on A, field B becomes visible
    const selectA = findSelectA();
    setSelectValue(selectA, "yes");

    // Type into B
    const inputB = findTextInput(FIELD_B_KEY);
    setInputValue(inputB, "remember me");

    // Hide B by switching A to "no"
    setSelectValue(selectA, "no");

    // B should not be in the DOM (hidden by conditional visibility)
    expect(document.getElementById(`intake-field-${FIELD_B_KEY}`)).toBeNull();

    // Show B again by switching A back to "yes"
    setSelectValue(selectA, "yes");

    // B should be visible again with its typed value intact
    const restoredB = findTextInput(FIELD_B_KEY);
    expect(restoredB).toBeTruthy();
    // The component passes fieldValues[field.fieldKey] as the value prop.
    // The in-memory value should still be "remember me".
    expect(restoredB.value).toBe("remember me");
  });

  // ---------------------------------------------------------------
  // Scenario 3: required hidden field does not block submission
  // ---------------------------------------------------------------

  it("does not block submission when a required field is hidden", async () => {
    mockFormData = {
      formId: "test-form-3",
      fields: makeServerFields({ bRequired: true }),
      encryptedFormMeta: null,
    };
    mockMutateAsync.mockResolvedValue({ reference: "test-ref-3" });

    render(IntakePage);

    // Select "no" on A so field B (required) is hidden
    const selectA = findSelectA();
    setSelectValue(selectA, "no");

    // Submit without filling B (it is hidden so validation should skip it)
    const submitBtn = screen.getByTestId("intake-submit");
    await fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(mockEncryptIntake).toHaveBeenCalled();
    });

    // Verify submission succeeded (encryptIntake was called, B not in answers)
    const answersArg = mockEncryptIntake.mock.calls
      .at(0)
      ?.at(1) as IntakeAnswer[];
    const answerKeys = answersArg.map((a) => a.fieldKey);

    expect(answerKeys).toContain(FIELD_A_KEY);
    expect(answerKeys).not.toContain(FIELD_B_KEY);

    // Verify success state rendered
    await vi.waitFor(() => {
      expect(screen.getByText("Your message was sent")).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------
  // Scenario 4: notEquals on field C, visible when A is unanswered
  // ---------------------------------------------------------------

  it("notEquals rule treats unanswered field as satisfying the condition", async () => {
    mockFormData = {
      formId: "test-form-4",
      fields: makeServerFields({ includeC: true }),
      encryptedFormMeta: null,
    };
    mockMutateAsync.mockResolvedValue({ reference: "test-ref-4" });

    render(IntakePage);

    // Field C uses notEquals "yes" on A. With A unanswered (undefined),
    // notEquals is satisfied, so C should be visible.
    const inputC = findTextInput(FIELD_C_KEY);
    expect(inputC).toBeTruthy();
    setInputValue(inputC, "negation value");

    // A is required, so we need to answer it. Select "no" (C stays visible
    // because notEquals "yes" is still true when A is "no").
    const selectA = findSelectA();
    setSelectValue(selectA, "no");

    // Submit
    const submitBtn = screen.getByTestId("intake-submit");
    await fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(mockEncryptIntake).toHaveBeenCalled();
    });

    const answersArg = mockEncryptIntake.mock.calls
      .at(0)
      ?.at(1) as IntakeAnswer[];
    const answerKeys = answersArg.map((a) => a.fieldKey);

    // Both A and C should be in the payload
    expect(answerKeys).toContain(FIELD_A_KEY);
    expect(answerKeys).toContain(FIELD_C_KEY);
    // B (equals "yes") should be hidden since A is "no"
    expect(answerKeys).not.toContain(FIELD_B_KEY);

    const answerC = answersArg.find((a) => a.fieldKey === FIELD_C_KEY);
    expect(answerC?.value).toBe("negation value");
  });

  // ---------------------------------------------------------------
  // Scenario 5: notEquals hides C when A is set to the matching value
  // ---------------------------------------------------------------

  it("notEquals hides field C when A equals the specified value", async () => {
    mockFormData = {
      formId: "test-form-5",
      fields: makeServerFields({ includeC: true }),
      encryptedFormMeta: null,
    };
    mockMutateAsync.mockResolvedValue({ reference: "test-ref-5" });

    render(IntakePage);

    // Select "yes" on A. Now notEquals "yes" is false, so C is hidden.
    const selectA = findSelectA();
    setSelectValue(selectA, "yes");

    // C should not be visible
    expect(document.getElementById(`intake-field-${FIELD_C_KEY}`)).toBeNull();

    // B should be visible (equals "yes" is true)
    const inputB = findTextInput(FIELD_B_KEY);
    setInputValue(inputB, "B value");

    // Submit
    const submitBtn = screen.getByTestId("intake-submit");
    await fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(mockEncryptIntake).toHaveBeenCalled();
    });

    const answersArg = mockEncryptIntake.mock.calls
      .at(0)
      ?.at(1) as IntakeAnswer[];
    const answerKeys = answersArg.map((a) => a.fieldKey);

    expect(answerKeys).toContain(FIELD_A_KEY);
    expect(answerKeys).toContain(FIELD_B_KEY);
    expect(answerKeys).not.toContain(FIELD_C_KEY);
  });
});
