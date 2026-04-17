<script lang="ts">
  import { Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
</script>

<div class="retention-section">
  <Block class="text-center text-[--muted]">
    {m.admin_retention_placeholder()}
  </Block>
</div>

<style>
  .retention-section {
    padding: 2rem 0;
  }
</style>
