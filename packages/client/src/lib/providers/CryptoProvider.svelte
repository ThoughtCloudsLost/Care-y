<!--
  CryptoProvider (slim, root-level): initializes only the Worker bridge
  and OrgKeyManager contexts. These are needed by ALL routes, including
  (auth) login (which runs Argon2id + OPRF in the Worker) and
  (onboarding) setup (which generates org keypairs).

  Decrypt caches, identity query, PreviewLoader, and rewrap handler
  live in AppCryptoProvider, which is mounted only inside (app) routes.

  All init is gated by `browser` because Web Workers and crypto APIs
  do not exist during SSR.
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { getSodium } from "@care-y/crypto";
  import { CryptoBridge } from "$lib/workers/crypto-bridge.js";
  import { OrgKeyManager } from "$lib/crypto/org-key.js";
  import {
    setCryptoBridge,
    setOrgKeyManager,
  } from "$lib/crypto/context-init.js";

  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  if (browser) {
    void getSodium();

    const bridge = new CryptoBridge();
    setCryptoBridge(bridge);

    const orgKeyManager = new OrgKeyManager(bridge);
    setOrgKeyManager(orgKeyManager);

    // SharedWorker reconnection: if the bridge connected to an already-keyed
    // Worker (refresh scenario), restore the org public key locally.
    const reconnect = bridge.getReconnectData();
    if (bridge.isReconnected() && reconnect.orgPublicKey != null) {
      orgKeyManager.load(reconnect.orgPublicKey);
    }
  }
</script>

{@render children()}
