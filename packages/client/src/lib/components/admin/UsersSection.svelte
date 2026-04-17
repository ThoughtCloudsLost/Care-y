<script lang="ts">
  import { Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface UsersSectionProps {
    readonly autoAction?: string | null;
  }

  let { autoAction = null }: UsersSectionProps = $props();
</script>

<Block class="text-center text-[--muted]">
  {m.admin_users_placeholder()}
</Block>
