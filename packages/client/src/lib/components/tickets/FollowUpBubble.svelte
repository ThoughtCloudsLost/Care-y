<!--
  Renders a single follow-up as a chat bubble, system event, or private note.
  Used by TicketDetail (preview block) and ReplySheet for consistent rendering
  of follow-up records without the full detail-page features (long-press, media, editing).
-->
<script lang="ts">
  import { followUpKind } from "$lib/tickets/follow-up-utils.js";
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
  import type { ReactionSummary, ReactionType } from "@care-y/shared";
  import { sanitizeArticleHtml } from "$lib/utils/render-article.js";
  import { Node as PMNode, DOMSerializer } from "prosemirror-model";
  import { emailSchema } from "$lib/editor/email-schema.js";
  import * as m from "$lib/paraglide/messages.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import ConversationBubble from "$lib/components/tickets/ConversationBubble.svelte";
  import SystemEvent from "$lib/components/tickets/SystemEvent.svelte";
  import PrivateNote from "$lib/components/tickets/PrivateNote.svelte";

  interface FollowUpBubbleProps {
    followUp: {
      readonly id: string;
      readonly source: string;
      readonly type: string;
      readonly encryptedContent: string | null;
      readonly createdAt: string;
      readonly eventParams?: Record<string, unknown> | null;
    };
    result: DecryptResult;
    clientAlias?: string | null;
    isOwnNote?: boolean;
    searchTerm?: string | null;
    noteTypeName?: string;
    noteTypeIcon?: string;
    reactions?: ReactionSummary[];
    currentUserId?: string;
    ontogglereaction?: (reaction: ReactionType) => void;
    resolveUserName?: (userId: string) => string;
  }

  let {
    followUp,
    result,
    clientAlias,
    isOwnNote = false,
    searchTerm = null,
    noteTypeName,
    noteTypeIcon,
    reactions,
    currentUserId,
    ontogglereaction,
    resolveUserName,
  }: FollowUpBubbleProps = $props();

  const kind = $derived(followUpKind(followUp));
  const isEmailOutbound = $derived(followUp.type === "email_outbound");

  /** Parse email_outbound JSON payload into subject + sanitized body HTML. */
  const emailParsed = $derived.by(
    (): { subject: string; bodyHtml: string } | null => {
      if (!isEmailOutbound || result.status !== "ready") return null;
      const raw = result.value;
      try {
        const parsed: unknown = JSON.parse(raw);
        if (
          typeof parsed !== "object" ||
          parsed === null ||
          !("subject" in parsed) ||
          !("doc" in parsed)
        )
          return null;
        const subject =
          typeof parsed.subject === "string" ? parsed.subject : "";
        // Render doc JSON through emailSchema -> DOMSerializer -> sanitizer.
        const pmDoc = PMNode.fromJSON(emailSchema, parsed.doc);
        const serializer = DOMSerializer.fromSchema(emailSchema);
        const fragment = serializer.serializeFragment(pmDoc.content);
        const div = document.createElement("div");
        div.appendChild(fragment);
        const bodyHtml = sanitizeArticleHtml(div.innerHTML);
        return { subject, bodyHtml };
      } catch {
        // Malformed JSON: fall back to plain text rendering below.
        return null;
      }
    },
  );
</script>

{#if kind === "system"}
  <SystemEvent
    type={followUp.type}
    timestamp={followUp.createdAt}
    eventParams={followUp.eventParams}
    {resolveUserName}
  />
{:else if kind === "note"}
  <PrivateNote
    {result}
    encryptedContent={followUp.encryptedContent}
    authorName={undefined}
    timestamp={followUp.createdAt}
    isOwn={isOwnNote}
    {searchTerm}
    {noteTypeName}
    {noteTypeIcon}
    {reactions}
    {currentUserId}
    {ontogglereaction}
  />
{:else if isEmailOutbound}
  <ConversationBubble
    direction="sent"
    source="volunteer"
    timestamp={followUp.createdAt}
  >
    {#if result.status !== "ready"}
      <span class="bubble-text">
        <DecryptPlaceholder
          {result}
          ciphertext={followUp.encryptedContent}
          length={30}
          block
        />
      </span>
    {:else if emailParsed !== null}
      <span class="email-bubble-subject" data-testid="email-bubble-subject">
        {m.ticket_email_subject_label({ subject: emailParsed.subject })}
      </span>
      <span class="email-bubble-body" data-testid="email-bubble-body">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized by sanitizeArticleHtml (DOMPurify with PURIFY_CONFIG allowlist) -->
        {@html emailParsed.bodyHtml}
      </span>
    {:else}
      <!-- Malformed JSON fallback: render as plain text -->
      <span class="bubble-text">{result.value}</span>
    {/if}
  </ConversationBubble>
{:else}
  <ConversationBubble
    direction={followUp.source === "client" ? "received" : "sent"}
    speaker={followUp.source === "client"
      ? (clientAlias ?? undefined)
      : undefined}
    source={followUp.source === "client" ? "client" : "volunteer"}
    timestamp={followUp.createdAt}
  >
    <span class="bubble-text">
      <DecryptPlaceholder
        {result}
        ciphertext={followUp.encryptedContent}
        length={30}
        block
        {searchTerm}
      />
    </span>
  </ConversationBubble>
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
