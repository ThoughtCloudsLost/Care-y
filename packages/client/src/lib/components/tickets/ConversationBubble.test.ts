// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import ConversationBubble from "./ConversationBubble.svelte";

afterEach(cleanup);

const body = createRawSnippet(() => ({
  render: () => `<span data-testid="bubble-content">hello</span>`,
}));

const TIMESTAMP = "2026-07-10T12:00:00.000Z";

describe("ConversationBubble", () => {
  it("renders the body snippet inside the bubble", () => {
    const { container } = render(ConversationBubble, {
      props: { direction: "received", timestamp: TIMESTAMP, children: body },
    });
    const content = container.querySelector("[data-testid='bubble-content']");
    expect(content?.closest(".msg-body")).not.toBeNull();
  });

  it("marks the direction on the root element", () => {
    const { container } = render(ConversationBubble, {
      props: { direction: "sent", timestamp: TIMESTAMP, children: body },
    });
    const root = container.querySelector(".msg");
    expect(root?.getAttribute("data-direction")).toBe("sent");
    expect(root?.classList.contains("msg-sent")).toBe(true);
  });

  it("aligns received bubbles without the sent modifier", () => {
    const { container } = render(ConversationBubble, {
      props: { direction: "received", timestamp: TIMESTAMP, children: body },
    });
    const root = container.querySelector(".msg");
    expect(root?.getAttribute("data-direction")).toBe("received");
    expect(root?.classList.contains("msg-sent")).toBe(false);
  });

  it("shows the speaker eyebrow on received bubbles", () => {
    const { container } = render(ConversationBubble, {
      props: {
        direction: "received",
        speaker: "clear-cove-99",
        timestamp: TIMESTAMP,
        children: body,
      },
    });
    expect(container.querySelector(".msg-who")?.textContent).toBe(
      "clear-cove-99",
    );
  });

  it("never shows an eyebrow on sent bubbles, even with a speaker", () => {
    const { container } = render(ConversationBubble, {
      props: {
        direction: "sent",
        speaker: "should-not-render",
        timestamp: TIMESTAMP,
        children: body,
      },
    });
    expect(container.querySelector(".msg-who")).toBeNull();
  });

  it("omits the eyebrow when no speaker is given", () => {
    const { container } = render(ConversationBubble, {
      props: { direction: "received", timestamp: TIMESTAMP, children: body },
    });
    expect(container.querySelector(".msg-who")).toBeNull();
  });

  it("renders the timestamp as a <time> element with datetime", () => {
    const { container } = render(ConversationBubble, {
      props: { direction: "received", timestamp: TIMESTAMP, children: body },
    });
    const time = container.querySelector("time.msg-when");
    expect(time?.getAttribute("datetime")).toBe(TIMESTAMP);
    expect(time?.textContent).toBeTruthy();
  });

  it("exposes data-source on the bubble root when given (E2E contract)", () => {
    const { container } = render(ConversationBubble, {
      props: {
        direction: "sent",
        source: "volunteer",
        timestamp: TIMESTAMP,
        children: body,
      },
    });
    const root = container.querySelector(".msg");
    expect(root?.getAttribute("data-source")).toBe("volunteer");
  });

  it("omits data-source when no source is given (placeholder bubbles)", () => {
    const { container } = render(ConversationBubble, {
      props: { direction: "received", timestamp: TIMESTAMP, children: body },
    });
    expect(container.querySelector(".msg")?.hasAttribute("data-source")).toBe(
      false,
    );
  });

  it("adds no aria-label of its own (the wrapper announces)", () => {
    const { container } = render(ConversationBubble, {
      props: { direction: "received", timestamp: TIMESTAMP, children: body },
    });
    expect(container.querySelector(".msg")?.hasAttribute("aria-label")).toBe(
      false,
    );
  });
});
