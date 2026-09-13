<!--
  Client-portal drawer.

  The client-side counterpart of the org app's AvatarPanel: a ShellPanel
  holding whatever the current client page can actually do, plus the
  standing language and privacy controls that used to sit in a page footer
  where they scrolled away.

  Page actions come from the client shell context, so the drawer never owns
  flow state of its own. The account-upgrade entry drives the same
  createPortalUpgrade composable the in-thread card drives; there is one
  upgrade state machine, not two.

  Quick exit is deliberately NOT in here. It stays in the navbar so it is
  never behind a tap. That holds while this panel is open too.

  The drawer opens with the same identity header the org panel uses, so a
  client who wants to confirm who they are talking to can do it from either
  place. The language picker is NOT in here: it sits in the navbar beside
  the org name, which is where the org app, the onboarding layout, and the
  login page all put it.
-->
<script lang="ts">
  import { List, ListItem } from "konsta/svelte";
  import { Building2, FileText, Moon, Sun } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { resolve } from "$app/paths";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import ShellPanel from "$lib/shell/ShellPanel.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import { themeStore } from "$lib/stores/theme.svelte.js";
  import type { ClientDrawerAction } from "./context.js";

  interface ClientDrawerProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
    /** Entries published by the current page. May be empty. */
    readonly actions: readonly ClientDrawerAction[];
    /** Org logo, or null when the org has set none. */
    readonly logoUrl: string | null;
    /** Org name. Empty while branding is still resolving. */
    readonly orgName: string;
    /** True while the org name is still being fetched. */
    readonly orgNamePending?: boolean;
  }

  let {
    opened,
    ondismiss,
    actions,
    logoUrl,
    orgName,
    orgNamePending = false,
  }: ClientDrawerProps = $props();

  // The identity here is the org, not a person, so the fallback initials
  // come from the org name. A client has no user identity to show.
  const initials = $derived(
    orgName === ""
      ? null
      : orgName
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w.charAt(0).toUpperCase())
          .join(""),
  );

  function runAction(action: ClientDrawerAction): void {
    ondismiss();
    action.onclick();
  }

  const PRIVACY_PATH = "/intake/privacy";

  // A menu entry that navigates to the page you are already on reads as
  // broken, so it drops out on the privacy notice itself.
  const onPrivacyPage = $derived(page.url.pathname === PRIVACY_PATH);

  function openPrivacy(): void {
    ondismiss();
    void goto(resolve(PRIVACY_PATH));
  }
</script>

<ShellPanel {opened} {ondismiss} side="left" ariaLabel={m.portal_menu_label()}>
  <div class="client-drawer">
    <div class="drawer-scroll">
      <div class="panel-profile">
        <span class="panel-avatar" aria-hidden="true">
          {#if logoUrl}
            <img
              src={logoUrl}
              alt=""
              class="panel-avatar-logo"
              loading="eager"
            />
          {:else if initials}
            {initials}
          {:else}
            <Building2 size={22} />
          {/if}
        </span>
        <span class="panel-name">
          <InlineSkeleton loading={orgNamePending} width="10ch">
            {orgName}
          </InlineSkeleton>
        </span>
      </div>

      {#if actions.length > 0}
        <List nested>
          {#each actions as action (action.id)}
            <ListItem
              title={action.label}
              chevron={false}
              onclick={() => runAction(action)}
              data-testid="drawer-action-{action.id}"
            >
              {#snippet media()}
                {#if action.icon}
                  <span
                    class="drawer-icon"
                    class:drawer-icon--destructive={action.destructive}
                  >
                    <action.icon size={20} aria-hidden="true" />
                  </span>
                {/if}
              {/snippet}
            </ListItem>
          {/each}
        </List>
      {/if}

      <!-- Standing appearance toggle. Deliberately does not dismiss: the
           scheme change is its own feedback, and the label flips in place.
           Persists via the same store and localStorage key the org app
           uses, so the whole origin follows. -->
      <List nested>
        <ListItem
          title={themeStore.resolvedScheme === "dark"
            ? m.portal_theme_to_light()
            : m.portal_theme_to_dark()}
          chevron={false}
          onclick={() => themeStore.toggleColorScheme()}
          data-testid="drawer-theme-toggle"
        >
          {#snippet media()}
            <span class="drawer-icon">
              {#if themeStore.resolvedScheme === "dark"}
                <Sun size={20} aria-hidden="true" />
              {:else}
                <Moon size={20} aria-hidden="true" />
              {/if}
            </span>
          {/snippet}
        </ListItem>
      </List>
    </div>

    <div class="drawer-footer">
      {#if !onPrivacyPage}
        <button
          type="button"
          class="footer-pill"
          onclick={openPrivacy}
          data-testid="drawer-privacy"
        >
          <FileText size={16} aria-hidden="true" />
          {m.intake_footer_privacy()}
        </button>
      {/if}
    </div>
  </div>
</ShellPanel>

<style>
  .client-drawer {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .drawer-scroll {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-top: var(--space-md);
  }

  .drawer-footer {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: 12px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    border-top: 1px solid var(--hair, var(--border));
  }

  .footer-pill {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 44px;
    padding: 6px 10px;
    border: 1px solid var(--hair-2, var(--border));
    border-radius: 20px;
    background: transparent;
    color: inherit;
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .footer-pill:active {
    opacity: 0.7;
  }

  /* Same anatomy as the org app's panel header, so the two read as one
     product from either side. No role chip: the identity here is the org,
     and a client has no role in it. */
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
    overflow: hidden;
    background: var(--brand-fill, var(--brand-primary));
    color: var(--brand-on, #fff);
    font-size: 18px;
    font-weight: 600;
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

  .drawer-icon {
    color: var(--brand-accent, var(--k-color-primary));
  }

  /* Sign out is destructive: the danger slot, never a Konsta red. */
  .drawer-icon--destructive {
    color: var(--danger, var(--k-color-red, #ef4444));
  }
</style>
