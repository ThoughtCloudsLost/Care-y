<script lang="ts">
  import { Settings, LogOut, ChevronDown, Building2 } from "@lucide/svelte";
  import { SvelteSet } from "svelte/reactivity";
  import * as m from "$lib/paraglide/messages.js";
  import { getOrgLogoUrl } from "$lib/branding/logo-url.svelte.js";
  import { getRoleInfo } from "$lib/admin/role-info.js";
  import { allTabs } from "./tabs";
  import type { TabId, DesktopSidebarProps, SidebarSubItem } from "./types";

  let {
    activeTab,
    activeArea,
    ontabchange,
    expanded,
    subItems,
    orgName,
    userName,
    userInitials,
    onAdmin,
    onSettings,
    onLogout,
    roleId,
    onNavigate,
  }: DesktopSidebarProps = $props();

  const navLogoUrl = $derived(getOrgLogoUrl());
  const roleInfo = $derived(getRoleInfo(roleId));

  // ── Expand/collapse ────────────────────────────────────────────────
  let hoverExpanded = $state(false);
  let hoverTimer = $state<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isExpanded = $derived(expanded || hoverExpanded);

  function handleMouseEnter(): void {
    hoverTimer = setTimeout(() => {
      hoverExpanded = true;
    }, 300);
  }

  function handleMouseLeave(): void {
    if (hoverTimer != null) {
      clearTimeout(hoverTimer);
      hoverTimer = undefined;
    }
    hoverExpanded = false;
  }

  // ── Sub-item section disclosure ────────────────────────────────────
  const openSections = new SvelteSet<TabId | "admin">();

  function toggleSection(tabId: TabId | "admin"): void {
    if (openSections.has(tabId)) {
      openSections.delete(tabId);
    } else {
      openSections.add(tabId);
    }
  }

  function getSubItemsForTab(
    tabId: TabId | "admin",
  ): readonly SidebarSubItem[] {
    const section = subItems.find((s) => s.tabId === tabId);
    return section?.items ?? [];
  }

  // Admin section is only rendered if subItems contain an "admin" section
  const hasAdmin = $derived(subItems.some((s) => s.tabId === "admin"));

  // ── Keyboard navigation ────────────────────────────────────────────
  let focusedIndex = $state(0);
  const focusableIds = $derived([
    ...allTabs.map((t) => t.id),
    ...(hasAdmin ? (["admin"] as const) : []),
    "role" as const,
    "settings" as const,
    "logout" as const,
  ]);

  function handleKeyDown(e: KeyboardEvent): void {
    const len = focusableIds.length;
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        focusedIndex = (focusedIndex + 1) % len;
        focusTarget(focusedIndex);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        focusedIndex = (focusedIndex - 1 + len) % len;
        focusTarget(focusedIndex);
        break;
      }
      case "Home": {
        e.preventDefault();
        focusedIndex = 0;
        focusTarget(focusedIndex);
        break;
      }
      case "End": {
        e.preventDefault();
        focusedIndex = len - 1;
        focusTarget(focusedIndex);
        break;
      }
      case "Escape": {
        e.preventDefault();
        hoverExpanded = false;
        break;
      }
    }
  }

  let navEl = $state<HTMLElement | undefined>(undefined);

  function focusTarget(index: number): void {
    const id = focusableIds.at(index);
    if (id == null || navEl == null) return;
    const el = navEl.querySelector<HTMLElement>(`[data-sidebar-id="${id}"]`);
    el?.focus();
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<nav
  bind:this={navEl}
  class="desktop-sidebar"
  class:expanded={isExpanded}
  aria-label={m.nav_sidebar_label()}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  onkeydown={handleKeyDown}
>
  <!-- Org branding -->
  <div class="sidebar-header">
    <span class="sidebar-logo" aria-hidden="true">
      {#if navLogoUrl}
        <img src={navLogoUrl} alt="" class="sidebar-logo-img" loading="eager" />
      {:else if userInitials}
        {userInitials}
      {/if}
    </span>
    {#if isExpanded}
      <span class="sidebar-org-name heading-compact">{orgName ?? ""}</span>
    {/if}
  </div>

  <!-- Tab links -->
  <div
    class="sidebar-tabs"
    role="tablist"
    aria-orientation="vertical"
    aria-label={m.nav_main()}
  >
    {#each allTabs as tab, i (tab.id)}
      {@const isActive = activeTab === tab.id}
      {@const Icon = tab.icon}
      {@const tabSubItems = getSubItemsForTab(tab.id)}
      {@const hasSubItems = tabSubItems.length > 0}
      {@const sectionOpen = openSections.has(tab.id)}
      <div class="sidebar-tab-group">
        <div class="sidebar-tab-row">
          <button
            onclick={() => ontabchange(tab.id)}
            type="button"
            role="tab"
            class="sidebar-tab"
            class:active={isActive}
            aria-selected={isActive}
            aria-label={tab.label()}
            tabindex={focusedIndex === i ? 0 : -1}
            data-sidebar-id={tab.id}
          >
            <span class="sidebar-icon">
              <Icon size={24} aria-hidden="true" />
            </span>
            {#if isExpanded}
              <span class="sidebar-label">{tab.label()}</span>
            {/if}
          </button>
          {#if isExpanded && hasSubItems}
            <button
              type="button"
              class="sidebar-chevron"
              class:open={sectionOpen}
              aria-label={sectionOpen ? m.nav_more() : m.nav_more()}
              onclick={(e) => {
                e.stopPropagation();
                toggleSection(tab.id);
              }}
            >
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          {/if}
        </div>
        {#if isExpanded && sectionOpen && hasSubItems}
          <div class="sidebar-sub-items" role="group">
            {#each tabSubItems as item (item.id)}
              <button
                type="button"
                class="sidebar-sub-item"
                onclick={item.ontap}
              >
                {#if item.icon === "filter"}
                  <span class="sub-item-star" aria-hidden="true">&#9733;</span>
                {/if}
                <span class="sub-item-label">{item.label}</span>
                {#if item.count != null}
                  <span class="sub-item-badge">{item.count}</span>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Admin section (role-gated) -->
  {#if hasAdmin}
    {@const adminSubItems = getSubItemsForTab("admin")}
    {@const adminOpen = openSections.has("admin")}
    <div class="sidebar-divider"></div>
    <div class="sidebar-tab-group">
      <div class="sidebar-tab-row">
        <button
          onclick={() => {
            onAdmin();
            toggleSection("admin");
          }}
          type="button"
          class="sidebar-tab"
          class:active={activeArea?.startsWith("admin") ?? false}
          aria-label={m.admin_hub_title()}
          aria-current={(activeArea?.startsWith("admin") ?? false)
            ? "page"
            : undefined}
          tabindex={focusedIndex === allTabs.length ? 0 : -1}
          data-sidebar-id="admin"
        >
          <span class="sidebar-icon">
            <Building2 size={24} aria-hidden="true" />
          </span>
          {#if isExpanded}
            <span class="sidebar-label">{m.admin_hub_title()}</span>
          {/if}
        </button>
        {#if isExpanded && adminSubItems.length > 0}
          <button
            type="button"
            class="sidebar-chevron"
            class:open={adminOpen}
            aria-label={m.nav_more()}
            onclick={(e) => {
              e.stopPropagation();
              toggleSection("admin");
            }}
          >
            <ChevronDown size={16} aria-hidden="true" />
          </button>
        {/if}
      </div>
      {#if isExpanded && adminOpen && adminSubItems.length > 0}
        <div class="sidebar-sub-items" role="group">
          {#each adminSubItems as item (item.id)}
            <button type="button" class="sidebar-sub-item" onclick={item.ontap}>
              <span class="sub-item-label">{item.label}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Spacer -->
  <div class="sidebar-spacer"></div>

  <!-- User section (pinned bottom) -->
  <div class="sidebar-divider"></div>
  <div class="sidebar-user">
    <div class="sidebar-user-identity">
      <span class="sidebar-avatar" aria-hidden="true">
        {userInitials}
      </span>
      {#if isExpanded}
        <span class="sidebar-user-name">{userName}</span>
      {/if}
    </div>
    <button
      onclick={() => onNavigate(roleInfo.path)}
      type="button"
      class="sidebar-role-badge"
      aria-label={m.sidebar_role_badge_label({ role: roleInfo.name })}
      tabindex={focusedIndex === focusableIds.length - 3 ? 0 : -1}
      data-sidebar-id="role"
    >
      <span class="stamp-chip sidebar-role-stamp">
        {isExpanded ? roleInfo.name : roleInfo.name.charAt(0)}
      </span>
    </button>
    <button
      onclick={onSettings}
      type="button"
      class="sidebar-user-action"
      class:active={activeArea === "settings"}
      aria-label={m.panel_settings()}
      aria-current={activeArea === "settings" ? "page" : undefined}
      tabindex={focusedIndex === focusableIds.length - 2 ? 0 : -1}
      data-sidebar-id="settings"
    >
      <span class="sidebar-icon">
        <Settings size={20} aria-hidden="true" />
      </span>
      {#if isExpanded}
        <span class="sidebar-action-label">{m.panel_settings()}</span>
      {/if}
    </button>
    <button
      onclick={onLogout}
      type="button"
      class="sidebar-user-action"
      aria-label={m.panel_logout()}
      tabindex={focusedIndex === focusableIds.length - 1 ? 0 : -1}
      data-sidebar-id="logout"
    >
      <span class="sidebar-icon">
        <LogOut size={20} aria-hidden="true" />
      </span>
      {#if isExpanded}
        <span class="sidebar-action-label">{m.panel_logout()}</span>
      {/if}
    </button>
  </div>
</nav>

<style>
  .desktop-sidebar {
    display: flex;
    flex-direction: column;
    width: var(--sidebar-width-collapsed, 64px);
    min-height: 0;
    height: 100%;
    background: var(--glass-surface);
    color: var(--glass-text);
    border-inline-end: 1px solid var(--glass-highlight);
    transition:
      width 200ms ease,
      box-shadow 200ms ease;
    overflow: hidden;
    flex-shrink: 0;
    z-index: 10;
  }

  .desktop-sidebar.expanded {
    width: var(--sidebar-width-expanded, 240px);
  }

  @media (prefers-reduced-motion: reduce) {
    .desktop-sidebar {
      transition: none;
    }
  }

  @media (prefers-contrast: more) {
    .desktop-sidebar {
      background: Canvas;
      color: CanvasText;
      border-inline-end: 1px solid CanvasText;
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
    }
  }

  /* ── Header ── */
  .sidebar-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    padding-inline-start: calc(0.75rem + 3px);
    min-height: 48px;
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: var(--brand-fill, var(--brand-primary));
    color: var(--brand-text, var(--paper));
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    overflow: hidden;
    flex-shrink: 0;
  }

  .sidebar-logo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .sidebar-org-name {
    font-size: var(--text-base);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  /* ── Tab list ── */
  .sidebar-tabs {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0.25rem 0;
  }

  .sidebar-tab-group {
    display: flex;
    flex-direction: column;
  }

  .sidebar-tab-row {
    display: flex;
    align-items: center;
  }

  .sidebar-tab {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: none;
    background: transparent;
    color: var(--glass-text);
    cursor: pointer;
    border-radius: 8px;
    margin-inline: 0.375rem;
    transition: background-color 150ms ease;
    font-size: var(--text-base);
    text-align: start;
  }

  .sidebar-tab:hover {
    background: var(--brand-primary-20);
  }

  .sidebar-tab:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: -2px;
  }

  .sidebar-tab.active {
    background: var(--brand-primary-20);
  }

  .sidebar-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .sidebar-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  /* ── Chevron ── */
  .sidebar-chevron {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    border-radius: 4px;
    margin-inline-end: 0.5rem;
    flex-shrink: 0;
  }

  .sidebar-chevron:hover {
    background: var(--brand-primary-20);
  }

  /* Rotation lives on the icon, not the button, so the expanded hit box
     below stays axis-aligned. */
  .sidebar-chevron :global(svg) {
    transition: transform 150ms ease;
  }

  .sidebar-chevron.open :global(svg) {
    transform: rotate(0deg);
  }

  .sidebar-chevron:not(.open) :global(svg) {
    transform: rotate(-90deg);
  }

  /* Grows the 28px chevron hit box to the full 40px row height (desktop
     pointer floor is 24px, WCAG 2.5.8); no horizontal reach, the tab button
     abuts on the inline-start side. */
  .sidebar-chevron::after {
    content: "";
    position: absolute;
    inset: -6px 0;
  }

  /* ── Sub-items ── */
  .sidebar-sub-items {
    display: flex;
    flex-direction: column;
  }

  .sidebar-sub-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    /* WCAG 2.5.8 floor for desktop pointer targets; the computed height is
       ~27px today, so this only guards against tighter fonts or themes. */
    min-height: 1.5rem;
    padding: 0.375rem 0.75rem;
    padding-inline-start: 2.5rem;
    border: none;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    font-size: var(--text-sm);
    text-align: start;
    width: 100%;
    transition: background-color 150ms ease;
  }

  .sidebar-sub-item:hover {
    background: var(--raised, var(--surface-1, var(--brand-primary-20)));
  }

  .sub-item-star {
    color: var(--brand-accent-text);
    font-size: var(--text-sm);
    flex-shrink: 0;
  }

  .sub-item-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .sub-item-badge {
    margin-inline-start: auto;
    font-size: var(--text-xs);
    background: var(--brand-accent);
    color: var(--brand-accent-on);
    border-radius: 9999px;
    padding: 0 0.375rem;
    min-width: 1.25rem;
    text-align: center;
    line-height: 1.25rem;
    flex-shrink: 0;
  }

  /* ── Divider ── */
  .sidebar-divider {
    height: 1px;
    background: var(--hair, var(--divider));
    margin: 0.25rem 0.75rem;
  }

  /* ── Spacer ── */
  .sidebar-spacer {
    flex: 1;
  }

  /* ── User section ── */
  .sidebar-user {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0.5rem 0;
  }

  .sidebar-user-identity {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.375rem 0.75rem;
    margin-inline: 0.375rem;
  }

  .sidebar-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: var(--brand-fill, var(--brand-primary));
    color: var(--brand-text, var(--paper));
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }

  .sidebar-user-name {
    font-size: var(--text-base);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  /* Role badge: the AvatarPanel stamp brought to the rail. Compact form
     shows the role's initial; the full stamp label needs expanded width.
     Same row ergonomics as .sidebar-user-action, identity ink on the stamp. */
  .sidebar-role-badge {
    display: flex;
    align-items: center;
    padding: 0.375rem 0.75rem;
    border: none;
    background: transparent;
    color: var(--brand-text, var(--brand-primary));
    cursor: pointer;
    text-align: start;
    width: calc(100% - 0.75rem);
    transition: background-color 150ms ease;
    border-radius: 8px;
    margin-inline: 0.375rem;
  }

  .sidebar-role-badge:hover {
    background: var(--brand-primary-20);
  }

  .sidebar-role-badge:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: -2px;
  }

  /* Compact stamp centers on the 24px icon column so it sits directly
     beneath the avatar at rail width. The button row keeps the pointer
     target above the 24px floor (WCAG 2.5.8); a corner overlay on the
     28px avatar could not. */
  .sidebar-role-stamp {
    min-width: 24px;
    text-align: center;
  }

  .sidebar-user-action {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.375rem 0.75rem;
    border: none;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    font-size: var(--text-sm);
    text-align: start;
    width: calc(100% - 0.75rem);
    transition: background-color 150ms ease;
    border-radius: 8px;
    margin-inline: 0.375rem;
  }

  .sidebar-user-action:hover {
    background: var(--brand-primary-20);
  }

  .sidebar-user-action.active {
    background: var(--brand-primary-20);
    color: var(--glass-text);
  }

  .sidebar-user-action:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: -2px;
  }

  .sidebar-action-label {
    white-space: nowrap;
  }
</style>
