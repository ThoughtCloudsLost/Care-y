<script lang="ts">
  import { List, ListItem, Block } from "konsta/svelte";
  import SoftButton from "$lib/components/SoftButton.svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Permission } from "@care-y/shared";
  import {
    ClipboardList,
    Layers,
    Eye,
    ChartColumn,
    ShieldUser,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import {
    getCurrentPermissions,
    getOrgDecryptCache,
  } from "$lib/crypto/context.js";
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

  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());
  const hasAccess = $derived(permissions.has(Permission.MANAGE_USERS));

  $effect(() => {
    if (!hasAccess) void goto(resolve("/"));
  });

  const orgCache = getOrgDecryptCache();

  const queuesQuery = createQuery(() => ({
    queryKey: ["queues"],
    queryFn: async () => ticketRouter.listQueues.query(),
  }));

  const myQueuesQuery = createQuery(() => ({
    queryKey: ["tickets", "myQueues"],
    queryFn: async () => ticketRouter.myQueues.query(),
  }));

  type AllQueueRecord = NonNullable<typeof queuesQuery.data>[number];
  type MyQueueRecord = NonNullable<typeof myQueuesQuery.data>[number];

  function decryptQueueDisplayName(
    id: string,
    cipher: AllQueueRecord["encryptedName"],
  ): string | null {
    return orgCache.decrypt(`queue:${id}`, cipher);
  }

  const totalOpenTickets = $derived.by((): number => {
    const data = queuesQuery.data;
    if (!data) return 0;
    return data.reduce(
      (sum: number, q: AllQueueRecord) => sum + Number(q.openCount),
      0,
    );
  });

  function handleReports(): void {
    void goto(resolve("/admin/organization?tab=reports"));
  }

  function handleSecurityStatus(): void {
    toastStore.show(m.admin_coming_soon());
  }

  const SECTIONS: readonly ScrollSection[] = [
    { id: "role", label: m.mgr_section_role, icon: ClipboardList },
    { id: "ops", label: m.mgr_section_ops, icon: ChartColumn },
    { id: "queues", label: m.mgr_section_queues, icon: Layers },
    { id: "protected", label: m.mgr_section_protected, icon: ShieldUser },
  ];

  const scroll = createSectionScroll(() => SECTIONS);

  const navbarCtx = getNavbarOverrideCtx();

  $effect(() => {
    navbarCtx.current = {
      title: m.mgr_page_title(),
      subnavbar: mgrSubnavbar,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });
</script>

{#snippet mgrSubnavbar()}
  <SectionScrollNav
    sections={SECTIONS}
    active={scroll.active}
    onscroll={(id: string) => scroll.scrollTo(id)}
    ariaLabel={m.mgr_page_title()}
  />
{/snippet}

<div class="manager-page">
  <div id="section-role" class="mgr-section">
    <List inset strong>
      <ListItem groupTitle>{m.mgr_section_role()}</ListItem>
      <ListItem title={m.mgr_role_reports()}>
        {#snippet media()}
          <ChartColumn size={18} aria-hidden="true" class="section-icon" />
        {/snippet}
      </ListItem>
      <ListItem title={m.mgr_role_queues()}>
        {#snippet media()}
          <Layers size={18} aria-hidden="true" class="section-icon" />
        {/snippet}
      </ListItem>
      <ListItem title={m.mgr_role_tickets()}>
        {#snippet media()}
          <ClipboardList size={18} aria-hidden="true" class="section-icon" />
        {/snippet}
      </ListItem>
    </List>
  </div>

  <div id="section-ops" class="mgr-section">
    <List inset strong>
      <ListItem groupTitle>{m.mgr_section_ops()}</ListItem>
      {#if queuesQuery.isPending}
        <ListItem title="..." />
      {:else if queuesQuery.data && queuesQuery.data.length > 0}
        <ListItem
          title={m.mgr_ops_total_tickets({ count: String(totalOpenTickets) })}
        >
          {#snippet media()}
            <ClipboardList size={18} aria-hidden="true" class="section-icon" />
          {/snippet}
        </ListItem>
        {#each queuesQuery.data as queue (queue.id)}
          {@const name = decryptQueueDisplayName(queue.id, queue.encryptedName)}
          <ListItem
            after={m.mgr_ops_queue_depth({
              count: queue.openCount,
            })}
          >
            {#snippet title()}
              {#if name}
                {name}
              {:else}
                <DecryptPlaceholder />
              {/if}
            {/snippet}
            {#snippet media()}
              <Layers size={18} aria-hidden="true" class="section-icon" />
            {/snippet}
          </ListItem>
        {/each}
      {:else}
        <ListItem title={m.mgr_ops_no_queues()} />
      {/if}
    </List>
  </div>

  <div id="section-queues" class="mgr-section">
    <List inset strong>
      <ListItem groupTitle>{m.mgr_section_queues()}</ListItem>
      {#if myQueuesQuery.isPending}
        <ListItem title="..." />
      {:else if myQueuesQuery.data && myQueuesQuery.data.length > 0}
        {#each myQueuesQuery.data as queue (queue.id)}
          {@const name = decryptQueueDisplayName(
            queue.id,
            queue.encrypted_name,
          )}
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

  <div id="section-protected" class="mgr-section">
    <List inset strong>
      <ListItem groupTitle>{m.mgr_section_protected()}</ListItem>
      <ListItem title={m.mgr_protected_summary()}>
        {#snippet media()}
          <ShieldUser size={18} aria-hidden="true" class="section-icon" />
        {/snippet}
      </ListItem>
    </List>
  </div>

  <Block class="mgr-footer">
    <SoftButton onclick={handleReports}>
      <ChartColumn size={16} aria-hidden="true" />
      {m.mgr_link_reports()}
    </SoftButton>
    <SoftButton onclick={handleSecurityStatus}>
      <Eye size={16} aria-hidden="true" />
      {m.mgr_link_security_status()}
    </SoftButton>
  </Block>
</div>

<style>
  .manager-page {
    padding: var(--space-sm) 0;
  }

  .manager-page :global(.section-icon) {
    color: var(--brand-accent);
  }

  .mgr-section {
    scroll-margin-top: 7rem;
  }

  .manager-page :global(.mgr-footer) {
    display: flex;
    gap: var(--space-sm);
  }
</style>
