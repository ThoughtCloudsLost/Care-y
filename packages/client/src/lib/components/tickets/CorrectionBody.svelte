<!--
  Structured correction body. Renders labeled rows for phone and/or
  email from a parsed ContactCorrectionPayload. Used by both org
  and portal/account thread surfaces so the correction card is
  consistent everywhere.

  When the payload includes a phone and onapplyphone is provided,
  renders an Apply button that opens the phone-edit flow prefilled.
  Email has no apply action yet (client email lands in a later phase).
-->
<script lang="ts">
  import { ExternalLink } from "@lucide/svelte";
  import { Button } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { ContactCorrectionPayload } from "@care-y/shared";

  interface CorrectionBodyProps {
    payload: ContactCorrectionPayload;
    onapplyphone?: (phone: string) => void;
  }

  let { payload, onapplyphone }: CorrectionBodyProps = $props();
</script>

<div class="correction-body" data-testid="correction-body">
  {#if payload.phone !== undefined}
    <div class="correction-row" data-testid="correction-row-phone">
      <span class="correction-label">{m.correction_body_new_phone()}</span>
      <span class="correction-value">{payload.phone}</span>
    </div>
  {/if}
  {#if payload.email !== undefined}
    <div class="correction-row" data-testid="correction-row-email">
      <span class="correction-label">{m.correction_body_new_email()}</span>
      <span class="correction-value">{payload.email}</span>
    </div>
  {/if}
  {#if payload.phone !== undefined && onapplyphone !== undefined}
    <div class="correction-apply">
      <Button
        small
        outline
        onclick={() => onapplyphone(payload.phone ?? "")}
        data-testid="correction-apply-phone"
      >
        <ExternalLink size={14} />
        {m.correction_body_apply_phone()}
      </Button>
    </div>
  {/if}
</div>

<style>
  .correction-body {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 6px 0 2px;
  }

  .correction-row {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .correction-label {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .correction-value {
    font-size: 0.875rem;
    color: var(--ink);
    word-break: break-all;
  }

  .correction-apply {
    margin-top: 4px;
    display: flex;
    gap: 0.5rem;
  }

  .correction-apply :global(button) {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
</style>
