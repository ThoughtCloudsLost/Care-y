<!--
  Quick-exit control for portal pages.

  Icon-only 44px native button, deliberately unlabeled on screen.
  A visible "exit" word is suspicious when glimpsed on a shared device.

  Activation (tap or Escape anywhere on the page):
    1. Scrub document.title
    2. session.destroy() (zero seed, auth, private key)
    3. location.replace(safeUrl) (no back-button entry)

  pagehide zeroes key material as a fallback.
-->
<script lang="ts">
  import { LogOut } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface QuickExitProps {
    /** Called to zero all key material before navigation. */
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
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  });

  $effect(() => {
    function onPagehide(): void {
      ondestroy();
    }
    window.addEventListener("pagehide", onPagehide);
    return () => window.removeEventListener("pagehide", onPagehide);
  });
</script>

<button
  type="button"
  class="quick-exit"
  aria-label={m.portal_quick_exit_label()}
  onclick={exit}
  data-testid="quick-exit"
>
  <LogOut size={20} aria-hidden="true" />
</button>

<style>
  .quick-exit {
    position: fixed;
    top: calc(env(safe-area-inset-top, 0px) + 6px);
    right: 12px;
    z-index: 30;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--ink);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    border-radius: 50%;
    padding: 0;
  }

  .quick-exit:active {
    opacity: 0.5;
  }
</style>
