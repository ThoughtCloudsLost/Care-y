<!--
  Action sheet wrapper with focus trap and focus restore.
  Wraps Konsta Actions component. Children are typically ActionsGroup + ActionsButton.
  Portaled to .k-page so it escapes any parent stacking contexts.
-->
<script lang="ts">
  import { Actions } from "konsta/svelte";
  import type { ShellActionSheetProps } from "./types";
  import { useFocusTrap } from "./use-focus-trap.svelte";
  import {
    useDeferredUnmount,
    ACTION_SHEET_OUTRO_MS,
  } from "./use-deferred-unmount.svelte";
  import { portal } from "./portal";
  import ShellBackdrop from "./ShellBackdrop.svelte";

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

  // ACTION_SHEET_OUTRO_MS is 400 (Material's duration-400). Konsta Actions
  // uses duration-300 on iOS, but themeStore is not available at this layer
  // without adding a new import dependency. 400 is the safe ceiling: on iOS
  // it over-waits by 100ms (same as the pre-fix behavior), and on Material
  // it matches exactly.
  const mounted = useDeferredUnmount({
    get opened() {
      return opened;
    },
    durationMs: ACTION_SHEET_OUTRO_MS,
  });
</script>

<div use:portal={".k-page"}>
  <ShellBackdrop {opened} ondismiss={trap.handleDismiss} />
  <Actions {opened} backdrop={false} class="shell-action-sheet">
    <div
      data-testid="actions-sheet"
      bind:this={trap.dialogEl}
      role="dialog"
      aria-modal={opened ? "true" : undefined}
      aria-label={ariaLabel ?? undefined}
      tabindex="-1"
      inert={!opened ? true : undefined}
      class="shell-actions-content"
    >
      {#if mounted.current}{@render children()}{/if}
    </div>
  </Actions>
</div>

<style>
  @media (min-width: 1024px) {
    :global(.shell-action-sheet) {
      max-width: 400px;
      margin-inline: auto;
    }
  }

  /* Closed action sheets stay mounted; inert plus delayed visibility keeps
     them out of the accessibility tree and axe evaluation while letting the
     close transition finish (mirrors ShellSheet). */
  .shell-actions-content:not([inert]) {
    visibility: visible;
    transition: none;
  }

  .shell-actions-content[inert] {
    visibility: hidden;
    transition: visibility 0s var(--anim-overlay-outro, 400ms);
  }

  @media (prefers-reduced-motion: reduce) {
    .shell-actions-content[inert] {
      transition-delay: 0s;
    }
  }
</style>
