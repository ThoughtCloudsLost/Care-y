import { describe, it, expect, vi } from "vitest";
import type { FlowBlock, LineCursor } from "./flow-layout.js";

// pretext measures through a Canvas 2D context, which jsdom does not
// provide, so the two pretext entry points are stubbed. What is under
// test here is the module's own logic: which handle kind a block gets,
// which font each run is measured with, the cursor shape handed back per
// handle kind, and how rich fragments accumulate their offsets. Real
// glyph measurement belongs to pretext and is not this module's concern.

interface FakePrepared {
  readonly kind: "plain" | "rich";
  readonly text?: string;
  readonly font?: string;
  readonly items?: readonly { text: string; font: string }[];
}

vi.mock("@chenglou/pretext", () => ({
  // story-blocks' applyPretextLocale reaches through to this.
  setLocale: vi.fn(),
  prepareWithSegments: vi.fn((text: string, font: string): FakePrepared => ({
    kind: "plain",
    text,
    font,
  })),
  layoutNextLineRange: vi.fn(
    (_h: unknown, _cursor: unknown, maxWidth: number) =>
      maxWidth <= 0 ? null : { end: { segmentIndex: 1, graphemeIndex: 0 } },
  ),
  materializeLineRange: vi.fn(() => ({ text: "plain line", width: 42 })),
}));

vi.mock("@chenglou/pretext/rich-inline", () => ({
  prepareRichInline: vi.fn(
    (items: readonly { text: string; font: string }[]): FakePrepared => ({
      kind: "rich",
      items,
    }),
  ),
  layoutNextRichInlineLineRange: vi.fn((_h: unknown, maxWidth: number) =>
    maxWidth <= 0
      ? null
      : { end: { itemIndex: 2, segmentIndex: 0, graphemeIndex: 0 } },
  ),
  materializeRichInlineLineRange: vi.fn(() => ({
    width: 90,
    fragments: [
      { text: "plain ", itemIndex: 0, gapBefore: 0, occupiedWidth: 30 },
      { text: "bold", itemIndex: 1, gapBefore: 4, occupiedWidth: 20 },
      { text: " tail", itemIndex: 2, gapBefore: 6, occupiedWidth: 25 },
    ],
  })),
}));

const { prepareWithSegments } = await import("@chenglou/pretext");
const { prepareRichInline } = await import("@chenglou/pretext/rich-inline");
const {
  prepareBlockHandles,
  createFiller,
  fillRichLine,
  isLayoutCursor,
  isRichCursor,
} = await import("./flow-prepare.js");
const { FONT_STRINGS, FONT_SUB_BODY_BOLD } = await import("./story-blocks.js");

// -----------------------------------------------------------------------
// Block fixtures
// -----------------------------------------------------------------------

function textBlock(
  id: string,
  kind: "sub-body" | "sub-heading",
  text: string,
): FlowBlock {
  return {
    id,
    sectionId: "login",
    subSlug: "a-sub",
    kind,
    text,
  };
}

function richBlock(id: string): FlowBlock {
  return {
    id,
    sectionId: "login",
    subSlug: "a-sub",
    kind: "sub-body",
    text: "plain bold tail",
    runs: [
      { text: "plain ", bold: false },
      { text: "bold", bold: true },
      { text: " tail", bold: false },
    ],
  };
}

function figureBlock(id: string): FlowBlock {
  return {
    id,
    sectionId: "login",
    subSlug: "a-sub",
    kind: "figure",
    aspectRatio: 0.5,
    headingKey: "demo_login_a_sub",
  };
}

// -----------------------------------------------------------------------

describe("prepareBlockHandles", () => {
  it("gives plain blocks a plain handle measured with the kind's font", () => {
    const blocks = [textBlock("b0", "sub-heading", "Heading text")];
    const prepared = prepareBlockHandles(blocks, "en");

    expect(prepared.handles.get(0)?.type).toBe("plain");
    expect(prepareWithSegments).toHaveBeenCalledWith(
      "Heading text",
      FONT_STRINGS["sub-heading"],
    );
  });

  it("gives blocks with runs a rich handle, bold runs measured bold", () => {
    const prepared = prepareBlockHandles([richBlock("b0")], "en");

    const handle = prepared.handles.get(0);
    expect(handle?.type).toBe("rich");
    // The bold flags are kept alongside the handle so fragments can look
    // their weight up by itemIndex when the line is materialized.
    expect(handle?.type === "rich" ? handle.bold : null).toEqual([
      false,
      true,
      false,
    ]);
    expect(prepareRichInline).toHaveBeenCalledWith([
      { text: "plain ", font: FONT_STRINGS["sub-body"] },
      { text: "bold", font: FONT_SUB_BODY_BOLD },
      { text: " tail", font: FONT_STRINGS["sub-body"] },
    ]);
  });

  it("skips figure blocks, leaving a gap at their index", () => {
    const blocks = [
      textBlock("b0", "sub-body", "before"),
      figureBlock("b1"),
      textBlock("b2", "sub-body", "after"),
    ];
    const prepared = prepareBlockHandles(blocks, "en");

    expect(prepared.handles.has(0)).toBe(true);
    expect(prepared.handles.has(1)).toBe(false);
    expect(prepared.handles.has(2)).toBe(true);
  });

  it("returns the exact blocks array it measured, by identity", () => {
    // Hosts compare forBlocks by identity before laying out, so handles
    // can never be paired with a different blocks array. A copy here
    // would silently defeat that guard.
    const blocks = [textBlock("b0", "sub-body", "text")];
    expect(prepareBlockHandles(blocks, "en").forBlocks).toBe(blocks);
  });
});

describe("cursor guards", () => {
  it("accepts a layout cursor and rejects non-objects", () => {
    expect(isLayoutCursor({ segmentIndex: 0, graphemeIndex: 0 })).toBe(true);
    expect(isLayoutCursor(null)).toBe(false);
    expect(isLayoutCursor("cursor")).toBe(false);
    expect(isLayoutCursor({ segmentIndex: 0 })).toBe(false);
  });

  it("separates rich cursors from plain ones by itemIndex", () => {
    expect(isRichCursor({ segmentIndex: 0, graphemeIndex: 0 })).toBe(false);
    expect(
      isRichCursor({ itemIndex: 0, segmentIndex: 0, graphemeIndex: 0 }),
    ).toBe(true);
  });
});

describe("createFiller", () => {
  it("starts rich blocks with an itemIndex cursor and plain blocks without", () => {
    const blocks = [textBlock("b0", "sub-body", "plain"), richBlock("b1")];
    const filler = createFiller(prepareBlockHandles(blocks, "en").handles);

    expect(filler.startCursor(0)).toEqual({
      segmentIndex: 0,
      graphemeIndex: 0,
    });
    expect(filler.startCursor(1)).toEqual({
      itemIndex: 0,
      segmentIndex: 0,
      graphemeIndex: 0,
    });
  });

  it("fills a plain line without fragments", () => {
    const blocks = [textBlock("b0", "sub-body", "plain")];
    const filler = createFiller(prepareBlockHandles(blocks, "en").handles);

    const result = filler.fillLine(0, filler.startCursor(0), 200);
    expect(result?.text).toBe("plain line");
    expect(result?.width).toBe(42);
    expect(result?.fragments).toBeUndefined();
  });

  it("fills a rich line with fragments", () => {
    const blocks = [richBlock("b0")];
    const filler = createFiller(prepareBlockHandles(blocks, "en").handles);

    const result = filler.fillLine(0, filler.startCursor(0), 200);
    expect(result?.fragments).toHaveLength(3);
  });

  it("returns null for a block index with no handle", () => {
    // Figure blocks land here: they occupy an index but have no text.
    const filler = createFiller(
      prepareBlockHandles([figureBlock("b0")], "en").handles,
    );
    expect(filler.fillLine(0, { segmentIndex: 0, graphemeIndex: 0 }, 200)).toBe(
      null,
    );
  });

  it("returns null when the cursor shape does not match the handle", () => {
    const blocks = [textBlock("b0", "sub-body", "plain"), richBlock("b1")];
    const filler = createFiller(prepareBlockHandles(blocks, "en").handles);

    // A rich cursor is also a valid layout cursor, so only the reverse
    // pairing is detectable: a plain cursor handed to a rich block.
    expect(filler.fillLine(1, { segmentIndex: 0, graphemeIndex: 0 }, 200)).toBe(
      null,
    );
    const notACursor: LineCursor = "nonsense";
    expect(filler.fillLine(0, notACursor, 200)).toBe(null);
  });

  it("returns null when the block's text is exhausted", () => {
    const blocks = [textBlock("b0", "sub-body", "plain"), richBlock("b1")];
    const filler = createFiller(prepareBlockHandles(blocks, "en").handles);

    // The stubs report exhaustion at zero width.
    expect(filler.fillLine(0, filler.startCursor(0), 0)).toBe(null);
    expect(filler.fillLine(1, filler.startCursor(1), 0)).toBe(null);
  });
});

describe("fillRichLine", () => {
  it("offsets each fragment by the running gap plus occupied width", () => {
    const prepared = prepareBlockHandles([richBlock("b0")], "en");
    const handle = prepared.handles.get(0);
    if (handle?.type !== "rich") throw new Error("expected a rich handle");

    const result = fillRichLine(
      handle,
      { itemIndex: 0, segmentIndex: 0, graphemeIndex: 0 },
      200,
    );

    // dx accumulates gapBefore then occupiedWidth, in that order, so a
    // fragment's dx is where it starts, not where the previous one ended.
    expect(result?.fragments?.map((f) => f.dx)).toEqual([0, 34, 60]);
    expect(result?.fragments?.map((f) => f.width)).toEqual([30, 20, 25]);
  });

  it("reads each fragment's weight from its itemIndex", () => {
    const prepared = prepareBlockHandles([richBlock("b0")], "en");
    const handle = prepared.handles.get(0);
    if (handle?.type !== "rich") throw new Error("expected a rich handle");

    const result = fillRichLine(
      handle,
      { itemIndex: 0, segmentIndex: 0, graphemeIndex: 0 },
      200,
    );

    expect(result?.fragments?.map((f) => f.bold)).toEqual([false, true, false]);
  });

  it("concatenates fragment text into the line's text", () => {
    const prepared = prepareBlockHandles([richBlock("b0")], "en");
    const handle = prepared.handles.get(0);
    if (handle?.type !== "rich") throw new Error("expected a rich handle");

    const result = fillRichLine(
      handle,
      { itemIndex: 0, segmentIndex: 0, graphemeIndex: 0 },
      200,
    );

    expect(result?.text).toBe("plain bold tail");
    expect(result?.width).toBe(90);
  });
});
