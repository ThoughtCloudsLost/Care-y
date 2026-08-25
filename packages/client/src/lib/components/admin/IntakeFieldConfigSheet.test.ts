// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type { FieldConfigState } from "./intake-field-config-types.js";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  intake_forms_config_title: () => "Configure field",
  intake_forms_config_label: () => "Question text",
  intake_forms_config_required: () => "Required",
  intake_forms_config_done: () => "Done",
  intake_forms_config_placeholder: () => "Placeholder",
  intake_forms_config_max_length: () => "Max length",
  intake_forms_config_options: () => "Option",
  intake_forms_config_add_option: () => "Add option",
  intake_forms_config_remove_option: () => "Remove",
  intake_forms_config_allow_recurring: () => "Weekly times",
  intake_forms_config_allow_specific: () => "Specific dates",
  intake_forms_config_at_least_one: () => "At least one required.",
  intake_forms_config_required_true: () => "Must be checked",
  intake_forms_config_label_required: () => "Enter the question text",
  intake_forms_config_options_required: () => "Add at least one option",
  intake_forms_config_role_label: () => "Field role",
  intake_forms_config_role_none: () => "None",
  intake_forms_config_role_queue_routing: () => "Queue routing",
  intake_forms_config_role_urgency: () => "Urgency",
  intake_forms_config_role_escalation: () => "Escalation",
  intake_forms_config_role_phone_contact: () => "Phone contact",
  intake_forms_config_role_email_contact: () => "Email contact",
  intake_forms_config_role_real_name: () => "Real name",
  intake_forms_config_role_pronouns: () => "Pronouns",
  intake_forms_config_role_contact_safety: () => "Contact safety",
  intake_forms_config_role_consent: () => "Consent",
  intake_forms_config_role_language_preference: () => "Language preference",
  intake_forms_config_queue_mapping_title: () => "Queue routing mapping",
  intake_forms_config_queue_mapping_hint: () => "Choose a queue for each.",
  intake_forms_config_queue_default: () => "Default",
  intake_forms_config_urgency_mapping_title: () => "Priority mapping",
  intake_forms_config_urgency_mapping_hint: () => "Choose priority for each.",
  intake_forms_config_escalation_mapping_title: () => "Escalation mapping",
  intake_forms_config_escalation_mapping_hint: () => "Set alert for each.",
  intake_forms_config_escalation_alert_label: () => "Alert level",
  intake_forms_config_escalation_recipients_title: () =>
    "Escalation recipients",
  intake_forms_config_escalation_recipients_hint: () =>
    "Choose volunteers to notify.",
  intake_forms_config_escalation_checkbox_hint: () =>
    "Triggers escalation when checked.",
  intake_forms_config_priority_low: () => "Low",
  intake_forms_config_priority_normal: () => "Normal",
  intake_forms_config_priority_high: () => "High",
  intake_forms_config_priority_urgent: () => "Urgent",
  intake_forms_config_priority_default: () => "Default (normal)",
}));

vi.mock("$lib/terminology/with-terms.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  withTerms: () => ({}),
}));

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

const { default: IntakeFieldConfigSheet } =
  await import("./IntakeFieldConfigSheet.svelte");

afterEach(cleanup);

const TEST_QUEUES = [
  { id: "q-1", name: "General" },
  { id: "q-2", name: "Legal" },
];

const TEST_VOLUNTEERS = [
  { id: "v-1", name: "Alice" },
  { id: "v-2", name: "Bob" },
];

function baseInitial(): {
  label: string;
  isRequired: boolean;
  config: { type: "select"; options: string[] };
  role: null;
  escalationRecipientIds: null;
} {
  return {
    label: "Test question",
    isRequired: false,
    config: { type: "select" as const, options: ["Opt A", "Opt B"] },
    role: null,
    escalationRecipientIds: null,
  };
}

describe("IntakeFieldConfigSheet", () => {
  let capturedResult: FieldConfigState | null;
  let ondone: (result: FieldConfigState) => void;

  beforeEach(() => {
    capturedResult = null;
    ondone = (result: FieldConfigState): void => {
      capturedResult = result;
    };
  });

  it("shows role picker for select field type", () => {
    render(IntakeFieldConfigSheet, {
      props: {
        opened: true,
        fieldType: "select",
        initial: baseInitial(),
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        ondone,
        ondismiss: vi.fn(),
      },
    });
    expect(screen.getByText("Field role")).toBeTruthy();
  });

  it("shows only widget-compatible roles for text fields", () => {
    render(IntakeFieldConfigSheet, {
      props: {
        opened: true,
        fieldType: "text",
        initial: {
          ...baseInitial(),
          config: { type: "text" as const },
        },
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        ondone,
        ondismiss: vi.fn(),
      },
    });
    // Text fields should show browser-side roles (phone-contact, email-contact,
    // real-name, etc.) but NOT server-metadata roles like queue-routing
    const roleSelect = document.querySelector("select");
    expect(roleSelect).not.toBeNull();
    const optionTexts = Array.from(roleSelect!.querySelectorAll("option")).map(
      (o) => o.textContent,
    );
    expect(optionTexts).toContain("Phone contact");
    expect(optionTexts).toContain("Email contact");
    expect(optionTexts).toContain("Real name");
    expect(optionTexts).not.toContain("Queue routing");
    expect(optionTexts).not.toContain("Urgency");
  });

  it("shows queue-routing and urgency roles for select fields", () => {
    render(IntakeFieldConfigSheet, {
      props: {
        opened: true,
        fieldType: "select",
        initial: baseInitial(),
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        ondone,
        ondismiss: vi.fn(),
      },
    });
    // Find the role picker select (it should be the last select because the
    // first one is the field type config select for options). Look for the
    // one containing "Queue routing".
    const selects = document.querySelectorAll("select");
    let roleSelect: HTMLSelectElement | null = null;
    for (const sel of selects) {
      const optTexts = Array.from(sel.querySelectorAll("option")).map(
        (o) => o.textContent,
      );
      if (optTexts.includes("Queue routing")) {
        roleSelect = sel;
        break;
      }
    }
    expect(roleSelect).not.toBeNull();
    const optionTexts = Array.from(roleSelect!.querySelectorAll("option")).map(
      (o) => o.textContent,
    );
    expect(optionTexts).toContain("Queue routing");
    expect(optionTexts).toContain("Urgency");
    expect(optionTexts).toContain("Escalation");
  });

  it("shows escalation role for checkbox fields", () => {
    render(IntakeFieldConfigSheet, {
      props: {
        opened: true,
        fieldType: "checkbox",
        initial: {
          ...baseInitial(),
          config: { type: "checkbox" as const },
        },
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        ondone,
        ondismiss: vi.fn(),
      },
    });
    const selects = document.querySelectorAll("select");
    let roleSelect: HTMLSelectElement | null = null;
    for (const sel of selects) {
      const optTexts = Array.from(sel.querySelectorAll("option")).map(
        (o) => o.textContent,
      );
      if (optTexts.includes("Escalation")) {
        roleSelect = sel;
        break;
      }
    }
    expect(roleSelect).not.toBeNull();
    // Checkbox should only show escalation and consent
    const optionTexts = Array.from(roleSelect!.querySelectorAll("option")).map(
      (o) => o.textContent,
    );
    expect(optionTexts).toContain("Escalation");
    expect(optionTexts).toContain("Consent");
    expect(optionTexts).not.toContain("Queue routing");
    expect(optionTexts).not.toContain("Urgency");
  });

  it("hides role picker for availability fields (no compatible roles)", () => {
    render(IntakeFieldConfigSheet, {
      props: {
        opened: true,
        fieldType: "availability",
        initial: {
          ...baseInitial(),
          config: {
            type: "availability" as const,
            allowRecurring: true,
            allowSpecific: true,
          },
        },
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        ondone,
        ondismiss: vi.fn(),
      },
    });
    expect(screen.queryByText("Field role")).toBeNull();
  });

  it("emits role and config on done", async () => {
    render(IntakeFieldConfigSheet, {
      props: {
        opened: true,
        fieldType: "select",
        initial: baseInitial(),
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        ondone,
        ondismiss: vi.fn(),
      },
    });

    // Click Done
    const doneBtn = screen.getByText("Done");
    await fireEvent.click(doneBtn);

    expect(capturedResult).not.toBeNull();
    expect(capturedResult).toHaveProperty("role", null);
    expect(capturedResult).toHaveProperty("routingQueueIds", null);
    expect(capturedResult).toHaveProperty("escalationRecipientIds", null);
  });

  it("blocks done and shows an error when the question text is empty", async () => {
    render(IntakeFieldConfigSheet, {
      props: {
        opened: true,
        fieldType: "select",
        initial: { ...baseInitial(), label: "" },
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        ondone,
        ondismiss: vi.fn(),
      },
    });

    await fireEvent.click(screen.getByText("Done"));

    expect(capturedResult).toBeNull();
    expect(screen.getByText("Enter the question text")).toBeTruthy();
  });

  it("blocks done when a choice field has no non-empty options", async () => {
    render(IntakeFieldConfigSheet, {
      props: {
        opened: true,
        fieldType: "select",
        initial: {
          ...baseInitial(),
          config: { type: "select" as const, options: [""] },
        },
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        ondone,
        ondismiss: vi.fn(),
      },
    });

    await fireEvent.click(screen.getByText("Done"));

    expect(capturedResult).toBeNull();
    expect(screen.getByText("Add at least one option")).toBeTruthy();
  });

  it("calls ondismiss from the cancel button", async () => {
    const ondismiss = vi.fn();
    render(IntakeFieldConfigSheet, {
      props: {
        opened: true,
        fieldType: "select",
        initial: baseInitial(),
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        ondone,
        ondismiss,
      },
    });

    await fireEvent.click(screen.getByText("Cancel"));

    expect(ondismiss).toHaveBeenCalledOnce();
    expect(capturedResult).toBeNull();
  });

  it("restores initial role when sheet opens with existing role data", () => {
    render(IntakeFieldConfigSheet, {
      props: {
        opened: true,
        fieldType: "select",
        initial: {
          ...baseInitial(),
          role: "urgency" as const,
        },
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        ondone,
        ondismiss: vi.fn(),
      },
    });
    // The urgency mapping title should be visible since urgency is selected
    expect(screen.getByText("Priority mapping")).toBeTruthy();
  });
});
