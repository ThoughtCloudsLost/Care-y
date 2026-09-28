// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/svelte";
import { TRPCClientError } from "@trpc/client";
import { ErrorCode } from "@care-y/shared";
import * as m from "$lib/paraglide/messages.js";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as AnnounceNS from "$lib/utils/announce.js";
import { mockAnnounce } from "$mocks/announce.js";

const { mockTotpVerify, mockPushSend, mockPushPoll } = vi.hoisted(() => ({
  mockTotpVerify: vi.fn(),
  mockPushSend: vi.fn(),
  mockPushPoll: vi.fn(),
}));

// vi.mock required: $lib/trpc/index.js creates a live tRPC HTTP client at
// import time (testing-reference Section 4, question 2).
vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    twoFactor: {
      verify: {
        totp: { mutate: mockTotpVerify },
        pushSend: { mutate: mockPushSend },
        pushPoll: { query: mockPushPoll },
      },
    },
  },
}));

// vi.mock required: the compiled .svelte module consumes
// announceToLiveRegion as a destructured named ESM export, so vi.spyOn on
// the test's namespace object does not intercept the component's binding
// (testing-reference Section 4, question 3).
vi.mock("$lib/utils/announce.js", async (importOriginal) =>
  (await import("$mocks/announce.js")).announceMock(
    await importOriginal<typeof AnnounceNS>(),
  ),
);

const { default: TwoFactorChallenge } =
  await import("./TwoFactorChallenge.svelte");

/** An Error shaped like a TRPCClientError carrying formatter data. */
function trpcLikeError(message: string, data: object = {}): Error {
  return Object.assign(new Error(message), { data });
}

/** A tRPC client error for a request whose session no longer exists. */
function sessionGoneError(): Error {
  return TRPCClientError.from({
    error: {
      message: ErrorCode.NOT_AUTHENTICATED,
      code: -32001,
      data: { code: "UNAUTHORIZED", httpStatus: 401 },
    },
  });
}

class PollNetworkTestError extends Error {}

const PUSH_CHALLENGE = {
  sent: true,
  challengeId: "00000000-0000-4000-8000-000000000001",
} as const;

async function submitTotp(code = "123456"): Promise<void> {
  const input = screen.getByPlaceholderText(m.twofa_totp_code_placeholder());
  await fireEvent.input(input, { target: { value: code } });
  const form = document.querySelector("form");
  expect(form).not.toBeNull();
  if (form) {
    await fireEvent.submit(form);
  }
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TwoFactorChallenge", () => {
  describe("code verification errors", () => {
    it("shows the invalid-code message when the code is wrong", async () => {
      mockTotpVerify.mockResolvedValue({ success: false });
      render(TwoFactorChallenge, {
        props: { methods: ["totp"], onsuccess: vi.fn() },
      });

      await submitTotp();

      expect(
        await screen.findByText(m.twofa_error_invalid_code()),
      ).toBeTruthy();
      expect(mockAnnounce).toHaveBeenCalledWith(
        "assertive",
        m.twofa_error_invalid_code(),
      );
    });

    it("shows the server's error message instead of invalid code", async () => {
      mockTotpVerify.mockRejectedValue(trpcLikeError("TWOFA_RATE_LIMITED"));
      render(TwoFactorChallenge, {
        props: { methods: ["totp"], onsuccess: vi.fn() },
      });

      await submitTotp();

      expect(
        await screen.findByText(m.error_twofa_rate_limited()),
      ).toBeTruthy();
      expect(screen.queryByText(m.twofa_error_invalid_code())).toBeNull();
    });

    it("names the wait when the server sent a retry hint", async () => {
      mockTotpVerify.mockRejectedValue(
        trpcLikeError("TWOFA_RATE_LIMITED", {
          code: "RATE_LIMITED",
          retryAfterSeconds: 30,
        }),
      );
      render(TwoFactorChallenge, {
        props: { methods: ["totp"], onsuccess: vi.fn() },
      });

      await submitTotp();

      const expected = m.error_retry_after_seconds({ seconds: "30" });
      expect(await screen.findByText(expected)).toBeTruthy();
      expect(mockAnnounce).toHaveBeenCalledWith("assertive", expected);
    });

    it("reports a session the server ended and shows why", async () => {
      mockTotpVerify.mockRejectedValue(trpcLikeError("TWOFA_SESSION_ENDED"));
      const onsessionended = vi.fn();
      render(TwoFactorChallenge, {
        props: { methods: ["totp"], onsuccess: vi.fn(), onsessionended },
      });

      await submitTotp();

      expect(
        await screen.findByText(m.error_twofa_session_ended()),
      ).toBeTruthy();
      expect(onsessionended).toHaveBeenCalledTimes(1);
    });

    it("does not report a session end for other errors", async () => {
      mockTotpVerify.mockRejectedValue(trpcLikeError("NO_ACTIVE_CODE"));
      const onsessionended = vi.fn();
      render(TwoFactorChallenge, {
        props: { methods: ["totp"], onsuccess: vi.fn(), onsessionended },
      });

      await submitTotp();

      expect(await screen.findByText(m.error_no_active_code())).toBeTruthy();
      expect(onsessionended).not.toHaveBeenCalled();
    });
  });

  describe("push sign-in", () => {
    it("asks for another method when no device can receive the request", async () => {
      mockPushSend.mockResolvedValue({ sent: false });
      render(TwoFactorChallenge, {
        props: { methods: ["push"], onsuccess: vi.fn() },
      });

      expect(
        await screen.findByText(m.twofa_error_push_no_devices()),
      ).toBeTruthy();
      expect(mockAnnounce).toHaveBeenCalledWith(
        "assertive",
        m.twofa_error_push_no_devices(),
      );
      expect(mockPushPoll).not.toHaveBeenCalled();
      // The waiting state never appears; the send button is back.
      expect(screen.queryByText(m.twofa_push_waiting())).toBeNull();
      expect(
        screen.getByRole("button", { name: m.twofa_push_send() }),
      ).toBeTruthy();
    });

    it("stops polling and shows the timeout when the challenge expires", async () => {
      // Only the poll interval is faked so testing-library's waitFor keeps
      // its real timers.
      vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
      mockPushSend.mockResolvedValue({
        sent: true,
        challengeId: "00000000-0000-4000-8000-000000000001",
      });
      mockPushPoll.mockResolvedValue({ status: "expired" });
      const onsuccess = vi.fn();
      render(TwoFactorChallenge, {
        props: { methods: ["push"], onsuccess },
      });

      await waitFor(() => {
        expect(screen.getByText(m.twofa_push_waiting())).toBeTruthy();
      });

      await vi.advanceTimersByTimeAsync(3000);

      await waitFor(() => {
        expect(screen.getByText(m.twofa_error_push_timeout())).toBeTruthy();
      });
      expect(mockAnnounce).toHaveBeenCalledWith(
        "assertive",
        m.twofa_error_push_timeout(),
      );

      await vi.advanceTimersByTimeAsync(6000);
      expect(mockPushPoll).toHaveBeenCalledTimes(1);
      expect(onsuccess).not.toHaveBeenCalled();
    });

    it("keeps polling through a transient error", async () => {
      vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
      mockPushSend.mockResolvedValue(PUSH_CHALLENGE);
      mockPushPoll
        .mockRejectedValueOnce(new PollNetworkTestError("network down"))
        .mockResolvedValue({ status: "pending" });
      const onsessionended = vi.fn();
      render(TwoFactorChallenge, {
        props: { methods: ["push"], onsuccess: vi.fn(), onsessionended },
      });

      await waitFor(() => {
        expect(screen.getByText(m.twofa_push_waiting())).toBeTruthy();
      });

      await vi.advanceTimersByTimeAsync(6000);
      expect(mockPushPoll).toHaveBeenCalledTimes(2);
      expect(onsessionended).not.toHaveBeenCalled();
    });

    it("stops polling and hands off when the session is gone", async () => {
      vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
      mockPushSend.mockResolvedValue(PUSH_CHALLENGE);
      mockPushPoll.mockRejectedValue(sessionGoneError());
      const onsessionended = vi.fn();
      render(TwoFactorChallenge, {
        props: { methods: ["push"], onsuccess: vi.fn(), onsessionended },
      });

      await waitFor(() => {
        expect(screen.getByText(m.twofa_push_waiting())).toBeTruthy();
      });

      await vi.advanceTimersByTimeAsync(3000);
      await waitFor(() => {
        expect(onsessionended).toHaveBeenCalledTimes(1);
      });

      await vi.advanceTimersByTimeAsync(6000);
      expect(mockPushPoll).toHaveBeenCalledTimes(1);
    });

    it("stops polling and shows the error when the session is gone and no handler is given", async () => {
      vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
      mockPushSend.mockResolvedValue(PUSH_CHALLENGE);
      mockPushPoll.mockRejectedValue(sessionGoneError());
      render(TwoFactorChallenge, {
        props: { methods: ["push"], onsuccess: vi.fn() },
      });

      await waitFor(() => {
        expect(screen.getByText(m.twofa_push_waiting())).toBeTruthy();
      });

      await vi.advanceTimersByTimeAsync(3000);
      await waitFor(() => {
        expect(screen.getByText(m.error_not_authenticated())).toBeTruthy();
      });
      expect(mockAnnounce).toHaveBeenCalledWith(
        "assertive",
        m.error_not_authenticated(),
      );

      await vi.advanceTimersByTimeAsync(6000);
      expect(mockPushPoll).toHaveBeenCalledTimes(1);
    });
  });
});
