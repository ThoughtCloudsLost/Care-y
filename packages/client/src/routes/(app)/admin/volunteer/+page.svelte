<script lang="ts">
  import { List, ListItem, Block } from "konsta/svelte";
  import SoftButton from "$lib/components/SoftButton.svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { ticketsKeys } from "$lib/query/keys.js";
  import {
    KeyRound,
    Phone,
    BookOpen,
    Calendar,
    ShieldUser,
    HeartHandshake,
    Eye,
    Layers,
    CircleCheck,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import { trpc } from "$lib/trpc/index.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import {
    createSectionScroll,
    type ScrollSection,
  } from "$lib/components/useSectionScroll.svelte.js";
  import SectionScrollNav from "$lib/components/SectionScrollNav.svelte";

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;

  const orgCache = getOrgDecryptCache();

  const queuesQuery = createQuery(() => ({
    queryKey: ticketsKeys.myQueues(),
    queryFn: async () => ticketRouter.myQueues.query(),
  }));

  type QueueRecord = NonNullable<typeof queuesQuery.data>[number];

  function decryptQueueName(queue: QueueRecord): string | null {
    return orgCache.decrypt(`queue:${queue.id}`, queue.encrypted_name);
  }

  function handleSecurityStatus(): void {
    toastStore.show(m.admin_coming_soon());
  }

  function handleReplayTour(): void {
    toastStore.show(m.admin_coming_soon());
  }

  const SECTIONS: readonly ScrollSection[] = [
    { id: "access", label: m.vol_section_access, icon: KeyRound },
    { id: "queues", label: m.vol_section_queues, icon: Layers },
    { id: "protected", label: m.vol_section_protected, icon: ShieldUser },
    { id: "clients", label: m.vol_section_clients, icon: HeartHandshake },
  ];

  const scroll = createSectionScroll(() => SECTIONS);

  const navbarCtx = getNavbarOverrideCtx();

  $effect(() => {
    navbarCtx.current = {
      title: m.vol_page_title(),
      subnavbar: volSubnavbar,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });
</script>

{#snippet volSubnavbar()}
  <SectionScrollNav
    sections={SECTIONS}
    active={scroll.active}
    onscroll={(id: string) => scroll.scrollTo(id)}
    ariaLabel={m.vol_page_title()}
  />
{/snippet}

<div class="volunteer-page">
  <div id="section-access" class="vol-section">
    <List inset strong>
      <ListItem groupTitle>{m.vol_section_access()}</ListItem>
      <ListItem title={m.vol_access_tickets()}>
        {#snippet media()}
          <CircleCheck size={18} aria-hidden="true" class="section-icon" />
        {/snippet}
      </ListItem>
      <ListItem title={m.vol_access_call()}>
        {#snippet media()}
          <Phone size={18} aria-hidden="true" class="section-icon" />
        {/snippet}
      </ListItem>
      <ListItem title={m.vol_access_kb()}>
        {#snippet media()}
          <BookOpen size={18} aria-hidden="true" class="section-icon" />
        {/snippet}
      </ListItem>
      <ListItem title={m.vol_access_shifts()}>
        {#snippet media()}
          <Calendar size={18} aria-hidden="true" class="section-icon" />
        {/snippet}
      </ListItem>
      <ListItem title={m.vol_access_security()}>
        {#snippet media()}
          <HeartHandshake size={18} aria-hidden="true" class="section-icon" />
        {/snippet}
      </ListItem>
    </List>
  </div>

  <div id="section-queues" class="vol-section">
    <List inset strong>
      <ListItem groupTitle>{m.vol_section_queues()}</ListItem>
      {#if queuesQuery.isPending}
        <ListItem title="..." />
      {:else if queuesQuery.data && queuesQuery.data.length > 0}
        {#each queuesQuery.data as queue (queue.id)}
          {@const name = decryptQueueName(queue)}
          <ListItem>
            {#snippet title()}
              {#if name}
                {name}
              {:else}
                <DecryptPlaceholder />
              {/if}
            {/snippet}
          </ListItem>
        {/each}
      {:else}
        <ListItem title={m.vol_queues_empty()} />
      {/if}
    </List>
  </div>

  <div id="section-protected" class="vol-section">
    <List inset strong>
      <ListItem groupTitle>{m.vol_section_protected()}</ListItem>
      <ListItem title={m.vol_protected_name()}>
        {#snippet media()}
          <ShieldUser size={18} aria-hidden="true" class="section-icon" />
        {/snippet}
      </ListItem>
      <ListItem title={m.vol_protected_identifier()}>
        {#snippet media()}
          <ShieldUser size={18} aria-hidden="true" class="section-icon" />
        {/snippet}
      </ListItem>
      <ListItem title={m.vol_protected_keys()}>
        {#snippet media()}
          <ShieldUser size={18} aria-hidden="true" class="section-icon" />
        {/snippet}
      </ListItem>
    </List>
  </div>

  <div id="section-clients" class="vol-section">
    <List inset strong>
      <ListItem groupTitle>{m.vol_section_clients()}</ListItem>
      <ListItem title={m.vol_clients_encrypted()}>
        {#snippet media()}
          <HeartHandshake size={18} aria-hidden="true" class="section-icon" />
        {/snippet}
      </ListItem>
    </List>
  </div>

  <Block class="vol-footer">
    <SoftButton onclick={handleSecurityStatus}>
      <Eye size={16} aria-hidden="true" />
      {m.vol_link_security_status()}
    </SoftButton>
    <SoftButton onclick={handleReplayTour}>
      {m.vol_link_replay_tour()}
    </SoftButton>
  </Block>
</div>

<style>
  .volunteer-page {
    padding: var(--space-sm) 0;
  }

  .volunteer-page :global(.section-icon) {
    color: var(--brand-accent);
  }

  .vol-section {
    scroll-margin-top: 7rem;
  }

  .volunteer-page :global(.vol-footer) {
    display: flex;
    gap: var(--space-sm);
  }
</style>
