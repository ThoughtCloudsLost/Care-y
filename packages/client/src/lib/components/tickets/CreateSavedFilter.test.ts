// @vitest-environment jsdom
/**
 * CreateSavedFilter component tests.
 *
 * Verifies the modal renders color picker, icon picker, name input,
 * filter preview summary, and save button behavior.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import { SvelteSet } from "svelte/reactivity";

// --- Mock i18n ---
vi.mock("$lib/paraglide/messages.js", () => ({
  saved_filter_modal_title: () => "Save Filter",
  saved_filter_name_label: () => "Filter name",
  saved_filter_name_placeholder: () => "e.g. Urgent Housing",
  saved_filter_color_label: () => "Color",
  saved_filter_icon_label: () => "Icon",
  saved_filter_preview_label: () => "Filters",
  saved_filter_save: () => "Save",
  saved_filter_saved: () => "Filter saved",
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
  getCurrentUserId: () => () => "user-123",
}));

// --- Mock filter store ---
vi.mock("$lib/stores/filters.svelte.js", () => ({
  filterStore: {
    statuses: new SvelteSet<string>(["new", "active"]),
    queueIds: new SvelteSet<string>(),
    priorities: new SvelteSet<string>(["urgent"]),
    assigneeId: null,
    dateFrom: null,
    dateTo: null,
    sort: { field: "date", direction: "desc" },
    get activeCount() {
      return 2;
    },
    captureState: vi.fn().mockReturnValue({
      statuses: ["new", "active"],
      queueIds: [],
      priorities: ["urgent"],
      assigneeId: null,
      dateFrom: null,
      dateTo: null,
      sortField: "date",
      sortDirection: "desc",
    }),
  },
}));

// --- Mock saved filter store ---
const { mockAdd } = vi.hoisted(() => ({ mockAdd: vi.fn() }));
vi.mock("$lib/stores/saved-filters.svelte.js", () => ({
  savedFilterStore: {
    add: mockAdd,
    filters: [],
    count: 0,
    remove: vi.fn(),
    toggleShare: vi.fn(),
  },
}));

// --- Mock toast store ---
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn(), dismiss: vi.fn(), current: null },
}));

// --- Mock buffer encoding ---
vi.mock("$lib/utils/buffer-encoding.js", () => ({
  uint8ArrayToBase64: vi.fn().mockReturnValue("AQIDBA=="),
}));

// --- Mock shell popup: pass-through div that renders children ---
vi.mock("$lib/shell/ShellPopup.svelte", async () => ({
  default: (await import("./test-helpers/PassthroughShell.svelte")).default,
}));

// Must import AFTER all vi.mock() calls.
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
    render(CreateSavedFilter, { props: { opened: true, ondismiss: vi.fn() } });
    const swatches = screen.getAllByRole("radio", {
      name: /grey|blue|green|orange|red|pink|purple/,
    });
    expect(swatches).toHaveLength(SAVED_FILTER_COLORS.length);
  });

  it("renders a radio for each icon in SAVED_FILTER_ICONS", () => {
    render(CreateSavedFilter, { props: { opened: true, ondismiss: vi.fn() } });
    const icons = screen.getAllByRole("radio", {
      name: /^(phone|message-square|clock|triangle-alert|user|users|folder|tag|star|pin|heart|shield|house|briefcase|circle-question-mark)$/,
    });
    expect(icons).toHaveLength(SAVED_FILTER_ICONS.length);
  });

  it("renders filter preview summary", () => {
    render(CreateSavedFilter, { props: { opened: true, ondismiss: vi.fn() } });
    // The preview should show filter dimensions. With statuses ["new", "active"]
    // and priorities ["urgent"], it should contain those strings.
    const preview = screen.getByText(/new, active/);
    expect(preview).toBeTruthy();
  });

  it("save button is disabled when name is empty", () => {
    render(CreateSavedFilter, { props: { opened: true, ondismiss: vi.fn() } });
    const saveBtn = screen.getByText("Save");
    expect(saveBtn).toHaveProperty("disabled", true);
  });
});
