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

describe("IntakeFormEditor", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const baseProps = {
    formId: null,
    initialName: "",
    initialFields: [],
    boundQueueIds: [] as readonly string[],
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
            label: "Your name",
            isRequired: false,
            config: { type: "text" as const },
            fieldType: "text" as const,
          },
          {
            label: "Message",
            isRequired: true,
            config: { type: "textarea" as const },
            fieldType: "textarea" as const,
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

  it("calls encryptFieldContent on save", async () => {
    render(IntakeFormEditor, {
      props: {
        ...baseProps,
        initialName: "Test Form",
        initialFields: [
          {
            label: "Name",
            isRequired: false,
            config: { type: "text" as const },
            fieldType: "text" as const,
          },
        ],
      },
    });

    const saveButton = screen.getByText("Save form").closest("button");
    if (saveButton) {
      await fireEvent.click(saveButton);
    }

    expect(mockEncryptFieldContent).toHaveBeenCalledWith(
      { label: "Name", config: { type: "text" } },
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
            label: "Full name",
            isRequired: true,
            config: { type: "text" as const },
            fieldType: "text" as const,
          },
          {
            label: "Your situation",
            isRequired: true,
            config: { type: "textarea" as const, maxLength: 5000 },
            fieldType: "textarea" as const,
          },
          {
            label: "Services needed",
            isRequired: false,
            config: {
              type: "multiselect" as const,
              options: ["Housing", "Legal"],
            },
            fieldType: "multiselect" as const,
          },
        ],
        boundQueueIds: ["queue-1"],
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
            label: "Name",
            isRequired: false,
            config: { type: "text" as const },
            fieldType: "text" as const,
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
});
