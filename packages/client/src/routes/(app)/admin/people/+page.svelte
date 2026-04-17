<script lang="ts">
  import { Segmented, SegmentedButton } from "konsta/svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Permission } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import { getCurrentPermissions } from "$lib/crypto/context.js";
  import UsersSection from "$lib/components/admin/UsersSection.svelte";
  import QueuesSection from "$lib/components/admin/QueuesSection.svelte";

  type PeopleTab = "users" | "queues";

  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());

  const canManageUsers = $derived(permissions.has(Permission.MANAGE_USERS));
  const canManageQueues = $derived(permissions.has(Permission.MANAGE_QUEUES));
  const hasAccess = $derived(canManageUsers || canManageQueues);

  $effect(() => {
    if (!hasAccess) void goto(resolve("/"));
  });

  function isPeopleTab(value: string): value is PeopleTab {
    return value === "users" || value === "queues";
  }

  const urlTab = $derived.by(() => {
    const raw = page.url.searchParams.get("tab");
    return raw !== null && isPeopleTab(raw) ? raw : null;
  });

  const urlAction = $derived(page.url.searchParams.get("action"));

  function defaultTab(): PeopleTab {
    if (permissions.has(Permission.MANAGE_USERS)) return "users";
    return "queues";
  }

  let activeTab = $state<PeopleTab>(urlTab ?? defaultTab());

  $effect(() => {
    if (urlTab !== null) activeTab = urlTab;
  });

  const navbarCtx = getNavbarOverrideCtx();
  $effect(() => {
    navbarCtx.current = { title: m.admin_people_title() };
    return () => {
      navbarCtx.current = undefined;
    };
  });
</script>

<div class="flex flex-col gap-[--space-md] px-[--space-md] pt-[--space-md]">
  <div role="tablist" aria-label={m.admin_people_title()}>
    <Segmented strong>
      {#if canManageUsers}
        <SegmentedButton
          active={activeTab === "users"}
          onclick={() => (activeTab = "users")}
          aria-selected={activeTab === "users"}
          aria-controls="panel-users"
          id="tab-users"
        >
          {m.admin_tab_users()}
        </SegmentedButton>
      {/if}
      {#if canManageQueues}
        <SegmentedButton
          active={activeTab === "queues"}
          onclick={() => (activeTab = "queues")}
          aria-selected={activeTab === "queues"}
          aria-controls="panel-queues"
          id="tab-queues"
        >
          {m.admin_tab_queues()}
        </SegmentedButton>
      {/if}
    </Segmented>
  </div>

  {#if activeTab === "users" && canManageUsers}
    <div role="tabpanel" id="panel-users" aria-labelledby="tab-users">
      <UsersSection autoAction={urlAction} />
    </div>
  {:else if activeTab === "queues" && canManageQueues}
    <div role="tabpanel" id="panel-queues" aria-labelledby="tab-queues">
      <QueuesSection autoAction={urlAction} />
    </div>
  {/if}
</div>
