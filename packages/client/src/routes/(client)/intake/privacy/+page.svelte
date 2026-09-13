<!--
  Static localized privacy notice page covering the nine GDPR checklist items.
  Uses Konsta Block/BlockTitle structure consistent with the codebase's
  static content pages. The telephony retention disclosure is embedded
  verbatim via the intake_retention_disclosure i18n key.
-->
<script lang="ts">
  import { Block, BlockTitle } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { createPublicBrandingQuery } from "$lib/branding/public-branding.js";
  import { readInjectedOrgName } from "$lib/branding/injected-branding.js";
  import { getClientShellCtx } from "$lib/client-shell/context.js";
  import { uiLocaleStore } from "$lib/stores/ui-locale.svelte.js";

  const brandingQuery = createPublicBrandingQuery();
  const branding = $derived(brandingQuery.data ?? null);
  const injectedOrgName = readInjectedOrgName();

  const orgName = $derived(
    branding?.orgName !== undefined && branding.orgName !== ""
      ? branding.orgName
      : (injectedOrgName ?? ""),
  );

  const orgNamePending = $derived(
    orgName === "" && !brandingQuery.isError && !brandingQuery.isSuccess,
  );

  // A static notice holds no key material, but it still publishes: that is
  // what gives it quick exit and the drawer, and the shell supplies the
  // org's exit URL so this page does not have to know it.
  const shellContainer = getClientShellCtx();

  $effect(() => {
    shellContainer.current = { ondestroy: () => undefined, actions: [] };
    return () => {
      shellContainer.current = undefined;
    };
  });
</script>

{#key uiLocaleStore.locale}
  <BlockTitle large>{m.intake_privacy_title()}</BlockTitle>

  <BlockTitle>{m.intake_privacy_who_title()}</BlockTitle>
  <Block>
    {#if orgNamePending}
      <span class="skeleton-line" aria-hidden="true"></span>
    {:else if orgName !== ""}
      <p>{m.intake_privacy_who_body({ orgName })}</p>
    {/if}
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
{/key}

<style>
  p {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--ink);
    line-height: 1.6;
  }

  .skeleton-line {
    display: block;
    height: 1em;
    border-radius: 4px;
    background: var(--surface-1, rgba(0, 0, 0, 0.08));
    animation: shimmer 1.4s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%,
    100% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.8;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton-line {
      animation: none;
      opacity: 0.5;
    }
  }

  .retention-disclosure {
    margin-top: var(--space-md);
    padding-top: var(--space-md);
    border-top: 1px solid var(--surface-1);
  }
</style>
