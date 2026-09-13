<script lang="ts">
  import { page } from "$app/state";
  import * as m from "$lib/paraglide/messages.js";
  import IntakeFormBody from "../IntakeFormBody.svelte";

  const slug = $derived(page.params.slug);
</script>

<svelte:head>
  <title>{m.intake_title()}</title>
</svelte:head>

<IntakeFormBody {slug} />
