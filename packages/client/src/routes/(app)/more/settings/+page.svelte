<script lang="ts">
  import { List, ListItem, Link } from "konsta/svelte";
  import { ChevronLeft } from "@lucide/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { authKeys } from "$lib/query/keys.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import { shellBack } from "$lib/shell/navigation.js";
  import { base64ToUint8Array } from "$lib/utils/buffer-encoding.js";
  import DisplayNameSheet from "$lib/components/settings/DisplayNameSheet.svelte";
  import UsernameSheet from "$lib/components/settings/UsernameSheet.svelte";
  import PasswordSheet from "$lib/components/settings/PasswordSheet.svelte";

  const orgCache = getOrgDecryptCache();
  const navbarCtx = getNavbarOverrideCtx();

  const meQuery = createQuery(() => ({
    queryKey: authKeys.me(),
    queryFn: async () => trpc.auth.me.query(),
    staleTime: Infinity,
  }));

  const encryptedDisplayName = $derived(
    meQuery.data?.user.encryptedDisplayName ?? null,
  );
  const currentDisplayName = $derived(
    encryptedDisplayName !== null
      ? orgCache.decrypt(
          "me:display_name",
          base64ToUint8Array(encryptedDisplayName),
        )
      : null,
  );
  const currentUsername = $derived(meQuery.data?.user.identifier ?? "");
  const userId = $derived(meQuery.data?.user.id ?? "");

  let displayNameSheetOpen = $state(false);
  let usernameSheetOpen = $state(false);
  let passwordSheetOpen = $state(false);

  function goBack(): void {
    shellBack("/more");
  }

  $effect(() => {
    navbarCtx.current = {
      left: navLeft,
      title: m.settings_title(),
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });
</script>

{#snippet navLeft()}
  <Link iconOnly onclick={goBack} role="button" aria-label={m.common_back()}>
    <ChevronLeft size={22} aria-hidden="true" />
  </Link>
{/snippet}

<div class="settings-page">
  <List strong inset>
    <ListItem
      title={m.settings_display_name()}
      after={currentDisplayName ?? m.common_loading()}
      link
      onclick={() => {
        displayNameSheetOpen = true;
      }}
    />
  </List>

  <List strong inset>
    <ListItem
      title={m.settings_username()}
      after={currentUsername || m.common_loading()}
      link
      onclick={() => {
        usernameSheetOpen = true;
      }}
    />
  </List>

  <List strong inset>
    <ListItem
      title={m.settings_password()}
      after="********"
      link
      onclick={() => {
        passwordSheetOpen = true;
      }}
    />
  </List>
</div>

<DisplayNameSheet
  opened={displayNameSheetOpen}
  ondismiss={() => {
    displayNameSheetOpen = false;
  }}
  currentName={currentDisplayName}
/>

<UsernameSheet
  opened={usernameSheetOpen}
  ondismiss={() => {
    usernameSheetOpen = false;
  }}
  {currentUsername}
/>

<PasswordSheet
  opened={passwordSheetOpen}
  ondismiss={() => {
    passwordSheetOpen = false;
  }}
  {userId}
/>

<style>
  .settings-page {
    padding: var(--space-md) 0;
  }
</style>
