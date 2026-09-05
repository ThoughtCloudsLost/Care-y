<!--
  Contact correction sheet. Collects a new phone number and/or email
  from the client and passes a structured payload to the page for
  submission as a contact_correction follow-up.

  Security constraint: never displays the on-file contact info. Bare-link
  sessions must not receive existing PII; the fields start blank and the
  server-side values are never fetched or shown.
-->
<script lang="ts">
  import { List, ListInput } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import type { ContactCorrectionPayload } from "@care-y/shared";

  interface ContactCorrectionSheetProps {
    opened: boolean;
    ondismiss: () => void;
    onsubmit: (payload: ContactCorrectionPayload) => void;
    pending?: boolean;
  }

  let {
    opened,
    ondismiss,
    onsubmit,
    pending = false,
  }: ContactCorrectionSheetProps = $props();

  let phone = $state("");
  let email = $state("");

  const trimmedPhone = $derived(phone.trim());
  const trimmedEmail = $derived(email.trim());

  // Basic client-side plausibility check for email (not a full validation;
  // the shared schema validates on serialize).
  const emailPlausible = $derived(
    trimmedEmail.length === 0 ||
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail),
  );

  const hasValue = $derived(trimmedPhone.length > 0 || trimmedEmail.length > 0);
  const canSubmit = $derived(hasValue && emailPlausible && !pending);

  // Clear the fields when the sheet closes so a reopened sheet starts blank.
  let wasOpen = $state(false);
  $effect(() => {
    if (!opened && wasOpen) {
      phone = "";
      email = "";
    }
    wasOpen = opened;
  });

  function handleSubmit(): void {
    if (!canSubmit) return;
    const payload: ContactCorrectionPayload = { v: 1 };
    if (trimmedPhone.length > 0) {
      payload.phone = trimmedPhone;
    }
    if (trimmedEmail.length > 0) {
      payload.email = trimmedEmail;
    }
    onsubmit(payload);
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  title={m.portal_correction_sheet_title()}
  ariaLabel={m.portal_correction_sheet_title()}
>
  {#snippet headerRight()}
    <SoftButton onclick={handleSubmit} disabled={!canSubmit}>
      {m.portal_correction_sheet_submit()}
    </SoftButton>
  {/snippet}

  <div class="correction-sheet-body">
    <p class="correction-explainer">
      {m.portal_correction_sheet_body()}
    </p>

    <!-- Accessible labels outside List to avoid axe list-child violation -->
    <label for="correction-phone" class="sr-only">
      {m.portal_correction_phone_label()}
    </label>
    <label for="correction-email" class="sr-only">
      {m.portal_correction_email_label()}
    </label>

    <List nested class="correction-input-list">
      <ListInput
        type="tel"
        inputId="correction-phone"
        label={m.portal_correction_phone_label()}
        autocomplete="tel"
        value={phone}
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLInputElement) {
            phone = target.value;
          }
        }}
        disabled={pending}
        data-testid="correction-phone-input"
      />
      <ListInput
        type="email"
        inputId="correction-email"
        label={m.portal_correction_email_label()}
        autocomplete="email"
        value={email}
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLInputElement) {
            email = target.value;
          }
        }}
        disabled={pending}
        data-testid="correction-email-input"
      />
    </List>
  </div>
</ShellSheet>

<style>
  .correction-sheet-body {
    padding: var(--space-md) var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .correction-explainer {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
    margin: 0;
  }

  :global(.correction-input-list) {
    margin: 0 !important;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
