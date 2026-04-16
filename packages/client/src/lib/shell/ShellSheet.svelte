<!--
  Sheet modal wrapper. Portaled to .k-page so it escapes stacking contexts.
  Uses Konsta's glass tokens for iOS frosted glass appearance.
  Includes a drag indicator and swipe-to-dismiss gesture.

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
  import { useSheetDrag } from "./use-sheet-drag.svelte";
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

  let handleRef: HTMLElement | undefined = $state();

  const drag = useSheetDrag({
    get ondismiss() {
      return trap.handleDismiss;
    },
    get opened() {
      return opened;
    },
    get handleEl() {
      return handleRef;
    },
  });

  const sheetClass = $derived(
    ["glass", "shell-sheet", extraClass].filter(Boolean).join(" "),
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
      use:drag.action
      {role}
      aria-modal={role === "dialog" ? "true" : undefined}
      aria-label={ariaLabel}
      tabindex={trapFocus ? -1 : undefined}
      class="shell-sheet-content"
    >
      <div class="sheet-drag-handle" bind:this={handleRef} aria-hidden="true">
        <div class="sheet-drag-indicator"></div>
      </div>
      {@render children()}
    </div>
  </Sheet>
</div>

<style>
  /* iOS: handled by .glass utility (shared.css) */

  .shell-sheet-content {
    min-height: 30vh;
    max-height: calc(85dvh - var(--k-safe-area-top, 0px));
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: calc(var(--k-safe-area-bottom) + 1.5rem);
  }

  .sheet-drag-handle {
    display: flex;
    justify-content: center;
    padding: 10px 0 6px;
    cursor: grab;
    touch-action: none;
  }

  .sheet-drag-handle:active {
    cursor: grabbing;
  }

  .sheet-drag-indicator {
    width: 36px;
    height: 5px;
    border-radius: 2.5px;
    background: var(--muted, rgba(128, 128, 128, 0.4));
    opacity: 0.5;
  }
</style>
