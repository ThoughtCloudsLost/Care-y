import { describe, it, expect, beforeEach } from "vitest";
import { recordPulseOutcome } from "./pulse-log.js";
import type { PulseLogEntry, PulseOutcome } from "./pulse-log.js";
import type { DemoTopic } from "./bridge.js";

beforeEach(() => {
  delete window.__demoPulseLog;
});

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
});
