<!--
  Inline voicemail audio player for the chat timeline.

  Fetches encrypted recording blob via tRPC, decrypts via CryptoBridge,
  decodes to AudioBuffer, then delegates playback rendering to AudioPlayer.

  iOS Safari: AudioContext singleton created on first user interaction.
  Audio decoded eagerly on mount so AudioPlayer can start playback
  synchronously from the pre-decoded buffer.
-->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import AudioPlayer from "$lib/components/AudioPlayer.svelte";
  import { trpc } from "$lib/trpc/index.js";
  import { getCryptoBridge } from "$lib/crypto/context.js";
  import { requireRouter } from "$lib/errors.js";
  import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";

  interface Props {
    recordingId: string;
    ticketId: string;
    keyWrap: TicketKeyWrap | null;
    durationSeconds: number | null;
  }

  let { recordingId, ticketId, keyWrap, durationSeconds }: Props = $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const bridge = getCryptoBridge();

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
    if (keyWrap === null) {
      fetchError = true;
      return;
    }

    const ac = new AbortController();
    const aborted = (): boolean => ac.signal.aborted;

    void (async () => {
      try {
        const { data: encryptedBase64 } =
          await ticketRouter.downloadRecordingBlob.query({ recordingId });
        if (aborted()) return;

        const decryptedBuf = await bridge.decryptBlob(
          ticketId,
          keyWrap.ephemeralPoint,
          keyWrap.nonce,
          keyWrap.wrappedKey,
          encryptedBase64,
        );
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
