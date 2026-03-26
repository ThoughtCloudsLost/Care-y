<!--
  Action sheet wrapper with focus trap and focus restore.
  Wraps Konsta Actions component. Children are typically ActionsGroup + ActionsButton.
-->
<script lang="ts">
  import { Actions } from "konsta/svelte";
  import type { ShellActionSheetProps } from "./types";
  import { activateFocusTrap } from "./focus-trap";

  let { opened, ondismiss, children }: ShellActionSheetProps = $props();

  let dialogEl: HTMLDivElement | undefined = $state(undefined);
  let triggerEl: HTMLElement | null = null;
  let cleanupTrap: (() => void) | null = null;

  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- bind:this sets dialogEl after mount
    if (!opened || dialogEl == null) return;
    const el = dialogEl;

    const active = document.activeElement;
    triggerEl = active instanceof HTMLElement ? active : null;
    cleanupTrap = activateFocusTrap({
      container: el,
      onEscape: handleDismiss,
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

<Actions {opened} onBackdropClick={handleDismiss}>
  <div bind:this={dialogEl} role="dialog" aria-modal="true">
    {@render children()}
  </div>
</Actions>
