<!--
  Tonal button. Subtle ink-tinted fill that reads on any surface (glass, cards,
  page background) in both light and dark mode. Replaces Konsta Button where
  the outline or filled styles clash with the design system.

  Use for secondary actions: "Search all", "Load more", "Show filters", etc.
  For primary actions (submit, send, call), use a stronger variant or Konsta Button.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface SoftButtonProps extends HTMLButtonAttributes {
    children: Snippet;
    /** Full width (default: false). */
    full?: boolean;
  }

  let {
    children,
    full = false,
    class: extraClass,
    ...rest
  }: SoftButtonProps = $props();
</script>

<button
  type="button"
  class="soft-btn {full ? 'soft-btn--full' : ''} {extraClass ?? ''}"
  {...rest}
>
  {@render children()}
</button>

<style>
  .soft-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm, 8px);
    padding: 0.625rem 1.25rem;
    border-radius: 0.75rem;
    border: none;
    background: color-mix(in srgb, var(--ink) 8%, transparent);
    color: var(--ink);
    font-size: var(--text-sm, 0.875rem);
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    min-height: 44px;
  }

  .soft-btn:active {
    background: color-mix(in srgb, var(--ink) 15%, transparent);
  }

  .soft-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .soft-btn--full {
    width: 100%;
  }
</style>
