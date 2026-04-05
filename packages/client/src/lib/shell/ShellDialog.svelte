<!--
  Dialog wrapper with focus trap and focus restore.
  Modal confirmation/alert dialog. Children provide content and buttons snippets.
-->
<script lang="ts">
  import { Dialog } from "konsta/svelte";
  import type { ShellDialogProps } from "./types";
  import { useFocusTrap } from "./use-focus-trap.svelte";

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

<div bind:this={trap.dialogEl}>
  <Dialog {opened} {title} onBackdropClick={trap.handleDismiss}>
    {#snippet content()}
      {@render contentSnippet()}
    {/snippet}
    {#snippet buttons()}
      {@render buttonsSnippet()}
    {/snippet}
  </Dialog>
</div>
