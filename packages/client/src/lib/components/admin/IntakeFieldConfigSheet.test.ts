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
  intake_forms_config_help_text: () => "Help text",
  intake_forms_config_help_text_placeholder: () => "Help text placeholder",
  intake_forms_config_help_text_hint: () => "Shown below the field.",
  intake_forms_config_condition_heading: () => "Visibility condition",
  intake_forms_config_condition_hint: () =>
    "When set, this field only appears if conditions are met.",
  intake_forms_config_condition_mode_all: () => "All conditions must match",
  intake_forms_config_condition_mode_any: () => "Any condition matches",
  intake_forms_config_condition_add_and: () => "Add AND condition",
  intake_forms_config_condition_add_or: () => "Add OR condition",
  intake_forms_config_condition_add_rule: () => "Add condition",
  intake_forms_config_condition_remove_rule: () => "Remove condition",
  intake_forms_config_condition_or_separator: () => "or",
  intake_forms_config_condition_field_label: () => "When field",
  intake_forms_config_condition_operator_label: () => "is",
  intake_forms_config_condition_value_label: () => "value",
  intake_forms_config_condition_op_equals: () => "equals",
  intake_forms_config_condition_op_not_equals: () => "does not equal",
  intake_forms_config_condition_op_includes: () => "includes",
  intake_forms_config_condition_op_not_includes: () => "does not include",
  intake_forms_config_condition_op_checked: () => "is checked",
  intake_forms_config_condition_op_unchecked: () => "is unchecked",
  intake_forms_config_condition_op_is_empty: () => "is empty",
  intake_forms_config_condition_op_is_not_empty: () => "is not empty",
  intake_forms_config_condition_no_fields: () => "No earlier fields available.",
  intake_forms_page_break_title_label: () => "Page title (optional)",
  intake_forms_page_break_title_placeholder: () => "e.g. Contact information",
  intake_forms_config_subtype: () => "Input type",
  intake_forms_config_subtype_none: () => "Plain text",
  intake_forms_config_subtype_email: () => "Email address",
  intake_forms_config_subtype_phone: () => "Phone number",
  intake_forms_config_subtype_number: () => "Number",
  intake_forms_config_number_min: () => "Minimum value",
  intake_forms_config_number_max: () => "Maximum value",
  intake_forms_config_field_type_label: () => "Field type",
  intake_forms_config_role_hint: () =>
    "Controls how the system treats the answer.",
  intake_forms_field_type_text: () => "Text",
  intake_forms_field_type_textarea: () => "Text area",
  intake_forms_field_type_select: () => "Dropdown",
  intake_forms_field_type_multiselect: () => "Checkboxes",
  intake_forms_field_type_checkbox: () => "Checkbox",
  intake_forms_field_type_availability: () => "Availability",
  intake_forms_field_type_date: () => "Date",
  intake_forms_field_type_page_break: () => "Page break",
  intake_forms_field_type_rich_text: () => "Text block",
  intake_forms_field_type_rich_text_desc: () =>
    "Static formatted content between fields",
}));

vi.mock("$lib/terminology/with-terms.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  withTerms: () => ({}),
}));

// FormContentEditor has deep ProseMirror/crypto dependencies; stub it out.
vi.mock("./FormContentEditor.svelte", async (importOriginal) => {
  const { default: Passthrough } =
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte");
  return {
    ...(await importOriginal<Record<string, unknown>>()),
    default: Passthrough,
  };
});

// getOrgKeyManager requires Svelte context; stub with a minimal shape.
vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getOrgKeyManager: () => ({
    getPublicKey: (): null => null,
  }),
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
  fieldType: "select";
  label: { en: string };
  helpText: Record<string, never>;
  isRequired: boolean;
  config: {
    type: "select";
    options: { key: string; label: { en: string } }[];
  };
  role: null;
  escalationRecipientIds: null;
  visibleWhen: undefined;
} {
  return {
    fieldType: "select" as const,
    label: { en: "Test question" },
    helpText: {},
    isRequired: false,
    config: {
      type: "select" as const,
      options: [
        { key: "opt-a", label: { en: "Opt A" } },
        { key: "opt-b", label: { en: "Opt B" } },
      ],
    },
    role: null,
    escalationRecipientIds: null,
    visibleWhen: undefined,
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

  it("shows field type selector at the top of the sheet (F-004)", () => {
    render(IntakeFieldConfigSheet, {
      props: {
        opened: true,
        fieldType: "text",
        initial: {
          ...baseInitial(),
          fieldType: "text" as const,
          config: { type: "text" as const },
        },
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        editingLocale: "en",
        earlierFields: [],
        ondone,
        ondismiss: vi.fn(),
      },
    });
    expect(screen.getByText("Field type")).toBeTruthy();
  });

  it("shows role picker for select field type", () => {
    render(IntakeFieldConfigSheet, {
      props: {
        opened: true,
        fieldType: "select",
        initial: baseInitial(),
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        editingLocale: "en",
        earlierFields: [],
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
          fieldType: "text" as const,
          config: { type: "text" as const },
        },
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        editingLocale: "en",
        earlierFields: [],
        ondone,
        ondismiss: vi.fn(),
      },
    });
    // Text fields should show browser-side roles (phone-contact, email-contact,
    // real-name, etc.) but NOT server-metadata roles like queue-routing
    // The field type picker renders first, so find the role select by content.
    const selects = document.querySelectorAll("select");
    let roleSelect: HTMLSelectElement | null = null;
    for (const sel of selects) {
      const optTexts = Array.from(sel.querySelectorAll("option")).map(
        (o) => o.textContent,
      );
      if (optTexts.includes("Phone contact")) {
        roleSelect = sel;
        break;
      }
    }
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
        editingLocale: "en",
        earlierFields: [],
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
          fieldType: "checkbox" as const,
          config: { type: "checkbox" as const },
        },
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        editingLocale: "en",
        earlierFields: [],
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
          fieldType: "availability" as const,
          config: {
            type: "availability" as const,
            allowRecurring: true,
            allowSpecific: true,
          },
        },
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        editingLocale: "en",
        earlierFields: [],
        ondone,
        ondismiss: vi.fn(),
      },
    });
    expect(screen.queryByText("Field role")).toBeNull();
  });

  it("emits role and config on done with LocalizedText label", async () => {
    render(IntakeFieldConfigSheet, {
      props: {
        opened: true,
        fieldType: "select",
        initial: baseInitial(),
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        editingLocale: "en",
        earlierFields: [],
        ondone,
        ondismiss: vi.fn(),
      },
    });

    // Click Done
    const doneBtn = screen.getByText("Done");
    await fireEvent.click(doneBtn);

    expect(capturedResult).not.toBeNull();
    expect(capturedResult).toHaveProperty("fieldType", "select");
    expect(capturedResult).toHaveProperty("role", null);
    expect(capturedResult).toHaveProperty("routingQueueIds", null);
    expect(capturedResult).toHaveProperty("escalationRecipientIds", null);
    // Label should be a LocalizedText object
    expect(capturedResult?.label).toEqual({ en: "Test question" });
  });

  it("blocks done and shows an error when the base-locale label is empty", async () => {
    render(IntakeFieldConfigSheet, {
      props: {
        opened: true,
        fieldType: "select",
        initial: { ...baseInitial(), label: {} },
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        editingLocale: "en",
        earlierFields: [],
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
          config: {
            type: "select" as const,
            options: [{ key: "empty", label: { en: "" } }],
          },
        },
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        editingLocale: "en",
        earlierFields: [],
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
        editingLocale: "en",
        earlierFields: [],
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
        editingLocale: "en",
        earlierFields: [],
        ondone,
        ondismiss: vi.fn(),
      },
    });
    // The urgency mapping title should be visible since urgency is selected
    expect(screen.getByText("Priority mapping")).toBeTruthy();
  });

  it("renders locale switcher within the config sheet", () => {
    render(IntakeFieldConfigSheet, {
      props: {
        opened: true,
        fieldType: "text",
        initial: {
          ...baseInitial(),
          fieldType: "text" as const,
          config: { type: "text" as const },
        },
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        editingLocale: "en",
        earlierFields: [],
        ondone,
        ondismiss: vi.fn(),
      },
    });
    // Should have EN and ES buttons for locale switching
    expect(screen.getAllByText("EN").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("ES").length).toBeGreaterThanOrEqual(1);
  });

  it("shows FormContentEditor (stubbed) for richText type", () => {
    const richTextDone = vi.fn();
    render(IntakeFieldConfigSheet, {
      props: {
        opened: true,
        fieldType: "richText",
        initial: {
          fieldType: "richText" as const,
          label: {},
          helpText: {},
          isRequired: false,
          config: { type: "richText" as const, body: {} },
          role: null,
          escalationRecipientIds: null,
          visibleWhen: undefined,
        },
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        editingLocale: "en",
        earlierFields: [],
        ondone: richTextDone,
        ondismiss: vi.fn(),
      },
    });
    // The FormContentEditor is stubbed as PassthroughShell
    const stub = document.querySelector("[data-testid='passthrough-shell']");
    expect(stub).not.toBeNull();
    // No label, required, or role inputs should be visible for richText
    expect(screen.queryByText("Question text")).toBeNull();
    expect(screen.queryByText("Required")).toBeNull();
  });

  it("submits richText config with empty label, isRequired false, role null", async () => {
    const richTextDone = vi.fn();
    render(IntakeFieldConfigSheet, {
      props: {
        opened: true,
        fieldType: "richText",
        initial: {
          fieldType: "richText" as const,
          label: {},
          helpText: {},
          isRequired: false,
          config: { type: "richText" as const, body: {} },
          role: null,
          escalationRecipientIds: null,
          visibleWhen: undefined,
        },
        queues: TEST_QUEUES,
        volunteers: TEST_VOLUNTEERS,
        editingLocale: "en",
        earlierFields: [],
        ondone: richTextDone,
        ondismiss: vi.fn(),
      },
    });
    const doneBtn = screen.getByText("Done");
    await fireEvent.click(doneBtn);
    expect(richTextDone).toHaveBeenCalledTimes(1);
    const result = richTextDone.mock.lastCall?.[0] as FieldConfigState;
    expect(result.fieldType).toBe("richText");
    expect(result.label).toEqual({});
    expect(result.isRequired).toBe(false);
    expect(result.role).toBeNull();
    expect(result.config.type).toBe("richText");
  });

  describe("conditional visibility v2", () => {
    const selectEarlier = [
      {
        fieldKey: "sel-1",
        label: "Dropdown",
        fieldType: "select" as const,
        options: [
          { key: "a", label: "Alpha" },
          { key: "b", label: "Beta" },
        ],
      },
    ];

    it("restores v2 visibleWhen into grouped state and emits v2 on done", async () => {
      render(IntakeFieldConfigSheet, {
        props: {
          opened: true,
          fieldType: "text",
          initial: {
            fieldType: "text" as const,
            label: { en: "Name" },
            helpText: {},
            isRequired: false,
            config: { type: "text" as const },
            role: null,
            escalationRecipientIds: null,
            visibleWhen: {
              version: 2 as const,
              groups: [
                [
                  {
                    fieldKey: "sel-1",
                    operator: "equals" as const,
                    optionKey: "a",
                  },
                ],
              ],
            },
          },
          queues: TEST_QUEUES,
          volunteers: TEST_VOLUNTEERS,
          editingLocale: "en",
          earlierFields: selectEarlier,
          ondone,
          ondismiss: vi.fn(),
        },
      });

      // The condition toggle should be on (condition restored)
      const doneBtn = screen.getByText("Done");
      await fireEvent.click(doneBtn);

      expect(capturedResult).not.toBeNull();
      const vw = capturedResult?.visibleWhen;
      expect(vw).toBeDefined();
      // Must emit v2 shape (has version and groups, never mode/rules)
      expect(vw).toHaveProperty("version", 2);
      expect(vw).toHaveProperty("groups");
      expect(vw).not.toHaveProperty("mode");
      expect(vw).not.toHaveProperty("rules");
    });

    it("normalizes v1 all-mode into a single v2 group on restore", async () => {
      render(IntakeFieldConfigSheet, {
        props: {
          opened: true,
          fieldType: "text",
          initial: {
            fieldType: "text" as const,
            label: { en: "Name" },
            helpText: {},
            isRequired: false,
            config: { type: "text" as const },
            role: null,
            escalationRecipientIds: null,
            visibleWhen: {
              mode: "all" as const,
              rules: [
                {
                  fieldKey: "sel-1",
                  operator: "equals" as const,
                  optionKey: "a",
                },
                {
                  fieldKey: "sel-1",
                  operator: "equals" as const,
                  optionKey: "b",
                },
              ],
            },
          },
          queues: TEST_QUEUES,
          volunteers: TEST_VOLUNTEERS,
          editingLocale: "en",
          earlierFields: selectEarlier,
          ondone,
          ondismiss: vi.fn(),
        },
      });

      await fireEvent.click(screen.getByText("Done"));

      expect(capturedResult).not.toBeNull();
      const vw = capturedResult?.visibleWhen;
      expect(vw).toHaveProperty("version", 2);
      // v1 all-mode: all rules in one group
      if (vw != null && "groups" in vw) {
        expect(vw.groups).toHaveLength(1);
        expect(vw.groups[0]).toHaveLength(2);
      }
    });

    it("normalizes v1 any-mode into one group per rule on restore", async () => {
      render(IntakeFieldConfigSheet, {
        props: {
          opened: true,
          fieldType: "text",
          initial: {
            fieldType: "text" as const,
            label: { en: "Name" },
            helpText: {},
            isRequired: false,
            config: { type: "text" as const },
            role: null,
            escalationRecipientIds: null,
            visibleWhen: {
              mode: "any" as const,
              rules: [
                {
                  fieldKey: "sel-1",
                  operator: "equals" as const,
                  optionKey: "a",
                },
                {
                  fieldKey: "sel-1",
                  operator: "equals" as const,
                  optionKey: "b",
                },
              ],
            },
          },
          queues: TEST_QUEUES,
          volunteers: TEST_VOLUNTEERS,
          editingLocale: "en",
          earlierFields: selectEarlier,
          ondone,
          ondismiss: vi.fn(),
        },
      });

      await fireEvent.click(screen.getByText("Done"));

      expect(capturedResult).not.toBeNull();
      const vw = capturedResult?.visibleWhen;
      expect(vw).toHaveProperty("version", 2);
      // v1 any-mode: each rule becomes its own group
      if (vw != null && "groups" in vw) {
        expect(vw.groups).toHaveLength(2);
        expect(vw.groups[0]).toHaveLength(1);
        expect(vw.groups[1]).toHaveLength(1);
      }
    });

    it("emits undefined visibleWhen when condition is not enabled", async () => {
      render(IntakeFieldConfigSheet, {
        props: {
          opened: true,
          fieldType: "select",
          initial: baseInitial(),
          queues: TEST_QUEUES,
          volunteers: TEST_VOLUNTEERS,
          editingLocale: "en",
          earlierFields: selectEarlier,
          ondone,
          ondismiss: vi.fn(),
        },
      });

      await fireEvent.click(screen.getByText("Done"));

      expect(capturedResult).not.toBeNull();
      expect(capturedResult?.visibleWhen).toBeUndefined();
    });

    it("shows AND and OR buttons when conditions are enabled", async () => {
      render(IntakeFieldConfigSheet, {
        props: {
          opened: true,
          fieldType: "text",
          initial: {
            fieldType: "text" as const,
            label: { en: "Name" },
            helpText: {},
            isRequired: false,
            config: { type: "text" as const },
            role: null,
            escalationRecipientIds: null,
            visibleWhen: {
              version: 2 as const,
              groups: [
                [
                  {
                    fieldKey: "sel-1",
                    operator: "equals" as const,
                    optionKey: "a",
                  },
                ],
              ],
            },
          },
          queues: TEST_QUEUES,
          volunteers: TEST_VOLUNTEERS,
          editingLocale: "en",
          earlierFields: selectEarlier,
          ondone,
          ondismiss: vi.fn(),
        },
      });

      expect(screen.getByText("Add AND condition")).toBeTruthy();
      expect(screen.getByText("Add OR condition")).toBeTruthy();
    });
  });
});
