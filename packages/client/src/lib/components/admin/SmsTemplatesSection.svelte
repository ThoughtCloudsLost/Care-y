<script lang="ts">
  import { Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
</script>

<div class="templates-section">
  <Block class="text-center text-[--muted]">
    {m.admin_templates_placeholder()}
  </Block>
</div>

<style>
  .templates-section {
    padding: 2rem 0;
  }
</style>
