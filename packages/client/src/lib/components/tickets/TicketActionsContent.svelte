<!--
  Content for the ticket actions action sheet ("..." menu).

  Renders context-aware actions based on current ticket state.
  This is a CONTENT component: no Actions/Sheet shell imports.
  The route file wraps this in ShellActionSheet.
-->
<script lang="ts">
  import { ActionsGroup, ActionsButton } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";

  export type TicketAction =
    | "take"
    | "release"
    | "assign"
    | "hold"
    | "unhold"
    | "close"
    | "reopen"
    | "watch"
    | "unwatch"
    | "client-info"
    | "zoom"
    | "cancel";

  interface TicketActionsContentProps {
    ticketStatus: string;
    isOnHold: boolean;
    isAssignedToMe: boolean;
    isWatching: boolean;
    isZoomedOut: boolean;
    onaction: (action: TicketAction) => void;
  }

  let {
    ticketStatus,
    isOnHold,
    isAssignedToMe,
    isWatching,
    isZoomedOut,
    onaction,
  }: TicketActionsContentProps = $props();
</script>

<ActionsGroup>
  {#if !isAssignedToMe}
    <ActionsButton onclick={() => onaction("take")}
      >{m.ticket_action_take()}</ActionsButton
    >
  {:else}
    <ActionsButton onclick={() => onaction("release")}
      >{m.ticket_action_release()}</ActionsButton
    >
  {/if}
  <ActionsButton onclick={() => onaction("assign")}
    >{m.ticket_action_assign()}</ActionsButton
  >
  <ActionsButton onclick={() => onaction(isOnHold ? "unhold" : "hold")}>
    {isOnHold ? m.ticket_action_unhold() : m.ticket_action_hold()}
  </ActionsButton>
  <ActionsButton
    onclick={() => onaction(ticketStatus === "open" ? "close" : "reopen")}
  >
    {ticketStatus === "open"
      ? m.ticket_action_close()
      : m.ticket_action_reopen()}
  </ActionsButton>
  <ActionsButton onclick={() => onaction(isWatching ? "unwatch" : "watch")}>
    {isWatching ? m.ticket_action_unwatch() : m.ticket_action_watch()}
  </ActionsButton>
  <ActionsButton onclick={() => onaction("client-info")}
    >{m.ticket_action_client_info()}</ActionsButton
  >
  <ActionsButton onclick={() => onaction("zoom")}>
    {isZoomedOut ? m.ticket_zoom_in() : m.ticket_zoom_out()}
  </ActionsButton>
  <!-- 6m extends here with pin action -->
</ActionsGroup>
<ActionsGroup>
  <ActionsButton onclick={() => onaction("cancel")}
    >{m.common_cancel()}</ActionsButton
  >
</ActionsGroup>
