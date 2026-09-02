<!--
  Inner content for an email_outbound follow-up bubble: subject line plus
  the ProseMirror doc rendered as sanitized HTML. Shared by FollowUpBubble
  and the TicketDetail timeline so both thread paths render emails the
  same way. Falls back to plain text when the stored payload is malformed.
-->
<script lang="ts">
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
  import { parseEmailOutbound } from "$lib/editor/email-schema.js";
  import * as m from "$lib/paraglide/messages.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";

  interface EmailBubbleContentProps {
    result: DecryptResult;
    encryptedContent: string | null;
  }

  let { result, encryptedContent }: EmailBubbleContentProps = $props();

  const emailParsed = $derived(
    result.status === "ready" ? parseEmailOutbound(result.value) : null,
  );
</script>

{#if result.status !== "ready"}
  <span class="bubble-text">
    <DecryptPlaceholder
      {result}
      ciphertext={encryptedContent}
      length={30}
      block
    />
  </span>
{:else if emailParsed !== null}
  <span class="email-bubble-subject" data-testid="email-bubble-subject">
    {m.ticket_email_subject_label({ subject: emailParsed.subject })}
  </span>
  <span class="email-bubble-body" data-testid="email-bubble-body">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized by sanitizeArticleHtml (DOMPurify with PURIFY_CONFIG allowlist) inside parseEmailOutbound -->
    {@html emailParsed.bodyHtml}
  </span>
{:else}
  <!-- Malformed JSON fallback: render as plain text -->
  <span class="bubble-text">{result.value}</span>
{/if}

<style>
  .email-bubble-subject {
    display: block;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 0.25em;
    font-size: 0.8125rem;
  }

  .email-bubble-body {
    display: block;
    color: var(--ink);
  }

  .email-bubble-body :global(p) {
    margin: 0 0 0.375em;
  }

  .email-bubble-body :global(ul),
  .email-bubble-body :global(ol) {
    margin: 0.25em 0;
    padding-left: 1.5em;
  }

  .email-bubble-body :global(a) {
    color: var(--brand-accent, var(--ink));
    text-decoration: underline;
  }
</style>
