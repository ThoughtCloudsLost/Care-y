<!--
  Page wrapper using Konsta's Page as the scroll container.
  Page is `absolute overflow-auto` by default. Within the flex shell layout,
  the main element is the positioning context, so Page fills the content area
  between the navbar and tabbar.
  lockScroll disables Page scrolling and uses an internal flex layout
  for chat views with a fixed input bar at the bottom.
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

<Page class={lockScroll ? "!overflow-hidden flex flex-col" : ""}>
  {#if lockScroll}
    <div
      class="flex-1 min-h-0 overflow-y-auto overscroll-contain"
      style:touch-action={touchAction}
    >
      {@render children()}
    </div>
  {:else}
    {@render children()}
  {/if}
  {#if bottomBar}
    <div class="shrink-0" style:padding-bottom="env(safe-area-inset-bottom)">
      {@render bottomBar()}
    </div>
  {/if}
</Page>
