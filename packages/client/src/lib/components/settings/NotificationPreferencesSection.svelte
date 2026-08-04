<script lang="ts">
  import {
    Block,
    BlockTitle,
    List,
    ListItem,
    Toggle,
    DialogButton,
  } from "konsta/svelte";
  import { DIALOG_DESTRUCTIVE_CLASS } from "$lib/components/shared/konsta-classes.js";
  import { SvelteSet } from "svelte/reactivity";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import type {
    NotificationChannel,
    NotificationEventType,
  } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { notificationKeys, queueKeys } from "$lib/query/keys.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import QueueGlyph from "$lib/components/shared/QueueGlyph.svelte";
  import { decryptQueueAppearance } from "$lib/utils/queue-appearance.js";
  import CollapsibleSection from "$lib/components/dashboard/CollapsibleSection.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import {
    effectiveGlobalState,
    effectiveQueueState,
    hasExplicitOverride,
    hasQueueOverrides,
    NOTIFICATION_EVENT_TYPES,
    NOTIFICATION_CHANNELS,
  } from "./notification-preferences-utils.js";

  const orgCache = getOrgDecryptCache();
  const queryClient = useQueryClient();
  const notificationsRouter = requireRouter(
    trpc.notifications,
    "notifications",
  );
  const ticketsRouter = requireRouter(trpc.tickets, "tickets");

  let expanded = $state(false);

  function toggleExpanded(): void {
    expanded = !expanded;
  }

  // ── Queries ──

  const preferencesQuery = createQuery(() => ({
    queryKey: notificationKeys.preferences(),
    queryFn: async () => notificationsRouter.getPreferences.query(),
    enabled: expanded,
  }));

  const queuesQuery = createQuery(() => ({
    queryKey: queueKeys.all,
    queryFn: async () => ticketsRouter.listQueues.query(),
    enabled: expanded,
  }));

  const rows = $derived(preferencesQuery.data?.preferences ?? []);
  const queues = $derived(queuesQuery.data ?? []);

  // ── Queue expansion ──

  const expandedQueueIds = new SvelteSet<string>();

  function toggleQueueExpand(queueId: string): void {
    if (expandedQueueIds.has(queueId)) {
      expandedQueueIds.delete(queueId);
    } else {
      expandedQueueIds.add(queueId);
    }
  }

  // ── Mutations ──

  const setPreferenceMutation = createMutation(() => ({
    mutationFn: async (input: {
      scopeType: "global" | "queue" | "ticket";
      scopeId: string | null;
      eventType: NotificationEventType;
      channel: NotificationChannel;
      enabled: boolean;
    }) => notificationsRouter.setPreference.mutate(input),
    onSuccess: () => {
      haptic();
      const msg = m.notif_pref_saved();
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.preferences(),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const resetPreferencesMutation = createMutation(() => ({
    mutationFn: async (input: {
      scopeType?: "global" | "queue" | "ticket";
      scopeId?: string | null;
    }) => notificationsRouter.resetPreferences.mutate(input),
    onSuccess: () => {
      haptic();
      const msg = m.notif_pref_reset_success();
      toastStore.show(msg);
      announceToLiveRegion("assertive", msg);
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.preferences(),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  // ── Toggle handlers ──

  function handleGlobalToggle(
    eventType: NotificationEventType,
    channel: NotificationChannel,
    currentValue: boolean,
  ): void {
    setPreferenceMutation.mutate({
      scopeType: "global",
      scopeId: null,
      eventType,
      channel,
      enabled: !currentValue,
    });
  }

  function handleQueueToggle(
    queueId: string,
    eventType: NotificationEventType,
    channel: NotificationChannel,
    currentValue: boolean,
  ): void {
    setPreferenceMutation.mutate({
      scopeType: "queue",
      scopeId: queueId,
      eventType,
      channel,
      enabled: !currentValue,
    });
  }

  // ── Reset dialogs ──

  let resetAllDialogOpen = $state(false);
  let resetQueueDialogOpen = $state(false);
  let resetQueueId = $state<string | null>(null);

  function openResetAllDialog(): void {
    resetAllDialogOpen = true;
  }

  function confirmResetAll(): void {
    resetAllDialogOpen = false;
    resetPreferencesMutation.mutate({});
  }

  function openResetQueueDialog(queueId: string): void {
    resetQueueId = queueId;
    resetQueueDialogOpen = true;
  }

  function confirmResetQueue(): void {
    resetQueueDialogOpen = false;
    if (resetQueueId !== null) {
      resetPreferencesMutation.mutate({
        scopeType: "queue",
        scopeId: resetQueueId,
      });
    }
  }

  // ── i18n helpers ──

  const EVENT_LABELS = new Map<NotificationEventType, () => string>([
    ["ticket_created", () => m.notif_event_ticket_created(withTerms())],
    ["ticket_assigned", () => m.notif_event_ticket_assigned()],
    ["ticket_closed", () => m.notif_event_ticket_closed()],
    ["ticket_reopened", () => m.notif_event_ticket_reopened()],
    ["ticket_escalated", () => m.notif_event_ticket_escalated()],
    ["followup_added", () => m.notif_event_followup_added()],
    ["mention", () => m.notif_event_mention()],
    ["merge_completed", () => m.notif_event_merge_completed()],
    ["voicemail_quarantined", () => m.notif_event_voicemail_quarantined()],
  ]);

  const CHANNEL_LABELS = new Map<NotificationChannel, () => string>([
    ["push", () => m.notif_channel_push()],
    ["email", () => m.notif_channel_email()],
    ["sms", () => m.notif_channel_sms()],
  ]);

  function eventLabel(eventType: NotificationEventType): string {
    return EVENT_LABELS.get(eventType)?.() ?? eventType;
  }

  function channelLabel(channel: NotificationChannel): string {
    return CHANNEL_LABELS.get(channel)?.() ?? channel;
  }

  function toggleAriaLabel(
    channel: NotificationChannel,
    eventType: NotificationEventType,
  ): string {
    return m.notif_toggle_aria({
      channel: channelLabel(channel),
      event: eventLabel(eventType),
    });
  }

  // ── Queue name helpers ──

  function decryptQueueName(queue: {
    id: string;
    encryptedName: string;
  }): string | null {
    return orgCache.decrypt(`queue:${queue.id}`, queue.encryptedName);
  }

  // Reset queue name for dialog title
  const resetQueueName = $derived.by((): string => {
    if (resetQueueId === null) return "";
    const queue = queues.find((q) => q.id === resetQueueId);
    if (queue === undefined) return "";
    return decryptQueueName(queue) ?? "";
  });

  const isLoading = $derived(preferencesQuery.isLoading);
  const isMutating = $derived(setPreferenceMutation.isPending);
</script>

<CollapsibleSection
  id="notifications"
  heading={m.notif_section_title()}
  {expanded}
  ontoggle={toggleExpanded}
>
  {#if isLoading}
    <Block strong inset>
      <div class="matrix">
        <div class="matrix-header">
          {#each NOTIFICATION_CHANNELS as channel (channel)}
            <span class="channel-label">{channelLabel(channel)}</span>
          {/each}
        </div>
        {#each NOTIFICATION_EVENT_TYPES as eventType (eventType)}
          <div class="matrix-row">
            <span class="event-label">{eventLabel(eventType)}</span>
            {#each NOTIFICATION_CHANNELS as ch (ch)}
              <span class="toggle-cell">
                <Toggle disabled />
              </span>
            {/each}
          </div>
        {/each}
      </div>
    </Block>
  {:else if preferencesQuery.isError}
    <QueryError
      error={preferencesQuery.error}
      onretry={() => void preferencesQuery.refetch()}
    />
  {:else}
    <Block strong inset>
      <div class="matrix">
        <div class="matrix-header">
          {#each NOTIFICATION_CHANNELS as channel (channel)}
            <span class="channel-label">{channelLabel(channel)}</span>
          {/each}
        </div>
        {#each NOTIFICATION_EVENT_TYPES as eventType (eventType)}
          {@const evLabel = eventLabel(eventType)}
          <div class="matrix-row">
            <span class="event-label" title={evLabel}>{evLabel}</span>
            {#each NOTIFICATION_CHANNELS as channel (channel)}
              {@const checked = effectiveGlobalState(rows, eventType, channel)}
              <span class="toggle-cell">
                <Toggle
                  {checked}
                  disabled={isMutating}
                  onchange={() =>
                    handleGlobalToggle(eventType, channel, checked)}
                  aria-label={toggleAriaLabel(channel, eventType)}
                />
              </span>
            {/each}
          </div>
        {/each}
      </div>
      <p class="explainer">{m.notif_sse_always_on()}</p>
    </Block>

    <!-- Queue overrides -->
    <BlockTitle>{m.notif_queue_overrides_title()}</BlockTitle>

    {#if queuesQuery.isLoading}
      <Block strong inset>
        <p class="explainer">{m.common_loading()}</p>
      </Block>
    {:else if queuesQuery.isError}
      <QueryError
        error={queuesQuery.error}
        onretry={() => void queuesQuery.refetch()}
      />
    {:else if queues.length === 0}
      <Block strong inset>
        <p class="explainer">{m.notif_no_queues()}</p>
      </Block>
    {:else}
      <List strong inset>
        {#each queues as queue (queue.id)}
          {@const queueName = decryptQueueName(queue)}
          {@const queueExpanded = expandedQueueIds.has(queue.id)}
          <ListItem
            link
            onclick={() => toggleQueueExpand(queue.id)}
            aria-expanded={queueExpanded}
          >
            {#snippet media()}
              <QueueGlyph
                appearance={decryptQueueAppearance(orgCache, queue)}
                size={15}
              />
            {/snippet}
            {#snippet title()}
              <DecryptPlaceholder content={queueName} length={14} />
            {/snippet}
          </ListItem>

          {#if queueExpanded}
            <li class="queue-matrix-wrapper">
              <Block>
                <div class="matrix">
                  <div class="matrix-header">
                    {#each NOTIFICATION_CHANNELS as channel (channel)}
                      <span class="channel-label">{channelLabel(channel)}</span>
                    {/each}
                  </div>
                  {#each NOTIFICATION_EVENT_TYPES as eventType (eventType)}
                    {@const evLabel = eventLabel(eventType)}
                    <div class="matrix-row">
                      <span class="event-label" title={evLabel}>{evLabel}</span>
                      {#each NOTIFICATION_CHANNELS as channel (channel)}
                        {@const cellChecked = effectiveQueueState(
                          rows,
                          queue.id,
                          eventType,
                          channel,
                        )}
                        {@const isOverridden = hasExplicitOverride(
                          rows,
                          "queue",
                          queue.id,
                          eventType,
                          channel,
                        )}
                        <span class="toggle-cell">
                          <Toggle
                            checked={cellChecked}
                            disabled={isMutating}
                            onchange={() =>
                              handleQueueToggle(
                                queue.id,
                                eventType,
                                channel,
                                cellChecked,
                              )}
                            aria-label={toggleAriaLabel(channel, eventType)}
                          />
                          {#if isOverridden}
                            <span class="override-marker"
                              >{m.notif_override_edited()}</span
                            >
                          {/if}
                        </span>
                      {/each}
                    </div>
                  {/each}
                </div>
                <button
                  type="button"
                  class="touch-feedback reset-queue-btn"
                  disabled={!hasQueueOverrides(rows, queue.id)}
                  onclick={() => openResetQueueDialog(queue.id)}
                >
                  {m.notif_clear_queue_overrides()}
                </button>
              </Block>
            </li>
          {/if}
        {/each}
      </List>
    {/if}

    <div class="reset-all-row">
      <button
        type="button"
        class="touch-feedback reset-all-btn"
        onclick={openResetAllDialog}
      >
        {m.notif_reset_all()}
      </button>
    </div>
  {/if}
</CollapsibleSection>

<!-- Reset all dialog -->
<ShellDialog
  opened={resetAllDialogOpen}
  ondismiss={() => (resetAllDialogOpen = false)}
  title={m.notif_reset_all_title()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">{m.notif_reset_all_confirm()}</p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={() => (resetAllDialogOpen = false)}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton
      strong
      class={DIALOG_DESTRUCTIVE_CLASS}
      onclick={confirmResetAll}
    >
      {m.notif_reset_all_action()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<!-- Reset queue overrides dialog -->
<ShellDialog
  opened={resetQueueDialogOpen}
  ondismiss={() => (resetQueueDialogOpen = false)}
  title={m.notif_clear_queue_title()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {m.notif_clear_queue_confirm({ queue: resetQueueName })}
    </p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={() => (resetQueueDialogOpen = false)}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton
      strong
      class={DIALOG_DESTRUCTIVE_CLASS}
      onclick={confirmResetQueue}
    >
      {m.notif_clear_queue_action()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  .matrix {
    display: grid;
    grid-template-columns: 1fr repeat(3, 52px);
    gap: 0;
    align-items: center;
  }

  .matrix-header {
    display: contents;
  }

  .matrix-header::before {
    content: "";
  }

  .channel-label {
    font-size: 0.75rem;
    color: var(--muted);
    text-align: center;
    padding-bottom: var(--space-sm);
    font-weight: 500;
  }

  .matrix-row {
    display: contents;
  }

  .event-label {
    font-size: 0.875rem;
    color: var(--ink);
    padding: var(--space-sm) 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    border-top: 1px solid var(--hair);
  }

  .toggle-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-sm) 0;
    border-top: 1px solid var(--hair);
    min-height: 44px;
  }

  .override-marker {
    font-size: 0.625rem;
    color: var(--muted);
    margin-top: 2px;
  }

  .explainer {
    font-size: 0.8125rem;
    color: var(--muted);
    margin-top: var(--space-sm);
  }

  .queue-matrix-wrapper {
    list-style: none;
    padding: 0 var(--space-md);
  }

  .reset-queue-btn {
    display: block;
    width: 100%;
    text-align: center;
    font-size: 0.8125rem;
    color: var(--danger);
    padding: var(--space-md) 0;
    background: none;
    border: none;
    cursor: pointer;
  }

  .reset-queue-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .reset-all-row {
    padding: var(--space-md) var(--space-md);
  }

  .reset-all-btn {
    display: block;
    width: 100%;
    text-align: center;
    font-size: 0.875rem;
    color: var(--danger);
    padding: var(--space-md) 0;
    background: none;
    border: none;
    cursor: pointer;
  }
</style>
