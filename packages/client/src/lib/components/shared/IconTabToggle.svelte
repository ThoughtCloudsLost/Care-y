<!--
  Segmented icon toggle (tabs or toggle semantics).

  Target-size deviation from the house 44px/8px-gap rule: segments carry
  invisible 44px-tall hit areas, but stay horizontally connected with zero
  gap per the segmented-control design. WCAG 2.5.8 is met on size alone
  (each segment is 32x28 before expansion), so the 8px gap rule for
  separated controls does not apply to the fused segments.
-->
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
    /**
     * ARIA contract for the group. "toggle" (default) renders a plain button
     * group with aria-pressed. "tabs" renders the APG Tabs pattern (roving
     * tabindex, arrow-key activation) and requires a matching `panel-{id}`
     * element per tab; claiming tabs semantics is opt-in.
     */
    readonly semantics?: "tabs" | "toggle";
  }

  let {
    tabs,
    active,
    ariaLabel,
    onchange,
    semantics = "toggle",
  }: IconTabToggleProps = $props();

  let listEl = $state<HTMLElement | undefined>(undefined);

  // APG automatic activation: arrow keys move focus AND select the tab.
  function activateTab(index: number): void {
    const tab = tabs.at(index);
    if (!tab || !listEl) return;
    onchange(tab.id);
    const tabButtons = Array.from(
      listEl.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    tabButtons.at(index)?.focus();
  }

  function handleTabKeydown(event: KeyboardEvent, index: number): void {
    let target: number;
    switch (event.key) {
      case "ArrowRight":
        target = (index + 1) % tabs.length;
        break;
      case "ArrowLeft":
        target = (index - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        target = 0;
        break;
      case "End":
        target = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    activateTab(target);
  }
</script>

{#if semantics === "tabs"}
  <div
    role="tablist"
    aria-label={ariaLabel}
    class="icon-tab-toggle"
    bind:this={listEl}
  >
    {#each tabs as tab, i (tab.id)}
      <button
        type="button"
        role="tab"
        id={"tab-" + tab.id}
        aria-controls={"panel-" + tab.id}
        aria-selected={active === tab.id}
        aria-label={tab.label}
        tabindex={active === tab.id ? 0 : -1}
        class:active={active === tab.id}
        onclick={() => onchange(tab.id)}
        onkeydown={(e) => handleTabKeydown(e, i)}
      >
        <tab.icon size={16} />
      </button>
    {/each}
  </div>
{:else}
  <div role="group" aria-label={ariaLabel} class="icon-tab-toggle">
    {#each tabs as tab (tab.id)}
      <button
        type="button"
        aria-pressed={active === tab.id}
        aria-label={tab.label}
        class:active={active === tab.id}
        onclick={() => onchange(tab.id)}
      >
        <tab.icon size={16} />
      </button>
    {/each}
  </div>
{/if}

<style>
  .icon-tab-toggle {
    display: flex;
    flex-shrink: 0;
    border: 1px solid var(--hair-2);
    border-radius: 8px;
    /* No overflow: hidden here: it would clip the segments' expanded hit
       areas. Corner rounding lives on the end segments instead. */
  }

  .icon-tab-toggle button {
    position: relative;
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

  /* Invisible 44px-tall touch hit area; see the header comment for why the
     segments stay horizontally fused. */
  .icon-tab-toggle button::after {
    content: "";
    position: absolute;
    inset: -8px 0;
  }

  .icon-tab-toggle button:first-child {
    border-start-start-radius: 7px;
    border-end-start-radius: 7px;
  }

  .icon-tab-toggle button:last-child {
    border-right: none;
    border-start-end-radius: 7px;
    border-end-end-radius: 7px;
  }

  .icon-tab-toggle button.active {
    background: var(--raised);
    color: var(--brand-text);
  }
</style>
