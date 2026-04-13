/**
 * Reactive context for pull-to-refresh opt-out.
 *
 * AppShell calls providePTR() during init to create a shared reactive
 * control object and provide it to all children via Svelte context.
 * Child routes call usePTR().setEnabled(false) during their init to
 * suppress PTR (e.g., drawing canvas, map view).
 *
 * This uses a shared $state-backed object rather than plain
 * setContext/getContext because the signal flows child → parent:
 * the child mutates the same reactive state that AppShell reads.
 */

import { getContext, setContext } from "svelte";

const PTR_KEY = Symbol("ptr");

export interface PTRControl {
  readonly enabled: boolean;
  setEnabled(value: boolean): void;
}

/** Called by AppShell during init. Provides PTR control to all children. */
export function providePTR(initial = true): PTRControl {
  let enabled = $state(initial);
  const control: PTRControl = {
    get enabled(): boolean {
      return enabled;
    },
    setEnabled(value: boolean): void {
      enabled = value;
    },
  };
  setContext(PTR_KEY, control);
  return control;
}

/** Called by child routes to read or suppress PTR. */
export function usePTR(): PTRControl {
  return getContext<PTRControl>(PTR_KEY);
}
