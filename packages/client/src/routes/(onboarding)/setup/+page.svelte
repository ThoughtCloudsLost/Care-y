<script lang="ts">
  import { Block, BlockTitle } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
</script>

<BlockTitle medium>{m.onboarding_setup_error()}</BlockTitle>
<Block>
  <p class="step-desc">
    {m.onboarding_setup_invalid_link()}
  </p>
</Block>
