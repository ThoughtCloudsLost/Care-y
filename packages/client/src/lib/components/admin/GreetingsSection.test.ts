// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const {
  mockCreateGreeting,
  mockUpdateGreeting,
  mockDeleteGreeting,
  mockToastShow,
  mockHaptic,
} = vi.hoisted(() => ({
  mockCreateGreeting: vi.fn().mockResolvedValue({
    id: "g-new",
    phoneNumber: "+15551234567",
    greetingType: "answer",
    locale: "en",
    text: "Welcome!",
    isAudio: false,
    audioBlobKey: null,
  }),
  mockUpdateGreeting: vi.fn().mockResolvedValue({
    id: "g-1",
    phoneNumber: "+15551234567",
    greetingType: "answer",
    locale: "en",
    text: "Updated",
    isAudio: false,
    audioBlobKey: null,
  }),
  mockDeleteGreeting: vi.fn().mockResolvedValue({ success: true }),
  mockToastShow: vi.fn(),
  mockHaptic: vi.fn(),
}));

interface GreetingRecord {
  id: string;
  phoneNumber: string;
  greetingType: string;
  locale: string;
  text: string;
  isAudio: boolean;
  audioBlobKey: string | null;
}

interface Phone {
  number: string;
  sid: string;
}

let mockPhonesData: Phone[] | undefined;
let mockGreetingsData: GreetingRecord[] | undefined;
let mockPhonesLoading: boolean;
let mockGreetingsLoading: boolean;

vi.mock("$lib/paraglide/messages.js", () => ({
  admin_greetings_phone_label: () => "Phone",
  admin_greetings_phone_number_label: () => "Phone number",
  admin_greetings_filter_all: () => "All phones",
  admin_greetings_filter_unassigned: () => "Unassigned",
  admin_greetings_empty: () => "No greetings yet.",
  admin_greetings_empty_hint: () => "Tap Add greeting to create one.",
  admin_greetings_add_button: () => "Add greeting",
  admin_greetings_edit_title: () => "Edit greeting",
  admin_greetings_add_title: () => "New greeting",
  admin_greetings_type_label: () => "Type",
  admin_greetings_locale_label: () => "Language",
  admin_greetings_text_label: () => "Text",
  admin_greetings_text_placeholder: () => "Enter the greeting text...",
  admin_greetings_tts_hint: () =>
    "This text will be read aloud to callers using text-to-speech.",
  admin_greetings_save: () => "Save",
  admin_greetings_delete: () => "Delete",
  admin_greetings_delete_title: () => "Delete greeting",
  admin_greetings_delete_confirm: () =>
    "Are you sure you want to remove this greeting?",
  admin_greetings_saved: () => "Greeting saved.",
  admin_greetings_created: () => "Greeting created.",
  admin_greetings_deleted: () => "Greeting deleted.",
  admin_greetings_duplicate: () =>
    "A greeting with this type and language already exists.",
  admin_greetings_no_phones: () =>
    "Set up phone numbers in the Telephony section before adding greetings.",
  admin_greetings_type_answer: () => "Welcome message",
  admin_greetings_type_language_prompt: () => "Language selection",
  admin_greetings_type_new_client: () => "First-time caller",
  admin_greetings_type_existing_client: () => "Returning caller",
  admin_greetings_type_staff_menu: () => "Staff options",
  admin_greetings_type_answer_help: () =>
    "This is what callers hear when they first connect.",
  admin_greetings_type_language_prompt_help: () =>
    "Played when the caller needs to select a language.",
  admin_greetings_type_new_client_help: () =>
    "Played for callers who have never called before.",
  admin_greetings_type_existing_client_help: () =>
    "Played for callers the system recognizes.",
  admin_greetings_type_staff_menu_help: () =>
    "Played when a volunteer accesses the phone menu.",
  admin_greetings_mode_text: () => "Text",
  admin_greetings_mode_audio: () => "Audio",
  admin_greetings_upload_audio: () => "Upload audio file",
  admin_greetings_replace_audio: () => "Replace audio",
  admin_greetings_audio_uploaded: () => "Audio greeting uploaded.",
  admin_greetings_audio_too_large: () => "Audio file must be under 5 MB.",
  admin_greetings_audio_invalid: () => "File is not a valid audio format.",
  admin_greetings_audio_hint: () => "Upload a WAV, MP3, or OGG file.",
  admin_greetings_audio_converting: () => "Converting audio...",
  admin_greetings_audio_uploading: () => "Uploading...",
  ticket_voicemail_error: () => "Audio error",
  ticket_voicemail_loading: () => "Loading audio",
  ticket_voicemail_play: () => "Play",
  ticket_voicemail_pause: () => "Pause",
  ticket_voicemail_group: () => "Audio player",
  ticket_voicemail_progress: () => "Progress",
  common_loading: () => "Loading",
  common_cancel: () => "Cancel",
  error_generic: () => "Something went wrong",
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    telephonyContent: {
      listGreetings: { query: vi.fn() },
      createGreeting: { mutate: mockCreateGreeting },
      updateGreeting: { mutate: mockUpdateGreeting },
      deleteGreeting: { mutate: mockDeleteGreeting },
      uploadGreetingAudio: { mutate: vi.fn().mockResolvedValue({}) },
      createAudioGreeting: { mutate: vi.fn().mockResolvedValue({}) },
    },
    telephonyAdmin: {
      getProvisionedPhones: { query: vi.fn() },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  createQuery: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const key = opts.queryKey as string[];
    const isPhones = key.includes("provisionedPhones");
    return {
      get isLoading() {
        return isPhones ? mockPhonesLoading : mockGreetingsLoading;
      },
      get isError() {
        return false;
      },
      error: null,
      get data() {
        return isPhones ? mockPhonesData : mockGreetingsData;
      },
      refetch: vi.fn(),
    };
  },
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

import GreetingsSection from "./GreetingsSection.svelte";

const PHONES: Phone[] = [{ number: "+15551234567", sid: "PN-abc123" }];

const GREETINGS: GreetingRecord[] = [
  {
    id: "g-1",
    phoneNumber: "+15551234567",
    greetingType: "answer",
    locale: "en",
    text: "Thank you for calling our helpline.",
    isAudio: false,
    audioBlobKey: null,
  },
  {
    id: "g-2",
    phoneNumber: "+15551234567",
    greetingType: "answer",
    locale: "es",
    text: "Gracias por llamar a nuestra linea de ayuda.",
    isAudio: false,
    audioBlobKey: null,
  },
  {
    id: "g-3",
    phoneNumber: "+15551234567",
    greetingType: "new_client",
    locale: "en",
    text: "If this is your first time calling, please stay on the line.",
    isAudio: false,
    audioBlobKey: null,
  },
];

describe("GreetingsSection", () => {
  beforeEach(() => {
    mockPhonesData = undefined;
    mockGreetingsData = undefined;
    mockPhonesLoading = true;
    mockGreetingsLoading = true;
    mockCreateGreeting.mockClear();
    mockUpdateGreeting.mockClear();
    mockDeleteGreeting.mockClear();
    mockToastShow.mockClear();
    mockHaptic.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows no-phones message when phone list is empty", () => {
    mockPhonesLoading = false;
    mockGreetingsLoading = false;
    mockPhonesData = [];
    mockGreetingsData = [];
    render(GreetingsSection);

    expect(
      screen.getByText(
        "Set up phone numbers in the Telephony section before adding greetings.",
      ),
    ).toBeTruthy();
  });

  it("shows empty state when phones exist but no greetings", () => {
    mockPhonesLoading = false;
    mockGreetingsLoading = false;
    mockPhonesData = PHONES;
    mockGreetingsData = [];
    render(GreetingsSection);

    expect(screen.getByText("No greetings yet.")).toBeTruthy();
    expect(screen.getByText("Add greeting")).toBeTruthy();
  });

  it("renders greetings grouped by type with friendly labels", () => {
    mockPhonesLoading = false;
    mockGreetingsLoading = false;
    mockPhonesData = PHONES;
    mockGreetingsData = GREETINGS;
    render(GreetingsSection);

    expect(screen.getAllByText("Welcome message").length).toBeGreaterThan(0);
    expect(screen.getAllByText("First-time caller").length).toBeGreaterThan(0);
    expect(
      screen.getByText("Thank you for calling our helpline."),
    ).toBeTruthy();
  });

  it("shows locale badges on greeting rows", () => {
    mockPhonesLoading = false;
    mockGreetingsLoading = false;
    mockPhonesData = PHONES;
    mockGreetingsData = GREETINGS;
    render(GreetingsSection);

    const badges = screen.getAllByText("en");
    expect(badges.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("es")).toBeTruthy();
  });

  it("opens add sheet and calls createGreeting on save", async () => {
    mockPhonesLoading = false;
    mockGreetingsLoading = false;
    mockPhonesData = PHONES;
    mockGreetingsData = [];
    render(GreetingsSection);

    const addBtn = screen.getByText("Add greeting");
    await fireEvent.click(addBtn);

    expect(screen.getByText("New greeting")).toBeTruthy();

    const textInput = screen.getByPlaceholderText("Enter the greeting text...");
    await fireEvent.input(textInput, {
      target: { value: "Welcome to our helpline." },
    });

    const saveBtn = screen.getByText("Save");
    await fireEvent.click(saveBtn);

    expect(mockCreateGreeting).toHaveBeenCalled();
  });

  it("opens edit sheet when tapping a greeting edit button", async () => {
    mockPhonesLoading = false;
    mockGreetingsLoading = false;
    mockPhonesData = PHONES;
    mockGreetingsData = GREETINGS;
    render(GreetingsSection);

    const editBtns = screen.getAllByLabelText(/Edit greeting:/);
    await fireEvent.click(editBtns[0]!);

    expect(screen.getByText("Edit greeting")).toBeTruthy();
  });

  it("calls updateGreeting when saving an edit", async () => {
    mockPhonesLoading = false;
    mockGreetingsLoading = false;
    mockPhonesData = PHONES;
    mockGreetingsData = GREETINGS;
    render(GreetingsSection);

    const editBtns = screen.getAllByLabelText(/Edit greeting:/);
    await fireEvent.click(editBtns[0]!);

    const textInput = screen.getByPlaceholderText("Enter the greeting text...");
    await fireEvent.input(textInput, {
      target: { value: "Updated greeting text." },
    });

    const saveBtn = screen.getByText("Save");
    await fireEvent.click(saveBtn);

    expect(mockUpdateGreeting).toHaveBeenCalled();
  });

  it("shows delete confirmation dialog from edit sheet", async () => {
    mockPhonesLoading = false;
    mockGreetingsLoading = false;
    mockPhonesData = PHONES;
    mockGreetingsData = GREETINGS;
    render(GreetingsSection);

    const editBtns = screen.getAllByLabelText(/Edit greeting:/);
    await fireEvent.click(editBtns[0]!);

    const deleteBtns = screen.getAllByText("Delete");
    const firstDeleteBtn = deleteBtns[0];
    expect(firstDeleteBtn).toBeTruthy();
    await fireEvent.click(firstDeleteBtn!);

    expect(
      screen.getByText("Are you sure you want to remove this greeting?"),
    ).toBeTruthy();
  });

  it("shows helper text for greeting type in add mode", async () => {
    mockPhonesLoading = false;
    mockGreetingsLoading = false;
    mockPhonesData = PHONES;
    mockGreetingsData = [];
    render(GreetingsSection);

    const addBtn = screen.getByText("Add greeting");
    await fireEvent.click(addBtn);

    expect(
      screen.getByText("This is what callers hear when they first connect."),
    ).toBeTruthy();
  });

  it("shows duplicate warning for existing type+locale+phone combo", async () => {
    mockPhonesLoading = false;
    mockGreetingsLoading = false;
    mockPhonesData = PHONES;
    mockGreetingsData = GREETINGS;
    render(GreetingsSection);

    const addBtn = screen.getByText("Add greeting");
    await fireEvent.click(addBtn);

    expect(
      screen.getByText(
        "A greeting with this type and language already exists.",
      ),
    ).toBeTruthy();
  });

  it("shows success toast after creating a greeting", async () => {
    mockPhonesLoading = false;
    mockGreetingsLoading = false;
    mockPhonesData = PHONES;
    mockGreetingsData = [];
    render(GreetingsSection);

    await fireEvent.click(screen.getByText("Add greeting"));

    const textInput = screen.getByPlaceholderText("Enter the greeting text...");
    await fireEvent.input(textInput, {
      target: { value: "Hello there!" },
    });
    await fireEvent.click(screen.getByText("Save"));

    await vi.waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Greeting created.");
      expect(mockHaptic).toHaveBeenCalled();
    });
  });

  it("displays phone number as card header", () => {
    mockPhonesLoading = false;
    mockGreetingsLoading = false;
    mockPhonesData = PHONES;
    mockGreetingsData = GREETINGS;
    render(GreetingsSection);

    const matches = screen.getAllByText("+15551234567");
    const cardHeader = matches.find((el) =>
      el.classList.contains("card-section-label"),
    );
    expect(cardHeader).toBeTruthy();
  });

  it("shows audio player for audio greetings", () => {
    mockPhonesLoading = false;
    mockGreetingsLoading = false;
    mockPhonesData = PHONES;
    mockGreetingsData = [
      {
        id: "g-audio",
        phoneNumber: "+15551234567",
        greetingType: "answer",
        locale: "en",
        text: "(audio greeting)",
        isAudio: true,
        audioBlobKey: "org_test/greeting/blob-123",
      },
    ];
    render(GreetingsSection);

    const audioRow = document.querySelector(
      '[aria-label*="Welcome message"][aria-label*="Audio"]',
    );
    expect(audioRow).toBeTruthy();
  });

  it("shows segmented control (Text/Audio) in add sheet", async () => {
    mockPhonesLoading = false;
    mockGreetingsLoading = false;
    mockPhonesData = PHONES;
    mockGreetingsData = [];
    render(GreetingsSection);

    await fireEvent.click(screen.getByText("Add greeting"));

    const radioGroup = screen.getByRole("radiogroup");
    expect(radioGroup).toBeTruthy();
  });

  it("shows replace audio button when editing an audio greeting", async () => {
    mockPhonesLoading = false;
    mockGreetingsLoading = false;
    mockPhonesData = PHONES;
    mockGreetingsData = [
      {
        id: "g-audio-edit",
        phoneNumber: "+15551234567",
        greetingType: "new_client",
        locale: "en",
        text: "",
        isAudio: true,
        audioBlobKey: "org_test/greeting/blob-456",
      },
    ];
    render(GreetingsSection);

    const editBtn = screen.getByLabelText(/Edit greeting:.*First-time caller/);
    await fireEvent.click(editBtn);

    expect(screen.getByText("Replace audio")).toBeTruthy();
  });
});
