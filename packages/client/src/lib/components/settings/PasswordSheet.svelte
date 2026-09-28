<script lang="ts">
  import { Save } from "@lucide/svelte";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { authKeys } from "$lib/query/keys.js";
  import * as m from "$lib/paraglide/messages.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import PasswordChangeForm from "./PasswordChangeForm.svelte";

  interface PasswordSheetProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
    readonly userId: string;
  }

  let { opened, ondismiss, userId }: PasswordSheetProps = $props();

  const queryClient = useQueryClient();

  let form = $state<ReturnType<typeof PasswordChangeForm> | null>(null);
  let wasOpen = $state(false);

  $effect(() => {
    if (opened && !wasOpen) {
      form?.reset();
    }
    wasOpen = opened;
  });

  let canSubmit = $state(false);
  let isPending = $state(false);

  async function handleSubmit(): Promise<void> {
    await form?.submit();
  }

  async function handleDone(): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: authKeys.me() });
    ondismiss();
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.settings_password_change()}
  title={m.settings_password_change()}
>
  {#snippet headerRight()}
    <SoftButton onclick={handleSubmit} disabled={!canSubmit || isPending}>
      {#if isPending}
        {m.common_loading()}
      {:else}
        <Save size={16} aria-hidden="true" />
        {m.settings_change()}
      {/if}
    </SoftButton>
  {/snippet}
  <div class="sheet-content">
    <PasswordChangeForm
      bind:this={form}
      bind:canSubmit
      bind:pending={isPending}
      {userId}
      ondone={handleDone}
    />
  </div>
</ShellSheet>

<style>
  .sheet-content {
    display: flex;
    flex-direction: column;
    padding: 0 0 var(--space-lg);
    flex: 1;
  }
</style>
