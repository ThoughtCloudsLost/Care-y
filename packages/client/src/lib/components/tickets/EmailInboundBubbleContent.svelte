<!--
  Inner content for an email_inbound follow-up bubble: subject line,
  plain-text body, unverified From line, dropped-attachment note, and
  caution affordance (popover). Shared by FollowUpBubble and PortalThread
  so both thread paths render inbound email the same way.

  Falls back to plain text when the stored payload is malformed, mirroring
  the email_outbound fallback behavior. Body renders via text interpolation
  only, never {@html}.
-->
<script lang="ts">
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
  import type { EmailInboundPayload } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import EmailInboundCaution from "$lib/components/tickets/EmailInboundCaution.svelte";
  import EmailChannelChip from "$lib/components/tickets/EmailChannelChip.svelte";

  interface EmailInboundBubbleContentProps {
    result: DecryptResult;
    encryptedContent: string | null;
  }

  let { result, encryptedContent }: EmailInboundBubbleContentProps = $props();

  /**
   * Parse the decrypted JSON into a typed inbound email payload.
   * Returns null for any malformed data (triggers plain-text fallback).
   */
  function parseInboundPayload(raw: string): EmailInboundPayload | null {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        !("text" in parsed) ||
        !("from" in parsed)
      )
        return null;
      const obj = parsed as Record<string, unknown>;
      return {
        subject: typeof obj.subject === "string" ? obj.subject : "",
        text: typeof obj.text === "string" ? obj.text : "",
        from: typeof obj.from === "string" ? obj.from : "",
        droppedAttachments:
          typeof obj.droppedAttachments === "number"
            ? obj.droppedAttachments
            : 0,
      };
    } catch {
      return null;
    }
  }

  const payload = $derived(
    result.status === "ready" ? parseInboundPayload(result.value) : null,
  );
</script>

<EmailChannelChip />
{#if result.status !== "ready"}
  <span class="bubble-text">
    <DecryptPlaceholder
      {result}
      ciphertext={encryptedContent}
      length={30}
      block
    />
  </span>
{:else if payload !== null}
  {#if payload.subject !== ""}
    <span class="email-inbound-subject" data-testid="email-inbound-subject">
      {m.ticket_email_subject_label({ subject: payload.subject })}
    </span>
  {/if}
  <span class="email-inbound-body" data-testid="email-inbound-body">
    {payload.text}
  </span>
  <span class="email-inbound-from" data-testid="email-inbound-from">
    {m.ticket_email_inbound_from_label({ from: payload.from })}
  </span>
  {#if payload.droppedAttachments > 0}
    <span class="email-inbound-dropped" data-testid="email-inbound-dropped">
      {payload.droppedAttachments === 1
        ? m.ticket_email_inbound_dropped_attachments_one({ count: 1 })
        : m.ticket_email_inbound_dropped_attachments_other({
            count: payload.droppedAttachments,
          })}
    </span>
  {/if}
  <EmailInboundCaution />
{:else}
  <!-- Malformed JSON fallback: render as plain text -->
  <span class="bubble-text">{result.value}</span>
{/if}

<style>
  .email-inbound-subject {
    display: block;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 0.25em;
    font-size: 0.8125rem;
  }

  .email-inbound-body {
    display: block;
    color: var(--ink);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .email-inbound-from {
    display: block;
    color: var(--muted);
    font-size: 0.75rem;
    margin-top: 0.375em;
    font-style: italic;
  }

  .email-inbound-dropped {
    display: block;
    color: var(--muted);
    font-size: 0.75rem;
    margin-top: 0.25em;
  }
</style>
