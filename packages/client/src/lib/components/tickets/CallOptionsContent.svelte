<!--
  Content for the call options action sheet.

  Shows "Call via browser" always. Shows "Call to my phone" only when the
  volunteer has a verified consultant phone registered.
  This is a CONTENT component: no Actions/Sheet shell imports.
-->
<script lang="ts">
  import { ActionsGroup, ActionsButton, ActionsLabel } from "konsta/svelte";
  import { UserPen } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";

  export type CallAction = "browser-call" | "phone-call" | "cancel";

  interface CallOptionsContentProps {
    hasVerifiedPhone: boolean;
    /** When true, a contact correction is pending. */
    hasUnacknowledgedCorrection?: boolean;
    onaction: (action: CallAction) => void;
  }

  let {
    hasVerifiedPhone,
    hasUnacknowledgedCorrection: correctionPending = false,
    onaction,
  }: CallOptionsContentProps = $props();
</script>

{#if correctionPending}
  <ActionsGroup>
    <ActionsLabel>
      <span
        class="correction-warning-label"
        role="status"
        data-testid="call-correction-warning"
      >
        <UserPen size={14} aria-hidden="true" />
        {m.contact_correction_pending_warning()}
      </span>
    </ActionsLabel>
  </ActionsGroup>
{/if}
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

<style>
  .correction-warning-label {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--care);
  }
</style>
