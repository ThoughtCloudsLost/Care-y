import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import type { MockInstance } from "vitest";
import type * as NavigationNS from "$app/navigation";
import type * as AppStateNS from "$app/state";
import { ErrorCode } from "@care-y/shared";
import { trpc } from "./index.js";
import { reverifyStore } from "$lib/stores/reverify.svelte.js";

const { mockGoto, mockPage } = vi.hoisted(() => ({
  mockGoto: vi.fn(),
  mockPage: { url: new URL("http://localhost/dashboard") },
}));

// vi.mock required: $app/navigation is a SvelteKit virtual module with no
// on-disk source. The Vite alias resolves it to a stub; this overrides goto
// so the interceptor's navigation (or its absence) is observable.
vi.mock("$app/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof NavigationNS>()),
  goto: mockGoto,
}));

// vi.mock required: $app/state is a SvelteKit virtual module; the
// password-change redirect reads the current path from page.url.
vi.mock("$app/state", async (importOriginal) => ({
  ...(await importOriginal<typeof AppStateNS>()),
  page: mockPage,
}));

/** One entry of a tRPC batch response that failed. */
function errorEntry(
  message: string,
  code: string,
  httpStatus: number,
): { error: { message: string; code: number; data: object } } {
  return {
    error: { message, code: -32001, data: { code, httpStatus } },
  };
}

/** One entry of a tRPC batch response that succeeded. */
function dataEntry(data: unknown): { result: { data: unknown } } {
  return { result: { data } };
}

function jsonResponse(entries: readonly unknown[]): Response {
  return new Response(JSON.stringify(entries), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

/**
 * Answers each batched tRPC request by procedure path. The path list sits
 * in the URL pathname (`/trpc/a.b,c.d?batch=1`).
 */
function routeFetch(
  handlers: Record<string, () => unknown>,
): MockInstance<typeof fetch> {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const pathPart = url.split("?")[0] ?? "";
    const paths = (pathPart.split("/").pop() ?? "").split(",");
    return jsonResponse(
      paths.map((path) => {
        const handler = handlers[decodeURIComponent(path)];
        if (handler === undefined) {
          return errorEntry("NOT_FOUND", "NOT_FOUND", 404);
        }
        return handler();
      }),
    );
  });
}

const twofaRequired = (): unknown =>
  errorEntry(ErrorCode.TWOFA_REQUIRED, "UNAUTHORIZED", 401);

const passwordChangeRequired = (): unknown =>
  errorEntry(ErrorCode.PASSWORD_CHANGE_REQUIRED, "FORBIDDEN", 403);

describe("2FA interceptor link", () => {
  let fetchSpy: MockInstance<typeof fetch> | null = null;
  let unregisterSheet: (() => void) | null = null;

  beforeEach(() => {
    mockGoto.mockClear();
    // Most cases run inside the (app) layout, where the sheet is mounted.
    unregisterSheet = reverifyStore.register();
  });

  afterEach(() => {
    fetchSpy?.mockRestore();
    fetchSpy = null;
    unregisterSheet?.();
    unregisterSheet = null;
    reverifyStore.close();
  });

  it("opens the re-verification sheet on TWOFA_REQUIRED without navigating", async () => {
    fetchSpy = routeFetch({
      "dashboard.getSetupChecklist": twofaRequired,
      "twoFactor.status": () =>
        dataEntry({
          methods: [{ type: "totp" }, { type: "email" }],
          backupCodesRemaining: 5,
        }),
    });

    await expect(
      trpc.dashboard.getSetupChecklist.query(),
    ).rejects.toMatchObject({ message: ErrorCode.TWOFA_REQUIRED });

    await vi.waitFor(() => {
      expect(reverifyStore.opened).toBe(true);
    });
    expect(reverifyStore.methods).toEqual(["totp", "email"]);
    expect(mockGoto).not.toHaveBeenCalled();
  });

  it("sends the user to /login when the session is gone", async () => {
    fetchSpy = routeFetch({
      "dashboard.getSetupChecklist": twofaRequired,
      "twoFactor.status": () =>
        errorEntry(ErrorCode.NOT_AUTHENTICATED, "UNAUTHORIZED", 401),
    });

    await expect(trpc.dashboard.getSetupChecklist.query()).rejects.toThrow();

    await vi.waitFor(() => {
      expect(mockGoto).toHaveBeenCalledWith("/login");
    });
    expect(reverifyStore.opened).toBe(false);
  });

  it("sends the user to /login when no sheet is mounted to show the challenge", async () => {
    unregisterSheet?.();
    unregisterSheet = null;
    fetchSpy = routeFetch({
      "dashboard.getSetupChecklist": twofaRequired,
      "twoFactor.status": () =>
        dataEntry({ methods: [{ type: "totp" }], backupCodesRemaining: 5 }),
    });

    await expect(trpc.dashboard.getSetupChecklist.query()).rejects.toThrow();

    await vi.waitFor(() => {
      expect(mockGoto).toHaveBeenCalledWith("/login");
    });
    expect(reverifyStore.opened).toBe(false);
    // No status fetch: there is nothing to open.
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("leaves the sheet closed for procedures that handle TWOFA_REQUIRED themselves", async () => {
    fetchSpy = routeFetch({
      "twoFactor.verify.totp": twofaRequired,
      "twoFactor.status": () =>
        dataEntry({ methods: [{ type: "totp" }], backupCodesRemaining: 5 }),
    });

    await expect(
      trpc.twoFactor.verify.totp.mutate({ code: "123456" }),
    ).rejects.toThrow();

    // Give a wrongly-triggered status fetch the chance to land.
    await new Promise((r) => setTimeout(r, 0));
    expect(reverifyStore.opened).toBe(false);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("does not refetch status while the sheet is already open", async () => {
    fetchSpy = routeFetch({
      "dashboard.getSetupChecklist": twofaRequired,
    });
    reverifyStore.open(["totp"]);

    await expect(trpc.dashboard.getSetupChecklist.query()).rejects.toThrow();

    await new Promise((r) => setTimeout(r, 0));
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(reverifyStore.methods).toEqual(["totp"]);
  });
});

describe("password-change interceptor link", () => {
  let fetchSpy: MockInstance<typeof fetch> | null = null;

  beforeEach(() => {
    mockGoto.mockReset();
    mockPage.url = new URL("http://localhost/dashboard");
  });

  afterEach(() => {
    fetchSpy?.mockRestore();
    fetchSpy = null;
    mockPage.url = new URL("http://localhost/dashboard");
  });

  it("sends the user to /complete on PASSWORD_CHANGE_REQUIRED", async () => {
    fetchSpy = routeFetch({
      "dashboard.getSetupChecklist": passwordChangeRequired,
    });

    await expect(
      trpc.dashboard.getSetupChecklist.query(),
    ).rejects.toMatchObject({ message: ErrorCode.PASSWORD_CHANGE_REQUIRED });

    await vi.waitFor(() => {
      expect(mockGoto).toHaveBeenCalledWith("/complete");
    });
    expect(reverifyStore.opened).toBe(false);
  });

  it("navigates once when several calls fail together", async () => {
    let finishNavigation = (): void => {
      // replaced when goto is called
    };
    mockGoto.mockImplementation(
      () =>
        new Promise<void>((r) => {
          finishNavigation = (): void => {
            r();
          };
        }),
    );
    fetchSpy = routeFetch({
      "dashboard.getSetupChecklist": passwordChangeRequired,
      "twoFactor.status": passwordChangeRequired,
    });

    await Promise.allSettled([
      trpc.dashboard.getSetupChecklist.query(),
      trpc.twoFactor.status.query(),
    ]);

    expect(mockGoto).toHaveBeenCalledTimes(1);
    finishNavigation();
  });

  it("does not navigate when already on /complete", async () => {
    mockPage.url = new URL("http://localhost/complete");
    fetchSpy = routeFetch({
      "dashboard.getSetupChecklist": passwordChangeRequired,
    });

    await expect(trpc.dashboard.getSetupChecklist.query()).rejects.toThrow();

    await new Promise((r) => setTimeout(r, 0));
    expect(mockGoto).not.toHaveBeenCalled();
  });

  it("does not navigate for procedures that are bypassed", async () => {
    fetchSpy = routeFetch({
      "twoFactor.verify.totp": passwordChangeRequired,
    });

    await expect(
      trpc.twoFactor.verify.totp.mutate({ code: "123456" }),
    ).rejects.toThrow();

    await new Promise((r) => setTimeout(r, 0));
    expect(mockGoto).not.toHaveBeenCalled();
  });
});
