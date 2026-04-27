<!--
  Per-follow-up media presenter.

  Uses ticket-level queries (shared across all FollowUpMedia instances
  via TanStack key deduplication). The first instance triggers the fetch;
  all others get instant cache hits. Filters to this follow-up client-side.
-->
<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { ticketKeys } from "$lib/query/keys";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import VoicemailPlayer from "./VoicemailPlayer.svelte";
  import MmsImage from "./MmsImage.svelte";
  import AttachmentChip from "./AttachmentChip.svelte";
  import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";

  interface Props {
    followupId: string;
    ticketId: string;
    keyWrap: TicketKeyWrap | null;
    hasRecording: boolean;
    hasImage: boolean;
    hasFile: boolean;
    onlightbox?: (url: string) => void;
  }

  let {
    followupId,
    ticketId,
    keyWrap,
    hasRecording,
    hasImage,
    hasFile,
    onlightbox,
  }: Props = $props();

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;

  const recordingsQuery = createQuery(() => ({
    queryKey: ticketKeys.recordings(ticketId),
    queryFn: async () =>
      ticketRouter.listRecordings.query({ ticketId, limit: 50 }),
    enabled: hasRecording,
  }));

  const attachmentsQuery = createQuery(() => ({
    queryKey: ticketKeys.attachments(ticketId),
    queryFn: async () =>
      ticketRouter.listAttachments.query({ ticketId, limit: 50 }),
    enabled: hasImage || hasFile,
  }));

  const recordings = $derived(
    (recordingsQuery.data ?? []).filter((r) => r.followupId === followupId),
  );
  const attachments = $derived(
    (attachmentsQuery.data ?? []).filter((a) => a.followupId === followupId),
  );
</script>

{#each recordings as rec (rec.id)}
  <VoicemailPlayer
    recordingId={rec.id}
    {ticketId}
    {keyWrap}
    durationSeconds={rec.durationSeconds}
  />
{/each}

{#each attachments as att (att.id)}
  {#if att.contentType?.startsWith("image/")}
    <MmsImage
      attachmentId={att.id}
      {ticketId}
      {keyWrap}
      alt={m.ticket_mms_image()}
      onopen={(url: string) => onlightbox?.(url)}
    />
  {:else}
    <AttachmentChip
      attachmentId={att.id}
      {ticketId}
      {keyWrap}
      filename={att.encryptedFilename !== null ? "..." : "file"}
      sizeBytes={att.sizeBytes}
    />
  {/if}
{/each}
