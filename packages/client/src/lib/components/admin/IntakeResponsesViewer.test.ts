// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

const {
  mockListResponses,
  mockBackfillWraps,
  mockGetForm,
  mockDecryptIntakeResponse,
  mockMintBackfillWraps,
  mockToastShow,
  mockLogExport,
  mockTriggerBlobDownload,
} = vi.hoisted(() => ({
  mockListResponses: vi.fn(),
  mockBackfillWraps: vi.fn().mockResolvedValue({ inserted: 0 }),
  mockGetForm: vi.fn(),
  mockDecryptIntakeResponse: vi.fn(),
  mockMintBackfillWraps: vi.fn(),
  mockToastShow: vi.fn(),
  mockLogExport: vi.fn().mockResolvedValue({ ok: true }),
  mockTriggerBlobDownload: vi.fn(),
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  intake_responses_title: () => "Responses",
  intake_responses_empty: () => "No responses",
  intake_responses_default_form_note: () => "Custom forms only.",
  intake_responses_loading: () => "Decrypting...",
  intake_responses_submitted_at: ({ date }: { date: string }) =>
    `Submitted ${date}`,
  intake_responses_key_not_held: () => "Key not held",
  intake_responses_key_not_held_hint: () => "Another key holder can unlock it.",
  intake_responses_decrypt_failed: () => "Could not decrypt",
  intake_responses_decrypt_failed_hint: () => "Blob may be malformed.",
  intake_responses_unknown_field: () => "Unknown field",
  intake_responses_load_more: () => "Load more",
  intake_responses_count: ({ count }: { count: string }) =>
    `${count} responses`,
  intake_responses_backfill_failed: () => "Backfill failed",
  intake_responses_export_csv: () => "Export CSV",
  intake_responses_export_confirm_title: () => "Export decrypted responses?",
  intake_responses_export_confirm_body: ({
    exportedCount,
  }: {
    exportedCount: string;
  }) => `${exportedCount} responses will be exported.`,
  intake_responses_export_confirm_skipped: ({
    skippedCount,
  }: {
    skippedCount: string;
  }) => `${skippedCount} could not be decrypted.`,
  intake_responses_export_confirm_action: () => "Export",
  intake_responses_export_no_rows: () => "No decrypted responses to export.",
  intake_responses_csv_submitted_header: () => "Submitted",
  common_cancel: () => "Cancel",
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
      get: { query: mockGetForm },
      listResponses: { query: mockListResponses },
      backfillWraps: { mutate: mockBackfillWraps },
      logExport: { mutate: mockLogExport },
    },
  },
}));

vi.mock("$lib/paraglide/runtime.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getLocale: () => "en",
}));

vi.mock(
  "$lib/components/shared/attachment-download.js",
  async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    triggerBlobDownload: mockTriggerBlobDownload,
  }),
);

vi.mock("$lib/shell/ShellDialog.svelte", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  default: (await import("./test-helpers/StubShellDialog.svelte")).default,
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  requireRouter: (router: unknown) => router,
}));

vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  toastStore: { show: mockToastShow },
}));

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getOrgKeyManager: () => ({
    getPublicKey: () => new Uint8Array(32),
    isLoaded: true,
  }),
  getCryptoBridge: () => ({
    decryptIntakeResponse: mockDecryptIntakeResponse,
    mintBackfillWraps: mockMintBackfillWraps,
  }),
}));

vi.mock("$lib/portal/intake-form-crypto.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  decryptFieldContent: () => ({
    label: { en: "Field Label" },
    config: { type: "text" },
  }),
}));

// TanStack Query mock: form data always loaded; responses driven by test
let responsesData: {
  rows: {
    ticketId: string;
    submittedAt: string;
    encryptedResponse: string;
    callerKeyWrap: {
      volunteerId: string;
      ephemeralPoint: string;
      nonce: string;
      wrappedKey: string;
    } | null;
    orgSealWrap: { wrappedTk: string } | null;
    missingPrincipals: { volunteerId: string; volPublic: string }[];
  }[];
  nextCursor: string | null;
  total: number;
} | null = null;

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  createQuery: (optsFn: () => { queryKey: readonly unknown[] }) => {
    const opts = optsFn();
    const key = opts.queryKey;
    // Form detail query
    if (Array.isArray(key) && key[1] === "detail") {
      return {
        isLoading: false,
        isError: false,
        error: null,
        data: {
          name: "Test Form",
          fields: [
            {
              fieldKey: "fk-1",
              encryptedLabel: "enc-lbl",
              encryptedConfig: "enc-cfg",
              fieldType: "text",
            },
          ],
        },
      };
    }
    // Responses query
    return {
      get isLoading() {
        return responsesData === null;
      },
      isError: false,
      isFetching: false,
      error: null,
      get data() {
        return responsesData;
      },
      refetch: vi.fn(),
    };
  },
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onError = opts.onError as ((err: unknown) => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      mutate(input: unknown) {
        mutationFn(input).then(
          () => undefined,
          (err: unknown) => onError?.(err),
        );
      },
    };
  },
}));

import IntakeResponsesViewer from "./IntakeResponsesViewer.svelte";

describe("IntakeResponsesViewer", () => {
  beforeEach(() => {
    responsesData = null;
    mockDecryptIntakeResponse.mockReset();
    mockMintBackfillWraps.mockReset();
    mockBackfillWraps.mockReset();
    mockLogExport.mockReset().mockResolvedValue({ ok: true });
    mockTriggerBlobDownload.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows loading state when data has not arrived", () => {
    responsesData = null;
    render(IntakeResponsesViewer, {
      props: { formId: "form-1" },
    });
    expect(screen.getByText("Decrypting...")).toBeTruthy();
  });

  it("shows empty state when no responses exist", async () => {
    responsesData = { rows: [], nextCursor: null, total: 0 };
    render(IntakeResponsesViewer, {
      props: { formId: "form-1" },
    });
    // Wait for the effect to run
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByText("No responses")).toBeTruthy();
  });

  it("shows key-not-held state when no wrap or seal is available", async () => {
    responsesData = {
      rows: [
        {
          ticketId: "t-1",
          submittedAt: "2026-08-01T10:00:00Z",
          encryptedResponse: "abc",
          callerKeyWrap: null,
          orgSealWrap: null,
          missingPrincipals: [],
        },
      ],
      nextCursor: null,
      total: 1,
    };

    render(IntakeResponsesViewer, {
      props: { formId: "form-1" },
    });
    await new Promise((r) => setTimeout(r, 50));

    expect(screen.getByText("Key not held")).toBeTruthy();
    expect(screen.getByText("Another key holder can unlock it.")).toBeTruthy();
  });

  it("shows decrypt-failed state when decryption throws", async () => {
    mockDecryptIntakeResponse.mockRejectedValue(new Error("bad blob"));

    responsesData = {
      rows: [
        {
          ticketId: "t-2",
          submittedAt: "2026-08-01T11:00:00Z",
          encryptedResponse: "xyz",
          callerKeyWrap: {
            volunteerId: "v-1",
            ephemeralPoint: "ep",
            nonce: "nc",
            wrappedKey: "wk",
          },
          orgSealWrap: null,
          missingPrincipals: [],
        },
      ],
      nextCursor: null,
      total: 1,
    };

    render(IntakeResponsesViewer, {
      props: { formId: "form-1" },
    });
    await new Promise((r) => setTimeout(r, 100));

    expect(screen.getByText("Could not decrypt")).toBeTruthy();
  });

  it("renders decrypted answers with field labels", async () => {
    mockDecryptIntakeResponse.mockResolvedValue(
      JSON.stringify([{ fieldKey: "fk-1", value: "answer text" }]),
    );

    responsesData = {
      rows: [
        {
          ticketId: "t-3",
          submittedAt: "2026-08-01T12:00:00Z",
          encryptedResponse: "data",
          callerKeyWrap: {
            volunteerId: "v-1",
            ephemeralPoint: "ep",
            nonce: "nc",
            wrappedKey: "wk",
          },
          orgSealWrap: null,
          missingPrincipals: [],
        },
      ],
      nextCursor: null,
      total: 1,
    };

    render(IntakeResponsesViewer, {
      props: { formId: "form-1" },
    });
    await new Promise((r) => setTimeout(r, 100));

    expect(screen.getByText("Field Label")).toBeTruthy();
    expect(screen.getByText("answer text")).toBeTruthy();
  });

  it("shows unknown-field fallback for answers with stale fieldKeys", async () => {
    mockDecryptIntakeResponse.mockResolvedValue(
      JSON.stringify([{ fieldKey: "deleted-field", value: "stale answer" }]),
    );

    responsesData = {
      rows: [
        {
          ticketId: "t-4",
          submittedAt: "2026-08-01T13:00:00Z",
          encryptedResponse: "data",
          callerKeyWrap: {
            volunteerId: "v-1",
            ephemeralPoint: "ep",
            nonce: "nc",
            wrappedKey: "wk",
          },
          orgSealWrap: null,
          missingPrincipals: [],
        },
      ],
      nextCursor: null,
      total: 1,
    };

    render(IntakeResponsesViewer, {
      props: { formId: "form-1" },
    });
    await new Promise((r) => setTimeout(r, 100));

    expect(screen.getByText("Unknown field")).toBeTruthy();
    expect(screen.getByText("stale answer")).toBeTruthy();
  });

  it("fires backfill once per ticket, not on re-render", async () => {
    mockDecryptIntakeResponse.mockResolvedValue(
      JSON.stringify([{ fieldKey: "fk-1", value: "val" }]),
    );
    mockMintBackfillWraps.mockResolvedValue([
      {
        volunteerId: "vol-2",
        ephemeralPoint: "ep2",
        nonce: "nc2",
        wrappedKey: "wk2",
      },
    ]);

    responsesData = {
      rows: [
        {
          ticketId: "t-5",
          submittedAt: "2026-08-01T14:00:00Z",
          encryptedResponse: "data",
          callerKeyWrap: {
            volunteerId: "v-1",
            ephemeralPoint: "ep",
            nonce: "nc",
            wrappedKey: "wk",
          },
          orgSealWrap: null,
          missingPrincipals: [{ volunteerId: "vol-2", volPublic: "pub2" }],
        },
      ],
      nextCursor: null,
      total: 1,
    };

    render(IntakeResponsesViewer, {
      props: { formId: "form-1" },
    });
    await new Promise((r) => setTimeout(r, 150));

    // mintBackfillWraps should be called exactly once
    expect(mockMintBackfillWraps).toHaveBeenCalledTimes(1);
    expect(mockMintBackfillWraps).toHaveBeenCalledWith("t-5", [
      { volunteerId: "vol-2", volPublic: "pub2" },
    ]);
  });

  it("shows the default-form note text", () => {
    responsesData = { rows: [], nextCursor: null, total: 0 };
    render(IntakeResponsesViewer, {
      props: { formId: "form-1" },
    });
    expect(screen.getByText("Custom forms only.")).toBeTruthy();
  });

  // ── CSV export tests ────────────────────────────────────────────

  it("shows export button when entries exist", async () => {
    mockDecryptIntakeResponse.mockResolvedValue(
      JSON.stringify([{ fieldKey: "fk-1", value: "val" }]),
    );

    responsesData = {
      rows: [
        {
          ticketId: "t-export-1",
          submittedAt: "2026-08-25T10:00:00Z",
          encryptedResponse: "data",
          callerKeyWrap: {
            volunteerId: "v-1",
            ephemeralPoint: "ep",
            nonce: "nc",
            wrappedKey: "wk",
          },
          orgSealWrap: null,
          missingPrincipals: [],
        },
      ],
      nextCursor: null,
      total: 1,
    };

    render(IntakeResponsesViewer, {
      props: { formId: "form-1" },
    });
    await new Promise((r) => setTimeout(r, 100));

    const btn = screen.getByTestId("export-csv-btn");
    expect(btn).toBeTruthy();
    expect(btn.textContent).toContain("Export CSV");
  });

  it("disables export button while rows are pending", async () => {
    // Keep decryption hanging
    mockDecryptIntakeResponse.mockReturnValue(new Promise(() => undefined));

    responsesData = {
      rows: [
        {
          ticketId: "t-pending-export",
          submittedAt: "2026-08-25T10:00:00Z",
          encryptedResponse: "data",
          callerKeyWrap: {
            volunteerId: "v-1",
            ephemeralPoint: "ep",
            nonce: "nc",
            wrappedKey: "wk",
          },
          orgSealWrap: null,
          missingPrincipals: [],
        },
      ],
      nextCursor: null,
      total: 1,
    };

    render(IntakeResponsesViewer, {
      props: { formId: "form-1" },
    });
    await new Promise((r) => setTimeout(r, 50));

    const btn = screen.getByTestId("export-csv-btn");
    expect(btn.hasAttribute("disabled")).toBe(true);
  });

  it("does not show export button when no entries", async () => {
    responsesData = { rows: [], nextCursor: null, total: 0 };

    render(IntakeResponsesViewer, {
      props: { formId: "form-1" },
    });
    await new Promise((r) => setTimeout(r, 50));

    expect(screen.queryByTestId("export-csv-btn")).toBeNull();
  });
});
