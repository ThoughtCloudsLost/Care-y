<script lang="ts">
  import type { Component } from "svelte";

  interface Tab {
    readonly id: string;
    readonly label: string;
    readonly icon: Component<{ size: number }>;
  }

  interface IconTabToggleProps {
    readonly tabs: readonly Tab[];
    readonly active: string;
    readonly ariaLabel: string;
    readonly onchange: (id: string) => void;
  }

  let { tabs, active, ariaLabel, onchange }: IconTabToggleProps = $props();
</script>

<div role="tablist" aria-label={ariaLabel} class="icon-tab-toggle">
  {#each tabs as tab (tab.id)}
    <button
      type="button"
      class:active={active === tab.id}
      onclick={() => onchange(tab.id)}
      aria-selected={active === tab.id}
      aria-label={tab.label}
      role="tab"
    >
      <tab.icon size={16} />
    </button>
  {/each}
</div>

<style>
  .icon-tab-toggle {
    display: flex;
    flex-shrink: 0;
    border: 1px solid var(--hair-2);
    border-radius: 8px;
    overflow: hidden;
  }

  .icon-tab-toggle button {
    display: grid;
    place-items: center;
    width: 32px;
    height: 28px;
    padding: 0;
    background: none;
    border: none;
    border-right: 1px solid var(--hair);
    color: var(--muted);
    cursor: pointer;
  }

  .icon-tab-toggle button:last-child {
    border-right: none;
  }

  .icon-tab-toggle button.active {
    background: var(--raised);
    color: var(--brand-text);
  }
</style>
