<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import ShellActionSheet from "$lib/shell/ShellActionSheet.svelte";
  import ShellPopup from "$lib/shell/ShellPopup.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import { DialogButton, ActionsGroup, ActionsButton } from "konsta/svelte";
  import TicketPanelContent from "$lib/components/tickets/TicketPanelContent.svelte";
  import AssignSheet from "$lib/components/tickets/AssignSheet.svelte";
  import ComposeActions from "$lib/components/tickets/ComposeActions.svelte";
  import CallOptionsContent, {
    type CallAction,
  } from "$lib/components/tickets/CallOptionsContent.svelte";
  import CloseResolutionSheet from "$lib/components/tickets/CloseResolutionSheet.svelte";
  import InternalNoteSheet from "$lib/components/tickets/InternalNoteSheet.svelte";
  import { resolveNoteTypeIcon } from "$lib/utils/note-type-icons.js";
  import ExposureHint from "$lib/components/tickets/ExposureHint.svelte";
  import SmsComposeContent from "$lib/components/tickets/SmsComposeContent.svelte";
  import type { TicketAction } from "$lib/tickets/types.js";
  import type {
    DeleteConfirmState,
    NoteEditState,
  } from "$lib/composables/ticket-detail/create-overlay-state.svelte.js";
  import type { ExposureHintState } from "$lib/composables/ticket-detail/create-exposure-hint.svelte.js";
  import type { LightboxState } from "$lib/composables/ticket-detail/create-lightbox.svelte.js";
  import type { ContextMenuState } from "$lib/composables/ticket-detail/create-context-menu.svelte.js";
  import type { CloseResolutionState } from "$lib/composables/ticket-detail/create-close-resolution.svelte.js";

  interface Props {
    ticketId: string;
    clientAlias: string;
    panelOpen: boolean;
    assignSheetOpen: boolean;
    callSheetOpen: boolean;
    composeActionsOpen: boolean;
    composeActionsAnchor: HTMLElement | undefined;
    smsSheetOpen: boolean;
    hasVerifiedPhone: boolean;
    smsSending: boolean;
    currentAssigneeId: string | null;
    deleteConfirm: DeleteConfirmState;
    noteEdit: NoteEditState;
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
    ontextclient: () => void;
    onsmsdismiss: () => void;
    onsmssend: (body: string) => Promise<void>;
    ondraftset: (body: string) => void;
  }

  let {
    ticketId,
    clientAlias,
    panelOpen,
    assignSheetOpen,
    callSheetOpen,
    composeActionsOpen,
    composeActionsAnchor,
    smsSheetOpen,
    hasVerifiedPhone,
    smsSending,
    currentAssigneeId,
    deleteConfirm,
    noteEdit,
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
    ontextclient,
    onsmsdismiss,
    onsmssend,
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
  {ontextclient}
/>

<ShellSheet
  opened={smsSheetOpen}
  ondismiss={onsmsdismiss}
  ariaLabel={m.ticket_sms_title(withTerms())}
>
  <SmsComposeContent
    onsend={onsmssend}
    oncancel={onsmsdismiss}
    sending={smsSending}
    error={null}
  />
</ShellSheet>

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
      class="text-red-500 font-semibold"
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
