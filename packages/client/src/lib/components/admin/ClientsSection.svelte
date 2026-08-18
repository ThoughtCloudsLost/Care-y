<script lang="ts">
  import { Block, List, ListInput, ListItem, Preloader } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import {
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
  import { formatShortDate } from "$lib/utils/time.js";
  import { requireRouter } from "$lib/errors.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import FieldError from "$lib/components/FieldError.svelte";
  import StatusMark from "$lib/components/StatusMark.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import ClientCard from "./ClientCard.svelte";
  import PhoneChangeSteps from "$lib/components/clients/PhoneChangeSteps.svelte";
  import MergeSheet from "$lib/components/clients/MergeSheet.svelte";
  import { SvelteSet } from "svelte/reactivity";
  import { getOrgKeyManager, getOrgDecryptCache } from "$lib/crypto/context.js";
  import { LOADING, type DecryptResult } from "$lib/crypto/decrypt-result.js";
  import { deriveDisplayStatus } from "$lib/tickets/display-status.js";

  // ---------------------------------------------------------------------------
  // Props
  // ---------------------------------------------------------------------------

  interface ClientListItem {
    readonly id: string;
    readonly encryptedAlias: string;
    readonly aliasHash: string | null;
    readonly phone: string | null;
    readonly ticketCount: number;
    readonly createdAt: string;
    readonly mergedInto: string | null;
  }

  interface ClientsSectionProps {
    readonly clients?: readonly ClientListItem[];
    readonly isLoading?: boolean;
    readonly isError?: boolean;
    readonly error?: unknown;
    readonly hasNextPage?: boolean;
    readonly isFetchingNextPage?: boolean;
    readonly onfetchnext?: () => void;
    readonly onretry?: () => void;
  }

  let {
    clients = [],
    isLoading = false,
    isError = false,
    error = null,
    hasNextPage = false,
    isFetchingNextPage = false,
    onfetchnext,
    onretry,
  }: ClientsSectionProps = $props();

  // ---------------------------------------------------------------------------
  // tRPC routers
  // ---------------------------------------------------------------------------

  const clientsRouter = requireRouter(trpc.clients, "clients");
  const ticketsRouter = requireRouter(trpc.tickets, "tickets");
  const queryClient = useQueryClient();
  const orgKeyManager = getOrgKeyManager();
  const orgCache = getOrgDecryptCache();

  // ---------------------------------------------------------------------------
  // Alias decryption helper
  // ---------------------------------------------------------------------------

  function decryptAlias(client: ClientListItem): string | null {
    return orgCache.decrypt(`client-alias:${client.id}`, client.encryptedAlias);
  }

  // ---------------------------------------------------------------------------
  // Lazy hash backfill (ADR-064)
  // ---------------------------------------------------------------------------

  // Known smell: rendering triggers a write. An effect that reads the loaded
  // roster issues a mutation, which is not what effects are for.
  //
  // It is here because the uniqueness hash is keyed with a browser-held key,
  // and a client created by an inbound webhook has no browser present to
  // compute it. Those rows are stored with a null hash and filled in by the
  // first session that decrypts them, so coverage follows use.
  //
  // Kept deliberately, and cheap in practice: it fires once per client ever,
  // only for webhook-created rows, and never again once the hash lands.
  // Generated aliases are unique by construction, so the only case it guards
  // is an operator typing a string identical to an existing generated alias.
  // If it becomes awkward, deleting it costs exactly that case.
  const backfilledIds = new SvelteSet<string>();

  const backfillMutation = createMutation(() => ({
    mutationFn: async (input: { clientId: string; aliasHash: string }) =>
      clientsRouter.backfillAliasHash.mutate(input),
    onError: (
      err: Error,
      variables: { clientId: string; aliasHash: string },
    ) => {
      if (err.message === ErrorCode.CLIENT_ALIAS_CONFLICT) {
        const msg = m.client_alias_uniqueness_error();
        toastStore.show(msg, 5000);
      }
      // Remove from backfilled set so it can be retried on next render
      // only for non-conflict errors. Conflicts are surfaced, not retried.
      if (err.message !== ErrorCode.CLIENT_ALIAS_CONFLICT) {
        backfilledIds.delete(variables.clientId);
      }
    },
  }));

  $effect(() => {
    for (const client of clients) {
      if (client.aliasHash !== null) continue;
      if (backfilledIds.has(client.id)) continue;
      const plaintext = orgCache.get(`client-alias:${client.id}`);
      if (plaintext === undefined) continue;
      backfilledIds.add(client.id);
      void orgKeyManager.aliasHash(plaintext).then((hash) => {
        backfillMutation.mutate({ clientId: client.id, aliasHash: hash });
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Client detail sheet
  // ---------------------------------------------------------------------------

  let sheetClientId = $state<string | null>(null);

  // The sheet body swaps between editing and the two gated phone steps. A
  // phone change rewrites the number across every ticket for the client, so
  // it passes through a confirmation, and the server may answer that another
  // client already holds the number.
  type SheetStep = "edit" | "confirm" | "conflict";
  let sheetStep = $state<SheetStep>("edit");

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
    const detail = clientDetailQuery.data;
    const alias = detail
      ? (orgCache.decrypt(`client-alias:${detail.id}`, detail.encryptedAlias) ??
        "")
      : "";
    return { id: sheetClientId, alias };
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
    sheetStep = "edit";
    editPhone = "";
    phoneError = null;
    phoneConflict = null;
  }

  // ---------------------------------------------------------------------------
  // Alias editing
  // ---------------------------------------------------------------------------

  let editAlias = $state("");
  let aliasError = $state<string | null>(null);

  // Decrypt the detail alias for seeding the edit field.
  const detailDecryptedAlias = $derived.by((): string | null => {
    const detail = clientDetailQuery.data;
    if (!detail) return null;
    return orgCache.decrypt(`client-alias:${detail.id}`, detail.encryptedAlias);
  });

  // When detail data loads and alias decrypts, seed the edit field.
  $effect(() => {
    if (detailDecryptedAlias !== null) {
      editAlias = detailDecryptedAlias;
      aliasError = null;
    }
  });

  const trimmedAlias = $derived(editAlias.trim());
  const aliasChanged = $derived(
    detailDecryptedAlias !== null &&
      trimmedAlias !== "" &&
      trimmedAlias !== detailDecryptedAlias,
  );

  const updateAliasMutation = createMutation(() => ({
    mutationFn: async (input: { clientId: string; alias: string }) => {
      const [encryptedAlias, aliasHash] = await Promise.all([
        orgKeyManager.encryptText(input.alias),
        orgKeyManager.aliasHash(input.alias),
      ]);
      return clientsRouter.updateAlias.mutate({
        clientId: input.clientId,
        encryptedAlias,
        aliasHash,
      });
    },
    onSuccess: (
      _data: unknown,
      variables: { clientId: string; alias: string },
    ) => {
      haptic();
      aliasError = null;
      // Clear the cached decrypt so fresh ciphertext is decoded.
      orgCache.delete(`client-alias:${variables.clientId}`);
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

  // ---------------------------------------------------------------------------
  // Phone editing
  // ---------------------------------------------------------------------------

  // editPhone is deliberately never seeded from the loaded client. clients.get
  // returns a display string, full for an admin and masked for a manager, so
  // there is no round-trippable value to prefill. An empty field means "leave
  // the number alone"; anything typed is a full replacement.
  let editPhone = $state("");
  let phoneError = $state<string | null>(null);
  let phoneConflict = $state<{
    conflictingClientId: string;
    conflictingClientEncryptedAlias: string;
  } | null>(null);

  // The conflicting client's alias arrives as ciphertext like any other, so
  // it decrypts through the shared cache rather than being read directly.
  const phoneConflictAlias = $derived(
    phoneConflict === null
      ? null
      : orgCache.decrypt(
          `client-alias:${phoneConflict.conflictingClientId}`,
          phoneConflict.conflictingClientEncryptedAlias,
        ),
  );

  const E164_PATTERN = /^\+[1-9]\d{1,14}$/;
  const trimmedPhone = $derived(editPhone.trim());
  const phoneEntered = $derived(trimmedPhone !== "");
  const phoneValid = $derived(E164_PATTERN.test(trimmedPhone));

  const updatePhoneMutation = createMutation(() => ({
    mutationFn: async (input: { clientId: string; phoneNumber: string }) =>
      clientsRouter.updatePhone.mutate(input),
    onSuccess: (result: {
      success: boolean;
      conflict: {
        conflictingClientId: string;
        conflictingClientEncryptedAlias: string;
      } | null;
    }) => {
      if (result.conflict) {
        phoneConflict = result.conflict;
        sheetStep = "conflict";
        return;
      }
      haptic();
      void queryClient.invalidateQueries({ queryKey: clientKeys.all });
      void queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
      const msg = m.client_phone_changed_toast();
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
      closeSheet();
    },
    onError: () => {
      toastStore.show(m.error_generic());
      sheetStep = "edit";
    },
  }));

  // ---------------------------------------------------------------------------
  // Saving
  // ---------------------------------------------------------------------------

  const savePending = $derived(
    updateAliasMutation.isPending || updatePhoneMutation.isPending,
  );

  const canSave = $derived(
    (aliasChanged || phoneEntered) && (!phoneEntered || phoneValid),
  );

  function handleSave(): void {
    if (sheetClientId === null || !canSave) return;
    if (phoneEntered) {
      // Gate the phone write behind the confirmation, alias included, so the
      // warning is shown before anything is written.
      phoneError = null;
      sheetStep = "confirm";
      return;
    }
    handleSaveAlias();
  }

  function handleSaveAlias(): void {
    if (sheetClientId === null || !aliasChanged) return;
    updateAliasMutation.mutate({
      clientId: sheetClientId,
      alias: trimmedAlias,
    });
  }

  // Alias carries no gate of its own and is independently valid, so it is
  // written first. A phone conflict then cannot silently discard an alias
  // edit the user already made.
  function handleConfirmPhone(): void {
    if (sheetClientId === null) return;
    if (aliasChanged) handleSaveAlias();
    updatePhoneMutation.mutate({
      clientId: sheetClientId,
      phoneNumber: trimmedPhone,
    });
  }

  function handleCancelPhone(): void {
    sheetStep = "edit";
  }

  function handleTryAnotherPhone(): void {
    phoneConflict = null;
    editPhone = "";
    sheetStep = "edit";
  }

  function handleMergeFromConflict(): void {
    const conflict = phoneConflict;
    if (conflict === null) return;
    openMerge(conflict.conflictingClientId, phoneConflictAlias ?? "");
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
    <div class="client-list">
      {#each clients as client (client.id)}
        <ClientCard
          viewMode="list"
          clientId={client.id}
          alias={decryptAlias(client) ?? "..."}
          phone={client.phone}
          ticketCount={client.ticketCount}
          createdAt={client.createdAt}
          mergedInto={client.mergedInto}
          onedit={openClientDetail}
        />
      {/each}
      {#if hasNextPage}
        <div class="load-more">
          <SoftButton onclick={onfetchnext} disabled={isFetchingNextPage}>
            {#if isFetchingNextPage}
              <Preloader class="w-4 h-4" />
            {:else}
              {m.common_load_more()}
            {/if}
          </SoftButton>
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Client detail sheet -->
<ShellSheet
  opened={sheetClientId !== null}
  ondismiss={closeSheet}
  title={detailDecryptedAlias ?? ""}
  ariaLabel={m.client_detail_title(withTerms())}
>
  {#snippet headerRight()}
    {#if sheetStep === "edit"}
      <SoftButton onclick={handleSave} disabled={!canSave || savePending}>
        {#if savePending}
          <Preloader class="w-4 h-4" />
        {:else}
          <Save size={16} aria-hidden="true" />
          {m.admin_user_save_changes()}
        {/if}
      </SoftButton>
    {/if}
  {/snippet}

  <div class="edit-client-content">
    {#if sheetStep !== "edit"}
      <PhoneChangeSteps
        step={sheetStep === "conflict" ? "conflict" : "confirm"}
        clientAlias={detailDecryptedAlias ?? ""}
        conflictAlias={phoneConflictAlias}
        pending={savePending}
        onconfirm={handleConfirmPhone}
        oncancel={handleCancelPhone}
        onmerge={handleMergeFromConflict}
        ontryanother={handleTryAnotherPhone}
      />
    {:else if clientDetailQuery.isLoading}
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

      <!-- Phone section. The current number is read-only because the server
           returns a display string (masked for a manager), so the input below
           takes a full replacement rather than an edit of what is shown. -->
      <div class="detail-section">
        <p class="section-label">{m.client_phone_label()}</p>
        {#if detail.phone !== null && detail.phone !== ""}
          <p class="current-phone">
            <Phone size={16} aria-hidden="true" />
            {detail.phone}
          </p>
        {/if}
        <List nested>
          <ListInput
            label={m.client_phone_label()}
            type="tel"
            value={editPhone}
            placeholder={m.client_phone_placeholder()}
            oninput={(e: Event) => {
              if (e.target instanceof HTMLInputElement) {
                editPhone = e.target.value;
                phoneError =
                  e.target.value.trim() === "" ||
                  E164_PATTERN.test(e.target.value.trim())
                    ? null
                    : m.client_phone_invalid_error();
              }
            }}
            disabled={savePending}
          />
        </List>
        <FieldError message={phoneError ?? undefined} />
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
                    {formatShortDate(ticket.createdAt)}
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
                    {formatShortDate(event.mergedAt)}
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

  .client-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    min-width: 0;
  }

  .load-more {
    display: flex;
    justify-content: center;
    padding: var(--space-md) 0;
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

  .current-phone {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    color: var(--ink-2);
    font-size: var(--text-sm);
    margin: 0;
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
