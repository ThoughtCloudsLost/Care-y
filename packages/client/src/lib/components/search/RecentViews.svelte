<!--
  Recently-viewed sections for the empty-query search overlay.

  Renders one card strip per entity type (tickets, KB articles), reusing
  each provider's ResultItem through TicketResultStrip so recents rows
  are the exact components search results use. Entries resolve through
  provider.resolveById() in $derived context: still-decrypting or
  no-longer-accessible entities return undefined and simply do not
  render, so the list can never show a title the user cannot currently
  decrypt.
-->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import {
    recentViews,
    type RecentViewType,
  } from "$lib/search/recent-views.js";
  import { getProvider } from "$lib/search/registry.svelte.js";
  import type { SearchResult } from "$lib/search/types.js";
  import TicketResultStrip from "./TicketResultStrip.svelte";

  interface RecentViewsProps {
    /** Raw result href from the provider; the host normalizes and navigates. */
    onnavigate: (href: string) => void;
  }

  let { onnavigate }: RecentViewsProps = $props();

  function resolveAll(
    providerId: string,
    type: RecentViewType,
  ): readonly SearchResult[] {
    const provider = getProvider(providerId);
    if (!provider?.resolveById) return [];
    const resolved: SearchResult[] = [];
    for (const entry of recentViews.entriesOf(type)) {
      const result = provider.resolveById(entry.id);
      if (result !== undefined) resolved.push(result);
    }
    return resolved;
  }

  const ticketResults = $derived(resolveAll("tickets", "ticket"));
  const articleResults = $derived(resolveAll("kb", "article"));

  function handleTap(providerId: string): (id: string) => void {
    return (id: string) => {
      const provider = getProvider(providerId);
      if (provider) onnavigate(provider.getResultHref(id));
    };
  }
</script>

{#if ticketResults.length > 0}
  <div class="recents-secline">
    <span class="secline-eb">
      {m.search_viewed_tickets_heading(withTerms())}
    </span>
    <span class="secline-rule" aria-hidden="true"></span>
  </div>
  <TicketResultStrip
    results={ticketResults}
    providerId="tickets"
    ontap={handleTap("tickets")}
    loading={false}
  />
{/if}

{#if articleResults.length > 0}
  <div class="recents-secline">
    <span class="secline-eb">{m.search_viewed_articles_heading()}</span>
    <span class="secline-rule" aria-hidden="true"></span>
  </div>
  <TicketResultStrip
    results={articleResults}
    providerId="kb"
    ontap={handleTap("kb")}
    loading={false}
  />
{/if}

<style>
  /* Same secline anatomy as SearchRecents: eyebrow, ruled line. */
  .recents-secline {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-xl) var(--page-pad-x) var(--space-sm);
  }
</style>
