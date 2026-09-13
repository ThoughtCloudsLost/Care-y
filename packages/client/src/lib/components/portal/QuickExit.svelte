<!--
  Quick-exit control for client pages.

  Rendered once by the (client) layout in the Navbar's right slot, so it is
  present in every state of every client page. The Navbar is a non-scrolling
  row of PageShell's flex column, which is why this no longer needs the fixed
  positioning and z-index it carried when each page rendered its own copy.

  Icon-only and deliberately unlabeled on screen. A visible "exit" word is
  suspicious when glimpsed on a shared device.

  Activation (tap or Escape anywhere on the page):
    1. Scrub document.title
    2. ondestroy() (zero seed, auth, private key)
    3. location.replace(safeUrl) (no back-button entry)

  Escape fires even while the drawer is open. The overlay stack also
  handles Escape (capture phase, attached when an overlay opens), but
  exiting takes precedence over closing a panel: the whole point of the
  control is leaving fast, and it navigates away either way. This listener
  is capture-phase and registered at layout mount, so it runs before the
  overlay stack's later-attached listener; preventDefault() makes the
  stack yield. Do not gate this behind an "is anything open" check.

  pagehide zeroes key material as a fallback.
-->
<script lang="ts">
  import { Link } from "konsta/svelte";
  import { LogOut } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface QuickExitProps {
    /** Zero all key material before navigation. No-op on pages without a session. */
    ondestroy: () => void;
    /** Org-configured safe URL, or the default weather site. */
    safeUrl: string;
  }

  let { ondestroy, safeUrl }: QuickExitProps = $props();

  function exit(): void {
    document.title = " ";
    ondestroy();
    location.replace(safeUrl);
  }

  $effect(() => {
    function onKeydown(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        e.preventDefault();
        exit();
      }
    }
    window.addEventListener("keydown", onKeydown, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKeydown, { capture: true });
  });

  $effect(() => {
    function onPagehide(): void {
      ondestroy();
    }
    window.addEventListener("pagehide", onPagehide);
    return () => window.removeEventListener("pagehide", onPagehide);
  });
</script>

<Link
  component="button"
  type="button"
  role="button"
  iconOnly
  class="quick-exit"
  aria-label={m.portal_quick_exit_label()}
  onclick={exit}
  data-testid="quick-exit"
>
  <LogOut size={20} aria-hidden="true" />
</Link>

<style>
  :global(.quick-exit) {
    min-width: 44px;
    min-height: 44px;
    color: var(--ink);
    -webkit-tap-highlight-color: transparent;
  }

  :global(.quick-exit:active) {
    opacity: 0.5;
  }
</style>
