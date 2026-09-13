<!--
  Pending attachment chip strip. Shows a horizontal row of chips for
  files currently encrypting, uploading, or failed. Each chip has a
  remove button. Shared between the ticket detail compose bar and the
  reply sheet.
-->
<script lang="ts">
  import { Chip } from "konsta/svelte";
  import { X } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { AttachmentId } from "@care-y/shared";
  import type { PendingAttachment } from "$lib/composables/ticket-detail/create-attachment-upload.svelte.js";

  interface PendingAttachmentStripProps {
    readonly entries: readonly PendingAttachment[];
    readonly onremove: (attachmentId: AttachmentId) => void;
  }

  let { entries, onremove }: PendingAttachmentStripProps = $props();
</script>

{#if entries.length > 0}
  <div
    class="pending-attachments"
    role="list"
    aria-label={m.attachment_pending_list()}
  >
    {#each entries as entry (entry.attachmentId)}
      <Chip
        class="attachment-chip"
        outline={entry.status === "failed"}
        role="listitem"
      >
        <span class="attachment-chip-name">{entry.filename}</span>
        {#if entry.status === "encrypting" || entry.status === "uploading"}
          <span class="attachment-chip-status">
            {m.attachment_uploading()}
          </span>
        {:else if entry.status === "failed"}
          <span class="attachment-chip-status attachment-chip-failed">
            {m.attachment_failed()}
          </span>
        {/if}
      </Chip>
      <button
        type="button"
        class="attachment-remove-btn"
        onclick={() => onremove(entry.attachmentId)}
        aria-label={m.attachment_remove({ name: entry.filename })}
      >
        <X size={14} aria-hidden="true" />
      </button>
    {/each}
  </div>
{/if}

<style>
  .pending-attachments {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 6px 16px;
    align-items: center;
  }

  .attachment-chip-name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .attachment-chip-status {
    font-size: var(--text-xs);
    color: var(--muted);
    margin-left: 4px;
  }

  .attachment-chip-failed {
    color: var(--danger);
  }

  .attachment-remove-btn {
    appearance: none;
    border: none;
    background: none;
    padding: 6px;
    margin: -6px 0 -6px -2px;
    color: var(--muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
  }
</style>
