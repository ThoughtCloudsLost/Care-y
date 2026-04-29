// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import SmsComposeContent from "./SmsComposeContent.svelte";

vi.mock("$lib/paraglide/messages.js", () => ({
  ticket_sms_plaintext_warning: () => "SMS messages are not encrypted.",
  ticket_sms_placeholder: () => "Type your message...",
  ticket_sms_send: () => "Send SMS",
  ticket_sms_sending: () => "Sending...",
  ticket_sms_char_count: ({ count }: { count: string }) => `${count} / 1600`,
  common_cancel: () => "Cancel",
}));

vi.mock("$lib/shell/context.js", () => ({
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("SmsComposeContent", () => {
  describe("rendering", () => {
    it("renders plaintext warning", () => {
      const { container } = render(SmsComposeContent, {
        props: { onsend: vi.fn(), oncancel: vi.fn() },
      });

      expect(container.textContent).toContain(
        "SMS messages are not encrypted.",
      );
    });

    it("renders char count starting at 0", () => {
      const { container } = render(SmsComposeContent, {
        props: { onsend: vi.fn(), oncancel: vi.fn() },
      });

      expect(container.textContent).toContain("0 / 1600");
    });

    it("renders cancel and send buttons", () => {
      const { getByText } = render(SmsComposeContent, {
        props: { onsend: vi.fn(), oncancel: vi.fn() },
      });

      expect(getByText("Cancel")).toBeTruthy();
      expect(getByText("Send SMS")).toBeTruthy();
    });
  });

  describe("send button state", () => {
    it("disables send when body is empty", () => {
      const { container } = render(SmsComposeContent, {
        props: { onsend: vi.fn(), oncancel: vi.fn() },
      });

      const sendBtn = Array.from(container.querySelectorAll("button")).find(
        (b) => b.textContent!.trim() === "Send SMS",
      );
      expect(sendBtn).toBeDefined();
      expect(sendBtn!.hasAttribute("disabled")).toBe(true);
    });

    it("disables send when sending is true", async () => {
      const { container } = render(SmsComposeContent, {
        props: { onsend: vi.fn(), oncancel: vi.fn(), sending: true },
      });

      const sendBtn = Array.from(container.querySelectorAll("button")).find(
        (b) => b.textContent!.trim() === "Sending...",
      );
      expect(sendBtn).toBeDefined();
      expect(sendBtn!.hasAttribute("disabled")).toBe(true);
    });

    it("shows 'Sending...' text when sending prop is true", () => {
      const { getByText } = render(SmsComposeContent, {
        props: { onsend: vi.fn(), oncancel: vi.fn(), sending: true },
      });

      expect(getByText("Sending...")).toBeTruthy();
    });
  });

  describe("char count", () => {
    it("updates char count when text is entered", async () => {
      const { container } = render(SmsComposeContent, {
        props: { onsend: vi.fn(), oncancel: vi.fn() },
      });

      const textarea = container.querySelector("textarea")!;
      await fireEvent.input(textarea, { target: { value: "Hello" } });

      expect(container.textContent).toContain("5 / 1600");
    });

    it("disables send when body exceeds 1600 characters", async () => {
      const { container } = render(SmsComposeContent, {
        props: { onsend: vi.fn(), oncancel: vi.fn() },
      });

      const textarea = container.querySelector("textarea")!;
      const longText = "x".repeat(1601);
      await fireEvent.input(textarea, { target: { value: longText } });

      const sendBtn = Array.from(container.querySelectorAll("button")).find(
        (b) => b.textContent!.trim() === "Send SMS",
      );
      expect(sendBtn).toBeDefined();
      expect(sendBtn!.hasAttribute("disabled")).toBe(true);
      expect(container.textContent).toContain("1601 / 1600");
    });
  });

  describe("interactions", () => {
    it("calls oncancel when cancel button is clicked", async () => {
      const oncancel = vi.fn();
      const { getByText } = render(SmsComposeContent, {
        props: { onsend: vi.fn(), oncancel },
      });

      await fireEvent.click(getByText("Cancel"));
      expect(oncancel).toHaveBeenCalledOnce();
    });

    it("calls onsend with body text when send is clicked", async () => {
      const onsend = vi.fn();
      const { container } = render(SmsComposeContent, {
        props: { onsend, oncancel: vi.fn() },
      });

      const textarea = container.querySelector("textarea")!;
      await fireEvent.input(textarea, { target: { value: "Test message" } });

      const sendBtn = Array.from(container.querySelectorAll("button")).find(
        (b) => b.textContent!.trim() === "Send SMS",
      );
      await fireEvent.click(sendBtn!);

      expect(onsend).toHaveBeenCalledWith("Test message");
    });

    it("disables cancel button when sending", () => {
      const { container } = render(SmsComposeContent, {
        props: { onsend: vi.fn(), oncancel: vi.fn(), sending: true },
      });

      const cancelBtn = Array.from(container.querySelectorAll("button")).find(
        (b) => b.textContent!.trim() === "Cancel",
      );
      expect(cancelBtn).toBeDefined();
      expect(cancelBtn!.hasAttribute("disabled")).toBe(true);
    });
  });

  describe("error display", () => {
    it("renders error message with alert role when error prop is set", () => {
      const { container } = render(SmsComposeContent, {
        props: {
          onsend: vi.fn(),
          oncancel: vi.fn(),
          error: "SMS failed to send.",
        },
      });

      const alert = container.querySelector('[role="alert"]');
      expect(alert).not.toBeNull();
      expect(alert!.textContent).toContain("SMS failed to send.");
    });

    it("does not render error block when error is null", () => {
      const { container } = render(SmsComposeContent, {
        props: { onsend: vi.fn(), oncancel: vi.fn(), error: null },
      });

      expect(container.querySelector('[role="alert"]')).toBeNull();
    });
  });
});
