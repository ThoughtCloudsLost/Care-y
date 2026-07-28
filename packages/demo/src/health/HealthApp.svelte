<!--
  HealthApp: orchestrates the health proof-of-concept.

  Phases:
  1. Boot the PGlite engine, showing live timing rows.
  2. Wire engine.trpc into the health's tRPC shim.
  3. Run the engine's proof battery, rendering pass/fail rows.
  4. Enable the route nav strip for manual testing.

  Crypto context note: mounted route components will show encrypted
  fields as loading/scrambled placeholders because the crypto-context
  stub operates in passthrough mode with no real key material. This is
  expected and noted in the UI.
-->
<script lang="ts">
  import type {
    HealthTimings,
    HealthProofResult,
    HealthEngine,
  } from "./engine.js";
  import { bootHealthEngine } from "./engine.js";
  import { setEngineTrpc } from "../stubs/trpc.js";
  import RouteMount from "$demo/engine/RouteMount.svelte";
  import HealthProviders from "./HealthProviders.svelte";
  import TimingRow from "./ui/TimingRow.svelte";
  import ProofRow from "./ui/ProofRow.svelte";

  // ── Boot state ──

  type BootPhase = "booting" | "proofs" | "ready" | "error";

  let phase = $state<BootPhase>("booting");
  let bootError = $state<string | null>(null);
  let timings = $state<HealthTimings[]>([]);
  let proofResults = $state<HealthProofResult[]>([]);
  let totalBootMs = $state<number>(0);

  // ── Route navigation ──

  let activeRoute = $state<string | null>(null);
  let firstTicketId = $state<string | null>(null);

  interface NavLink {
    readonly label: string;
    readonly path: string;
  }

  let navLinks = $derived<NavLink[]>(buildNavLinks(firstTicketId));

  function buildNavLinks(ticketId: string | null): NavLink[] {
    const links: NavLink[] = [
      { label: "/tickets", path: "/tickets" },
      { label: "/library", path: "/library" },
    ];
    if (ticketId !== null) {
      links.splice(1, 0, {
        label: `/tickets/${ticketId.slice(0, 8)}...`,
        path: `/tickets/${ticketId}`,
      });
    }
    return links;
  }

  // ── Memory measurement (Chrome only) ──

  interface PerformanceMemory {
    readonly usedJSHeapSize: number;
    readonly totalJSHeapSize: number;
    readonly jsHeapSizeLimit: number;
  }

  function getHeapSize(): number | null {
    const perf = performance as { memory?: PerformanceMemory };
    if (perf.memory !== undefined) {
      return perf.memory.usedJSHeapSize;
    }
    return null;
  }

  let heapBytes = $state<number | null>(null);

  // ── Boot sequence ──

  async function runBoot(): Promise<void> {
    const bootStart = performance.now();

    try {
      const engine: HealthEngine = await bootHealthEngine();

      totalBootMs = Math.round(performance.now() - bootStart);
      timings = [...engine.timings];

      // Wire the engine's tRPC into the client shim
      setEngineTrpc(engine.trpc);

      // Fetch the first ticket ID for the nav link
      try {
        const ticketList = await (
          engine.trpc as {
            tickets: {
              list: {
                query: (opts: {
                  limit: number;
                }) => Promise<readonly { id: string }[]>;
              };
            };
          }
        ).tickets.list.query({ limit: 1 });
        if (ticketList.length > 0 && ticketList[0] !== undefined) {
          firstTicketId = ticketList[0].id;
        }
      } catch (listErr: unknown) {
        // Non-fatal: the nav link just won't have a ticket ID
        console.warn(
          "Failed to fetch ticket list for nav:",
          listErr instanceof Error ? listErr.message : listErr,
        );
      }

      // Run proofs
      phase = "proofs";
      await engine.runProofs((result: HealthProofResult) => {
        proofResults = [...proofResults, result];
      });

      heapBytes = getHeapSize();
      phase = "ready";
    } catch (err: unknown) {
      bootError = err instanceof Error ? err.message : "Unknown boot error";
      phase = "error";
    }
  }

  // Kick off boot on mount
  $effect(() => {
    void runBoot();
  });

  // ── Helpers ──

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${String(bytes)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
</script>

<div class="health-shell">
  <header class="health-header">
    <h1>CARE-Y Demo Health Check</h1>
    <p class="health-subtitle">
      PGlite engine, glob-derived routes, real client components
    </p>
  </header>

  <!-- Boot timings -->
  <section class="health-section">
    <h2>Boot Timings</h2>
    {#if phase === "booting"}
      <div class="health-spinner">Booting engine...</div>
    {:else if phase === "error"}
      <div class="health-error">Boot failed: {bootError}</div>
    {:else}
      <div class="health-timings">
        {#each timings as timing (timing.label)}
          <TimingRow label={timing.label} ms={timing.ms} />
        {/each}
        <div class="health-total">
          Total boot: {totalBootMs} ms
        </div>
        {#if heapBytes !== null}
          <div class="health-memory">
            JS heap: {formatBytes(heapBytes)}
          </div>
        {/if}
      </div>
    {/if}
  </section>

  <!-- Proof results -->
  <section class="health-section">
    <h2>Proof Battery</h2>
    {#if phase === "booting"}
      <div class="health-waiting">Waiting for boot...</div>
    {:else}
      <div class="health-proofs">
        {#each proofResults as result (result.name)}
          <ProofRow
            name={result.name}
            pass={result.pass}
            detail={result.detail}
          />
        {/each}
        {#if phase === "proofs"}
          <div class="health-spinner">Running proofs...</div>
        {/if}
      </div>
    {/if}
  </section>

  <!-- Route navigation -->
  <section class="health-section">
    <h2>Route Mount</h2>
    <p class="health-caption">
      Renders REAL client route components via glob-derived manifest. Encrypted
      fields appear as loading/scrambled placeholders (expected: crypto-context
      stub has no real key material).
    </p>

    {#if phase === "ready"}
      <nav class="health-nav">
        {#each navLinks as link (link.path)}
          <button
            class="health-nav-btn"
            class:active={activeRoute === link.path}
            onclick={() => {
              activeRoute = link.path;
            }}
          >
            {link.label}
          </button>
        {/each}
        {#if activeRoute !== null}
          <button
            class="health-nav-btn health-nav-close"
            onclick={() => {
              activeRoute = null;
            }}
          >
            Close
          </button>
        {/if}
      </nav>

      {#if activeRoute !== null}
        <div class="health-route-container">
          {#key activeRoute}
            <RouteMount pathname={activeRoute}>
              {#snippet wrapper(content)}
                <HealthProviders>
                  {@render content()}
                </HealthProviders>
              {/snippet}
            </RouteMount>
          {/key}
        </div>
      {/if}
    {:else}
      <div class="health-waiting">
        Route navigation available after boot + proofs complete.
      </div>
    {/if}
  </section>
</div>

<style>
  .health-shell {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
    font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace;
    font-size: 14px;
    color: #1a1a1a;
    background: #fafafa;
    min-height: 100vh;
  }

  .health-header {
    border-bottom: 2px solid #333;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
  }

  .health-header h1 {
    font-size: 18px;
    margin: 0;
    font-weight: 700;
  }

  .health-subtitle {
    margin: 0.25rem 0 0;
    font-size: 12px;
    color: #666;
  }

  .health-section {
    margin-bottom: 1.5rem;
  }

  .health-section h2 {
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #444;
    margin: 0 0 0.5rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid #ddd;
  }

  .health-caption {
    font-size: 11px;
    color: #888;
    margin: 0 0 0.5rem;
    line-height: 1.4;
  }

  .health-spinner {
    color: #666;
    padding: 0.5rem 0;
  }

  .health-spinner::before {
    content: "\25B6 ";
  }

  .health-waiting {
    color: #999;
    font-style: italic;
    padding: 0.5rem 0;
  }

  .health-error {
    color: #c00;
    background: #fee;
    padding: 0.5rem;
    border: 1px solid #c00;
    border-radius: 4px;
  }

  .health-total {
    font-weight: 700;
    padding: 0.25rem 0;
    border-top: 1px solid #ddd;
    margin-top: 0.25rem;
  }

  .health-memory {
    font-size: 12px;
    color: #666;
    padding: 0.125rem 0;
  }

  .health-nav {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 0.75rem;
  }

  .health-nav-btn {
    font-family: inherit;
    font-size: 12px;
    padding: 0.375rem 0.75rem;
    border: 1px solid #999;
    border-radius: 4px;
    background: #fff;
    color: #333;
    cursor: pointer;
    transition:
      background 0.1s,
      border-color 0.1s;
  }

  .health-nav-btn:hover {
    background: #eee;
  }

  .health-nav-btn.active {
    background: #333;
    color: #fff;
    border-color: #333;
  }

  .health-nav-close {
    border-color: #c00;
    color: #c00;
  }

  .health-nav-close:hover {
    background: #fee;
  }

  .health-route-container {
    border: 1px solid #ccc;
    border-radius: 4px;
    min-height: 200px;
    overflow: auto;
    background: #fff;
  }
</style>
