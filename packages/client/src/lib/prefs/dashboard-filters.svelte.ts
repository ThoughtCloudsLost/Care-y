/**
 * The dashboard's section filters: one user filter per ticket lane plus
 * the activity, KB and merge section filters.
 *
 * Filter state shows what a volunteer works on, so it is held in memory
 * and mirrored to the server only as a self-blob envelope on
 * user_pref_blobs (kind dashboard_filters), sealed to the user's own
 * vol_public. It is never written to URLs or localStorage.
 *
 * The sealed payload carries its own `type`; a payload of any other kind,
 * an unknown version, or an unopenable envelope (password change rotated
 * the vol keys) loads empty filters, and the next save overwrites it.
 * Two devices saving at once: the later save wins.
 */

import { untrack } from "svelte";
import {
  dashboardFiltersDocumentSchema,
  type DashboardActivityFilter,
  type DashboardFiltersDocument,
  type DashboardKbFilter,
  type DashboardLaneId,
  type DashboardMergeFilter,
  type LaneFilterState,
} from "@care-y/shared";
import {
  createSyncedSelfBlob,
  type SelfBlobSaveStatus,
  type SelfBlobTransport,
} from "./synced-self-blob.svelte.js";

export interface DashboardFilters {
  readonly lanes: Readonly<Record<DashboardLaneId, LaneFilterState>>;
  readonly activity: DashboardActivityFilter;
  readonly kb: DashboardKbFilter;
  readonly merge: DashboardMergeFilter;
}

export interface DashboardFiltersDeps extends SelfBlobTransport {
  /** Debounce delay for server pushes. */
  readonly pushDelayMs?: number;
}

export interface DashboardFiltersStore {
  /** Current filters. Reactive. */
  readonly value: DashboardFilters;
  /** True once the stored filters have been loaded (or failed to load). Reactive. */
  readonly hydrated: boolean;
  /** State of the most recent save. Reactive. */
  readonly saveStatus: SelfBlobSaveStatus;
  setLane(laneId: DashboardLaneId, state: LaneFilterState): void;
  setActivity(filter: DashboardActivityFilter): void;
  setKb(filter: DashboardKbFilter): void;
  setMerge(filter: DashboardMergeFilter): void;
  /** Load the stored filters once per session. Fire and forget. */
  ensureHydrated(): void;
  /** Push any pending changes immediately (tests, teardown). */
  flush(): Promise<void>;
  /** Reset to empty filters and drop pending work. Called by CacheRegistry. */
  clear(): void;
}

/** A lane with no user filter: every dimension empty, both toggles off. */
export function emptyLaneFilterState(): LaneFilterState {
  return {
    statuses: [],
    queueIds: [],
    priorities: [],
    dateFrom: null,
    dateTo: null,
    unreadOnly: false,
    needsAttentionOnly: false,
  };
}

function fromDocument(doc: DashboardFiltersDocument): DashboardFilters {
  return {
    lanes: {
      "needs-attention": doc.lanes["needs-attention"] ?? emptyLaneFilterState(),
      "my-tickets": doc.lanes["my-tickets"] ?? emptyLaneFilterState(),
      unassigned: doc.lanes.unassigned ?? emptyLaneFilterState(),
      "on-hold": doc.lanes["on-hold"] ?? emptyLaneFilterState(),
    },
    activity: doc.activity,
    kb: doc.kb,
    merge: doc.merge,
  };
}

function toDocument(filters: DashboardFilters): DashboardFiltersDocument {
  return {
    v: 1,
    type: "dashboard_filters",
    lanes: filters.lanes,
    activity: filters.activity,
    kb: filters.kb,
    merge: filters.merge,
  };
}

/**
 * Decoded payload to filters; null for anything the schema rejects,
 * including another kind's payload and unknown versions.
 */
export function parseDashboardFilters(json: unknown): DashboardFilters | null {
  const result = dashboardFiltersDocumentSchema.safeParse(json);
  return result.success ? fromDocument(result.data) : null;
}

/** Empty filters. Section defaults come from the schema itself. */
export function emptyDashboardFilters(): DashboardFilters {
  return fromDocument(
    dashboardFiltersDocumentSchema.parse({
      v: 1,
      type: "dashboard_filters",
    }),
  );
}

export function createDashboardFilters(
  deps: DashboardFiltersDeps,
): DashboardFiltersStore {
  // Default merge: filters changed this session win over the stored copy.
  const blob = createSyncedSelfBlob<DashboardFilters>({
    cacheName: "DashboardFilters",
    logTag: "dashboard-filters",
    fetchEnvelope: deps.fetchEnvelope,
    pushEnvelope: deps.pushEnvelope,
    seal: deps.seal,
    open: deps.open,
    parse: parseDashboardFilters,
    serialize: toDocument,
    defaultValue: emptyDashboardFilters,
    pushDelayMs: deps.pushDelayMs,
  });

  return {
    get value(): DashboardFilters {
      return blob.value;
    },

    get hydrated(): boolean {
      return blob.hydrated;
    },

    get saveStatus(): SelfBlobSaveStatus {
      return blob.saveStatus;
    },

    setLane(laneId: DashboardLaneId, state: LaneFilterState): void {
      blob.update((current) => ({
        ...current,
        lanes: { ...current.lanes, [laneId]: state },
      }));
    },

    setActivity(filter: DashboardActivityFilter): void {
      blob.update((current) => ({ ...current, activity: filter }));
    },

    setKb(filter: DashboardKbFilter): void {
      blob.update((current) => ({ ...current, kb: filter }));
    },

    setMerge(filter: DashboardMergeFilter): void {
      blob.update((current) => ({ ...current, merge: filter }));
    },

    ensureHydrated(): void {
      blob.ensureHydrated();
    },

    async flush(): Promise<void> {
      await blob.flush();
    },

    clear(): void {
      blob.clear();
    },
  };
}

// ── Module singleton ─────────────────────────────────────────────────
// AppShell wires the real deps after login. Components call the facade;
// before init setters are no-ops and reads return empty filters. The
// instance is reactive so a component that rendered before init picks
// up the real store once AppShell wires it.

const EMPTY_FILTERS = emptyDashboardFilters();

let instance = $state.raw<DashboardFiltersStore | null>(null);

export function initDashboardFilters(
  deps: DashboardFiltersDeps,
): DashboardFiltersStore {
  // Re-init (AppShell effect re-run) discards the old instance; clear it
  // so a stale debounce timer cannot push an outdated envelope. The new
  // instance registers itself with CacheRegistry under the same name.
  // Untracked: AppShell calls this from an $effect that must not depend
  // on the instance it replaces.
  untrack(() => instance)?.clear();
  const created = createDashboardFilters(deps);
  instance = created;
  return created;
}

export const dashboardFilters = {
  get value(): DashboardFilters {
    return instance?.value ?? EMPTY_FILTERS;
  },
  get hydrated(): boolean {
    return instance?.hydrated ?? false;
  },
  get saveStatus(): SelfBlobSaveStatus {
    return instance?.saveStatus ?? "idle";
  },
  setLane(laneId: DashboardLaneId, state: LaneFilterState): void {
    instance?.setLane(laneId, state);
  },
  setActivity(filter: DashboardActivityFilter): void {
    instance?.setActivity(filter);
  },
  setKb(filter: DashboardKbFilter): void {
    instance?.setKb(filter);
  },
  setMerge(filter: DashboardMergeFilter): void {
    instance?.setMerge(filter);
  },
  ensureHydrated(): void {
    instance?.ensureHydrated();
  },
};
