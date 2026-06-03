<!--
  OnboardingCryptoBridge
  Provides the subset of crypto and shell contexts that UsersSection needs,
  bridging the gap between the onboarding layout (which only has CryptoBridge
  + OrgKeyManager from root CryptoProvider) and the full AppCryptoProvider
  that authenticated (app) routes get.

  Used by SetupInvite (onboarding step 8) to render UsersSection directly.
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { RoleId, Permission } from "@care-y/shared";
  import type { Snippet } from "svelte";
  import { OrgDecryptCache } from "$lib/crypto/org-decrypt-cache.js";
  import {
    getCryptoBridge,
    getOrgKeyManager,
    setOrgDecryptCache,
    setCurrentUserId,
    setCurrentUserRoleId,
    setCurrentPermissions,
  } from "$lib/crypto/context.js";
  import { setTabbarOverrideCtx } from "$lib/shell/context.js";

  interface Props {
    adminUserId: string;
    children: Snippet;
  }

  let { adminUserId, children }: Props = $props();

  const ALL_PERMISSIONS: ReadonlySet<Permission> = new Set(
    Object.values(Permission),
  );

  setCurrentUserId(() => adminUserId);
  // care-y-ignore-next-line no-client-role-hardcode -- context provider for onboarding, not a permission check; mirrors AppCryptoProvider.svelte:57
  setCurrentUserRoleId(() => RoleId.ADMIN);
  setCurrentPermissions(() => ALL_PERMISSIONS);
  setTabbarOverrideCtx({ current: undefined });

  if (browser) {
    const bridge = getCryptoBridge();
    const orgKeyManager = getOrgKeyManager();
    setOrgDecryptCache(new OrgDecryptCache(orgKeyManager, bridge));
  }
</script>

{@render children()}
