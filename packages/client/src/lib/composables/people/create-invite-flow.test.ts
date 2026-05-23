// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { createInviteFlow } from "./create-invite-flow.svelte.js";

describe("createInviteFlow", () => {
  let canInviteWithLink: Mock<() => boolean>;
  let onInviteManual: Mock<() => void>;
  let onInviteLink: Mock<() => void>;

  beforeEach(() => {
    canInviteWithLink = vi.fn<() => boolean>().mockReturnValue(true);
    onInviteManual = vi.fn<() => void>();
    onInviteLink = vi.fn<() => void>();
  });

  function make() {
    return createInviteFlow({
      canInviteWithLink,
      onInviteManual,
      onInviteLink,
    });
  }

  function makeMouseEvent(target?: EventTarget | null): MouseEvent {
    const event = new MouseEvent("click");
    Object.defineProperty(event, "currentTarget", { value: target ?? null });
    return event;
  }

  describe("handleInvite", () => {
    it("opens popover when user can invite with link", () => {
      const flow = make();
      const button = document.createElement("button");
      flow.handleInvite(makeMouseEvent(button));

      expect(flow.popoverOpen).toBe(true);
      expect(flow.buttonEl).toBe(button);
      expect(onInviteManual).not.toHaveBeenCalled();
    });

    it("calls onInviteManual directly when link permission is absent", () => {
      canInviteWithLink.mockReturnValue(false);
      const flow = make();
      flow.handleInvite(makeMouseEvent());

      expect(flow.popoverOpen).toBe(false);
      expect(onInviteManual).toHaveBeenCalledOnce();
    });

    it("sets buttonEl to undefined when currentTarget is not HTMLElement", () => {
      const flow = make();
      flow.handleInvite(makeMouseEvent(null));

      expect(flow.popoverOpen).toBe(true);
      expect(flow.buttonEl).toBeUndefined();
    });
  });

  describe("handleOption", () => {
    it("calls onInviteLink for 'link' option and closes popover", () => {
      const flow = make();
      flow.handleInvite(makeMouseEvent(document.createElement("button")));
      flow.handleOption("link");

      expect(flow.popoverOpen).toBe(false);
      expect(onInviteLink).toHaveBeenCalledOnce();
    });

    it("calls onInviteManual for 'manual' option", () => {
      const flow = make();
      flow.handleOption("manual");

      expect(onInviteManual).toHaveBeenCalledOnce();
    });

    it("closes popover for unknown option without calling callbacks", () => {
      const flow = make();
      flow.handleInvite(makeMouseEvent(document.createElement("button")));
      flow.handleOption("unknown");

      expect(flow.popoverOpen).toBe(false);
      expect(onInviteLink).not.toHaveBeenCalled();
      expect(onInviteManual).not.toHaveBeenCalled();
    });
  });

  describe("dismiss", () => {
    it("closes the popover", () => {
      const flow = make();
      flow.handleInvite(makeMouseEvent(document.createElement("button")));
      expect(flow.popoverOpen).toBe(true);

      flow.dismiss();
      expect(flow.popoverOpen).toBe(false);
    });
  });
});
