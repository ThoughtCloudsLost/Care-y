import { flushSync } from "svelte";

/**
 * Mounts a target and focuses an input without leaving the user gesture.
 *
 * iOS Safari opens the software keyboard only when focus() runs
 * synchronously inside the gesture handler. The normal Svelte flow
 * (set state, await tick, focus) exits the gesture window. flushSync
 * forces the mount and its effects to complete synchronously, keeping
 * focus within the gesture so the keyboard opens.
 *
 * Call from DOM event handlers only. flushSync throws when called
 * inside a running $effect or during server-side rendering.
 *
 * @param mount  State change that causes the target input to mount.
 * @param focus  Locates and returns the element to focus after the
 *               synchronous flush. Omit when the mounted component
 *               focuses itself via an $effect that runs inside the
 *               same flush (e.g. SearchNavigator's self-focus).
 */
export function gestureMount(
  mount: () => void,
  focus?: () => HTMLElement | null | undefined,
): void {
  flushSync(mount);
  focus?.()?.focus();
}
