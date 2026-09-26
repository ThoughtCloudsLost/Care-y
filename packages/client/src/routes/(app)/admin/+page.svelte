<script lang="ts">
  import { List, ListItem } from "konsta/svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { createQuery } from "@tanstack/svelte-query";
  import { adminKeys } from "$lib/query/keys.js";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import {
    getNavbarOverrideCtx,
    getSectionRailCtx,
  } from "$lib/shell/context.js";
  import { getCurrentPermissions } from "$lib/crypto/context.js";
  import { canCall } from "$lib/auth/procedure-gates.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { createSectionScroll } from "$lib/components/useSectionScroll.svelte.js";
  import SectionScrollNav from "$lib/components/SectionScrollNav.svelte";
  import {
    type AdminDestination,
    GROUP_ORDER,
    getVisibleDestinations,
    groupDestinations,
    groupLabel,
    buildAdminHubSections,
  } from "$lib/admin/destinations.js";

  const authRouter = trpc.auth;
  const telephonyAdmin = requireRouter(trpc.telephonyAdmin, "telephonyAdmin");

  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());

  const visible = $derived(getVisibleDestinations(permissions));

  $effect(() => {
    if (visible.length === 0) void goto(resolve("/"));
  });

  const grouped = $derived(groupDestinations(visible));

  const visibleGroups = $derived(GROUP_ORDER.filter((g) => grouped.has(g)));

  const scrollSections = $derived(buildAdminHubSections(permissions));

  const scroll = createSectionScroll(() => scrollSections);

  // One query per hub row, each enabled only for an account that may call
  // it. A row whose query has no data (not permitted, loading or failed)
  // shows no badge rather than a figure it cannot vouch for.

  const activeUserCountQuery = createQuery(() => ({
    queryKey: adminKeys.hubActiveUserCount(),
    queryFn: async () => authRouter.hubActiveUserCount.query(),
    enabled: canCall(permissions, "auth.hubActiveUserCount"),
    staleTime: 60_000,
  }));

  const queueCountQuery = createQuery(() => ({
    queryKey: adminKeys.hubQueueCount(),
    queryFn: async () => authRouter.hubQueueCount.query(),
    enabled: canCall(permissions, "auth.hubQueueCount"),
    staleTime: 60_000,
  }));

  const keyStatusQuery = createQuery(() => ({
    queryKey: adminKeys.hubKeyStatus(),
    queryFn: async () => authRouter.hubKeyStatus.query(),
    enabled: canCall(permissions, "auth.hubKeyStatus"),
    staleTime: 60_000,
  }));

  const retentionQuery = createQuery(() => ({
    queryKey: adminKeys.hubRetention(),
    queryFn: async () => authRouter.hubRetention.query(),
    enabled: canCall(permissions, "auth.hubRetention"),
    staleTime: 60_000,
  }));

  const blocklistCountQuery = createQuery(() => ({
    queryKey: adminKeys.hubBlocklistCount(),
    queryFn: async () => authRouter.hubBlocklistCount.query(),
    enabled: canCall(permissions, "auth.hubBlocklistCount"),
    staleTime: 60_000,
  }));

  const greetingCountQuery = createQuery(() => ({
    queryKey: adminKeys.hubGreetingCount(),
    queryFn: async () => authRouter.hubGreetingCount.query(),
    enabled: canCall(permissions, "auth.hubGreetingCount"),
    staleTime: 60_000,
  }));

  const templateCountQuery = createQuery(() => ({
    queryKey: adminKeys.hubTemplateCount(),
    queryFn: async () => authRouter.hubTemplateCount.query(),
    enabled: canCall(permissions, "auth.hubTemplateCount"),
    staleTime: 60_000,
  }));

  const provisionedPhonesQuery = createQuery(() => ({
    queryKey: adminKeys.telephonyPhones(),
    queryFn: async () => telephonyAdmin.getProvisionedPhones.query(),
    enabled: canCall(permissions, "telephonyAdmin.getProvisionedPhones"),
    staleTime: 60_000,
  }));

  function getBadge(destId: string): string | null {
    switch (destId) {
      case "users": {
        const data = activeUserCountQuery.data;
        if (!data) return null;
        return m.admin_hub_badge_active({ count: String(data.count) });
      }
      case "queues": {
        const data = queueCountQuery.data;
        if (!data) return null;
        return m.admin_hub_badge_queues(
          withTerms({ count: String(data.count) }),
        );
      }
      case "keys": {
        const data = keyStatusQuery.data;
        if (!data) return null;
        return data.status === "ok"
          ? m.admin_hub_badge_keys_ok()
          : m.admin_hub_badge_keys_missing();
      }
      case "retention": {
        const data = retentionQuery.data;
        if (!data) return null;
        return data.retentionDays !== null && data.retentionDays !== 0
          ? m.admin_hub_badge_retention_days({
              count: String(data.retentionDays),
            })
          : m.admin_hub_badge_retention_disabled();
      }
      case "telephony": {
        const phones = provisionedPhonesQuery.data;
        if (!phones) return null;
        return phones.length > 0
          ? m.admin_hub_badge_phones({ count: String(phones.length) })
          : m.admin_hub_badge_no_phones();
      }
      case "blocklist": {
        const data = blocklistCountQuery.data;
        if (!data) return null;
        return m.admin_hub_badge_blocked({ count: String(data.count) });
      }
      case "greetings": {
        const data = greetingCountQuery.data;
        if (!data) return null;
        return m.admin_hub_badge_greetings({ count: String(data.count) });
      }
      case "sms-templates": {
        const data = templateCountQuery.data;
        if (!data) return null;
        return m.admin_hub_badge_templates({ count: String(data.count) });
      }
      default:
        return null;
    }
  }

  function badgeVariant(destId: string): "default" | "ok" | "warning" | null {
    switch (destId) {
      case "users":
        return activeUserCountQuery.data ? "default" : null;
      case "queues":
        return queueCountQuery.data ? "default" : null;
      case "keys": {
        const data = keyStatusQuery.data;
        if (!data) return null;
        return data.status === "ok" ? "ok" : "warning";
      }
      case "retention":
        return retentionQuery.data ? "default" : null;
      case "telephony": {
        const phones = provisionedPhonesQuery.data;
        if (!phones) return null;
        return phones.length > 0 ? "ok" : "warning";
      }
      case "blocklist":
        return blocklistCountQuery.data ? "default" : null;
      case "greetings": {
        const data = greetingCountQuery.data;
        if (!data) return null;
        return data.count > 0 ? "default" : "warning";
      }
      case "sms-templates": {
        const data = templateCountQuery.data;
        if (!data) return null;
        return data.count > 0 ? "default" : "warning";
      }
      default:
        return null;
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
  const sectionRailCtx = getSectionRailCtx();

  $effect(() => {
    navbarCtx.current = {
      title: m.admin_hub_title(),
      subnavbar: hubSubnavbar,
    };
    sectionRailCtx.current = {
      sections: scrollSections,
      active: scroll.active,
      scrollTo: (id: string) => scroll.scrollTo(id),
    };
    return () => {
      navbarCtx.current = undefined;
      sectionRailCtx.current = undefined;
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
                  class:hub-badge-ok={variant === "ok"}
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

  /* A healthy state is the normal state: firmer ink, never a success
     hue. Problems alone carry color (with their word). */
  .hub-badge-ok {
    color: var(--ink-2);
  }

  .hub-badge-warning {
    color: var(--care);
  }
</style>
