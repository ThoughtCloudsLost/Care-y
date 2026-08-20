<!--
  Status line rendered beneath share_link bubble content. Resolves
  a share's status (waiting / opened / expired) from a parent-provided
  shares query result, matched via the follow-up's eventParams.shareId.

  Shows InlineSkeleton while the shares query is still loading.
-->
<script lang="ts">
  import { Link2 } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";

  interface ShareStatusLineProps {
    /** Share row matched from the listShares query. Undefined while loading. */
    share: { readAt: string | null; expiresAt: string } | undefined;
    /** Whether the parent shares query is still in flight. */
    loading: boolean;
  }

  let { share, loading }: ShareStatusLineProps = $props();

  const statusText = $derived.by((): string => {
    if (share === undefined) return "";
    if (share.readAt !== null) return m.share_status_opened();
    const expired = new Date(share.expiresAt).getTime() < Date.now();
    if (expired) return m.share_status_expired();
    return m.share_status_waiting();
  });
</script>

<div class="share-status" data-testid="share-status-line">
  <Link2 size={12} aria-hidden="true" />
  <span class="share-status-label">{m.followup_type_share_link()}</span>
  <!-- care-y-ignore no-hardcoded-user-strings -- decorative separator, not translatable -->
  <span class="share-status-sep" aria-hidden="true">·</span>
  <InlineSkeleton {loading} width="5ch">
    <span class="share-status-value" data-testid="share-status-value">
      {statusText}
    </span>
  </InlineSkeleton>
</div>

<style>
  .share-status {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.6875rem;
    color: var(--muted);
    padding-top: 4px;
  }

  .share-status-label {
    white-space: nowrap;
  }

  .share-status-sep {
    flex-shrink: 0;
  }

  .share-status-value {
    white-space: nowrap;
  }
</style>
