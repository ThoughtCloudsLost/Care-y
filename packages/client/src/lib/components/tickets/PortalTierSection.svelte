<!--
  Tier section inside TicketPanelContent: shows how the client
  receives messages (SMS/Email or Secure Link) with tier-appropriate
  actions (set up, regenerate, revoke).

  Plaintext metadata only (tier, channel dates): uses InlineSkeleton
  while the query loads, never DecryptPlaceholder.
-->
<script lang="ts">
  import { Block, BlockTitle, Button, Chip, Toggle } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import { DialogButton } from "konsta/svelte";
  import { DIALOG_DESTRUCTIVE_CLASS } from "$lib/components/shared/konsta-classes.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { ticketKeys } from "$lib/query/keys.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import SecureLinkSheet from "./SecureLinkSheet.svelte";

  export interface PortalChannelWire {
    clientPublic: string;
    hasPassphrase: boolean;
    createdAt: string;
    lastSeenAt: string | null;
    kind: string;
    accountOffer: boolean;
  }

  interface PortalTierSectionProps {
    ticketId: string;
    clientTier: string | undefined;
    portalChannel: PortalChannelWire | null | undefined;
    clientPhone: string | null | undefined;
    isLoading: boolean;
  }

  let {
    ticketId,
    clientTier,
    portalChannel,
    clientPhone,
    isLoading,
  }: PortalTierSectionProps = $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const queryClient = useQueryClient();

  // --- Sheet state ---

  let secureLinkSheetOpen = $state(false);
  let secureLinkMode = $state<"setup" | "regenerate">("setup");
  let revokeDialogOpen = $state(false);
  let revoking = $state(false);

  const isSecureLink = $derived(
    clientTier === "secure_link" && portalChannel?.kind === "secure_link",
  );
  const isContinuation = $derived(
    clientTier === "secure_link" &&
      portalChannel?.kind === "intake_continuation",
  );
  const isAccount = $derived(
    clientTier === "account" && portalChannel?.kind === "account",
  );

  function openSetup(): void {
    secureLinkMode = "setup";
    secureLinkSheetOpen = true;
  }

  function openRegenerate(): void {
    secureLinkMode = "regenerate";
    secureLinkSheetOpen = true;
  }

  function openRevokeDialog(): void {
    revokeDialogOpen = true;
  }

  async function handleRevoke(): Promise<void> {
    if (revoking) return;
    revoking = true;
    try {
      await ticketRouter.revokeSecureLink.mutate({ ticketId });
      revokeDialogOpen = false;
      haptic();
      toastStore.show(m.ticket_toast_tier_updated());
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(ticketId),
      });
    } catch (_err: unknown) {
      // Intentional discard: mutation error only, no decrypted content.
      toastStore.show(m.error_generic(), 3000);
    } finally {
      revoking = false;
    }
  }

  function handleSheetDismiss(): void {
    secureLinkSheetOpen = false;
  }

  function handleUpgradeSuccess(): void {
    haptic();
    toastStore.show(m.ticket_toast_tier_updated());
    void queryClient.invalidateQueries({
      queryKey: ticketKeys.detail(ticketId),
    });
  }

  // --- Account offer toggle ---

  let offerUpdating = $state(false);

  async function handleOfferToggle(): Promise<void> {
    if (offerUpdating || !portalChannel) return;
    offerUpdating = true;
    try {
      await ticketRouter.setAccountOffer.mutate({
        ticketId,
        enabled: !portalChannel.accountOffer,
      });
      haptic();
      toastStore.show(m.ticket_toast_offer_updated());
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(ticketId),
      });
    } catch (_err: unknown) {
      // Intentional discard: mutation error only, no decrypted content.
      toastStore.show(m.error_generic(), 3000);
    } finally {
      offerUpdating = false;
    }
  }

  // --- Account reset ---

  let resetDialogOpen = $state(false);
  let resetting = $state(false);

  function openResetDialog(): void {
    resetDialogOpen = true;
  }

  async function handleReset(): Promise<void> {
    if (resetting) return;
    resetting = true;
    try {
      await ticketRouter.resetClientAccount.mutate({ ticketId });
      resetDialogOpen = false;
      haptic();
      toastStore.show(m.ticket_toast_account_reset());
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(ticketId),
      });
    } catch (_err: unknown) {
      // Intentional discard: mutation error only, no decrypted content.
      toastStore.show(m.error_generic(), 3000);
    } finally {
      resetting = false;
    }
  }
</script>

<BlockTitle class="!mt-6 !-mb-2">{m.ticket_tier_label()}</BlockTitle>

{#if isLoading}
  <Block class="!my-3">
    <p><InlineSkeleton width="10ch" /></p>
    <p><InlineSkeleton width="18ch" /></p>
  </Block>
{:else if isSecureLink && portalChannel}
  <Block class="!my-3">
    <p class="tier-name">
      {m.ticket_tier_secure_link()}
      {#if portalChannel.hasPassphrase}
        <Chip class="passphrase-chip" outline>
          {m.ticket_tier_passphrase_toggle()}
        </Chip>
      {/if}
    </p>
    <p class="tier-meta">
      <span>{formatRelativeTime(new Date(portalChannel.createdAt))}</span>
      {#if portalChannel.lastSeenAt}
        <span class="meta-sep" aria-hidden="true"></span>
        <span>{formatRelativeTime(new Date(portalChannel.lastSeenAt))}</span>
      {/if}
    </p>
    <div class="offer-row">
      <span class="offer-label">{m.ticket_tier_offer_toggle()}</span>
      <Toggle
        checked={portalChannel.accountOffer}
        disabled={offerUpdating}
        onchange={() => void handleOfferToggle()}
        aria-label={m.ticket_tier_offer_toggle()}
      />
    </div>
    <p class="offer-hint">{m.ticket_tier_offer_hint(withTerms())}</p>
    <div class="tier-actions">
      <Button small outline onclick={openRegenerate}>
        {m.ticket_tier_regenerate()}
      </Button>
      <Button small outline class="tier-revoke-btn" onclick={openRevokeDialog}>
        {m.ticket_tier_revoke()}
      </Button>
    </div>
  </Block>
{:else if isContinuation && portalChannel}
  <Block class="!my-3">
    <p class="tier-name">
      {m.ticket_tier_continuation()}
      {#if portalChannel.hasPassphrase}
        <Chip class="passphrase-chip" outline>
          {m.ticket_tier_passphrase_toggle()}
        </Chip>
      {/if}
    </p>
    <p class="tier-provenance" data-testid="continuation-provenance">
      {m.ticket_tier_continuation_provenance()}
    </p>
    <p class="tier-meta">
      <span>{formatRelativeTime(new Date(portalChannel.createdAt))}</span>
      {#if portalChannel.lastSeenAt}
        <span class="meta-sep" aria-hidden="true"></span>
        <span>{formatRelativeTime(new Date(portalChannel.lastSeenAt))}</span>
      {/if}
    </p>
    <div class="offer-row">
      <span class="offer-label">{m.ticket_tier_offer_toggle()}</span>
      <Toggle
        checked={portalChannel.accountOffer}
        disabled={offerUpdating}
        onchange={() => void handleOfferToggle()}
        aria-label={m.ticket_tier_offer_toggle()}
      />
    </div>
    <p class="offer-hint">{m.ticket_tier_offer_hint(withTerms())}</p>
    <div class="tier-actions">
      <Button small outline onclick={openRegenerate}>
        {m.ticket_tier_regenerate()}
      </Button>
      <Button small outline class="tier-revoke-btn" onclick={openRevokeDialog}>
        {m.ticket_tier_revoke()}
      </Button>
    </div>
  </Block>
{:else if isAccount && portalChannel}
  <Block class="!my-3">
    <p class="tier-name">{m.ticket_tier_account()}</p>
    <p class="tier-meta">
      <span>{formatRelativeTime(new Date(portalChannel.createdAt))}</span>
      {#if portalChannel.lastSeenAt}
        <span class="meta-sep" aria-hidden="true"></span>
        <span>{formatRelativeTime(new Date(portalChannel.lastSeenAt))}</span>
      {/if}
    </p>
    <div class="tier-actions">
      <Button small outline class="tier-reset-btn" onclick={openResetDialog}>
        {m.ticket_tier_account_reset()}
      </Button>
    </div>
  </Block>
{:else}
  <Block class="!my-3">
    <p class="tier-name">{m.ticket_tier_sms_email()}</p>
    <p class="tier-meta tier-explainer">
      {m.ticket_tier_sms_explain()}
    </p>
    <div class="tier-actions">
      <Button small outline onclick={openSetup}>
        {m.ticket_tier_setup()}
      </Button>
    </div>
  </Block>
{/if}

<SecureLinkSheet
  opened={secureLinkSheetOpen}
  {ticketId}
  mode={secureLinkMode}
  hasPhone={clientPhone != null && clientPhone !== ""}
  ondismiss={handleSheetDismiss}
  onsuccess={handleUpgradeSuccess}
/>

<ShellDialog
  opened={revokeDialogOpen}
  ondismiss={() => {
    revokeDialogOpen = false;
  }}
  title={m.ticket_tier_revoke()}
>
  {#snippet content()}
    <p>{m.ticket_tier_revoke_confirm(withTerms())}</p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton
      onclick={() => {
        revokeDialogOpen = false;
      }}
    >
      {m.common_cancel()}
    </DialogButton>
    <DialogButton
      onclick={() => void handleRevoke()}
      class={DIALOG_DESTRUCTIVE_CLASS}
    >
      {m.ticket_tier_revoke()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<ShellDialog
  opened={resetDialogOpen}
  ondismiss={() => {
    resetDialogOpen = false;
  }}
  title={m.ticket_tier_account_reset()}
>
  {#snippet content()}
    <p>{m.ticket_tier_account_reset_confirm(withTerms())}</p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton
      onclick={() => {
        resetDialogOpen = false;
      }}
    >
      {m.common_cancel()}
    </DialogButton>
    <DialogButton
      onclick={() => void handleReset()}
      class={DIALOG_DESTRUCTIVE_CLASS}
    >
      {m.ticket_tier_account_reset()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  .tier-name {
    color: var(--ink);
    font-size: var(--text-base);
    font-weight: 500;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  :global(.passphrase-chip) {
    font-size: 0.6875rem !important;
  }

  .tier-provenance {
    color: var(--care);
    font-size: var(--text-xs);
    margin: 0.25rem 0 0;
    line-height: 1.4;
  }

  .tier-meta {
    color: var(--muted);
    font-size: var(--text-sm);
    margin: 0.25rem 0 0;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .meta-sep::before {
    content: "\00B7";
  }

  .tier-explainer {
    line-height: 1.4;
  }

  .tier-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
    flex-wrap: wrap;
  }

  .offer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: 0.75rem;
    min-height: 44px;
  }

  .offer-label {
    color: var(--ink);
    font-size: var(--text-sm);
  }

  .offer-hint {
    color: var(--muted);
    font-size: var(--text-xs);
    margin: 0.25rem 0 0;
    line-height: 1.4;
  }

  :global(.tier-reset-btn) {
    --k-color-primary: var(--danger) !important;
  }
</style>
