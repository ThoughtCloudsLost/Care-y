<script lang="ts">
  /* eslint-disable care-y/no-hardcoded-strings -- Dev-only tooling, not user-facing */
  import { themeStore } from "$lib/stores/theme.svelte";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import type {
    VisualTheme,
    KonstaTheme,
    GlassMode,
  } from "$lib/stores/theme.svelte";
  import { onMount } from "svelte";
  import { Settings, RefreshCw, X } from "@lucide/svelte";
  import { applyKonstaPalette } from "$lib/branding/konsta-palette";
  import { setDevDelay } from "$lib/trpc/index.js";
  import {
    logBuffer,
    netBuffer,
    type LogLine,
    type NetEntry,
  } from "$lib/dev/log-buffer.js";

  let opened = $state(false);
  let devDelay = $state(false);
  let activeLog = $state<"console" | "network" | null>(null);

  let logs: LogLine[] = $state([]);
  let netLogs: NetEntry[] = $state([]);

  onMount(() => {
    function syncBuffers(): void {
      if (logBuffer.length !== logs.length) logs = [...logBuffer];
      if (netBuffer.length !== netLogs.length) netLogs = [...netBuffer];
    }
    syncBuffers();
    const interval = setInterval(syncBuffers, 500);
    return () => clearInterval(interval);
  });

  function cycleEnum<T extends string>(values: readonly T[], current: T): T {
    return values[(values.indexOf(current) + 1) % values.length] ?? current;
  }

  function toggleDevDelay(): void {
    devDelay = !devDelay;
    setDevDelay(devDelay);
  }

  function cycleVisual(): void {
    const themes: VisualTheme[] = [
      "default",
      "riso",
      "frutiger",
      "brutalist",
      "cupertino",
    ];
    themeStore.setVisualTheme(cycleEnum(themes, themeStore.visualTheme));
  }

  function cycleGlass(): void {
    themeStore.setGlassMode(
      cycleEnum<GlassMode>(["auto", "light", "dark"], themeStore.glassMode),
    );
  }

  function cycleUi(): void {
    themeStore.setUiTheme(
      cycleEnum<KonstaTheme>(["ios", "material"], themeStore.uiTheme),
    );
    window.location.reload();
  }

  function logColor(level: LogLine["level"]): string {
    if (level === "error") return "#ff4444";
    if (level === "warn") return "#ffaa00";
    return "#88ff88";
  }
</script>

<!-- FAB trigger -->
<button
  class="dev-fab"
  onclick={() => (opened = !opened)}
  aria-label="Open dev panel"
>
  <Settings size={20} aria-hidden="true" />
</button>

<!-- Panel -->
{#if opened}
  <div
    class="dev-backdrop"
    role="button"
    tabindex="0"
    aria-label="Close dev panel"
    onclick={() => (opened = false)}
    onkeydown={onKeyActivate(() => (opened = false))}
  ></div>
  <div class="dev-panel" role="dialog" aria-label="Dev panel">
    <!-- Header -->
    <div class="dev-header">
      <span class="dev-title">Dev Panel</span>
      <div class="dev-header-actions">
        <button
          class="dev-icon-btn"
          onclick={() => location.reload()}
          aria-label="Hard refresh"
        >
          <RefreshCw size={14} aria-hidden="true" />
        </button>
        <button
          class="dev-icon-btn"
          onclick={() => (opened = false)}
          aria-label="Close"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </div>

    <!-- Theme pill strip -->
    <div class="dev-pill-strip">
      <button
        class="dev-pill"
        onclick={() => {
          themeStore.toggleColorScheme();
          const current =
            getComputedStyle(document.documentElement)
              .getPropertyValue("--brand-primary")
              .trim() || "#98a448";
          queueMicrotask(() => void applyKonstaPalette(current));
        }}
      >
        {themeStore.resolvedScheme === "dark" ? "Dark" : "Light"}
      </button>
      <button class="dev-pill" onclick={cycleUi}>
        {themeStore.uiTheme === "ios" ? "iOS" : "Material"}
      </button>
      <button class="dev-pill" onclick={cycleVisual}>
        {themeStore.visualTheme}
      </button>
      <button class="dev-pill" onclick={cycleGlass}>
        glass: {themeStore.glassMode}
      </button>
      <button
        class="dev-pill"
        class:dev-pill-active={devDelay}
        onclick={toggleDevDelay}
      >
        delay: {devDelay ? "ON" : "OFF"}
      </button>
    </div>

    <!-- Log tabs -->
    <div class="dev-tab-bar">
      <button
        class="dev-tab"
        class:active={activeLog === "console"}
        onclick={() => (activeLog = activeLog === "console" ? null : "console")}
      >
        Console ({logs.length})
      </button>
      <button
        class="dev-tab"
        class:active={activeLog === "network"}
        onclick={() => (activeLog = activeLog === "network" ? null : "network")}
      >
        Network ({netLogs.length})
      </button>
      <button
        class="dev-ghost dev-clear"
        onclick={() => {
          logBuffer.length = 0;
          netBuffer.length = 0;
          logs = [];
          netLogs = [];
        }}
      >
        Clear
      </button>
    </div>

    <!-- Log output -->
    {#if activeLog === "console"}
      <div class="dev-console">
        {#each logs as line (line.id)}
          <div style:color={logColor(line.level)}>{line.text}</div>
        {/each}
      </div>
    {/if}

    {#if activeLog === "network"}
      <div class="dev-console">
        {#each netLogs as entry (entry.id)}
          {@const isError = entry.status === null || entry.status >= 400}
          <div class="dev-net-entry">
            <span class="dev-net-meta" class:dev-net-error={isError}
              >{entry.method}
              {entry.url}
              {entry.status ?? "-"}
              {entry.duration != null
                ? `${entry.duration.toString()}ms`
                : ""}</span
            >
            {#if entry.body !== null}
              <div class="dev-net-body">{entry.body}</div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  /* FAB */
  .dev-fab {
    position: fixed;
    bottom: 5.5rem;
    right: 0.75rem;
    z-index: 99999;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: 1px solid var(--muted, #888);
    background: var(--surface-1, #1c1c1d);
    color: var(--ink, #e5e5e5);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 150ms;
  }
  .dev-fab:hover,
  .dev-fab:active {
    opacity: 1;
  }

  /* Backdrop */
  .dev-backdrop {
    position: fixed;
    inset: 0;
    z-index: 99998;
    background: rgba(0, 0, 0, 0.3);
  }

  /* Panel shell */
  .dev-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 99999;
    background: var(--surface-1, #1c1c1d);
    color: var(--ink, #e5e5e5);
    border-top: 1px solid rgba(128, 128, 128, 0.25);
    border-radius: 1rem 1rem 0 0;
    padding: 0.75rem 0.875rem calc(0.75rem + env(safe-area-inset-bottom));
    max-height: 80vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  /* Header row */
  .dev-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .dev-title {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--muted, #888);
  }
  .dev-header-actions {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }
  .dev-icon-btn {
    background: none;
    border: none;
    color: var(--muted, #888);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }
  .dev-icon-btn:active {
    opacity: 0.5;
  }

  /* Theme pill strip */
  .dev-pill-strip {
    display: flex;
    gap: 0.375rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .dev-pill-strip::-webkit-scrollbar {
    display: none;
  }

  .dev-pill {
    flex-shrink: 0;
    height: 1.75rem;
    padding: 0 0.75rem;
    border-radius: 999px;
    border: 1px solid rgba(128, 128, 128, 0.4);
    background: var(--surface-2, #2c2c2c);
    color: var(--ink, #e5e5e5);
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    cursor: pointer;
    white-space: nowrap;
  }
  .dev-pill:active {
    opacity: 0.6;
  }
  .dev-pill.dev-pill-active {
    background: var(--ink, #e5e5e5);
    color: var(--surface-1, #1c1c1d);
    border-color: transparent;
  }

  /* Ghost button (Clear) */
  .dev-ghost {
    background: none;
    border: none;
    color: var(--muted, #888);
    font-size: 0.6875rem;
    cursor: pointer;
    padding: 0.2rem 0.25rem;
    white-space: nowrap;
  }
  .dev-ghost:active {
    opacity: 0.5;
  }

  /* Log tab bar */
  .dev-tab-bar {
    display: flex;
    gap: 0.375rem;
    align-items: center;
    border-top: 1px solid rgba(128, 128, 128, 0.15);
    padding-top: 0.5rem;
  }
  .dev-tab {
    flex: 1;
    height: 1.875rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(128, 128, 128, 0.35);
    background: var(--surface-2, #2c2c2c);
    color: var(--muted, #888);
    font-size: 0.6875rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      background 100ms,
      color 100ms;
  }
  .dev-tab.active {
    background: var(--ink, #e5e5e5);
    color: var(--surface-1, #1c1c1d);
    border-color: transparent;
  }
  .dev-tab:active {
    opacity: 0.7;
  }

  .dev-clear {
    flex-shrink: 0;
  }

  /* Log output */
  .dev-console {
    background: #0a0a0a;
    border-radius: 0.5rem;
    padding: 0.5rem;
    max-height: 35vh;
    overflow-y: auto;
    font: 9px/1.4 monospace;
    word-break: break-all;
  }

  .dev-net-entry {
    border-bottom: 1px solid #1a1a1a;
    padding-bottom: 0.25rem;
    margin-bottom: 0.25rem;
  }
  .dev-net-meta {
    color: #88ccff;
  }
  .dev-net-meta.dev-net-error {
    color: #ff4444;
  }
  .dev-net-body {
    color: #aaaaaa;
    margin-top: 0.15rem;
    white-space: pre-wrap;
  }
</style>
