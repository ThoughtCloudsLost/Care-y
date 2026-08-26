// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

const {
  mockListForms,
  mockSetActive,
  mockToastShow,
  mockGetForm,
  mockPermissions,
} = vi.hoisted(() => ({
  mockListForms: vi.fn(),
  mockSetActive: vi.fn().mockResolvedValue({ ok: true }),
  mockToastShow: vi.fn(),
  mockGetForm: vi.fn(),
  mockPermissions: new Set<string>(),
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  intake_forms_title: () => "Intake Forms",
  intake_forms_empty: () => "No forms yet.",
  intake_forms_create: () => "Create new form",
  intake_forms_field_count: ({ count }: { count: string }) => `${count} fields`,
  intake_forms_active: () => "Active",
  intake_forms_inactive: () => "Inactive",
  intake_forms_duplicate_label: () => "Duplicate form",
  intake_forms_duplicate_suffix: () => "(copy)",
  intake_forms_duplicated: () => "Form duplicated",
  intake_responses_view_label: () => "View responses",
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
      get: { query: mockGetForm },
      save: { mutate: vi.fn().mockResolvedValue({ formId: "dup-id" }) },
      getWebIntakeEnabled: {
        query: vi.fn().mockResolvedValue({ enabled: true }),
      },
      setWebIntakeEnabled: { mutate: vi.fn().mockResolvedValue({ ok: true }) },
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

vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  toastStore: { show: mockToastShow },
}));

vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  announceToLiveRegion: vi.fn(),
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  haptic: vi.fn(),
}));

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getOrgKeyManager: () => ({
    getPublicKey: () => new Uint8Array(32),
    isLoaded: true,
  }),
  getOrgDecryptCache: () => ({
    decrypt: (_key: string, _value: string) => "Decrypted",
  }),
  getCurrentPermissions: () => () => mockPermissions,
}));

vi.mock("$lib/portal/intake-form-crypto.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  decryptFieldContent: () => ({
    label: { en: "Field" },
    config: { type: "text" },
  }),
  encryptFieldContent: () => ({
    encryptedLabel: "enc-label",
    encryptedConfig: "enc-config",
  }),
  decryptFormMeta: () => ({}),
  encryptFormMeta: () => "enc-meta",
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
    mockPermissions.clear();
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
    render(IntakeFormsSection);

    expect(screen.getByText("Main Intake")).toBeTruthy();
  });

  it("renders the create link to the editor page", () => {
    render(IntakeFormsSection);

    const create = screen.getByText("Create new form");
    expect(create.closest("a")?.getAttribute("href")).toBe("/admin/forms");
  });

  it("links each form row to its editor page", () => {
    render(IntakeFormsSection);

    const row = screen.getByText("Main Intake").closest("a");
    expect(row?.getAttribute("href")).toBe("/admin/forms?id=form-1");
  });

  it("shows field count in the row subtitle", () => {
    render(IntakeFormsSection);

    expect(screen.getByText(/5 fields/)).toBeTruthy();
  });

  it("renders a duplicate button for each form row", () => {
    render(IntakeFormsSection);

    const dupButtons = screen.getAllByLabelText("Duplicate form");
    // At least one per form in the list
    expect(dupButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("hides the View responses link without VIEW_INTAKE_RESPONSES", () => {
    render(IntakeFormsSection);

    expect(screen.queryByLabelText("View responses")).toBeNull();
  });

  it("shows the View responses link when VIEW_INTAKE_RESPONSES is held", () => {
    mockPermissions.add("view_intake_responses");
    render(IntakeFormsSection);

    const links = screen.getAllByLabelText("View responses");
    expect(links).toHaveLength(2);
    expect(links[0]?.closest("a")?.getAttribute("href")).toBe(
      "/admin/forms/responses?id=form-1",
    );
    expect(links[1]?.closest("a")?.getAttribute("href")).toBe(
      "/admin/forms/responses?id=form-2",
    );
  });
});
