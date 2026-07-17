/**
 * Reactive signal for enhanced navbar glass opacity.
 *
 * Any component can request a more opaque/blurred chrome by calling
 * requestEnhancedChrome(). AppShell reads isChromeEnhanced() to
 * adjust the navbar bgBlur and bg layers. Ref-counted so multiple
 * consumers can request independently.
 *
 * Usage in a consumer component:
 *   $effect(() => {
 *     if (shouldEnhance) {
 *       const release = requestEnhancedChrome();
 *       return release;
 *     }
 *   });
 */

let requestCount = $state(0);

export function requestEnhancedChrome(): () => void {
  requestCount++;
  let released = false;
  return (): void => {
    if (released) return;
    released = true;
    requestCount--;
  };
}

export function isChromeEnhanced(): boolean {
  return requestCount > 0;
}

const FLASH_DURATION_MS = 2500;
let flashRelease: (() => void) | null = null;
let flashTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Briefly enhance the chrome glass on interaction. Debounced: repeated
 * calls reset the timer. Composes with persistent requests (ref-counted).
 */
export function flashEnhancedChrome(): void {
  if (flashTimer != null) {
    clearTimeout(flashTimer);
  }
  flashRelease ??= requestEnhancedChrome();
  flashTimer = setTimeout(() => {
    flashRelease?.();
    flashRelease = null;
    flashTimer = null;
  }, FLASH_DURATION_MS);
}
