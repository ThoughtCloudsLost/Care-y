/**
 * Step rules for the onboarding wizards: the post-login wizard at
 * /complete and the invite first-login wizard. Pure functions so each
 * page's Back behaviour is testable on its own.
 */

/** Steps the post-login wizard can show, in the order it shows them. */
export type CompletionStepId = "password" | "briefing" | "twofa";

/** Steps the invite first-login wizard shows, in the order it shows them. */
export type FirstLoginStepId = "account" | "briefing" | "twofa";

/** Any step either wizard can show. */
export type OnboardingStepId = CompletionStepId | FirstLoginStepId;

/**
 * Steps that are never re-entered once completed. The password form
 * would ask for the new password as the current one; the account form
 * would submit an invite that account creation already spent.
 */
const ONE_WAY_STEPS: ReadonlySet<OnboardingStepId> = new Set<OnboardingStepId>([
  "password",
  "account",
]);

/**
 * Whether Back is offered on `step`. The first step has no Back, and a
 * completed one-way step (password or account) is never re-entered, so
 * the step right after it behaves as the first step. Back between later
 * steps is unaffected.
 */
export function canGoBack(
  step: number,
  stepIds: readonly OnboardingStepId[],
): boolean {
  let firstBackTarget = 0;
  const end = Math.min(step, stepIds.length);
  for (let i = 0; i < end; i += 1) {
    const id = stepIds.at(i);
    if (id !== undefined && ONE_WAY_STEPS.has(id)) {
      firstBackTarget = i + 1;
    }
  }
  return step > firstBackTarget;
}
