import { shouldShowHint } from "$lib/tickets/ticket-detail-utils.js";

export type ExposureHintType = "sms" | "call" | "email";

export interface ExposureHintState {
  readonly type: ExposureHintType | null;
  readonly open: boolean;
  show(type: ExposureHintType): void;
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

  function show(type: ExposureHintType): void {
    if (!shouldShowHint(type, sessionShown)) {
      return;
    }
    hintType = type;
    hintOpen = true;
  }

  function dismiss(): void {
    hintOpen = false;
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
