<!--
  Contact info card for the portal drawer.

  Fetches the sealed contact envelope on open, decrypts it with the
  session's channel private key, and renders phone/email rows. Clears
  decrypted values when the sheet closes. Never fetches eagerly.

  Uses DecryptPlaceholder-style loading for value rows and the portal
  error message family on failure.
-->
<script lang="ts">
  import { Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { formatPhoneDisplay } from "@care-y/shared";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  interface ContactInfoCardProps {
    open: boolean;
    onclose: () => void;
    fetchSealed: () => Promise<string>;
    openEnvelope: (
      sealed: string,
    ) => Promise<{ phone?: string; email?: string }>;
    /** Org display name for the footer copy. */
    orgName: string;
  }

  let {
    open,
    onclose,
    fetchSealed,
    openEnvelope,
    orgName,
  }: ContactInfoCardProps = $props();

  let loading = $state(false);
  let error = $state(false);
  let phone = $state<string | undefined>(undefined);
  let email = $state<string | undefined>(undefined);

  function clearState(): void {
    phone = undefined;
    email = undefined;
    error = false;
    loading = false;
  }

  function handleDismiss(): void {
    clearState();
    onclose();
  }

  // Fetch and decrypt on open
  $effect(() => {
    if (!open) return;
    loading = true;
    error = false;
    phone = undefined;
    email = undefined;

    void (async () => {
      try {
        const sealed = await fetchSealed();
        const result = await openEnvelope(sealed);
        phone = result.phone;
        email = result.email;
      } catch {
        error = true;
      } finally {
        loading = false;
      }
    })();
  });
</script>

<ShellSheet
  opened={open}
  ondismiss={handleDismiss}
  title={m.portal_contact_title()}
>
  <Block>
    {#if loading}
      <div class="contact-loading" role="status" data-testid="contact-loading">
        <span
          class="contact-spinner"
          role="progressbar"
          aria-label={m.portal_contact_title()}
        ></span>
      </div>
    {:else if error}
      <p class="contact-error" data-testid="contact-error">
        {m.portal_contact_error()}
      </p>
    {:else if phone === undefined && email === undefined}
      <p class="contact-empty" data-testid="contact-none">
        {m.portal_contact_none()}
      </p>
    {:else}
      <dl class="contact-list" data-testid="contact-list">
        {#if phone !== undefined}
          <div class="contact-row">
            <dt class="contact-label">{m.portal_contact_phone_label()}</dt>
            <dd class="contact-value" data-testid="contact-phone">
              {formatPhoneDisplay(phone)}
            </dd>
          </div>
        {/if}
        {#if email !== undefined}
          <div class="contact-row">
            <dt class="contact-label">{m.portal_contact_email_label()}</dt>
            <dd class="contact-value" data-testid="contact-email">{email}</dd>
          </div>
        {/if}
      </dl>
      <p class="contact-footer" data-testid="contact-footer">
        {orgName !== ""
          ? m.portal_contact_footer({ org: orgName })
          : m.portal_contact_footer_generic()}
      </p>
    {/if}
  </Block>
</ShellSheet>

<style>
  .contact-loading {
    display: flex;
    justify-content: center;
    padding: var(--space-xl);
  }

  .contact-spinner {
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 2px solid var(--muted);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .contact-spinner {
      animation: none;
      opacity: 0.5;
    }
  }

  .contact-error {
    font-size: var(--text-sm);
    color: var(--danger);
    line-height: 1.6;
  }

  .contact-empty {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.6;
  }

  .contact-list {
    margin: 0;
    padding: 0;
  }

  .contact-row {
    display: flex;
    align-items: baseline;
    gap: var(--space-md);
    padding: var(--space-sm) 0;
  }

  .contact-row + .contact-row {
    border-top: 1px solid color-mix(in srgb, var(--ink) 8%, transparent);
  }

  .contact-label {
    font-size: var(--text-sm);
    color: var(--muted);
    min-width: 5ch;
    flex-shrink: 0;
  }

  .contact-value {
    font-size: var(--text-base);
    color: var(--ink);
    margin: 0;
    word-break: break-all;
  }

  .contact-footer {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.6;
    margin-top: var(--space-md);
  }
</style>
