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
-->
<script lang="ts">
  import { List, ListItem } from "konsta/svelte";
  import { FileText } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { resolve } from "$app/paths";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import type { Locale } from "$lib/paraglide/runtime.js";
  import ShellPanel from "$lib/shell/ShellPanel.svelte";
  import LanguagePicker from "$lib/components/inputs/LanguagePicker.svelte";
  import type { ClientDrawerAction } from "./context.js";

  interface ClientDrawerProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
    /** Entries published by the current page. May be empty. */
    readonly actions: readonly ClientDrawerAction[];
    readonly locale: Locale;
    readonly onlocalechange: (locale: Locale) => void;
  }

  let {
    opened,
    ondismiss,
    actions,
    locale,
    onlocalechange,
  }: ClientDrawerProps = $props();

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
      <div class="footer-language">
        <LanguagePicker value={locale} onchange={onlocalechange} />
      </div>
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

  .footer-language {
    display: flex;
    justify-content: center;
    min-height: 44px;
    align-items: center;
  }

  .drawer-icon {
    color: var(--brand-accent, var(--k-color-primary));
  }

  /* Sign out is destructive: the danger slot, never a Konsta red. */
  .drawer-icon--destructive {
    color: var(--danger, var(--k-color-red, #ef4444));
  }
</style>
