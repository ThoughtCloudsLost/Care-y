<!--
  Ticket detail route: glue layer between TicketDetail content component
  and AppShell navigation chrome.

  Responsibilities:
  - Hides AppShell tabbar while active (ShellMessagebar provides compose bar)
  - Overrides AppShell Navbar with back/client-alias/call/more icons
  - Renders ShellMessagebar compose bar (fixed bottom)
  - Hosts all overlays via shell wrappers (ActionSheet, Sheet, Popup)
  - Manages draft text state shared between compose bar and content
  - Provides SvelteKit snapshot for draft preservation
-->
<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Link } from "konsta/svelte";
  import { ChevronLeft, Phone, EllipsisVertical } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import {
    getTabbarHiddenCtx,
    getNavbarOverrideCtx,
  } from "$lib/shell/context.js";
  import type { ComposeMode } from "$lib/shell/types.js";
  import TicketDetail from "$lib/components/tickets/TicketDetail.svelte";
  import ShellMessagebar from "$lib/shell/ShellMessagebar.svelte";
  import ShellActionSheet from "$lib/shell/ShellActionSheet.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import ShellPopup from "$lib/shell/ShellPopup.svelte";
  import PresetReplyContent from "$lib/components/tickets/PresetReplyContent.svelte";
  import TicketActionsContent, {
    type TicketAction,
  } from "$lib/components/tickets/TicketActionsContent.svelte";
  import CallOptionsContent, {
    type CallAction,
  } from "$lib/components/tickets/CallOptionsContent.svelte";
  import ClientInfoContent from "$lib/components/tickets/ClientInfoContent.svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { trpc } from "$lib/trpc/index.js";
  import { getCurrentUserId } from "$lib/crypto/context.js";
  import { RouterNotAvailableError } from "$lib/errors.js";

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;

  const ticketId = $derived(page.params.id ?? "");
  const tabbarHidden = getTabbarHiddenCtx();
  const navbarCtx = getNavbarOverrideCtx();

  // Draft compose state (shared with ShellMessagebar + TicketDetail).
  let draftText = $state("");
  let composeMode = $state<ComposeMode>("reply");
  let cursorPosition = $state(0);

  function handleInput(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLTextAreaElement) {
      cursorPosition = target.selectionStart;
    }
  }

  // Ticket data for navbar display.
  const ticketQuery = createQuery(() => ({
    queryKey: ["ticket", ticketId],
    queryFn: async () => ticketRouter.get.query({ ticketId }),
  }));

  const ticket = $derived(ticketQuery.data);
  const clientAlias = $derived(ticket?.clientAlias ?? "...");

  // --- Action sheet data ---

  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());

  const ticketStatus = $derived(ticket?.status ?? "open");
  const isOnHold = $derived(ticket?.onHold ?? false);
  const isAssignedToMe = $derived(
    currentUserId !== undefined && ticket?.assignedTo === currentUserId,
  );

  const watchingQuery = createQuery(() => ({
    queryKey: ["isWatching", ticketId],
    queryFn: async () => ticketRouter.isWatching.query({ ticketId }),
    enabled: ticketId !== "",
  }));
  const isWatching = $derived(watchingQuery.data ?? false);

  // Consultant phone registration (for call options).
  const consultantQuery = createQuery(() => ({
    queryKey: ["consultant"],
    queryFn: async () => trpc.consultant?.get.query() ?? null,
    staleTime: 5 * 60 * 1000,
  }));
  const hasVerifiedPhone = $derived(consultantQuery.data?.isVerified ?? false);

  // --- Shell overrides ---

  // Hide the AppShell tabbar while this route is active.
  $effect(() => {
    tabbarHidden.current = true;
    return () => {
      tabbarHidden.current = false;
    };
  });

  // Override AppShell Navbar with ticket-specific content.
  $effect(() => {
    navbarCtx.current = { left: navLeft, title: navTitle, right: navRight };
    return () => {
      navbarCtx.current = undefined;
    };
  });

  // --- Overlay state ---

  let actionsSheetOpen = $state(false);
  let callSheetOpen = $state(false);
  let presetSheetOpen = $state(false);
  let clientInfoOpen = $state(false);
  let lightboxOpen = $state(false);
  let lightboxUrl = $state<string | null>(null);

  // --- Navigation ---

  function goBack(): void {
    void goto(resolve("/tickets"));
  }

  // --- Compose handlers ---

  function handleSend(): void {
    // Stub: encryption + submission wired separately.
    if (import.meta.env.DEV) {
      console.log(
        `[TicketDetail] send ${composeMode}:`,
        draftText.slice(0, 50),
      );
    }
  }

  function handleAttach(): void {
    // Stub: file attachment wired separately.
    if (import.meta.env.DEV) {
      console.log("[TicketDetail] attach");
    }
  }

  function handleMentionSelect(_userId: string, displayName: string): void {
    // Replace the @partial at cursor with @DisplayName followed by a space.
    const before = draftText.slice(0, cursorPosition);
    const after = draftText.slice(cursorPosition);
    const atIndex = before.lastIndexOf("@");
    if (atIndex === -1) return;
    const replacement = `@${displayName} `;
    draftText = before.slice(0, atIndex) + replacement + after;
    cursorPosition = atIndex + replacement.length;
  }

  // --- Action dispatchers ---

  function handleTicketAction(action: TicketAction): void {
    closeActionsSheet();
    switch (action) {
      case "take":
        void ticketRouter.take.mutate({ ticketId });
        break;
      case "release":
        void ticketRouter.release.mutate({ ticketId });
        break;
      case "assign":
        // Stub: assignment UI (picker) wired by a later phase.
        if (import.meta.env.DEV) console.log("[TicketDetail] assign");
        break;
      case "hold":
        void ticketRouter.update.mutate({ ticketId, onHold: true });
        break;
      case "unhold":
        void ticketRouter.update.mutate({ ticketId, onHold: false });
        break;
      case "close":
        void ticketRouter.close.mutate({ ticketId });
        break;
      case "reopen":
        // Reopen requires a new key generation UUID (ticket re-keying).
        void ticketRouter.reopen.mutate({
          ticketId,
          newKeyGeneration: crypto.randomUUID(),
        });
        break;
      case "watch":
        void ticketRouter.watchTicket.mutate({ ticketId });
        break;
      case "unwatch":
        void ticketRouter.unwatchTicket.mutate({ ticketId });
        break;
      case "client-info":
        openClientInfo();
        break;
      case "cancel":
        break;
    }
  }

  function handleCallAction(action: CallAction): void {
    closeCallSheet();
    switch (action) {
      case "browser-call":
        // Stub: BrowserCallService.startCall() wired by telephony integration.
        if (import.meta.env.DEV) console.log("[TicketDetail] browser-call");
        break;
      case "phone-call":
        // Stub: consultant phone callback wired by telephony integration.
        if (import.meta.env.DEV) console.log("[TicketDetail] phone-call");
        break;
      case "cancel":
        break;
    }
  }

  // --- Overlay helpers ---

  function openActionsSheet(): void {
    actionsSheetOpen = true;
  }
  function closeActionsSheet(): void {
    actionsSheetOpen = false;
  }

  function openCallSheet(): void {
    callSheetOpen = true;
  }
  function closeCallSheet(): void {
    callSheetOpen = false;
  }

  function openPresetSheet(): void {
    presetSheetOpen = true;
  }
  function closePresetSheet(): void {
    presetSheetOpen = false;
  }

  function openClientInfo(): void {
    clientInfoOpen = true;
  }
  function closeClientInfo(): void {
    clientInfoOpen = false;
  }

  function openLightbox(imageUrl: string): void {
    lightboxUrl = imageUrl;
    lightboxOpen = true;
  }
  function closeLightbox(): void {
    lightboxOpen = false;
    lightboxUrl = null;
  }

  // --- SvelteKit Snapshot (draft preservation) ---
  // Snapshot interface defined here, wired when draft persistence is added.
</script>

{#snippet navLeft()}
  <Link iconOnly onclick={goBack} role="button" aria-label={m.common_back()}>
    <ChevronLeft size={22} aria-hidden="true" />
  </Link>
{/snippet}

{#snippet navTitle()}
  <button class="client-alias-btn" onclick={openClientInfo}>
    {clientAlias}
  </button>
{/snippet}

{#snippet navRight()}
  <Link
    iconOnly
    onclick={openCallSheet}
    role="button"
    aria-label={m.ticket_call()}
  >
    <Phone size={22} aria-hidden="true" />
  </Link>
  <Link
    iconOnly
    onclick={openActionsSheet}
    role="button"
    aria-label={m.ticket_more_actions()}
  >
    <EllipsisVertical size={22} aria-hidden="true" />
  </Link>
{/snippet}

<div class="ticket-detail-page">
  <TicketDetail
    {ticketId}
    bind:draftText
    {cursorPosition}
    onback={goBack}
    oncall={openCallSheet}
    onactions={openActionsSheet}
    onclientinfo={openClientInfo}
    onpresetselect={(body: string) => {
      draftText = body;
    }}
    onmentionselect={handleMentionSelect}
    onlightbox={openLightbox}
  />
</div>

<!-- Compose bar (shell wrapper, maps to native input accessory view) -->
<ShellMessagebar
  bind:value={draftText}
  bind:mode={composeMode}
  onsend={handleSend}
  onattach={handleAttach}
  onpreset={openPresetSheet}
  oninput={handleInput}
  sendDisabled={!draftText.trim()}
/>

<!-- Overlays (route file owns all shell wrappers) -->
<ShellActionSheet opened={actionsSheetOpen} ondismiss={closeActionsSheet}>
  <TicketActionsContent
    {ticketStatus}
    {isOnHold}
    {isAssignedToMe}
    {isWatching}
    onaction={handleTicketAction}
  />
</ShellActionSheet>

<ShellActionSheet opened={callSheetOpen} ondismiss={closeCallSheet}>
  <CallOptionsContent {hasVerifiedPhone} onaction={handleCallAction} />
</ShellActionSheet>

<ShellSheet opened={presetSheetOpen} ondismiss={closePresetSheet}>
  <PresetReplyContent
    onselect={(body: string) => {
      draftText = body;
      closePresetSheet();
    }}
  />
</ShellSheet>

<ShellSheet opened={clientInfoOpen} ondismiss={closeClientInfo}>
  <ClientInfoContent
    {clientAlias}
    clientTier={undefined}
    contactMethod={undefined}
    recentTickets={[]}
  />
</ShellSheet>

<ShellPopup opened={lightboxOpen} ondismiss={closeLightbox}>
  {#if lightboxUrl}
    <div class="lightbox-content">
      <img
        src={lightboxUrl}
        alt={m.ticket_mms_lightbox_label()}
        class="lightbox-img"
      />
    </div>
  {/if}
</ShellPopup>

<style>
  .ticket-detail-page {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .client-alias-btn {
    background: none;
    border: none;
    cursor: pointer;
    font: inherit;
    color: inherit;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }

  .client-alias-btn:hover {
    opacity: 0.7;
  }

  .lightbox-content {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    min-height: 200px;
  }

  .lightbox-img {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 0.5rem;
  }
</style>
