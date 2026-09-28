/**
 * Global re-verification store. Drives the second-factor sheet that opens
 * over the current page when the server clears the session's verified
 * flag mid-session (for example after an IP change).
 *
 * Usage:
 *   import { reverifyStore } from "$lib/stores/reverify.svelte.js";
 *   reverifyStore.open(["totp", "email"]);
 *
 * The tRPC interceptor opens it on TWOFA_REQUIRED. The (app) layout
 * renders ReverifySheet, which reads from this store. Dismissing closes
 * it; the next call that fails with TWOFA_REQUIRED opens it again.
 *
 * ReverifySheet registers itself while mounted. Routes outside the (app)
 * layout have no sheet to show, so the interceptor checks `registered`
 * and sends the user to /login instead of opening a store nothing renders.
 */

function createReverifyStore(): {
  readonly opened: boolean;
  readonly methods: string[];
  readonly registered: boolean;
  open(methods: readonly string[]): void;
  close(): void;
  register(): () => void;
} {
  let opened = $state(false);
  let methods = $state<string[]>([]);
  // Plain counter: read only at interceptor time, never rendered.
  let mountedSheets = 0;

  return {
    get opened(): boolean {
      return opened;
    },

    get methods(): string[] {
      return methods;
    },

    get registered(): boolean {
      return mountedSheets > 0;
    },

    open(next: readonly string[]): void {
      methods = [...next];
      opened = true;
    },

    close(): void {
      opened = false;
    },

    register(): () => void {
      mountedSheets++;
      let unregistered = false;
      return () => {
        // Guard so a repeated call cannot drop another sheet's registration.
        if (unregistered) return;
        unregistered = true;
        mountedSheets--;
      };
    },
  };
}

export const reverifyStore = createReverifyStore();
