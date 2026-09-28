// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/svelte";
import * as m from "$lib/paraglide/messages.js";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as SvelteQueryNS from "@tanstack/svelte-query";
import { reverifyStore } from "$lib/stores/reverify.svelte.js";

const { mockTotpVerify, mockInvalidateQueries } = vi.hoisted(() => ({
  mockTotpVerify: vi.fn(),
  mockInvalidateQueries: vi.fn(),
}));

// vi.mock required: $lib/trpc/index.js creates a live tRPC HTTP client at
// import time (testing-reference Section 4, question 2).
vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    twoFactor: {
      verify: {
        totp: { mutate: mockTotpVerify },
      },
    },
  },
}));

// vi.mock required: useQueryClient reads the QueryClient from Svelte
// component context, which does not exist without a QueryClientProvider
// in jsdom.
vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryNS>()),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

const { default: ReverifySheet } = await import("./ReverifySheet.svelte");

function renderSheet(): {
  onsessionended: ReturnType<typeof vi.fn>;
  onsignout: ReturnType<typeof vi.fn>;
} {
  const onsessionended = vi.fn();
  const onsignout = vi.fn();
  render(ReverifySheet, { props: { onsessionended, onsignout } });
  return { onsessionended, onsignout };
}

async function submitTotp(code = "123456"): Promise<void> {
  const input = await screen.findByPlaceholderText(
    m.twofa_totp_code_placeholder(),
  );
  await fireEvent.input(input, { target: { value: code } });
  const form = document.querySelector("form");
  expect(form).not.toBeNull();
  if (form) {
    await fireEvent.submit(form);
  }
}

afterEach(() => {
  cleanup();
  reverifyStore.close();
});

beforeEach(() => {
  vi.clearAllMocks();
  mockInvalidateQueries.mockResolvedValue(undefined);
  reverifyStore.open(["totp"]);
});

describe("ReverifySheet", () => {
  it("registers with the store while mounted", async () => {
    expect(reverifyStore.registered).toBe(false);
    renderSheet();

    await waitFor(() => {
      expect(reverifyStore.registered).toBe(true);
    });

    cleanup();
    expect(reverifyStore.registered).toBe(false);
  });

  it("shows the challenge for the enrolled methods, labelled once", async () => {
    renderSheet();

    expect(
      await screen.findByPlaceholderText(m.twofa_totp_code_placeholder()),
    ).toBeTruthy();
    // The sheet names itself through aria-label; the only visible heading
    // with this text is the challenge's own.
    expect(
      screen.getAllByRole("heading", { name: m.twofa_verify_title() }),
    ).toHaveLength(1);
    expect(
      document.querySelector('[role="dialog"]')?.getAttribute("aria-label"),
    ).toBe(m.twofa_verify_title());
  });

  it("closes and refetches every query after a successful verification", async () => {
    mockTotpVerify.mockResolvedValue({ success: true });
    renderSheet();

    await submitTotp();

    await waitFor(() => {
      expect(reverifyStore.opened).toBe(false);
    });
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
    expect(mockInvalidateQueries).toHaveBeenCalledWith();
  });

  it("stays open on a wrong code", async () => {
    mockTotpVerify.mockResolvedValue({ success: false });
    renderSheet();

    await submitTotp();

    expect(await screen.findByText(m.twofa_error_invalid_code())).toBeTruthy();
    expect(reverifyStore.opened).toBe(true);
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  it("closes and hands off when the server ended the session", async () => {
    mockTotpVerify.mockRejectedValue(new Error("TWOFA_SESSION_ENDED"));
    const { onsessionended } = renderSheet();

    await submitTotp();

    await waitFor(() => {
      expect(onsessionended).toHaveBeenCalledTimes(1);
    });
    expect(reverifyStore.opened).toBe(false);
  });

  it("closes and hands off on sign out", async () => {
    const { onsignout } = renderSheet();

    await fireEvent.click(
      await screen.findByRole("button", { name: m.panel_logout() }),
    );

    expect(onsignout).toHaveBeenCalledTimes(1);
    expect(reverifyStore.opened).toBe(false);
  });

  it("closes on dismiss without signing out", async () => {
    const { onsignout, onsessionended } = renderSheet();
    await screen.findByPlaceholderText(m.twofa_totp_code_placeholder());

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );

    await waitFor(() => {
      expect(reverifyStore.opened).toBe(false);
    });
    expect(onsignout).not.toHaveBeenCalled();
    expect(onsessionended).not.toHaveBeenCalled();
  });
});
