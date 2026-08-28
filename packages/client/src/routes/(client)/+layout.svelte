<!--
  Client-facing route group layout.

  A thin mount of ClientShell, matching how the (app) layout mounts
  AppShell. No route file composes chrome on either side of the product,
  which is the boundary a later swap to native navigation depends on:
  replacing two shell components rather than hunting chrome out of route
  code on one side and a shell on the other.
-->
<script lang="ts">
  import ClientShell from "$lib/shell/ClientShell.svelte";

  let { children } = $props();
</script>

<ClientShell>
  {@render children()}
</ClientShell>
