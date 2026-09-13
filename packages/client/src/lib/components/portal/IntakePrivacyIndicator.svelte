<!--
  Per-field privacy indicator for the public intake form.
  Shows whether the field is fully E2E encrypted or carries a derived
  plaintext signal (routing/priority/alert metadata). Answer text is
  ALWAYS encrypted; only the derived signal differs. Follows the
  visibility-system contextual-hint idiom.
-->
<script lang="ts">
  import { ShieldCheck, ShieldAlert } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface IntakePrivacyIndicatorProps {
    /** True when this field produces a server-visible metadata signal. */
    readonly hasMetadataSignal: boolean;
  }

  let { hasMetadataSignal }: IntakePrivacyIndicatorProps = $props();
</script>

<p class="privacy-indicator" class:privacy-metadata={hasMetadataSignal}>
  {#if hasMetadataSignal}
    <ShieldAlert size={14} aria-hidden="true" />
    <span>{m.intake_privacy_metadata()}</span>
  {:else}
    <ShieldCheck size={14} aria-hidden="true" />
    <span>{m.intake_privacy_encrypted()}</span>
  {/if}
</p>

<style>
  .privacy-indicator {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: var(--text-xs);
    color: var(--care);
    padding: var(--space-xs) var(--space-lg);
    margin: 0;
    line-height: 1.4;
  }

  .privacy-metadata {
    color: var(--muted);
  }
</style>
