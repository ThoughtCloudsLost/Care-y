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
    title,
    headerRight,
    backdrop = true,
    trapFocus = true,
    role = "dialog",
    ariaLabel,
    class: extraClass,
  }: ShellSheetProps = $props();

  const hasHeader = $derived(
    (title !== undefined && title !== "") || headerRight !== undefined,
  );

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

  // When trapFocus is false the focus-trap never activates, so Escape has
  // no handler. Add a standalone keydown listener for that case.
  $effect(() => {
    if (trapFocus || !opened) return;
    const dismiss = ondismiss;
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        e.preventDefault();
        dismiss();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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
      aria-label={ariaLabel ?? title}
      tabindex={trapFocus ? -1 : undefined}
      inert={!opened ? true : undefined}
      class="shell-sheet-content"
    >
      <div class="sheet-drag-handle" bind:this={handleRef} aria-hidden="true">
        <div class="sheet-drag-indicator"></div>
      </div>
      {#if hasHeader}
        <div class="sheet-header">
          {#if title}
            <h3 class="sheet-header-title">{title}</h3>
          {:else}
            <span></span>
          {/if}
          {#if headerRight}
            <div class="sheet-header-action">
              {@render headerRight()}
            </div>
          {/if}
        </div>
        <div class="sheet-body">
          {@render children()}
        </div>
      {:else}
        {@render children()}
      {/if}
    </div>
  </Sheet>
</div>

<style>
  /* iOS: handled by .glass utility (shared.css) */

  .shell-sheet-content {
    min-height: 50vh;
    max-height: calc(85dvh - var(--k-safe-area-top, 0px));
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: calc(var(--k-safe-area-bottom) + 1.5rem);
  }

  .shell-sheet-content:not([inert]) {
    visibility: visible;
    transition: none;
  }

  .shell-sheet-content[inert] {
    visibility: hidden;
    transition: visibility 0s 400ms;
  }

  @media (prefers-reduced-motion: reduce) {
    .shell-sheet-content[inert] {
      transition-delay: 0s;
    }
  }

  .shell-sheet-content:has(.sheet-header) {
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
    padding-bottom: 0;
  }

  .sheet-header {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-sm) var(--space-lg);
    border-bottom: 1px solid color-mix(in srgb, var(--ink) 8%, transparent);
    background: var(--surface);
    flex-shrink: 0;
  }

  .sheet-header-title {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--ink);
    margin: 0;
  }

  .sheet-header-action {
    flex-shrink: 0;
  }

  .sheet-body {
    flex: 1;
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
    flex-shrink: 0;
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
