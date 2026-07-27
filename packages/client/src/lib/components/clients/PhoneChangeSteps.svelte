<!--
  The gated part of a phone change, shared by every surface that offers one.

  Two steps live here. The confirm step warns that the change reaches every
  ticket for the client. The conflict step appears when the server reports the
  number already belongs to another client, and offers a merge instead.

  Display and callbacks only. The host owns the mutation, the step state, and
  what happens after each callback, so the warning copy stays in one place
  while ticket detail and the client edit sheet drive it differently.
-->
<script lang="ts">
  import { Block, Button, Preloader } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";

  interface PhoneChangeStepsProps {
    readonly step: "confirm" | "conflict";
    /** Alias of the client whose number is changing. */
    readonly clientAlias: string;
    /** Alias of the client that already holds the number, conflict step only. */
    readonly conflictAlias: string | null;
    /** True while the host's phone mutation is in flight. */
    readonly pending: boolean;
    readonly onconfirm: () => void;
    readonly oncancel: () => void;
    readonly onmerge: () => void;
    readonly ontryanother: () => void;
  }

  let {
    step,
    clientAlias,
    conflictAlias,
    pending,
    onconfirm,
    oncancel,
    onmerge,
    ontryanother,
  }: PhoneChangeStepsProps = $props();
</script>

{#if step === "confirm"}
  <div class="phone-change-step">
    <Block>
      <p class="step-heading confirm-heading">
        {m.client_phone_confirm_title()}
      </p>
      <p class="confirm-body">
        {m.client_phone_confirm_body(withTerms({ alias: clientAlias }))}
      </p>
    </Block>
    <Block>
      <Button large class="confirm-btn" onclick={onconfirm} disabled={pending}>
        {#if pending}
          <Preloader class="w-5 h-5" />
        {:else}
          {m.client_phone_confirm_title()}
        {/if}
      </Button>
      <div class="btn-spacer"></div>
      <Button large outline onclick={oncancel} disabled={pending}>
        {m.common_cancel()}
      </Button>
    </Block>
  </div>
{:else}
  <div class="phone-change-step">
    <Block>
      <p class="step-heading conflict-heading">
        {m.client_phone_conflict_title()}
      </p>
      <p class="conflict-body">
        {m.client_phone_conflict_body({ alias: conflictAlias ?? "" })}
      </p>
    </Block>
    <Block>
      <Button large onclick={onmerge} disabled={pending}>
        {m.client_phone_conflict_merge(withTerms())}
      </Button>
      <div class="btn-spacer"></div>
      <Button large outline onclick={ontryanother} disabled={pending}>
        {m.client_phone_edit()}
      </Button>
    </Block>
  </div>
{/if}

<style>
  .phone-change-step {
    display: flex;
    flex-direction: column;
    padding: var(--space-md) 0;
  }

  .step-heading {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--ink);
    margin: 0 0 var(--space-sm) 0;
  }

  .confirm-heading {
    color: var(--urgent);
  }

  .confirm-body {
    color: var(--urgent);
    font-size: var(--text-base);
    margin: 0;
    line-height: 1.5;
  }

  :global(.confirm-btn) {
    --k-color-primary: var(--danger);
  }

  .conflict-heading {
    color: var(--urgent);
  }

  .conflict-body {
    color: var(--ink);
    font-size: var(--text-base);
    margin: 0;
    line-height: 1.5;
  }

  .btn-spacer {
    height: var(--space-sm);
  }
</style>
