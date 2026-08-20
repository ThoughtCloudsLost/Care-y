<!--
  Audio preview for greeting playback. Fetches audio bytes from the
  telephonyContent.getGreetingAudio tRPC endpoint, decodes to an
  AudioBuffer, and delegates rendering to AudioPlayer.

  Follows QuarantinePlayer's fetch-and-decode pattern but skips
  decryption (greeting audio is plaintext-public).

  Object URLs are not used here because AudioPlayer accepts a decoded
  AudioBuffer directly via its `buffer` prop, bypassing the need for
  a src URL entirely.
-->
<script lang="ts">
  import AudioPlayer from "$lib/components/AudioPlayer.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { base64ToUint8Array } from "$lib/utils/buffer-encoding.js";

  interface Props {
    greetingId: string;
  }

  let { greetingId }: Props = $props();

  const telephonyContent = requireRouter(
    trpc.telephonyContent,
    "telephonyContent",
  );

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

    // Reset state when greetingId changes
    audioBuffer = null;
    fetchError = false;

    void (async () => {
      try {
        const result = await telephonyContent.getGreetingAudio.query({
          greetingId,
        });
        if (aborted()) return;

        const audioBytes = base64ToUint8Array(result.audioBase64);
        if (aborted()) return;

        const ctx = getAudioContext();
        const audioCopy = new Uint8Array(audioBytes);
        const decoded = await ctx.decodeAudioData(audioCopy.buffer);
        if (aborted()) return;

        audioBuffer = decoded;
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
  <div class="gap-error" role="status">
    <span class="gap-error-text">{m.ticket_voicemail_error()}</span>
  </div>
{:else if isLoading}
  <div class="gap-loading" aria-busy="true" role="status">
    <span class="gap-loading-text">{m.ticket_voicemail_loading()}</span>
  </div>
{:else if audioBuffer}
  <AudioPlayer buffer={audioBuffer} />
{/if}

<style>
  .gap-error {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.375rem 0.25rem;
    min-width: 10rem;
  }

  .gap-error-text {
    font-size: 0.75rem;
    color: var(--muted);
    font-style: italic;
  }

  .gap-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.375rem 0.25rem;
    min-width: 10rem;
  }

  .gap-loading-text {
    font-size: 0.75rem;
    color: var(--muted);
  }
</style>
