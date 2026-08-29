<!--
  Per-follow-up media presenter.

  Uses ticket-level queries (shared across all FollowUpMedia instances
  via TanStack key deduplication). The first instance triggers the fetch;
  all others get instant cache hits. Filters to this follow-up client-side.

  Branches on fileKeyWrap to select the decryption envelope (ADR-089):
  null means the blob is encrypted directly under the ticket key (MMS
  ingest), non-null means a file key that must be unwrapped first.
-->
<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { ticketKeys } from "$lib/query/keys";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { getCryptoBridge } from "$lib/crypto/context.js";
  import VoicemailPlayer from "./VoicemailPlayer.svelte";
  import MmsImage from "./MmsImage.svelte";
  import AttachmentChip from "./AttachmentChip.svelte";
  import FileKeyAttachmentChip from "./FileKeyAttachmentChip.svelte";
  import FileKeyMmsImage from "./FileKeyMmsImage.svelte";
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

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const bridge = getCryptoBridge();

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
  {#if att.fileKeyWrap !== null}
    <!-- File-key envelope (ADR-089): unwrap the file key, then decrypt. -->
    {#if att.contentType?.startsWith("image/")}
      <FileKeyMmsImage
        attachmentId={att.id}
        {ticketId}
        fileKeyWrap={att.fileKeyWrap}
        contentType={att.contentType}
        {bridge}
        alt={m.ticket_mms_image()}
        onopen={(url: string) => onlightbox?.(url)}
      />
    {:else}
      <FileKeyAttachmentChip
        attachmentId={att.id}
        {ticketId}
        fileKeyWrap={att.fileKeyWrap}
        encryptedFilename={att.encryptedFilename}
        sizeBytes={att.sizeBytes}
        {bridge}
      />
    {/if}
  {:else}
    <!-- Direct envelope (MMS ingest): blob encrypted under the ticket key. -->
    {#if att.contentType?.startsWith("image/")}
      <MmsImage
        attachmentId={att.id}
        {ticketId}
        {keyWrap}
        {bridge}
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
  {/if}
{/each}
