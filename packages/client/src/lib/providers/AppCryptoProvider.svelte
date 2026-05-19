<!--
  AppCryptoProvider
  Owns decrypt caches and user identity for authenticated (app) routes.

  Lives inside (app)/+layout.svelte, below the slim CryptoProvider
  (which provides CryptoBridge + OrgKeyManager at the root). Reads
  those two contexts and builds the rest on top.

  Above AppShell in the component tree so that AppShell's own template
  children (subnavbar overrides, tabbar overrides) can access crypto
  contexts via their getter functions.
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { createQuery } from "@tanstack/svelte-query";
  import { authKeys } from "$lib/query/keys.js";
  import type { WorkerEventHandler } from "$lib/workers/crypto-bridge.js";
  import type { RewrapEvent } from "$lib/workers/crypto-protocol.js";
  import { OrgDecryptCache } from "$lib/crypto/org-decrypt-cache.js";
  import { TicketDecryptCache } from "$lib/crypto/ticket-decrypt-cache.js";
  import { FollowUpDecryptCache } from "$lib/crypto/follow-up-decrypt-cache.js";
  import { cacheRegistry } from "$lib/crypto/cache-registry.js";
  import { trpc } from "$lib/trpc/index.js";
  import { createPreviewLoader } from "$lib/tickets/preview-loader.svelte.js";
  import { requireRouter } from "$lib/errors.js";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { ticketKeys } from "$lib/query/keys.js";
  import { getCryptoBridge, getOrgKeyManager } from "$lib/crypto/context.js";
  import {
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
    const bridge = getCryptoBridge();
    const orgKeyManager = getOrgKeyManager();

    setOrgDecryptCache(new OrgDecryptCache(orgKeyManager, bridge));
    setTicketDecryptCache(new TicketDecryptCache(bridge));

    const followUpCache = new FollowUpDecryptCache(bridge);
    setFollowUpDecryptCache(followUpCache);

    const ticketRouter = requireRouter(trpc.tickets, "tickets");
    setPreviewLoader(
      createPreviewLoader({
        queryFn: async (ids) =>
          ticketRouter.recentFollowUps.query({ ticketIds: ids, perTicket: 3 }),
      }),
    );

    const MAX_CONCURRENT_REWRAPS = 3;
    let activeRewraps = 0;
    const rewrapQueue: RewrapEvent[] = [];

    const queryClient = useQueryClient();

    async function processRewrapEvent(event: RewrapEvent): Promise<void> {
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
      if (event.kind !== "rewrap") return;
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
