<!--
  Sheet modal wrapper with focus trap and focus restore.
  Focus moves into the sheet on open, traps Tab/Shift+Tab, closes on Escape,
  and restores focus to the trigger element on close.
-->
<script lang="ts">
  import { Sheet } from "konsta/svelte";
  import type { ShellSheetProps } from "./types";
  import { useFocusTrap } from "./use-focus-trap.svelte";

  let { opened, ondismiss, children }: ShellSheetProps = $props();

  const trap = useFocusTrap({
    get opened() {
      return opened;
    },
    get ondismiss() {
      return ondismiss;
    },
  });
</script>

<Sheet {opened} onBackdropClick={trap.handleDismiss}>
  <div
    bind:this={trap.dialogEl}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    class="shell-sheet-content"
  >
    {@render children()}
  </div>
</Sheet>

<style>
  .shell-sheet-content {
    min-height: 30vh;
  }
</style>
