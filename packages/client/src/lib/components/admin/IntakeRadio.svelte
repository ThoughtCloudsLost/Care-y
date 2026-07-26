<script lang="ts">
  import { Tooltip } from "bits-ui";
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    checked: boolean;
    disabled: boolean;
    onchange: () => void;
  }

  let { checked, disabled, onchange }: Props = $props();
</script>

<Tooltip.Provider delayDuration={400}>
  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        <button
          {...props}
          class="intake-radio"
          class:intake-radio--checked={checked}
          role="radio"
          aria-checked={checked}
          aria-label={m.admin_queue_intake_chip()}
          {disabled}
          onclick={(e) => {
            e.stopPropagation();
            onchange();
          }}
          onkeydown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              onchange();
            }
          }}
        >
          <span class="intake-radio__circle" aria-hidden="true">
            {#if checked}
              <span class="intake-radio__dot"></span>
            {/if}
          </span>
          <span class="intake-radio__label">{m.admin_queue_intake_chip()}</span>
        </button>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content class="intake-tooltip" sideOffset={6} side="top">
      {m.admin_queue_intake_tooltip()}
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>

<style>
  .intake-radio {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid color-mix(in srgb, var(--muted) 40%, transparent);
    border-radius: var(--radius-sm, 0.375rem);
    background: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    font-size: var(--text-xs);
    color: var(--muted);
    line-height: 1;
  }

  @media (prefers-reduced-motion: no-preference) {
    .intake-radio {
      transition:
        color 0.15s,
        border-color 0.15s;
    }
  }

  .intake-radio:hover:not(:disabled) {
    color: var(--brand-text);
    border-color: color-mix(in srgb, var(--brand-text) 40%, transparent);
  }

  .intake-radio:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .intake-radio:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
  }

  .intake-radio--checked {
    color: var(--brand-accent, var(--brand-text));
    border-color: color-mix(
      in srgb,
      var(--brand-accent, var(--brand-text)) 50%,
      transparent
    );
  }

  .intake-radio__circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 0.875rem;
    height: 0.875rem;
    border-radius: 50%;
    border: 2px solid currentColor;
    flex-shrink: 0;
  }

  .intake-radio__dot {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background: currentColor;
  }

  .intake-radio__label {
    font-weight: 500;
    white-space: nowrap;
  }

  :global(.intake-tooltip) {
    background: var(--brand-text, #1a1a1a);
    color: var(--bg, #fff);
    font-size: var(--text-xs);
    padding: 0.375rem 0.625rem;
    border-radius: var(--radius-sm, 0.375rem);
    max-width: 14rem;
    line-height: 1.3;
    z-index: 50;
  }
</style>
