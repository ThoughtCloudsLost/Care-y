/**
 * Timing for the phone's boot tip.
 *
 * While the phone signs in and derives keys, a line appears over its
 * splash explaining the wait. The reveal is delayed so a fast boot
 * never flashes it.
 *
 * These live in TypeScript rather than in PhoneApp's stylesheet because
 * the outer page's entry splash is paced against them: it holds the app
 * at window size until the tip has had its say, then shrinks into the
 * frame. PhoneApp feeds both numbers to its CSS as custom properties,
 * so retiming the tip here moves the splash with it.
 */

/** How long after boot the tip starts appearing. */
export const BOOT_TIP_DELAY_MS = 600;

/** How long the tip takes to fade in once it starts. */
export const BOOT_TIP_FADE_MS = 400;

/** The moment the tip is fully legible, measured from boot. */
export const BOOT_TIP_SHOWN_MS = BOOT_TIP_DELAY_MS + BOOT_TIP_FADE_MS;
