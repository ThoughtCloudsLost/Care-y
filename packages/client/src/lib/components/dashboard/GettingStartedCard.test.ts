// @vitest-environment jsdom
/**
 * GettingStartedCard render tests.
 *
 * vi.mock() is required for:
 *   - $app/navigation: SvelteKit virtual module, no on-disk source
 *   - $lib/trpc/index.js: live HTTP connection module
 *   - @tanstack/svelte-query: needs controlled query state
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

// CollapsibleSection uses a slide transition; jsdom lacks the Web
// Animations API.
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

// --- Controllable mock state ---

// The card emits onnavigate (content components never call goto); the
// route file owns the actual navigation.
const mockNavigate = vi.fn();

interface ChecklistItemState {
  id: string;
  complete: boolean;
}

let mockChecklistState: {
  isSuccess: boolean;
  data?: { dismissed: boolean; items: ChecklistItemState[] };
} = { isSuccess: false };

const mockMutate = vi.fn();

// --- Mocks ---

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    dashboard: {
      getSetupChecklist: { query: vi.fn() },
      dismissSetupChecklist: { mutate: vi.fn() },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  useQueryClient: () => ({
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    cancelQueries: vi.fn().mockResolvedValue(undefined),
    invalidateQueries: vi.fn().mockResolvedValue(undefined),
  }),
  createQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    return mockChecklistState;
  },
  createMutation: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    return {
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    };
  },
}));

// --- Helpers ---

const ALL_ITEM_IDS = [
  "invite",
  "branding",
  "greetings",
  "sms",
  "presets",
  "kb",
  "queues",
  "retention",
];

function checklistItems(completeIds: string[] = []): ChecklistItemState[] {
  return ALL_ITEM_IDS.map((id) => ({
    id,
    complete: completeIds.includes(id),
  }));
}

const CardModule = await import("./GettingStartedCard.svelte");

function renderCard() {
  return render(CardModule.default, {
    props: { expanded: true, ontoggle: vi.fn(), onnavigate: mockNavigate },
  });
}

beforeEach(() => {
  mockNavigate.mockClear();
  mockMutate.mockClear();
  mockChecklistState = { isSuccess: false };
});

afterEach(cleanup);

// --- Tests ---

describe("GettingStartedCard", () => {
  it("renders a row per checklist item when setup is incomplete", () => {
    mockChecklistState = {
      isSuccess: true,
      data: { dismissed: false, items: checklistItems() },
    };
    renderCard();

    expect(screen.getByText("Invite team members")).toBeTruthy();
    expect(screen.getByText("Getting Started")).toBeTruthy();
  });

  it("renders nothing while the checklist query is pending", () => {
    mockChecklistState = { isSuccess: false };
    const { container } = renderCard();
    expect(container.querySelector(".collapsible-section")).toBeNull();
  });

  it("renders nothing when the checklist is dismissed", () => {
    mockChecklistState = {
      isSuccess: true,
      data: { dismissed: true, items: [] },
    };
    const { container } = renderCard();
    expect(container.querySelector(".collapsible-section")).toBeNull();
  });

  it("emits onnavigate with /library when the knowledge-base item is tapped", async () => {
    mockChecklistState = {
      isSuccess: true,
      data: { dismissed: false, items: checklistItems() },
    };
    renderCard();

    const kbRow = screen.getByText(/articles/);
    await fireEvent.click(kbRow);

    expect(mockNavigate).toHaveBeenCalledWith("/library");
  });

  it("shows setup progress as done of total", () => {
    mockChecklistState = {
      isSuccess: true,
      data: {
        dismissed: false,
        items: checklistItems(["invite", "branding"]),
      },
    };
    renderCard();

    expect(screen.getByText("2 of 8 complete")).toBeTruthy();
  });

  it("fires the dismiss mutation from the header control", async () => {
    mockChecklistState = {
      isSuccess: true,
      data: { dismissed: false, items: checklistItems() },
    };
    renderCard();

    const dismissBtn = screen.getByRole("button", { name: /dismiss/i });
    await fireEvent.click(dismissBtn);

    expect(mockMutate).toHaveBeenCalled();
  });
});
