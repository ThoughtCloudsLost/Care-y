// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

const { mockListForms, mockSetActive, mockToastShow } = vi.hoisted(() => ({
  mockListForms: vi.fn(),
  mockSetActive: vi.fn().mockResolvedValue({ ok: true }),
  mockToastShow: vi.fn(),
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  intake_forms_title: () => "Intake Forms",
  intake_forms_empty: () => "No forms yet.",
  intake_forms_create: () => "Create new form",
  intake_forms_field_count: ({ count }: { count: string }) => `${count} fields`,
  intake_forms_active: () => "Active",
  intake_forms_inactive: () => "Inactive",
  error_generic: () => "Something went wrong",
}));

vi.mock("$lib/terminology/with-terms.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  withTerms: () => ({}),
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  trpc: {
    intakeForms: {
      list: { query: mockListForms },
      setActive: { mutate: mockSetActive },
    },
  },
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  requireRouter: (router: unknown) => router,
}));

vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  toastStore: { show: mockToastShow },
}));

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  createQuery: () => ({
    isLoading: false,
    isError: false,
    error: null,
    data: [
      {
        id: "form-1",
        name: "Main Intake",
        isActive: true,
        fieldCount: 5,
        slug: "main-intake",
        isDefault: true,
        destinationQueueId: "queue-1",
      },
      {
        id: "form-2",
        name: "Crisis",
        isActive: false,
        fieldCount: 3,
        slug: null,
        isDefault: false,
        destinationQueueId: null,
      },
    ],
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

import IntakeFormsSection from "./IntakeFormsSection.svelte";

describe("IntakeFormsSection", () => {
  beforeEach(() => {
    mockListForms.mockResolvedValue({
      forms: [
        {
          id: "form-1",
          name: "Main Intake",
          isActive: true,
          fieldCount: 5,
          slug: "main-intake",
          isDefault: true,
          destinationQueueId: "queue-1",
        },
      ],
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders form list items", () => {
    render(IntakeFormsSection, {
      props: { onedit: vi.fn(), oncreate: vi.fn() },
    });

    expect(screen.getByText("Main Intake")).toBeTruthy();
  });

  it("renders create button", () => {
    render(IntakeFormsSection, {
      props: { onedit: vi.fn(), oncreate: vi.fn() },
    });

    expect(screen.getByText("Create new form")).toBeTruthy();
  });

  it("shows field count in subtitle", () => {
    render(IntakeFormsSection, {
      props: { onedit: vi.fn(), oncreate: vi.fn() },
    });

    expect(screen.getByText("5 fields")).toBeTruthy();
  });
});
