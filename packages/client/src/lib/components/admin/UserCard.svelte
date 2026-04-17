<script lang="ts">
  import { Card, Chip, Checkbox } from "konsta/svelte";
  import { EllipsisVertical } from "@lucide/svelte";
  import { RoleId } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";

  interface UserCardProps {
    readonly viewMode: "list" | "grid";
    readonly userId: string;
    readonly displayName: string | null;
    readonly roleId: string;
    readonly isActive: boolean;
    readonly hasKeys: boolean;
    readonly hasOrgKeyWrap: boolean;
    readonly isSelf: boolean;
    readonly selected?: boolean;
    readonly multiSelectActive?: boolean;
    readonly onedit: (userId: string) => void;
    readonly onselect?: (userId: string) => void;
  }

  let {
    viewMode,
    userId,
    displayName,
    roleId,
    isActive,
    hasKeys,
    hasOrgKeyWrap,
    isSelf,
    selected = false,
    multiSelectActive = false,
    onedit,
    onselect,
  }: UserCardProps = $props();

  const isList = $derived(viewMode === "list");

  const roleLabel = $derived.by(() => {
    switch (roleId) {
      case RoleId.VOLUNTEER:
        return m.admin_role_volunteer();
      case RoleId.MANAGER:
        return m.admin_role_manager();
      case RoleId.ADMIN:
        return m.admin_role_admin();
      default:
        return m.admin_role_unknown();
    }
  });

  const keyStatusLabel = $derived.by(() => {
    if (hasKeys && hasOrgKeyWrap) return m.admin_users_key_ok();
    if (!hasKeys) return m.admin_users_key_no_keys();
    return m.admin_users_key_no_org();
  });

  const keyStatusClass = $derived.by(() => {
    if (hasKeys && hasOrgKeyWrap) return "key-ok";
    return "key-warn";
  });

  function handleCardClick(): void {
    if (multiSelectActive) {
      onselect?.(userId);
    }
  }

  function handleEditClick(e: MouseEvent): void {
    e.stopPropagation();
    onedit(userId);
  }
</script>

<div class="user-card-wrap">
  <Card raised contentWrap={false} class="user-card">
    <div
      class="card-inner"
      class:card-inner--list={isList}
      class:card-inner--grid={!isList}
      class:card-inner--selectable={multiSelectActive}
      role={multiSelectActive ? "button" : undefined}
      tabindex={multiSelectActive ? 0 : undefined}
      aria-label={multiSelectActive
        ? (displayName ?? userId.slice(0, 8))
        : undefined}
      onclick={multiSelectActive ? handleCardClick : undefined}
      onkeydown={multiSelectActive ? onKeyActivate(handleCardClick) : undefined}
    >
      {#if multiSelectActive}
        <div
          class="checkbox-wrap"
          role="presentation"
          onclick={(e) => e.stopPropagation()}
          onkeydown={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={selected}
            onchange={() => onselect?.(userId)}
            class="select-checkbox"
            colors={{
              bgCheckedIos: "bg-[var(--brand-accent)]",
              borderCheckedIos: "border-[var(--brand-accent)]",
              bgCheckedMaterial: "bg-[var(--brand-accent)]",
              borderCheckedMaterial: "border-[var(--brand-accent)]",
            }}
          />
        </div>
      {/if}

      <!-- Avatar circle with initials -->
      <div class="avatar" class:avatar--inactive={!isActive}>
        <span class="avatar-initials">
          {#if displayName}
            {displayName.slice(0, 2).toUpperCase()}
          {:else}
            ??
          {/if}
        </span>
      </div>

      <!-- Name + status row -->
      <div class="content-group">
        <div class="name-row">
          <DecryptPlaceholder
            content={displayName}
            length={14}
            class="font-semibold"
          />
          {#if !isActive}
            <span class="inactive-badge">
              {m.admin_status_inactive()}
            </span>
          {/if}
        </div>
        <span class="key-status {keyStatusClass}">{keyStatusLabel}</span>
      </div>

      <!-- Role chip (display-only) -->
      <div class="role-area">
        <Chip class={isSelf ? "opacity-60" : ""} outline>
          {roleLabel}
        </Chip>
      </div>

      <!-- Edit button or status dot -->
      {#if isSelf}
        <span
          class="status-dot"
          class:bg-[--color-green-500]={isActive}
          class:bg-[--color-red-500]={!isActive}
          aria-label={isActive
            ? m.admin_status_active()
            : m.admin_status_inactive()}
          role="img"
        ></span>
      {:else}
        <button
          class="edit-btn"
          onclick={handleEditClick}
          onkeydown={onKeyActivate(() => onedit(userId))}
          aria-label={m.admin_user_edit_actions()}
          type="button"
        >
          <EllipsisVertical size={20} aria-hidden="true" />
        </button>
      {/if}
    </div>
  </Card>
</div>

<style>
  .user-card-wrap {
    width: 100%;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .user-card-wrap :global(.k-card) {
    margin: 0 !important;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* ── Card inner (base) ── */
  .card-inner {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--card-pad-y) var(--card-pad-x);
    text-align: left;
    -webkit-tap-highlight-color: transparent;
    width: 100%;
    background: none;
    border: none;
    font: inherit;
    color: inherit;
  }

  .card-inner--selectable {
    cursor: pointer;
  }

  .card-inner--selectable:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: -2px;
    border-radius: var(--card-radius);
  }

  /* ── Avatar ── */
  .avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--brand-accent) 20%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar--inactive {
    opacity: 0.5;
  }

  .avatar-initials {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--brand-accent);
    line-height: 1;
  }

  /* ── Content ── */
  .content-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
    overflow: hidden;
  }

  .name-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    min-width: 0;
  }

  .inactive-badge {
    font-size: var(--text-xs);
    color: var(--color-red-500);
    font-weight: 600;
    flex-shrink: 0;
  }

  .key-status {
    font-size: var(--text-xs);
    color: var(--muted);
  }

  .key-ok {
    color: var(--color-green-600);
  }

  .key-warn {
    color: var(--color-amber-600);
  }

  /* ── Role chip ── */
  .role-area {
    flex-shrink: 0;
  }

  /* ── Edit button ── */
  .edit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    min-width: 2.75rem;
    min-height: 2.75rem;
    border-radius: 50%;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--muted);
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
    transition: background-color 150ms linear;
  }

  .edit-btn:hover {
    background: color-mix(in srgb, var(--ink) 8%, transparent);
  }

  .edit-btn:active {
    background: color-mix(in srgb, var(--ink) 14%, transparent);
  }

  .edit-btn:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
  }

  /* ── Status dot ── */
  .status-dot {
    display: inline-block;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .checkbox-wrap {
    flex-shrink: 0;
  }

  :global(.select-checkbox) {
    transform: scale(0.8);
    transform-origin: center;
  }

  /* ══════════════════════════════════════════
     LIST MODE: horizontal row
     ══════════════════════════════════════════ */
  .card-inner--list {
    flex-direction: row;
    align-items: center;
  }

  /* ══════════════════════════════════════════
     GRID MODE: stacked vertical card
     ══════════════════════════════════════════ */
  .card-inner--grid {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--space-lg) var(--card-pad-x);
    min-height: 10rem;
    position: relative;
  }

  .card-inner--grid .avatar {
    width: 3.5rem;
    height: 3.5rem;
  }

  .card-inner--grid .avatar-initials {
    font-size: var(--text-md);
  }

  .card-inner--grid .content-group {
    align-items: center;
  }

  .card-inner--grid .name-row {
    justify-content: center;
    flex-wrap: wrap;
  }

  .card-inner--grid .role-area {
    margin-top: auto;
  }

  .card-inner--grid .edit-btn {
    position: absolute;
    top: var(--space-sm);
    right: var(--space-sm);
  }

  .card-inner--grid .status-dot {
    position: absolute;
    top: var(--space-md);
    right: var(--space-md);
  }
</style>
