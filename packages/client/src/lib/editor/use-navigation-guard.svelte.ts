/**
 * Navigation guard for editor pages with unsaved changes.
 *
 * Intercepts SvelteKit navigations and browser close/refresh when the
 * editor has unsaved changes. Shows a discard confirmation dialog via
 * the returned reactive state (route page renders the Konsta Dialog).
 *
 * Must be called during component initialization (top-level script)
 * because it registers a beforeNavigate lifecycle callback internally.
 *
 * Follows the same reactive-shared-object pattern as usePTR().
 */

import { beforeNavigate, goto } from "$app/navigation";

interface NavigationGuardOptions {
  /** Reactive getter: whether the editor has unsaved changes. */
  isDirty: () => boolean;
  /** Route to navigate to when discarding without a pending URL. */
  fallbackUrl: string;
  /** Called just before navigation proceeds after discard confirmation. */
  onLeave?: () => void;
}

export interface NavigationGuard {
  /** Whether the discard dialog should be open. */
  readonly discardDialogOpen: boolean;
  /** Close the dialog, stay on page. */
  dismiss(): void;
  /** Confirm discard and proceed with navigation. */
  confirmDiscard(): void;
  /** Bypass the guard for the next navigation (call before goto after save). */
  allowNavigation(): void;
}

export function useNavigationGuard(
  options: NavigationGuardOptions,
): NavigationGuard {
  let forceNavigate = false;
  let discardDialogOpen = $state(false);
  let pendingUrl: string | null = null;
  // For popstate navigations (browser back, shellBack), store the delta
  // so confirmDiscard can replay via history.go() instead of goto().
  // goto() pushes a new entry, which creates edit/detail loops.
  let pendingDelta: number | null = null;

  beforeNavigate((nav) => {
    if (forceNavigate || !options.isDirty()) return;
    nav.cancel();
    // For willUnload (tab close/refresh), cancel() triggers the native
    // browser confirmation dialog. No custom Konsta Dialog needed.
    if (nav.willUnload) return;
    pendingUrl = nav.to?.url.href ?? null;
    pendingDelta = nav.delta ?? null;
    discardDialogOpen = true;
  });

  // Register beforeunload for browser close/refresh protection.
  // The effect cleanup removes the handler when the component unmounts
  // or when dirty becomes false.
  $effect(() => {
    if (!options.isDirty()) return;
    function handler(e: BeforeUnloadEvent): void {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  });

  const guard: NavigationGuard = {
    get discardDialogOpen(): boolean {
      return discardDialogOpen;
    },

    dismiss(): void {
      discardDialogOpen = false;
      pendingUrl = null;
      pendingDelta = null;
    },

    confirmDiscard(): void {
      discardDialogOpen = false;
      forceNavigate = true;
      options.onLeave?.();
      // Replay popstate navigations via history.go() to avoid pushing
      // a duplicate entry (which creates back-button loops between
      // edit and detail views). For goto/link navigations, use goto().
      if (pendingDelta != null) {
        history.go(pendingDelta);
      } else {
        // pendingUrl is a full href from nav.to.url.href (already resolved
        // by SvelteKit's router). fallbackUrl is pre-resolved by the caller
        // via $app/paths resolve(). Both are safe to pass to goto() directly.
        // svelte/no-navigation-without-resolve: false positive, URLs are
        // already resolved at their source.
        // eslint-disable-next-line svelte/no-navigation-without-resolve
        void goto(pendingUrl ?? options.fallbackUrl);
      }
      pendingUrl = null;
      pendingDelta = null;
    },

    allowNavigation(): void {
      forceNavigate = true;
    },
  };

  return guard;
}
