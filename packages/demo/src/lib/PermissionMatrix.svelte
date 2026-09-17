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
            <li class="perm-row">
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
  }

  .perm-group {
    margin-bottom: 8px;
  }

  .perm-group-label {
    margin: 16px 0 0;
    font: 700 18px "Atkinson Hyperlegible Next";
    line-height: 24px;
    color: var(--ink, #1a1a1a);
    border-bottom: 1px solid var(--hair-2, #ccc);
    padding-bottom: 6px;
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
    padding: 10px 0;
    border-bottom: 1px solid var(--hair-2, #ccc);
  }

  .perm-label {
    font: 700 15px "Atkinson Hyperlegible Next";
    line-height: 24px;
    color: var(--ink, #1a1a1a);
  }

  .perm-hint {
    font: 400 15px "Atkinson Hyperlegible Next";
    line-height: 24px;
    color: var(--muted, #888);
  }

  .perm-locked {
    font: 400 15px "Atkinson Hyperlegible Next";
    font-style: italic;
    line-height: 24px;
    color: var(--muted, #888);
  }
</style>
