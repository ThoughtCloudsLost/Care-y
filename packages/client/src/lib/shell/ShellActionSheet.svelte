<!--
  Action sheet wrapper with focus trap and focus restore.
  Wraps Konsta Actions component. Children are typically ActionsGroup + ActionsButton.
-->
<script lang="ts">
  import { Actions } from "konsta/svelte";
  import type { ShellActionSheetProps } from "./types";
  import { useFocusTrap } from "./use-focus-trap.svelte";

  let { opened, ondismiss, children }: ShellActionSheetProps = $props();

  const trap = useFocusTrap({
    get opened() {
      return opened;
    },
    ondismiss,
  });
</script>

<Actions {opened} onBackdropClick={trap.handleDismiss}>
  <div bind:this={trap.dialogEl} role="dialog" aria-modal="true" tabindex="-1">
    {@render children()}
  </div>
</Actions>
