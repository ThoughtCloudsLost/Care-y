export type DeepSearchPhase = "idle" | "searching" | "done";

export interface DeepSearchDeps {
  readonly getOverlayTerm: () => string | null;
  readonly getHasMoreMessages: () => boolean;
  readonly getLoadOlderPage: () => (() => Promise<void>) | undefined;
  /** Entries loaded so far, from the raw paginated list (not display-filtered). */
  readonly getLoadedCount: () => number;
  /** The ticket's total entry count. */
  readonly getTotalCount: () => number;
}

export interface DeepSearchState {
  readonly phase: DeepSearchPhase;
  readonly term: string | null;
  /** Live loaded-entry count; climbs as trigger() pages older entries in. */
  readonly searched: number;
  /** The ticket's total entry count. */
  readonly total: number;
  trigger(): Promise<void>;
  reset(): void;
}

export function createDeepSearch(deps: DeepSearchDeps): DeepSearchState {
  let phase = $state<DeepSearchPhase>("idle");
  let searchTerm = $state<string | null>(null);

  async function trigger(): Promise<void> {
    if (phase !== "idle") return;
    const loadOlderPage = deps.getLoadOlderPage();
    if (!loadOlderPage) return;
    const term = deps.getOverlayTerm() ?? "";
    if (term.length < 2) return;

    searchTerm = term;
    phase = "searching";

    while (deps.getHasMoreMessages() && deps.getLoadOlderPage()) {
      const loader = deps.getLoadOlderPage();
      if (!loader) break;
      await loader();
      if ((phase as string) !== "searching") return;
    }

    phase = "done";
  }

  function reset(): void {
    phase = "idle";
    searchTerm = null;
  }

  return {
    get phase(): DeepSearchPhase {
      return phase;
    },
    get term(): string | null {
      return searchTerm;
    },
    get searched(): number {
      return deps.getLoadedCount();
    },
    get total(): number {
      return deps.getTotalCount();
    },
    trigger,
    reset,
  };
}
