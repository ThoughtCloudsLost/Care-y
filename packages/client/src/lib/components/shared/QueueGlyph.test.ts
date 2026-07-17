// @vitest-environment jsdom
/**
 * QueueGlyph component tests.
 *
 * The glyph is decorative (aria-hidden) and renders the resolved icon
 * tinted with the queue color. Assertions cover the a11y contract and
 * the color custom property pass-through.
 */

import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";

import QueueGlyph from "./QueueGlyph.svelte";
import { resolveQueueAppearance } from "$lib/utils/queue-appearance.js";

describe("QueueGlyph", () => {
  afterEach(cleanup);

  it("renders the resolved icon inside an aria-hidden span", () => {
    const { container } = render(QueueGlyph, {
      appearance: resolveQueueAppearance("red", "phone"),
    });
    const glyph = container.querySelector(".queue-glyph");
    expect(glyph).toBeTruthy();
    expect(glyph?.getAttribute("aria-hidden")).toBe("true");
    expect(glyph?.querySelector("svg")).toBeTruthy();
  });

  it("passes the queue color through as a custom property", () => {
    const appearance = resolveQueueAppearance("green", "star");
    const { container } = render(QueueGlyph, { appearance });
    const glyph = container.querySelector(".queue-glyph");
    expect(glyph?.getAttribute("style")).toContain(
      `--glyph-color: ${appearance.colorHex}`,
    );
  });

  it("renders the default appearance for legacy queues", () => {
    const { container } = render(QueueGlyph, {
      appearance: resolveQueueAppearance(null, null),
    });
    expect(container.querySelector("svg")).toBeTruthy();
  });
});
