/**
 * Topmost-layer Escape arbiter for shell overlays.
 *
 * Ownership rule: the topmost open overlay consumes Escape. A single
 * capture-phase window keydown listener is attached while the stack is
 * non-empty. Capture phase is required because the AppShell's
 * split-pane-close handler is a bubble-phase window listener, and
 * overlays must intercept Escape before it reaches that handler.
 *
 * Higher-priority consumers (e.g., the caution popover) call
 * preventDefault before propagation reaches this listener. When
 * defaultPrevented is true this listener yields without acting.
 */

interface OverlayHandle {
  readonly dismiss: () => void;
}

const stack: OverlayHandle[] = [];
let listenerAttached = false;

function handleEscape(event: KeyboardEvent): void {
  if (event.key !== "Escape") return;
  if (event.defaultPrevented) return;

  const top = stack[stack.length - 1];
  if (top == null) return;

  event.preventDefault();
  event.stopPropagation();
  top.dismiss();
}

function attachListener(): void {
  if (listenerAttached) return;
  window.addEventListener("keydown", handleEscape, { capture: true });
  listenerAttached = true;
}

function detachListener(): void {
  if (!listenerAttached) return;
  window.removeEventListener("keydown", handleEscape, { capture: true });
  listenerAttached = false;
}

/**
 * Register an overlay with the Escape stack. Returns an idempotent
 * remover that removes this handle by identity (safe for out-of-order
 * closes, since overlays can close in any order).
 */
export function pushOverlay(dismiss: () => void): () => void {
  const handle: OverlayHandle = { dismiss };
  stack.push(handle);
  attachListener();

  let removed = false;
  return (): void => {
    if (removed) return;
    removed = true;
    const idx = stack.indexOf(handle);
    if (idx !== -1) {
      stack.splice(idx, 1);
    }
    if (stack.length === 0) {
      detachListener();
    }
  };
}

/** Test hook: clears the stack and detaches the listener. */
export function _resetOverlayStack(): void {
  stack.length = 0;
  detachListener();
}
