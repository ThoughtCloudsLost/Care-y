/**
 * Dashboard-triggered merge candidate detection composable.
 *
 * Orchestrates the Worker-side merge scan after dashboard queries settle.
 * The scan runs at low priority (requestIdleCallback / setTimeout
 * fallback), caches the result for the session, and re-runs only on
 * explicit invalidation (a merge or dismissal).
 *
 * The composable never touches plaintext contact values. It assembles
 * the encrypted blobs and key wraps from server query data, sends them
 * to the Worker, and receives back only candidate pairs (client ids +
 * match kind).
 */

import {
  createQuery,
  createMutation,
  useQueryClient,
} from "@tanstack/svelte-query";
import { SvelteMap, SvelteSet } from "svelte/reactivity";
import { clientKeys } from "$lib/query/keys.js";
import { trpc } from "$lib/trpc/index.js";
import { getCryptoBridge } from "$lib/crypto/context.js";
import { requireRouter } from "$lib/errors.js";
import type {
  MergeCandidate,
  MergeScanClient,
  MergeScanIntakeResponse,
} from "$lib/workers/crypto-protocol.js";

/** Per-ticket row from the dashboard's ticket list query. */
export interface TicketRef {
  readonly id: string;
  readonly clientId: string;
  readonly keyWrap: {
    readonly ephemeralPoint: string;
    readonly nonce: string;
    readonly wrappedKey: string;
  } | null;
  readonly intakeWrap: string | null;
}

export interface MergeScanDeps {
  /** Whether the dashboard's ticket query has loaded. */
  readonly dashboardReady: boolean;
  /** All tickets from the dashboard query. */
  readonly tickets: readonly TicketRef[];
  /** Whether the session holds VIEW_CLIENTS permission. */
  readonly canViewClients: boolean;
}

export interface MergeScanResult {
  readonly candidates: readonly MergeCandidate[];
  readonly truncated: boolean;
  readonly isLoading: boolean;
  readonly dismissedKeys: ReadonlySet<string>;
  readonly undismissed: readonly MergeCandidate[];
  readonly dismiss: (clientIdA: string, clientIdB: string) => void;
  readonly markSharedLine: (matchHash: string) => void;
  readonly invalidate: () => void;
}

/**
 * Computes a stable pair key from two client ids. Sorted so (A,B)==(B,A).
 */
export function pairKey(clientIdA: string, clientIdB: string): string {
  return clientIdA < clientIdB
    ? `${clientIdA}:${clientIdB}`
    : `${clientIdB}:${clientIdA}`;
}

/**
 * Creates the merge scan composable. Call from the dashboard route file.
 */
export function createMergeScan(getDeps: () => MergeScanDeps): MergeScanResult {
  const bridge = getCryptoBridge();
  const queryClient = useQueryClient();

  // Fetch merge scan data from server (intake responses + field roles + phone hashes).
  // Gated on VIEW_CLIENTS: the server returns FORBIDDEN without it.
  const mergeScanDataQuery = createQuery(() => {
    const deps = getDeps();
    return {
      queryKey: [...clientKeys.mergeCandidates(), "serverData"] as const,
      queryFn: async () => {
        const clientsRouter = requireRouter(trpc.clients, "clients");
        return clientsRouter.mergeScanData.query();
      },
      enabled: deps.dashboardReady && deps.canViewClients,
      staleTime: Infinity,
      gcTime: Infinity,
    };
  });

  // Extract shared phone hashes from server data
  const sharedPhoneHashes = $derived.by((): readonly string[] => {
    const serverData = mergeScanDataQuery.data;
    if (!serverData) return [];
    return serverData.sharedPhoneHashes;
  });

  // Build MergeScanClient[] from server data + dashboard ticket refs.
  // phoneHashes from the server replace the old plaintext clientPhones map.
  const scanClients = $derived.by((): readonly MergeScanClient[] => {
    const deps = getDeps();
    const serverData = mergeScanDataQuery.data;
    if (!serverData) return [];

    // Build field role maps keyed by formId.
    // The server returns fieldKey (client-minted, stable across saves) so the
    // Worker can match roles against response blob answer keys.
    const formRoles = new SvelteMap<string, SvelteMap<string, string>>();
    for (const fr of serverData.fieldRoles) {
      let roleMap = formRoles.get(fr.formId);
      if (roleMap == null) {
        roleMap = new SvelteMap();
        formRoles.set(fr.formId, roleMap);
      }
      roleMap.set(fr.fieldKey, fr.role);
    }

    // Build ticket key wrap map from dashboard tickets
    const ticketKeyWraps = new SvelteMap<
      string,
      {
        ephemeralPoint: string;
        nonce: string;
        wrappedKey: string;
        intakeWrap: string | null;
      }
    >();
    for (const t of deps.tickets) {
      if (t.keyWrap) {
        ticketKeyWraps.set(t.id, { ...t.keyWrap, intakeWrap: t.intakeWrap });
      } else if (t.intakeWrap != null) {
        ticketKeyWraps.set(t.id, {
          ephemeralPoint: "",
          nonce: "",
          wrappedKey: "",
          intakeWrap: t.intakeWrap,
        });
      }
    }

    // Index phone hashes from server payload
    const phoneHashMap = new SvelteMap<string, string>();
    for (const ph of serverData.phoneHashes) {
      phoneHashMap.set(ph.clientId, ph.phoneMatchHash);
    }

    // Index email hashes from server payload
    const emailHashMap = new SvelteMap<string, string>();
    for (const eh of serverData.emailHashes) {
      emailHashMap.set(eh.clientId, eh.emailMatchHash);
    }

    // Merge server intake data with dashboard key wraps
    const clients: MergeScanClient[] = [];
    const clientIdSet = new SvelteSet<string>();

    for (const sc of serverData.clients) {
      const intakeResponses: MergeScanIntakeResponse[] = [];

      for (const resp of sc.responses) {
        const kw = ticketKeyWraps.get(resp.ticketId);
        if (!kw) continue; // No key wrap available for this ticket

        const roleMap =
          formRoles.get(resp.formId) ?? new SvelteMap<string, string>();

        intakeResponses.push({
          ticketId: resp.ticketId,
          ephemeralPoint: kw.ephemeralPoint,
          nonce: kw.nonce,
          wrappedKey: kw.wrappedKey,
          intakeWrap: kw.intakeWrap,
          encryptedResponse: resp.encryptedResponse,
          fieldRoles: roleMap,
        });
      }

      const phoneHash = phoneHashMap.get(sc.clientId) ?? null;
      const emailHash = emailHashMap.get(sc.clientId) ?? null;

      if (
        intakeResponses.length > 0 ||
        phoneHash != null ||
        emailHash != null
      ) {
        clients.push({
          clientId: sc.clientId,
          phoneMatchHash: phoneHash,
          emailMatchHash: emailHash,
          intakeResponses,
        });
        clientIdSet.add(sc.clientId);
      }
    }

    // Include hash-only clients (have a stored phone or email match hash
    // but no intake responses in the server data). These are telephony-only
    // or email-only clients whose hash was backfilled by an authorized session.
    const allHashClientIds = new SvelteSet([
      ...phoneHashMap.keys(),
      ...emailHashMap.keys(),
    ]);
    for (const clientId of allHashClientIds) {
      if (!clientIdSet.has(clientId)) {
        clients.push({
          clientId,
          phoneMatchHash: phoneHashMap.get(clientId) ?? null,
          emailMatchHash: emailHashMap.get(clientId) ?? null,
          intakeResponses: [],
        });
      }
    }

    return clients;
  });

  // Run Worker detection (session-cached via TanStack)
  const candidatesQuery = createQuery(() => {
    const clients = scanClients;
    const suppressed = sharedPhoneHashes;
    return {
      queryKey: clientKeys.mergeCandidates(),
      queryFn: async (): Promise<{
        readonly candidates: readonly MergeCandidate[];
        readonly truncated: boolean;
      }> => {
        // Schedule at low priority to avoid blocking dashboard render
        await new Promise<void>((resolve) => {
          if (typeof requestIdleCallback === "function") {
            requestIdleCallback(() => resolve());
          } else {
            setTimeout(resolve, 200);
          }
        });
        return bridge.detectMergeCandidates(clients, suppressed);
      },
      enabled: clients.length > 0,
      staleTime: Infinity,
      gcTime: Infinity,
    };
  });

  // Fetch dismissals from the server (org-key-sealed blob, session-cached)
  const dismissalsQuery = createQuery(() => ({
    queryKey: clientKeys.dismissals(),
    queryFn: async (): Promise<ReadonlySet<string>> => {
      if (!trpc.clients) return new SvelteSet<string>();
      const result = await trpc.clients.getDismissals.query();
      if (!result) return new SvelteSet<string>();

      // Decrypt the blob with org key (org-tier, main thread is fine)
      const plaintext = await bridge.orgDecrypt(result.encryptedDismissals);
      const decoded = new TextDecoder().decode(
        Uint8Array.from(atob(plaintext), (c) => c.charCodeAt(0)),
      );
      try {
        const parsed: unknown = JSON.parse(decoded);
        const keys = Array.isArray(parsed)
          ? parsed.filter((k): k is string => typeof k === "string")
          : [];
        return new SvelteSet(keys);
      } catch {
        return new SvelteSet<string>();
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
  }));

  const candidates = $derived(candidatesQuery.data?.candidates ?? []);
  const truncated = $derived(candidatesQuery.data?.truncated ?? false);
  const dismissedKeys = $derived(
    dismissalsQuery.data ?? new SvelteSet<string>(),
  );

  const undismissed = $derived(
    candidates.filter(
      (c) => !dismissedKeys.has(pairKey(c.clientIdA, c.clientIdB)),
    ),
  );

  // Mutation: add a pair key to the dismissal blob and write back
  const dismissMutation = createMutation(() => ({
    mutationFn: async (newKey: string): Promise<void> => {
      if (!trpc.clients) return;

      // Read current dismissals, add key, write back (read-merge-write)
      const currentKeys = Array.from(dismissedKeys);
      if (currentKeys.includes(newKey)) return;
      currentKeys.push(newKey);

      // Serialize, encode to base64, encrypt with org key
      const json = JSON.stringify(currentKeys);
      const bytes = new TextEncoder().encode(json);
      const b64Payload = btoa(String.fromCharCode(...bytes));
      const encrypted = await bridge.orgEncrypt(b64Payload);
      await trpc.clients.putDismissals.mutate({
        encryptedDismissals: encrypted,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clientKeys.dismissals(),
      });
    },
  }));

  // Mutation: mark a phone match hash as a shared line on the server
  const markSharedLineMutation = createMutation(() => ({
    mutationFn: async (matchHash: string): Promise<{ updated: number }> => {
      return requireRouter(trpc.clients, "clients").setPhoneSharedLine.mutate({
        matchHash,
        shared: true,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clientKeys.mergeCandidates(),
      });
    },
  }));

  function dismiss(clientIdA: string, clientIdB: string): void {
    const key = pairKey(clientIdA, clientIdB);
    dismissMutation.mutate(key);
  }

  function markSharedLine(matchHash: string): void {
    markSharedLineMutation.mutate(matchHash);
  }

  function invalidate(): void {
    void queryClient.invalidateQueries({
      queryKey: clientKeys.mergeCandidates(),
    });
    void queryClient.invalidateQueries({
      queryKey: clientKeys.dismissals(),
    });
  }

  return {
    get candidates(): readonly MergeCandidate[] {
      return candidates;
    },
    get truncated(): boolean {
      return truncated;
    },
    get isLoading(): boolean {
      return (
        candidatesQuery.isLoading ||
        dismissalsQuery.isLoading ||
        mergeScanDataQuery.isLoading
      );
    },
    get dismissedKeys(): ReadonlySet<string> {
      return dismissedKeys;
    },
    get undismissed(): readonly MergeCandidate[] {
      return undismissed;
    },
    dismiss,
    markSharedLine,
    invalidate,
  };
}
