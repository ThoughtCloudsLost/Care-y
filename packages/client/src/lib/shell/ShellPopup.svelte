<!--
  Popup wrapper with focus trap and focus restore.
  Contains its own Navbar for navigation and a scrollable content area.
  Portaled to .k-page so it escapes any parent stacking contexts.
-->
<script lang="ts">
  import { Popup, Navbar, Link } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { ShellPopupProps } from "./types";
  import { useFocusTrap } from "./use-focus-trap.svelte";
  import { portal } from "./portal";

  let { opened, ondismiss, title, children }: ShellPopupProps = $props();

  const trap = useFocusTrap({
    get opened() {
      return opened;
    },
    get ondismiss() {
      return ondismiss;
    },
  });
</script>

<div use:portal={".k-page"}>
  <Popup
    {opened}
    onBackdropClick={trap.handleDismiss}
    class="glass shell-popup"
  >
    <div
      bind:this={trap.dialogEl}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabindex="-1"
      class="popup-dialog"
    >
      {#if title}
        <Navbar {title}>
          {#snippet right()}
            <Link role="button" onclick={trap.handleDismiss}
              >{m.shell_close()}</Link
            >
          {/snippet}
        </Navbar>
      {/if}
      <div class="popup-scroll">
        {@render children()}
      </div>
    </div>
  </Popup>
</div>

<style>
  /* iOS: handled by .glass utility (shared.css) */

  .popup-dialog {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .popup-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
  }
</style>
