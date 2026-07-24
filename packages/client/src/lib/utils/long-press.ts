import type { Attachment } from "svelte/attachments";

interface LongPressOptions {
  /** Hold time before the press fires. */
  delayMs?: number;
  /** Skip presses that start on a button or anchor inside the element. */
  ignoreInteractiveTargets?: boolean;
}

/**
 * Attachment factory for long-press detection. Starts a timer on
 * pointerdown and fires `onLongPress` if the pointer neither lifts,
 * cancels, nor moves before the delay elapses. The returned cleanup
 * clears the timer and listeners, so detaching mid-press never fires.
 *
 * Haptics stay caller-side: trigger them inside `onLongPress`.
 *
 * Related: composables/create-long-press.svelte.ts carries the same
 * delay contract for callers that own their trigger wiring themselves;
 * this attachment owns the element's pointer listeners.
 */
export function longPress(
  onLongPress: () => void,
  options: LongPressOptions = {},
): Attachment<HTMLElement> {
  const { delayMs = 500, ignoreInteractiveTargets = false } = options;
  return (el) => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    function start(event: PointerEvent): void {
      if (
        ignoreInteractiveTargets &&
        (event.target instanceof HTMLButtonElement ||
          event.target instanceof HTMLAnchorElement)
      ) {
        return;
      }
      timer = setTimeout(() => {
        timer = null;
        onLongPress();
      }, delayMs);
    }

    function cancel(): void {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    }

    el.addEventListener("pointerdown", start);
    el.addEventListener("pointerup", cancel);
    el.addEventListener("pointercancel", cancel);
    el.addEventListener("pointermove", cancel);
    return () => {
      cancel();
      el.removeEventListener("pointerdown", start);
      el.removeEventListener("pointerup", cancel);
      el.removeEventListener("pointercancel", cancel);
      el.removeEventListener("pointermove", cancel);
    };
  };
}
