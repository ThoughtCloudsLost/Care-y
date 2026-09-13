<script lang="ts">
  import { page } from "$app/state";
  import * as m from "$lib/paraglide/messages.js";
  import IntakeFormBody from "../IntakeFormBody.svelte";
  import { uiLocaleStore } from "$lib/stores/ui-locale.svelte.js";

  const slug = $derived(page.params.slug);

  // Locale-reactive title (the read establishes a $derived dependency)
  const pageTitle = $derived.by((): string => {
    void uiLocaleStore.locale;
    return m.intake_title();
  });
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

{#key uiLocaleStore.locale}
  <IntakeFormBody {slug} />
{/key}
