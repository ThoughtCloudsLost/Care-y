<!--
  Popup wrapper with focus trap and focus restore.
  Contains its own Page + Navbar for independent scroll context and navigation.
-->
<script lang="ts">
  import { Popup, Page, Navbar, Link } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { ShellPopupProps } from "./types";
  import { useFocusTrap } from "./use-focus-trap.svelte";

  let { opened, ondismiss, title, children }: ShellPopupProps = $props();

  const trap = useFocusTrap({
    get opened() {
      return opened;
    },
    ondismiss,
  });
</script>

<Popup {opened} onBackdropClick={trap.handleDismiss}>
  <div
    bind:this={trap.dialogEl}
    role="dialog"
    aria-modal="true"
    aria-label={title}
    tabindex="-1"
  >
    <Page>
      {#if title}
        <Navbar {title}>
          {#snippet right()}
            <Link role="button" onclick={trap.handleDismiss}
              >{m.shell_close()}</Link
            >
          {/snippet}
        </Navbar>
      {/if}
      {@render children()}
    </Page>
  </div>
</Popup>
