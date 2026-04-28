<!--
  Queue selector using Bits UI Select with Konsta-compatible styling.
  Separate file: Bits UI cannot coexist with Konsta imports (no-mixed-konsta-bits).
-->
<script lang="ts">
  import { Select } from "bits-ui";
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    queues: { id: string; name: string }[];
    value: string;
    onchange: (value: string) => void;
    error?: string;
    disabled?: boolean;
  }

  let { queues, value, onchange, error, disabled = false }: Props = $props();

  const labelId = `queue-label-${crypto.randomUUID().slice(0, 8)}`;

  const selectedLabel = $derived(
    queues.find((q) => q.id === value)?.name ?? "",
  );
</script>

<div class="queue-select" class:queue-select-error={Boolean(error)}>
  <span class="queue-select-label" id={labelId}>
    {m.ticket_new_field_queue()}
  </span>

  <Select.Root
    type="single"
    {value}
    onValueChange={(v: string) => {
      onchange(v);
    }}
    {disabled}
  >
    <Select.Trigger
      class="queue-select-trigger"
      aria-labelledby={labelId}
      aria-invalid={Boolean(error)}
    >
      <span class="queue-select-value" class:placeholder={!value}>
        {selectedLabel || m.ticket_new_field_queue_placeholder()}
      </span>
      <svg
        class="queue-select-chevron"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 6L8 10L12 6"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </Select.Trigger>

    <Select.Content class="queue-select-content" sideOffset={4}>
      <Select.ScrollUpButton class="queue-select-scroll-btn">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 10L8 6L12 10"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </Select.ScrollUpButton>

      <Select.Viewport>
        {#each queues as queue (queue.id)}
          <Select.Item
            value={queue.id}
            class="queue-select-item"
            label={queue.name}
          >
            {#snippet children({ selected })}
              <span class="queue-select-item-text">{queue.name}</span>
              {#if selected}
                <svg
                  class="queue-select-check"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3.5 8.5L6.5 11.5L12.5 4.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              {/if}
            {/snippet}
          </Select.Item>
        {/each}
      </Select.Viewport>

      <Select.ScrollDownButton class="queue-select-scroll-btn">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </Select.ScrollDownButton>
    </Select.Content>
  </Select.Root>

  {#if error}
    <p class="queue-select-error-text" role="alert">{error}</p>
  {/if}
</div>

<style>
  .queue-select {
    padding: 0.75rem 1rem;
  }

  .queue-select-label {
    display: block;
    font-size: var(--k-list-item-label-font-size, 0.75rem);
    color: var(
      --k-list-input-label-text-color,
      var(--k-color-md-light-on-surface-variant)
    );
    margin-bottom: 0.25rem;
    font-weight: 500;
  }

  :global(.queue-select-trigger) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 2.75rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--k-hairline-color, rgba(0, 0, 0, 0.12));
    border-radius: 0.5rem;
    background: var(--k-bars-bg-color, #fff);
    font-size: 1rem;
    color: var(--k-text-color, #000);
    cursor: pointer;
    transition: border-color 0.15s;
  }

  :global(.queue-select-trigger:focus-visible) {
    outline: 2px solid var(--k-color-primary, #007aff);
    outline-offset: 1px;
  }

  .queue-select-error :global(.queue-select-trigger) {
    border-color: var(--k-color-red, #ff3b30);
  }

  .queue-select-value.placeholder {
    color: var(--k-list-input-placeholder-color, rgba(0, 0, 0, 0.35));
  }

  .queue-select-chevron {
    flex-shrink: 0;
    color: var(--k-list-input-placeholder-color, rgba(0, 0, 0, 0.35));
  }

  :global(.queue-select-content) {
    z-index: 50;
    max-height: 15rem;
    overflow-y: auto;
    border-radius: 0.5rem;
    background: var(--k-bars-bg-color, #fff);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    border: 1px solid var(--k-hairline-color, rgba(0, 0, 0, 0.12));
  }

  :global(.queue-select-item) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 0.75rem;
    font-size: 1rem;
    cursor: pointer;
    color: var(--k-text-color, #000);
    transition: background-color 0.1s;
  }

  :global(.queue-select-item:hover),
  :global(.queue-select-item[data-highlighted]) {
    background: var(--k-list-button-pressed-bg-color, rgba(0, 0, 0, 0.05));
  }

  :global(.queue-select-item[data-selected]) {
    font-weight: 500;
  }

  .queue-select-item-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .queue-select-check {
    flex-shrink: 0;
    margin-left: 0.5rem;
    color: var(--k-color-primary, #007aff);
  }

  :global(.queue-select-scroll-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    color: var(--k-list-input-placeholder-color, rgba(0, 0, 0, 0.35));
  }

  .queue-select-error-text {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: var(--k-color-red, #ff3b30);
  }
</style>
