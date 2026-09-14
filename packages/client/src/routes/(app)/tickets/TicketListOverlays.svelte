<script lang="ts">
  import type { CallAction } from "$lib/components/tickets/CallOptionsContent.svelte";
  import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";
  import type { SavedFilterColor } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import type { TicketPriority } from "@care-y/shared";
  import AssignSheet from "$lib/components/tickets/AssignSheet.svelte";
  import PrioritySelectSheet from "$lib/components/tickets/PrioritySelectSheet.svelte";
  import QueueSelectSheet from "$lib/components/tickets/QueueSelectSheet.svelte";
  import ReplySheet from "$lib/components/tickets/ReplySheet.svelte";
  import NewTicketController from "$lib/components/tickets/NewTicketController.svelte";
  import ShellActionSheet from "$lib/shell/ShellActionSheet.svelte";
  import CallOptionsContent from "$lib/components/tickets/CallOptionsContent.svelte";
  import CreateSavedFilter from "$lib/components/filters/CreateSavedFilter.svelte";

  interface Props {
    assignSheetOpen: boolean;
    assignTargetTicketId: string;
    assignCurrentAssigneeId: string | null;
    onassigndismiss: () => void;
    onassign: (ticketId: string, targetUserId: string | null) => void;

    bulkAssignSheetOpen: boolean;
    onbulkassigndismiss: () => void;
    onbulkassign: (ticketId: string, targetUserId: string | null) => void;

    bulkPrioritySheetOpen: boolean;
    onbulkprioritydismiss: () => void;
    onbulkpriorityselect: (priority: TicketPriority) => void;

    bulkQueueSheetOpen: boolean;
    onbulkqueuedismiss: () => void;
    onbulkqueueselect: (queueId: string) => void;

    replySheetOpen: boolean;
    replyTargetTicketId: string;
    replyClientAlias: string | null;
    replyHasPhone: boolean;
    replyClientPublic: string | null;
    replyPreviewFollowUps: RawFollowUpPreview[] | undefined;
    replyFollowUpCount: number;
    replyLatestClientType: string | null;
    onreplydismiss: () => void;
    onreplysent: (ticketId: string) => void;

    callSheetOpen: boolean;
    oncalldismiss: () => void;
    oncallaction: (action: CallAction) => void;

    newTicketOpen: boolean;
    onnewticketdismiss: () => void;
    onnewticketcollision: (ticketId: string) => void;

    savedFilterModalOpen: boolean;
    filterSummary: string;
    onsavedfilterdismiss: () => void;
    onsavedfiltersave: (meta: {
      encryptedName: string;
      color: SavedFilterColor;
      icon: string;
    }) => void;
  }

  const {
    assignSheetOpen,
    assignTargetTicketId,
    assignCurrentAssigneeId,
    onassigndismiss,
    onassign,
    bulkAssignSheetOpen,
    onbulkassigndismiss,
    onbulkassign,
    bulkPrioritySheetOpen,
    onbulkprioritydismiss,
    onbulkpriorityselect,
    bulkQueueSheetOpen,
    onbulkqueuedismiss,
    onbulkqueueselect,
    replySheetOpen,
    replyTargetTicketId,
    replyClientAlias,
    replyHasPhone,
    replyClientPublic,
    replyPreviewFollowUps,
    replyFollowUpCount,
    replyLatestClientType,
    onreplydismiss,
    onreplysent,
    callSheetOpen,
    oncalldismiss,
    oncallaction,
    newTicketOpen,
    onnewticketdismiss,
    onnewticketcollision,
    savedFilterModalOpen,
    filterSummary,
    onsavedfilterdismiss,
    onsavedfiltersave,
  }: Props = $props();
</script>

<CreateSavedFilter
  opened={savedFilterModalOpen}
  {filterSummary}
  ondismiss={onsavedfilterdismiss}
  onsave={onsavedfiltersave}
/>

<AssignSheet
  opened={assignSheetOpen}
  ticketId={assignTargetTicketId}
  currentAssigneeId={assignCurrentAssigneeId}
  ondismiss={onassigndismiss}
  onassign={(tid: string, uid: string | null) => onassign(tid, uid)}
/>

<AssignSheet
  opened={bulkAssignSheetOpen}
  ticketId=""
  currentAssigneeId={null}
  ondismiss={onbulkassigndismiss}
  onassign={(tid: string, uid: string | null) => onbulkassign(tid, uid)}
/>

<PrioritySelectSheet
  opened={bulkPrioritySheetOpen}
  ondismiss={onbulkprioritydismiss}
  onselect={onbulkpriorityselect}
/>

<QueueSelectSheet
  opened={bulkQueueSheetOpen}
  ondismiss={onbulkqueuedismiss}
  onselect={onbulkqueueselect}
/>

<ReplySheet
  opened={replySheetOpen}
  ticketId={replyTargetTicketId}
  clientAlias={replyClientAlias}
  hasPhone={replyHasPhone}
  clientPublic={replyClientPublic}
  previewFollowUps={replyPreviewFollowUps}
  followUpCount={replyFollowUpCount}
  latestClientType={replyLatestClientType}
  ondismiss={onreplydismiss}
  onsent={onreplysent}
/>

<ShellActionSheet
  opened={callSheetOpen}
  ondismiss={oncalldismiss}
  ariaLabel={m.ticket_call_options()}
>
  <CallOptionsContent hasVerifiedPhone={false} onaction={oncallaction} />
</ShellActionSheet>

<NewTicketController
  opened={newTicketOpen}
  ondismiss={onnewticketdismiss}
  oncollision={onnewticketcollision}
/>
