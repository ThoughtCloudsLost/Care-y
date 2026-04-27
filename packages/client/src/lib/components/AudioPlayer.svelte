<!--
  Shared audio player for plaintext audio (no decryption).

  Fetches audio from a URL, decodes via AudioContext, renders play/pause
  button + waveform + time display. Used for greeting audio preview in
  the admin UI.

  iOS Safari: AudioContext singleton created on first user tap. Audio
  decoded eagerly on mount so play is synchronous from the pre-decoded
  buffer (satisfies iOS user activation requirement).
-->
<script lang="ts">
  import { Button } from "konsta/svelte";
  import { Play, Pause } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { ClientError } from "$lib/errors.js";
  import { formatDuration } from "$lib/utils/time.js";

  interface Props {
    src?: string;
    buffer?: AudioBuffer;
    durationHint?: number;
  }

  let { src, buffer: externalBuffer, durationHint }: Props = $props();

  const getAudioContext = (() => {
    let ctx: AudioContext | null = null;
    return (): AudioContext => {
      ctx ??= new AudioContext();
      return ctx;
    };
  })();

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
    audioBuffer !== null ? audioBuffer.duration : (durationHint ?? 0),
  );
  const progress = $derived(duration > 0 ? currentTime / duration : 0);
  const isLoading = $derived(!fetchError && audioBuffer === null);

  function extractPeaks(buf: AudioBuffer): number[] {
    const channelData = buf.getChannelData(0);
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
    return extracted;
  }

  $effect(() => {
    if (externalBuffer) {
      audioBuffer = externalBuffer;
      peaks = extractPeaks(externalBuffer);
      return;
    }

    if (src === undefined || src === "") {
      fetchError = true;
      return;
    }

    const ac = new AbortController();
    const aborted = (): boolean => ac.signal.aborted;

    void (async () => {
      try {
        const resp = await fetch(src, { signal: ac.signal });
        if (!resp.ok) throw new ClientError(`HTTP ${String(resp.status)}`);
        if (aborted()) return;

        const arrayBuf = await resp.arrayBuffer();
        if (aborted()) return;

        const ctx = getAudioContext();
        const decoded = await ctx.decodeAudioData(arrayBuf);
        if (aborted()) return;

        audioBuffer = decoded;
        peaks = extractPeaks(decoded);
      } catch {
        if (!aborted()) fetchError = true;
      }
    })();

    return () => {
      ac.abort();
    };
  });

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
  <div class="audio-player audio-error" role="status">
    <span class="audio-error-text">{m.ticket_voicemail_error()}</span>
  </div>
{:else if isLoading}
  <div class="audio-player audio-loading" aria-busy="true" role="status">
    <span class="audio-loading-text">{m.ticket_voicemail_loading()}</span>
  </div>
{:else}
  <div
    class="audio-player"
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
      class="audio-play-btn w-8 h-8 p-0 flex items-center justify-center"
    >
      {#if isPlaying}
        <Pause size={16} aria-hidden="true" />
      {:else}
        <Play size={16} aria-hidden="true" />
      {/if}
    </Button>

    <span class="audio-time">{formatDuration(currentTime)}</span>

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

    <span class="audio-time">{formatDuration(duration)}</span>
  </div>
{/if}

<style>
  .audio-player {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.25rem;
    min-width: 10rem;
  }

  :global(.audio-play-btn) {
    flex-shrink: 0;
  }

  .waveform {
    flex: 1;
    height: 2rem;
    min-width: 0;
  }

  .audio-time {
    font-size: 0.6875rem;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 2rem;
  }

  .audio-error {
    justify-content: center;
  }

  .audio-error-text {
    font-size: 0.75rem;
    color: var(--muted);
    font-style: italic;
  }

  .audio-loading {
    justify-content: center;
    gap: 0.375rem;
  }

  .audio-loading-text {
    font-size: 0.75rem;
    color: var(--muted);
  }
</style>
