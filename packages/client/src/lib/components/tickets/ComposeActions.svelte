<!--
  Shared compose actions menu (+ button). Used by both the ticket detail
  route and the quick-reply sheet. Renders the popover menu, preset reply
  sheet, and internal note sheet.
-->
<script lang="ts">
  import { List as KList, ListItem } from "konsta/svelte";
  import {
    Paperclip,
    MessageSquareReply,
    NotepadTextDashed,
    MessageSquare,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import ShellPopover from "$lib/shell/ShellPopover.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import PresetReplyContent from "$lib/components/tickets/PresetReplyContent.svelte";
  import InternalNoteSheet from "$lib/components/tickets/InternalNoteSheet.svelte";

  interface ComposeActionsProps {
    opened: boolean;
    ondismiss: () => void;
    target?: HTMLElement;
    ticketId: string;
    /** Called when a preset reply is selected (caller sets draft text). */
    onpresetselect: (body: string) => void;
    /** Called when "Text Client" is tapped. Caller handles exposure hint + SMS sheet. */
    ontextclient?: () => void;
  }

  let {
    opened,
    ondismiss,
    target,
    ticketId,
    onpresetselect,
    ontextclient,
  }: ComposeActionsProps = $props();

  let presetSheetOpen = $state(false);
  let noteSheetOpen = $state(false);

  function handleAttach(): void {
    ondismiss();
    // Stub: file attachment wired separately.
  }

  function handlePreset(): void {
    ondismiss();
    presetSheetOpen = true;
  }

  function handleNote(): void {
    ondismiss();
    noteSheetOpen = true;
  }

  function handleTextClient(): void {
    ondismiss();
    ontextclient?.();
  }
</script>

<ShellPopover
  {opened}
  {target}
  placement="top"
  {ondismiss}
  ariaLabel={m.ticket_compose_actions()}
>
  <KList nested>
    <ListItem title={m.ticket_attach_file()} onclick={handleAttach}>
      {#snippet media()}
        <Paperclip size={20} aria-hidden="true" />
      {/snippet}
    </ListItem>
    <ListItem title={m.ticket_preset_replies()} onclick={handlePreset}>
      {#snippet media()}
        <MessageSquareReply size={20} aria-hidden="true" />
      {/snippet}
    </ListItem>
    <ListItem title={m.ticket_add_internal_note()} onclick={handleNote}>
      {#snippet media()}
        <NotepadTextDashed size={20} aria-hidden="true" />
      {/snippet}
    </ListItem>
    {#if ontextclient}
      <ListItem
        title={m.ticket_sms_title(withTerms())}
        onclick={handleTextClient}
      >
        {#snippet media()}
          <MessageSquare size={20} aria-hidden="true" />
        {/snippet}
      </ListItem>
    {/if}
  </KList>
</ShellPopover>

<ShellSheet
  opened={presetSheetOpen}
  ondismiss={() => {
    presetSheetOpen = false;
  }}
>
  <PresetReplyContent
    onselect={(body: string) => {
      onpresetselect(body);
      presetSheetOpen = false;
    }}
  />
</ShellSheet>

<InternalNoteSheet
  opened={noteSheetOpen}
  ondismiss={() => {
    noteSheetOpen = false;
  }}
  {ticketId}
/>
