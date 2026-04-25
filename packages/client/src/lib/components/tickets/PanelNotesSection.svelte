<!--
  Notes section for the ticket panel. Owns its own query, pagination,
  and decryption. Renders the skeleton, note list, and load-more control.
-->
<script lang="ts">
  import { BlockTitle, List, ListItem } from "konsta/svelte";
  import { StickyNote } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { createQuery } from "@tanstack/svelte-query";
  import { createPaginatedQuery } from "$lib/query/paginated.svelte.js";
  import { trpc } from "$lib/trpc/index.js";
  import { createVolunteersQuery } from "$lib/tickets/queries.js";
  import {
    buildVolunteerMap,
    resolveVolunteerName as resolveVolName,
  } from "$lib/tickets/resolve-volunteer.js";
  import {
    getFollowUpDecryptCache,
    getOrgDecryptCache,
  } from "$lib/crypto/context.js";
  import { resolveAsyncDecrypt } from "$lib/crypto/decrypt-result.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import LoadMore from "$lib/components/ui/LoadMore.svelte";
  import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";

  interface PanelNotesSectionProps {
    ticketId: string;
    keyWrap: TicketKeyWrap | null;
    onnotetap?: (noteId: string) => void;
  }

  let { ticketId, keyWrap, onnotetap }: PanelNotesSectionProps = $props();

  // --- Context caches ---

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;

  const followUpCache = getFollowUpDecryptCache();
  const orgCache = getOrgDecryptCache();

  // --- Query + pagination ---

  const NOTES_LIMIT = 100;

  const notesQuery = createQuery(() => ({
    queryKey: ["ticket", ticketId, "followUps", "notes"],
    queryFn: async () => {
      const result = await ticketRouter.listFollowUps.query({
        ticketId,
        types: ["internal_note"],
        limit: NOTES_LIMIT,
        direction: "older",
      });
      return result.followUps;
    },
    enabled: ticketId !== "" && keyWrap !== null,
  }));

  const notesPaginated = createPaginatedQuery({
    query: notesQuery,
    limit: NOTES_LIMIT,
    fetchPage: async (cursor) => {
      const result = await ticketRouter.listFollowUps.query({
        ticketId,
        types: ["internal_note"],
        limit: NOTES_LIMIT,
        direction: "older",
        cursor,
      });
      return result.followUps;
    },
    getCursor: (note) => note.id,
  });

  const notes = $derived(notesPaginated.items);

  // --- Volunteer name resolution ---

  const volunteersQuery = createVolunteersQuery(ticketRouter);
  const volunteerMap = $derived(buildVolunteerMap(volunteersQuery.data));

  function resolveVolunteerName(userId: string | null): string | undefined {
    return resolveVolName(userId, volunteerMap, orgCache);
  }
</script>

{#if notesQuery.isLoading}
  <BlockTitle class="!mt-6 !-mb-2">{m.ticket_panel_notes()}</BlockTitle>
  <List class="!my-3">
    {#each [1, 2] as n (n)}
      <ListItem>
        {#snippet title()}
          <InlineSkeleton width="8ch" />
        {/snippet}
        {#snippet subtitle()}
          <DecryptPlaceholder length={40} />
        {/snippet}
        {#snippet media()}
          <StickyNote size={18} aria-hidden="true" class="list-icon" />
        {/snippet}
      </ListItem>
    {/each}
  </List>
{:else if notes.length > 0}
  <BlockTitle class="!mt-6 !-mb-2">{m.ticket_panel_notes()}</BlockTitle>
  <List class="!my-3">
    {#each notes as note (note.id)}
      {@const noteResult = resolveAsyncDecrypt(
        followUpCache.decryptContent(note.id, keyWrap, note.encryptedContent),
        keyWrap !== null,
      )}
      {@const authorName =
        resolveVolunteerName(note.createdBy) ??
        m.ticket_private_note_author_fallback()}
      <ListItem
        link
        title={authorName}
        after={formatRelativeTime(new Date(note.createdAt))}
        onclick={() => onnotetap?.(note.id)}
        class="note-item"
      >
        {#snippet subtitle()}
          <DecryptPlaceholder
            result={noteResult}
            ciphertext={note.encryptedContent}
            length={40}
          />
        {/snippet}
        {#snippet media()}
          <StickyNote size={18} aria-hidden="true" class="list-icon" />
        {/snippet}
      </ListItem>
    {/each}
  </List>
  <LoadMore
    hasMore={notesPaginated.hasMore}
    loading={notesPaginated.loading}
    onloadmore={() => void notesPaginated.loadMore()}
  />
{/if}
