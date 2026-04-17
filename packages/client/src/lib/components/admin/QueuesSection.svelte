<script lang="ts">
  import { Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface QueuesSectionProps {
    readonly autoAction?: string | null;
  }

  let { autoAction = null }: QueuesSectionProps = $props();
</script>

<Block class="text-center text-[--muted]">
  {m.admin_queues_placeholder()}
</Block>
