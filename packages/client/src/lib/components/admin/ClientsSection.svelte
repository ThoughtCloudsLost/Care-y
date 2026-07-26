<script lang="ts">
  import { Block, List, ListInput, ListItem, Preloader } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import {
    Pencil,
    Lock,
    LockOpen,
    RotateCcw,
    Phone,
    HeartHandshake,
    Save,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { clientKeys, ticketsKeys } from "$lib/query/keys.js";
  import { ErrorCode } from "@care-y/shared";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import { requireRouter } from "$lib/errors.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import FieldError from "$lib/components/FieldError.svelte";
  import StatusMark from "$lib/components/StatusMark.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import PhoneEditSheet from "$lib/components/clients/PhoneEditSheet.svelte";
  import MergeSheet from "$lib/components/clients/MergeSheet.svelte";
  import { LOADING, type DecryptResult } from "$lib/crypto/decrypt-result.js";
  import { deriveDisplayStatus } from "$lib/tickets/display-status.js";

  // ---------------------------------------------------------------------------
  // Props
  // ---------------------------------------------------------------------------

  interface ClientListItem {
    readonly id: string;
    readonly alias: string;
    readonly phone: string;
    readonly ticketCount: number;
    readonly createdAt: string;
    readonly mergedInto: string | null;
  }

  interface ClientsSectionProps {
    readonly clients?: readonly ClientListItem[];
    readonly isLoading?: boolean;
    readonly isError?: boolean;
    readonly error?: unknown;
    readonly onretry?: () => void;
  }

  let {
    clients = [],
    isLoading = false,
    isError = false,
    error = null,
    onretry,
  }: ClientsSectionProps = $props();

  // ---------------------------------------------------------------------------
  // tRPC routers
  // ---------------------------------------------------------------------------

  const clientsRouter = requireRouter(trpc.clients, "clients");
  const ticketsRouter = requireRouter(trpc.tickets, "tickets");
  const queryClient = useQueryClient();

  // ---------------------------------------------------------------------------
  // Client detail sheet
  // ---------------------------------------------------------------------------

  let sheetClientId = $state<string | null>(null);

  let phoneEditOpened = $state(false);
  function handlePhoneEditOpen(): void {
    phoneEditOpened = true;
  }
  function closePhoneEdit(): void {
    phoneEditOpened = false;
  }

  let mergeSheetOpened = $state(false);
  let mergeConflictClientId = $state<string | null>(null);
  let mergeConflictClientAlias = $state<string | null>(null);
  export function openMerge(
    conflictingClientId?: string,
    conflictingAlias?: string,
  ): void {
    mergeConflictClientId = conflictingClientId ?? null;
    mergeConflictClientAlias = conflictingAlias ?? null;
    mergeSheetOpened = true;
  }
  export function closeMerge(): void {
    mergeSheetOpened = false;
    mergeConflictClientId = null;
    mergeConflictClientAlias = null;
  }

  // Derive the two merge candidates from the current detail context.
  // clientA is always the client currently open in the detail sheet.
  // clientB is the conflicting client (from phone conflict) or null (from list).
  const mergeClientA = $derived.by((): { id: string; alias: string } | null => {
    if (sheetClientId === null) return null;
    return {
      id: sheetClientId,
      alias: clientDetailQuery.data?.alias ?? "",
    };
  });

  const mergeClientB = $derived.by((): { id: string; alias: string } | null => {
    if (mergeConflictClientId === null) return null;
    return {
      id: mergeConflictClientId,
      alias: mergeConflictClientAlias ?? "",
    };
  });

  const clientDetailQuery = createQuery(() => ({
    queryKey: clientKeys.detail(sheetClientId ?? ""),
    queryFn: async () =>
      clientsRouter.get.query({ clientId: sheetClientId ?? "" }),
    enabled: sheetClientId !== null,
  }));

  export function openClientDetail(clientId: string): void {
    sheetClientId = clientId;
  }

  function closeSheet(): void {
    sheetClientId = null;
    editAlias = "";
    aliasError = null;
  }

  // ---------------------------------------------------------------------------
  // Alias editing
  // ---------------------------------------------------------------------------

  let editAlias = $state("");
  let aliasError = $state<string | null>(null);

  // When detail data loads, seed the alias edit field
  $effect(() => {
    if (clientDetailQuery.data) {
      editAlias = clientDetailQuery.data.alias;
      aliasError = null;
    }
  });

  const trimmedAlias = $derived(editAlias.trim().toLowerCase());
  const aliasChanged = $derived(
    clientDetailQuery.data !== undefined &&
      trimmedAlias !== "" &&
      trimmedAlias !== clientDetailQuery.data.alias,
  );

  const updateAliasMutation = createMutation(() => ({
    mutationFn: async (input: { clientId: string; alias: string }) =>
      clientsRouter.updateAlias.mutate(input),
    onSuccess: () => {
      haptic();
      aliasError = null;
      void queryClient.invalidateQueries({ queryKey: clientKeys.all });
      const msg = m.client_alias_changed_toast();
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
    },
    onError: (err: Error) => {
      if (err.message === ErrorCode.CLIENT_ALIAS_CONFLICT) {
        aliasError = m.client_alias_uniqueness_error();
      } else {
        toastStore.show(m.error_generic());
      }
    },
  }));

  function handleSaveAlias(): void {
    if (sheetClientId === null || !aliasChanged) return;
    updateAliasMutation.mutate({
      clientId: sheetClientId,
      alias: trimmedAlias,
    });
  }

  // ---------------------------------------------------------------------------
  // Merge undo/lock mutations
  // ---------------------------------------------------------------------------

  const undoMergeMutation = createMutation(() => ({
    mutationFn: async (input: {
      mergeEventId: string;
      encryptedSnapshot: string;
    }) => ticketsRouter.undoMerge.mutate(input),
    onSuccess: () => {
      haptic();
      void queryClient.invalidateQueries({ queryKey: clientKeys.all });
      void queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
      const msg = m.client_merge_undo();
      toastStore.show(msg);
      announceToLiveRegion("assertive", msg);
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const lockMergeMutation = createMutation(() => ({
    mutationFn: async (input: { mergeEventId: string; locked: boolean }) =>
      ticketsRouter.lockMerge.mutate(input),
    onSuccess: () => {
      haptic();
      void queryClient.invalidateQueries({
        queryKey: clientKeys.detail(sheetClientId ?? ""),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  // ---------------------------------------------------------------------------
  // Date formatting
  // ---------------------------------------------------------------------------

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  function formatDate(iso: string): string {
    return dateFormatter.format(new Date(iso));
  }

  // ---------------------------------------------------------------------------
  // Ticket title decrypt results (loading placeholder for now)
  // ---------------------------------------------------------------------------

  // Ticket titles are PII-tier encrypted. The clients.get response includes
  // encryptedTitle as a base64 string but not key wraps (those are per-volunteer).
  // Use DecryptPlaceholder with LOADING status. A future enhancement could wire
  // TicketDecryptCache here if the key wraps become available.
  const ticketTitleResult: DecryptResult = LOADING;
</script>

<div class="clients-section pb-20">
  {#if isLoading}
    <List>
      {#each { length: 3 } as _, i (i)}
        <ListItem>
          {#snippet title()}
            <InlineSkeleton width="14ch" />
          {/snippet}
          {#snippet after()}
            <InlineSkeleton width="8ch" />
          {/snippet}
          {#snippet subtitle()}
            <InlineSkeleton width="20ch" />
          {/snippet}
        </ListItem>
      {/each}
    </List>
  {:else if isError}
    <QueryError {error} {onretry} />
  {:else if clients.length === 0}
    <EmptyState
      icon={HeartHandshake}
      title={m.clients_empty_state(withTerms())}
      subtitle={m.clients_empty_subtitle(withTerms())}
    />
  {:else}
    <List>
      {#each clients as client (client.id)}
        <ListItem
          title={client.alias}
          after={client.phone}
          onclick={() => openClientDetail(client.id)}
          onkeydown={onKeyActivate(() => openClientDetail(client.id))}
          role="button"
          tabindex={0}
          class="touch-feedback"
        >
          {#snippet subtitle()}
            <span class="client-subtitle">
              {client.ticketCount === 1
                ? m.clients_ticket_count_one(
                    withTerms({ count: client.ticketCount }),
                  )
                : m.clients_ticket_count_other(
                    withTerms({ count: client.ticketCount }),
                  )}
              <span class="subtitle-dot" aria-hidden="true">·</span>
              {formatDate(client.createdAt)}
              {#if client.mergedInto !== null}
                <span class="subtitle-dot" aria-hidden="true">·</span>
                <span class="merged-badge">{m.clients_merged_label()}</span>
              {/if}
            </span>
          {/snippet}
        </ListItem>
      {/each}
    </List>
  {/if}
</div>

<!-- Client detail sheet -->
<ShellSheet
  opened={sheetClientId !== null}
  ondismiss={closeSheet}
  title={clientDetailQuery.data?.alias ?? ""}
  ariaLabel={m.client_detail_title(withTerms())}
>
  {#snippet headerRight()}
    <SoftButton
      onclick={handleSaveAlias}
      disabled={!aliasChanged || updateAliasMutation.isPending}
    >
      {#if updateAliasMutation.isPending}
        <Preloader class="w-4 h-4" />
      {:else}
        <Save size={16} aria-hidden="true" />
        {m.admin_user_save_changes()}
      {/if}
    </SoftButton>
  {/snippet}

  <div class="edit-client-content">
    {#if clientDetailQuery.isLoading}
      <Block>
        <InlineSkeleton width="100%" />
        <InlineSkeleton width="80%" />
        <InlineSkeleton width="60%" />
      </Block>
    {:else if clientDetailQuery.isError}
      <QueryError
        error={clientDetailQuery.error}
        onretry={() => void clientDetailQuery.refetch()}
      />
    {:else if clientDetailQuery.data}
      {@const detail = clientDetailQuery.data}

      <!-- Alias section -->
      <div class="detail-section">
        <p class="section-label">{m.client_alias_label()}</p>
        <List nested>
          <ListInput
            label={m.client_alias_label()}
            type="text"
            value={editAlias}
            placeholder={m.client_alias_placeholder()}
            oninput={(e: Event) => {
              if (e.target instanceof HTMLInputElement) {
                editAlias = e.target.value;
                aliasError = null;
              }
            }}
            disabled={updateAliasMutation.isPending}
          />
        </List>
        <FieldError message={aliasError ?? undefined} />
      </div>

      <!-- Phone section -->
      <div class="detail-section">
        <p class="section-label">{m.client_phone_label()}</p>
        <List nested>
          <ListItem
            title={detail.phone}
            onclick={handlePhoneEditOpen}
            onkeydown={onKeyActivate(handlePhoneEditOpen)}
            role="button"
            tabindex={0}
            class="touch-feedback"
          >
            {#snippet media()}
              <Phone class="w-5 h-5 text-[var(--ink-2)]" />
            {/snippet}
            {#snippet after()}
              <Pencil size={16} class="text-[var(--brand-text)]" />
            {/snippet}
          </ListItem>
        </List>
      </div>

      <!-- Tickets section -->
      <div class="detail-section">
        <p class="section-label">
          {m.client_tickets_heading(withTerms())}
          ({detail.tickets.length})
        </p>
        {#if detail.tickets.length === 0}
          <Block class="text-center text-[--muted] text-sm">
            {m.client_no_tickets(withTerms())}
          </Block>
        {:else}
          <List nested>
            {#each detail.tickets as ticket (ticket.id)}
              <ListItem class="touch-feedback">
                {#snippet title()}
                  <DecryptPlaceholder
                    result={ticketTitleResult}
                    ciphertext={ticket.encryptedTitle}
                    length={20}
                  />
                {/snippet}
                {#snippet media()}
                  <StatusMark
                    status={deriveDisplayStatus(
                      ticket.status,
                      ticket.onHold,
                      ticket.followUpCount,
                    )}
                  />
                {/snippet}
                {#snippet after()}
                  <span class="ticket-meta">
                    {formatDate(ticket.createdAt)}
                  </span>
                {/snippet}
              </ListItem>
            {/each}
          </List>
        {/if}
      </div>

      <!-- Merge history section (hidden when empty, per design ref state 8) -->
      {#if detail.mergeHistory.length > 0}
        <div class="detail-section">
          <p class="section-label">{m.client_merge_history_heading()}</p>
          <List nested>
            {#each detail.mergeHistory as event (event.id)}
              <ListItem>
                {#snippet title()}
                  <span class="merge-event-title">
                    {m.client_merge_event({
                      alias:
                        event.secondaryClientId === detail.id
                          ? event.primaryClientId.slice(0, 8)
                          : event.secondaryClientId.slice(0, 8),
                    })}
                  </span>
                {/snippet}
                {#snippet subtitle()}
                  <span class="merge-event-date">
                    {formatDate(event.mergedAt)}
                  </span>
                {/snippet}
                {#snippet after()}
                  <span class="merge-actions">
                    {#if event.undoLocked}
                      <span class="merge-locked-label">
                        <Lock size={14} aria-hidden="true" />
                        {m.client_merge_locked()}
                      </span>
                    {/if}
                    {#if !event.isUndone && !event.undoLocked}
                      <button
                        type="button"
                        class="merge-action-btn touch-feedback"
                        onclick={() =>
                          undoMergeMutation.mutate({
                            mergeEventId: event.id,
                            encryptedSnapshot: event.snapshot,
                          })}
                        disabled={undoMergeMutation.isPending}
                      >
                        <RotateCcw size={14} aria-hidden="true" />
                        {m.client_merge_undo()}
                      </button>
                    {/if}
                    <button
                      type="button"
                      class="merge-action-btn touch-feedback"
                      onclick={() =>
                        lockMergeMutation.mutate({
                          mergeEventId: event.id,
                          locked: !event.undoLocked,
                        })}
                      disabled={lockMergeMutation.isPending}
                    >
                      {#if event.undoLocked}
                        <LockOpen size={14} aria-hidden="true" />
                        {m.client_merge_unlock()}
                      {:else}
                        <Lock size={14} aria-hidden="true" />
                        {m.client_merge_lock()}
                      {/if}
                    </button>
                  </span>
                {/snippet}
              </ListItem>
            {/each}
          </List>
        </div>
      {/if}
    {/if}
  </div>
</ShellSheet>

<PhoneEditSheet
  opened={phoneEditOpened}
  clientId={sheetClientId ?? ""}
  clientAlias={clientDetailQuery.data?.alias ?? ""}
  ondismiss={closePhoneEdit}
  onmerge={(conflictingClientId: string, conflictingAlias: string) => {
    closePhoneEdit();
    openMerge(conflictingClientId, conflictingAlias);
  }}
/>

<MergeSheet
  opened={mergeSheetOpened}
  clientA={mergeClientA}
  clientB={mergeClientB}
  ondismiss={closeMerge}
  onmerged={() => {
    closeMerge();
    closeSheet();
  }}
/>

<style>
  .clients-section {
    padding: 0.25rem var(--page-pad-x) 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .client-subtitle {
    color: var(--muted);
    font-size: var(--text-sm);
  }

  .subtitle-dot {
    margin: 0 0.25rem;
  }

  .merged-badge {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--muted);
    font-style: italic;
  }

  .edit-client-content {
    display: flex;
    flex-direction: column;
    padding: var(--space-md) var(--space-lg);
    flex: 1;
  }

  .detail-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
  }

  .section-label {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
  }

  .ticket-meta {
    color: var(--muted);
    font-size: var(--text-xs);
    white-space: nowrap;
  }

  .merge-event-title {
    font-size: var(--text-sm);
  }

  .merge-event-date {
    color: var(--muted);
    font-size: var(--text-xs);
  }

  .merge-actions {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-shrink: 0;
  }

  .merge-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--brand-text);
    background: none;
    border: none;
    cursor: pointer;
    min-height: 44px;
    min-width: 44px;
    border-radius: 0.25rem;
  }

  .merge-action-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .merge-locked-label {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: var(--text-xs);
    color: var(--muted);
  }
</style>
