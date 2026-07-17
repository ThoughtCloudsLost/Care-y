<!--
  @mention autocomplete dropdown for the compose bar.

  Floats above the ShellMessagebar when the user types `@` followed by
  characters. Filters the org volunteer list by prefix match on decrypted
  display names. Uses OrgDecryptCache (org-key tier, main thread OK).

  This is a content component: no shell imports. Positioned absolutely
  relative to the chat container, NOT rendered as a Konsta Popover
  (needs to float above the Messagebar without a backdrop).
-->
<script lang="ts">
  import { List, ListItem } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { createVolunteersQuery } from "$lib/tickets/queries.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import { requireRouter } from "$lib/errors.js";

  interface MentionAutocompleteProps {
    draftText: string;
    cursorPosition: number;
    onselect: (userId: string, displayName: string) => void;
  }

  let { draftText, cursorPosition, onselect }: MentionAutocompleteProps =
    $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");

  const orgCache = getOrgDecryptCache();

  // Volunteer list query (cached, fetched once per session).
  const volunteersQuery = createVolunteersQuery(ticketRouter);

  // Extract @partial from cursor position.
  // Searches backward from cursor for the last `@` not preceded by a
  // non-space character (must be at start of input or after whitespace).
  const mentionPattern = /(^|[\s])@(\S*)$/;
  const mentionQuery = $derived.by((): string | null => {
    if (cursorPosition <= 0) return null;
    const before = draftText.slice(0, cursorPosition);
    const result = mentionPattern.exec(before);
    if (!result) return null;
    return result[2] ?? null;
  });

  // Decrypt display names and filter by prefix.
  interface DecryptedVolunteer {
    id: string;
    displayName: string;
  }

  const filteredVolunteers = $derived.by((): DecryptedVolunteer[] => {
    if (mentionQuery === null) return [];
    const volunteers = volunteersQuery.data;
    if (!volunteers) return [];

    const query = mentionQuery.toLowerCase();
    const results: DecryptedVolunteer[] = [];

    for (const vol of volunteers) {
      const name = orgCache.decrypt(
        `volunteer:${vol.id}`,
        vol.encryptedDisplayName,
      );
      if (name === null) continue;
      if (query === "" || name.toLowerCase().startsWith(query)) {
        results.push({ id: vol.id, displayName: name });
      }
      if (results.length >= 5) break;
    }

    return results;
  });

  const visible = $derived(
    mentionQuery !== null && filteredVolunteers.length > 0,
  );

  function selectMention(userId: string, displayName: string): void {
    onselect(userId, displayName);
  }
</script>

{#if visible}
  <div
    class="mention-dropdown"
    role="listbox"
    aria-label={m.ticket_mention_volunteers(withTerms())}
  >
    <List nested>
      {#each filteredVolunteers as vol (vol.id)}
        <ListItem
          role="option"
          title={vol.displayName}
          titleWrapClass="mention-title-wrap"
          onclick={() => selectMention(vol.id, vol.displayName)}
        />
      {/each}
    </List>
  </div>
{/if}

<style>
  .mention-dropdown {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    z-index: 30;
    max-height: 12rem;
    overflow-x: hidden;
    overflow-y: auto;
    background: var(--raised, var(--card-bg, var(--surface-1)));
    border-top: 1px solid var(--hair-2, var(--card-border, var(--muted)));
    border-radius: 0.5rem 0.5rem 0 0;
    box-shadow: var(--card-shadow, 0 -2px 8px rgba(0, 0, 0, 0.1));
  }

  .mention-dropdown :global(.mention-title-wrap) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
