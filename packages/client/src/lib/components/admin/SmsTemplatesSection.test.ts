// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const {
  mockCreateSmsResponse,
  mockUpdateSmsResponse,
  mockDeleteSmsResponse,
  mockToastShow,
  mockHaptic,
} = vi.hoisted(() => ({
  mockCreateSmsResponse: vi.fn().mockResolvedValue({
    id: "tpl-new",
    responseType: "new_client",
    locale: "en",
    text: "Welcome!",
  }),
  mockUpdateSmsResponse: vi.fn().mockResolvedValue({
    id: "tpl-1",
    responseType: "new_client",
    locale: "en",
    text: "Updated!",
  }),
  mockDeleteSmsResponse: vi.fn().mockResolvedValue({ success: true }),
  mockToastShow: vi.fn(),
  mockHaptic: vi.fn(),
}));

interface TemplateRecord {
  id: string;
  responseType: string;
  locale: string;
  text: string;
}

let mockTemplatesData: TemplateRecord[] | undefined;
let mockTemplatesLoading: boolean;

vi.mock("$lib/paraglide/messages.js", () => ({
  admin_templates_empty: () => "No templates yet.",
  admin_templates_empty_hint: () => "Tap Add template to create one.",
  admin_templates_add_button: () => "Add template",
  admin_templates_add_title: () => "New template",
  admin_templates_edit_title: () => "Edit template",
  admin_templates_type_label: () => "Type",
  admin_templates_locale_label: () => "Language",
  admin_templates_text_label: () => "Message text",
  admin_templates_text_placeholder: () => "Enter the template text...",
  admin_templates_char_count: (p: { count: string; max: string }) =>
    `${p.count} / ${p.max} characters`,
  admin_templates_segment_hint: () =>
    "Messages longer than 160 characters will be split into multiple texts.",
  admin_templates_save: () => "Save",
  admin_templates_delete: () => "Delete",
  admin_templates_delete_title: () => "Delete template",
  admin_templates_delete_confirm: () =>
    "Are you sure you want to remove this template?",
  admin_templates_saved: () => "Template saved.",
  admin_templates_created: () => "Template created.",
  admin_templates_deleted: () => "Template deleted.",
  admin_templates_duplicate: () =>
    "A template with this type and language already exists.",
  admin_templates_type_new_client: () => "Auto-reply",
  admin_templates_type_error: () => "Error response",
  admin_templates_type_new_client_help: () =>
    "Sent automatically to every incoming text message. Lets the sender know their message was received and a volunteer will follow up.",
  admin_templates_type_error_help: () =>
    "Sent when the system cannot process an incoming message.",
  common_loading: () => "Loading",
  common_cancel: () => "Cancel",
  error_generic: () => "Something went wrong",
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    telephonyContent: {
      listSmsResponses: { query: vi.fn() },
      createSmsResponse: { mutate: mockCreateSmsResponse },
      updateSmsResponse: { mutate: mockUpdateSmsResponse },
      deleteSmsResponse: { mutate: mockDeleteSmsResponse },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  createQuery: () => ({
    get isLoading() {
      return mockTemplatesLoading;
    },
    get isError() {
      return false;
    },
    error: null,
    get data() {
      return mockTemplatesData;
    },
    refetch: vi.fn(),
  }),
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input?: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as (() => void) | undefined;
    const onError = opts.onError as (() => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      mutate(input?: unknown) {
        mutationFn(input).then(
          () => onSuccess?.(),
          () => onError?.(),
        );
      },
    };
  },
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("$lib/utils/haptic.js", () => ({ haptic: mockHaptic }));
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));
vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));
vi.mock("$lib/utils/a11y.js", () => ({
  onKeyActivate: (fn: () => void) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") fn();
  },
}));

import SmsTemplatesSection from "./SmsTemplatesSection.svelte";

const TEMPLATES: TemplateRecord[] = [
  {
    id: "tpl-1",
    responseType: "new_client",
    locale: "en",
    text: "Thanks for reaching out. A volunteer will follow up shortly.",
  },
  {
    id: "tpl-2",
    responseType: "new_client",
    locale: "es",
    text: "Gracias por comunicarte. Un voluntario se pondra en contacto pronto.",
  },
  {
    id: "tpl-3",
    responseType: "error",
    locale: "en",
    text: "We couldn't process your message. Please try again later.",
  },
];

describe("SmsTemplatesSection", () => {
  beforeEach(() => {
    mockTemplatesData = undefined;
    mockTemplatesLoading = true;
    mockCreateSmsResponse.mockClear();
    mockUpdateSmsResponse.mockClear();
    mockDeleteSmsResponse.mockClear();
    mockToastShow.mockClear();
    mockHaptic.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows empty state when no templates exist", () => {
    mockTemplatesLoading = false;
    mockTemplatesData = [];
    render(SmsTemplatesSection);

    expect(screen.getByText("No templates yet.")).toBeTruthy();
    expect(screen.getByText("Tap Add template to create one.")).toBeTruthy();
    expect(screen.getByText("Add template")).toBeTruthy();
  });

  it("renders templates grouped by type with friendly labels", () => {
    mockTemplatesLoading = false;
    mockTemplatesData = TEMPLATES;
    render(SmsTemplatesSection);

    expect(screen.getAllByText("Auto-reply").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Error response").length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        "Thanks for reaching out. A volunteer will follow up shortly.",
      ),
    ).toBeTruthy();
  });

  it("shows locale badges on template rows", () => {
    mockTemplatesLoading = false;
    mockTemplatesData = TEMPLATES;
    render(SmsTemplatesSection);

    const enBadges = screen.getAllByText("en");
    expect(enBadges.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("es")).toBeTruthy();
  });

  it("opens add sheet and calls createSmsResponse on save", async () => {
    mockTemplatesLoading = false;
    mockTemplatesData = [];
    render(SmsTemplatesSection);

    await fireEvent.click(screen.getByText("Add template"));
    expect(screen.getByText("New template")).toBeTruthy();

    const textInput = screen.getByPlaceholderText("Enter the template text...");
    await fireEvent.input(textInput, {
      target: { value: "Welcome to our service." },
    });

    await fireEvent.click(screen.getByText("Save"));
    expect(mockCreateSmsResponse).toHaveBeenCalled();
  });

  it("opens edit sheet when tapping a template edit button", async () => {
    mockTemplatesLoading = false;
    mockTemplatesData = TEMPLATES;
    render(SmsTemplatesSection);

    const editBtns = screen.getAllByLabelText(/Edit template:/);
    await fireEvent.click(editBtns[0]!);

    expect(screen.getByText("Edit template")).toBeTruthy();
  });

  it("calls updateSmsResponse when saving an edit", async () => {
    mockTemplatesLoading = false;
    mockTemplatesData = TEMPLATES;
    render(SmsTemplatesSection);

    const editBtns = screen.getAllByLabelText(/Edit template:/);
    await fireEvent.click(editBtns[0]!);

    const textInput = screen.getByPlaceholderText("Enter the template text...");
    await fireEvent.input(textInput, {
      target: { value: "Updated welcome text." },
    });

    await fireEvent.click(screen.getByText("Save"));
    expect(mockUpdateSmsResponse).toHaveBeenCalled();
  });

  it("shows delete confirmation dialog from edit sheet", async () => {
    mockTemplatesLoading = false;
    mockTemplatesData = TEMPLATES;
    render(SmsTemplatesSection);

    const editBtns = screen.getAllByLabelText(/Edit template:/);
    await fireEvent.click(editBtns[0]!);

    const deleteBtns = screen.getAllByText("Delete");
    await fireEvent.click(deleteBtns[0]!);

    expect(
      screen.getByText("Are you sure you want to remove this template?"),
    ).toBeTruthy();
  });

  it("shows character count in add sheet", async () => {
    mockTemplatesLoading = false;
    mockTemplatesData = [];
    render(SmsTemplatesSection);

    await fireEvent.click(screen.getByText("Add template"));

    expect(screen.getByText("0 / 1600 characters")).toBeTruthy();

    const textInput = screen.getByPlaceholderText("Enter the template text...");
    await fireEvent.input(textInput, { target: { value: "Hello" } });

    expect(screen.getByText("5 / 1600 characters")).toBeTruthy();
  });

  it("shows segment hint text", async () => {
    mockTemplatesLoading = false;
    mockTemplatesData = [];
    render(SmsTemplatesSection);

    await fireEvent.click(screen.getByText("Add template"));

    expect(
      screen.getByText(
        "Messages longer than 160 characters will be split into multiple texts.",
      ),
    ).toBeTruthy();
  });

  it("shows helper text for template type in add mode", async () => {
    mockTemplatesLoading = false;
    mockTemplatesData = [];
    render(SmsTemplatesSection);

    await fireEvent.click(screen.getByText("Add template"));

    expect(
      screen.getByText(
        "Sent automatically to every incoming text message. Lets the sender know their message was received and a volunteer will follow up.",
      ),
    ).toBeTruthy();
  });

  it("shows duplicate warning for existing type+locale combo", async () => {
    mockTemplatesLoading = false;
    mockTemplatesData = TEMPLATES;
    render(SmsTemplatesSection);

    await fireEvent.click(screen.getByText("Add template"));

    expect(
      screen.getByText(
        "A template with this type and language already exists.",
      ),
    ).toBeTruthy();
  });

  it("shows success toast and haptic after creating a template", async () => {
    mockTemplatesLoading = false;
    mockTemplatesData = [];
    render(SmsTemplatesSection);

    await fireEvent.click(screen.getByText("Add template"));

    const textInput = screen.getByPlaceholderText("Enter the template text...");
    await fireEvent.input(textInput, {
      target: { value: "Thanks for contacting us." },
    });
    await fireEvent.click(screen.getByText("Save"));

    await vi.waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Template created.");
      expect(mockHaptic).toHaveBeenCalled();
    });
  });

  it("shows both type groups even when one is empty", () => {
    mockTemplatesLoading = false;
    mockTemplatesData = [
      {
        id: "tpl-1",
        responseType: "new_client",
        locale: "en",
        text: "Welcome!",
      },
    ];
    render(SmsTemplatesSection);

    expect(screen.getAllByText("Auto-reply").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Error response").length).toBeGreaterThan(0);
  });
});
