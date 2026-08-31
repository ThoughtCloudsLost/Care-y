<!--
  Inline voicemail audio player for the chat timeline.

  Crypto-agnostic: the caller injects a `decrypt` callback so the same
  component renders on both org and portal surfaces without importing
  CryptoBridge or ticket-key types. Mirrors the MmsImage injected-decrypt
  pattern (ADR-092).

  Fetches the encrypted recording blob from `blobUrl`, decrypts via the
  caller's callback, decodes to AudioBuffer, then delegates playback
  rendering to AudioPlayer.

  iOS Safari: AudioContext singleton created on first user interaction.
  Audio decoded eagerly on mount so AudioPlayer can start playback
  synchronously from the pre-decoded buffer.
-->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import AudioPlayer from "$lib/components/AudioPlayer.svelte";
  import { fetchBlob } from "$lib/utils/fetch-blob.js";

  interface Props {
    /** URL to fetch the encrypted recording blob from. */
    blobUrl: string;
    /** Extra headers to send with the blob fetch (portal credentials). */
    fetchHeaders?: Record<string, string>;
    /** Decrypt callback injected by the caller (org bridge or portal main-thread). */
    decrypt: (ciphertext: ArrayBuffer) => Promise<ArrayBuffer>;
    durationSeconds: number | null;
  }

  let { blobUrl, fetchHeaders, decrypt, durationSeconds }: Props = $props();

  const getAudioContext = (() => {
    let ctx: AudioContext | null = null;
    return (): AudioContext => {
      ctx ??= new AudioContext();
      return ctx;
    };
  })();

  let audioBuffer = $state<AudioBuffer | null>(null);
  let fetchError = $state(false);
  const isLoading = $derived(!fetchError && audioBuffer === null);

  $effect(() => {
    const ac = new AbortController();
    const aborted = (): boolean => ac.signal.aborted;

    void (async () => {
      try {
        const ciphertext = await fetchBlob(blobUrl, ac.signal, fetchHeaders);
        if (aborted()) return;

        const decryptedBuf = await decrypt(ciphertext);
        if (aborted()) return;

        const ctx = getAudioContext();
        const buffer = await ctx.decodeAudioData(decryptedBuf);
        if (aborted()) return;

        audioBuffer = buffer;
      } catch {
        if (!aborted()) fetchError = true;
      }
    })();

    return () => {
      ac.abort();
    };
  });

  $effect(() => {
    return () => {
      audioBuffer = null;
    };
  });
</script>

{#if fetchError}
  <div class="voicemail-player voicemail-error" role="status">
    <span class="voicemail-error-text">{m.ticket_voicemail_error()}</span>
  </div>
{:else if isLoading}
  <div
    class="voicemail-player voicemail-loading"
    aria-busy="true"
    role="status"
  >
    <DecryptPlaceholder mode="media" block />
    <span class="voicemail-loading-text">{m.ticket_voicemail_loading()}</span>
  </div>
{:else if audioBuffer}
  <AudioPlayer
    buffer={audioBuffer}
    durationHint={durationSeconds ?? undefined}
  />
{/if}

<style>
  .voicemail-player {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.25rem;
    min-width: 12rem;
  }

  .voicemail-error {
    justify-content: center;
  }

  .voicemail-error-text {
    font-size: 0.75rem;
    color: var(--muted);
    font-style: italic;
  }

  .voicemail-loading {
    justify-content: center;
    gap: 0.375rem;
  }

  .voicemail-loading-text {
    font-size: 0.75rem;
    color: var(--muted);
  }
</style>
