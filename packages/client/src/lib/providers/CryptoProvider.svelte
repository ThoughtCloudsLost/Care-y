<!--
  CryptoProvider: initializes all crypto singletons and user identity
  contexts for the entire app.

  Sits above AppShell in the component tree so that every component,
  including those rendered inside AppShell's own template (subnavbar
  overrides, tabbar overrides), can access crypto contexts via their
  getter functions.

  Previously this lived in (app)/+layout.svelte, which meant components
  rendered by AppShell (a sibling, not a child of that layout) could not
  find the context. Moving it above AppShell fixes that.

  All init is gated by `browser` because Web Workers and crypto APIs
  do not exist during SSR.
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { createQuery } from "@tanstack/svelte-query";
  import { authKeys } from "$lib/query/keys.js";
  import {
    CryptoBridge,
    type WorkerEventHandler,
  } from "$lib/workers/crypto-bridge.js";
  import type { WorkerEvent } from "$lib/workers/crypto-protocol.js";
  import { OrgKeyManager } from "$lib/crypto/org-key.js";
  import { OrgDecryptCache } from "$lib/crypto/org-decrypt-cache.js";
  import { TicketDecryptCache } from "$lib/crypto/ticket-decrypt-cache.js";
  import { FollowUpDecryptCache } from "$lib/crypto/follow-up-decrypt-cache.js";
  import { cacheRegistry } from "$lib/crypto/cache-registry.js";
  import { trpc } from "$lib/trpc/index.js";
  import { createPreviewLoader } from "$lib/tickets/preview-loader.svelte.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { ticketKeys } from "$lib/query/keys.js";
  import {
    setCryptoBridge,
    setOrgKeyManager,
    setOrgDecryptCache,
    setTicketDecryptCache,
    setFollowUpDecryptCache,
    setCurrentUserId,
    setCurrentUserRoleId,
    setCurrentPermissions,
    setPreviewLoader,
  } from "$lib/crypto/context-init.js";
  import type { Permission } from "@care-y/shared";
  import { rewrapBlobsForFollowUp } from "$lib/crypto/rewrap-blobs.js";

  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  if (browser) {
    const bridge = new CryptoBridge();
    setCryptoBridge(bridge);

    const orgKeyManager = new OrgKeyManager();
    setOrgKeyManager(orgKeyManager);

    setOrgDecryptCache(new OrgDecryptCache(orgKeyManager));
    setTicketDecryptCache(new TicketDecryptCache(bridge));

    const followUpCache = new FollowUpDecryptCache(bridge);
    setFollowUpDecryptCache(followUpCache);

    if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
    const ticketRouter = trpc.tickets;
    setPreviewLoader(
      createPreviewLoader({
        queryFn: async (ids) =>
          ticketRouter.recentFollowUps.query({ ticketIds: ids, perTicket: 3 }),
      }),
    );

    // Wire Worker-initiated re-wrap events to tRPC mutation with
    // bounded concurrency. Each event triggers a tRPC mutation + optional
    // blob downloads, so unbounded parallelism would overwhelm the server.
    const MAX_CONCURRENT_REWRAPS = 3;
    let activeRewraps = 0;
    const rewrapQueue: WorkerEvent[] = [];

    const queryClient = useQueryClient();

    async function processRewrapEvent(event: WorkerEvent): Promise<void> {
      let success = false;
      try {
        const blobUpdates = await rewrapBlobsForFollowUp(
          event.ticketId,
          event.followUpId,
          bridge,
          ticketRouter,
          queryClient,
        );

        await ticketRouter.rewrapFollowUp.mutate({
          followUpId: event.followUpId,
          encryptedContent: event.encryptedContent,
          blobUpdates: blobUpdates.length > 0 ? blobUpdates : undefined,
        });
        success = true;
        void queryClient.invalidateQueries({
          queryKey: ticketKeys.followUps(event.ticketId),
        });
      } catch (err: unknown) {
        if (import.meta.env.DEV) {
          console.warn("[rewrap] failed for", event.followUpId, err);
        }
      } finally {
        bridge.postEvent({
          kind: "rewrap-result",
          followUpId: event.followUpId,
          success,
        });
        activeRewraps--;
        drainRewrapQueue();
      }
    }

    function drainRewrapQueue(): void {
      while (rewrapQueue.length > 0 && activeRewraps < MAX_CONCURRENT_REWRAPS) {
        const next = rewrapQueue.shift();
        if (!next) break;
        activeRewraps++;
        void processRewrapEvent(next);
      }
    }

    const rewrapHandler: WorkerEventHandler = (event) => {
      rewrapQueue.push(event);
      drainRewrapQueue();
    };
    bridge.onWorkerEvent(rewrapHandler);

    if (import.meta.env.DEV) {
      const expected = [
        "TicketDecryptCache",
        "FollowUpDecryptCache",
        "OrgDecryptCache",
        "PreviewLoader:raw",
        "PreviewLoader:state",
      ];
      const registered = cacheRegistry.registered;
      const missing = expected.filter((n) => !registered.includes(n));
      if (missing.length > 0) {
        console.error(
          `[CacheRegistry] missing registrations: ${missing.join(", ")}`,
        );
      }
    }
  }

  // Current user identity, shared to all authenticated pages via context.
  const meQuery = createQuery(() => ({
    queryKey: authKeys.me(),
    queryFn: async () => trpc.auth.me.query(),
    staleTime: Infinity,
  }));
  const currentUserId = $derived(meQuery.data?.user.id);
  setCurrentUserId(() => currentUserId);
  const currentUserRoleId = $derived(meQuery.data?.user.roleId);
  setCurrentUserRoleId(() => currentUserRoleId);
  const EMPTY_PERMISSIONS: ReadonlySet<Permission> = new Set();
  const currentPermissions = $derived(
    meQuery.data?.permissions
      ? new Set(meQuery.data.permissions)
      : EMPTY_PERMISSIONS,
  );
  setCurrentPermissions(() => currentPermissions);
</script>

{@render children()}
