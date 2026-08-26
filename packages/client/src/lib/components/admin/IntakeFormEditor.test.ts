// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const {
  mockSaveForm,
  mockBindQueue,
  mockDeleteForm,
  mockToastShow,
  mockEncryptFieldContent,
} = vi.hoisted(() => ({
  mockSaveForm: vi.fn().mockResolvedValue({ formId: "new-form-id" }),
  mockBindQueue: vi.fn().mockResolvedValue({ ok: true }),
  mockDeleteForm: vi.fn().mockResolvedValue({ deleted: true }),
  mockToastShow: vi.fn(),
  mockEncryptFieldContent: vi.fn().mockReturnValue({
    encryptedLabel: "enc-label",
    encryptedConfig: "enc-config",
  }),
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  intake_forms_name_label: () => "Form name",
  intake_forms_name_placeholder: () => "e.g. Main Intake",
  intake_forms_fields_heading: ({ count }: { count: string }) =>
    `Fields (${count})`,
  intake_forms_add_field: () => "Add field",
  intake_forms_move_up: () => "Move up",
  intake_forms_move_down: () => "Move down",
  intake_forms_configure: () => "Configure",
  intake_forms_field_required: () => "required",
  intake_forms_field_optional: () => "optional",
  intake_forms_save: () => "Save form",
  intake_forms_saved: () => "Form saved",
  intake_forms_used_by: () => "Used by",
  intake_forms_bind: () => "Bind",
  intake_forms_unbind: () => "Unbind",
  intake_forms_preview: () => "Preview",
  intake_forms_field_type_text: () => "Text",
  intake_forms_field_type_text_desc: () => "Single-line answer",
  intake_forms_field_type_textarea: () => "Text area",
  intake_forms_field_type_textarea_desc: () => "Multi-line answer",
  intake_forms_field_type_select: () => "Dropdown",
  intake_forms_field_type_select_desc: () => "Choose one option",
  intake_forms_field_type_multiselect: () => "Checkboxes",
  intake_forms_field_type_multiselect_desc: () => "Choose one or more options",
  intake_forms_field_type_availability: () => "Availability",
  intake_forms_field_type_availability_desc: () => "Time window picker",
  intake_forms_one_availability: () => "One availability field per form.",
  intake_forms_config_title: () => "Configure field",
  intake_forms_config_label: () => "Question text",
  intake_forms_config_required: () => "Required",
  intake_forms_config_done: () => "Done",
  common_loading: () => "Loading",
  common_cancel: () => "Cancel",
  common_delete: () => "Delete",
  error_generic: () => "Something went wrong",
  error_form_has_responses: () =>
    "This form has been used for intake submissions.",
  intake_forms_delete: () => "Delete form",
  intake_forms_delete_title: () => "Delete form",
  intake_forms_delete_confirm: () => "This will permanently delete this form.",
  intake_forms_deleted: () => "Form deleted",
  intake_char_count: ({ count, max }: { count: number; max: number }) =>
    `${String(count)}/${String(max)}`,
  intake_forms_slug_label: () => "Slug",
  intake_forms_slug_placeholder: () => "form-slug",
  intake_forms_slug_hint: () => "URL-safe slug",
  intake_forms_slug_error_length: () => "Slug must be 2 to 80 characters.",
  intake_forms_slug_error_format: () =>
    "Lowercase letters, digits, and single hyphens only.",
  intake_forms_destination_label: () => "Destination queue",
  intake_forms_destination_none: () => "Default",
  intake_forms_default_toggle: () => "Default form",
  intake_forms_default_hint: () => "Shown at /intake",
  intake_forms_share_link: () => "Share link",
  intake_forms_link_copied: () => "Copied",
  intake_forms_remove_field: () => "Remove",
  intake_forms_field_type_checkbox: () => "Checkbox",
  intake_forms_field_type_checkbox_desc: () => "Yes/no toggle",
  intake_forms_edit_title: () => "Edit form",
  intake_forms_create_title: () => "Create form",
  intake_forms_locale_heading: () => "Authoring language",
  intake_forms_locale_optional_hint: () => "Translations are optional.",
  intake_forms_content_heading: () => "Form content",
  intake_forms_description_label: () => "Description",
  intake_forms_description_placeholder: () => "Shown above the form.",
  intake_forms_description_hint: () => "Plain text.",
  intake_forms_submit_message_label: () => "Success message",
  intake_forms_submit_message_placeholder: () => "Shown after submit.",
  intake_forms_submit_message_hint: () => "Replaces default.",
  intake_forms_closed_message_label: () => "Closed message",
  intake_forms_closed_message_placeholder: () => "Shown when closed.",
  intake_forms_closed_message_hint: () => "When closing date has passed.",
}));

vi.mock("$lib/terminology/with-terms.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  withTerms: () => ({}),
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  trpc: {
    intakeForms: {
      save: { mutate: mockSaveForm },
      bindQueue: { mutate: mockBindQueue },
      remove: { mutate: mockDeleteForm },
    },
    tickets: {
      listQueues: { query: vi.fn().mockResolvedValue([]) },
      listVolunteers: { query: vi.fn().mockResolvedValue([]) },
    },
  },
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  requireRouter: (router: unknown) => router,
}));

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getOrgKeyManager: () => ({
    getPublicKey: () => new Uint8Array(32),
    isLoaded: true,
  }),
  getOrgDecryptCache: () => ({
    decrypt: (_key: string, _value: string) => "Decrypted Queue",
  }),
}));

vi.mock("$lib/portal/intake-form-crypto.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  encryptFieldContent: mockEncryptFieldContent,
  encryptFormMeta: vi.fn().mockReturnValue("enc-form-meta"),
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  haptic: vi.fn(),
}));

vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  toastStore: { show: mockToastShow },
}));

vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  announceToLiveRegion: vi.fn(),
}));

vi.mock("$lib/components/shared/konsta-classes.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  DIALOG_DESTRUCTIVE_CLASS: "destructive-class",
}));

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  createQuery: () => ({
    isLoading: false,
    isError: false,
    data: [],
    error: null,
  }),
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as (() => void) | undefined;
    const onError = opts.onError as ((err: unknown) => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      mutate(input: unknown) {
        mutationFn(input).then(
          () => onSuccess?.(),
          (err: unknown) => onError?.(err),
        );
      },
    };
  },
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

import IntakeFormEditor from "./IntakeFormEditor.svelte";

/** Minimal field defaults for the new role fields. */
const NO_ROLE = {
  role: null as null,
  routingQueueIds: null as null,
  escalationRecipientIds: null as null,
} as const;

describe("IntakeFormEditor", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const baseProps = {
    formId: null,
    initialName: "",
    initialSlug: null as string | null,
    initialIsDefault: false,
    initialDestinationQueueId: null as string | null,
    initialFormMeta: {},
    initialFields: [],
    onback: vi.fn(),
    ondeleted: vi.fn(),
  };

  it("renders form name input", () => {
    render(IntakeFormEditor, { props: baseProps });

    expect(screen.getByText("Form name")).toBeTruthy();
  });

  it("renders fields heading with count", () => {
    render(IntakeFormEditor, { props: baseProps });

    expect(screen.getByText("Fields (0)")).toBeTruthy();
  });

  it("renders add field button", () => {
    render(IntakeFormEditor, { props: baseProps });

    expect(screen.getByText("Add field")).toBeTruthy();
  });

  it("renders initial fields in the field list", () => {
    render(IntakeFormEditor, {
      props: {
        ...baseProps,
        initialFields: [
          {
            fieldKey: "fk-1",
            label: { en: "Your name" },
            helpText: {},
            isRequired: false,
            config: { type: "text" as const },
            fieldType: "text" as const,
            ...NO_ROLE,
          },
          {
            fieldKey: "fk-2",
            label: { en: "Message" },
            helpText: {},
            isRequired: true,
            config: { type: "textarea" as const },
            fieldType: "textarea" as const,
            ...NO_ROLE,
          },
        ],
      },
    });

    expect(screen.getByText("Fields (2)")).toBeTruthy();
    // The field label appears in both the field list ("1. Your name") and the
    // preview section (IntakeFieldRenderer renders a BlockTitle + sr-only label).
    // Use getAllByText to match all occurrences and verify at least one exists.
    expect(screen.getAllByText(/Your name/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Message/).length).toBeGreaterThanOrEqual(1);
  });

  it("shows save button", () => {
    render(IntakeFormEditor, { props: baseProps });

    expect(screen.getByText("Save form")).toBeTruthy();
  });

  it("disables save when name is empty and fields are empty", () => {
    render(IntakeFormEditor, { props: baseProps });

    const saveButton = screen.getByText("Save form").closest("button");
    expect(saveButton?.disabled).toBe(true);
  });

  it("calls encryptFieldContent on save with LocalizedText label", async () => {
    render(IntakeFormEditor, {
      props: {
        ...baseProps,
        initialName: "Test Form",
        initialFields: [
          {
            fieldKey: "fk-save",
            label: { en: "Name" },
            helpText: {},
            isRequired: false,
            config: { type: "text" as const },
            fieldType: "text" as const,
            ...NO_ROLE,
          },
        ],
      },
    });

    const saveButton = screen.getByText("Save form").closest("button");
    if (saveButton) {
      await fireEvent.click(saveButton);
    }

    expect(mockEncryptFieldContent).toHaveBeenCalledWith(
      { label: { en: "Name" }, config: { type: "text" } },
      expect.any(Uint8Array),
    );
  });

  it("pre-populates fields from an existing form", () => {
    render(IntakeFormEditor, {
      props: {
        ...baseProps,
        formId: "existing-form-id",
        initialName: "Main Intake",
        initialFields: [
          {
            fieldKey: "fk-pop-1",
            label: { en: "Full name" },
            helpText: {},
            isRequired: true,
            config: { type: "text" as const },
            fieldType: "text" as const,
            ...NO_ROLE,
          },
          {
            fieldKey: "fk-pop-2",
            label: { en: "Your situation" },
            helpText: {},
            isRequired: true,
            config: { type: "textarea" as const, maxLength: 5000 },
            fieldType: "textarea" as const,
            ...NO_ROLE,
          },
          {
            fieldKey: "fk-pop-3",
            label: { en: "Services needed" },
            helpText: {},
            isRequired: false,
            config: {
              type: "multiselect" as const,
              options: [
                { key: "housing", label: { en: "Housing" } },
                { key: "legal", label: { en: "Legal" } },
              ],
            },
            fieldType: "multiselect" as const,
            ...NO_ROLE,
          },
        ],
        initialSlug: "main-intake",
        initialIsDefault: true,
        initialDestinationQueueId: "queue-1",
      },
    });

    expect(screen.getByText("Fields (3)")).toBeTruthy();
    // Use getAllByText: labels appear in the field list and the preview section
    expect(screen.getAllByText(/Full name/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Your situation/).length).toBeGreaterThanOrEqual(
      1,
    );
    expect(
      screen.getAllByText(/Services needed/).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("shows delete button for existing forms", () => {
    render(IntakeFormEditor, {
      props: {
        ...baseProps,
        formId: "existing-form-id",
        initialName: "Main Intake",
        initialFields: [
          {
            fieldKey: "fk-del",
            label: { en: "Name" },
            helpText: {},
            isRequired: false,
            config: { type: "text" as const },
            fieldType: "text" as const,
            ...NO_ROLE,
          },
        ],
      },
    });

    expect(screen.getByText("Delete form")).toBeTruthy();
  });

  it("does not show delete button for new forms", () => {
    render(IntakeFormEditor, { props: baseProps });

    expect(screen.queryByText("Delete form")).toBeNull();
  });

  it("renders locale authoring segmented control", () => {
    render(IntakeFormEditor, { props: baseProps });

    expect(screen.getByText("Authoring language")).toBeTruthy();
    expect(screen.getByText("EN")).toBeTruthy();
    expect(screen.getByText("ES")).toBeTruthy();
  });

  it("notifies parent of dirty state on name change", async () => {
    const ondirtychange = vi.fn();
    render(IntakeFormEditor, {
      props: { ...baseProps, ondirtychange },
    });

    // Initial render fires ondirtychange(false)
    expect(ondirtychange).toHaveBeenLastCalledWith(false);

    // Change the name
    const nameInputs = document.querySelectorAll('input[type="text"]');
    const nameInput = nameInputs[0];
    if (nameInput) {
      await fireEvent.input(nameInput, { target: { value: "Changed" } });
    }

    expect(ondirtychange).toHaveBeenCalledWith(true);
  });

  it("shows slug validation error for invalid format", async () => {
    render(IntakeFormEditor, { props: baseProps });

    const inputs = document.querySelectorAll('input[type="text"]');
    // Slug is the second text input
    const slugInput = inputs[1];
    if (slugInput) {
      await fireEvent.input(slugInput, {
        target: { value: "INVALID--slug" },
      });
    }

    expect(
      screen.getByText("Lowercase letters, digits, and single hyphens only."),
    ).toBeTruthy();
  });
});
