<!--
  Client-facing route group layout.

  A thin mount of ClientShell, matching how the (app) layout mounts
  AppShell. No route file composes chrome on either side of the product,
  which is the boundary a later swap to native navigation depends on:
  replacing two shell components rather than hunting chrome out of route
  code on one side and a shell on the other.
-->
<script lang="ts">
  import { TERMINOLOGY_DEFAULTS_EN } from "@care-y/shared";
  import ClientShell from "$lib/shell/ClientShell.svelte";
  import PortalBridgeProvider from "$lib/providers/PortalBridgeProvider.svelte";
  import { setTerminology } from "$lib/terminology/context.js";

  let { children } = $props();

  // Client pages never hold the org key, so org-customized terminology is
  // unreachable here; the shared components they mount (filter pills via
  // SubNavbarFilterLayout) still read the context. Same fallback the
  // (auth) group uses.
  setTerminology(() => TERMINOLOGY_DEFAULTS_EN);
</script>

<PortalBridgeProvider>
  <ClientShell>
    {@render children()}
  </ClientShell>
</PortalBridgeProvider>
