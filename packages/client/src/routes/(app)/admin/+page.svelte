<script lang="ts">
  import { List, ListItem } from "konsta/svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Permission } from "@care-y/shared";
  import { UsersRound, RadioTower, Building2 } from "@lucide/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import { getCurrentPermissions } from "$lib/crypto/context.js";
  import { trpc } from "$lib/trpc/index.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import {
    createSectionScroll,
    type ScrollSection,
  } from "$lib/components/useSectionScroll.svelte.js";
  import SectionScrollNav from "$lib/components/SectionScrollNav.svelte";
  import {
    type AdminDestination,
    type AdminGroup,
    GROUP_ORDER,
    getVisibleDestinations,
    groupDestinations,
  } from "$lib/admin/destinations.js";

  function groupIcon(group: AdminGroup): typeof UsersRound {
    switch (group) {
      case "people":
        return UsersRound;
      case "communications":
        return RadioTower;
      case "organization":
        return Building2;
    }
  }

  const authRouter = trpc.auth;

  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());

  const hasAdminAccess = $derived(
    permissions.has(Permission.MANAGE_USERS) ||
      permissions.has(Permission.MANAGE_KEYS) ||
      permissions.has(Permission.MANAGE_ORG_CONFIG),
  );

  $effect(() => {
    if (!hasAdminAccess) void goto(resolve("/"));
  });

  const visible = $derived(getVisibleDestinations(permissions));
  const grouped = $derived(groupDestinations(visible));

  const visibleGroups = $derived(GROUP_ORDER.filter((g) => grouped.has(g)));

  const scrollSections: readonly ScrollSection[] = $derived(
    visibleGroups.map((g) => ({
      id: g,
      label: () => groupLabel(g),
      icon: groupIcon(g),
    })),
  );

  const scroll = createSectionScroll(() => scrollSections);

  const hubStatusQuery = createQuery(() => ({
    queryKey: ["admin", "hubStatus"],
    queryFn: async () => authRouter.hubStatus.query(),
    staleTime: 60_000,
  }));

  function getBadge(destId: string): string | null {
    const data = hubStatusQuery.data;
    if (!data) return null;
    switch (destId) {
      case "users":
        return m.admin_hub_badge_active({
          count: String(data.activeUserCount),
        });
      case "queues":
        return m.admin_hub_badge_queues({ count: String(data.queueCount) });
      case "keys":
        return data.keyStatus === "ok"
          ? m.admin_hub_badge_keys_ok()
          : m.admin_hub_badge_keys_missing();
      case "retention":
        return data.retentionDays !== null && data.retentionDays !== 0
          ? m.admin_hub_badge_retention_days({
              count: String(data.retentionDays),
            })
          : m.admin_hub_badge_retention_disabled();
      default:
        return null;
    }
  }

  function badgeVariant(
    destId: string,
  ): "default" | "success" | "warning" | null {
    const data = hubStatusQuery.data;
    if (!data) return null;
    if (destId === "keys") {
      return data.keyStatus === "ok" ? "success" : "warning";
    }
    return "default";
  }

  function groupLabel(group: AdminGroup): string {
    switch (group) {
      case "people":
        return m.panel_group_people();
      case "communications":
        return m.panel_group_communications();
      case "organization":
        return m.panel_group_organization();
    }
  }

  function handleDestinationTap(dest: AdminDestination): void {
    if (dest.implemented) {
      // eslint-disable-next-line svelte/no-navigation-without-resolve -- dest.path is a known admin route from destinations.ts
      void goto(dest.path);
    } else {
      toastStore.show(m.admin_coming_soon());
    }
  }

  const navbarCtx = getNavbarOverrideCtx();

  $effect(() => {
    navbarCtx.current = {
      title: m.admin_hub_title(),
      subnavbar: hubSubnavbar,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });
</script>

{#snippet hubSubnavbar()}
  <SectionScrollNav
    sections={scrollSections}
    active={scroll.active}
    onscroll={(id: string) => scroll.scrollTo(id)}
    ariaLabel={m.admin_hub_title()}
  />
{/snippet}

<div class="admin-hub">
  {#each visibleGroups as group (group)}
    <div id="section-{group}" class="hub-group">
      <List inset strong>
        <ListItem groupTitle>{groupLabel(group)}</ListItem>
        {#each grouped.get(group) ?? [] as dest (dest.id)}
          {@const badge = getBadge(dest.id)}
          {@const variant = badgeVariant(dest.id)}
          <ListItem
            title={dest.label()}
            subtitle={dest.subtitle()}
            chevronIos
            chevronMaterial
            onclick={() => handleDestinationTap(dest)}
          >
            {#snippet media()}
              <span
                class="dest-icon"
                class:dest-icon-disabled={!dest.implemented}
              >
                <dest.icon size={20} aria-hidden="true" />
              </span>
            {/snippet}
            {#snippet after()}
              {#if badge}
                <span
                  class="hub-badge"
                  class:hub-badge-success={variant === "success"}
                  class:hub-badge-warning={variant === "warning"}
                >
                  {badge}
                </span>
              {/if}
            {/snippet}
          </ListItem>
        {/each}
      </List>
    </div>
  {/each}
</div>

<style>
  .admin-hub {
    padding: var(--space-sm) 0;
  }

  .hub-group {
    scroll-margin-top: 7rem;
  }

  .dest-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    color: var(--brand-accent);
  }

  .dest-icon-disabled {
    opacity: 0.4;
  }

  .hub-badge {
    font-size: var(--text-xs);
    color: var(--muted);
    white-space: nowrap;
  }

  .hub-badge-success {
    color: var(--color-green-500);
  }

  .hub-badge-warning {
    color: var(--color-amber-500);
  }
</style>
