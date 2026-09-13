<script lang="ts">
  import { Checkbox } from "konsta/svelte";
  import { CHECKBOX_BRAND_COLORS } from "$lib/components/shared/konsta-classes.js";
  import { personInitials } from "$lib/utils/initials.js";
  import { Pencil, Phone, MessageSquare } from "@lucide/svelte";
  import { RoleId } from "@care-y/shared";
  import type { VolunteerReachabilityWire } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
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
    readonly reachability?: VolunteerReachabilityWire;
    readonly selected?: boolean;
    readonly multiSelectActive?: boolean;
    /** Search term to highlight in the display name (search People cell). */
    readonly searchTerm?: string | null;
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
    reachability = "none",
    selected = false,
    multiSelectActive = false,
    searchTerm = null,
    onedit,
    onselect,
  }: UserCardProps = $props();

  const isList = $derived(viewMode === "list");

  const roleLabel = $derived.by(() => {
    switch (roleId) {
      case RoleId.VOLUNTEER:
        return m.admin_role_volunteer(withTerms());
      case RoleId.MANAGER:
        return m.admin_role_manager(withTerms());
      case RoleId.ADMIN:
        return m.admin_role_admin();
      default:
        return m.admin_role_unknown();
    }
  });

  const keyStatus = $derived.by(() => {
    if (hasKeys && hasOrgKeyWrap)
      return { label: m.admin_users_key_ok(), cls: "key-ok" };
    if (!hasKeys)
      return { label: m.admin_users_key_no_keys(), cls: "key-warn" };
    return { label: m.admin_users_key_no_org(), cls: "key-warn" };
  });

  const reachabilityChip = $derived.by(() => {
    switch (reachability) {
      case "verified_sms":
        return {
          label: m.admin_reachability_callable_sms(),
          icon: MessageSquare,
        };
      case "verified":
        return { label: m.admin_reachability_callable(), icon: Phone };
      case "unverified":
        return {
          label: m.admin_reachability_phone_unverified(),
          icon: Phone,
        };
      case "none":
        return null;
    }
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

<!-- Pinned-anatomy exemption (see inkwell-design-language.md, "Pinned-anatomy
     exemptions"): ruled-row anatomy is pinned by the spec; Konsta ListItem
     fights the grid layout and token wiring. -->
<div class="user-card-wrap">
  <div
    class="user-card card-elevated"
    class:card--selected={selected && multiSelectActive}
  >
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div
      class="card-inner"
      class:card-inner--list={isList}
      class:card-inner--grid={!isList}
      class:card-inner--selectable={multiSelectActive}
      class:card-inner--inactive={!isActive}
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
            colors={CHECKBOX_BRAND_COLORS}
          />
        </div>
      {/if}

      <!-- User-initial identity seal (decorative beside the name text) -->
      <div class="avatar identity-seal" aria-hidden="true">
        <span class="avatar-initials">
          {#if displayName}
            {personInitials(displayName)}
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
            {searchTerm}
          />
          {#if !isActive}
            <span class="inactive-badge">
              {m.admin_status_inactive()}
            </span>
          {/if}
        </div>
        <span class="key-status {keyStatus.cls}">{keyStatus.label}</span>
        {#if reachabilityChip}
          {@const ReachIcon = reachabilityChip.icon}
          <span class="reachability-chip">
            <ReachIcon size={10} aria-hidden="true" />
            {reachabilityChip.label}
          </span>
        {/if}
      </div>

      <!-- Role stamp: a role is who someone is (identity slot, brand ink) -->
      <div class="role-area">
        <span class="stamp-chip role-stamp" class:opacity-60={isSelf}>
          {roleLabel}
        </span>
      </div>

      <!-- Edit button (your own row carries no control; active state is
           unmarked and inactive already speaks through the word + dim) -->
      {#if !isSelf}
        <button
          class="edit-btn"
          onclick={handleEditClick}
          onkeydown={onKeyActivate(() => onedit(userId))}
          aria-label={m.admin_user_edit_actions()}
          type="button"
        >
          <Pencil size={16} aria-hidden="true" />
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .user-card-wrap {
    width: 100%;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* The card anatomy lives on .card-elevated (shared.css). */
  .user-card {
    margin: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* Selection is an identity slot: brand-soft, never full fill. */
  .card--selected {
    background: var(--brand-soft, var(--brand-primary-20));
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

  /* A deactivated account is a records fact: the whole card goes quiet
     (the closed-row treatment), no alarm hue anywhere. */
  .card-inner--inactive {
    opacity: 0.52;
  }

  /* ── Avatar: the shared identity-seal anatomy, sized per mode ── */
  .avatar {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar-initials {
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
    color: var(--muted);
    font-weight: 600;
    flex-shrink: 0;
  }

  .key-status {
    font-size: var(--text-xs);
    color: var(--muted);
  }

  /* Ready keys are the normal state: quiet ink, never a success hue. */
  .key-ok {
    color: var(--ink-2);
  }

  .key-warn {
    color: var(--care);
  }

  .reachability-chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: var(--text-xs);
    color: var(--muted);
  }

  /* ── Role stamp (identity slot: brand ink on the stamp anatomy) ── */
  .role-area {
    flex-shrink: 0;
  }

  .role-stamp {
    color: var(--brand-text, var(--brand-primary));
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
</style>
