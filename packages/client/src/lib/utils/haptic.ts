/**
 * Trigger a short vibration as tactile feedback.
 *
 * Uses the Vibration API (`navigator.vibrate`), which works in PWA context
 * on Android. Falls back silently on iOS and unsupported browsers (no-op).
 */
export function haptic(ms = 10): void {
  if ("vibrate" in navigator) {
    navigator.vibrate(ms);
  }
}
