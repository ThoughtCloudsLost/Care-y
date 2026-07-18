/**
 * Reactive signal for opaque navbar glass mode.
 *
 * Any component can request a more opaque/blurred chrome by calling
 * requestOpaqueChrome(). AppShell reads chromeIntensity() (0-1) to
 * interpolate the navbar bgBlur and bg layers. Ref-counted so multiple
 * consumers can request independently.
 *
 * For continuous control (drag gestures), setChromeIntensity() overrides
 * the binary ref-counted value while active. Call setChromeIntensity(null)
 * to release and fall back to the ref-counted state.
 *
 * Usage in a consumer component:
 *   $effect(() => {
 *     if (shouldActivate) {
 *       const release = requestOpaqueChrome();
 *       return release;
 *     }
 *   });
 */

import { untrack } from "svelte";

let requestCount = $state(0);
let manualIntensity: number | null = $state(null);

export function requestOpaqueChrome(): () => void {
  // untrack: callers invoke this from $effect bodies. requestCount++
  // is a read+write; without untrack the caller's effect subscribes
  // to requestCount and loops (effect_update_depth_exceeded).
  untrack(() => requestCount++);
  let released = false;
  return (): void => {
    if (released) return;
    released = true;
    untrack(() => requestCount--);
  };
}

export function isChromeOpaque(): boolean {
  return requestCount > 0;
}

/**
 * Continuous chrome intensity (0 = transparent blur, 1 = fully opaque).
 * When a manual override is active (drag gesture), returns that value.
 * Otherwise falls back to the binary ref-counted state.
 */
export function chromeIntensity(): number {
  if (manualIntensity != null) return manualIntensity;
  return requestCount > 0 ? 1 : 0;
}

/**
 * Set a continuous intensity override for drag gestures.
 * Pass null to release and fall back to the ref-counted state.
 */
export function setChromeIntensity(value: number | null): void {
  untrack(() => {
    manualIntensity = value;
  });
}

const FLASH_DURATION_MS = 2500;
let flashRelease: (() => void) | null = null;
let flashTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Briefly enhance the chrome glass on interaction. Debounced: repeated
 * calls reset the timer. Composes with persistent requests (ref-counted).
 */
export function flashOpaqueChrome(): void {
  if (flashTimer != null) {
    clearTimeout(flashTimer);
  }
  flashRelease ??= requestOpaqueChrome();
  flashTimer = setTimeout(() => {
    flashRelease?.();
    flashRelease = null;
    flashTimer = null;
  }, FLASH_DURATION_MS);
}
