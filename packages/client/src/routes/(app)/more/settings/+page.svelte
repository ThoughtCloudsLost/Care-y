<script lang="ts">
  import {
    List,
    ListItem,
    Link,
    BlockTitle,
    Block,
    Button,
  } from "konsta/svelte";
  import { ChevronLeft } from "@lucide/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { authKeys, twoFactorKeys } from "$lib/query/keys.js";
  import {
    getOrgDecryptCache,
    getCryptoBridge,
    getOrgKeyManager,
  } from "$lib/crypto/context.js";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import { shellBack } from "$lib/shell/navigation.js";
  import { base64ToUint8Array } from "$lib/utils/buffer-encoding.js";
  import { themeStore } from "$lib/stores/theme.svelte";
  import { applyKonstaPalette } from "$lib/branding/konsta-palette";
  import { DEFAULT_PRIMARY } from "$lib/branding/index.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import DisplayNameSheet from "$lib/components/settings/DisplayNameSheet.svelte";
  import UsernameSheet from "$lib/components/settings/UsernameSheet.svelte";
  import PasswordSheet from "$lib/components/settings/PasswordSheet.svelte";
  import TwoFactorSheet from "$lib/components/settings/TwoFactorSheet.svelte";
  import SecurityBriefingPopup from "$lib/components/settings/SecurityBriefingPopup.svelte";

  const orgCache = getOrgDecryptCache();
  const cryptoBridge = getCryptoBridge();
  const orgKeyManager = getOrgKeyManager();
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
  const encryptedIdentifier = $derived(
    meQuery.data?.user.encryptedIdentifier ?? null,
  );
  const currentUsername = $derived(
    encryptedIdentifier !== null
      ? (orgCache.decrypt(
          "me:identifier",
          base64ToUint8Array(encryptedIdentifier),
        ) ?? "")
      : "",
  );
  const userId = $derived(meQuery.data?.user.id ?? "");

  let displayNameSheetOpen = $state(false);
  let usernameSheetOpen = $state(false);
  let passwordSheetOpen = $state(false);
  let twoFactorSheetOpen = $state(false);
  let briefingPopupOpen = $state(false);

  const twoFactorStatusQuery = createQuery(() => ({
    queryKey: twoFactorKeys.status(),
    queryFn: async () => trpc.twoFactor.status.query(),
  }));

  const twoFactorSummary = $derived.by(() => {
    if (!twoFactorStatusQuery.data) return m.common_loading();
    const count = twoFactorStatusQuery.data.methods.length;
    if (count === 0) return m.settings_2fa_none();
    return count === 1
      ? m.settings_2fa_methods_one()
      : m.settings_2fa_methods({ count });
  });

  // ── Dev-only seed ───────────────────────────────────────────────────
  type SeedPhase = "idle" | "seeding" | "done" | "error";
  let seedPhase = $state<SeedPhase>("idle");
  let seedError = $state("");
  let seedStatus = $state("");

  async function handleDevSeed(): Promise<void> {
    seedPhase = "seeding";
    seedError = "";
    seedStatus = "Starting...";
    try {
      const { devSeedData } = await import("$lib/dev/dev-seed.js");
      await devSeedData(cryptoBridge, orgKeyManager, (msg) => {
        seedStatus = msg;
      });
      seedPhase = "done";
      seedStatus = "";
    } catch (err: unknown) {
      seedPhase = "error";
      seedError = err instanceof Error ? err.message : String(err);
      seedStatus = "";
      console.error("[dev-seed] Failed:", err);
    }
  }

  function goBack(): void {
    shellBack("/");
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

  <BlockTitle>{m.settings_appearance()}</BlockTitle>
  <List strong inset>
    <ListItem
      title={m.settings_color_scheme()}
      after={themeStore.resolvedScheme === "dark"
        ? m.settings_dark_mode()
        : m.settings_light_mode()}
      link
      onclick={() => {
        themeStore.toggleColorScheme();
        const primary =
          localStorage.getItem("care-y-brand-primary") ?? DEFAULT_PRIMARY;
        const accent = localStorage.getItem("care-y-brand-accent") ?? undefined;
        queueMicrotask(() => void applyKonstaPalette({ primary, accent }));
      }}
    />
    <ListItem
      title={m.settings_refresh_app()}
      link
      onclick={() => {
        location.reload();
      }}
    />
  </List>

  <BlockTitle>{m.settings_security()}</BlockTitle>
  <List strong inset>
    <ListItem
      title={m.settings_2fa()}
      after={twoFactorSummary}
      link
      onclick={() => {
        twoFactorSheetOpen = true;
      }}
    />
    <ListItem
      title={m.settings_replay_walkthrough()}
      link
      onclick={() => {
        toastStore.show(m.feature_coming_soon());
      }}
    />
    <ListItem
      title={m.settings_review_briefing()}
      link
      onclick={() => {
        briefingPopupOpen = true;
      }}
    />
  </List>

  {#if import.meta.env.DEV}
    <!-- eslint-disable care-y/no-hardcoded-strings -- dev-only UI, tree-shaken from production -->
    <BlockTitle>Developer</BlockTitle>
    <Block strong inset>
      {#if seedPhase === "done"}
        <p class="dev-seed-status">Seed data created.</p>
      {:else if seedPhase === "error"}
        <p class="dev-seed-error">{seedError}</p>
      {:else if seedPhase === "seeding" && seedStatus}
        <p class="dev-seed-progress">{seedStatus}</p>
      {/if}
      {#if seedPhase === "seeding"}
        <Button large disabled>{seedStatus || "Seeding..."}</Button>
      {:else}
        <Button large onclick={handleDevSeed}>Seed Dev Data</Button>
      {/if}
    </Block>
    <!-- eslint-enable care-y/no-hardcoded-strings -->
  {/if}
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

<TwoFactorSheet
  opened={twoFactorSheetOpen}
  ondismiss={() => {
    twoFactorSheetOpen = false;
  }}
  username={currentUsername}
/>

<SecurityBriefingPopup
  opened={briefingPopupOpen}
  onclose={() => {
    briefingPopupOpen = false;
  }}
/>

<style>
  .settings-page {
    padding: var(--space-md) 0;
  }

  /* DEV-gated seed feedback, tokenized so even dev chrome sits on the
     palette. */
  .dev-seed-status {
    font-size: 0.875rem;
    color: var(--care, #16a34a);
    margin-bottom: 0.5rem;
  }

  .dev-seed-error {
    font-size: 0.875rem;
    color: var(--danger, #dc2626);
    margin-bottom: 0.5rem;
    word-break: break-word;
  }

  .dev-seed-progress {
    font-size: 0.875rem;
    color: var(--muted, #2563eb);
    margin-bottom: 0.5rem;
  }
</style>
