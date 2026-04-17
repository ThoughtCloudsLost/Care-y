<!--
  Dialog wrapper with focus trap and focus restore.
  Modal confirmation/alert dialog. Children provide content and buttons snippets.
  Portaled to .k-page so it escapes any parent stacking contexts.
-->
<script lang="ts">
  import { Dialog } from "konsta/svelte";
  import type { ShellDialogProps } from "./types";
  import { useFocusTrap } from "./use-focus-trap.svelte";
  import { portal } from "./portal";

  let {
    opened,
    ondismiss,
    title,
    content: contentSnippet,
    buttons: buttonsSnippet,
  }: ShellDialogProps = $props();

  const trap = useFocusTrap({
    get opened() {
      return opened;
    },
    get ondismiss() {
      return ondismiss;
    },
  });
</script>

<div use:portal={".k-page"} bind:this={trap.dialogEl}>
  <Dialog {opened} {title} onBackdropClick={trap.handleDismiss}>
    {@render contentSnippet()}
    {#snippet buttons()}
      {@render buttonsSnippet()}
    {/snippet}
  </Dialog>
</div>
