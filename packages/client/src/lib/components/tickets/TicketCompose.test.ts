// @vitest-environment jsdom
/**
 * TicketCompose component tests.
 *
 * Covers compose-mode switching, mode-keyed draft storage, the SMS
 * character budget, send gating and dispatch, and the dismiss/reset
 * draft semantics (dismiss discards, reset preserves).
 */

import {
  describe,
  it,
  expect,
  vi,
  afterEach,
  beforeEach,
  type Mock,
} from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
import TicketCompose from "./TicketCompose.svelte";
import {
  getDraftForMode,
  setDraftForMode,
  clearDraftForMode,
} from "$lib/tickets/draft-store.svelte.js";

// jsdom has no ResizeObserver; ShellMessagebar observes its anchor in
// fixed mode and Konsta may observe internally.
vi.stubGlobal(
  "ResizeObserver",
  vi.fn(function (this: {
    observe: () => void;
    disconnect: () => void;
    unobserve: () => void;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

// vi.mock required: $lib/trpc/index.js creates a live tRPC HTTP client at
// import time. MentionAutocomplete resolves the tickets router from it.
vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      listVolunteers: { query: vi.fn().mockResolvedValue([]) },
    },
  },
}));

// vi.mock required: the crypto context getters throw outside the (app)
// layout's createContext provider. MentionAutocomplete reads the org cache.
vi.mock("$lib/crypto/context.js", () => ({
  getOrgDecryptCache: () => ({
    decrypt: vi.fn().mockReturnValue(null),
  }),
}));

// vi.mock required: createQuery expects a QueryClient in Svelte context,
// which a bare component render does not provide (volunteers query inside
// MentionAutocomplete).
vi.mock("@tanstack/svelte-query", () => ({
  createQuery: () => ({ isLoading: false, isError: false, data: [] }),
}));

// vi.mock required: withTerms resolves terminology from Svelte context,
// which a bare component render does not provide.
vi.mock("$lib/terminology/with-terms.js", () => ({
  withTerms: (extra?: Record<string, unknown>) => ({ ...extra }),
}));

// vi.mock required: pins the rendered strings so assertions stay stable
// against copy edits (same approach as MentionAutocomplete.test.ts).
vi.mock("$lib/paraglide/messages.js", () => ({
  ticket_mode_indicator_reply: () => "Replying securely",
  ticket_mode_indicator_sms: () => "Texting via SMS",
  ticket_sms_char_count: (p: { count: string }) => `${p.count} / 1600`,
  ticket_compose_dismiss_mode: () => "Dismiss compose",
  ticket_compose_reply_placeholder: () => "Type a reply...",
  ticket_compose_sms_placeholder: () => "Type a message...",
  ticket_compose_note_placeholder: () => "Type a note...",
  ticket_send: () => "Send message",
  ticket_sms_send: () => "Send SMS",
  ticket_save_note: () => "Save note",
  ticket_compose_actions: () => "Compose actions",
  ticket_mention_volunteers: () => "Mention a volunteer",
  contact_correction_pending_warning: () =>
    "A contact correction is pending below.",
}));

const TICKET_ID = "ticket-1";

function baseProps(): {
  ticketId: string;
  inline: boolean;
  onsendreply: Mock<(text: string) => void>;
  onsendsms: Mock<(text: string) => void>;
  onplus: Mock<(anchorEl: HTMLElement) => void>;
} {
  return {
    ticketId: TICKET_ID,
    inline: true,
    onsendreply: vi.fn<(text: string) => void>(),
    onsendsms: vi.fn<(text: string) => void>(),
    onplus: vi.fn<(anchorEl: HTMLElement) => void>(),
  };
}

function replyTextarea(): HTMLTextAreaElement {
  return screen.getByPlaceholderText("Type a reply...");
}

function smsTextarea(): HTMLTextAreaElement {
  return screen.getByPlaceholderText("Type a message...");
}

describe("TicketCompose", () => {
  beforeEach(() => {
    clearDraftForMode(TICKET_ID, "reply");
    clearDraftForMode(TICKET_ID, "sms");
  });

  afterEach(() => {
    cleanup();
  });

  describe("mode switching", () => {
    it("starts collapsed with no mode indicator", () => {
      render(TicketCompose, { props: baseProps() });
      expect(screen.queryByText("Replying securely")).toBeNull();
      expect(screen.queryByText("Texting via SMS")).toBeNull();
    });

    it("activateReply expands into reply mode", async () => {
      const { component } = render(TicketCompose, { props: baseProps() });
      component.activateReply();
      await tick();
      expect(screen.getByText("Replying securely")).toBeTruthy();
      expect(replyTextarea()).toBeTruthy();
    });

    it("activateSms expands into sms mode with the char counter", async () => {
      const { component } = render(TicketCompose, { props: baseProps() });
      component.activateSms();
      await tick();
      expect(screen.getByText("Texting via SMS")).toBeTruthy();
      expect(screen.getByText("0 / 1600")).toBeTruthy();
    });

    it("reset collapses without touching the stored draft", async () => {
      setDraftForMode(TICKET_ID, "reply", "keep me");
      const { component } = render(TicketCompose, { props: baseProps() });
      component.activateReply();
      await tick();
      component.reset();
      await tick();
      expect(screen.queryByText("Replying securely")).toBeNull();
      expect(getDraftForMode(TICKET_ID, "reply")).toBe("keep me");
    });

    it("renders nothing while hidden", () => {
      render(TicketCompose, { props: { ...baseProps(), hidden: true } });
      expect(screen.queryByPlaceholderText("Type a reply...")).toBeNull();
      expect(
        screen.queryByRole("button", { name: "Compose actions" }),
      ).toBeNull();
    });
  });

  describe("draft keying", () => {
    it("shows the active mode's stored draft per mode", async () => {
      setDraftForMode(TICKET_ID, "reply", "reply draft");
      setDraftForMode(TICKET_ID, "sms", "sms draft");
      const { component } = render(TicketCompose, { props: baseProps() });

      component.activateReply();
      await tick();
      expect(replyTextarea().value).toBe("reply draft");

      component.activateSms();
      await tick();
      expect(smsTextarea().value).toBe("sms draft");
    });

    it("syncs typed edits into the mode-keyed store", async () => {
      const { component } = render(TicketCompose, { props: baseProps() });
      component.activateReply();
      await tick();

      await fireEvent.input(replyTextarea(), { target: { value: "hello" } });
      await tick();

      expect(getDraftForMode(TICKET_ID, "reply")).toBe("hello");
      expect(getDraftForMode(TICKET_ID, "sms")).toBe("");
    });
  });

  describe("send dispatch", () => {
    it("dispatches onsendreply with the draft in reply mode", async () => {
      setDraftForMode(TICKET_ID, "reply", "hi there");
      const props = baseProps();
      const { component } = render(TicketCompose, { props });
      component.activateReply();
      await tick();

      await fireEvent.click(
        screen.getByRole("button", { name: "Send message" }),
      );

      expect(props.onsendreply).toHaveBeenCalledWith("hi there");
      expect(props.onsendsms).not.toHaveBeenCalled();
    });

    it("dispatches onsendsms with the draft in sms mode", async () => {
      setDraftForMode(TICKET_ID, "sms", "text the client");
      const props = baseProps();
      const { component } = render(TicketCompose, { props });
      component.activateSms();
      await tick();

      await fireEvent.click(screen.getByRole("button", { name: "Send SMS" }));

      expect(props.onsendsms).toHaveBeenCalledWith("text the client");
      expect(props.onsendreply).not.toHaveBeenCalled();
    });
  });

  describe("sms character budget", () => {
    it("shows the over-limit count and blocks the send dispatch", async () => {
      setDraftForMode(TICKET_ID, "sms", "x".repeat(1601));
      const props = baseProps();
      const { component } = render(TicketCompose, { props });
      component.activateSms();
      await tick();

      expect(screen.getByText("1601 / 1600")).toBeTruthy();
      const sendButton = screen.getByRole("button", { name: "Send SMS" });
      expect(sendButton.getAttribute("aria-disabled")).toBe("true");

      await fireEvent.click(sendButton);
      expect(props.onsendsms).not.toHaveBeenCalled();
    });

    it("allows exactly the limit", async () => {
      setDraftForMode(TICKET_ID, "sms", "x".repeat(1600));
      const { component } = render(TicketCompose, { props: baseProps() });
      component.activateSms();
      await tick();

      const sendButton = screen.getByRole("button", { name: "Send SMS" });
      expect(sendButton.getAttribute("aria-disabled")).toBeNull();
    });
  });

  describe("send gating", () => {
    it("disables send for an empty or whitespace draft", async () => {
      setDraftForMode(TICKET_ID, "reply", "   ");
      const { component } = render(TicketCompose, { props: baseProps() });
      component.activateReply();
      await tick();

      const sendButton = screen.getByRole("button", { name: "Send message" });
      expect(sendButton.getAttribute("aria-disabled")).toBe("true");
    });

    it("disables send while the host pipeline is sending", async () => {
      setDraftForMode(TICKET_ID, "reply", "ready to go");
      const props = baseProps();
      const { component, rerender } = render(TicketCompose, { props });
      component.activateReply();
      await tick();

      const sendButton = screen.getByRole("button", { name: "Send message" });
      expect(sendButton.getAttribute("aria-disabled")).toBeNull();

      await rerender({ sending: true });
      expect(sendButton.getAttribute("aria-disabled")).toBe("true");
    });
  });

  describe("correction warning", () => {
    it("shows correction warning in SMS mode when hasUnacknowledgedCorrection is true", async () => {
      const { component } = render(TicketCompose, {
        props: { ...baseProps(), hasUnacknowledgedCorrection: true },
      });
      component.activateSms();
      await tick();

      const warning = screen.queryByTestId("compose-correction-warning");
      expect(warning).toBeTruthy();
      expect(warning?.textContent).toContain(
        "A contact correction is pending below.",
      );
    });

    it("hides correction warning in reply mode even when prop is true", async () => {
      const { component } = render(TicketCompose, {
        props: { ...baseProps(), hasUnacknowledgedCorrection: true },
      });
      component.activateReply();
      await tick();

      expect(screen.queryByTestId("compose-correction-warning")).toBeNull();
    });

    it("hides correction warning in SMS mode when prop is false", async () => {
      const { component } = render(TicketCompose, {
        props: { ...baseProps(), hasUnacknowledgedCorrection: false },
      });
      component.activateSms();
      await tick();

      expect(screen.queryByTestId("compose-correction-warning")).toBeNull();
    });
  });

  describe("dismiss", () => {
    it("clears the active mode's stored draft and collapses", async () => {
      setDraftForMode(TICKET_ID, "reply", "to discard");
      setDraftForMode(TICKET_ID, "sms", "untouched");
      const { component } = render(TicketCompose, { props: baseProps() });
      component.activateReply();
      await tick();

      await fireEvent.click(
        screen.getByRole("button", { name: "Dismiss compose" }),
      );

      expect(getDraftForMode(TICKET_ID, "reply")).toBe("");
      expect(getDraftForMode(TICKET_ID, "sms")).toBe("untouched");
      expect(screen.queryByText("Replying securely")).toBeNull();
    });
  });
});
