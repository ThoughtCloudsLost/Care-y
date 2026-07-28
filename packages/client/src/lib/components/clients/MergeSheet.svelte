<!--
  Merge sheet: three-step flow for merging two clients.
  Step 1 (select): pick primary (survives) and secondary (merged in).
  Step 2 (confirm): review the merge and confirm.
  Step 3 (result): success toast, haptic, invalidate, close.

  Two entry paths:
  - From client list: one client pre-populated, search for the other.
  - From phone conflict: both clients pre-populated.

  Rendered inside ClientsSection. Follows the PhoneEditSheet pattern.
-->
<script lang="ts">
  import {
    Block,
    Button,
    List,
    ListItem,
    Preloader,
    Radio,
  } from "konsta/svelte";
  import {
    createInfiniteQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
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
  import { getOrgKeyManager, getOrgDecryptCache } from "$lib/crypto/context.js";
  import { uint8ArrayToBase64 } from "$lib/utils/buffer-encoding.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  // ---------------------------------------------------------------------------
  // Props
  // ---------------------------------------------------------------------------

  interface ClientStub {
    readonly id: string;
    readonly alias: string;
  }

  interface MergeSheetProps {
    readonly opened: boolean;
    /** Pre-selected client (from client list or the "current" client). */
    readonly clientA: ClientStub | null;
    /** Pre-selected conflicting client (from phone conflict). */
    readonly clientB: ClientStub | null;
    readonly ondismiss: () => void;
    readonly onmerged: () => void;
  }

  let { opened, clientA, clientB, ondismiss, onmerged }: MergeSheetProps =
    $props();

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  type Step = "select" | "confirm";

  let step = $state<Step>("select");
  let primaryId = $state<string | null>(null);
  let searchQuery = $state("");
  let searchDebounced = $state("");
  let searchTimer = $state<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // The two candidates. When opened from phone conflict, both arrive
  // pre-populated. When opened from client list, only slotA has a value
  // and the user must search for slotB.
  let slotA = $state<ClientStub | null>(null);
  let slotB = $state<ClientStub | null>(null);

  // Reset state when the sheet opens or closes
  $effect(() => {
    if (opened) {
      slotA = clientA;
      slotB = clientB;
      // Default primary to client A when both are pre-populated
      primaryId = clientA?.id ?? null;
      step = "select";
      searchQuery = "";
      searchDebounced = "";
    } else {
      slotA = null;
      slotB = null;
      primaryId = null;
      step = "select";
      searchQuery = "";
      searchDebounced = "";
    }
  });

  const bothSelected = $derived(slotA !== null && slotB !== null);
  const canContinue = $derived(
    bothSelected && primaryId !== null && slotA?.id !== slotB?.id,
  );
  const sameClientError = $derived(bothSelected && slotA?.id === slotB?.id);

  const primaryAlias = $derived.by((): string => {
    if (primaryId === slotA?.id) return slotA.alias;
    if (primaryId === slotB?.id) return slotB.alias;
    return "";
  });

  const secondaryAlias = $derived.by((): string => {
    if (primaryId === slotA?.id) return slotB?.alias ?? "";
    if (primaryId === slotB?.id) return slotA?.alias ?? "";
    return "";
  });

  const primaryClientId = $derived.by((): string => {
    return primaryId ?? "";
  });

  const secondaryClientId = $derived.by((): string => {
    if (primaryId === slotA?.id) return slotB?.id ?? "";
    if (primaryId === slotB?.id) return slotA?.id ?? "";
    return "";
  });

  // ---------------------------------------------------------------------------
  // Search query for finding the second client
  // ---------------------------------------------------------------------------

  const clientsRouter = requireRouter(trpc.clients, "clients");
  const ticketsRouter = requireRouter(trpc.tickets, "tickets");
  const queryClient = useQueryClient();
  const orgKeyManager = getOrgKeyManager();
  const orgCache = getOrgDecryptCache();

  const needsSearch = $derived(slotA !== null && slotB === null);

  const searchResultsQuery = createInfiniteQuery(() => ({
    queryKey: clientKeys.list({
      query: searchDebounced,
      sortBy: "created_at",
      sortDirection: "desc",
    }),
    queryFn: async ({ pageParam }) =>
      clientsRouter.list.query({
        query: searchDebounced,
        sortBy: "created_at",
        sortDirection: "desc",
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length >= 25 ? lastPage[lastPage.length - 1]?.id : undefined,
    enabled: needsSearch && searchDebounced.length > 0,
  }));

  const allSearchResults = $derived(
    searchResultsQuery.data?.pages.flat() ?? [],
  );

  // Filter out the already-selected client from search results and decrypt aliases
  const filteredResults = $derived.by(() => {
    const selected = slotA;
    if (selected === null) return allSearchResults;
    return allSearchResults.filter((r) => r.id !== selected.id);
  });

  function handleSearchInput(e: Event): void {
    if (!(e.target instanceof HTMLInputElement)) return;
    searchQuery = e.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchDebounced = searchQuery.trim();
    }, 300);
  }

  function selectSearchResult(client: {
    id: string;
    encryptedAlias: string;
  }): void {
    const alias =
      orgCache.decrypt(`client-alias:${client.id}`, client.encryptedAlias) ??
      "...";
    slotB = { id: client.id, alias };
    searchQuery = "";
    searchDebounced = "";
  }

  // ---------------------------------------------------------------------------
  // Step transitions
  // ---------------------------------------------------------------------------

  function handleContinue(): void {
    if (!canContinue) return;
    step = "confirm";
  }

  function handleBackToSelect(): void {
    step = "select";
  }

  // ---------------------------------------------------------------------------
  // Merge mutation
  // ---------------------------------------------------------------------------

  const mergeMutation = createMutation(() => ({
    mutationFn: async (input: {
      primaryClientId: string;
      secondaryClientId: string;
    }) => {
      // Build a snapshot of the secondary client for undo.
      // Encrypt with the org key so only org members can decrypt it.
      const snapshot = JSON.stringify({
        secondaryClientId: input.secondaryClientId,
        alias: secondaryAlias,
      });
      const textBytes = new TextEncoder().encode(snapshot);
      const cipherBytes = await orgKeyManager.encrypt(textBytes);
      const encryptedSnapshot = uint8ArrayToBase64(cipherBytes);

      return ticketsRouter.mergeClients.mutate({
        primaryClientId: input.primaryClientId,
        secondaryClientId: input.secondaryClientId,
        encryptedSnapshot,
      });
    },
    onSuccess: () => {
      const msg = m.client_merged_toast(withTerms());
      toastStore.show(msg);
      haptic();
      void queryClient.invalidateQueries({ queryKey: clientKeys.all });
      void queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
      announceToLiveRegion("assertive", msg);
      onmerged();
    },
    onError: (err: Error) => {
      if (err.message === ErrorCode.CANNOT_MERGE_INTO_SELF) {
        toastStore.show(m.client_merge_same_client_error(withTerms()), 3000);
      } else if (err.message === ErrorCode.SECONDARY_ALREADY_MERGED) {
        toastStore.show(m.error_secondary_already_merged(withTerms()), 3000);
      } else {
        toastStore.show(m.error_generic(), 3000);
      }
    },
  }));

  function handleMerge(): void {
    if (!canContinue) return;
    mergeMutation.mutate({
      primaryClientId,
      secondaryClientId,
    });
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  title={m.client_merge_sheet_title(withTerms())}
  ariaLabel={m.client_merge_sheet_title(withTerms())}
>
  {#if step === "select"}
    <div class="merge-step">
      <Block>
        <p class="step-heading">
          {m.client_merge_sheet_title(withTerms())}
        </p>
        <p class="step-description">
          {m.client_merge_select_prompt(withTerms())}
        </p>
      </Block>

      <!-- Search for the second client when only one is pre-populated -->
      {#if needsSearch}
        <Block>
          <input
            type="search"
            class="merge-search-input"
            placeholder={m.client_merge_search_placeholder(withTerms())}
            value={searchQuery}
            oninput={handleSearchInput}
          />
        </Block>

        {#if searchDebounced.length > 0}
          {#if searchResultsQuery.isLoading}
            <Block class="search-loading">
              <Preloader class="w-5 h-5" />
            </Block>
          {:else if filteredResults.length === 0}
            <Block>
              <p class="no-results">
                {m.client_merge_no_results(withTerms())}
              </p>
            </Block>
          {:else}
            <List nested>
              {#each filteredResults as result (result.id)}
                {@const resultAlias =
                  orgCache.decrypt(
                    `client-alias:${result.id}`,
                    result.encryptedAlias,
                  ) ?? "..."}
                <ListItem
                  title={resultAlias}
                  after={result.ticketCount === 1
                    ? m.clients_ticket_count_one(
                        withTerms({ count: result.ticketCount }),
                      )
                    : m.clients_ticket_count_other(
                        withTerms({ count: result.ticketCount }),
                      )}
                  onclick={() => selectSearchResult(result)}
                  onkeydown={onKeyActivate(() => selectSearchResult(result))}
                  role="button"
                  tabindex={0}
                  class="touch-feedback"
                />
              {/each}
            </List>
          {/if}
        {/if}
      {/if}

      <!-- Both clients selected: show role selection -->
      {#if bothSelected && slotA !== null && slotB !== null}
        <!-- Bind to consts: snippets are separate closures, so the null
             narrowing above does not reach inside them. -->
        {@const first = slotA}
        {@const second = slotB}
        <List nested>
          <ListItem label title={first.alias}>
            {#snippet media()}
              <Radio
                component="div"
                name="merge-role"
                value={first.id}
                checked={primaryId === first.id}
                onChange={() => {
                  primaryId = first.id;
                }}
              />
            {/snippet}
            {#snippet after()}
              <span class="role-label">
                {primaryId === first.id
                  ? m.client_merge_primary_label()
                  : m.client_merge_secondary_label()}
              </span>
            {/snippet}
          </ListItem>
          <ListItem label title={second.alias}>
            {#snippet media()}
              <Radio
                component="div"
                name="merge-role"
                value={second.id}
                checked={primaryId === second.id}
                onChange={() => {
                  primaryId = second.id;
                }}
              />
            {/snippet}
            {#snippet after()}
              <span class="role-label">
                {primaryId === second.id
                  ? m.client_merge_primary_label()
                  : m.client_merge_secondary_label()}
              </span>
            {/snippet}
          </ListItem>
        </List>

        {#if sameClientError}
          <Block>
            <p class="error-text">
              {m.client_merge_same_client_error(withTerms())}
            </p>
          </Block>
        {/if}

        <Block>
          <Button large onclick={handleContinue} disabled={!canContinue}>
            {m.common_next()}
          </Button>
        </Block>
      {/if}
    </div>
  {:else if step === "confirm"}
    <div class="merge-step">
      <Block>
        <p class="step-heading confirm-heading">
          {m.client_merge_confirm_title()}
        </p>
        <p class="confirm-body">
          {m.client_merge_confirm_body(
            withTerms({
              primaryAlias,
              secondaryAlias,
            }),
          )}
        </p>
      </Block>
      <Block>
        <Button
          large
          class="merge-confirm-btn"
          onclick={handleMerge}
          disabled={mergeMutation.isPending}
        >
          {#if mergeMutation.isPending}
            <Preloader class="w-5 h-5" />
          {:else}
            {m.client_merge_confirm_button(withTerms())}
          {/if}
        </Button>
        <div class="btn-spacer"></div>
        <Button large outline onclick={handleBackToSelect}>
          {m.common_cancel()}
        </Button>
      </Block>
    </div>
  {/if}
</ShellSheet>

<style>
  .merge-step {
    display: flex;
    flex-direction: column;
    padding: var(--space-md) 0;
  }

  .step-heading {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--ink);
    margin: 0 0 var(--space-sm) 0;
  }

  .step-description {
    color: var(--muted);
    font-size: var(--text-base);
    margin: 0;
    line-height: 1.5;
  }

  .confirm-heading {
    color: var(--urgent);
  }

  .confirm-body {
    color: var(--urgent);
    font-size: var(--text-base);
    margin: 0;
    line-height: 1.5;
  }

  :global(.merge-confirm-btn) {
    --k-color-primary: var(--danger);
  }

  .btn-spacer {
    height: var(--space-sm);
  }

  .role-label {
    color: var(--muted);
    font-size: var(--text-xs);
    white-space: nowrap;
  }

  .merge-search-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: var(--text-sm);
    border: 1px solid var(--hair);
    border-radius: 0.5rem;
    background: var(--paper);
    color: var(--ink);
    min-height: 44px;
  }

  .merge-search-input::placeholder {
    color: var(--muted);
  }

  .no-results {
    color: var(--muted);
    font-size: var(--text-sm);
    text-align: center;
    margin: 0;
  }

  .error-text {
    color: var(--danger);
    font-size: var(--text-sm);
    margin: 0;
  }

  :global(.search-loading) {
    display: flex;
    justify-content: center;
    padding: var(--space-md) 0;
  }
</style>
