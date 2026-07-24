<!--
  Volunteer assignment picker, opened from ticket list or panel.
  Displays org volunteers with search filtering and toggle-based selection.
  Current user is pinned first (with "(you)" suffix) unless search is active.
-->
<script lang="ts">
  import { BlockTitle, Searchbar, List, ListItem, Toggle } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { createVolunteersQuery } from "$lib/tickets/queries.js";
  import { getCollator } from "$lib/utils/collator.js";
  import { getOrgDecryptCache, getCurrentUserId } from "$lib/crypto/context.js";
  import { requireRouter } from "$lib/errors.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";

  interface AssignSheetProps {
    opened: boolean;
    ticketId: string;
    currentAssigneeId: string | null;
    ondismiss: () => void;
    onassign: (ticketId: string, targetUserId: string | null) => void;
  }

  let {
    opened,
    ticketId,
    currentAssigneeId,
    ondismiss,
    onassign,
  }: AssignSheetProps = $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");

  const orgCache = getOrgDecryptCache();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());

  const volunteersQuery = createVolunteersQuery(ticketRouter);

  let searchValue = $state("");
  let mutating = $state(false);

  // Decrypted volunteer list with current user pinned first.
  interface DecryptedVolunteer {
    id: string;
    displayName: string;
    isCurrentUser: boolean;
  }

  const decryptedVolunteers = $derived.by((): DecryptedVolunteer[] => {
    const data = volunteersQuery.data;
    if (!data) return [];

    const results: DecryptedVolunteer[] = [];

    for (const vol of data) {
      const name = orgCache.decrypt(
        `volunteer:${vol.id}`,
        vol.encryptedDisplayName,
      );
      if (name === null) continue;
      const isCurrentUser = vol.id === currentUserId;
      const displayName = isCurrentUser
        ? `${name} ${m.ticket_assign_you()}`
        : name;
      results.push({ id: vol.id, displayName, isCurrentUser });
    }

    // Pin current user first.
    results.sort((a, b) => {
      if (a.isCurrentUser && !b.isCurrentUser) return -1;
      if (!a.isCurrentUser && b.isCurrentUser) return 1;
      return getCollator().compare(a.displayName, b.displayName);
    });

    return results;
  });

  // Filter by search query. Current user pin yields to search (design doc line 221).
  const filteredVolunteers = $derived.by((): DecryptedVolunteer[] => {
    const query = searchValue.trim().toLowerCase();
    if (query === "") return decryptedVolunteers;
    return decryptedVolunteers.filter((v) =>
      v.displayName.toLowerCase().includes(query),
    );
  });

  function handleToggle(volunteerId: string): void {
    if (mutating) return;
    mutating = true;

    const isCurrentAssignee = volunteerId === currentAssigneeId;
    const target = isCurrentAssignee ? null : volunteerId;

    onassign(ticketId, target);
    ondismiss();

    // Reset state after dismiss.
    mutating = false;
    searchValue = "";
  }

  function handleSearchClear(): void {
    searchValue = "";
  }
</script>

<ShellSheet {opened} {ondismiss}>
  <BlockTitle>{m.ticket_assign_sheet_title()}</BlockTitle>

  <div class="assign-search-wrapper">
    <Searchbar
      placeholder={m.ticket_assign_search(withTerms())}
      value={searchValue}
      onInput={(e: Event) => {
        const target = e.target;
        if (target instanceof HTMLInputElement) {
          searchValue = target.value;
        }
      }}
      onClear={handleSearchClear}
      disableButton={false}
    />
  </div>

  {#if volunteersQuery.isLoading}
    <List nested>
      {#each [1, 2, 3] as n (n)}
        <ListItem>
          <InlineSkeleton width="8ch" />
          {#snippet after()}
            <Toggle disabled checked={false} />
          {/snippet}
        </ListItem>
      {/each}
    </List>
  {:else if volunteersQuery.isError}
    <div class="assign-error" role="alert">
      <p>{m.error_generic()}</p>
      <button class="retry-btn" onclick={() => void volunteersQuery.refetch()}>
        {m.app_retry()}
      </button>
    </div>
  {:else}
    <List nested>
      {#each filteredVolunteers as vol (vol.id)}
        <ListItem title={vol.displayName}>
          {#snippet after()}
            <Toggle
              checked={vol.id === currentAssigneeId}
              disabled={mutating}
              onChange={() => handleToggle(vol.id)}
            />
          {/snippet}
        </ListItem>
      {/each}
      {#if filteredVolunteers.length === 0}
        <ListItem title={m.empty_no_results()} />
      {/if}
    </List>
  {/if}
</ShellSheet>

<style>
  .assign-search-wrapper {
    padding: 0.5rem 1rem 0;
  }

  .assign-error {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--muted);
  }

  .retry-btn {
    margin-top: 0.5rem;
    color: var(--brand-text);
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--text-sm);
    text-decoration: underline;
  }
</style>
