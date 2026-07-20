/**
 * iOS Safari keyboard viewport utility.
 *
 * Safari does NOT support `interactive-widget=resizes-content` (Chrome/Firefox
 * only). On iOS Safari, `position: fixed; bottom: 0` anchors to the Layout
 * Viewport, which does not shrink when the software keyboard opens. The only
 * reliable technique is the VisualViewport API.
 *
 * This utility:
 * 1. Syncs `--app-height` to `visualViewport.height` (visible area above keyboard)
 * 2. Syncs `--vv-offset-top` to `visualViewport.offsetTop` (scroll offset of
 *    visual viewport within layout viewport, changes when user scrolls with
 *    keyboard open)
 * 3. Toggles `.keyboard-open` on `<html>` when the keyboard is detected
 *
 * To dock a toolbar above the keyboard, use:
 *   position: fixed;
 *   top: calc(var(--vv-offset-top, 0px) + var(--app-height, 100dvh));
 *   transform: translateY(-100%);
 *
 * This positions the toolbar's bottom edge at the top of the keyboard.
 *
 * Listens to both `resize` (keyboard open/close) and `scroll` (user scrolls
 * while keyboard is open) events on VisualViewport.
 *
 * Call once at app init; returns a cleanup function for teardown.
 */

const KEYBOARD_THRESHOLD = 150;

function noop(): void {
  /* no visualViewport support */
}

function bindViewport(vv: VisualViewport): () => void {
  let raf = 0;
  const style = document.documentElement.style;
  const classList = document.documentElement.classList;

  function update(): void {
    const height = vv.height;
    const offsetTop = vv.offsetTop;
    const kbHeight = Math.max(0, window.innerHeight - height);

    style.setProperty("--app-height", String(height) + "px");
    style.setProperty("--vv-offset-top", String(offsetTop) + "px");
    style.setProperty("--keyboard-height", String(kbHeight) + "px");

    const keyboardOpen = kbHeight > KEYBOARD_THRESHOLD;
    classList.toggle("keyboard-open", keyboardOpen);
  }

  function onViewportChange(): void {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  }

  vv.addEventListener("resize", onViewportChange);
  vv.addEventListener("scroll", onViewportChange);
  update();

  return () => {
    vv.removeEventListener("resize", onViewportChange);
    vv.removeEventListener("scroll", onViewportChange);
    cancelAnimationFrame(raf);
    style.removeProperty("--app-height");
    style.removeProperty("--vv-offset-top");
    style.removeProperty("--keyboard-height");
    classList.remove("keyboard-open");
  };
}

export function initKeyboardViewport(): () => void {
  const vv = window.visualViewport;
  if (!vv) return noop;
  return bindViewport(vv);
}
