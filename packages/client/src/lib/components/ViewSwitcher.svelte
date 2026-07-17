<!--
  View-mode vocabulary over the shared IconTabToggle anatomy: maps each
  ViewMode to its icon and label, renders toggle semantics. Sizing, hit
  areas, and segment styling all live in IconTabToggle.
-->
<script lang="ts">
  import type { Component } from "svelte";
  import { Table2, List, CreditCard, LayoutGrid, Kanban } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import IconTabToggle from "$lib/components/shared/IconTabToggle.svelte";
  import type { ViewMode } from "$lib/stores/view-mode.svelte.js";

  interface TabDef {
    readonly icon: Component<{ size: number }>;
    readonly label: () => string;
  }

  /** The four base modes every surface shows. */
  const BASE_MODES: readonly ViewMode[] = ["table", "list", "cards", "grid"];

  // Map lookup (not object indexing) per the lint security rules; the
  // fallback is unreachable with a valid ViewMode.
  const TABLE_TAB: TabDef = { icon: Table2, label: m.view_switcher_table };
  const MODE_TABS = new Map<ViewMode, TabDef>([
    ["table", TABLE_TAB],
    ["list", { icon: List, label: m.view_switcher_rows }],
    ["cards", { icon: CreditCard, label: m.view_switcher_cards }],
    ["grid", { icon: LayoutGrid, label: m.view_switcher_grid }],
    ["kanban", { icon: Kanban, label: m.view_switcher_kanban }],
  ]);

  interface Props {
    mode: ViewMode;
    onchange: (mode: ViewMode) => void;
    /** Group label override; defaults to the shared "View as". */
    label?: string;
    /** Which mode buttons to show, in order. Defaults to the four base modes. */
    modes?: readonly ViewMode[];
  }

  let { mode, onchange, label, modes = BASE_MODES }: Props = $props();

  const tabs = $derived(
    modes.map((id) => {
      const def = MODE_TABS.get(id) ?? TABLE_TAB;
      return { id, label: def.label(), icon: def.icon };
    }),
  );

  const groupLabel = $derived(label ?? m.view_switcher_label());

  function handleChange(id: string): void {
    const next = modes.find((candidate) => candidate === id);
    if (next) onchange(next);
  }
</script>

<IconTabToggle
  {tabs}
  active={mode}
  ariaLabel={groupLabel}
  semantics="toggle"
  onchange={handleChange}
/>
