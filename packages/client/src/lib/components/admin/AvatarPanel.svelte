<script lang="ts">
  import { List, ListItem } from "konsta/svelte";
  import { Settings as Cog, LogOut } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { type Permission, RoleId } from "@care-y/shared";
  import { getOrgDecryptCache, getOrgKeyManager } from "$lib/crypto/context.js";
  import { resolveOrgDecrypt } from "$lib/crypto/decrypt-result.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import {
    GROUP_ORDER,
    getVisibleDestinations,
    groupDestinations,
    type AdminDestination,
    type AdminGroup,
  } from "$lib/admin/destinations.js";
  import {
    base64ToUint8Array,
    type SerializedBuffer,
  } from "$lib/utils/buffer-encoding.js";
  import { User } from "@lucide/svelte";
  import { getOrgLogoUrl } from "$lib/branding/logo-url.svelte.js";

  interface AvatarPanelProps {
    readonly encryptedDisplayName: unknown;
    readonly roleId: string;
    readonly permissions: ReadonlySet<Permission>;
    readonly onnavigate: (path: string) => void;
    readonly onlogout: () => void;
  }

  let {
    encryptedDisplayName,
    roleId,
    permissions,
    onnavigate,
    onlogout,
  }: AvatarPanelProps = $props();

  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();

  function isSerializedBuffer(val: unknown): val is SerializedBuffer {
    return (
      typeof val === "object" &&
      val !== null &&
      "type" in val &&
      (val as Record<string, unknown>).type === "Buffer" &&
      "data" in val &&
      Array.isArray((val as Record<string, unknown>).data)
    );
  }

  function toDecryptable(val: unknown): SerializedBuffer | Uint8Array | null {
    if (typeof val === "string") return base64ToUint8Array(val);
    if (val instanceof Uint8Array) return val;
    if (isSerializedBuffer(val)) return val;
    return null;
  }

  const displayNameCiphertext = $derived(toDecryptable(encryptedDisplayName));
  const displayNameRaw = $derived(
    orgCache.decrypt("me:display_name", displayNameCiphertext),
  );
  const nameResult = $derived(
    resolveOrgDecrypt(displayNameRaw, orgKeyManager.isLoaded),
  );

  const initials = $derived(
    nameResult.status === "ready"
      ? nameResult.value
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w.charAt(0).toUpperCase())
          .join("")
      : null,
  );

  const roleInfo = $derived(
    roleId === RoleId.ADMIN
      ? { name: m.role_admin(), path: "/admin" }
      : roleId === RoleId.MANAGER
        ? { name: m.role_manager(), path: "/admin/manager" }
        : { name: m.role_volunteer(), path: "/admin/volunteer" },
  );

  const orgLogoUrl = $derived(getOrgLogoUrl());

  const visibleDestinations = $derived(getVisibleDestinations(permissions));
  const grouped = $derived(groupDestinations(visibleDestinations));
  const visibleGroups = $derived(
    GROUP_ORDER.filter((g) => {
      const list = grouped.get(g);
      return list !== undefined && list.length > 0;
    }),
  );

  function groupLabel(group: AdminGroup): string {
    switch (group) {
      case "people":
        return m.panel_group_people();
      case "communications":
        return m.panel_group_communications();
      case "organization":
        return m.panel_group_organization();
      case "analytics":
        return m.panel_group_analytics();
    }
  }

  function handleDestinationTap(dest: AdminDestination): void {
    if (dest.implemented) {
      onnavigate(dest.path);
    } else {
      toastStore.show(m.admin_coming_soon());
    }
  }
</script>

<div class="avatar-panel">
  <div class="panel-scroll">
    <!-- Profile header -->
    <div class="panel-profile">
      <span class="panel-avatar" aria-hidden="true">
        {#if orgLogoUrl}
          <img
            src={orgLogoUrl}
            alt=""
            class="panel-avatar-logo"
            loading="eager"
          />
        {:else if initials}
          {initials}
        {:else}
          <User size={22} />
        {/if}
      </span>
      <DecryptPlaceholder result={nameResult} length={12}>
        {#if nameResult.status === "ready"}
          <span class="panel-name">{nameResult.value}</span>
        {/if}
      </DecryptPlaceholder>
      <button class="panel-role" onclick={() => onnavigate(roleInfo.path)}>
        {roleInfo.name}
      </button>
    </div>

    <!-- Exposure slot (placeholder for 6k) -->
    <div class="panel-exposure-slot"></div>

    <!-- Admin destinations grouped by concern -->
    {#each visibleGroups as group (group)}
      <List nested>
        <ListItem groupTitle>{groupLabel(group)}</ListItem>
        {#each grouped.get(group) ?? [] as dest (dest.id)}
          <ListItem
            title={dest.label()}
            chevron={false}
            onclick={() => handleDestinationTap(dest)}
          >
            {#snippet media()}
              <span class="dest-icon">
                <dest.icon size={20} aria-hidden="true" />
              </span>
            {/snippet}
          </ListItem>
        {/each}
      </List>
    {/each}
  </div>

  <!-- Pinned footer -->
  <div class="panel-footer">
    <button class="footer-pill" onclick={() => onnavigate("/more/settings")}>
      <Cog size={16} aria-hidden="true" />
      {m.panel_settings()}
    </button>
    <button class="footer-pill footer-pill--logout" onclick={onlogout}>
      <LogOut size={16} aria-hidden="true" />
      {m.panel_logout()}
    </button>
  </div>
</div>

<style>
  .avatar-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .panel-scroll {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .panel-footer {
    flex-shrink: 0;
    display: flex;
    gap: 8px;
    padding: 12px 12px;
    border-top: 1px solid var(--border);
  }

  .footer-pill {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: transparent;
    color: inherit;
    font-size: 13px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .footer-pill:active {
    opacity: 0.7;
  }

  .footer-pill--logout {
    color: var(--k-color-red, #ef4444);
    border-color: var(--k-color-red, #ef4444);
  }

  .dest-icon {
    color: var(--brand-accent, var(--k-color-primary));
  }

  .panel-profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 24px 16px 16px;
  }

  .panel-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--k-color-primary);
    color: var(--k-color-on-primary, #fff);
    font-size: 18px;
    font-weight: 600;
    overflow: hidden;
  }

  .panel-avatar-logo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .panel-name {
    font-size: 16px;
    font-weight: 600;
    text-align: center;
  }

  .panel-role {
    display: inline-block;
    padding: 2px 10px;
    border: 1px solid var(--k-color-primary);
    border-radius: 12px;
    background: transparent;
    color: var(--k-color-primary);
    font-size: 13px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .panel-role:active {
    opacity: 0.7;
  }

  .panel-exposure-slot {
    /* Reserved for Exposure status bar */
    display: contents;
  }
</style>
