<script lang="ts">
  /* eslint-disable care-y/no-hardcoded-strings -- Dev-only tooling, not user-facing */
  import { themeStore } from "$lib/stores/theme.svelte";
  import type {
    VisualTheme,
    KonstaTheme,
    GlassMode,
  } from "$lib/stores/theme.svelte";
  import { onMount } from "svelte";
  import { Settings } from "@lucide/svelte";
  import {
    applyKonstaPalette,
    resetKonstaPalette,
  } from "$lib/branding/konsta-palette";
  import type { BrandColors } from "$lib/branding/konsta-palette";

  const PRIMARY_KEY = "care-y-dev-brand-color";
  const ACCENT_KEY = "care-y-dev-brand-accent";
  const PALETTE_KEY = "care-y-dev-palette";
  const DEFAULT_PRIMARY = "#f05030";
  const DEFAULT_ACCENT = "#2563eb";
  const MAX_LOG_LINES = 150;

  interface Palette {
    name: string;
    primary: string;
    accent: string;
  }

  const PALETTES: Palette[] = [
    { name: "Default", primary: DEFAULT_PRIMARY, accent: DEFAULT_ACCENT },
    { name: "Lavender + Cherry", primary: "#9967CA", accent: "#F9A8BB" },
    { name: "Linen + Blossom", primary: "#F5F1E6", accent: "#F9A8BB" },
    { name: "Grape + Pastel", primary: "#473144", accent: "#FFCAD4" },
    { name: "Berry + Petal", primary: "#974472", accent: "#FEDDE8" },
    { name: "Fuchsia + Cotton", primary: "#F8395A", accent: "#EEB3B5" },
    { name: "Blush + Butter", primary: "#E36887", accent: "#F3D98F" },
    { name: "Graphite + Pink", primary: "#2B2B2B", accent: "#FEBFCA" },
    { name: "Slate + Blush", primary: "#5B6E7D", accent: "#EDB1B0" },
  ];

  let opened = $state(false);
  let consoleOpen = $state(false);
  let primaryColor = $state(DEFAULT_PRIMARY);
  let accentColor = $state(DEFAULT_ACCENT);
  let activePalette = $state("");

  interface LogLine {
    id: number;
    text: string;
    level: "log" | "warn" | "error";
  }

  let logId = 0;
  let logs: LogLine[] = $state([]);

  function safeStringify(value: unknown): string {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  onMount(() => {
    // Hydrate persisted brand colors
    const storedPalette = localStorage.getItem(PALETTE_KEY);
    if (storedPalette !== null && storedPalette !== "") {
      const match = PALETTES.find((p) => p.name === storedPalette);
      if (match) {
        activePalette = match.name;
        primaryColor = match.primary;
        accentColor = match.accent;
      }
    } else {
      primaryColor = localStorage.getItem(PRIMARY_KEY) ?? DEFAULT_PRIMARY;
      accentColor = localStorage.getItem(ACCENT_KEY) ?? DEFAULT_ACCENT;
    }
    applyBrandColors();

    // Console capture
    const orig = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
    };

    function capture(level: LogLine["level"], args: unknown[]): void {
      const text = args
        .map((a) => (typeof a === "string" ? a : safeStringify(a)))
        .join(" ");
      logs.push({ id: logId++, text, level });
      if (logs.length > MAX_LOG_LINES) {
        logs.splice(0, logs.length - MAX_LOG_LINES);
      }
    }

    console.log = (...args: unknown[]) => {
      orig.log(...args);
      capture("log", args);
    };
    console.warn = (...args: unknown[]) => {
      orig.warn(...args);
      capture("warn", args);
    };
    console.error = (...args: unknown[]) => {
      orig.error(...args);
      capture("error", args);
    };

    return () => {
      console.log = orig.log;
      console.warn = orig.warn;
      console.error = orig.error;
    };
  });

  function applyPalette(palette: Palette): void {
    activePalette = palette.name;
    primaryColor = palette.primary;
    accentColor = palette.accent;
    localStorage.setItem(PALETTE_KEY, palette.name);
    applyBrandColors();
  }

  function buildBrandColors(): BrandColors {
    return {
      primary: primaryColor,
      accent: accentColor,
    };
  }

  function applyBrandColors(): void {
    document.documentElement.style.setProperty("--brand-primary", primaryColor);
    localStorage.setItem(PRIMARY_KEY, primaryColor);
    localStorage.setItem(ACCENT_KEY, accentColor);
    void applyKonstaPalette(buildBrandColors());
  }

  function resetBrandColors(): void {
    primaryColor = DEFAULT_PRIMARY;
    accentColor = DEFAULT_ACCENT;
    activePalette = "";
    localStorage.removeItem(PRIMARY_KEY);
    localStorage.removeItem(ACCENT_KEY);
    localStorage.removeItem(PALETTE_KEY);
    document.documentElement.style.removeProperty("--brand-primary");
    resetKonstaPalette();
    void applyKonstaPalette({ primary: DEFAULT_PRIMARY });
  }

  function handleColorInput(
    setter: (value: string) => void,
  ): (e: Event) => void {
    return (e: Event) => {
      if (!(e.target instanceof HTMLInputElement)) return;
      setter(e.target.value);
      activePalette = "";
      localStorage.removeItem(PALETTE_KEY);
      applyBrandColors();
    };
  }

  const handlePrimaryInput = handleColorInput((v) => (primaryColor = v));
  const handleAccentInput = handleColorInput((v) => (accentColor = v));

  function cycleEnum<T extends string>(values: readonly T[], current: T): T {
    return values[(values.indexOf(current) + 1) % values.length] ?? current;
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
  aria-label="Dev theme settings"
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
    onkeydown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        opened = false;
      }
    }}
  ></div>
  <div class="dev-panel" role="dialog" aria-label="Dev theme panel">
    <div class="dev-title">Dev Theme Panel</div>
    <div class="dev-grid">
      <button
        class="dev-btn"
        onclick={() => {
          themeStore.toggleColorScheme();
          queueMicrotask(() => void applyKonstaPalette(buildBrandColors()));
        }}
      >
        {themeStore.resolvedScheme === "dark" ? "Dark" : "Light"}
      </button>
      <button class="dev-btn" onclick={cycleUi}>
        {themeStore.uiTheme === "ios" ? "iOS" : "Material"}
      </button>
      <button class="dev-btn" onclick={cycleVisual}>
        {themeStore.visualTheme}
      </button>
      <button class="dev-btn" onclick={cycleGlass}>
        glass: {themeStore.glassMode}
      </button>
    </div>
    <div class="dev-row" style="margin-bottom: 0.75rem">
      <div class="dev-color-cell" style="flex: 1">
        <input
          type="color"
          value={primaryColor}
          oninput={handlePrimaryInput}
          class="dev-color"
        />
        <span class="dev-hex">{primaryColor}</span>
      </div>
      <div class="dev-color-cell" style="flex: 1">
        <input
          type="color"
          value={accentColor}
          oninput={handleAccentInput}
          class="dev-color"
        />
        <span class="dev-hex">{accentColor}</span>
      </div>
    </div>
    <div class="dev-title">Palettes</div>
    <div class="dev-palette-scroll">
      {#each PALETTES as palette (palette.name)}
        <button
          class="dev-palette-btn"
          class:active={activePalette === palette.name}
          onclick={() => applyPalette(palette)}
          title={palette.name}
        >
          <span class="dev-swatch" style:background={palette.primary}></span>
          <span class="dev-swatch" style:background={palette.accent}></span>
          <span class="dev-palette-name">{palette.name}</span>
        </button>
      {/each}
    </div>

    <div class="dev-row">
      <button class="dev-reset" onclick={resetBrandColors}>Reset colors</button>
      <button class="dev-reset" onclick={() => (consoleOpen = !consoleOpen)}>
        {consoleOpen ? "Hide" : "Show"} console ({logs.length})
      </button>
      <button class="dev-reset" onclick={() => (logs.length = 0)}>
        Clear
      </button>
    </div>

    {#if consoleOpen}
      <div class="dev-console">
        {#each logs as line (line.id)}
          <div style:color={logColor(line.level)}>{line.text}</div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
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
    font-size: 1.25rem;
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

  .dev-backdrop {
    position: fixed;
    inset: 0;
    z-index: 99998;
    background: rgba(0, 0, 0, 0.3);
  }

  .dev-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 99999;
    background: var(--surface-1, #1c1c1d);
    color: var(--ink, #e5e5e5);
    border-top: 1px solid var(--muted, #888);
    padding: 1rem;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom));
    border-radius: 1rem 1rem 0 0;
    max-height: 80vh;
    overflow-y: auto;
  }

  .dev-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted, #888);
    margin-bottom: 0.75rem;
  }

  .dev-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .dev-btn {
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid var(--muted, #888);
    background: var(--surface-2, #2c2c2c);
    color: var(--ink, #e5e5e5);
    font-size: 0.875rem;
    cursor: pointer;
    text-align: center;
  }

  .dev-btn:active {
    opacity: 0.7;
  }

  .dev-color-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid var(--muted, #888);
    background: var(--surface-2, #2c2c2c);
  }

  .dev-color {
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: transparent;
  }

  .dev-hex {
    font-family: monospace;
    font-size: 0.75rem;
    color: var(--muted, #888);
  }

  .dev-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .dev-reset {
    flex: 1;
    padding: 0.4rem;
    border-radius: 0.5rem;
    border: 1px solid var(--muted, #888);
    background: transparent;
    color: var(--muted, #888);
    font-size: 0.75rem;
    cursor: pointer;
  }

  .dev-palette-scroll {
    display: flex;
    gap: 0.375rem;
    margin-bottom: 0.75rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 0.25rem;
  }

  .dev-palette-scroll::-webkit-scrollbar {
    display: none;
  }

  .dev-palette-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.3rem 0.4rem;
    border-radius: 0.5rem;
    border: 1px solid var(--muted, #888);
    background: var(--surface-2, #2c2c2c);
    color: var(--ink, #e5e5e5);
    font-size: 0.625rem;
    cursor: pointer;
    text-align: left;
    white-space: nowrap;
    flex-shrink: 0;
    transition: border-color 100ms;
  }

  .dev-palette-btn.active {
    border-color: var(--brand-text, #f05030);
    border-width: 2px;
    padding: calc(0.3rem - 1px) calc(0.4rem - 1px);
  }

  .dev-palette-btn:active {
    opacity: 0.7;
  }

  .dev-swatch {
    display: inline-block;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 3px;
    flex-shrink: 0;
    border: 1px solid rgba(128, 128, 128, 0.3);
  }

  .dev-palette-name {
    white-space: nowrap;
  }

  .dev-console {
    background: #0a0a0a;
    border-radius: 0.5rem;
    padding: 0.5rem;
    max-height: 30vh;
    overflow-y: auto;
    font: 9px/1.4 monospace;
    word-break: break-all;
  }
</style>
