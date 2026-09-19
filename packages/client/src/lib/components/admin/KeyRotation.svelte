<script lang="ts">
  import { DialogButton, Preloader } from "konsta/svelte";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { adminKeys, orgKeyKeys } from "$lib/query/keys.js";
  import {
    generateOrgKeypair,
    sealPrevGeneration,
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
  import {
    resealTables,
    resealBlobTables,
    resealBrandingClasses,
    reindexViewerTables,
    RED_TIER_TABLES,
    type ResealProgress,
  } from "$lib/crypto/org-reseal.js";
  import { resealSweep } from "$lib/crypto/reseal-sweep.svelte.js";

  // "resealing" runs after the server swap has already succeeded. If the
  // browser dies anywhere in that phase nothing is lost: the generation
  // chain keeps every old blob readable, and the next MANAGE_KEYS login
  // resumes the sweep. Do not add abort handling that blocks these steps.
  type RotationPhase =
    | "idle"
    | "generating"
    | "wrapping"
    | "submitting"
    | "resealing"
    | "done"
    | "error";

  interface Props {
    onRequestEscrowExport?: () => void;
  }

  const { onRequestEscrowExport }: Props = $props();

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
  let resealDone = $state(0);
  let resealTotal = $state(0);
  let resealIncomplete = $state(false);
  let resealErrorDetail = $state("");

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
      resealDone = 0;
      resealTotal = 0;
      resealIncomplete = false;
      resealErrorDetail = "";
    }
  }

  function openEscrowExport(): void {
    dismissProgress();
    onRequestEscrowExport?.();
  }

  function onResealProgress(p: ResealProgress): void {
    resealDone = p.done;
    resealTotal = p.total;
  }

  // Red-tier reseal, run inline right after the key swap. Each pass is
  // independently resumable; a failure here never undoes the rotation,
  // so it surfaces as "records pending" rather than a rotation error.
  async function runInlineReseal(): Promise<void> {
    const deps = { bridge };
    try {
      const rows = await resealTables(deps, RED_TIER_TABLES, onResealProgress);
      const blobs = await resealBlobTables(deps, onResealProgress);
      const branding = await resealBrandingClasses(deps, onResealProgress);
      const index = await reindexViewerTables(deps, onResealProgress);
      resealIncomplete =
        rows.skipped > 0 ||
        blobs.skipped > 0 ||
        branding.skipped > 0 ||
        index.indexPendingTables.length > 0;
    } catch (err: unknown) {
      // The swap already landed; the chain keeps everything readable and
      // the next MANAGE_KEYS login resumes the sweep. The cause is kept
      // for display so a network outage is distinguishable from a
      // permission gap.
      resealIncomplete = true;
      resealErrorDetail = err instanceof Error ? err.message : String(err);
    }
  }

  async function performRotation(): Promise<void> {
    confirmOpened = false;
    progressOpened = true;
    rotationPhase = "generating";

    try {
      await getSodium();

      // The outgoing secret seals into the generation chain so every blob
      // written before this rotation stays readable afterwards. Without it
      // the swap below would orphan all org-tier ciphertext.
      const currentKey = await keysRouter.getWrappedOrgKey.query();
      if (currentKey === null) {
        throw new Error("no org key to rotate");
      }
      const outgoingSecret = new Uint8Array(await bridge.exportOrgSecretKey());

      const { publicKey, secretKey } = generateOrgKeypair();

      try {
        rotationPhase = "wrapping";

        const chain = sealPrevGeneration(outgoingSecret, secretKey);

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
          newGeneration: currentKey.currentGeneration + 1,
          chainedFrom: {
            prevSecretCt: encode(chain.ciphertext),
            prevNonce: encode(chain.nonce),
          },
          wrappedKeys,
        });

        // Load new org key into Worker via normal unwrap path
        const orgPubB64 = await fetchAndUnwrapOrgKey(bridge);
        if (orgPubB64 !== null) orgKeyManager.load(orgPubB64);

        rotationPhase = "resealing";
        await runInlineReseal();

        rotationPhase = "done";

        // Red tier ran inline; trailing tier continues under the shell banner.
        void resealSweep.checkAndResume(bridge);

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
        sodium.memzero(outgoingSecret);
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
      {:else if rotationPhase === "resealing"}
        <Preloader />
        <span
          >{m.admin_rotation_resealing({
            done: String(resealDone),
            total: String(resealTotal),
          })}</span
        >
      {:else if rotationPhase === "done"}
        <div class="rotation-done">
          <p>{m.admin_rotation_complete()}</p>
          {#if resealIncomplete}
            <p class="text-xs text-[--muted]">
              {m.admin_rotation_reseal_pending()}
            </p>
            {#if resealErrorDetail}
              <p class="text-xs text-[--muted]">{resealErrorDetail}</p>
            {/if}
          {/if}
          <p class="text-xs text-[--muted]">
            {m.admin_rotation_reexport_escrow()}
          </p>
        </div>
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
      {#if onRequestEscrowExport}
        <DialogButton onclick={openEscrowExport}>
          {m.admin_rotation_export_escrow()}
        </DialogButton>
      {/if}
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

  .rotation-error,
  .rotation-done {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }
</style>
