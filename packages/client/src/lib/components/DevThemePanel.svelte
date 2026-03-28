<script lang="ts">
  import { themeStore } from "$lib/stores/theme.svelte";
  import type { VisualTheme, KonstaTheme } from "$lib/stores/theme.svelte";

  let opened = $state(false);
  let brandColor = $state("#f05030");

  function applyBrandColor(hex: string): void {
    document.body.style.setProperty("--brand-primary", hex);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    document.body.style.setProperty(
      "--brand-primary-40",
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.4)`,
    );
    document.body.style.setProperty(
      "--brand-primary-20",
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.2)`,
    );
  }

  function resetBrandColor(): void {
    brandColor = "#f05030";
    document.body.style.removeProperty("--brand-primary");
    document.body.style.removeProperty("--brand-primary-40");
    document.body.style.removeProperty("--brand-primary-20");
  }

  function handleColorInput(e: Event): void {
    if (!(e.target instanceof HTMLInputElement)) return;
    brandColor = e.target.value;
    applyBrandColor(brandColor);
  }

  function cycleVisual(): void {
    const themes: VisualTheme[] = ["default", "riso"];
    const idx = themes.indexOf(themeStore.visualTheme);
    themeStore.setVisualTheme(themes[(idx + 1) % themes.length]);
  }

  function cycleUi(): void {
    const themes: KonstaTheme[] = ["ios", "material"];
    const idx = themes.indexOf(themeStore.uiTheme);
    themeStore.setUiTheme(themes[(idx + 1) % themes.length]);
    // Konsta doesn't fully reinitialize on runtime theme switch (iOS tabbar
    // glass drag breaks). Reload so the new theme is picked up from localStorage.
    window.location.reload();
  }
</script>

<!-- FAB trigger -->
<button
  class="dev-fab"
  onclick={() => (opened = !opened)}
  aria-label="Dev theme settings"
>
  <span aria-hidden="true">&#9881;</span>
</button>

<!-- Panel -->
{#if opened}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="dev-backdrop" onclick={() => (opened = false)}></div>
  <div class="dev-panel" role="dialog" aria-label="Dev theme panel">
    <div class="dev-title">Dev Theme Panel</div>
    <div class="dev-grid">
      <button class="dev-btn" onclick={() => themeStore.toggleColorScheme()}>
        {themeStore.resolvedScheme === "dark" ? "Dark" : "Light"}
      </button>
      <button class="dev-btn" onclick={cycleUi}>
        {themeStore.uiTheme === "ios" ? "iOS" : "Material"}
      </button>
      <button class="dev-btn" onclick={cycleVisual}>
        {themeStore.visualTheme}
      </button>
      <div class="dev-color-cell">
        <input
          type="color"
          value={brandColor}
          oninput={handleColorInput}
          class="dev-color"
        />
        <span class="dev-hex">{brandColor}</span>
      </div>
    </div>
    <button class="dev-reset" onclick={resetBrandColor}>Reset color</button>
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

  .dev-reset {
    width: 100%;
    padding: 0.4rem;
    border-radius: 0.5rem;
    border: 1px solid var(--muted, #888);
    background: transparent;
    color: var(--muted, #888);
    font-size: 0.75rem;
    cursor: pointer;
  }
</style>
