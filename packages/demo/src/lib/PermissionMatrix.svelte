<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import {
    GROUPS,
    PERMISSION_LABELS,
    LOCKED_PERMISSIONS,
  } from "./permission-groups.js";

  // Read-only reference presentation of all permissions grouped by
  // capability area. No interactive toggles; this is the aggregation
  // page's permission overview.
</script>

<div class="perm-matrix">
  {#each GROUPS as group, gIdx (gIdx)}
    <div class="perm-group">
      <h4 class="perm-group-label">{group.labelFn()}</h4>
      <ul class="perm-list">
        {#each group.permissions as perm (perm)}
          {@const entry = PERMISSION_LABELS.get(perm)}
          {#if entry !== undefined}
            <li
              class="perm-row"
              class:perm-row--locked={LOCKED_PERMISSIONS.has(perm)}
            >
              <span class="perm-label">{entry.labelFn()}</span>
              {#if entry.hintFn !== null}
                <span class="perm-hint">{entry.hintFn()}</span>
              {/if}
              {#if LOCKED_PERMISSIONS.has(perm)}
                <span class="perm-locked">{m.error_permission_locked()}</span>
              {/if}
            </li>
          {/if}
        {/each}
      </ul>
    </div>
  {/each}
</div>

<style>
  .perm-matrix {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .perm-group {
    border: 1px solid var(--hair, #ddd);
    border-radius: 8px;
    overflow: hidden;
  }

  .perm-group-label {
    margin: 0;
    padding: 8px 12px;
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--muted, #888);
    background: var(--raised, #fafafa);
    border-bottom: 1px solid var(--hair, #ddd);
  }

  .perm-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .perm-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--hair, #ddd);
    font-size: 0.875rem;
    color: var(--ink, #1a1a1a);
  }

  .perm-row:last-child {
    border-bottom: none;
  }

  .perm-row--locked {
    opacity: 0.7;
  }

  .perm-label {
    font-weight: 500;
  }

  .perm-hint {
    font-size: 0.75rem;
    color: var(--ink-muted, #666);
    line-height: 1.4;
  }

  .perm-locked {
    font-size: 0.6875rem;
    font-style: italic;
    color: var(--ink-muted, #666);
  }
</style>
