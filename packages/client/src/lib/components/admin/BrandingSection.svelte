<script lang="ts">
  import { Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
</script>

<div class="branding-section">
  <Block class="text-center text-[--muted]">
    {m.admin_branding_placeholder()}
  </Block>
</div>

<style>
  .branding-section {
    padding: 2rem 0;
  }
</style>
