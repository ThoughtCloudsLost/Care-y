import { tick } from "svelte";
import { shouldShowHint } from "$lib/tickets/ticket-detail-utils.js";

export type ExposureHintType = "sms" | "call";

export interface ExposureHintState {
  readonly type: ExposureHintType | null;
  readonly open: boolean;
  show(type: ExposureHintType, callback: () => void): void;
  dismiss(): void;
}

// Module-level: survives component unmount/remount within the SPA session.
// Resets on full page reload (new session), which is the intended behavior.
// eslint-disable-next-line svelte/prefer-svelte-reactivity -- not reactive, used as mutable dedup tracker
const sessionShown = new Set<string>();

/** @internal Test-only: clear the session-level shown set between test cases. */
export function _resetSessionShown(): void {
  sessionShown.clear();
}

export function createExposureHint(): ExposureHintState {
  let hintType = $state<ExposureHintType | null>(null);
  let hintOpen = $state(false);
  let pendingAction: (() => void) | null = null;

  function show(type: ExposureHintType, callback: () => void): void {
    if (!shouldShowHint(type, sessionShown)) {
      callback();
      return;
    }
    hintType = type;
    hintOpen = true;
    pendingAction = callback;
    void tick().then(() => {
      document
        .querySelector<HTMLElement>('[data-testid="exposure-dismiss"]')
        ?.focus();
    });
  }

  function dismiss(): void {
    hintOpen = false;
    if (pendingAction) {
      const action = pendingAction;
      pendingAction = null;
      action();
    }
  }

  return {
    get type(): ExposureHintType | null {
      return hintType;
    },
    get open(): boolean {
      return hintOpen;
    },
    show,
    dismiss,
  };
}
