<!--
  Content for the call options action sheet.

  Shows "Call via browser" always. Shows "Call to my phone" only when the
  volunteer has a verified consultant phone registered.
  This is a CONTENT component: no Actions/Sheet shell imports.
-->
<script lang="ts">
  import { ActionsGroup, ActionsButton } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";

  export type CallAction = "browser-call" | "phone-call" | "cancel";

  interface CallOptionsContentProps {
    hasVerifiedPhone: boolean;
    onaction: (action: CallAction) => void;
  }

  let { hasVerifiedPhone, onaction }: CallOptionsContentProps = $props();
</script>

<ActionsGroup>
  <ActionsButton onclick={() => onaction("browser-call")}>
    {m.ticket_call_browser()}
  </ActionsButton>
  {#if hasVerifiedPhone}
    <ActionsButton onclick={() => onaction("phone-call")}>
      {m.ticket_call_phone()}
    </ActionsButton>
  {/if}
</ActionsGroup>
<ActionsGroup>
  <ActionsButton onclick={() => onaction("cancel")}
    >{m.common_cancel()}</ActionsButton
  >
</ActionsGroup>
