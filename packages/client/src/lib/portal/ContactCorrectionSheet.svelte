<!--
  Contact correction sheet. Collects a new phone number from the client
  and passes it to the page for submission as a contact_correction follow-up.

  Security constraint: never displays the on-file contact info. Bare-link
  sessions must not receive existing PII; the field starts blank and the
  server-side number is never fetched or shown.
-->
<script lang="ts">
  import { List, ListInput } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";

  interface ContactCorrectionSheetProps {
    opened: boolean;
    ondismiss: () => void;
    onsubmit: (phone: string) => void;
    pending?: boolean;
  }

  let {
    opened,
    ondismiss,
    onsubmit,
    pending = false,
  }: ContactCorrectionSheetProps = $props();

  let phone = $state("");

  const trimmed = $derived(phone.trim());
  const canSubmit = $derived(trimmed.length > 0 && !pending);

  // Clear the field when the sheet closes so a reopened sheet starts blank.
  let wasOpen = $state(false);
  $effect(() => {
    if (!opened && wasOpen) {
      phone = "";
    }
    wasOpen = opened;
  });

  function handleSubmit(): void {
    if (!canSubmit) return;
    onsubmit(trimmed);
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

    <List nested class="correction-input-list">
      <ListInput
        type="tel"
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
</style>
