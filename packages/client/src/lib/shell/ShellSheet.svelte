<!--
  Sheet modal wrapper with focus trap and focus restore.
  Focus moves into the sheet on open, traps Tab/Shift+Tab, closes on Escape,
  and restores focus to the trigger element on close.
-->
<script lang="ts">
  import { Sheet } from "konsta/svelte";
  import type { ShellSheetProps } from "./types";
  import { activateFocusTrap } from "./focus-trap";

  let { opened, ondismiss, children }: ShellSheetProps = $props();

  let dialogEl: HTMLDivElement | null = $state(null);
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

<Sheet {opened} onBackdropClick={handleDismiss}>
  <div bind:this={dialogEl} role="dialog" aria-modal="true">
    {@render children()}
  </div>
</Sheet>
