<script lang="ts">
  import { Badge } from "konsta/svelte";
  import type { DisplayStatus } from "$lib/tickets/display-status.js";

  interface Props {
    status: DisplayStatus;
  }

  let { status }: Props = $props();

  const colorMap = new Map<DisplayStatus, string>([
    ["new", "bg-green-500"],
    ["active", "bg-primary"],
    ["hold", "bg-orange-400"],
    ["closed", "bg-black/30 dark:bg-white/30"],
  ]);

  const bg = $derived(colorMap.get(status) ?? "bg-black/30");
</script>

<Badge small colors={{ bg }} data-status={status} />
