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
    MessageCircleReply,
    NotepadTextDashed,
    MessageSquare,
    Mail,
  } from "@lucide/svelte";
  import { PORTAL_ALLOWED_CONTENT_TYPES } from "@care-y/shared";
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
    /** Called when "Reply to client" is tapped. Activates reply mode. */
    onreply?: () => void;
    /** Called when "Text Client" is tapped. Caller handles exposure hint + SMS. */
    ontextclient?: () => void;
    /** Called when a file is picked. The caller owns encryption and upload. */
    onattach?: (file: File) => void;
    /** Called when "Email client" is tapped. Shown only when the client has an email. */
    onemailclient?: () => void;
  }

  let {
    opened,
    ondismiss,
    target,
    ticketId,
    onpresetselect,
    onreply,
    ontextclient,
    onattach,
    onemailclient,
  }: ComposeActionsProps = $props();

  let fileInputEl = $state<HTMLInputElement | null>(null);

  let presetSheetOpen = $state(false);
  let noteSheetOpen = $state(false);

  function handleReply(): void {
    ondismiss();
    onreply?.();
  }

  function handleAttach(): void {
    ondismiss();
    fileInputEl?.click();
  }

  function handleFileChange(e: Event): void {
    const input = e.target;
    if (!(input instanceof HTMLInputElement)) return;
    const file = input.files?.[0];
    if (file) {
      onattach?.(file);
    }
    // Reset so the same file can be re-picked after removal.
    input.value = "";
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

  function handleEmailClient(): void {
    ondismiss();
    onemailclient?.();
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
    {#if onreply}
      <ListItem
        title={m.ticket_reply_to_client(withTerms())}
        onclick={handleReply}
      >
        {#snippet media()}
          <MessageCircleReply size={20} aria-hidden="true" />
        {/snippet}
      </ListItem>
    {/if}
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
    {#if onemailclient}
      <ListItem
        title={m.ticket_email_title(withTerms())}
        onclick={handleEmailClient}
      >
        {#snippet media()}
          <Mail size={20} aria-hidden="true" />
        {/snippet}
      </ListItem>
    {/if}
  </KList>
</ShellPopover>

<!-- Hidden file input triggered programmatically from the Attach menu item.
     The accept attribute restricts the picker to the shared allowlist. -->
<input
  bind:this={fileInputEl}
  type="file"
  accept={PORTAL_ALLOWED_CONTENT_TYPES.join(",")}
  onchange={handleFileChange}
  class="sr-only"
  tabindex={-1}
  aria-hidden="true"
/>

<ShellSheet
  opened={presetSheetOpen}
  ondismiss={() => {
    presetSheetOpen = false;
  }}
  title={m.ticket_preset_replies()}
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
