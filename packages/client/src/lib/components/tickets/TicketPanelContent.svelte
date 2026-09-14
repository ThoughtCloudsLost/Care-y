<!--
  Unified ticket panel content: ticket description, metadata, actions,
  media gallery, notes, and recent ticket history in a single view.

  Replaces the former ClientInfoContent + TicketActionsContent overlays.
  This is a CONTENT component: no Popup/Sheet shell imports.
  The route file wraps this in ShellPopup.

  Self-contained: reads ticket, attachments, recordings, and follow-ups
  from TanStack Query cache (same keys as TicketDetail, deduplicated).
  Decrypts notes and volunteer names via Svelte context caches.

  Layout follows the iOS Contacts card pattern: prominent call button,
  metadata list, state toggles, then content sections.
-->
<script lang="ts">
  import {
    Block,
    BlockTitle,
    Button,
    List,
    ListItem,
    Toggle,
  } from "konsta/svelte";
  import {
    Phone,
    Mail,
    Pencil,
    BellRing,
    Link2,
    KeyRound,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import StatusMark from "$lib/components/StatusMark.svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import type { DisplayStatus } from "$lib/tickets/display-status.js";
  import { createQuery } from "@tanstack/svelte-query";
  import { ticketKeys } from "$lib/query/keys";
  import { trpc } from "$lib/trpc/index.js";
  import {
    getTicketDecryptCache,
    getFollowUpDecryptCache,
    getOrgDecryptCache,
    getCurrentUserId,
  } from "$lib/crypto/context.js";
  import { createTicketDecryptScope } from "$lib/crypto/ticket-decrypt-scope.js";
  import { isDecryptReady } from "$lib/crypto/decrypt-result.js";
  import { requireRouter } from "$lib/errors.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import PanelNotesSection from "./PanelNotesSection.svelte";
  import PanelMediaSection from "./PanelMediaSection.svelte";
  import PortalTierSection from "./PortalTierSection.svelte";
  import { onKeyActivate, labelToggleInput } from "$lib/utils/a11y.js";
  import { enabledTicketId } from "$lib/tickets/queries.js";
  import type { TicketAction } from "$lib/tickets/types.js";

  interface TicketPanelContentProps {
    ticketId: string;
    onaction: (action: TicketAction) => void;
    /** Emitted when a note is tapped. Route closes panel and scrolls to it. */
    onnotetap?: (noteId: string) => void;
    /** Emitted when an image thumbnail is tapped. Route opens lightbox. */
    onlightbox?: (imageUrl: string) => void;
    /** Skip title, description, and opened date (already shown by CaseHeader). */
    compact?: boolean;
    /** Channel policy: hide call button when voice is disabled. */
    voiceEnabled?: boolean;
    /** Channel policy: hide share link action when disabled. */
    shareLinkEnabled?: boolean;
    /** Channel policy: hide portal setup offer when secure links are disabled. */
    secureLinkEnabled?: boolean;
    /** Channel policy: hide SMS delivery in the secure link sheet. */
    smsEnabled?: boolean;
  }

  let {
    ticketId,
    onaction,
    onnotetap,
    onlightbox,
    compact = false,
    voiceEnabled = true,
    shareLinkEnabled = true,
    secureLinkEnabled = true,
    smsEnabled = true,
  }: TicketPanelContentProps = $props();

  // --- Context + caches ---

  const ticketRouter = requireRouter(trpc.tickets, "tickets");

  const ticketCache = getTicketDecryptCache();
  const followUpCache = getFollowUpDecryptCache();
  const orgCache = getOrgDecryptCache();
  const currentUserIdGetter = getCurrentUserId();

  // --- TanStack queries (same keys as TicketDetail, deduplicated) ---

  const ticketQuery = createQuery(() => ({
    queryKey: ticketKeys.detail(ticketId),
    queryFn: async () => ticketRouter.get.query({ ticketId }),
    enabled: enabledTicketId(ticketId),
  }));

  const watchingQuery = createQuery(() => ({
    queryKey: ticketKeys.isWatching(ticketId),
    queryFn: async () => ticketRouter.isWatching.query({ ticketId }),
    enabled: enabledTicketId(ticketId),
  }));

  // --- Derived ticket state ---

  const ticket = $derived(ticketQuery.data);
  const keyWrap = $derived(ticket?.keyWrap ?? null);
  const ticketStatus = $derived(ticket?.status ?? "open");
  const isOnHold = $derived(ticket?.onHold ?? false);
  const isWatching = $derived(watchingQuery.data ?? false);

  const isAssignedToMe = $derived(
    ticket?.assignedTo != null && ticket.assignedTo === currentUserIdGetter(),
  );

  const displayStatus = $derived<DisplayStatus>(
    isOnHold ? "hold" : ticketStatus === "closed" ? "closed" : "active",
  );

  const statusLabel = $derived(
    isOnHold
      ? m.ticket_action_hold()
      : ticketStatus === "closed"
        ? m.ticket_action_close()
        : m.ticket_action_open(),
  );

  // Pre-bind ticket context for clean decrypt calls.
  const decrypt = $derived(
    ticket != null
      ? createTicketDecryptScope({
          ticketCache,
          followUpCache,
          orgCache,
          ticketId: ticket.id,
          keyWrap: ticket.keyWrap,
          intakeWrap: ticket.intakeWrap,
        })
      : null,
  );

  const titleResult = $derived(
    ticket != null && decrypt != null
      ? decrypt.title(ticket.encryptedTitle)
      : undefined,
  );

  const decryptedTitle = $derived(
    titleResult != null && isDecryptReady(titleResult)
      ? titleResult.value
      : undefined,
  );

  // Description is collected at ticket creation but was never rendered
  // anywhere. Empty descriptions decrypt to "" and stay hidden.
  const descriptionResult = $derived(
    ticket != null && decrypt != null
      ? decrypt.description(ticket.encryptedDescription)
      : undefined,
  );

  const decryptedDescription = $derived(
    descriptionResult != null && isDecryptReady(descriptionResult)
      ? descriptionResult.value
      : undefined,
  );
</script>

<div class="panel-content">
  {#if !compact}
    <!-- Ticket title / description -->
    {#if ticketQuery.isLoading}
      <Block class="!my-0 !mt-2">
        <p class="ticket-title">
          <DecryptPlaceholder length={20} />
        </p>
      </Block>
    {:else if decryptedTitle}
      <Block class="!my-0 !mt-2">
        <p class="ticket-title">{decryptedTitle}</p>
      </Block>
    {/if}

    {#if decryptedDescription}
      <Block class="!my-0 !mt-1">
        <p class="ticket-description">{decryptedDescription}</p>
      </Block>
    {/if}
  {/if}

  <!-- Call button -->
  {#if voiceEnabled}
    <Block class="!my-3">
      <Button large onclick={() => onaction("call")}>
        <Phone size={18} aria-hidden="true" class="call-icon" />
        {m.ticket_panel_call()}
      </Button>
    </Block>
  {/if}

  <!-- Ticket metadata -->
  <List class="!my-3">
    <ListItem title={m.ticket_panel_status()}>
      {#snippet after()}
        {#if ticketQuery.isLoading}
          <InlineSkeleton width="6ch" />
        {:else}
          <span class="status-after">
            <!-- Decorative here: the status word sits right beside it,
                 and StatusMark self-labels via role="img". -->
            <span class="status-mark-wrap" aria-hidden="true">
              <StatusMark status={displayStatus} />
            </span>
            <span class="status-label">{statusLabel}</span>
          </span>
        {/if}
      {/snippet}
    </ListItem>
    <!-- Phone and email share the three-state shape below. A client can
         reach the org without either one now, so both rows offer to add
         a value rather than vanishing when none is on file. -->
    {#if ticket && !ticket.contactWithheld}
      <ListItem
        link
        linkComponent="button"
        chevron={false}
        title={m.client_phone_label()}
        onclick={() => onaction("phone")}
        class="touch-feedback"
      >
        {#snippet media()}
          <Phone class="w-5 h-5 text-[var(--ink-2)]" aria-hidden="true" />
        {/snippet}
        {#snippet after()}
          {#if ticket.clientPhone}
            <span class="phone-value">{ticket.clientPhone}</span>
          {:else}
            <span class="contact-add">{m.client_phone_add()}</span>
          {/if}
        {/snippet}
      </ListItem>
    {/if}
    <!-- Three states, not two: an address to show, no address on file
         (offer to add one), or details withheld from this caller. Only
         the server knows which null it sent, so contactWithheld decides
         rather than the absence of a value. -->
    {#if ticket && !ticket.contactWithheld}
      <ListItem
        link
        linkComponent="button"
        chevron={false}
        title={m.client_email_label()}
        onclick={() => onaction("email")}
        class="touch-feedback"
      >
        {#snippet media()}
          <Mail class="w-5 h-5 text-[var(--ink-2)]" aria-hidden="true" />
        {/snippet}
        {#snippet after()}
          {#if ticket.clientEmail}
            <span class="email-value">{ticket.clientEmail}</span>
          {:else}
            <span class="contact-add">{m.client_email_add()}</span>
          {/if}
        {/snippet}
      </ListItem>
      {#if ticket.clientEmail}
        <ListItem
          link
          title={m.revoke_reply_token_label()}
          onclick={() => onaction("revokeReplyToken")}
          onkeydown={onKeyActivate(() => onaction("revokeReplyToken"))}
          class="touch-feedback"
        >
          {#snippet media()}
            <KeyRound class="w-5 h-5 text-[var(--ink-2)]" aria-hidden="true" />
          {/snippet}
        </ListItem>
      {/if}
    {/if}
    {#if !compact}
      <ListItem title={m.ticket_panel_opened()}>
        {#snippet after()}
          {#if ticketQuery.isLoading}
            <InlineSkeleton width="4ch" />
          {:else if ticket?.createdAt}
            {formatRelativeTime(new Date(ticket.createdAt))}
          {/if}
        {/snippet}
      </ListItem>
    {/if}
  </List>

  <PanelNotesSection {ticketId} {keyWrap} {onnotetap} />

  <PortalTierSection
    {ticketId}
    clientId={ticket?.clientId ?? ""}
    clientTier={ticket?.clientTier}
    portalChannel={ticket?.portalChannel}
    clientPhone={ticket?.clientPhone}
    isLoading={ticketQuery.isLoading}
    {secureLinkEnabled}
    {smsEnabled}
  />

  <!-- Ticket actions -->
  <List class="!my-3">
    <ListItem
      link
      chevron
      title={m.ticket_action_edit_case(withTerms())}
      onclick={() => onaction("editContent")}
    >
      {#snippet media()}
        <Pencil class="w-5 h-5 text-[var(--ink-2)]" aria-hidden="true" />
      {/snippet}
    </ListItem>
    {#if isWatching || isAssignedToMe}
      <ListItem
        link
        chevron
        title={m.notif_ticket_panel_action()}
        onclick={() => onaction("notifications")}
      >
        {#snippet media()}
          <BellRing class="w-5 h-5 text-[var(--ink-2)]" aria-hidden="true" />
        {/snippet}
      </ListItem>
    {/if}
    <ListItem
      link
      chevron
      title={m.ticket_action_assign()}
      onclick={() => onaction("assign")}
    />
    <ListItem
      link
      chevron
      title={m.ticket_action_change_priority()}
      onclick={() => onaction("changePriority")}
    />
    <ListItem
      link
      chevron
      title={m.ticket_action_change_queue()}
      onclick={() => onaction("changeQueue")}
    />
    {#if shareLinkEnabled}
      <ListItem
        link
        chevron
        title={m.share_sheet_title()}
        onclick={() => onaction("shareLink")}
      >
        {#snippet media()}
          <Link2 class="w-5 h-5 text-[var(--ink-2)]" aria-hidden="true" />
        {/snippet}
      </ListItem>
    {/if}
    <ListItem title={m.ticket_action_hold()}>
      {#snippet after()}
        <span use:labelToggleInput={m.ticket_action_hold()}>
          <Toggle
            checked={isOnHold}
            onChange={() => onaction(isOnHold ? "unhold" : "hold")}
          />
        </span>
      {/snippet}
    </ListItem>
    <ListItem title={m.ticket_action_watch()}>
      {#snippet after()}
        <span use:labelToggleInput={m.ticket_action_watch()}>
          <Toggle
            checked={isWatching}
            onChange={() => onaction(isWatching ? "unwatch" : "watch")}
          />
        </span>
      {/snippet}
    </ListItem>
  </List>

  <List class="!my-3">
    {#if isAssignedToMe}
      <ListItem
        link
        chevron
        title={m.ticket_action_release()}
        onclick={() => onaction("release")}
      />
    {:else if ticket?.assignedTo == null}
      <ListItem
        link
        chevron
        title={m.ticket_action_take()}
        onclick={() => onaction("take")}
      />
    {/if}
    <ListItem
      link
      title={ticketStatus === "open"
        ? m.ticket_action_close()
        : m.ticket_action_reopen()}
      onclick={() => onaction(ticketStatus === "open" ? "close" : "reopen")}
    >
      {#snippet after()}
        <span class="destructive-text">
          {ticketStatus === "open"
            ? m.ticket_action_close()
            : m.ticket_action_reopen()}
        </span>
      {/snippet}
    </ListItem>
  </List>

  <PanelMediaSection {ticketId} {keyWrap} {onlightbox} />

  <!-- Recent tickets -->
  <BlockTitle class="!mt-6 !-mb-2"
    >{m.ticket_recent_history(withTerms())}</BlockTitle
  >
  <Block class="!my-3 !mb-8">
    <p class="empty-text">{m.ticket_panel_recent_coming_soon(withTerms())}</p>
  </Block>
</div>

<style>
  .panel-content {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .ticket-title {
    font-size: var(--text-md);
    font-weight: 600;
    color: var(--ink);
    margin: 0;
  }

  .ticket-description {
    font-size: var(--text-base);
    color: var(--ink-2, var(--muted));
    line-height: 1.5;
    white-space: pre-wrap;
    margin: 0;
  }

  :global(.call-icon) {
    margin-right: 0.5rem;
  }

  /* Metadata helpers */
  .status-after {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .status-mark-wrap {
    display: inline-flex;
  }

  .status-label {
    font-size: var(--text-sm);
    text-transform: capitalize;
  }

  .phone-value {
    font-size: var(--text-sm);
    color: var(--ink);
  }

  /* Addresses run far longer than phone numbers, so this one truncates
     rather than pushing the row title out of the panel. The full value
     is reachable through the popover's copy action. */
  .email-value {
    font-size: var(--text-sm);
    color: var(--ink);
    max-width: 18ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Shared by the phone and email rows so the two cannot drift apart. */
  .contact-add {
    font-size: var(--text-sm);
    color: var(--ink-2);
  }

  .destructive-text {
    color: var(--danger);
    font-size: var(--text-sm);
  }

  .empty-text {
    text-align: center;
    color: var(--muted);
    font-size: var(--text-sm);
    padding: 0.5rem 0;
  }
</style>
