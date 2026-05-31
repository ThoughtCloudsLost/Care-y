<!--
  Action sheet wrapper with focus trap and focus restore.
  Wraps Konsta Actions component. Children are typically ActionsGroup + ActionsButton.
  Portaled to .k-page so it escapes any parent stacking contexts.
-->
<script lang="ts">
  import { Actions } from "konsta/svelte";
  import type { ShellActionSheetProps } from "./types";
  import { useFocusTrap } from "./use-focus-trap.svelte";
  import { portal } from "./portal";

  let { opened, ondismiss, ariaLabel, children }: ShellActionSheetProps =
    $props();

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
  <Actions {opened} onBackdropClick={trap.handleDismiss}>
    <div
      bind:this={trap.dialogEl}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? undefined}
      tabindex="-1"
    >
      {@render children()}
    </div>
  </Actions>
</div>
