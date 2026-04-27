<script lang="ts">
  import type { Component } from "svelte";
  import { Button } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";

  let {
    message,
    icon,
    title,
    subtitle,
    action,
  }: {
    message?: string;
    icon?: Component;
    title?: string;
    subtitle?: string;
    action?: { label: string; onclick: () => void };
  } = $props();

  const displayTitle = $derived(title ?? message ?? m.empty_no_data());
</script>

<div class="empty-state" role="status" aria-label={displayTitle}>
  {#if icon}
    {@const Icon = icon}
    <div class="empty-icon">
      <Icon size={48} aria-hidden="true" />
    </div>
  {/if}
  <p class="empty-title">{displayTitle}</p>
  {#if subtitle}
    <p class="empty-subtitle">{subtitle}</p>
  {/if}
  {#if action}
    <div class="empty-action">
      <Button outline small onclick={action.onclick}>
        {action.label}
      </Button>
    </div>
  {/if}
</div>

<style>
  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .empty-icon {
    color: var(--muted);
    opacity: 0.5;
    margin-bottom: 0.25rem;
  }

  .empty-title {
    color: var(--muted);
    font-size: var(--text-base);
  }

  .empty-subtitle {
    color: var(--muted);
    font-size: var(--text-sm);
    opacity: 0.7;
  }

  .empty-action {
    margin-top: 0.5rem;
  }
</style>
