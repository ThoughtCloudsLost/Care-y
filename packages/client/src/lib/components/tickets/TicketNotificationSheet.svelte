<!--
  Per-ticket notification channel sheet. Lets the viewer toggle push/email/sms
  per event type for a single ticket. Reads from the same preferences query
  as the settings page (one cache entry, one invalidation). Toggling writes
  ticket-scope overrides. "Reset to my defaults" deletes all ticket-scope rows.

  Visible only to watchers and assignees (gated in TicketPanelContent).
-->
<script lang="ts">
  import { Block } from "konsta/svelte";
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
  import { notificationKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import ToggleMatrix from "$lib/components/ToggleMatrix.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import {
    effectiveState,
    NOTIFICATION_CHANNELS,
  } from "$lib/components/settings/notification-preferences-utils.js";

  interface TicketNotificationSheetProps {
    opened: boolean;
    ondismiss: () => void;
    ticketId: string;
  }

  let { opened, ondismiss, ticketId }: TicketNotificationSheetProps = $props();

  const notificationsRouter = requireRouter(
    trpc.notifications,
    "notifications",
  );
  const queryClient = useQueryClient();

  /**
   * Event types relevant to a single ticket. The settings page shows all nine;
   * this sheet shows the six that can fire on a per-ticket basis.
   */
  const TICKET_EVENT_TYPES: readonly NotificationEventType[] = [
    "followup_added",
    "ticket_assigned",
    "ticket_closed",
    "ticket_reopened",
    "ticket_escalated",
    "mention",
  ] as const;

  // ---- i18n label maps (Map-based lookup, no record indexing) ----

  const EVENT_LABELS = new Map<NotificationEventType, () => string>([
    ["followup_added", () => m.notif_event_followup_added()],
    ["ticket_assigned", () => m.notif_event_ticket_assigned()],
    ["ticket_closed", () => m.notif_event_ticket_closed()],
    ["ticket_reopened", () => m.notif_event_ticket_reopened()],
    ["ticket_escalated", () => m.notif_event_ticket_escalated()],
    ["mention", () => m.notif_event_mention()],
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

  // ---- Query: same cache entry as the settings page ----

  const preferencesQuery = createQuery(() => ({
    queryKey: notificationKeys.preferences(),
    queryFn: async () => notificationsRouter.getPreferences.query(),
    enabled: opened,
  }));

  const rows = $derived(preferencesQuery.data?.preferences ?? []);
  const isLoading = $derived(preferencesQuery.isLoading);

  // ---- Mutations ----

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
      const msg = m.notif_ticket_pref_saved();
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

  const resetMutation = createMutation(() => ({
    mutationFn: async (input: {
      scopeType: "global" | "queue" | "ticket";
      scopeId: string | null;
    }) => notificationsRouter.resetPreferences.mutate(input),
    onSuccess: () => {
      haptic();
      const msg = m.notif_ticket_reset_success();
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

  const isMutating = $derived(
    setPreferenceMutation.isPending || resetMutation.isPending,
  );

  // ── ToggleMatrix column/row mapping ──

  const channelColumns = $derived(
    NOTIFICATION_CHANNELS.map((ch) => ({ id: ch, label: channelLabel(ch) })),
  );

  const ticketRows = $derived(
    TICKET_EVENT_TYPES.map((eventType) => ({
      id: eventType,
      label: eventLabel(eventType),
      cells: NOTIFICATION_CHANNELS.map((channel) => ({
        columnId: channel,
        checked: effectiveState(
          rows,
          { scopeType: "ticket" as const, scopeId: ticketId },
          eventType,
          channel,
        ),
        disabled: isMutating,
        ariaLabel: toggleAriaLabel(channel, eventType),
      })),
    })),
  );

  const loadingRows = $derived(
    TICKET_EVENT_TYPES.map((eventType) => ({
      id: eventType,
      label: eventLabel(eventType),
      cells: NOTIFICATION_CHANNELS.map((ch) => ({
        columnId: ch,
        checked: false,
        disabled: true,
        ariaLabel: toggleAriaLabel(ch, eventType),
      })),
    })),
  );

  function handleMatrixToggle(
    rowId: string,
    columnId: string,
    next: boolean,
  ): void {
    const eventType = TICKET_EVENT_TYPES.find((e) => e === rowId);
    const channel = NOTIFICATION_CHANNELS.find((c) => c === columnId);
    if (eventType === undefined || channel === undefined) return;
    handleToggle(eventType, channel, !next);
  }

  // ---- Handlers ----

  function handleToggle(
    eventType: NotificationEventType,
    channel: NotificationChannel,
    currentValue: boolean,
  ): void {
    setPreferenceMutation.mutate({
      scopeType: "ticket",
      scopeId: ticketId,
      eventType,
      channel,
      enabled: !currentValue,
    });
  }

  function handleReset(): void {
    resetMutation.mutate({
      scopeType: "ticket",
      scopeId: ticketId,
    });
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.notif_ticket_sheet_title(withTerms())}
  title={m.notif_ticket_sheet_title(withTerms())}
>
  <div class="sheet-body">
    {#if isLoading}
      <Block strong inset>
        <ToggleMatrix
          columns={channelColumns}
          rows={loadingRows}
          onToggle={() => undefined}
          ariaLabel={m.notif_ticket_sheet_title(withTerms())}
        />
      </Block>
    {:else if preferencesQuery.isError}
      <QueryError
        error={preferencesQuery.error}
        onretry={() => void preferencesQuery.refetch()}
      />
    {:else}
      <Block strong inset>
        <ToggleMatrix
          columns={channelColumns}
          rows={ticketRows}
          onToggle={handleMatrixToggle}
          ariaLabel={m.notif_ticket_sheet_title(withTerms())}
        />
      </Block>
      <div class="reset-row">
        <button
          type="button"
          class="touch-feedback reset-btn"
          disabled={isMutating}
          onclick={handleReset}
        >
          {m.notif_ticket_reset()}
        </button>
      </div>
    {/if}
  </div>
</ShellSheet>

<style>
  .sheet-body {
    padding: var(--space-md) 0;
  }

  .reset-row {
    padding: var(--space-md);
  }

  .reset-btn {
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

  .reset-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
</style>
