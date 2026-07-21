/**
 * Shared focus-trap lifecycle for shell overlays (Sheet, Popup, ActionSheet).
 *
 * Captures the active element on open, activates a focus trap inside the
 * container after the next frame, cleans up on close, and restores focus
 * to the original trigger.
 */

import { activateFocusTrap, addEscapeHandler } from "./focus-trap";

export interface UseFocusTrapOptions {
  /** Reactive getter: whether the overlay is open. */
  get opened(): boolean;
  /** Called when the user dismisses (Escape or backdrop). */
  ondismiss: () => void;
}

export interface UseFocusTrapReturn {
  /** Bind to the dialog wrapper element: bind:this={trap.dialogEl} */
  dialogEl: HTMLElement | undefined;
  /** Pass as the backdrop/close handler. */
  handleDismiss: () => void;
}

/**
 * Creates focus-trap state and a reactive $effect that activates/deactivates
 * the trap when opened changes.
 *
 * Must be called during component initialization (top-level script).
 */
export function useFocusTrap(options: UseFocusTrapOptions): UseFocusTrapReturn {
  let dialogEl: HTMLElement | undefined = $state(undefined);
  let triggerEl: HTMLElement | null = null;
  let cleanupTrap: (() => void) | null = null;
  let cleanupEscape: (() => void) | null = null;

  $effect(() => {
    if (!options.opened || dialogEl == null) return;
    const el = dialogEl;

    const active = document.activeElement;
    triggerEl = active instanceof HTMLElement ? active : null;

    // Escape handler registered synchronously so it's active from the
    // moment the overlay opens, not deferred behind a RAF.
    cleanupEscape = addEscapeHandler(handleDismiss);

    // Focus movement and Tab trapping deferred to next frame so the
    // overlay has time to position itself before we move focus into it.
    const rafId = requestAnimationFrame(() => {
      cleanupTrap = activateFocusTrap({
        container: el,
        onEscape: handleDismiss,
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (cleanupEscape != null) {
        cleanupEscape();
        cleanupEscape = null;
      }
      if (cleanupTrap != null) {
        cleanupTrap();
        cleanupTrap = null;
      }
    };
  });

  function handleDismiss(): void {
    options.ondismiss();
    requestAnimationFrame(() => {
      triggerEl?.focus();
      triggerEl = null;
    });
  }

  return {
    get dialogEl(): HTMLElement | undefined {
      return dialogEl;
    },
    set dialogEl(el: HTMLElement | undefined) {
      dialogEl = el;
    },
    handleDismiss,
  };
}
