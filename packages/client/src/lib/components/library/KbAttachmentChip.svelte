<!--
  KB-specific attachment chip wrapper.

  Wraps BaseAttachmentChip with org-key decryption for the download
  pipeline. Non-image attachments (PDFs, docs) on KB articles render
  as these chips below the article body. Decrypt-on-tap: fetches the
  encrypted blob, decrypts with OrgKeyManager, triggers browser download.
-->
<script lang="ts">
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { triggerBlobDownload } from "$lib/components/shared/attachment-download.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import * as m from "$lib/paraglide/messages.js";
  import BaseAttachmentChip from "$lib/components/shared/BaseAttachmentChip.svelte";

  interface Props {
    attachmentId: string;
    filename: string;
    sizeBytes: number;
    disabled?: boolean;
  }

  let { attachmentId, filename, sizeBytes, disabled = false }: Props = $props();

  const kbRouter = requireRouter(trpc.kb, "kb");
  const orgKeyManager = getOrgKeyManager();

  async function handleDownload(id: string): Promise<void> {
    try {
      const result = await kbRouter.downloadAttachmentBlob.query({
        attachmentId: id,
      });
      const raw = Uint8Array.from(atob(result.data), (c) => c.charCodeAt(0));
      const decrypted = await orgKeyManager.decrypt(raw);
      triggerBlobDownload(decrypted, filename);
    } catch (err: unknown) {
      console.error("[KbAttachmentChip] Download failed", { id, err });
      toastStore.show(m.error_generic(), 3000);
    }
  }
</script>

<BaseAttachmentChip
  {attachmentId}
  {filename}
  {sizeBytes}
  ondownload={handleDownload}
  {disabled}
/>
