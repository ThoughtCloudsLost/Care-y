<!--
  Test-only stub for TicketCompose. Renders a textarea and send button
  that call onsendreply with the entered text. Used by ReplySheet tests
  to exercise the reply send pipeline without the full compose component.
-->
<script lang="ts">
  interface Props {
    ticketId: string;
    inline?: boolean;
    sending?: boolean;
    onsendreply: (text: string) => void;
    onsendsms?: (text: string) => void;
    onplus?: (anchor: HTMLElement) => void;
    [key: string]: unknown;
  }

  let { onsendreply, ..._rest }: Props = $props();

  let text = $state("");
</script>

<div data-testid="compose-stub">
  <textarea data-testid="compose-textarea" bind:value={text}></textarea>
  <!-- Located by test id only; a label would need an i18n key this
       test-only stub has no business adding. -->
  <button data-testid="compose-send" onclick={() => onsendreply(text)}></button>
</div>
