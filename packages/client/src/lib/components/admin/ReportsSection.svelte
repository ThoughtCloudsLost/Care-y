<script lang="ts">
  import { Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
</script>

<div class="reports-section">
  <Block class="text-center text-[--muted]">
    {m.admin_reports_placeholder()}
  </Block>
</div>

<style>
  .reports-section {
    padding: 2rem 0;
  }
</style>
