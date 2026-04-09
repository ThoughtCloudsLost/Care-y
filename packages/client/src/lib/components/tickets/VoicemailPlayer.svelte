<!--
  Inline voicemail audio player for the chat timeline.

  Renders inside a Konsta Message `text` snippet. Shows a play/pause button,
  current time, SVG waveform visualization, and total duration.

  Self-fetching: receives recording metadata as props, fetches the encrypted
  blob via tRPC, decrypts via CryptoBridge.decryptBlob, then decodes to
  AudioBuffer for playback.

  iOS Safari compliance: AudioContext is a module-level singleton created on
  first user interaction. Audio is eagerly decrypted and decoded in background
  on mount. Play tap starts playback synchronously from the pre-decoded
  AudioBuffer, satisfying iOS's user activation requirement.

  Security: the AudioBuffer sits in memory until unmount. Browser GC handles
  cleanup (Web Audio API buffers are not user-controllable). The component
  nullifies its reference on teardown.
-->
<script lang="ts">
  import { Button } from "konsta/svelte";
  import { Play, Pause } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { formatDuration } from "$lib/utils/time.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getCryptoBridge } from "$lib/crypto/context.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";

  interface Props {
    /** Recording UUID from RecordingRecord. */
    recordingId: string;
    /** Ticket UUID (for tk resolution). */
    ticketId: string;
    /** ECIES key wrap for this ticket's tk. */
    keyWrap: TicketKeyWrap | null;
    /** Duration in seconds (from RecordingRecord metadata). */
    durationSeconds: number | null;
  }

  let { recordingId, ticketId, keyWrap, durationSeconds }: Props = $props();

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;
  const bridge = getCryptoBridge();

  // --- Module-level AudioContext singleton ---
  // One per page, not per player. Created lazily on first play tap.
  const getAudioContext = (() => {
    let ctx: AudioContext | null = null;
    return (): AudioContext => {
      ctx ??= new AudioContext();
      return ctx;
    };
  })();

  // --- Component state ---
  let audioBuffer = $state<AudioBuffer | null>(null);
  let sourceNode = $state<AudioBufferSourceNode | null>(null);
  let isPlaying = $state(false);
  let currentTime = $state(0);
  let peaks: number[] = $state([]);
  let fetchError = $state(false);
  let animFrameId = 0;
  let playStartedAt = 0;
  let playOffset = 0;

  const duration = $derived(
    audioBuffer !== null ? audioBuffer.duration : (durationSeconds ?? 0),
  );
  const progress = $derived(duration > 0 ? currentTime / duration : 0);
  const isLoading = $derived(!fetchError && audioBuffer === null);

  // --- Eager fetch + decrypt + decode on mount ---
  $effect(() => {
    if (keyWrap === null) {
      fetchError = true;
      return;
    }

    const ac = new AbortController();
    const aborted = (): boolean => ac.signal.aborted;

    void (async () => {
      try {
        // Fetch encrypted blob from server
        const { data: encryptedBase64 } =
          await ticketRouter.downloadRecordingBlob.query({ recordingId });
        if (aborted()) return;

        // Decrypt via Worker (returns raw ArrayBuffer)
        const decryptedBuf = await bridge.decryptBlob(
          ticketId,
          keyWrap.ephemeralPoint,
          keyWrap.nonce,
          keyWrap.wrappedKey,
          encryptedBase64,
        );
        if (aborted()) return;

        // Decode audio data
        const ctx = getAudioContext();
        const buffer = await ctx.decodeAudioData(decryptedBuf);
        if (aborted()) return;

        audioBuffer = buffer;

        // Extract waveform peaks (downsample to ~50 bars)
        const channelData = buffer.getChannelData(0);
        const numPeaks = 50;
        const step = Math.max(1, Math.floor(channelData.length / numPeaks));
        const extracted: number[] = [];
        for (let i = 0; i < channelData.length; i += step) {
          let max = 0;
          const end = Math.min(i + step, channelData.length);
          for (let j = i; j < end; j++) {
            const sample = channelData.at(j) ?? 0;
            const abs = Math.abs(sample);
            if (abs > max) max = abs;
          }
          extracted.push(max);
        }
        peaks = extracted;
      } catch {
        if (!aborted()) fetchError = true;
      }
    })();

    return () => {
      ac.abort();
    };
  });

  // --- Playback time tracking ---
  function trackTime(): void {
    if (!isPlaying) return;
    const ctx = getAudioContext();
    currentTime = playOffset + (ctx.currentTime - playStartedAt);
    if (currentTime >= duration) {
      currentTime = 0;
      isPlaying = false;
      return;
    }
    animFrameId = requestAnimationFrame(trackTime);
  }

  // --- Play / Pause ---
  function togglePlay(): void {
    const ctx = getAudioContext();

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    if (isPlaying && sourceNode) {
      sourceNode.stop();
      sourceNode.disconnect();
      sourceNode = null;
      playOffset = currentTime;
      isPlaying = false;
      cancelAnimationFrame(animFrameId);
      return;
    }

    if (audioBuffer === null) return;

    const node = ctx.createBufferSource();
    node.buffer = audioBuffer;
    node.connect(ctx.destination);
    node.onended = () => {
      isPlaying = false;
      currentTime = 0;
      playOffset = 0;
      sourceNode = null;
      cancelAnimationFrame(animFrameId);
    };
    node.start(0, currentTime);
    playStartedAt = ctx.currentTime;
    playOffset = currentTime;
    sourceNode = node;
    isPlaying = true;
    animFrameId = requestAnimationFrame(trackTime);
  }

  // --- Cleanup ---
  $effect(() => {
    return () => {
      cancelAnimationFrame(animFrameId);
      if (sourceNode) {
        sourceNode.stop();
        sourceNode.disconnect();
      }
      audioBuffer = null;
      sourceNode = null;
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
    <div class="shimmer shimmer-voicemail"></div>
    <span class="voicemail-loading-text">{m.ticket_voicemail_loading()}</span>
  </div>
{:else}
  <div
    class="voicemail-player"
    role="group"
    aria-label={m.ticket_voicemail_group({
      duration: formatDuration(duration),
    })}
  >
    <Button
      inline
      rounded
      onclick={togglePlay}
      disabled={audioBuffer === null}
      aria-label={isPlaying
        ? m.ticket_voicemail_pause()
        : m.ticket_voicemail_play()}
      class="voicemail-play-btn w-8 h-8 p-0 flex items-center justify-center"
    >
      {#if isPlaying}
        <Pause size={16} aria-hidden="true" />
      {:else}
        <Play size={16} aria-hidden="true" />
      {/if}
    </Button>

    <span class="voicemail-time">{formatDuration(currentTime)}</span>

    <svg
      class="waveform"
      viewBox="0 0 {peaks.length} 40"
      preserveAspectRatio="none"
      role="progressbar"
      aria-valuenow={Math.round(currentTime)}
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-label={m.ticket_voicemail_progress({
        current: formatDuration(currentTime),
        total: formatDuration(duration),
      })}
    >
      {#each peaks as peak, i (i)}
        <rect
          x={i}
          y={20 - peak * 18}
          width="0.6"
          height={Math.max(peak * 36, 1)}
          fill={i / peaks.length <= progress
            ? "var(--brand-primary)"
            : "var(--muted)"}
          rx="0.3"
        />
      {/each}
    </svg>

    <span class="voicemail-time">{formatDuration(duration)}</span>
  </div>
{/if}

<style>
  .voicemail-player {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.25rem;
    min-width: 12rem;
  }

  :global(.voicemail-play-btn) {
    flex-shrink: 0;
  }

  .waveform {
    flex: 1;
    height: 2rem;
    min-width: 0;
  }

  .voicemail-time {
    font-size: 0.6875rem;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 2rem;
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

  .shimmer-voicemail {
    width: 6rem;
    height: 1.5rem;
    border-radius: 0.25rem;
    background: linear-gradient(
      90deg,
      var(--surface-2) 25%,
      var(--surface-1) 50%,
      var(--surface-2) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite linear;
  }

  @keyframes shimmer {
    from {
      background-position: 200% 0;
    }
    to {
      background-position: -200% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .shimmer-voicemail {
      animation: none;
      background: var(--surface-2);
    }
  }
</style>
