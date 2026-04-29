<script lang="ts">
  import { DialogButton, Preloader } from "konsta/svelte";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { adminKeys, orgKeyKeys } from "$lib/query/keys.js";
  import {
    generateOrgKeypair,
    wrapKey,
    encode,
    decode,
    toRistrettoPoint,
    getSodium,
  } from "@care-y/crypto";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgKeyManager, getCryptoBridge } from "$lib/crypto/context.js";
  import { fetchAndUnwrapOrgKey } from "$lib/auth/crypto-helpers.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";

  type RotationPhase =
    | "idle"
    | "generating"
    | "wrapping"
    | "submitting"
    | "done"
    | "error";

  const authRouter = trpc.auth;
  const keysRouter = trpc.keys;
  const queryClient = useQueryClient();
  const orgKeyManager = getOrgKeyManager();
  const bridge = getCryptoBridge();

  const usersQuery = createQuery(() => ({
    queryKey: adminKeys.users(),
    queryFn: async () => authRouter.listUsers.query(),
  }));

  type UserRecord = NonNullable<typeof usersQuery.data>[number];
  type UserWithKey = UserRecord & { volPublic: string };

  const activeWithKeys = $derived(
    (usersQuery.data ?? []).filter(
      (u): u is UserWithKey => u.isActive && u.volPublic !== null,
    ),
  );

  let confirmOpened = $state(false);
  let progressOpened = $state(false);
  let rotationPhase = $state<RotationPhase>("idle");
  let errorMessage = $state("");

  export function open(): void {
    confirmOpened = true;
  }

  function dismissConfirm(): void {
    confirmOpened = false;
  }

  function dismissProgress(): void {
    if (rotationPhase === "done" || rotationPhase === "error") {
      progressOpened = false;
      rotationPhase = "idle";
      errorMessage = "";
    }
  }

  async function performRotation(): Promise<void> {
    confirmOpened = false;
    progressOpened = true;
    rotationPhase = "generating";

    try {
      await getSodium();
      const { publicKey, secretKey } = generateOrgKeypair();

      try {
        rotationPhase = "wrapping";

        const wrappedKeys = activeWithKeys.map((u) => {
          const volPubBytes = decode(u.volPublic);
          const volPubPoint = toRistrettoPoint(volPubBytes);
          const wrap = wrapKey(secretKey, volPubPoint);
          return {
            userId: u.id,
            ephemeralPoint: encode(wrap.ephemeralPoint),
            nonce: encode(wrap.nonce),
            wrappedKey: encode(wrap.ciphertext),
          };
        });

        rotationPhase = "submitting";

        await keysRouter.rotateOrgKey.mutate({
          newOrgPublicKey: encode(publicKey),
          wrappedKeys,
        });

        // Load new org key into Worker via normal unwrap path
        const orgPubB64 = await fetchAndUnwrapOrgKey(bridge);
        if (orgPubB64 !== null) orgKeyManager.load(orgPubB64);

        rotationPhase = "done";
        haptic();
        toastStore.show(m.admin_key_rotated());
        announceToLiveRegion("assertive", m.admin_key_rotated());
        void queryClient.invalidateQueries({ queryKey: adminKeys.users() });
        void queryClient.invalidateQueries({
          queryKey: orgKeyKeys.wrappedOrgKey(),
        });
      } finally {
        const { requireSodium } = await import("@care-y/crypto");
        const sodium = requireSodium();
        sodium.memzero(secretKey);
      }
    } catch (err: unknown) {
      rotationPhase = "error";
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<!-- Step 1: Confirmation dialog -->
<ShellDialog
  opened={confirmOpened}
  ondismiss={dismissConfirm}
  title={m.admin_rotation_dialog_title()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {m.admin_rotation_dialog_body({ count: String(activeWithKeys.length) })}
    </p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={dismissConfirm}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton strong onclick={() => void performRotation()}>
      {m.admin_rotation_confirm()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<!-- Step 2: Progress dialog -->
<ShellDialog
  opened={progressOpened}
  ondismiss={dismissProgress}
  title={m.admin_rotation_dialog_title()}
>
  {#snippet content()}
    <div
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      class="rotation-progress"
    >
      {#if rotationPhase === "generating"}
        <Preloader />
        <span>{m.admin_rotation_generating()}</span>
      {:else if rotationPhase === "wrapping"}
        <Preloader />
        <span
          >{m.admin_rotation_wrapping({
            count: String(activeWithKeys.length),
          })}</span
        >
      {:else if rotationPhase === "submitting"}
        <Preloader />
        <span>{m.admin_rotation_submitting()}</span>
      {:else if rotationPhase === "done"}
        <span>{m.admin_rotation_complete()}</span>
      {:else if rotationPhase === "error"}
        <div class="rotation-error">
          <p>{m.admin_rotation_error()}</p>
          <p class="text-xs text-[--muted]">{errorMessage}</p>
        </div>
      {/if}
    </div>
  {/snippet}
  {#snippet buttons()}
    {#if rotationPhase === "done"}
      <DialogButton strong onclick={dismissProgress}>
        {m.admin_rotation_done()}
      </DialogButton>
    {:else if rotationPhase === "error"}
      <DialogButton onclick={dismissProgress}>
        {m.common_cancel()}
      </DialogButton>
      <DialogButton strong onclick={() => void performRotation()}>
        {m.admin_rotation_retry()}
      </DialogButton>
    {/if}
  {/snippet}
</ShellDialog>

<style>
  .rotation-progress {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) 0;
    min-height: 3rem;
  }

  .rotation-error {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }
</style>
