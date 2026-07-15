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
  import ShellBackdrop from "./ShellBackdrop.svelte";

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

<div
  use:portal={".k-page"}
  bind:this={trap.dialogEl}
  role="dialog"
  aria-modal={opened ? "true" : undefined}
>
  <ShellBackdrop {opened} ondismiss={trap.handleDismiss} />
  <Dialog {opened} {title} backdrop={false}>
    {@render contentSnippet()}
    {#snippet buttons()}
      {@render buttonsSnippet()}
    {/snippet}
  </Dialog>
</div>
