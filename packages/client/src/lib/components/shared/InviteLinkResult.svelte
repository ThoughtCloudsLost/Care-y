<script lang="ts">
  import { Button } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface GeneratedInvite {
    readonly url: string;
    readonly expiresAt: string;
  }

  interface InviteLinkResultProps {
    readonly invites: GeneratedInvite[];
    readonly oncopy: (url: string) => void;
  }

  let { invites, oncopy }: InviteLinkResultProps = $props();

  function formatExpiry(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString();
  }
</script>

{#each invites as invite, i (invite.url)}
  <div
    class="invite-card"
    role="group"
    aria-label={m.admin_invite_link_card_label({ index: String(i + 1) })}
  >
    <p class="invite-label">{m.admin_invite_link_url_label()}</p>
    <code class="invite-url">{window.location.origin}{invite.url}</code>
    <p class="invite-expires">
      {m.admin_invite_link_expires({
        expiresAt: formatExpiry(invite.expiresAt),
      })}
    </p>
    <Button small outline onclick={() => oncopy(invite.url)}>
      {m.admin_invite_link_copy()}
    </Button>
  </div>
{/each}

<style>
  .invite-card {
    background: color-mix(in srgb, var(--ink) 5%, transparent);
    border-radius: 12px;
    padding: var(--space-md);
  }

  .invite-card + .invite-card {
    margin-top: var(--space-md);
  }

  .invite-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
    margin: 0 0 var(--space-sm);
  }

  .invite-url {
    font-family: var(--theme-font-mono);
    font-size: 0.75rem;
    color: var(--ink);
    word-break: break-all;
    user-select: all;
    display: block;
    margin-bottom: var(--space-sm);
  }

  .invite-expires {
    font-size: 0.8125rem;
    color: var(--muted);
    margin: 0 0 var(--space-md);
  }
</style>
