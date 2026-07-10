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
    seal,
    stamp,
  }: {
    message?: string;
    icon?: Component;
    title?: string;
    subtitle?: string;
    action?: { label: string; onclick: () => void };
    /** Org initial rendered as the identity seal in place of the icon. */
    seal?: string;
    /** Stamped word (earned-state mark); mutually exclusive with seal and icon. */
    stamp?: string;
  } = $props();

  const displayTitle = $derived(title ?? message ?? m.empty_no_data());
  const displayVariant = $derived(stamp !== undefined || seal !== undefined);
</script>

<div
  class="empty-state"
  class:empty-state--display={displayVariant}
  role="status"
  aria-label={displayTitle}
>
  {#if stamp !== undefined}
    <span class="empty-stamp">{stamp}</span>
  {:else if seal !== undefined}
    <span class="empty-seal" aria-hidden="true">{seal}</span>
  {:else if icon}
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

  /* Identity seal: the org's mark on its own empty room. Brand belongs
     here (identity slot); the tilt says a hand pressed it. */
  .empty-seal {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 2px solid color-mix(in srgb, var(--brand-fill) 45%, transparent);
    display: grid;
    place-items: center;
    color: var(--brand-text);
    font-family: var(--theme-font-display);
    font-optical-sizing: auto;
    font-weight: 700;
    font-size: 0.9375rem;
    transform: rotate(-6deg);
    margin-bottom: 4px;
  }

  /* Earned-state stamp: the priority-stamp anatomy scaled up, in quiet
     ink. Never brand (brand stays scarce), never a semantic hue (nothing
     is wrong); the slight tilt marks it as hand-applied. */
  .empty-stamp {
    display: inline-block;
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    padding: 4px 10px;
    border: 1px solid currentColor;
    border-radius: 3px;
    color: var(--ink);
    background: transparent;
    transform: rotate(-1deg);
    margin-bottom: 4px;
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

  /* Seal and stamp variants take the mock's empty anatomy: Fraunces
     heading in full ink, quiet body capped for line length. */
  .empty-state--display .empty-title {
    font-family: var(--theme-font-display);
    font-optical-sizing: auto;
    font-weight: 600;
    font-size: 1.03125rem;
    color: var(--ink);
  }

  .empty-state--display .empty-subtitle {
    font-size: 0.8125rem;
    line-height: 1.5;
    max-width: 230px;
    opacity: 1;
  }

  .empty-action {
    margin-top: 0.5rem;
  }
</style>
