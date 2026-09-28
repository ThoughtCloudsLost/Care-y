/**
 * Step rules for the post-login onboarding wizard (/complete).
 * Pure functions so the page's Back behaviour is testable on its own.
 */

/** Steps the post-login wizard can show, in the order it shows them. */
export type CompletionStepId = "password" | "briefing" | "twofa";

/**
 * Whether Back is offered on `step`. The first step has no Back, and a
 * completed password step is never re-entered: its form would ask for
 * the new password as the current one. Any step past the password step
 * means the password step completed, so the step right after it behaves
 * as the first step. Back between later steps is unaffected.
 */
export function canGoBack(
  step: number,
  stepIds: readonly CompletionStepId[],
): boolean {
  const firstBackTarget = stepIds.slice(0, step).lastIndexOf("password") + 1;
  return step > firstBackTarget;
}
