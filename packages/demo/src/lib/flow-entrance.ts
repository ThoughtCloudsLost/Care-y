/**
 * Shared timing for the story's fullscreen-exit entrance.
 *
 * The page header (title, description, tip) is the zeroth group and
 * each subsection is the next group in reading order. FlowProse delays
 * every block by its group, and SectionRail delays rail item N by group N + 1,
 * so a rail item arrives together with the subsection it names. Both
 * read this one delay function; there is no second clock.
 *
 * Reduced motion is handled where the animation is declared (CSS
 * `animation: none` under the media query), matching chrome-fade's
 * collapse-to-zero convention.
 */

/** Fade length of one group, ms. */
export const ENTRANCE_DUR_MS = 240;

/** Stagger between consecutive groups, ms. */
export const ENTRANCE_STEP_MS = 90;

/** Delay before a group starts fading, ms. */
export function entranceDelayMs(group: number): number {
  return group * ENTRANCE_STEP_MS;
}

/** Time from entrance start until the last group has finished, ms. */
export function entranceTotalMs(lastGroup: number): number {
  return entranceDelayMs(lastGroup) + ENTRANCE_DUR_MS;
}
