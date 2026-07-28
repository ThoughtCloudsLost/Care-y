<!--
  Dialog wrapper with focus trap and focus restore.
  Modal confirmation/alert dialog. Children provide content and buttons snippets.
  Portaled to .k-page so it escapes any parent stacking contexts.
-->
<script lang="ts">
  import { Dialog } from "konsta/svelte";
  import type { ShellDialogProps } from "./types";
  import { useFocusTrap } from "./use-focus-trap.svelte";
  import { useDeferredUnmount } from "./use-deferred-unmount.svelte";
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

  const mounted = useDeferredUnmount({
    get opened() {
      return opened;
    },
  });
</script>

<div
  use:portal={".k-page"}
  bind:this={trap.dialogEl}
  role="dialog"
  aria-modal={opened ? "true" : undefined}
  inert={!opened ? true : undefined}
  class="shell-dialog-root"
>
  <ShellBackdrop {opened} ondismiss={trap.handleDismiss} />
  <Dialog {opened} {title} backdrop={false}>
    {#if mounted.current}
      {@render contentSnippet()}
    {/if}
    {#snippet buttons()}
      {#if mounted.current}
        {@render buttonsSnippet()}
      {/if}
    {/snippet}
  </Dialog>
</div>

<style>
  /* Closed dialogs stay mounted; inert plus delayed visibility keeps them
     out of the accessibility tree and axe evaluation while letting the
     close transition finish (mirrors ShellSheet). */
  .shell-dialog-root:not([inert]) {
    visibility: visible;
    transition: none;
  }

  .shell-dialog-root[inert] {
    visibility: hidden;
    transition: visibility 0s var(--anim-overlay-outro, 400ms);
  }

  @media (prefers-reduced-motion: reduce) {
    .shell-dialog-root[inert] {
      transition-delay: 0s;
    }
  }
</style>
