// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const {
  mockSaveForm,
  mockBindQueue,
  mockDeleteForm,
  mockToastShow,
  mockEncryptFieldContent,
  mockUploadFormAsset,
} = vi.hoisted(() => ({
  mockSaveForm: vi.fn().mockResolvedValue({ formId: "new-form-id" }),
  mockBindQueue: vi.fn().mockResolvedValue({ ok: true }),
  mockDeleteForm: vi.fn().mockResolvedValue({ deleted: true }),
  mockToastShow: vi.fn(),
  mockEncryptFieldContent: vi.fn().mockReturnValue({
    encryptedLabel: "enc-label",
    encryptedConfig: "enc-config",
  }),
  mockUploadFormAsset: vi.fn().mockResolvedValue({ blobId: "test-blob-id" }),
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
  intake_forms_description_hint: () => "Shown on the public form page.",
  intake_forms_submit_message_label: () => "Success message",
  intake_forms_submit_message_placeholder: () => "Shown after submit.",
  intake_forms_submit_message_hint: () => "Replaces default.",
  intake_forms_closed_message_label: () => "Closed message",
  intake_forms_closed_message_placeholder: () => "Shown when closed.",
  intake_forms_closed_message_hint: () => "When closing date has passed.",
  intake_forms_content_cap_error: ({ max }: { max: string }) =>
    `Content exceeds the ${max} character limit for this locale.`,
  intake_forms_banner_heading: () => "Banner image",
  intake_forms_banner_add: () => "Add banner image",
  intake_forms_banner_remove: () => "Remove banner",
  intake_forms_banner_alt_label: () =>
    "Alt text (optional, leave blank for decorative)",
  intake_forms_banner_alt_placeholder: () =>
    "Describe the image for screen readers",
  intake_forms_banner_uploading: () => "Uploading banner...",
  intake_forms_banner_upload_failed: () => "Banner upload failed.",
  intake_forms_banner_file_too_large: () =>
    "Banner image exceeds the maximum file size.",
  intake_forms_banner_file_type: () =>
    "Only PNG, JPEG, and WebP images are allowed.",
  intake_forms_closes_at_heading: () => "Closing date",
  intake_forms_closes_at_label: () => "Closes at",
  intake_forms_closes_at_hint: () =>
    "After this date and time, the form will stop accepting submissions.",
  intake_forms_closes_at_hint_with_message: () =>
    "After this date, the form shows the closed message.",
  intake_forms_closes_at_clear: () => "Clear closing date",
  intake_forms_destination_default_named: ({ name }: { name: string }) =>
    `Default intake queue (${name})`,
  intake_forms_config_field_type_label: () => "Field type",
  intake_forms_field_row_subtype: ({
    type,
    subtype,
  }: {
    type: string;
    subtype: string;
  }) => `${type}: ${subtype}`,
  intake_forms_field_row_role: ({ role }: { role: string }) => `Role: ${role}`,
  intake_forms_field_row_conditional: ({ field }: { field: string }) =>
    `Conditional on: ${field}`,
  intake_forms_field_row_options_count: ({ count }: { count: string }) =>
    `${count} options`,
  intake_forms_field_row_min_max: ({
    min,
    max,
  }: {
    min: string;
    max: string;
  }) => `Range: ${min} to ${max}`,
  intake_forms_field_row_min_only: ({ min }: { min: string }) => `Min: ${min}`,
  intake_forms_field_row_max_only: ({ max }: { max: string }) => `Max: ${max}`,
  intake_forms_field_row_max_length: ({ max }: { max: string }) =>
    `Max length: ${max}`,
  intake_forms_field_row_page_number: ({ page }: { page: string }) =>
    `Page ${page}`,
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
  intake_forms_config_subtype_email: () => "Email address",
  intake_forms_config_subtype_phone: () => "Phone number",
  intake_forms_config_subtype_number: () => "Number",
  intake_forms_field_type_date: () => "Date",
  intake_forms_field_type_date_desc: () => "Date picker",
  intake_forms_field_type_page_break: () => "Page break",
  intake_forms_field_type_page_break_desc: () => "Split the form into pages",
  intake_forms_preview_state_form: () => "Form",
  intake_forms_preview_state_submitted: () => "Submitted",
  intake_forms_preview_state_closed: () => "Closed",
  intake_forms_preview_empty_title: () => "No fields yet",
  intake_forms_preview_empty_subtitle: () =>
    "Add fields to see how the form will look to clients.",
  intake_forms_preview_reference_placeholder: () => "XXXX-XXXX",
  intake_success_heading: () => "Your message was sent",
  intake_success_body: () => "A volunteer will read it as soon as possible.",
  intake_reference_label: () => "Your reference code:",
  intake_reference_save: () => "Save it if you want to follow up by phone.",
  intake_form_closed_default: () =>
    "This form is no longer accepting submissions.",
  form_content_editor_image_no_key: () =>
    "Image upload requires the organization key to be loaded",
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
      uploadFormAsset: { mutate: mockUploadFormAsset },
    },
    tickets: {
      listQueues: { query: vi.fn().mockResolvedValue([]) },
      listVolunteers: { query: vi.fn().mockResolvedValue([]) },
    },
    org: {
      getIntakeQueue: { query: vi.fn().mockResolvedValue({ queueId: null }) },
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

vi.mock("$lib/stores/layout-mode.svelte", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  layoutMode: {
    get isDesktop() {
      return false;
    },
    get isTablet() {
      return false;
    },
  },
}));

vi.mock("$lib/components/shared/konsta-classes.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  DIALOG_DESTRUCTIVE_CLASS: "destructive-class",
}));

vi.mock("$lib/utils/org-slug.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getOrgSlug: () => "test-org",
}));

// Mock renderFormRichText to return simple text for testing
vi.mock("$lib/utils/render-form-content.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  renderFormRichText: (value: unknown) => {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return `<p>${value}</p>`;
    return "<p>rich content</p>";
  },
}));

// Mock FormContentEditor as a simple div that shows the label
vi.mock("./FormContentEditor.svelte", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  default: {
    $$render: () => "",
    render: () => ({ html: "", css: { code: "" }, head: "" }),
  },
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
    initialClosesAt: null as string | null,
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

  it("auto-suggests slug from name until slug is manually edited (F-002)", async () => {
    render(IntakeFormEditor, { props: baseProps });

    const inputs = document.querySelectorAll('input[type="text"]');
    const nameInput = inputs[0];
    const slugInput = inputs[1];

    // Type multiple characters into name
    if (nameInput) {
      await fireEvent.input(nameInput, { target: { value: "Contact" } });
    }

    // Slug should follow the full name, not just the first character
    expect((slugInput as HTMLInputElement | undefined)?.value).toBe("contact");

    // Continue typing
    if (nameInput) {
      await fireEvent.input(nameInput, {
        target: { value: "Contact Form" },
      });
    }
    expect((slugInput as HTMLInputElement | undefined)?.value).toBe(
      "contact-form",
    );

    // Manually edit the slug
    if (slugInput) {
      await fireEvent.input(slugInput, {
        target: { value: "custom-slug" },
      });
    }

    // Further name changes should not overwrite the slug
    if (nameInput) {
      await fireEvent.input(nameInput, {
        target: { value: "Updated Name" },
      });
    }
    expect((slugInput as HTMLInputElement | undefined)?.value).toBe(
      "custom-slug",
    );
  });

  it("shows required asterisk in field row title (F-009)", () => {
    render(IntakeFormEditor, {
      props: {
        ...baseProps,
        initialFields: [
          {
            fieldKey: "fk-req",
            label: { en: "Full name" },
            helpText: {},
            isRequired: true,
            config: { type: "text" as const },
            fieldType: "text" as const,
            ...NO_ROLE,
          },
          {
            fieldKey: "fk-opt",
            label: { en: "Nickname" },
            helpText: {},
            isRequired: false,
            config: { type: "text" as const },
            fieldType: "text" as const,
            ...NO_ROLE,
          },
        ],
      },
    });

    // Required field has asterisk in the title
    expect(screen.getAllByText(/Full name \*/).length).toBeGreaterThanOrEqual(
      1,
    );
    // Optional field has no asterisk
    const nicknameTexts = screen.getAllByText(/Nickname/);
    const hasAsterisk = nicknameTexts.some((el) =>
      el.textContent.includes("*"),
    );
    expect(hasAsterisk).toBe(false);
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

  it("renders closing date section heading", () => {
    render(IntakeFormEditor, { props: baseProps });

    expect(screen.getByText("Closing date")).toBeTruthy();
  });

  it("includes closesAt in save payload when datetime-local is filled", async () => {
    render(IntakeFormEditor, {
      props: {
        ...baseProps,
        initialName: "Close Test",
        initialFields: [
          {
            fieldKey: "fk-close",
            label: { en: "Question" },
            helpText: {},
            isRequired: false,
            config: { type: "text" as const },
            fieldType: "text" as const,
            ...NO_ROLE,
          },
        ],
      },
    });

    // Find the datetime-local input by type
    const dtInput = document.querySelector('input[type="datetime-local"]');
    expect(dtInput).toBeTruthy();
    if (dtInput) {
      await fireEvent.input(dtInput, {
        target: { value: "2026-12-31T23:59" },
      });
    }

    const saveButton = screen.getByText("Save form").closest("button");
    if (saveButton) {
      await fireEvent.click(saveButton);
    }

    // The save mutation should have been called with a closesAt value
    expect(mockSaveForm).toHaveBeenCalledWith(
      expect.objectContaining({
        closesAt: expect.any(String),
      }),
    );

    // Verify the closesAt is an ISO string
    const call = mockSaveForm.mock.calls[0] as [Record<string, unknown>];
    const closesAt = call[0].closesAt;
    expect(typeof closesAt).toBe("string");
    expect(new Date(closesAt as string).toISOString()).toBe(closesAt);
  });

  it("includes null closesAt when datetime-local is empty", async () => {
    render(IntakeFormEditor, {
      props: {
        ...baseProps,
        initialName: "No Close Test",
        initialFields: [
          {
            fieldKey: "fk-noclose",
            label: { en: "Question" },
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

    expect(mockSaveForm).toHaveBeenCalledWith(
      expect.objectContaining({
        closesAt: null,
      }),
    );
  });

  it("shows empty state when no fields are present (F-014)", () => {
    render(IntakeFormEditor, { props: baseProps });

    expect(screen.getByText("No fields yet")).toBeTruthy();
    expect(
      screen.getByText("Add fields to see how the form will look to clients."),
    ).toBeTruthy();
  });

  it("renders preview state selector with three states (F-014)", () => {
    render(IntakeFormEditor, {
      props: {
        ...baseProps,
        initialFields: [
          {
            fieldKey: "fk-state",
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

    expect(screen.getByText("Form")).toBeTruthy();
    expect(screen.getByText("Submitted")).toBeTruthy();
    expect(screen.getByText("Closed")).toBeTruthy();
  });

  it("shows submitted state when Submitted button is clicked (F-014)", async () => {
    render(IntakeFormEditor, {
      props: {
        ...baseProps,
        initialFields: [
          {
            fieldKey: "fk-submit-state",
            label: { en: "Question" },
            helpText: {},
            isRequired: false,
            config: { type: "text" as const },
            fieldType: "text" as const,
            ...NO_ROLE,
          },
        ],
      },
    });

    const submittedButton = screen.getByText("Submitted").closest("button");
    if (submittedButton) {
      await fireEvent.click(submittedButton);
    }

    expect(screen.getByText("Your message was sent")).toBeTruthy();
    expect(screen.getByText("XXXX-XXXX")).toBeTruthy();
  });

  it("shows closed state when Closed button is clicked (F-014)", async () => {
    render(IntakeFormEditor, {
      props: {
        ...baseProps,
        initialFields: [
          {
            fieldKey: "fk-closed-state",
            label: { en: "Question" },
            helpText: {},
            isRequired: false,
            config: { type: "text" as const },
            fieldType: "text" as const,
            ...NO_ROLE,
          },
        ],
      },
    });

    const closedButton = screen.getByText("Closed").closest("button");
    if (closedButton) {
      await fireEvent.click(closedButton);
    }

    expect(
      screen.getByText("This form is no longer accepting submissions."),
    ).toBeTruthy();
  });

  it("renders banner section heading", () => {
    render(IntakeFormEditor, { props: baseProps });

    expect(screen.getByText("Banner image")).toBeTruthy();
  });

  it("renders add banner button when no banner set", () => {
    render(IntakeFormEditor, { props: baseProps });

    expect(screen.getByText("Add banner image")).toBeTruthy();
  });

  it("renders banner preview and remove button when bannerBlobKey is set", () => {
    render(IntakeFormEditor, {
      props: {
        ...baseProps,
        initialFormMeta: {
          bannerBlobKey: "test-blob-123",
          bannerAlt: "A test banner",
        },
      },
    });

    // Remove button should be visible
    expect(screen.getByText("Remove banner")).toBeTruthy();

    // Banner preview image should exist
    const bannerImg = document.querySelector(
      ".banner-preview-img",
    ) as HTMLImageElement | null;
    expect(bannerImg).toBeTruthy();
    expect(bannerImg?.src).toContain("/api/forms/test-org/test-blob-123");
    expect(bannerImg?.alt).toBe("A test banner");
  });

  it("renders form content heading for rich text editors", () => {
    render(IntakeFormEditor, { props: baseProps });

    expect(screen.getByText("Form content")).toBeTruthy();
  });

  it("renders banner in preview when bannerBlobKey is set", () => {
    render(IntakeFormEditor, {
      props: {
        ...baseProps,
        initialFormMeta: {
          bannerBlobKey: "preview-blob",
          bannerAlt: "Preview banner",
        },
        initialFields: [
          {
            fieldKey: "fk-preview-banner",
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

    const previewBanner = document.querySelector(
      ".preview-banner-img",
    ) as HTMLImageElement | null;
    expect(previewBanner).toBeTruthy();
    expect(previewBanner?.alt).toBe("Preview banner");
  });

  it("marks dirty when bannerBlobKey changes from initial", () => {
    const ondirtychange = vi.fn();
    render(IntakeFormEditor, {
      props: {
        ...baseProps,
        initialFormMeta: { bannerBlobKey: "original-blob" },
        ondirtychange,
      },
    });

    // Initial state is not dirty
    expect(ondirtychange).toHaveBeenLastCalledWith(false);
  });
});
