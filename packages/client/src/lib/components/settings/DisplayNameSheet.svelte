<script lang="ts">
  import { List, ListInput } from "konsta/svelte";
  import { Save } from "@lucide/svelte";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { authKeys } from "$lib/query/keys.js";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgKeyManager, getOrgDecryptCache } from "$lib/crypto/context.js";
  import { uint8ArrayToBase64 } from "$lib/utils/buffer-encoding.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";

  interface DisplayNameSheetProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
    readonly currentName: string | null;
  }

  let { opened, ondismiss, currentName }: DisplayNameSheetProps = $props();

  const queryClient = useQueryClient();
  const orgKeyManager = getOrgKeyManager();
  const orgCache = getOrgDecryptCache();

  const textEncoder = new TextEncoder();

  let newName = $state("");
  let wasOpen = $state(false);

  $effect(() => {
    if (opened && !wasOpen) {
      newName = currentName ?? "";
    }
    wasOpen = opened;
  });

  const trimmedName = $derived(newName.trim());
  const nameValid = $derived(
    trimmedName.length >= 1 && trimmedName.length <= 100,
  );
  const hasChanges = $derived(trimmedName !== (currentName ?? ""));
  const canSubmit = $derived(orgKeyManager.isLoaded && nameValid && hasChanges);

  const mut = createMutation(() => ({
    mutationFn: async (input: { encryptedDisplayName: string }) =>
      trpc.profile.updateDisplayName.mutate(input),
    onSuccess: async () => {
      haptic();
      const msg = m.settings_display_name_saved();
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });
      orgCache.delete("me:display_name");
      ondismiss();
    },
    onError: () => {
      toastStore.show(m.settings_display_name_error());
    },
  }));

  const isPending = $derived(mut.isPending);

  async function handleSubmit(): Promise<void> {
    if (!canSubmit || isPending) return;

    const plainBytes = textEncoder.encode(trimmedName);
    const cipherBytes = await orgKeyManager.encrypt(plainBytes);
    const encryptedDisplayName = uint8ArrayToBase64(cipherBytes);

    mut.mutate({ encryptedDisplayName });
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.settings_display_name()}
  title={m.settings_display_name()}
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
    <List nested>
      <ListInput
        outline
        label={m.settings_display_name_new()}
        type="text"
        placeholder={m.settings_display_name_new()}
        value={newName}
        oninput={(e: Event) => {
          if (e.target instanceof HTMLInputElement) newName = e.target.value;
        }}
        disabled={isPending}
      />
    </List>
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
