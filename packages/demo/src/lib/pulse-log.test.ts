import { describe, it, expect, beforeEach } from "vitest";
import { recordPulseOutcome } from "./pulse-log.js";
import type { PulseLogEntry, PulseOutcome } from "./pulse-log.js";
import type { DemoTopic } from "./bridge.js";

beforeEach(() => {
  delete window.__demoPulseLog;
});

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

/** Create a minimal DOM element with a bounding rect stub. */
function makeElement(
  tag: string,
  opts: {
    ariaLabel?: string;
    text?: string;
    rect?: Partial<DOMRect>;
    parent?: Element;
  } = {},
): Element {
  const el = document.createElement(tag);

  if (opts.ariaLabel !== undefined) {
    el.setAttribute("aria-label", opts.ariaLabel);
  }
  if (opts.text !== undefined) {
    el.textContent = opts.text;
  }

  const rectDefaults: DOMRect = {
    top: 10,
    left: 10,
    width: 100,
    height: 40,
    bottom: 50,
    right: 110,
    x: 10,
    y: 10,
    toJSON: () => ({}),
  };

  const merged = { ...rectDefaults, ...opts.rect };
  el.getBoundingClientRect = () => merged;

  if (opts.parent !== undefined) {
    opts.parent.appendChild(el);
  } else {
    document.body.appendChild(el);
  }

  return el;
}

// -----------------------------------------------------------------------
// Lazy creation
// -----------------------------------------------------------------------

describe("lazy log creation", () => {
  it("creates the log array on first call", () => {
    expect(window.__demoPulseLog).toBeUndefined();
    recordPulseOutcome("sort" as DemoTopic, "tapped");
    expect(window.__demoPulseLog).toBeDefined();
    expect(window.__demoPulseLog).toHaveLength(1);
  });

  it("reuses the existing array on subsequent calls", () => {
    recordPulseOutcome("sort" as DemoTopic, "tapped");
    const ref = window.__demoPulseLog;
    recordPulseOutcome("filters" as DemoTopic, "marked");
    expect(window.__demoPulseLog).toBe(ref);
  });
});

// -----------------------------------------------------------------------
// Entry contents
// -----------------------------------------------------------------------

describe("entry contents", () => {
  it("records the exact topic and outcome passed", () => {
    recordPulseOutcome("filters" as DemoTopic, "selector");
    const entry = window.__demoPulseLog![0];
    expect(entry).toStrictEqual({ topic: "filters", outcome: "selector" });
  });

  it("preserves append order", () => {
    const pairs: Array<[DemoTopic, PulseOutcome]> = [
      ["credentials" as DemoTopic, "marked"],
      ["sort" as DemoTopic, "tapped"],
      ["decryption" as DemoTopic, "selector"],
      ["reply" as DemoTopic, "missing"],
    ];
    for (const [topic, outcome] of pairs) {
      recordPulseOutcome(topic, outcome);
    }
    const log = window.__demoPulseLog!;
    expect(log).toHaveLength(4);
    expect(log.map((e: PulseLogEntry) => e.topic)).toStrictEqual([
      "credentials",
      "sort",
      "decryption",
      "reply",
    ]);
    expect(log.map((e: PulseLogEntry) => e.outcome)).toStrictEqual([
      "marked",
      "tapped",
      "selector",
      "missing",
    ]);
  });
});

// -----------------------------------------------------------------------
// Target capture
// -----------------------------------------------------------------------

describe("target capture", () => {
  it("omits target when no element is provided", () => {
    recordPulseOutcome("sort" as DemoTopic, "missing");
    const entry = window.__demoPulseLog![0];
    expect(entry?.target).toBeUndefined();
  });

  it("captures tag, label, rect, and viewport status from element", () => {
    const el = makeElement("button", {
      ariaLabel: "Sort",
      rect: { top: 5, left: 20, width: 80, height: 30, bottom: 35, right: 100 },
    });
    recordPulseOutcome("sort" as DemoTopic, "tapped", el);
    const entry = window.__demoPulseLog![0];
    expect(entry?.target).toBeDefined();
    expect(entry?.target?.tag).toBe("button");
    expect(entry?.target?.label).toBe("Sort");
    expect(entry?.target?.rect).toStrictEqual({
      top: 5,
      left: 20,
      width: 80,
      height: 30,
    });
  });

  it("prefers aria-label over textContent", () => {
    const el = makeElement("div", {
      ariaLabel: "From aria",
      text: "From text",
    });
    recordPulseOutcome("sort" as DemoTopic, "marked", el);
    expect(window.__demoPulseLog![0]?.target?.label).toBe("From aria");
  });

  it("falls back to trimmed textContent when no aria-label", () => {
    const el = makeElement("span", { text: "  Some label  " });
    recordPulseOutcome("sort" as DemoTopic, "tapped", el);
    expect(window.__demoPulseLog![0]?.target?.label).toBe("Some label");
  });

  it("slices label to 80 characters", () => {
    const longText = "A".repeat(120);
    const el = makeElement("div", { text: longText });
    recordPulseOutcome("sort" as DemoTopic, "tapped", el);
    const label = window.__demoPulseLog![0]?.target?.label;
    expect(label).toBeDefined();
    expect(label).toHaveLength(80);
    expect(label).toBe("A".repeat(80));
  });

  it("slices aria-label to 80 characters", () => {
    const longLabel = "B".repeat(100);
    const el = makeElement("button", { ariaLabel: longLabel });
    recordPulseOutcome("sort" as DemoTopic, "tapped", el);
    expect(window.__demoPulseLog![0]?.target?.label).toHaveLength(80);
  });

  it("reports inViewport true when rect is nonzero and intersects viewport", () => {
    const el = makeElement("button", {
      rect: { top: 10, left: 10, width: 50, height: 20, bottom: 30, right: 60 },
    });
    recordPulseOutcome("sort" as DemoTopic, "tapped", el);
    expect(window.__demoPulseLog![0]?.target?.inViewport).toBe(true);
  });

  it("reports inViewport false when element is below viewport", () => {
    const el = makeElement("button", {
      rect: {
        top: window.innerHeight + 10,
        left: 10,
        width: 50,
        height: 20,
        bottom: window.innerHeight + 30,
        right: 60,
      },
    });
    recordPulseOutcome("sort" as DemoTopic, "tapped", el);
    expect(window.__demoPulseLog![0]?.target?.inViewport).toBe(false);
  });

  it("reports inViewport false when element is above viewport", () => {
    const el = makeElement("button", {
      rect: {
        top: -50,
        left: 10,
        width: 50,
        height: 20,
        bottom: -30,
        right: 60,
      },
    });
    recordPulseOutcome("sort" as DemoTopic, "tapped", el);
    expect(window.__demoPulseLog![0]?.target?.inViewport).toBe(false);
  });

  it("reports inViewport false when element is off-screen to the right", () => {
    const el = makeElement("button", {
      rect: {
        top: 10,
        left: window.innerWidth + 10,
        width: 50,
        height: 20,
        bottom: 30,
        right: window.innerWidth + 60,
      },
    });
    recordPulseOutcome("sort" as DemoTopic, "tapped", el);
    expect(window.__demoPulseLog![0]?.target?.inViewport).toBe(false);
  });

  it("reports inViewport false when element is off-screen to the left", () => {
    const el = makeElement("button", {
      rect: {
        top: 10,
        left: -100,
        width: 50,
        height: 20,
        bottom: 30,
        right: -50,
      },
    });
    recordPulseOutcome("sort" as DemoTopic, "tapped", el);
    expect(window.__demoPulseLog![0]?.target?.inViewport).toBe(false);
  });

  it("reports inViewport false when rect has zero width", () => {
    const el = makeElement("button", {
      rect: { top: 10, left: 10, width: 0, height: 20, bottom: 30, right: 10 },
    });
    recordPulseOutcome("sort" as DemoTopic, "tapped", el);
    expect(window.__demoPulseLog![0]?.target?.inViewport).toBe(false);
  });

  it("reports inViewport false when rect has zero height", () => {
    const el = makeElement("button", {
      rect: { top: 10, left: 10, width: 50, height: 0, bottom: 10, right: 60 },
    });
    recordPulseOutcome("sort" as DemoTopic, "tapped", el);
    expect(window.__demoPulseLog![0]?.target?.inViewport).toBe(false);
  });

  it("lowercases the tagName", () => {
    const el = makeElement("DIV", { text: "test" });
    recordPulseOutcome("sort" as DemoTopic, "tapped", el);
    expect(window.__demoPulseLog![0]?.target?.tag).toBe("div");
  });

  it("sets navChrome true when element sits inside a nav landmark", () => {
    const nav = document.createElement("nav");
    document.body.appendChild(nav);
    const el = makeElement("button", { text: "Menu", parent: nav });
    recordPulseOutcome("sort" as DemoTopic, "tapped", el);
    expect(window.__demoPulseLog![0]?.target?.navChrome).toBe(true);
  });

  it("sets navChrome false when element is outside nav chrome", () => {
    const el = makeElement("button", { text: "Action" });
    recordPulseOutcome("sort" as DemoTopic, "tapped", el);
    expect(window.__demoPulseLog![0]?.target?.navChrome).toBe(false);
  });
});

// -----------------------------------------------------------------------
// Cap enforcement
// -----------------------------------------------------------------------

describe("200-entry cap", () => {
  it("drops the oldest entries when the cap is reached", () => {
    for (let i = 0; i < 200; i++) {
      recordPulseOutcome("sort" as DemoTopic, "tapped");
    }
    expect(window.__demoPulseLog).toHaveLength(200);

    recordPulseOutcome("filters" as DemoTopic, "missing");
    const log = window.__demoPulseLog!;
    expect(log).toHaveLength(200);
    expect(log[log.length - 1]).toStrictEqual({
      topic: "filters",
      outcome: "missing",
    });
    // The first "sort" entry was dropped
    expect(log[0]?.topic).toBe("sort");
  });

  it("stays at cap after multiple overflow writes", () => {
    for (let i = 0; i < 210; i++) {
      recordPulseOutcome("sort" as DemoTopic, "tapped");
    }
    expect(window.__demoPulseLog).toHaveLength(200);
  });

  it("preserves target metadata through cap eviction", () => {
    const el = makeElement("button", { ariaLabel: "Keep me" });
    for (let i = 0; i < 199; i++) {
      recordPulseOutcome("sort" as DemoTopic, "tapped");
    }
    recordPulseOutcome("filters" as DemoTopic, "tapped", el);
    expect(window.__demoPulseLog).toHaveLength(200);

    // Push one more to evict the first entry, the targeted entry survives
    recordPulseOutcome("sort" as DemoTopic, "marked");
    const log = window.__demoPulseLog!;
    expect(log).toHaveLength(200);
    const targeted = log.find((e: PulseLogEntry) => e.target !== undefined);
    expect(targeted).toBeDefined();
    expect(targeted?.target?.label).toBe("Keep me");
  });
});
