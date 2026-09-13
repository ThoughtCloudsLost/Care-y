<!--
  Admin channel policy section: five toggle rows controlling which
  communication channels are available to volunteers. Each toggle
  fires a single-flag partial mutation so changes are atomic and
  independent.

  Anatomy mirrors IntakeFormsSection toggle rows (icon + label +
  conditional off-hint + Konsta Toggle with explicit aria-label).
-->
<script lang="ts">
  import { Card, Toggle } from "konsta/svelte";
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { MessageSquare, Mail, Link2, Phone, Share2 } from "@lucide/svelte";
  import type { UpdateChannelPolicyInput } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { adminKeys, ticketKeys, ticketsKeys } from "$lib/query/keys.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { getErrorMessage } from "$lib/components/query-error-messages.js";
  import { haptic } from "$lib/utils/haptic.js";

  const orgRouter = requireRouter(trpc.org, "org");
  const queryClient = useQueryClient();

  const policyQuery = createQuery(() => ({
    queryKey: adminKeys.channelPolicy(),
    queryFn: async () => orgRouter.getChannelPolicy.query(),
  }));

  const smsEnabled = $derived(policyQuery.data?.smsEnabled ?? true);
  const emailEnabled = $derived(policyQuery.data?.emailEnabled ?? true);
  const secureLinkEnabled = $derived(
    policyQuery.data?.secureLinkEnabled ?? true,
  );
  const voiceEnabled = $derived(policyQuery.data?.voiceEnabled ?? true);
  const shareLinkEnabled = $derived(policyQuery.data?.shareLinkEnabled ?? true);

  const updateMutation = createMutation(() => ({
    mutationFn: async (input: UpdateChannelPolicyInput) =>
      orgRouter.updateChannelPolicy.mutate(input),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_channel_policy_saved());
      announceToLiveRegion("polite", m.admin_channel_policy_saved());
      void queryClient.invalidateQueries({
        queryKey: adminKeys.channelPolicy(),
      });
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.everyDetail,
      });
      void queryClient.invalidateQueries({
        queryKey: ticketsKeys.lists(),
      });
    },
    onError: (err: unknown) => {
      toastStore.show(getErrorMessage(err), 3000);
    },
  }));

  const isMutating = $derived(updateMutation.isPending);
</script>

<Card raised contentWrap={false} class="cps-card">
  <div class="cps-card-inner">
    <p class="section-desc">{m.admin_channel_policy_subtitle()}</p>

    <div class="cps-row">
      <span class="cps-row-label">
        <MessageSquare size={16} aria-hidden="true" class="cps-cfg-icon" />
        <span class="cps-row-text">
          <span>{m.admin_channel_sms_label()}</span>
          {#if !smsEnabled}
            <span class="cps-row-sub">
              {m.admin_channel_sms_off_hint()}
            </span>
          {/if}
        </span>
      </span>
      <Toggle
        checked={smsEnabled}
        disabled={isMutating}
        onChange={() => updateMutation.mutate({ smsEnabled: !smsEnabled })}
        aria-label={m.admin_channel_sms_label()}
      />
    </div>

    <div class="cps-row">
      <span class="cps-row-label">
        <Mail size={16} aria-hidden="true" class="cps-cfg-icon" />
        <span class="cps-row-text">
          <span>{m.admin_channel_email_label()}</span>
          {#if !emailEnabled}
            <span class="cps-row-sub">
              {m.admin_channel_email_off_hint()}
            </span>
          {/if}
        </span>
      </span>
      <Toggle
        checked={emailEnabled}
        disabled={isMutating}
        onChange={() => updateMutation.mutate({ emailEnabled: !emailEnabled })}
        aria-label={m.admin_channel_email_label()}
      />
    </div>

    <div class="cps-row">
      <span class="cps-row-label">
        <Link2 size={16} aria-hidden="true" class="cps-cfg-icon" />
        <span class="cps-row-text">
          <span>{m.admin_channel_secure_link_label()}</span>
          {#if !secureLinkEnabled}
            <span class="cps-row-sub">
              {m.admin_channel_secure_link_off_hint()}
            </span>
          {/if}
        </span>
      </span>
      <Toggle
        checked={secureLinkEnabled}
        disabled={isMutating}
        onChange={() =>
          updateMutation.mutate({ secureLinkEnabled: !secureLinkEnabled })}
        aria-label={m.admin_channel_secure_link_label()}
      />
    </div>

    <div class="cps-row">
      <span class="cps-row-label">
        <Phone size={16} aria-hidden="true" class="cps-cfg-icon" />
        <span class="cps-row-text">
          <span>{m.admin_channel_voice_label()}</span>
          {#if !voiceEnabled}
            <span class="cps-row-sub">
              {m.admin_channel_voice_off_hint()}
            </span>
          {/if}
        </span>
      </span>
      <Toggle
        checked={voiceEnabled}
        disabled={isMutating}
        onChange={() => updateMutation.mutate({ voiceEnabled: !voiceEnabled })}
        aria-label={m.admin_channel_voice_label()}
      />
    </div>

    <div class="cps-row">
      <span class="cps-row-label">
        <Share2 size={16} aria-hidden="true" class="cps-cfg-icon" />
        <span class="cps-row-text">
          <span>{m.admin_channel_share_link_label()}</span>
          {#if !shareLinkEnabled}
            <span class="cps-row-sub">
              {m.admin_channel_share_link_off_hint()}
            </span>
          {/if}
        </span>
      </span>
      <Toggle
        checked={shareLinkEnabled}
        disabled={isMutating}
        onChange={() =>
          updateMutation.mutate({ shareLinkEnabled: !shareLinkEnabled })}
        aria-label={m.admin_channel_share_link_label()}
      />
    </div>
  </div>
</Card>

<style>
  :global(.cps-card) {
    margin: var(--space-sm) var(--space-md) !important;
  }

  .cps-card-inner {
    padding: var(--space-md) var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .section-desc {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
    margin-bottom: var(--space-sm);
  }

  .cps-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    padding: 0.5rem 0;
    min-height: 2.5rem;
  }

  .cps-row-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .cps-row-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .cps-row-sub {
    font-size: 0.6875rem;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :global(.cps-cfg-icon) {
    flex-shrink: 0;
    color: var(--brand-accent, var(--brand-text));
  }
</style>
