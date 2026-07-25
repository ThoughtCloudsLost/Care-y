import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createDemoScript } from "./script.svelte.js";
import type { DemoStep, DemoScriptContext } from "./script.svelte.js";
import { createRevealController } from "./reveal.svelte.js";

function makeStep(overrides: Partial<DemoStep> & { id: string }): DemoStep {
  return {
    caption: () => `Step ${overrides.id}`,
    advance: "tap",
    ...overrides,
  };
}

describe("createDemoScript", () => {
  let reveal: ReturnType<typeof createRevealController>;
  let ctx: DemoScriptContext;

  beforeEach(() => {
    vi.useFakeTimers();
    reveal = createRevealController();
    ctx = {
      reveal,
      advance: () => {
        /* placeholder; overwritten per test */
      },
    };
  });

  afterEach(() => {
    reveal.reset();
    vi.useRealTimers();
  });

  it("throws if steps array is empty", () => {
    expect(() => createDemoScript([], ctx)).toThrow(
      "A demo script requires at least one step",
    );
  });

  it("starts at index 0", () => {
    const script = createDemoScript([makeStep({ id: "a" })], ctx);
    expect(script.index).toBe(0);
  });

  it("exposes the current step", () => {
    const steps = [makeStep({ id: "first" }), makeStep({ id: "second" })];
    const script = createDemoScript(steps, ctx);
    expect(script.current.id).toBe("first");
  });

  it("advances on handleTap when step.advance is tap", () => {
    const steps = [
      makeStep({ id: "a", advance: "tap" }),
      makeStep({ id: "b", advance: "tap" }),
    ];
    const script = createDemoScript(steps, ctx);
    script.handleTap();
    expect(script.index).toBe(1);
    expect(script.current.id).toBe("b");
  });

  it("does not advance on handleTap when step.advance is auto", () => {
    const steps = [
      makeStep({ id: "a", advance: "auto", autoDelayMs: 1000 }),
      makeStep({ id: "b" }),
    ];
    const script = createDemoScript(steps, ctx);
    script.handleTap();
    expect(script.index).toBe(0);
  });

  it("auto-advances after autoDelayMs", () => {
    const steps = [
      makeStep({ id: "a", advance: "auto", autoDelayMs: 500 }),
      makeStep({ id: "b" }),
    ];
    const script = createDemoScript(steps, ctx);
    expect(script.index).toBe(0);
    vi.advanceTimersByTime(500);
    expect(script.index).toBe(1);
  });

  it("does not advance past the last step", () => {
    const steps = [makeStep({ id: "only" })];
    const script = createDemoScript(steps, ctx);
    script.advance();
    expect(script.index).toBe(0);
  });

  it("calls enter on the first step at creation", () => {
    const enterFn = vi.fn();
    const steps = [makeStep({ id: "a", enter: enterFn })];
    createDemoScript(steps, ctx);
    expect(enterFn).toHaveBeenCalledOnce();
    expect(enterFn).toHaveBeenCalledWith(ctx);
  });

  it("calls enter when advancing to a new step", () => {
    const enterB = vi.fn();
    const steps = [makeStep({ id: "a" }), makeStep({ id: "b", enter: enterB })];
    const script = createDemoScript(steps, ctx);
    script.handleTap();
    expect(enterB).toHaveBeenCalledOnce();
  });

  it("restart resets to index 0 and calls enter on the first step", () => {
    const enterA = vi.fn();
    const steps = [makeStep({ id: "a", enter: enterA }), makeStep({ id: "b" })];
    const script = createDemoScript(steps, ctx);
    script.handleTap();
    expect(script.index).toBe(1);

    enterA.mockClear();
    script.restart();
    expect(script.index).toBe(0);
    expect(enterA).toHaveBeenCalledOnce();
  });

  it("restart clears auto-advance timers", () => {
    const steps = [
      makeStep({ id: "a", advance: "auto", autoDelayMs: 1000 }),
      makeStep({ id: "b" }),
    ];
    const script = createDemoScript(steps, ctx);
    script.restart();
    vi.advanceTimersByTime(2000);
    // After restart, the auto timer from the first creation is cleared.
    // The restart re-enters step 0 which re-schedules, but index should be
    // at 1 now because the new timer fires.
    expect(script.index).toBe(1);
  });

  it("advance() works for event-driven steps", () => {
    const steps = [
      makeStep({ id: "a", advance: "event" }),
      makeStep({ id: "b" }),
    ];
    const script = createDemoScript(steps, ctx);
    // handleTap does nothing for event steps
    script.handleTap();
    expect(script.index).toBe(0);
    // explicit advance works
    script.advance();
    expect(script.index).toBe(1);
  });

  it("provides the steps array", () => {
    const steps = [makeStep({ id: "a" }), makeStep({ id: "b" })];
    const script = createDemoScript(steps, ctx);
    expect(script.steps).toBe(steps);
  });

  it("handles async enter callbacks without blocking", () => {
    const enterFn = vi.fn().mockResolvedValue(undefined);
    const steps = [makeStep({ id: "a", enter: enterFn })];
    // Should not throw even though enter returns a Promise
    expect(() => createDemoScript(steps, ctx)).not.toThrow();
    expect(enterFn).toHaveBeenCalledOnce();
  });

  it("uses default autoDelayMs of 1500 when not specified", () => {
    const steps = [
      makeStep({ id: "a", advance: "auto" }),
      makeStep({ id: "b" }),
    ];
    const script = createDemoScript(steps, ctx);
    vi.advanceTimersByTime(1499);
    expect(script.index).toBe(0);
    vi.advanceTimersByTime(1);
    expect(script.index).toBe(1);
  });
});
