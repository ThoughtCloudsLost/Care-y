<script lang="ts">
  import type { Snippet } from "svelte";
  import { Button } from "konsta/svelte";
  import { X } from "@lucide/svelte";

  interface Props {
    actions: Snippet;
    countLabel: string;
    exitLabel: string;
    onexit: () => void;
    ariaLabel: string;
  }

  const { actions, countLabel, exitLabel, onexit, ariaLabel }: Props = $props();
</script>

<div class="bulk-action-bar" role="toolbar" aria-label={ariaLabel}>
  <Button
    tonal
    rounded
    small
    inline
    class="bulk-close-btn"
    aria-label={exitLabel}
    onclick={onexit}
  >
    <X size={16} aria-hidden="true" />
  </Button>
  <span class="bulk-count" role="status">{countLabel}</span>
  <div class="bulk-actions">
    {@render actions()}
  </div>
</div>

<style>
  .bulk-action-bar {
    display: flex;
    align-items: center;
    padding: 0.25rem 0.25rem;
    gap: 0.25rem;
    border-top: 1px solid var(--hair, var(--divider));
  }

  .bulk-actions {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-shrink: 0;
  }

  .bulk-count {
    flex: 1;
    text-align: center;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--ink);
    white-space: nowrap;
  }

  :global(.bulk-close-btn) {
    width: 1.75rem !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    background: var(--raised, transparent) !important;
    border: 1px solid var(--hair, currentColor) !important;
    border-radius: 0.5625rem !important;
    box-shadow: none !important;
    flex-shrink: 0;
  }

  :global(.bulk-close-btn svg) {
    color: var(--ink-2, var(--ink)) !important;
  }

  :global(.bulk-action-btn) {
    background: var(--raised, transparent) !important;
    border: 1px solid var(--hair, currentColor) !important;
    border-radius: 0.5625rem !important;
    box-shadow: none !important;
    gap: 0.25rem;
    font-size: var(--text-sm) !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
  }

  :global(.bulk-action-btn svg) {
    color: var(--ink-2, var(--ink)) !important;
    flex-shrink: 0;
  }
</style>
