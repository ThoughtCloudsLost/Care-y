<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import IntakeFormBody from "./IntakeFormBody.svelte";
</script>

<svelte:head>
  <title>{m.intake_title()}</title>
</svelte:head>

<IntakeFormBody />
