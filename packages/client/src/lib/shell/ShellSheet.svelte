<!--
  Sheet modal wrapper. Portaled to .k-page so it escapes stacking contexts.
  Uses Konsta's glass tokens for iOS frosted glass appearance.

  Configurable via props:
    backdrop (default true) - show overlay behind the sheet
    trapFocus (default true) - trap Tab/Escape inside the sheet
    role (default "dialog") - ARIA role on the content wrapper
    ariaLabel - ARIA label (for non-dialog roles)
    class - additional CSS class on the Sheet element
-->
<script lang="ts">
  import { Sheet } from "konsta/svelte";
  import type { ShellSheetProps } from "./types";
  import { useFocusTrap } from "./use-focus-trap.svelte";
  import { portal } from "./portal";

  let {
    opened,
    ondismiss,
    children,
    backdrop = true,
    trapFocus = true,
    role = "dialog",
    ariaLabel,
    class: extraClass,
  }: ShellSheetProps = $props();

  const trap = useFocusTrap({
    get opened() {
      return trapFocus && opened;
    },
    get ondismiss() {
      return ondismiss;
    },
  });

  const sheetClass = $derived(
    ["shell-sheet", extraClass].filter(Boolean).join(" "),
  );
</script>

<div use:portal={".k-page"}>
  <Sheet
    {opened}
    {backdrop}
    onBackdropClick={backdrop ? trap.handleDismiss : undefined}
    class={sheetClass}
  >
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div
      bind:this={trap.dialogEl}
      {role}
      aria-modal={role === "dialog" ? "true" : undefined}
      aria-label={ariaLabel}
      tabindex={trapFocus ? -1 : undefined}
      class="shell-sheet-content"
    >
      {@render children()}
    </div>
  </Sheet>
</div>

<style>
  /* iOS frosted glass using Konsta's glass color tokens.
     .dark is on <html>, .k-ios is on Konsta's <App> wrapper (separate elements). */
  :global(.k-ios .shell-sheet) {
    background: rgba(245, 245, 245, 0.55) !important;
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
  }
  :global(.dark .k-ios .shell-sheet) {
    background: var(--color-ios-dark-glass, rgba(50, 50, 50, 0.5)) !important;
  }

  .shell-sheet-content {
    min-height: 30vh;
    max-height: 100%;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: calc(var(--k-safe-area-bottom) + 1.5rem);
  }
</style>
