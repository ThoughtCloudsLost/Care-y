<!--
  Upgrade chooser for bare-link portal sessions.

  Presents two security upgrade paths: add a password to the link,
  or create a full account. Rendered as a ShellSheet from the drawer.
  The passphrase-link variant (options contains only "account") is not
  a chooser: the drawer entry goes straight to account creation and
  never opens this sheet.
-->
<script lang="ts">
  import { Block, Button } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  interface UpgradeChooserProps {
    open: boolean;
    onclose: () => void;
    options: readonly ("passphrase" | "account")[];
    onchoose: (path: "passphrase" | "account") => void;
    /** Account page URL for the copy paragraph (e.g. "/account"). */
    accountUrl: string;
  }

  let { open, onclose, options, onchoose, accountUrl }: UpgradeChooserProps =
    $props();
</script>

<ShellSheet opened={open} ondismiss={onclose} title={m.portal_upgrade_title()}>
  <Block>
    <p class="chooser-body" data-testid="upgrade-body">
      {m.portal_upgrade_body()}
    </p>

    {#if options.includes("passphrase")}
      <p class="chooser-paragraph" data-testid="upgrade-passphrase-paragraph">
        {m.portal_upgrade_passphrase_paragraph()}
      </p>
    {/if}

    <p class="chooser-paragraph" data-testid="upgrade-account-paragraph">
      {m.portal_upgrade_account_paragraph({ url: accountUrl })}
    </p>

    <div class="chooser-actions">
      {#if options.includes("passphrase")}
        <Button
          large
          onclick={() => onchoose("passphrase")}
          data-testid="upgrade-add-passphrase"
        >
          {m.portal_upgrade_add_passphrase()}
        </Button>
      {/if}
      <Button
        large
        outline
        onclick={() => onchoose("account")}
        data-testid="upgrade-create-account"
      >
        {m.portal_upgrade_create_account()}
      </Button>
    </div>
  </Block>
</ShellSheet>

<style>
  .chooser-body {
    font-size: var(--text-sm);
    color: var(--ink);
    line-height: 1.6;
    margin: 0 0 var(--space-md) 0;
  }

  .chooser-paragraph {
    font-size: var(--text-sm);
    color: var(--ink);
    line-height: 1.6;
    margin: 0 0 var(--space-md) 0;
  }

  .chooser-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin-top: var(--space-lg);
  }
</style>
