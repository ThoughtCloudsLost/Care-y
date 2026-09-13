<!--
  Static localized privacy notice page covering the nine GDPR checklist items.
  Uses Konsta Block/BlockTitle structure consistent with the codebase's
  static content pages. The telephony retention disclosure is embedded
  verbatim via the intake_retention_disclosure i18n key.
-->
<script lang="ts">
  import { Block, BlockTitle } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getBrandingTitle } from "$lib/branding/title.svelte.js";

  const orgName = $derived(getBrandingTitle());
</script>

<BlockTitle large>{m.intake_privacy_title()}</BlockTitle>

<BlockTitle>{m.intake_privacy_who_title()}</BlockTitle>
<Block>
  <p>{m.intake_privacy_who_body({ orgName })}</p>
</Block>

<BlockTitle>{m.intake_privacy_what_title()}</BlockTitle>
<Block>
  <p>{m.intake_privacy_what_body()}</p>
</Block>

<BlockTitle>{m.intake_privacy_basis_title()}</BlockTitle>
<Block>
  <p>{m.intake_privacy_basis_body()}</p>
</Block>

<BlockTitle>{m.intake_privacy_sharing_title()}</BlockTitle>
<Block>
  <p>{m.intake_privacy_sharing_body()}</p>
</Block>

<BlockTitle>{m.intake_privacy_transfer_title()}</BlockTitle>
<Block>
  <p>{m.intake_privacy_transfer_body()}</p>
</Block>

<BlockTitle>{m.intake_privacy_retention_title()}</BlockTitle>
<Block>
  <p>{m.intake_privacy_retention_body()}</p>
  <p class="retention-disclosure">
    {m.intake_retention_disclosure()}
  </p>
</Block>

<BlockTitle>{m.intake_privacy_rights_title()}</BlockTitle>
<Block>
  <p>{m.intake_privacy_rights_body()}</p>
</Block>

<BlockTitle>{m.intake_privacy_complaint_title()}</BlockTitle>
<Block>
  <p>{m.intake_privacy_complaint_body()}</p>
</Block>

<BlockTitle>{m.intake_privacy_voluntary_title()}</BlockTitle>
<Block>
  <p>{m.intake_privacy_voluntary_body()}</p>
</Block>

<BlockTitle>{m.intake_privacy_cookies_title()}</BlockTitle>
<Block>
  <p>{m.intake_privacy_cookies_body()}</p>
</Block>

<style>
  p {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--ink);
    line-height: 1.6;
  }

  .retention-disclosure {
    margin-top: var(--space-md);
    padding-top: var(--space-md);
    border-top: 1px solid var(--surface-1);
  }
</style>
