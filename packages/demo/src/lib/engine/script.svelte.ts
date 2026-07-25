/**
 * Demo script state machine.
 *
 * Drives a sequence of DemoSteps with reactive index tracking,
 * tap/auto/event advance modes, and restart support. Uses
 * Svelte 5 runes ($state) for reactive state.
 */

import type { RevealController } from "./reveal.svelte.js";

// -----------------------------------------------------------------------
// Types (cross-task contract, keep names exact)
// -----------------------------------------------------------------------

export interface DemoStep {
  readonly id: string;
  readonly caption: () => string;
  readonly target?: string;
  readonly advance: "tap" | "auto" | "event";
  readonly enter?: (ctx: DemoScriptContext) => void | Promise<void>;
  readonly autoDelayMs?: number;
}

export interface DemoScriptContext {
  readonly reveal: RevealController;
  /** Advance to the next step from within an enter() callback. */
  advance(): void;
}

export interface DemoScript {
  /** Current step index (reactive). */
  readonly index: number;
  /** The currently active step (reactive). */
  readonly current: DemoStep;
  /** All steps in the script. */
  readonly steps: DemoStep[];
  /** Advance when the current step uses tap-advance. */
  handleTap(): void;
  /** Advance unconditionally (used by event-driven steps). */
  advance(): void;
  /** Reset to the initial state, clearing reveal caches and timers. */
  restart(): void;
}

class DemoScriptError extends Error {
  override readonly name = "DemoScriptError";
}

// -----------------------------------------------------------------------
// Factory
// -----------------------------------------------------------------------

export function createDemoScript(
  steps: DemoStep[],
  ctx: DemoScriptContext,
): DemoScript {
  if (steps.length === 0) {
    throw new DemoScriptError("A demo script requires at least one step");
  }

  let index = $state(0);
  let autoTimer: ReturnType<typeof setTimeout> | undefined;

  function clearAutoTimer(): void {
    if (autoTimer !== undefined) {
      clearTimeout(autoTimer);
      autoTimer = undefined;
    }
  }

  function enterStep(stepIndex: number): void {
    clearAutoTimer();

    const step = steps.at(stepIndex);
    if (step === undefined) return;

    // Run the enter callback if present
    if (step.enter !== undefined) {
      const result = step.enter(ctx);
      // If enter returns a promise, we do not await it here;
      // the enter callback is fire-and-forget from the engine's
      // perspective. Steps that need sequencing should call
      // ctx.advance() when ready.
      if (result instanceof Promise) {
        result.catch((err: unknown) => {
          // Surface errors in dev; the demo should never swallow them.
          console.error("[demo-script] enter() rejected:", err);
        });
      }
    }

    // Auto-advance after the configured delay
    if (step.advance === "auto") {
      const delay = step.autoDelayMs ?? 1500;
      autoTimer = setTimeout(() => {
        autoTimer = undefined;
        advance();
      }, delay);
    }
  }

  function advance(): void {
    const nextIndex = index + 1;
    if (nextIndex >= steps.length) {
      // Already at the last step; do nothing.
      return;
    }
    index = nextIndex;
    enterStep(nextIndex);
  }

  function handleTap(): void {
    if (steps.at(index)?.advance === "tap") {
      advance();
    }
  }

  function restart(): void {
    clearAutoTimer();
    ctx.reveal.reset();
    index = 0;
    enterStep(0);
  }

  // Enter the first step immediately
  enterStep(0);

  return {
    get index(): number {
      return index;
    },

    get current(): DemoStep {
      const step = steps.at(index);
      if (step === undefined) {
        throw new DemoScriptError(
          `Step index ${String(index)} out of bounds (${String(steps.length)} steps)`,
        );
      }
      return step;
    },

    get steps(): DemoStep[] {
      return steps;
    },

    handleTap,
    advance,
    restart,
  };
}
