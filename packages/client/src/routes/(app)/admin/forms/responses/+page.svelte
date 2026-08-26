<!--
  Intake form responses viewer route. Requires query param `id=<formId>`.
  Fetches the form name for the navbar, then renders the viewer component.
  Permission-gated: the server endpoint enforces VIEW_INTAKE_RESPONSES,
  and the entry point in IntakeFormsSection is hidden without the
  permission. This route page does not duplicate that check; the server
  is the security boundary. If a user navigates here without the
  permission, the query returns FORBIDDEN and QueryError renders.
-->
<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { Block } from "konsta/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { intakeFormKeys } from "$lib/query/keys.js";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import IntakeResponsesViewer from "$lib/components/admin/IntakeResponsesViewer.svelte";

  const intakeFormsRouter = requireRouter(trpc.intakeForms, "intakeForms");
  const navbarCtx = getNavbarOverrideCtx();

  const formId = $derived(page.url.searchParams.get("id"));

  // Fetch the form name for the navbar title
  const formQuery = createQuery(() => ({
    queryKey: intakeFormKeys.detail(formId ?? ""),
    queryFn: async () => intakeFormsRouter.get.query({ formId: formId ?? "" }),
    enabled: formId !== null,
  }));

  const formName = $derived(formQuery.data?.name ?? m.intake_responses_title());

  $effect(() => {
    navbarCtx.current = {
      title: formName,
    };
  });

  function backToList(): void {
    void goto(resolve("/admin/organization?tab=intake-forms"));
  }
</script>

{#if formId === null}
  <Block>
    <p class="irv-error">{m.error_generic()}</p>
    <button type="button" class="irv-back-link" onclick={backToList}>
      {m.common_cancel()}
    </button>
  </Block>
{:else}
  <IntakeResponsesViewer {formId} />
{/if}

<style>
  .irv-error {
    color: var(--danger);
    text-align: center;
    padding: var(--space-lg) 0;
  }

  .irv-back-link {
    display: block;
    margin: var(--space-md) auto 0;
    background: none;
    border: none;
    color: var(--brand-primary, var(--ink));
    cursor: pointer;
    font-size: var(--text-base);
    text-decoration: underline;
    padding: var(--space-sm);
    min-height: 44px;
  }
</style>
