<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import ShellActionSheet from "$lib/shell/ShellActionSheet.svelte";
  import ShellPopup from "$lib/shell/ShellPopup.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import { DialogButton, ActionsGroup, ActionsButton } from "konsta/svelte";
  import { DIALOG_DESTRUCTIVE_CLASS } from "$lib/components/shared/konsta-classes.js";
  import TicketPanelContent from "$lib/components/tickets/TicketPanelContent.svelte";
  import AssignSheet from "$lib/components/tickets/AssignSheet.svelte";
  import ComposeActions from "$lib/components/tickets/ComposeActions.svelte";
  import CallOptionsContent, {
    type CallAction,
  } from "$lib/components/tickets/CallOptionsContent.svelte";
  import CloseResolutionSheet from "$lib/components/tickets/CloseResolutionSheet.svelte";
  import InternalNoteSheet from "$lib/components/tickets/InternalNoteSheet.svelte";
  import TicketContentEditSheet from "$lib/components/tickets/TicketContentEditSheet.svelte";
  import TicketNotificationSheet from "$lib/components/tickets/TicketNotificationSheet.svelte";
  import { resolveNoteTypeIcon } from "$lib/utils/note-type-icons.js";
  import ShellPopover from "$lib/shell/ShellPopover.svelte";
  import PhoneActionContent from "$lib/components/clients/PhoneActionContent.svelte";
  import PhoneEditSheet from "$lib/components/clients/PhoneEditSheet.svelte";
  import MergeSheet from "$lib/components/clients/MergeSheet.svelte";
  import ExposureHint from "$lib/components/tickets/ExposureHint.svelte";
  import type { TicketAction } from "$lib/tickets/types.js";
  import type {
    DeleteConfirmState,
    NoteEditState,
    ContentEditState,
    NotificationSheetState,
  } from "$lib/composables/ticket-detail/create-overlay-state.svelte.js";
  import type { ExposureHintState } from "$lib/composables/ticket-detail/create-exposure-hint.svelte.js";
  import type { LightboxState } from "$lib/composables/ticket-detail/create-lightbox.svelte.js";
  import type { ContextMenuState } from "$lib/composables/ticket-detail/create-context-menu.svelte.js";
  import type { CloseResolutionState } from "$lib/composables/ticket-detail/create-close-resolution.svelte.js";

  interface Props {
    ticketId: string;
    clientId: string;
    clientAlias: string;
    panelOpen: boolean;
    assignSheetOpen: boolean;
    callSheetOpen: boolean;
    composeActionsOpen: boolean;
    composeActionsAnchor: HTMLElement | undefined;
    phonePopoverOpen: boolean;
    phoneEditSheetOpen: boolean;
    canCopyPhone: boolean;
    onphonepopoverdismiss: () => void;
    onphonecopy: () => void;
    onphoneedit: () => void;
    onphoneeditdismiss: () => void;
    onphonemerge: (
      conflictingClientId: string,
      conflictingAlias: string,
    ) => void;
    mergeSheetOpen: boolean;
    mergeClientA: { id: string; alias: string } | null;
    mergeClientB: { id: string; alias: string } | null;
    onmergedismiss: () => void;
    onmerged: () => void;
    hasVerifiedPhone: boolean;
    currentAssigneeId: string | null;
    deleteConfirm: DeleteConfirmState;
    noteEdit: NoteEditState;
    contentEdit: ContentEditState;
    notificationSheet: NotificationSheetState;
    exposureHint: ExposureHintState;
    lightbox: LightboxState;
    contextMenu: ContextMenuState;
    closeFlow: CloseResolutionState;
    onpaneldismiss: () => void;
    onpanelaction: (action: TicketAction) => void;
    onnotetap: (noteId: string) => void;
    onpanellightbox: (imageUrl: string) => void;
    onassigndismiss: () => void;
    onassign: (ticketId: string, targetUserId: string | null) => void;
    oncallaction: (action: CallAction) => void;
    oncalldismiss: () => void;
    oncomposedismiss: () => void;
    onreply?: () => void;
    ontextclient?: () => void;
    ondraftset: (body: string) => void;
  }

  let {
    ticketId,
    clientId,
    clientAlias,
    panelOpen,
    assignSheetOpen,
    callSheetOpen,
    composeActionsOpen,
    composeActionsAnchor,
    phonePopoverOpen,
    phoneEditSheetOpen,
    canCopyPhone,
    onphonepopoverdismiss,
    onphonecopy,
    onphoneedit,
    onphoneeditdismiss,
    onphonemerge,
    mergeSheetOpen,
    mergeClientA,
    mergeClientB,
    onmergedismiss,
    onmerged,
    hasVerifiedPhone,
    currentAssigneeId,
    deleteConfirm,
    noteEdit,
    contentEdit,
    notificationSheet,
    exposureHint,
    lightbox,
    contextMenu,
    closeFlow,
    onpaneldismiss,
    onpanelaction,
    onnotetap,
    onpanellightbox,
    onassigndismiss,
    onassign,
    oncallaction,
    oncalldismiss,
    oncomposedismiss,
    onreply,
    ontextclient,
    ondraftset,
  }: Props = $props();
</script>

<ShellPopup opened={panelOpen} ondismiss={onpaneldismiss} title={clientAlias}>
  <TicketPanelContent
    {ticketId}
    onaction={onpanelaction}
    {onnotetap}
    onlightbox={onpanellightbox}
  />
</ShellPopup>

<AssignSheet
  opened={assignSheetOpen}
  {ticketId}
  {currentAssigneeId}
  ondismiss={onassigndismiss}
  {onassign}
/>

<ShellActionSheet
  opened={callSheetOpen}
  ondismiss={oncalldismiss}
  ariaLabel={m.ticket_call_options()}
>
  <CallOptionsContent {hasVerifiedPhone} onaction={oncallaction} />
</ShellActionSheet>

<ComposeActions
  opened={composeActionsOpen}
  ondismiss={oncomposedismiss}
  target={composeActionsAnchor}
  {ticketId}
  onpresetselect={ondraftset}
  {onreply}
  {ontextclient}
/>

<ShellPopover
  opened={phonePopoverOpen}
  ondismiss={onphonepopoverdismiss}
  ariaLabel={m.client_phone_label()}
>
  <PhoneActionContent
    canCopy={canCopyPhone}
    oncopy={onphonecopy}
    onedit={onphoneedit}
  />
</ShellPopover>

<PhoneEditSheet
  opened={phoneEditSheetOpen}
  {clientId}
  {clientAlias}
  ondismiss={onphoneeditdismiss}
  onmerge={onphonemerge}
/>

<MergeSheet
  opened={mergeSheetOpen}
  clientA={mergeClientA}
  clientB={mergeClientB}
  ondismiss={onmergedismiss}
  {onmerged}
/>

{#if exposureHint.type}
  <ExposureHint
    type={exposureHint.type}
    opened={exposureHint.open}
    ondismiss={() => exposureHint.dismiss()}
  />
{/if}

<ShellPopup
  opened={lightbox.open}
  ondismiss={() => lightbox.dismiss()}
  ariaLabel={m.ticket_mms_lightbox_label()}
>
  {#if lightbox.url}
    <div class="lightbox-content">
      <img
        src={lightbox.url}
        alt={m.ticket_mms_lightbox_label()}
        class="lightbox-img"
      />
    </div>
  {/if}
</ShellPopup>

<ShellActionSheet
  opened={contextMenu.open}
  ondismiss={() => contextMenu.dismiss()}
  ariaLabel={m.ticket_context_menu_title()}
>
  {#if contextMenu.data !== null}
    <ActionsGroup>
      {#each contextMenu.data.actions as action (action.id)}
        <ActionsButton
          onclick={() => contextMenu.dispatch(action.id)}
          bold={action.destructive === true}
          colors={action.destructive === true
            ? { textIos: "text-red-500", textMaterial: "text-red-500" }
            : undefined}
        >
          {action.label}
        </ActionsButton>
      {/each}
    </ActionsGroup>
    <ActionsGroup>
      <ActionsButton onclick={() => contextMenu.dismiss()} bold>
        {m.common_cancel()}
      </ActionsButton>
    </ActionsGroup>
  {/if}
</ShellActionSheet>

<InternalNoteSheet
  opened={noteEdit.sheetOpen}
  ondismiss={() => noteEdit.dismiss()}
  {ticketId}
  editFollowUpId={noteEdit.followUpId}
  editInitialContent={noteEdit.content}
  editInitialNoteTypeId={noteEdit.noteTypeId}
  ondelete={(followUpId: string) => {
    noteEdit.dismiss();
    deleteConfirm.openConfirm(followUpId);
  }}
/>

<TicketContentEditSheet
  opened={contentEdit.sheetOpen}
  ondismiss={() => contentEdit.dismiss()}
  {ticketId}
/>

<TicketNotificationSheet
  opened={notificationSheet.sheetOpen}
  ondismiss={() => notificationSheet.dismiss()}
  {ticketId}
/>

<ShellDialog
  opened={deleteConfirm.open}
  ondismiss={() => deleteConfirm.close()}
  title={m.ticket_delete_note_confirm_title()}
>
  {#snippet content()}
    <p>{m.ticket_delete_note_confirm_body()}</p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={() => deleteConfirm.close()}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton
      onclick={() => void deleteConfirm.confirm()}
      class={DIALOG_DESTRUCTIVE_CLASS}
    >
      {m.common_delete()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<CloseResolutionSheet
  opened={closeFlow.sheetOpen}
  noteTypeId={closeFlow.noteTypeId ?? ""}
  noteTypeName={closeFlow.noteTypeName}
  NoteTypeIcon={resolveNoteTypeIcon(closeFlow.noteTypeIconName)}
  current={closeFlow.current}
  total={closeFlow.total}
  saving={closeFlow.saving}
  onsubmit={(text: string) => void closeFlow.submit(text)}
  onskip={() => closeFlow.skip()}
/>

<style>
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
