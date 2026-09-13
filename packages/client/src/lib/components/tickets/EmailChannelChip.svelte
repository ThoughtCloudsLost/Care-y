<!--
  Tiny content chip that labels a bubble as arriving or leaving via email.
  Sits on its own line above the subject. No Konsta imports; pure content.
-->
<script lang="ts">
  import { Mail } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
</script>

<span class="email-channel-chip" data-testid="email-channel-chip">
  <Mail size={12} aria-hidden="true" />
  {m.ticket_email_channel_label()}
</span>

<style>
  .email-channel-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
    margin-bottom: 0.25em;
  }
</style>
