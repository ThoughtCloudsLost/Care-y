<!--
  Floating side panel with focus trap, focus restore, and swipe-to-dismiss.
  Opens from left (default) or right. Closes on backdrop click, Escape,
  or swiping the drag handle toward the panel's origin edge.
  Portaled to .k-page so it escapes parent stacking contexts.
-->
<script lang="ts">
  import { Panel } from "konsta/svelte";
  import type { ShellPanelProps } from "./types";
  import { useFocusTrap } from "./use-focus-trap.svelte";
  import { useDeferredUnmount } from "./use-deferred-unmount.svelte";
  import { useDragDismiss } from "./use-drag-dismiss.svelte";
  import { portal } from "./portal";
  import ShellBackdrop from "./ShellBackdrop.svelte";

  let {
    opened,
    ondismiss,
    side = "left",
    ariaLabel,
    children,
  }: ShellPanelProps = $props();

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

  let handleRef: HTMLElement | undefined = $state();

  const drag = useDragDismiss({
    get ondismiss() {
      return trap.handleDismiss;
    },
    get opened() {
      return opened;
    },
    get handleEl() {
      return handleRef;
    },
    axis: "x",
    get direction() {
      return side === "left" ? (-1 as const) : (1 as const);
    },
    parentDepth: 1,
  });
</script>

<div use:portal={".k-page"}>
  <ShellBackdrop {opened} ondismiss={trap.handleDismiss} />
  <Panel {opened} {side} floating backdrop={false} class="glass">
    <div
      bind:this={trap.dialogEl}
      use:drag.action
      role="dialog"
      aria-modal={opened ? "true" : undefined}
      aria-label={ariaLabel}
      tabindex="-1"
      inert={!opened ? true : undefined}
      class="shell-panel-content"
    >
      <div class="panel-inner" class:handle-left={side === "right"}>
        <div class="panel-body">
          {#if mounted.current}
            {@render children()}
          {/if}
        </div>
        <div class="panel-drag-handle" bind:this={handleRef} aria-hidden="true">
          <div class="panel-drag-indicator"></div>
        </div>
      </div>
    </div>
  </Panel>
</div>

<style>
  .shell-panel-content {
    height: 100%;
  }

  /* Closed panels stay mounted; inert plus delayed visibility keeps them
     out of the accessibility tree and axe evaluation while letting the
     close transition finish (mirrors ShellSheet). */
  .shell-panel-content:not([inert]) {
    visibility: visible;
    transition: none;
  }

  .shell-panel-content[inert] {
    visibility: hidden;
    transition: visibility 0s var(--anim-overlay-outro, 400ms);
  }

  @media (prefers-reduced-motion: reduce) {
    .shell-panel-content[inert] {
      transition-delay: 0s;
    }
  }

  .panel-inner {
    display: flex;
    height: 100%;
  }

  .panel-inner.handle-left {
    flex-direction: row-reverse;
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .panel-drag-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    flex-shrink: 0;
    cursor: grab;
    touch-action: none;
  }

  .panel-drag-handle:active {
    cursor: grabbing;
  }

  .panel-drag-indicator {
    width: 4px;
    height: 36px;
    border-radius: 2px;
    background: var(--muted, rgba(128, 128, 128, 0.4));
    opacity: 0.5;
  }
</style>
