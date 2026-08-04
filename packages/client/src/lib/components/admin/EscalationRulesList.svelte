<script lang="ts">
  import {
    Block,
    BlockTitle,
    List,
    ListItem,
    ListInput,
    Toggle,
    Button,
  } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { adminKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { requireRouter } from "$lib/errors.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";

  interface EscalationRulesListProps {
    readonly queueId: string;
    /** Called when a rule delete needs a ShellDialog confirm in the host. */
    readonly ondeleterule: (ruleId: string, label: string) => void;
  }

  let { queueId, ondeleterule }: EscalationRulesListProps = $props();

  const escalationRouter = requireRouter(trpc.escalation, "escalation");
  const queryClient = useQueryClient();

  // ---- Query ----

  const rulesQuery = createQuery(() => ({
    queryKey: adminKeys.escalationRules(queueId),
    queryFn: async () => escalationRouter.list.query({ queueId }),
  }));

  type RuleRecord = NonNullable<typeof rulesQuery.data>["rules"][number];

  // ---- Add-form state ----

  let showAddForm = $state(false);
  let formRuleType = $state("unassigned_duration");
  let formThresholdValue = $state("2");
  let formThresholdUnit = $state("days");
  let formAction = $state("notify_managers");

  function resetForm(): void {
    formRuleType = "unassigned_duration";
    formThresholdValue = "2";
    formThresholdUnit = "days";
    formAction = "notify_managers";
  }

  function thresholdToMinutes(value: string, unit: string): number {
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 1) return 0;
    if (unit === "days") return num * 24 * 60;
    return num * 60; // hours
  }

  function minutesToDisplay(minutes: number): string {
    if (minutes >= 1440 && minutes % 1440 === 0) {
      const days = minutes / 1440;
      return m.escalation_threshold_days({ count: days });
    }
    const hours = Math.round(minutes / 60);
    return m.escalation_threshold_hours({ count: hours < 1 ? 1 : hours });
  }

  function ruleTypeLabel(ruleType: string): string {
    if (ruleType === "unassigned_duration") {
      return m.escalation_condition_unassigned();
    }
    return m.escalation_condition_inactive();
  }

  function actionLabel(action: string): string {
    if (action === "notify_managers") {
      return m.escalation_action_notify_managers();
    }
    return m.escalation_action_notify_watchers();
  }

  function ruleTitle(rule: RuleRecord): string {
    return `${ruleTypeLabel(rule.ruleType)} ${minutesToDisplay(rule.thresholdMinutes)}`;
  }

  // ---- Mutations ----

  const createMut = createMutation(() => ({
    mutationFn: async (input: {
      queueId: string;
      ruleType: "unassigned_duration" | "inactive_duration";
      thresholdMinutes: number;
      action: "notify_managers" | "notify_queue_watchers";
    }) => escalationRouter.create.mutate(input),
    onSuccess: () => {
      haptic();
      toastStore.show(m.escalation_rule_created());
      announceToLiveRegion("polite", m.escalation_rule_created());
      void queryClient.invalidateQueries({
        queryKey: adminKeys.escalationRules(queueId),
      });
      showAddForm = false;
      resetForm();
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const updateMut = createMutation(() => ({
    mutationFn: async (input: {
      ruleId: string;
      isActive?: boolean;
      thresholdMinutes?: number;
      action?: "notify_managers" | "notify_queue_watchers";
    }) => escalationRouter.update.mutate(input),
    onSuccess: () => {
      haptic();
      toastStore.show(m.escalation_rule_updated());
      announceToLiveRegion("polite", m.escalation_rule_updated());
      void queryClient.invalidateQueries({
        queryKey: adminKeys.escalationRules(queueId),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const deleteMut = createMutation(() => ({
    mutationFn: async (input: { ruleId: string }) =>
      escalationRouter.remove.mutate(input),
    onSuccess: () => {
      haptic();
      toastStore.show(m.escalation_rule_deleted());
      announceToLiveRegion("assertive", m.escalation_rule_deleted());
      void queryClient.invalidateQueries({
        queryKey: adminKeys.escalationRules(queueId),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const isPending = $derived(
    createMut.isPending || updateMut.isPending || deleteMut.isPending,
  );

  function handleToggleActive(rule: RuleRecord): void {
    if (isPending) return;
    updateMut.mutate({ ruleId: rule.id, isActive: !rule.isActive });
  }

  function handleAddSubmit(): void {
    const minutes = thresholdToMinutes(formThresholdValue, formThresholdUnit);
    if (minutes < 5) {
      toastStore.show(m.escalation_threshold_too_low());
      return;
    }
    createMut.mutate({
      queueId,
      ruleType:
        formRuleType === "inactive_duration"
          ? "inactive_duration"
          : "unassigned_duration",
      thresholdMinutes: minutes,
      action:
        formAction === "notify_queue_watchers"
          ? "notify_queue_watchers"
          : "notify_managers",
    });
  }

  /** Exposed for the host to call after ShellDialog confirms. */
  export function confirmDelete(ruleId: string): void {
    deleteMut.mutate({ ruleId });
  }
</script>

<BlockTitle class="escalation-section-title">
  {m.escalation_section_title()}
</BlockTitle>
<p class="escalation-explainer">
  {m.escalation_explainer()}
</p>

{#if rulesQuery.isLoading}
  <List inset strong>
    <ListItem>
      <InlineSkeleton width="18ch" />
    </ListItem>
    <ListItem>
      <InlineSkeleton width="14ch" />
    </ListItem>
  </List>
{:else if rulesQuery.isError}
  <QueryError
    error={rulesQuery.error}
    onretry={() => void rulesQuery.refetch()}
  />
{:else if rulesQuery.data?.rules.length === 0 && !showAddForm}
  <p class="empty-state">{m.escalation_empty()}</p>
{:else}
  <List inset strong>
    {#each rulesQuery.data?.rules ?? [] as rule (rule.id)}
      <ListItem title={ruleTitle(rule)}>
        {#snippet after()}
          <div class="rule-after">
            <span class="rule-action-label">{actionLabel(rule.action)}</span>
            <Toggle
              checked={rule.isActive}
              disabled={isPending}
              onchange={() => handleToggleActive(rule)}
            />
            <button
              type="button"
              class="delete-rule-btn"
              disabled={isPending}
              aria-label={m.escalation_delete_aria({ rule: ruleTitle(rule) })}
              onclick={() => ondeleterule(rule.id, ruleTitle(rule))}
            >
              {m.escalation_delete_button()}
            </button>
          </div>
        {/snippet}
      </ListItem>
    {/each}
  </List>
{/if}

{#if showAddForm}
  <div class="add-form" role="group" aria-label={m.escalation_add_form_label()}>
    <List inset strong>
      <ListInput
        type="select"
        label={m.escalation_condition_label()}
        value={formRuleType}
        onchange={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLSelectElement) {
            formRuleType = target.value;
          }
        }}
      >
        <option value="unassigned_duration">
          {m.escalation_condition_unassigned()}
        </option>
        <option value="inactive_duration">
          {m.escalation_condition_inactive()}
        </option>
      </ListInput>

      <ListInput
        type="number"
        label={m.escalation_threshold_label()}
        value={formThresholdValue}
        min={1}
        onchange={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLInputElement) {
            formThresholdValue = target.value;
          }
        }}
      />

      <ListInput
        type="select"
        label={m.escalation_unit_label()}
        value={formThresholdUnit}
        onchange={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLSelectElement) {
            formThresholdUnit = target.value;
          }
        }}
      >
        <option value="hours">{m.escalation_unit_hours()}</option>
        <option value="days">{m.escalation_unit_days()}</option>
      </ListInput>

      <ListInput
        type="select"
        label={m.escalation_action_label()}
        value={formAction}
        onchange={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLSelectElement) {
            formAction = target.value;
          }
        }}
      >
        <option value="notify_managers">
          {m.escalation_action_notify_managers()}
        </option>
        <option value="notify_queue_watchers">
          {m.escalation_action_notify_watchers()}
        </option>
      </ListInput>
    </List>

    <div class="form-actions">
      <Button
        outline
        disabled={isPending}
        onclick={() => {
          showAddForm = false;
          resetForm();
        }}
      >
        {m.common_cancel()}
      </Button>
      <Button disabled={isPending} onclick={handleAddSubmit}>
        {m.escalation_save_button()}
      </Button>
    </div>
  </div>
{/if}

{#if !showAddForm && rulesQuery.isSuccess}
  <div class="add-rule-action">
    <button
      type="button"
      class="add-rule-btn"
      disabled={isPending}
      onclick={() => (showAddForm = true)}
    >
      {m.escalation_add_rule()}
    </button>
  </div>
{/if}

<style>
  .escalation-explainer {
    font-size: var(--text-xs);
    color: var(--muted);
    margin: 0 var(--k-block-padding-horizontal);
    padding-bottom: var(--space-sm);
    line-height: 1.4;
  }

  .empty-state {
    font-size: var(--text-sm);
    color: var(--muted);
    text-align: center;
    padding: var(--space-md) var(--k-block-padding-horizontal);
    margin: 0;
  }

  .rule-after {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .rule-action-label {
    font-size: var(--text-xs);
    color: var(--muted);
    white-space: nowrap;
  }

  .delete-rule-btn {
    border: none;
    background: none;
    color: var(--danger, var(--color-red-500));
    font-size: var(--text-xs);
    font-weight: 600;
    cursor: pointer;
    padding: 4px 8px;
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .delete-rule-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .delete-rule-btn:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
    border-radius: 4px;
  }

  .form-actions {
    display: flex;
    gap: var(--space-sm);
    justify-content: flex-end;
    padding: var(--space-sm) var(--k-block-padding-horizontal);
  }

  .add-rule-action {
    padding: var(--space-sm) var(--k-block-padding-horizontal);
  }

  .add-rule-btn {
    display: block;
    width: 100%;
    padding: 0.625rem;
    border: none;
    background: none;
    color: var(--brand-text);
    font-size: var(--text-sm);
    font-weight: 600;
    text-align: center;
    cursor: pointer;
  }

  .add-rule-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .add-rule-btn:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
    border-radius: 4px;
  }
</style>
