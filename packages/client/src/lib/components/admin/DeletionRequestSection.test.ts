// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  within,
} from "@testing-library/svelte";

const {
  ORG_SLUG,
  mockStatusQuery,
  mockRequest,
  mockCancel,
  mockInvalidateQueries,
} = vi.hoisted(() => ({
  // Hoisted with the mocks: the org-slug factory reads it at import time.
  ORG_SLUG: "test-org",
  mockStatusQuery: vi.fn(),
  mockRequest: vi.fn(),
  mockCancel: vi.fn(),
  mockInvalidateQueries: vi.fn(),
}));

interface StatusView {
  id: string;
  status: "pending" | "cancelled" | "processing" | "done";
  requestedAt: string;
  coolingOffUntil: string;
  cancellable: boolean;
}

// undefined while loading; null when the org has no live request.
let mockStatus: StatusView | null | undefined;
let mockIsError: boolean;
let mockIsPending: boolean;
let lastQueryOpts: Record<string, unknown> | undefined;

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesNS>()),
  org_deletion_description: ({ days }: { days: number }) =>
    `Deletion begins after ${String(days)} days.`,
  org_deletion_confirm_label: () => "Organization address",
  org_deletion_confirm_hint: ({ slug }: { slug: string }) =>
    `Type ${slug} to confirm.`,
  org_deletion_request_button: () => "Request deletion",
  org_deletion_request_title: () => "Delete this organization?",
  org_deletion_request_body: ({ days }: { days: number }) =>
    `Erased after ${String(days)} days.`,
  org_deletion_requested: () => "Deletion requested",
  org_deletion_pending: ({ date }: { date: string }) =>
    `Deleted after ${date}.`,
  org_deletion_pending_hint: () => "An administrator can stop it.",
  org_deletion_cancel_button: () => "Stop deletion",
  org_deletion_cancel_title: () => "Stop the deletion?",
  org_deletion_cancel_body: ({ days }: { days: number }) =>
    `New ${String(days)}-day wait.`,
  org_deletion_cancelled: () => "Deletion stopped",
  org_deletion_processing: () => "Being deleted.",
  org_deletion_done: () => "Has been deleted.",
  error_deletion_slug_mismatch: () => "The confirmation does not match.",
  common_cancel: () => "Cancel",
  error_generic: () => "Something went wrong",
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    orgDeletion: {
      status: { query: mockStatusQuery },
      request: { mutate: mockRequest },
      cancel: { mutate: mockCancel },
    },
  },
}));

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryNS>()),
  createQuery: (optsFn: () => Record<string, unknown>) => {
    lastQueryOpts = optsFn();
    return {
      get isLoading() {
        return mockStatus === undefined && !mockIsError;
      },
      get isError() {
        return mockIsError;
      },
      error: null,
      get data() {
        return mockStatus;
      },
      refetch: vi.fn(),
    };
  },
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as (() => void) | undefined;
    const onError = opts.onError as ((err: unknown) => void) | undefined;
    return {
      get isPending() {
        return mockIsPending;
      },
      mutate(input: unknown) {
        mutationFn(input).then(
          () => onSuccess?.(),
          (err: unknown) => onError?.(err),
        );
      },
    };
  },
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

vi.mock("$lib/utils/org-slug.js", async (importOriginal) => ({
  ...(await importOriginal<typeof OrgSlugNS>()),
  getOrgSlug: vi.fn(() => ORG_SLUG),
  DEV_ORG_SLUG: ORG_SLUG,
}));

vi.mock("$lib/utils/time.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TimeNS>()),
  formatShortDate: (iso: string) => `date(${iso})`,
}));

vi.mock(
  "$lib/stores/toast.svelte.js",
  async () =>
    (await import("$mocks/toast.js")).toastMock() satisfies typeof ToastNS,
);

vi.mock("$lib/utils/haptic.js", async (importOriginal) =>
  (await import("$mocks/haptic.js")).hapticMock(
    await importOriginal<typeof HapticNS>(),
  ),
);

vi.mock("$lib/utils/announce.js", async (importOriginal) =>
  (await import("$mocks/announce.js")).announceMock(
    await importOriginal<typeof AnnounceNS>(),
  ),
);

vi.mock(
  "$lib/shell/ShellDialog.svelte",
  async () =>
    ({
      default: (await import("./test-helpers/StubShellDialog.svelte"))
        .default as unknown as (typeof ShellDialogNS)["default"],
    }) satisfies typeof ShellDialogNS,
);

vi.mock(
  "$lib/components/QueryError.svelte",
  async () =>
    ({
      default: (
        await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
      ).default as unknown as (typeof QueryErrorNS)["default"],
    }) satisfies typeof QueryErrorNS,
);

import DeletionRequestSection from "./DeletionRequestSection.svelte";
import { orgDeletionKeys } from "$lib/query/keys.js";
import { mockToastShow } from "$mocks/toast.js";
import { mockHaptic } from "$mocks/haptic.js";
import { mockAnnounce } from "$mocks/announce.js";
import type * as AnnounceNS from "$lib/utils/announce.js";
import type * as HapticNS from "$lib/utils/haptic.js";
import type * as ToastNS from "$lib/stores/toast.svelte.js";
import type * as SvelteQueryNS from "@tanstack/svelte-query";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as MessagesNS from "$lib/paraglide/messages.js";
import type * as OrgSlugNS from "$lib/utils/org-slug.js";
import type * as TimeNS from "$lib/utils/time.js";
import type * as QueryErrorNS from "$lib/components/QueryError.svelte";
import type * as ShellDialogNS from "$lib/shell/ShellDialog.svelte";

const COOLING_OFF_UNTIL = "2026-11-01T04:00:00.000Z";

function pendingView(cancellable: boolean): StatusView {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    status: "pending",
    requestedAt: "2026-10-02T04:00:00.000Z",
    coolingOffUntil: COOLING_OFF_UNTIL,
    cancellable,
  };
}

function requestButton(): HTMLButtonElement {
  return screen.getByRole<HTMLButtonElement>("button", {
    name: "Request deletion",
  });
}

async function typeSlug(value: string): Promise<void> {
  const input = screen.getByLabelText<HTMLInputElement>("Organization address");
  await fireEvent.input(input, { target: { value } });
}

describe("DeletionRequestSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStatus = undefined;
    mockIsError = false;
    mockIsPending = false;
    lastQueryOpts = undefined;
    mockRequest.mockResolvedValue(pendingView(true));
    mockCancel.mockResolvedValue({
      ...pendingView(false),
      status: "cancelled",
    });
  });

  afterEach(cleanup);

  it("reads the request from orgDeletion.status under its own key", async () => {
    mockStatus = null;
    render(DeletionRequestSection);

    expect(lastQueryOpts?.queryKey).toEqual(orgDeletionKeys.status());
    const queryFn = lastQueryOpts?.queryFn as () => Promise<unknown>;
    await queryFn();
    expect(mockStatusQuery).toHaveBeenCalledOnce();
  });

  it("renders a skeleton status line while loading", () => {
    mockStatus = undefined;
    const { container } = render(DeletionRequestSection);

    expect(container.querySelector("[data-skeleton]")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  describe("no request", () => {
    beforeEach(() => {
      mockStatus = null;
    });

    it("shows the explanation and the slug to type", () => {
      render(DeletionRequestSection);

      expect(screen.getByText("Deletion begins after 30 days.")).toBeTruthy();
      expect(screen.getByText(`Type ${ORG_SLUG} to confirm.`)).toBeTruthy();
    });

    it("keeps the request button disabled until the typed slug matches", async () => {
      render(DeletionRequestSection);

      expect(requestButton().disabled).toBe(true);

      await typeSlug("test-or");
      expect(requestButton().disabled).toBe(true);

      await typeSlug("Test-org");
      expect(requestButton().disabled).toBe(true);

      await typeSlug(ORG_SLUG);
      expect(requestButton().disabled).toBe(false);
    });

    it("keeps the request button disabled while the mutation is pending", async () => {
      mockIsPending = true;
      render(DeletionRequestSection);

      await typeSlug(ORG_SLUG);
      expect(requestButton().disabled).toBe(true);
    });

    it("asks for confirmation before requesting", async () => {
      render(DeletionRequestSection);

      await typeSlug(ORG_SLUG);
      await fireEvent.click(requestButton());

      const dialog = screen.getByTestId("stub-dialog");
      expect(dialog.getAttribute("data-title")).toBe(
        "Delete this organization?",
      );
      expect(within(dialog).getByText("Erased after 30 days.")).toBeTruthy();
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it("calls orgDeletion.request.mutate once with the typed slug on confirm", async () => {
      render(DeletionRequestSection);

      await typeSlug(ORG_SLUG);
      await fireEvent.click(requestButton());
      const dialog = screen.getByTestId("stub-dialog");
      await fireEvent.click(within(dialog).getByText("Request deletion"));

      expect(mockRequest).toHaveBeenCalledOnce();
      expect(mockRequest).toHaveBeenCalledWith({ confirmSlug: ORG_SLUG });
      await vi.waitFor(() => {
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
          queryKey: orgDeletionKeys.status(),
        });
      });
      expect(mockHaptic).toHaveBeenCalledOnce();
      expect(mockToastShow).toHaveBeenCalledWith("Deletion requested");
      expect(mockAnnounce).toHaveBeenCalledWith("polite", "Deletion requested");
    });

    it("does not request when the dialog is cancelled", async () => {
      render(DeletionRequestSection);

      await typeSlug(ORG_SLUG);
      await fireEvent.click(requestButton());
      const dialog = screen.getByTestId("stub-dialog");
      await fireEvent.click(within(dialog).getByText("Cancel"));

      expect(mockRequest).not.toHaveBeenCalled();
      expect(screen.queryByTestId("stub-dialog")).toBeNull();
    });

    it("shows the mapped error and no haptic when the request fails", async () => {
      mockRequest.mockRejectedValue(new Error("DELETION_SLUG_MISMATCH"));
      render(DeletionRequestSection);

      await typeSlug(ORG_SLUG);
      await fireEvent.click(requestButton());
      const dialog = screen.getByTestId("stub-dialog");
      await fireEvent.click(within(dialog).getByText("Request deletion"));

      await vi.waitFor(() => {
        expect(mockToastShow).toHaveBeenCalledWith(
          "The confirmation does not match.",
        );
      });
      expect(mockHaptic).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });
  });

  describe("pending request", () => {
    it("shows the cooling-off date and a cancel control while cancellable", () => {
      mockStatus = pendingView(true);
      render(DeletionRequestSection);

      expect(
        screen.getByText(`Deleted after date(${COOLING_OFF_UNTIL}).`),
      ).toBeTruthy();
      expect(
        screen.getByRole("button", { name: "Stop deletion" }),
      ).toBeTruthy();
      expect(screen.queryByLabelText("Organization address")).toBeNull();
    });

    it("hides the cancel control when the request is not cancellable", () => {
      mockStatus = pendingView(false);
      render(DeletionRequestSection);

      expect(
        screen.getByText(`Deleted after date(${COOLING_OFF_UNTIL}).`),
      ).toBeTruthy();
      expect(screen.queryByRole("button")).toBeNull();
    });

    it("disables the cancel control while the mutation is pending", () => {
      mockStatus = pendingView(true);
      mockIsPending = true;
      render(DeletionRequestSection);

      expect(
        screen.getByRole<HTMLButtonElement>("button", {
          name: "Stop deletion",
        }).disabled,
      ).toBe(true);
    });

    it("cancels through a confirmation dialog", async () => {
      mockStatus = pendingView(true);
      render(DeletionRequestSection);

      await fireEvent.click(
        screen.getByRole("button", { name: "Stop deletion" }),
      );
      const dialog = screen.getByTestId("stub-dialog");
      expect(dialog.getAttribute("data-title")).toBe("Stop the deletion?");
      expect(mockCancel).not.toHaveBeenCalled();

      await fireEvent.click(within(dialog).getByText("Stop deletion"));

      expect(mockCancel).toHaveBeenCalledOnce();
      await vi.waitFor(() => {
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
          queryKey: orgDeletionKeys.status(),
        });
      });
      expect(mockHaptic).toHaveBeenCalledOnce();
      expect(mockToastShow).toHaveBeenCalledWith("Deletion stopped");
      expect(mockAnnounce).toHaveBeenCalledWith("polite", "Deletion stopped");
    });
  });

  describe("processing or done", () => {
    it("shows a read-only line and no controls while processing", () => {
      mockStatus = { ...pendingView(false), status: "processing" };
      render(DeletionRequestSection);

      expect(screen.getByText("Being deleted.")).toBeTruthy();
      expect(screen.queryByRole("button")).toBeNull();
      expect(screen.queryByLabelText("Organization address")).toBeNull();
    });

    it("shows a read-only line and no controls when done", () => {
      mockStatus = { ...pendingView(false), status: "done" };
      render(DeletionRequestSection);

      expect(screen.getByText("Has been deleted.")).toBeTruthy();
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  it("renders the query error when the status fetch fails", () => {
    mockIsError = true;
    render(DeletionRequestSection);

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByLabelText("Organization address")).toBeNull();
  });
});
