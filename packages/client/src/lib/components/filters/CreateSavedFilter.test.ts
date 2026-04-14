// @vitest-environment jsdom
/**
 * CreateSavedFilter generic component tests.
 *
 * The generic component accepts filterSummary (string) and onsave (callback)
 * instead of reading from domain stores. Tests verify color/icon pickers,
 * name input, preview summary, and save button behavior.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

// --- Mock i18n ---
vi.mock("$lib/paraglide/messages.js", () => ({
  saved_filter_modal_title: () => "Save Filter",
  saved_filter_name_label: () => "Filter name",
  saved_filter_name_placeholder: () => "e.g. Urgent Housing",
  saved_filter_color_label: () => "Color",
  saved_filter_icon_label: () => "Icon",
  saved_filter_preview_label: () => "Filters",
  saved_filter_save: () => "Save",
  shell_close: () => "Close",
}));

// --- Mock crypto context ---
const { mockEncrypt } = vi.hoisted(() => ({
  mockEncrypt: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3, 4])),
}));

vi.mock("$lib/crypto/context.js", () => ({
  getOrgKeyManager: () => ({
    encrypt: mockEncrypt,
    decrypt: vi.fn(),
    isLoaded: true,
    load: vi.fn(),
    zero: vi.fn(),
  }),
}));

// --- Mock buffer encoding ---
vi.mock("$lib/utils/buffer-encoding.js", () => ({
  uint8ArrayToBase64: vi.fn().mockReturnValue("AQIDBA=="),
}));

// --- Mock shell popup: pass-through div that renders children ---
vi.mock("$lib/shell/ShellPopup.svelte", async () => ({
  default: (await import("../tickets/test-helpers/PassthroughShell.svelte"))
    .default,
}));

import CreateSavedFilter from "./CreateSavedFilter.svelte";
import {
  SAVED_FILTER_COLORS,
  SAVED_FILTER_ICONS,
} from "./saved-filter-constants.js";

describe("CreateSavedFilter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("renders a radio for each color in SAVED_FILTER_COLORS", () => {
    render(CreateSavedFilter, {
      opened: true,
      filterSummary: "new, active, urgent",
      ondismiss: vi.fn(),
      onsave: vi.fn(),
    });
    const swatches = screen.getAllByRole("radio", {
      name: /grey|blue|green|orange|red|pink|purple/,
    });
    expect(swatches).toHaveLength(SAVED_FILTER_COLORS.length);
  });

  it("renders a radio for each icon in SAVED_FILTER_ICONS", () => {
    render(CreateSavedFilter, {
      opened: true,
      filterSummary: "new, active, urgent",
      ondismiss: vi.fn(),
      onsave: vi.fn(),
    });
    const icons = screen.getAllByRole("radio", {
      name: /^(phone|message-square|clock|triangle-alert|user|users|folder|tag|star|pin|heart|shield|house|briefcase|circle-question-mark)$/,
    });
    expect(icons).toHaveLength(SAVED_FILTER_ICONS.length);
  });

  it("renders filter preview summary from prop", () => {
    render(CreateSavedFilter, {
      opened: true,
      filterSummary: "new, active, urgent",
      ondismiss: vi.fn(),
      onsave: vi.fn(),
    });
    const preview = screen.getByText("new, active, urgent");
    expect(preview).toBeTruthy();
  });

  it("save button is disabled when name is empty", () => {
    render(CreateSavedFilter, {
      opened: true,
      filterSummary: "new, active",
      ondismiss: vi.fn(),
      onsave: vi.fn(),
    });
    const saveBtn = screen.getByText("Save");
    expect(saveBtn).toHaveProperty("disabled", true);
  });
});
