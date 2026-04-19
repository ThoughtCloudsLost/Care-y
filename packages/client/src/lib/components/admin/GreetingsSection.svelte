<script lang="ts">
  import { Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
</script>

<div class="greetings-section">
  <Block class="text-center text-[--muted]">
    {m.admin_greetings_placeholder()}
  </Block>
</div>

<style>
  .greetings-section {
    padding: 2rem 0;
  }
</style>
