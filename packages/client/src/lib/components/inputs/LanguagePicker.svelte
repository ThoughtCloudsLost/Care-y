<script lang="ts">
  import { Globe } from "@lucide/svelte";
  import { locales } from "$lib/paraglide/runtime.js";
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    value: string;
    onchange: (locale: string) => void;
  }

  let { value, onchange }: Props = $props();

  const NATIVE_NAMES = new Map<string, string>([
    ["en", "English"],
    ["es", "Espanol"],
  ]);
</script>

<div class="language-picker">
  <Globe size={16} aria-hidden="true" />
  <select
    {value}
    onchange={(e: Event) => {
      const target = e.target;
      if (target instanceof HTMLSelectElement) onchange(target.value);
    }}
    aria-label={m.language_picker_label()}
  >
    {#each locales as loc (loc)}
      <option value={loc}>{NATIVE_NAMES.get(loc) ?? loc}</option>
    {/each}
  </select>
</div>

<style>
  .language-picker {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--muted);
  }

  .language-picker select {
    appearance: none;
    background: transparent;
    border: none;
    color: inherit;
    font-size: var(--text-sm);
    font-family: inherit;
    cursor: pointer;
    padding: 4px 0;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .language-picker select:focus-visible {
    outline: 2px solid var(--k-color-primary);
    outline-offset: 2px;
    border-radius: 4px;
  }
</style>
