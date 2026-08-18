<!--
  Admin intake forms list section. Displays all forms with their name, field count,
  active state, and bound queue chips. Allows toggling active state and opening
  the editor for each form.
-->
<script lang="ts">
  import { List, ListItem, Toggle, Chip, Button, Block } from "konsta/svelte";
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { intakeFormKeys } from "$lib/query/keys.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { getErrorMessage } from "$lib/components/query-error-messages.js";
  import QueryError from "$lib/components/QueryError.svelte";

  interface IntakeFormsSectionProps {
    readonly onedit: (formId: string) => void;
    readonly oncreate: () => void;
  }

  let { onedit, oncreate }: IntakeFormsSectionProps = $props();

  const intakeFormsRouter = requireRouter(trpc.intakeForms, "intakeForms");
  const queryClient = useQueryClient();

  const formsQuery = createQuery(() => ({
    queryKey: intakeFormKeys.list(),
    queryFn: async () => {
      const result = await intakeFormsRouter.list.query();
      return result.forms;
    },
  }));

  const setActiveMutation = createMutation(() => ({
    mutationFn: async (input: { formId: string; active: boolean }) =>
      intakeFormsRouter.setActive.mutate(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: intakeFormKeys.all,
      });
    },
    onError: (err: unknown) => {
      toastStore.show(getErrorMessage(err));
    },
  }));
</script>

{#if formsQuery.isLoading}
  <List strong inset>
    <ListItem title="..." />
    <ListItem title="..." />
  </List>
{:else if formsQuery.isError}
  <QueryError error={formsQuery.error} />
{:else if formsQuery.data?.length === 0}
  <Block>
    <p class="empty-message">{m.intake_forms_empty()}</p>
  </Block>
{:else if formsQuery.data}
  <List strong inset>
    {#each formsQuery.data as form (form.id)}
      <ListItem
        title={form.name}
        subtitle={m.intake_forms_field_count({
          count: String(form.fieldCount),
        })}
        onclick={() => onedit(form.id)}
      >
        {#snippet after()}
          <div class="form-list-actions">
            {#each form.boundQueueIds as _queueId (_queueId)}
              <Chip outline>{_queueId.slice(0, 8)}</Chip>
            {/each}
            <Toggle
              checked={form.isActive}
              onChange={() =>
                setActiveMutation.mutate({
                  formId: form.id,
                  active: !form.isActive,
                })}
              aria-label={`${form.name} ${form.isActive ? m.intake_forms_active() : m.intake_forms_inactive()}`}
            />
          </div>
        {/snippet}
      </ListItem>
    {/each}
  </List>
{/if}

<Block>
  <Button outline onclick={oncreate}>
    {m.intake_forms_create()}
  </Button>
</Block>

<style>
  .form-list-actions {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 4px);
  }

  .empty-message {
    color: var(--muted);
    text-align: center;
    padding: var(--space-lg) 0;
  }
</style>
