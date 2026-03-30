/**
 * iOS Safari keyboard viewport utility.
 *
 * Syncs `--app-height` CSS custom property to `visualViewport.height` so layout
 * containers track the visible area when the software keyboard is open. Toggles
 * `.keyboard-open` on `<html>` for conditional styling (e.g. hiding the tabbar).
 *
 * Call once at app init; returns a cleanup function for teardown.
 */

const KEYBOARD_THRESHOLD = 150;

function noop(): void {
  /* no visualViewport support */
}

function bindViewport(vv: VisualViewport): () => void {
  let raf = 0;

  function update(): void {
    const height = vv.height;
    document.documentElement.style.setProperty(
      "--app-height",
      String(height) + "px",
    );
    const keyboardOpen = window.innerHeight - height > KEYBOARD_THRESHOLD;
    document.documentElement.classList.toggle("keyboard-open", keyboardOpen);
  }

  function onResize(): void {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  }

  vv.addEventListener("resize", onResize);
  update();

  return () => {
    vv.removeEventListener("resize", onResize);
    cancelAnimationFrame(raf);
    document.documentElement.style.removeProperty("--app-height");
    document.documentElement.classList.remove("keyboard-open");
  };
}

export function initKeyboardViewport(): () => void {
  const vv = window.visualViewport;
  if (vv === null) return noop;
  return bindViewport(vv);
}
