<script lang="ts">
  import UserCard from "$lib/components/admin/UserCard.svelte";
  import type { VolunteerSearchData } from "$lib/search/providers/volunteers.js";

  let {
    result,
    ontap,
  }: { result: VolunteerSearchData; ontap: (id: string) => void } = $props();
</script>

<div class="search-card-wrapper">
  <UserCard
    viewMode="grid"
    userId={result.userId}
    displayName={result.displayName}
    roleId={result.roleId}
    isActive={result.isActive}
    hasKeys={result.hasKeys}
    hasOrgKeyWrap={result.hasOrgKeyWrap}
    isSelf={result.isSelf}
    selected={false}
    multiSelectActive={false}
    searchTerm={result.searchTerm}
    onedit={() => ontap(result.userId)}
  />
</div>

<style>
  .search-card-wrapper {
    width: 170px;
    flex-shrink: 0;
    scroll-snap-align: start;
  }
</style>
