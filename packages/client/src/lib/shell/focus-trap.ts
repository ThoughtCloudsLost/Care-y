/**
 * Focus trap utility shared by ShellSheet, ShellPopup, and ShellActionSheet.
 *
 * Traps Tab/Shift+Tab focus within a container element and closes on Escape.
 * Returns a cleanup function to remove the listener.
 */

const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
}

export interface FocusTrapOptions {
  /** The container element to trap focus within. */
  container: HTMLElement;
  /** Called when the user presses Escape. */
  onEscape: () => void;
}

/**
 * Activates a focus trap on the given container.
 *
 * Moves focus to the first focusable element inside the container.
 * Tab wraps from last to first; Shift+Tab wraps from first to last.
 * Escape calls onEscape.
 *
 * Returns a cleanup function that removes the keydown listener.
 */
export function activateFocusTrap(options: FocusTrapOptions): () => void {
  const { container, onEscape } = options;

  // Focus the first focusable element, or the container itself as fallback
  const focusables = getFocusableElements(container);
  const firstFocusable = focusables[0];
  if (firstFocusable) {
    firstFocusable.focus();
  } else {
    container.focus();
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      onEscape();
      return;
    }

    if (event.key !== "Tab") return;

    const elements = getFocusableElements(container);
    if (elements.length === 0) return;

    const first = elements[0];
    const last = elements[elements.length - 1];
    if (!first || !last) return;

    if (event.shiftKey) {
      // Shift+Tab on first element wraps to last
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      // Tab on last element wraps to first
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  container.addEventListener("keydown", handleKeydown);

  return () => {
    container.removeEventListener("keydown", handleKeydown);
  };
}
