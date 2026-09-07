<!--
  Test-only stub for TicketCompose. Renders a textarea and send button
  that call onsendreply with the entered text. Mirrors the real compose
  bar by persisting the reply draft to draft-store on input, since the
  send pipeline reads the draft at send time rather than taking the text
  as an argument. Used by ReplySheet tests to exercise the reply send
  pipeline without the full compose component.
-->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import { setDraftForMode } from "$lib/tickets/draft-store.svelte.js";

  interface Props {
    ticketId: string;
    inline?: boolean;
    sending?: boolean;
    emailExpected?: boolean;
    onsendreply: (text: string) => void;
    onsendsms?: (text: string) => void;
    onplus?: (anchor: HTMLElement) => void;
    [key: string]: unknown;
  }

  let {
    ticketId,
    onsendreply,
    emailExpected = false,
    ..._rest
  }: Props = $props();

  let text = $state("");

  function handleInput(
    event: Event & { currentTarget: EventTarget & HTMLTextAreaElement },
  ): void {
    text = event.currentTarget.value;
    setDraftForMode(ticketId, "reply", text);
  }
</script>

<div data-testid="compose-stub" data-email-expected={String(emailExpected)}>
  <textarea data-testid="compose-textarea" value={text} oninput={handleInput}
  ></textarea>
  <button
    data-testid="compose-send"
    aria-label={m.ticket_send()}
    onclick={() => onsendreply(text)}
  ></button>
</div>
