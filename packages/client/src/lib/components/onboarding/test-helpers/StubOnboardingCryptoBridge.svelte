<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    adminUserId: _adminUserId,
    children,
  }: { adminUserId: string; children: Snippet } = $props();
</script>

{@render children()}
