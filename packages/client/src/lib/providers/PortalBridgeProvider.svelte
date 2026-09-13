<!--
  PortalBridgeProvider: publishes a PortalBridge factory through
  Svelte context. Client-facing pages use the factory to construct
  short-lived or session-scoped bridges rather than importing the
  PortalBridge constructor directly.

  Mirrors CryptoProvider's single-registrant pattern. The factory is
  the injection seam: tests and the demo system substitute it through
  the context setter without touching product code.

  Mounts in the (client) layout alongside ClientShell.
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { PortalBridge } from "$lib/workers/portal-bridge.js";
  import { setPortalBridgeFactory } from "$lib/portal/context-init.js";

  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  if (browser) {
    // PortalBridgeProvider is the single registrant.
    setPortalBridgeFactory(() => new PortalBridge());
  }
</script>

{@render children()}
