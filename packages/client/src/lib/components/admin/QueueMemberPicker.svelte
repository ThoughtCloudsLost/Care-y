<script lang="ts">
  import { BlockTitle, Searchbar, List, ListItem } from "konsta/svelte";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { queueKeys } from "$lib/query/keys.js";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { getCollator } from "$lib/utils/collator.js";
  import { trpc } from "$lib/trpc/index.js";
  import { createVolunteersQuery } from "$lib/tickets/queries.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { requireRouter } from "$lib/errors.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";

  interface QueueMemberPickerProps {
    readonly opened: boolean;
    readonly queueId: string;
    readonly currentMemberIds: ReadonlySet<string>;
    readonly ondismiss: () => void;
  }

  let { opened, queueId, currentMemberIds, ondismiss }: QueueMemberPickerProps =
    $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const queryClient = useQueryClient();
  const orgCache = getOrgDecryptCache();

  const volunteersQuery = createVolunteersQuery(ticketRouter);

  const addMemberMutation = createMutation(() => ({
    mutationFn: async (userId: string) =>
      ticketRouter.addQueueMember.mutate({ queueId, userId }),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_queue_member_added());
      announceToLiveRegion("polite", m.admin_queue_member_added());
      void queryClient.invalidateQueries({
        queryKey: queueKeys.members(queueId),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  let searchValue = $state("");

  interface PickerVolunteer {
    id: string;
    displayName: string | null;
  }

  const availableVolunteers = $derived.by((): PickerVolunteer[] => {
    const data = volunteersQuery.data;
    if (!data) return [];

    const results: PickerVolunteer[] = [];
    for (const vol of data) {
      if (currentMemberIds.has(vol.id)) continue;
      const name = orgCache.decrypt(
        `volunteer:${vol.id}`,
        vol.encryptedDisplayName,
      );
      results.push({ id: vol.id, displayName: name });
    }

    results.sort((a, b) => {
      const nameA = a.displayName ?? "\uffff";
      const nameB = b.displayName ?? "\uffff";
      return getCollator().compare(nameA, nameB);
    });

    return results;
  });

  const filteredVolunteers = $derived.by((): PickerVolunteer[] => {
    const query = searchValue.trim().toLowerCase();
    if (query === "") return availableVolunteers;
    return availableVolunteers.filter(
      (v) => v.displayName?.toLowerCase().includes(query) === true,
    );
  });

  function handleSelect(userId: string): void {
    addMemberMutation.mutate(userId);
  }

  function handleSearchClear(): void {
    searchValue = "";
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.admin_queue_member_picker_title()}
>
  <BlockTitle>{m.admin_queue_member_picker_title()}</BlockTitle>

  <div class="picker-search-wrapper">
    <Searchbar
      placeholder={m.admin_queue_member_picker_search(withTerms())}
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
    <List>
      {#each [1, 2, 3] as n (n)}
        <ListItem>
          <InlineSkeleton width="10ch" />
        </ListItem>
      {/each}
    </List>
  {:else if volunteersQuery.isError}
    <div class="picker-error" role="alert">
      <p>{m.error_generic()}</p>
      <button class="retry-btn" onclick={() => void volunteersQuery.refetch()}>
        {m.app_retry()}
      </button>
    </div>
  {:else if availableVolunteers.length === 0}
    <div class="picker-empty" role="status">
      <p>{m.admin_queue_member_picker_empty(withTerms())}</p>
    </div>
  {:else}
    <List>
      {#each filteredVolunteers as vol (vol.id)}
        <ListItem link onClick={() => handleSelect(vol.id)} chevron={false}>
          {#snippet title()}
            <DecryptPlaceholder content={vol.displayName} length={12} />
          {/snippet}
        </ListItem>
      {/each}
      {#if filteredVolunteers.length === 0}
        <ListItem title={m.admin_queue_member_picker_no_results()} />
      {/if}
    </List>
  {/if}
</ShellSheet>

<style>
  .picker-search-wrapper {
    padding: 0.5rem 1rem 0;
  }

  .picker-error {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--muted);
  }

  .picker-empty {
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
