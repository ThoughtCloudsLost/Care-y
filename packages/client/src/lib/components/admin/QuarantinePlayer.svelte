<!--
  Inline audio player for quarantined voicemails.

  Fetches sealed audio via the voicemailQuarantine.download endpoint,
  decrypts via OrgKeyManager (sealed-box), decodes to AudioBuffer, then
  delegates playback to AudioPlayer.

  Mirrors VoicemailPlayer's effect/abort/cleanup pattern but uses
  org-key unsealing instead of ticket-key decryption.
-->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import AudioPlayer from "$lib/components/AudioPlayer.svelte";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { base64ToUint8Array } from "$lib/utils/buffer-encoding.js";

  interface Props {
    sealedBase64: string;
    durationSeconds: number | null;
  }

  let { sealedBase64, durationSeconds }: Props = $props();

  const orgKeyManager = getOrgKeyManager();

  const getAudioContext = (() => {
    let ctx: AudioContext | null = null;
    return (): AudioContext => {
      ctx ??= new AudioContext();
      return ctx;
    };
  })();

  let audioBuffer = $state<AudioBuffer | null>(null);
  let decryptError = $state(false);
  const isLoading = $derived(!decryptError && audioBuffer === null);

  /**
   * Holds the raw decrypted audio bytes so the parent can retrieve
   * them for the route mutation without a second download+unseal.
   */
  let unsealedBytes = $state<Uint8Array | null>(null);

  export function getUnsealedAudio(): Uint8Array | null {
    return unsealedBytes;
  }

  $effect(() => {
    const ac = new AbortController();
    const aborted = (): boolean => ac.signal.aborted;

    void (async () => {
      try {
        const ciphertext = base64ToUint8Array(sealedBase64);
        if (aborted()) return;

        const plaintext = await orgKeyManager.decrypt(ciphertext);
        if (aborted()) return;

        unsealedBytes = plaintext;

        const ctx = getAudioContext();
        const audioCopy = new Uint8Array(plaintext);
        const buffer = await ctx.decodeAudioData(audioCopy.buffer);
        if (aborted()) return;

        audioBuffer = buffer;
      } catch {
        if (!aborted()) decryptError = true;
      }
    })();

    return () => {
      ac.abort();
    };
  });

  $effect(() => {
    return () => {
      audioBuffer = null;
      unsealedBytes = null;
    };
  });
</script>

{#if decryptError}
  <div class="qp-error" role="status">
    <span class="qp-error-text">{m.admin_quarantine_player_error()}</span>
  </div>
{:else if isLoading}
  <div class="qp-loading" aria-busy="true" role="status">
    <DecryptPlaceholder mode="media" block />
    <span class="qp-loading-text">{m.admin_quarantine_player_loading()}</span>
  </div>
{:else if audioBuffer}
  <AudioPlayer
    buffer={audioBuffer}
    durationHint={durationSeconds ?? undefined}
  />
{/if}

<style>
  .qp-error {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.375rem 0.25rem;
    min-width: 12rem;
  }

  .qp-error-text {
    font-size: 0.75rem;
    color: var(--muted);
    font-style: italic;
  }

  .qp-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.375rem 0.25rem;
    min-width: 12rem;
  }

  .qp-loading-text {
    font-size: 0.75rem;
    color: var(--muted);
  }
</style>
