import { tick } from "svelte";
import { shouldShowHint } from "$lib/tickets/ticket-detail-utils.js";

export type ExposureHintType = "sms" | "call";

export interface ExposureHintState {
  readonly type: ExposureHintType | null;
  readonly open: boolean;
  show(type: ExposureHintType, callback: () => void): void;
  dismiss(): void;
}

export function createExposureHint(): ExposureHintState {
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- not reactive, used as mutable dedup tracker
  const shown = new Set<string>();
  let hintType = $state<ExposureHintType | null>(null);
  let hintOpen = $state(false);
  let pendingAction: (() => void) | null = null;

  function show(type: ExposureHintType, callback: () => void): void {
    if (!shouldShowHint(type, shown)) {
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
