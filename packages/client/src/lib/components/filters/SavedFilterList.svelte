<script lang="ts">
  import { ActionsGroup, ActionsButton, ActionsLabel } from "konsta/svelte";
  import { Share2 } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import ShellActionSheet from "$lib/shell/ShellActionSheet.svelte";
  import {
    ICON_BY_ID,
    COLOR_HEX_BY_ID,
    DEFAULT_ICON,
    DEFAULT_COLOR_HEX,
  } from "$lib/components/inputs/picker-options.js";
  import type { SavedFilterRecord } from "@care-y/shared";

  interface Props {
    filters: SavedFilterRecord[];
    count: number;
    onapply: (record: SavedFilterRecord) => void;
    ondelete: (id: string) => void;
    ontoggleshare: (id: string) => void;
  }

  let { filters, count, onapply, ondelete, ontoggleshare }: Props = $props();

  const orgCache = getOrgDecryptCache();

  // Action sheet state: which saved filter's menu is open, if any.
  let actionSheetFilterId = $state<string | null>(null);

  // Long-press detection: distinguish tap (apply) from long-press (menu).
  const LONG_PRESS_MS = 500;
  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  let pressTriggered = false;

  function decryptName(record: SavedFilterRecord): string | null {
    return orgCache.decrypt(`saved-filter:${record.id}`, record.encryptedName);
  }

  function onPointerDown(id: string): void {
    pressTriggered = false;
    pressTimer = setTimeout(() => {
      pressTriggered = true;
      actionSheetFilterId = id;
    }, LONG_PRESS_MS);
  }

  function onPointerUp(record: SavedFilterRecord): void {
    if (pressTimer !== null) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    if (!pressTriggered) {
      onapply(record);
    }
    pressTriggered = false;
  }

  function onPointerCancel(): void {
    if (pressTimer !== null) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    pressTriggered = false;
  }

  function closeActionSheet(): void {
    actionSheetFilterId = null;
  }

  function handleDelete(): void {
    if (actionSheetFilterId !== null) {
      ondelete(actionSheetFilterId);
    }
    closeActionSheet();
  }

  function handleToggleShare(): void {
    if (actionSheetFilterId !== null) {
      ontoggleshare(actionSheetFilterId);
    }
    closeActionSheet();
  }

  const activeRecord = $derived(
    actionSheetFilterId !== null
      ? filters.find((f) => f.id === actionSheetFilterId)
      : undefined,
  );
</script>

{#if count > 0}
  <div
    class="saved-filter-list"
    role="list"
    aria-label={m.saved_filter_apply()}
  >
    {#each filters as record (record.id)}
      {@const name = decryptName(record)}
      {@const IconComponent = ICON_BY_ID[record.icon] ?? DEFAULT_ICON}
      {@const color = COLOR_HEX_BY_ID[record.color] ?? DEFAULT_COLOR_HEX}
      <div role="listitem" class="saved-filter-item">
        <button
          type="button"
          class="saved-filter-chip"
          style="--chip-color: {color}"
          aria-label={name ?? m.saved_filter_decrypting()}
          onpointerdown={() => onPointerDown(record.id)}
          onpointerup={() => onPointerUp(record)}
          onpointercancel={onPointerCancel}
          oncontextmenu={(e) => {
            e.preventDefault();
            actionSheetFilterId = record.id;
          }}
        >
          <span class="chip-icon" aria-hidden="true">
            <IconComponent size={14} />
          </span>
          <span class="chip-label">
            <DecryptPlaceholder
              content={name}
              ciphertext={record.encryptedName}
              length={10}
            />
          </span>
          {#if record.shared}
            <Share2
              size={10}
              class="chip-shared-icon"
              aria-label={m.saved_filter_shared_label()}
            />
          {/if}
        </button>
      </div>
    {/each}
  </div>
{/if}

<ShellActionSheet
  opened={actionSheetFilterId !== null}
  ondismiss={closeActionSheet}
  ariaLabel={m.saved_filter_actions()}
>
  <ActionsGroup>
    {#if activeRecord}
      {@const name = decryptName(activeRecord)}
      <ActionsLabel>{name ?? m.saved_filter_decrypting()}</ActionsLabel>
    {/if}
    <ActionsButton onclick={handleToggleShare}>
      {activeRecord?.shared === true
        ? m.saved_filter_unshare()
        : m.saved_filter_share()}
    </ActionsButton>
    <ActionsButton
      colors={{ textIos: "text-red-500", textMaterial: "text-red-500" }}
      onclick={handleDelete}
    >
      {m.saved_filter_delete()}
    </ActionsButton>
  </ActionsGroup>
  <ActionsGroup>
    <ActionsButton bold onclick={closeActionSheet}>
      {m.shell_close()}
    </ActionsButton>
  </ActionsGroup>
</ShellActionSheet>

<style>
  .saved-filter-list {
    display: flex;
    gap: 0.375rem;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding: 2px 0;
  }

  .saved-filter-list::-webkit-scrollbar {
    display: none;
  }

  .saved-filter-item {
    flex-shrink: 0;
  }

  .saved-filter-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border: 1px solid var(--chip-color);
    border-radius: 999px;
    background: transparent;
    color: var(--ink);
    font-size: 0.8125rem;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }

  @media (prefers-reduced-motion: no-preference) {
    .saved-filter-chip {
      transition:
        background-color 150ms linear,
        color 150ms linear;
    }
  }

  .saved-filter-chip:hover {
    background-color: var(--chip-color);
    color: white;
  }

  .chip-icon {
    display: flex;
    color: var(--chip-color);
  }

  @media (prefers-reduced-motion: no-preference) {
    .chip-icon {
      transition: color 150ms linear;
    }
  }

  .saved-filter-chip:hover .chip-icon {
    color: white;
  }

  .chip-label {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :global(.chip-shared-icon) {
    opacity: 0.5;
    margin-left: 2px;
  }
</style>
