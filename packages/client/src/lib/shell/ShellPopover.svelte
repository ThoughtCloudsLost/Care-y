<!--
  Popover wrapper with focus trap and focus restore.
  Anchors to a target element. Closes on backdrop click or Escape.
  Portaled to .k-page so it escapes any parent stacking contexts.
-->
<script lang="ts">
  import { Popover } from "konsta/svelte";
  import type { ShellPopoverProps } from "./types";
  import { useFocusTrap } from "./use-focus-trap.svelte";
  import {
    useDeferredUnmount,
    OVERLAY_OUTRO_MS,
  } from "./use-deferred-unmount.svelte";
  import { portal } from "./portal";
  import ShellBackdrop from "./ShellBackdrop.svelte";

  let {
    opened,
    ondismiss,
    target,
    angle = false,
    placement,
    ariaLabel,
    children,
  }: ShellPopoverProps = $props();

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
    durationMs: OVERLAY_OUTRO_MS,
  });
</script>

<div use:portal={".k-page"}>
  <ShellBackdrop {opened} ondismiss={trap.handleDismiss} />
  <Popover {opened} {target} {angle} {placement} backdrop={false}>
    <div
      bind:this={trap.dialogEl}
      role="dialog"
      aria-modal={opened ? "true" : undefined}
      aria-label={ariaLabel ?? undefined}
      tabindex="-1"
      inert={!opened ? true : undefined}
      class="shell-popover-content"
    >
      {#if mounted.current}{@render children()}{/if}
    </div>
  </Popover>
</div>

<style>
  /* Closed popovers stay mounted; inert plus delayed visibility keeps them
     out of the accessibility tree and axe evaluation while letting the
     close transition finish (mirrors ShellSheet). */
  .shell-popover-content:not([inert]) {
    visibility: visible;
    transition: none;
  }

  .shell-popover-content[inert] {
    visibility: hidden;
    transition: visibility 0s var(--anim-overlay-outro, 400ms);
  }

  @media (prefers-reduced-motion: reduce) {
    .shell-popover-content[inert] {
      transition-delay: 0s;
    }
  }
</style>
