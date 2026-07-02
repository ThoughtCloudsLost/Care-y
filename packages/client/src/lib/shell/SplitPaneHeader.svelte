<!--
  Shared header bar for split-view detail panes.
  Renders close button, title (from inert navbar context), action
  buttons, and an expand-to-full-page button.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { X, Maximize2 } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";

  let {
    title,
    right,
    onclose,
    onexpand,
  }: {
    title?: string | Snippet | undefined;
    right?: Snippet | undefined;
    onclose: () => void;
    onexpand: () => void;
  } = $props();
</script>

<div class="pane-header">
  <button
    class="pane-header-btn"
    onclick={onclose}
    aria-label={m.tickets_detail_close()}
  >
    <X size={18} aria-hidden="true" />
  </button>
  <div class="pane-header-title">
    {#if title}
      {#if typeof title === "string"}
        <span>{title}</span>
      {:else}
        {@render title()}
      {/if}
    {/if}
  </div>
  <div class="pane-header-actions">
    {#if right}
      {@render right()}
    {/if}
    <button
      class="pane-header-btn"
      onclick={onexpand}
      aria-label={m.tickets_detail_expand()}
    >
      <Maximize2 size={16} aria-hidden="true" />
    </button>
  </div>
</div>

<style>
  .pane-header {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem;
    flex-shrink: 0;
    border-bottom: 1px solid var(--divider);
    min-height: 44px;
    position: relative;
    z-index: 1;
  }

  .pane-header-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    flex-shrink: 0;
  }

  .pane-header-btn:hover {
    color: var(--ink);
  }

  .pane-header-title {
    flex: 1;
    min-width: 0;
    font-weight: 600;
    font-size: var(--text-md);
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pane-header-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }
</style>
