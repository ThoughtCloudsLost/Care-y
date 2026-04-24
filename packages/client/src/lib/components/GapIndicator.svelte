<!--
  Inline separator showing how many items were hidden by filters or
  skipped between search results. Renders as a centered label with
  hairline rules on each side.
-->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    count: number;
  }

  let { count }: Props = $props();
</script>

{#if count > 0}
  <div class="gap-indicator" role="separator">
    <span class="gap-label">
      {count === 1
        ? m.ticket_filter_hidden_one()
        : m.ticket_filter_hidden({ count: String(count) })}
    </span>
  </div>
{/if}

<style>
  .gap-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.125rem 1rem;
  }

  .gap-indicator::before,
  .gap-indicator::after {
    content: "";
    width: 2rem;
    flex-shrink: 0;
    height: 1px;
    background: var(--muted);
    opacity: 0.2;
  }

  .gap-label {
    font-size: 0.6875rem;
    font-weight: 500;
    color: var(--muted);
    white-space: nowrap;
  }
</style>
