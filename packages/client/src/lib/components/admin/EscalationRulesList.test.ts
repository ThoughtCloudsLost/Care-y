// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

// Type-only imports for mock surface tracking (erased at compile time)
import type * as ParaMessages from "$lib/paraglide/messages.js";
import type * as WithTermsMod from "$lib/terminology/with-terms.js";
import type * as TrpcMod from "$lib/trpc/index.js";
import type * as KeysMod from "$lib/query/keys.js";
import type * as ToastMod from "$lib/stores/toast.svelte.js";
import type * as HapticMod from "$lib/utils/haptic.js";
import type * as AnnounceMod from "$lib/utils/announce.js";
import type * as ErrorsMod from "$lib/errors.js";
import type * as ShellCtxMod from "$lib/shell/context.js";
import type * as TanstackQueryMod from "@tanstack/svelte-query";

const {
  mockListQuery,
  mockCreateMutate,
  mockUpdateMutate,
  mockRemoveMutate,
  mockToastShow,
  mockHaptic,
  mockAnnounce,
  mockInvalidateQueries,
} = vi.hoisted(() => ({
  mockListQuery: vi.fn().mockResolvedValue({
    rules: [
      {
        id: "rule-1",
        queueId: "q-1",
        ruleType: "unassigned_duration",
        thresholdMinutes: 2880,
        action: "notify_managers",
        isActive: true,
        createdAt: "2026-01-01T00:00:00Z",
      },
      {
        id: "rule-2",
        queueId: "q-1",
        ruleType: "inactive_duration",
        thresholdMinutes: 720,
        action: "notify_queue_watchers",
        isActive: false,
        createdAt: "2026-01-02T00:00:00Z",
      },
    ],
  }),
  mockCreateMutate: vi.fn().mockResolvedValue({ rule: { id: "rule-3" } }),
  mockUpdateMutate: vi.fn().mockResolvedValue({ rule: { id: "rule-1" } }),
  mockRemoveMutate: vi.fn().mockResolvedValue({ deleted: true }),
  mockToastShow: vi.fn(),
  mockHaptic: vi.fn(),
  mockAnnounce: vi.fn(),
  mockInvalidateQueries: vi.fn(),
}));

// vi.mock required: paraglide messages are compile-generated, no on-disk source in test env
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaMessages>()),
  escalation_section_title: () => "Escalation alerts",
  escalation_explainer: () =>
    "Alerts notify people; the priority ladder above changes the case itself.",
  escalation_empty: () => "No escalation alerts for this queue yet.",
  escalation_condition_unassigned: () => "Unassigned for",
  escalation_condition_inactive: () => "No activity for",
  escalation_action_notify_managers: () => "Notify managers",
  escalation_action_notify_watchers: () => "Notify queue watchers",
  escalation_threshold_days: ({ count }: { count: number }) =>
    `${String(count)} days`,
  escalation_threshold_hours: ({ count }: { count: number }) =>
    `${String(count)} hours`,
  escalation_delete_button: () => "Delete",
  escalation_delete_aria: ({ rule }: { rule: string }) =>
    `Delete rule: ${rule}`,
  escalation_add_rule: () => "+ Add rule",
  escalation_add_form_label: () => "Add escalation rule",
  escalation_condition_label: () => "Condition",
  escalation_threshold_label: () => "Threshold",
  escalation_unit_label: () => "Unit",
  escalation_unit_hours: () => "Hours",
  escalation_unit_days: () => "Days",
  escalation_action_label: () => "Action",
  escalation_save_button: () => "Save",
  escalation_rule_created: () => "Rule created",
  escalation_rule_updated: () => "Rule updated",
  escalation_rule_deleted: () => "Rule deleted",
  escalation_threshold_too_low: () => "Threshold too low",
  error_generic: () => "Something went wrong",
  common_cancel: () => "Cancel",
  register_note: () => "Note",
  register_careful: () => "Careful",
  register_warning: () => "Warning",
  register_protected: () => "Protected",
}));

// vi.mock required: withTerms calls getContext which is not available
// outside a live component tree.
vi.mock("$lib/terminology/with-terms.js", async (importOriginal) => ({
  ...(await importOriginal<typeof WithTermsMod>()),
  withTerms: () => ({}),
}));

// vi.mock required: tRPC client creates live HTTP connection on import
vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcMod>()),
  trpc: {
    escalation: {
      list: { query: mockListQuery },
      create: { mutate: mockCreateMutate },
      update: { mutate: mockUpdateMutate },
      remove: { mutate: mockRemoveMutate },
    },
  },
}));

// vi.mock required: TanStack Query hooks need Svelte component context
vi.mock("@tanstack/svelte-query", async (importOriginal) => {
  const original = await importOriginal<typeof TanstackQueryMod>();
  let queryData: unknown = undefined;
  let queryIsLoading = false;
  let queryIsError = false;
  let queryIsSuccess = true;
  const queryError: Error | null = null;

  return {
    ...original,
    createQuery: (optsFn: () => Record<string, unknown>) => {
      const opts = optsFn();
      const queryFn = opts.queryFn as () => Promise<unknown>;

      queryFn()
        .then((data) => {
          queryData = data;
          queryIsLoading = false;
          queryIsSuccess = true;
        })
        .catch(() => {
          queryIsError = true;
          queryIsLoading = false;
        });

      return {
        get data() {
          return queryData;
        },
        get isLoading() {
          return queryIsLoading;
        },
        get isError() {
          return queryIsError;
        },
        get isSuccess() {
          return queryIsSuccess;
        },
        get error() {
          return queryError;
        },
        refetch: vi.fn(),
      };
    },
    createMutation: (optsFn: () => Record<string, unknown>) => {
      const opts = optsFn();
      const mutationFn = opts.mutationFn as (
        input: unknown,
      ) => Promise<unknown>;
      const onSuccess = opts.onSuccess as (() => void) | undefined;
      const onError = opts.onError as (() => void) | undefined;
      return {
        get isPending() {
          return false;
        },
        mutate(input: unknown) {
          mutationFn(input).then(
            () => onSuccess?.(),
            () => onError?.(),
          );
        },
      };
    },
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  };
});

// vi.mock required: query keys module re-exports are consumed via destructured import
vi.mock("$lib/query/keys.js", async (importOriginal) => ({
  ...(await importOriginal<typeof KeysMod>()),
  adminKeys: {
    escalationRules: (queueId: string) => ["admin", "escalationRules", queueId],
  },
}));

// vi.mock required: toast store uses Svelte 5 module-level $state singleton
vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastMod>()),
  toastStore: { show: mockToastShow },
}));

// vi.mock required: haptic uses navigator.vibrate, unavailable in jsdom
vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<typeof HapticMod>()),
  haptic: mockHaptic,
}));

// vi.mock required: announce uses DOM live region API not present in jsdom
vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AnnounceMod>()),
  announceToLiveRegion: mockAnnounce,
}));

// vi.mock required: errors.js imports tRPC types that trigger side effects
vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ErrorsMod>()),
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
}));

// vi.mock required: shell context uses Svelte context API unavailable in test env
vi.mock("$lib/shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellCtxMod>()),
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

import EscalationRulesList from "./EscalationRulesList.svelte";

function renderList(
  overrides: Partial<{
    queueId: string;
    ondeleterule: (ruleId: string, label: string) => void;
  }> = {},
) {
  return render(EscalationRulesList, {
    props: {
      queueId: overrides.queueId ?? "q-1",
      ondeleterule: overrides.ondeleterule ?? vi.fn(),
    },
  });
}

describe("EscalationRulesList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListQuery.mockResolvedValue({
      rules: [
        {
          id: "rule-1",
          queueId: "q-1",
          ruleType: "unassigned_duration",
          thresholdMinutes: 2880,
          action: "notify_managers",
          isActive: true,
          createdAt: "2026-01-01T00:00:00Z",
        },
        {
          id: "rule-2",
          queueId: "q-1",
          ruleType: "inactive_duration",
          thresholdMinutes: 720,
          action: "notify_queue_watchers",
          isActive: false,
          createdAt: "2026-01-02T00:00:00Z",
        },
      ],
    });
  });

  afterEach(cleanup);

  it("renders section title and explainer text", async () => {
    renderList();
    await vi.waitFor(() => {
      expect(screen.getByText("Escalation alerts")).toBeTruthy();
    });
    expect(
      screen.getByText(
        "Alerts notify people; the priority ladder above changes the case itself.",
      ),
    ).toBeTruthy();
  });

  it("renders rules with readable labels", async () => {
    renderList();
    await vi.waitFor(() => {
      expect(screen.getByText("Unassigned for 2 days")).toBeTruthy();
    });
    expect(screen.getByText("No activity for 12 hours")).toBeTruthy();
    expect(screen.getByText("Notify managers")).toBeTruthy();
    expect(screen.getByText("Notify queue watchers")).toBeTruthy();
  });

  it("renders empty state when no rules exist", async () => {
    mockListQuery.mockResolvedValue({ rules: [] });
    renderList();
    await vi.waitFor(() => {
      expect(
        screen.getByText("No escalation alerts for this queue yet."),
      ).toBeTruthy();
    });
  });

  it("shows the add rule button", async () => {
    renderList();
    await vi.waitFor(() => {
      expect(screen.getByText("+ Add rule")).toBeTruthy();
    });
  });

  it("opens add form when add button is clicked", async () => {
    renderList();
    await vi.waitFor(() => {
      expect(screen.getByText("+ Add rule")).toBeTruthy();
    });
    await fireEvent.click(screen.getByText("+ Add rule"));
    expect(screen.getByText("Condition")).toBeTruthy();
    expect(screen.getByText("Threshold")).toBeTruthy();
    expect(screen.getByText("Action")).toBeTruthy();
  });

  it("calls create mutation with correct minutes when saving a 2-day rule", async () => {
    renderList();
    await vi.waitFor(() => {
      expect(screen.getByText("+ Add rule")).toBeTruthy();
    });
    await fireEvent.click(screen.getByText("+ Add rule"));

    // Default values: unassigned_duration, 2, days, notify_managers
    await fireEvent.click(screen.getByText("Save"));

    await vi.waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith({
        queueId: "q-1",
        ruleType: "unassigned_duration",
        thresholdMinutes: 2880,
        action: "notify_managers",
      });
    });
  });

  it("calls update mutation when toggling isActive", async () => {
    renderList();
    await vi.waitFor(() => {
      expect(screen.getByText("Unassigned for 2 days")).toBeTruthy();
    });

    // Konsta Toggle renders as checkbox inputs
    const toggles = document.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    expect(toggles.length).toBeGreaterThanOrEqual(1);

    if (toggles[0]) {
      await fireEvent.click(toggles[0]);
    }

    await vi.waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith({
        ruleId: "rule-1",
        isActive: false,
      });
    });
  });

  it("calls ondeleterule when delete button is clicked", async () => {
    const ondeleterule = vi.fn();
    renderList({ ondeleterule });
    await vi.waitFor(() => {
      expect(screen.getByText("Unassigned for 2 days")).toBeTruthy();
    });

    const deleteButtons = screen.getAllByText("Delete");
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);

    await fireEvent.click(deleteButtons[0]!);
    expect(ondeleterule).toHaveBeenCalledWith(
      "rule-1",
      "Unassigned for 2 days",
    );
  });

  it("cancels add form and resets state", async () => {
    renderList();
    await vi.waitFor(() => {
      expect(screen.getByText("+ Add rule")).toBeTruthy();
    });
    await fireEvent.click(screen.getByText("+ Add rule"));
    expect(screen.getByText("Condition")).toBeTruthy();

    await fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Condition")).toBeNull();
    expect(screen.getByText("+ Add rule")).toBeTruthy();
  });

  it("shows toast when threshold is too low", async () => {
    renderList();
    await vi.waitFor(() => {
      expect(screen.getByText("+ Add rule")).toBeTruthy();
    });
    await fireEvent.click(screen.getByText("+ Add rule"));

    const numberInputs = document.querySelectorAll<HTMLInputElement>(
      'input[type="number"]',
    );
    if (numberInputs[0]) {
      await fireEvent.change(numberInputs[0], { target: { value: "0" } });
    }

    await fireEvent.click(screen.getByText("Save"));

    await vi.waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Threshold too low");
    });
  });
});
