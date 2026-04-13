<!--
  Per-follow-up lazy media loader.

  Replaces the bulk-fetch-and-map approach in TicketDetail. Each
  instance creates its own TanStack queries gated by media flags
  (hasRecording, hasImage, hasFile). Media only loads when the
  follow-up bubble renders, not on ticket open.

  TanStack cache keys use the ["ticket", ticketId, "recordings"] prefix
  so SSE invalidation via prefix matching catches these caches.
-->
<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
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
    queryKey: ["ticket", ticketId, "recordings", "followup", followupId],
    queryFn: async () =>
      ticketRouter.listRecordings.query({
        ticketId,
        followupId,
        limit: 10,
      }),
    enabled: hasRecording,
  }));

  const attachmentsQuery = createQuery(() => ({
    queryKey: ["ticket", ticketId, "attachments", "followup", followupId],
    queryFn: async () =>
      ticketRouter.listAttachments.query({
        ticketId,
        followupId,
        limit: 10,
      }),
    enabled: hasImage || hasFile,
  }));

  const recordings = $derived(recordingsQuery.data ?? []);
  const attachments = $derived(attachmentsQuery.data ?? []);
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
