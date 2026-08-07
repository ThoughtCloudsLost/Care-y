/**
 * Plain Set tracker for engine prewarm's observed elements.
 *
 * Lives in a plain .ts file (not .svelte.ts) so the eslint
 * svelte/prefer-svelte-reactivity rule does not flag the Set. The
 * observed set is scratch bookkeeping, not reactive state: nothing
 * renders from it, and making it a SvelteSet caused O(n^2) churn as
 * each .add() bumped the set version and re-ran every figure's
 * observe() effect.
 */

export interface PrewarmObservedTracker {
  /** Whether the element is already being observed. */
  has(el: HTMLElement): boolean;
  /** Mark the element as observed. */
  add(el: HTMLElement): void;
  /** Remove all tracked elements. */
  clear(): void;
}

export function createPrewarmObserved(): PrewarmObservedTracker {
  const set = new Set<HTMLElement>();
  return {
    has(el: HTMLElement): boolean {
      return set.has(el);
    },
    add(el: HTMLElement): void {
      set.add(el);
    },
    clear(): void {
      set.clear();
    },
  };
}
