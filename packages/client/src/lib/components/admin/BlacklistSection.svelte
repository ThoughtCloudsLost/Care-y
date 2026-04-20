<script lang="ts">
  import { tick } from "svelte";
  import { Block, ListInput, DialogButton } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { X, PhoneOff } from "@lucide/svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import SoftButton from "$lib/components/SoftButton.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";

  const COUNTRY_CODE_REGEX = /^\+[1-9]\d{0,2}$/;
  const DIGITS_ONLY_REGEX = /^\d+$/;

  if (!trpc.telephonyAdmin) throw new RouterNotAvailableError("telephonyAdmin");
  const telephonyAdmin = trpc.telephonyAdmin;

  const queryClient = useQueryClient();
  const orgCache = getOrgDecryptCache();

  // ── Queries ──

  const blacklistQuery = createQuery(() => ({
    queryKey: ["admin", "blacklist"],
    queryFn: async () => telephonyAdmin.listBlacklist.query(),
  }));

  type BlacklistEntry = NonNullable<typeof blacklistQuery.data>[number];

  function decryptNumber(entry: BlacklistEntry): string | null {
    return orgCache.decrypt(`bl:${entry.id}`, entry.encryptedNumber);
  }

  // ── Filter + pagination ──

  const INITIAL_LIMIT = 5;
  let filterText = $state("");
  let showAll = $state(false);

  const filteredEntries = $derived.by(() => {
    const entries = blacklistQuery.data ?? [];
    if (!filterText) return entries;
    const digits = filterText.replace(/[^0-9+]/g, "");
    return entries.filter((e) => {
      const num = decryptNumber(e);
      return num?.includes(digits) ?? false;
    });
  });

  const visibleEntries = $derived(
    showAll || filterText
      ? filteredEntries
      : filteredEntries.slice(0, INITIAL_LIMIT),
  );
  const hiddenCount = $derived(filteredEntries.length - visibleEntries.length);

  // ── Add number sheet ──

  let addSheetOpen = $state(false);
  let countryCode = $state("+1");
  let numberInput = $state("");
  let numberInputEl = $state<HTMLInputElement | null>(null);

  function stripNonDigits(raw: string): string {
    return raw.replace(/[^0-9]/g, "");
  }

  const normalizedNumber = $derived(stripNonDigits(numberInput));
  const fullE164 = $derived(countryCode + normalizedNumber);
  const countryCodeValid = $derived(COUNTRY_CODE_REGEX.test(countryCode));
  const numberValid = $derived(
    normalizedNumber.length >= 5 && DIGITS_ONLY_REGEX.test(normalizedNumber),
  );
  const phoneValid = $derived(countryCodeValid && numberValid);

  function resetAddForm(): void {
    countryCode = "+1";
    numberInput = "";
  }

  async function openAddSheet(): Promise<void> {
    addSheetOpen = true;
    await tick();
    await tick();
    numberInputEl?.focus();
  }

  const addMutation = createMutation(() => ({
    mutationFn: async (phoneNumber: string) =>
      telephonyAdmin.addToBlacklist.mutate({ phoneNumber }),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_blacklist_added());
      announceToLiveRegion("polite", m.admin_blacklist_added());
      resetAddForm();
      addSheetOpen = false;
      void queryClient.invalidateQueries({ queryKey: ["admin", "blacklist"] });
    },
    onError: () => {
      toastStore.show(m.admin_blacklist_already_blocked());
    },
  }));

  function handleAdd(): void {
    if (!phoneValid || addMutation.isPending) return;
    addMutation.mutate(fullE164);
  }

  // ── Remove confirmation ──

  let removeTarget = $state<BlacklistEntry | null>(null);
  let removeDialogOpen = $state(false);

  const removeMutation = createMutation(() => ({
    mutationFn: async (id: string) =>
      telephonyAdmin.removeFromBlacklist.mutate({ id }),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_blacklist_removed());
      announceToLiveRegion("polite", m.admin_blacklist_removed());
      removeDialogOpen = false;
      removeTarget = null;
      void queryClient.invalidateQueries({ queryKey: ["admin", "blacklist"] });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  function startRemove(entry: BlacklistEntry): void {
    removeTarget = entry;
    removeDialogOpen = true;
  }

  function confirmRemove(): void {
    if (!removeTarget) return;
    removeMutation.mutate(removeTarget.id);
  }
</script>

<div class="blacklist-section">
  {#if blacklistQuery.isLoading}
    <div class="bl-content skeleton-pulse">
      <div class="bl-surface">
        {#each { length: 3 } as _, i (i)}
          <div class="bl-row">
            <span class="bl-number">
              <DecryptPlaceholder content={null} length={14} />
            </span>
            <span class="bl-time">
              <InlineSkeleton width="3ch" />
            </span>
          </div>
        {/each}
      </div>
    </div>
  {:else if blacklistQuery.isError}
    <QueryError
      error={blacklistQuery.error}
      onretry={() => void blacklistQuery.refetch()}
    />
  {:else if filteredEntries.length === 0 && !filterText}
    <div class="bl-content">
      <p class="bl-empty">{m.admin_blacklist_empty()}</p>
      <div class="bl-toolbar">
        <SoftButton onclick={openAddSheet} full>
          <PhoneOff size={16} />
          {m.admin_blacklist_add_button()}
        </SoftButton>
      </div>
    </div>
  {:else}
    <div class="bl-content">
      <div class="bl-toolbar">
        <div class="filter-row">
          <ListInput
            type="text"
            placeholder={m.admin_blacklist_filter()}
            value={filterText}
            onInput={(e: Event) => {
              const target = e.target;
              if (target instanceof HTMLInputElement) filterText = target.value;
            }}
            clearButton={filterText.length > 0}
            onClear={() => (filterText = "")}
            outline
          />
        </div>
        <SoftButton onclick={openAddSheet}>
          <PhoneOff size={16} />
        </SoftButton>
      </div>

      <div class="bl-surface">
        {#each visibleEntries as entry (entry.id)}
          {@const number = decryptNumber(entry)}
          <div class="bl-row">
            <span class="bl-number">
              <DecryptPlaceholder content={number} length={14} />
            </span>
            <span class="bl-time">
              {formatRelativeTime(new Date(entry.createdAt))}
            </span>
            <button
              type="button"
              class="bl-remove touch-feedback"
              aria-label={m.admin_blacklist_remove_button() +
                " " +
                (number ?? entry.id.slice(0, 8))}
              onclick={() => startRemove(entry)}
              onkeydown={onKeyActivate(() => startRemove(entry))}
            >
              <X size={14} />
            </button>
          </div>
        {/each}
      </div>

      {#if hiddenCount > 0}
        <button
          type="button"
          class="see-all-link"
          onclick={() => (showAll = true)}
        >
          {m.admin_blacklist_show_all({ count: String(hiddenCount) })}
        </button>
      {/if}
    </div>
  {/if}
</div>

<!-- Add Number Sheet -->
<ShellSheet
  opened={addSheetOpen}
  ondismiss={() => {
    addSheetOpen = false;
    resetAddForm();
  }}
  ariaLabel={m.admin_blacklist_add_title()}
  title={m.admin_blacklist_add_title()}
>
  {#snippet headerRight()}
    <SoftButton
      onclick={handleAdd}
      disabled={!phoneValid || addMutation.isPending}
    >
      {#if addMutation.isPending}
        {m.common_loading()}
      {:else}
        <PhoneOff size={16} aria-hidden="true" />
        {m.admin_blacklist_block_button()}
      {/if}
    </SoftButton>
  {/snippet}
  <div class="sheet-content">
    <div class="phone-fields">
      <!-- Number field first in DOM so focus trap lands here -->
      <div class="number-field">
        <label class="field-label" for="bl-number">
          {m.admin_blacklist_phone_label()}
        </label>
        <input
          bind:this={numberInputEl}
          id="bl-number"
          type="tel"
          class="phone-input number-input"
          placeholder={m.admin_blacklist_number_placeholder()}
          value={numberInput}
          oninput={(e: Event) => {
            const target = e.target;
            if (target instanceof HTMLInputElement) numberInput = target.value;
          }}
        />
      </div>
      <div class="country-code-field">
        <label class="field-label" for="bl-country-code">
          {m.admin_blacklist_country_code()}
        </label>
        <input
          id="bl-country-code"
          type="tel"
          class="phone-input country-code-input"
          value={countryCode}
          oninput={(e: Event) => {
            const target = e.target;
            if (target instanceof HTMLInputElement) countryCode = target.value;
          }}
        />
      </div>
    </div>

    {#if numberInput.length > 0 && !phoneValid}
      <p class="field-error" role="alert">
        {m.admin_blacklist_invalid_format()}
      </p>
    {/if}
  </div>
</ShellSheet>

<!-- Remove Confirmation Dialog -->
<ShellDialog
  opened={removeDialogOpen}
  ondismiss={() => {
    removeDialogOpen = false;
    removeTarget = null;
  }}
  title={m.admin_blacklist_remove_title()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {m.admin_blacklist_remove_confirm()}
    </p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton
      onclick={() => {
        removeDialogOpen = false;
        removeTarget = null;
      }}
    >
      {m.common_cancel()}
    </DialogButton>
    <DialogButton
      strong
      class="text-[--color-red-500] font-semibold"
      onclick={confirmRemove}
    >
      {m.admin_blacklist_remove_button()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  .blacklist-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: 0.25rem 0 0;
  }

  .bl-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: 0 var(--page-pad-x) 0.25rem;
  }

  .bl-toolbar {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .bl-toolbar .filter-row {
    flex: 1;
  }

  .bl-empty {
    text-align: center;
    color: var(--muted);
    font-size: var(--text-base);
    margin: 0;
    padding: var(--space-lg) 0;
  }

  .bl-surface {
    display: flex;
    flex-direction: column;
    background: var(--surface-1);
    border-radius: var(--card-radius);
    overflow: hidden;
  }

  .bl-row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: var(--text-base);
    color: var(--ink);
    padding: var(--space-lg) var(--page-pad-x);
    border-bottom: 1px solid var(--divider);
  }

  .bl-row:last-child {
    border-bottom: none;
  }

  .bl-number {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.8;
  }

  .bl-time {
    flex-shrink: 0;
    font-size: var(--text-xs);
    color: var(--muted);
    opacity: 0.7;
  }

  .bl-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    margin-left: var(--space-sm);
    border: none;
    background: transparent;
    color: var(--color-red-500);
    border-radius: 50%;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    opacity: 0.7;
  }

  .see-all-link {
    display: block;
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    text-align: center;
    padding: 0.5rem;
    font-size: 0.8125rem;
    color: var(--brand-text);
    font-family: inherit;
    -webkit-tap-highlight-color: transparent;
  }

  .sheet-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-lg) var(--page-pad-x);
  }

  .phone-fields {
    display: flex;
    gap: var(--space-sm);
    align-items: flex-end;
  }

  .country-code-field {
    flex: 0 0 5rem;
    order: -1;
  }

  .number-field {
    flex: 1;
  }

  .field-label {
    display: block;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--ink);
    margin-bottom: var(--space-xs);
  }

  .phone-input {
    width: 100%;
    padding: 0.625rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid color-mix(in srgb, var(--ink) 15%, transparent);
    background: transparent;
    color: var(--ink);
    font-size: 16px;
    font-family: inherit;
  }

  .phone-input:focus {
    outline: 2px solid var(--brand-text);
    outline-offset: -1px;
    border-color: transparent;
  }

  .country-code-input {
    text-align: center;
  }

  .field-error {
    font-size: var(--text-xs);
    color: var(--color-red-500);
    margin: 0;
  }
</style>
