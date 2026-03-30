<!--
  Popup wrapper with focus trap and focus restore.
  Contains its own Page + Navbar for independent scroll context and navigation.
-->
<script lang="ts">
  import { Popup, Page, Navbar, Link } from "konsta/svelte";
  import type { ShellPopupProps } from "./types";
  import { activateFocusTrap } from "./focus-trap";

  let { opened, ondismiss, title, children }: ShellPopupProps = $props();

  let dialogEl: HTMLDivElement | undefined = $state(undefined);
  let triggerEl: HTMLElement | null = null;
  let cleanupTrap: (() => void) | null = null;

  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- bind:this sets dialogEl after mount
    if (!opened || dialogEl == null) return;
    const el = dialogEl;

    const active = document.activeElement;
    triggerEl = active instanceof HTMLElement ? active : null;

    requestAnimationFrame(() => {
      cleanupTrap = activateFocusTrap({
        container: el,
        onEscape: handleDismiss,
      });
    });

    return () => {
      if (cleanupTrap != null) {
        cleanupTrap();
        cleanupTrap = null;
      }
    };
  });

  function handleDismiss(): void {
    ondismiss();
    requestAnimationFrame(() => {
      triggerEl?.focus();
      triggerEl = null;
    });
  }
</script>

<Popup {opened} onBackdropClick={handleDismiss}>
  <div bind:this={dialogEl} role="dialog" aria-modal="true" aria-label={title}>
    <Page>
      {#if title}
        <Navbar {title}>
          {#snippet right()}
            <Link navbar role="button" onclick={handleDismiss}>Close</Link>
          {/snippet}
        </Navbar>
      {/if}
      {@render children()}
    </Page>
  </div>
</Popup>
