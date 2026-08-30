/**
 * One wiring between a chat scroll region and ShellNavbar's collapsible
 * subnavbar. Org thread and client portal both consume it, so the
 * hide/reveal behavior cannot diverge.
 *
 * Must be called during component init (it creates an effect via
 * useScrollDirection).
 */

import { useScrollDirection } from "./use-scroll-direction.svelte.js";

export interface UseThreadChromeOptions {
  /** Reactive getter for the thread scroll container. */
  get scrollEl(): HTMLElement | undefined;
  /** Reactive getter: true once the initial bottom scroll has happened. */
  get ready(): boolean;
  /** Reactive getter: true while an overlay needs the row kept visible. */
  get pinned(): boolean;
}

export interface UseThreadChromeReturn {
  /** True while the subnavbar row should collapse. */
  readonly subnavbarHidden: boolean;
}

export function useThreadChrome(
  options: UseThreadChromeOptions,
): UseThreadChromeReturn {
  const dir = useScrollDirection({
    get scrollEl() {
      return options.scrollEl;
    },
    invert: true,
  });

  return {
    get subnavbarHidden(): boolean {
      return options.ready && dir.hidden && !options.pinned;
    },
  };
}
