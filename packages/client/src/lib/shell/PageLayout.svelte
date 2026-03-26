<!--
  Page wrapper with contained scroll pattern (no position: fixed).
  Avoids iOS Safari keyboard issues where fixed bottom bars hide behind the keyboard.
  Uses flex column layout: scrollable content area + optional sticky bottom bar.
-->
<script lang="ts">
  import { Page } from "konsta/svelte";
  import type { PageLayoutProps } from "./types";

  let {
    lockScroll = false,
    bottomBar,
    touchAction = "auto",
    children,
  }: PageLayoutProps = $props();
</script>

<Page>
  <div
    class="page-content"
    class:lock-scroll={lockScroll}
    style:touch-action={touchAction}
    role="region"
  >
    {@render children()}
  </div>
  {#if bottomBar}
    <div class="page-bottom-bar">
      {@render bottomBar()}
    </div>
  {/if}
</Page>

<style>
  .page-content {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  .lock-scroll {
    overflow: hidden;
  }

  .page-bottom-bar {
    flex-shrink: 0;
    padding-bottom: env(safe-area-inset-bottom);
  }

  :global(.keyboard-open) .page-bottom-bar {
    padding-bottom: 0;
  }
</style>
