<!--
  Admin intake forms list section. Displays all forms with their name, field count,
  active state, slug, destination queue, and default flag. Allows toggling active
  state and opening the editor for each form. Includes the org-wide web-intake
  enable toggle.
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
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import QueryError from "$lib/components/QueryError.svelte";

  interface IntakeFormsSectionProps {
    readonly onedit: (formId: string) => void;
    readonly oncreate: () => void;
  }

  let { onedit, oncreate }: IntakeFormsSectionProps = $props();

  const intakeFormsRouter = requireRouter(trpc.intakeForms, "intakeForms");
  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const queryClient = useQueryClient();
  const orgCache = getOrgDecryptCache();

  const formsQuery = createQuery(() => ({
    queryKey: intakeFormKeys.list(),
    queryFn: async () => {
      const result = await intakeFormsRouter.list.query();
      return result.forms;
    },
  }));

  // Queue list for resolving destination queue names
  const queuesQuery = createQuery(() => ({
    queryKey: ["queues"] as const,
    queryFn: async () => ticketRouter.listQueues.query(),
  }));

  function getQueueName(queueId: string): string {
    const queues = queuesQuery.data;
    if (!queues) return queueId.slice(0, 8);
    const queue = queues.find((q: { id: string }) => q.id === queueId);
    if (!queue) return queueId.slice(0, 8);
    return (
      orgCache.decrypt(`queue:${queue.id}`, queue.encryptedName) ??
      queueId.slice(0, 8)
    );
  }

  // Web intake enabled toggle
  const webIntakeQuery = createQuery(() => ({
    queryKey: [...intakeFormKeys.all, "webIntakeEnabled"] as const,
    queryFn: async () => {
      const result = await intakeFormsRouter.getWebIntakeEnabled.query();
      return result.enabled;
    },
  }));

  const webIntakeEnabled = $derived(webIntakeQuery.data ?? true);

  const webIntakeToggleMutation = createMutation(() => ({
    mutationFn: async (enabled: boolean) =>
      intakeFormsRouter.setWebIntakeEnabled.mutate({ enabled }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: intakeFormKeys.all,
      });
    },
    onError: (err: unknown) => {
      toastStore.show(getErrorMessage(err));
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

<!-- Web intake enable toggle -->
<List strong inset>
  <ListItem title={m.intake_forms_web_intake_enabled()}>
    {#snippet after()}
      <Toggle
        checked={webIntakeEnabled}
        onChange={() => webIntakeToggleMutation.mutate(!webIntakeEnabled)}
      />
    {/snippet}
  </ListItem>
</List>
{#if !webIntakeEnabled}
  <Block>
    <p class="disabled-hint">{m.intake_forms_web_intake_disabled_hint()}</p>
  </Block>
{/if}

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
            {#if form.isDefault}
              <Chip outline>{m.intake_forms_default_toggle()}</Chip>
            {/if}
            {#if form.slug}
              <Chip outline>/{form.slug}</Chip>
            {/if}
            {#if form.destinationQueueId}
              <Chip outline>{getQueueName(form.destinationQueueId)}</Chip>
            {/if}
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

  .disabled-hint {
    color: var(--muted);
    font-size: var(--text-sm);
    font-style: italic;
  }
</style>
