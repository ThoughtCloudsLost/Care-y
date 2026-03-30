<!--
  Route-level content wrapper for scroll and layout control.
  Does NOT render a Konsta Page (that lives in AppShell).
  lockScroll disables scrolling for chat views with a fixed input bar at the bottom.
-->
<script lang="ts">
  import type { PageLayoutProps } from "./types";

  let {
    lockScroll = false,
    bottomBar,
    touchAction = "auto",
    children,
  }: PageLayoutProps = $props();
</script>

<div class="page-layout" class:lock-scroll={lockScroll}>
  {#if lockScroll}
    <div class="scroll-region" style:touch-action={touchAction}>
      {@render children()}
    </div>
  {:else}
    {@render children()}
  {/if}
  {#if bottomBar}
    <div class="bottom-bar">
      {@render bottomBar()}
    </div>
  {/if}
</div>

<style>
  .page-layout {
    display: contents;
  }

  .page-layout.lock-scroll {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .scroll-region {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .bottom-bar {
    flex-shrink: 0;
    padding-bottom: env(safe-area-inset-bottom);
  }
</style>
