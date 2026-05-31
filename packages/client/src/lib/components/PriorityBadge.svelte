<script lang="ts">
  import { ChevronsUp, ChevronUp, Minus, ChevronDown } from "@lucide/svelte";
  import type { Component } from "svelte";

  interface PriorityDef {
    icon: Component;
    label: string;
    colorClass: string;
    badge: boolean;
  }

  interface Props {
    priority: "low" | "normal" | "high" | "urgent";
  }

  let { priority }: Props = $props();

  const normalDef: PriorityDef = {
    icon: Minus,
    label: "Normal",
    colorClass: "priority-normal",
    badge: false,
  };

  const priorityMap = new Map<string, PriorityDef>([
    [
      "urgent",
      {
        icon: ChevronsUp,
        label: "Urgent",
        colorClass: "priority-urgent",
        badge: true,
      },
    ],
    [
      "high",
      {
        icon: ChevronUp,
        label: "High",
        colorClass: "priority-high",
        badge: true,
      },
    ],
    ["normal", normalDef],
    [
      "low",
      {
        icon: ChevronDown,
        label: "Low",
        colorClass: "priority-low",
        badge: false,
      },
    ],
  ]);

  const def = $derived(priorityMap.get(priority) ?? normalDef);
  const PriorityIcon = $derived(def.icon);
</script>

<span
  class="priority-indicator {def.colorClass}"
  class:priority-badge={def.badge}
  data-priority={priority}
>
  <PriorityIcon size={12} aria-hidden="true" />
  <span>{def.label}</span>
</span>

<style>
  .priority-indicator {
    --priority-urgent: #ff3b30;
    --priority-urgent-dark: #ff6961;
    --priority-high: #ff9500;

    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--text-xs);
    font-weight: 500;
    white-space: nowrap;
  }

  .priority-badge {
    font-weight: 600;
    padding: 0.0625rem 0.3125rem;
    border-radius: 0.25rem;
  }

  .priority-urgent {
    color: var(--priority-urgent);
  }
  :global(.dark) .priority-urgent {
    color: var(--priority-urgent-dark);
  }
  .priority-urgent.priority-badge {
    background: color-mix(in srgb, var(--priority-urgent) 12%, transparent);
  }

  .priority-high {
    color: var(--priority-high);
  }
  .priority-high.priority-badge {
    background: color-mix(in srgb, var(--priority-high) 12%, transparent);
  }

  .priority-normal {
    color: var(--muted);
  }

  .priority-low {
    color: var(--muted);
  }
</style>
