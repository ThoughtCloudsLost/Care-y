<script lang="ts">
  import type { Snippet } from "svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { isDecryptError } from "$lib/crypto/async-decrypt-cache.js";

  interface Props {
    /** Decrypted value: undefined/null = loading, error sentinel = error, string = ready */
    content?: string | null;
    /** Encrypted data for automatic length estimation (ciphertext bytes - 40 = plaintext chars).
     *  Accepts unknown to avoid forcing callers to import SerializedBuffer. Runtime type-checked. */
    ciphertext?: unknown;
    /**
     * Display mode:
     *  - "text": scrambled alphanumeric characters (inline text fields)
     *  - "media": grid of block characters (images, files, non-text)
     * Only use this component for client-decrypted content.
     * Server-returned plaintext should use <InlineSkeleton> instead.
     */
    mode?: "text" | "media";
    /** Fallback character count when ciphertext unavailable (loading skeletons) */
    length?: number;
    /** Render as block-level element (for notes, messages, or media) */
    block?: boolean;
    /** Characters per line for block mode height estimation. Default: 40 */
    charsPerLine?: number;
    /** Maximum lines for block mode height. Caps the scramble height estimate. */
    maxLines?: number;
    /** Additional CSS classes */
    class?: string;
    /** Custom rendering for decrypted content. If omitted, renders content as text. */
    children?: Snippet;
  }

  let {
    content,
    ciphertext,
    mode = "text",
    length = 20,
    block = false,
    charsPerLine = 40,
    maxLines,
    class: className = "",
    children,
  }: Props = $props();

  const loading = $derived(content === undefined || content === null);
  const isError = $derived(!loading && isDecryptError(content));
  /** True when this is a pure shape guess with no real data behind it. */
  const isDummy = $derived(loading && ciphertext == null);
  const effectiveLength = $derived(estimateLength(ciphertext, length));
  const estimatedLines = $derived.by(() => {
    const lines = Math.max(1, Math.ceil(effectiveLength / charsPerLine));
    return maxLines !== undefined ? Math.min(lines, maxLines) : lines;
  });

  function estimateLength(ct: unknown, fallback: number): number {
    if (ct == null) return fallback;
    if (ct instanceof Uint8Array) return Math.max(1, ct.length - 40);
    if (typeof ct === "string")
      return Math.max(1, Math.ceil((ct.length * 3) / 4) - 40);
    if (typeof ct === "object" && "data" in ct) {
      const obj: Record<string, unknown> = ct as Record<string, unknown>;
      if (Array.isArray(obj.data)) {
        return Math.max(1, obj.data.length - 40);
      }
    }
    return fallback;
  }

  const isMedia = $derived(mode === "media");
  // Text mode: 4 variants, Media mode: 2 variants
  const maxVariants = isMedia ? 2 : 4;
  const variant = Math.floor(Math.random() * maxVariants) + 1;
  const delay = `${String(-(Math.random() * 1.8))}s`;

  let paused = $state(false);

  function observeViewport(node: HTMLElement): { destroy: () => void } {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) paused = !entry.isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(node);
    return {
      destroy(): void {
        observer.disconnect();
      },
    };
  }
</script>

<span
  use:observeViewport
  class="dp {className}"
  class:block={block || isMedia}
  class:loading
  class:paused
  class:media={isMedia}
  class:v1={!isMedia && variant === 1}
  class:v2={!isMedia && variant === 2}
  class:v3={!isMedia && variant === 3}
  class:v4={!isMedia && variant === 4}
  class:m1={isMedia && variant === 1}
  class:m2={isMedia && variant === 2}
  data-variant={!isMedia ? `v${String(variant)}` : undefined}
  data-media-variant={isMedia ? `m${String(variant)}` : undefined}
  role={loading ? "status" : undefined}
  aria-busy={loading ? "true" : undefined}
>
  <span
    class="scramble"
    class:scramble-media={isMedia}
    class:scramble-block={block && !isMedia}
    style:width={isMedia || block ? undefined : `${String(effectiveLength)}ch`}
    style:max-height={block && !isMedia
      ? `${String(estimatedLines)}lh`
      : undefined}
    style:--delay={delay}
    aria-hidden="true"
  ></span>
  {#if loading}
    <span class="dp-sr-only">{m.decrypt_placeholder_loading()}</span>
  {/if}
  <span class="content">
    {#if isError}
      <span class="decrypt-error">{m.error_decryption_failed()}</span>
    {:else if !loading}
      {#if children}
        {@render children()}
      {:else}
        {content}
      {/if}
    {/if}
  </span>
</span>

<style>
  .dp {
    position: relative;
    display: inline-grid;
    align-items: center;
    overflow: hidden;
    max-width: 100%;
    min-width: 0;
  }

  .dp.block {
    display: grid;
    width: 100%;
    min-width: 0;
  }

  .scramble,
  .content {
    grid-area: 1 / 1;
  }

  /* ── Scramble placeholder ── */
  .scramble {
    font: inherit;
    color: var(--muted, #888);
    filter: blur(2.5px);
    opacity: 1;
    overflow: hidden;
    white-space: nowrap;
    max-width: 100%;
    user-select: none;
    transition:
      filter 0.4s ease-out,
      opacity 0.3s ease-out 0.1s,
      max-height 0.5s ease-in-out 0.1s,
      width 0.5s ease-in-out 0.1s;
  }

  /* Block text mode: ::before content wraps within the container.
     max-height clips to the approximate number of lines. */
  .scramble-block {
    white-space: normal;
    word-break: break-all;
    width: 100%;
  }

  .scramble-block::before {
    display: block;
    white-space: normal;
    word-break: break-all;
  }

  .dp:not(.loading) .scramble {
    filter: blur(0);
    opacity: 0;
    pointer-events: none;
    /* Smoothly collapse to 0 so the content determines container size
       without an instant layout jump. !important overrides inline styles. */
    max-height: 0 !important;
    width: 0 !important;
    overflow: hidden;
  }

  .paused .scramble::before {
    animation-play-state: paused !important;
  }

  /* ── Keyframe variant 1 ── */
  .v1 .scramble::before {
    content: "kXm Bq pLzF";
    animation: scramble-1 1.8s steps(1) infinite;
    animation-delay: var(--delay, 0s);
  }

  @keyframes scramble-1 {
    0% {
      content: "kXm BqR pLzF jNwC sAhT vDx eYgU oItK dMfW n3cJ rQyS lEaH uPiVw kXm BqR pLzF jNwC sAhT vDx eYgU oItK dMfW n3cJ rQyS lEaH uPiVw";
    }
    16% {
      content: "Zfj NwC sAR pLzFh TvDx eYUo tkXm BqKd MfWb ncJr QySl EaHu PiVw Zfj NwC sAR pLzFh TvDx eYUo tkXm BqKd MfWb ncJr QySl EaHu PiVw";
    }
    33% {
      content: "hTv Dx eYgk XmBq RpLz FjNw CsAU oItK dMfW ncJr QySl EaHu PiVw hTv Dx eYgk XmBq RpLz FjNw CsAU oItK dMfW ncJr QySl EaHu PiVw";
    }
    50% {
      content: "UoI tKdM fWhT vDxe Ygk XmBq RpLz FjNw CsAb ncJr QySl EaHu PiVw UoI tKdM fWhT vDxe Ygk XmBq RpLz FjNw CsAb ncJr QySl EaHu PiVw";
    }
    66% {
      content: "bncJ rQyS UoIt KdMf WhTv Dxe YgkX mBqR pLzF jNwC sAlE aHuP iVwZ bncJ rQyS UoIt KdMf WhTv Dxe YgkX mBqR pLzF jNwC sAlE aHuP iVwZ";
    }
    83% {
      content: "lEaH uPiV wbncJ rQyS UoIt KdMf WhTv Dxe YgkX mBqR pLzF jNwC sAZG lEaH uPiV wbncJ rQyS UoIt KdMf WhTv Dxe YgkX mBqR pLzF jNwC";
    }
  }

  /* ── Keyframe variant 2 ── */
  .v2 .scramble::before {
    content: "Rnw Yqd Lx2G";
    animation: scramble-2 1.8s steps(1) infinite;
    animation-delay: var(--delay, 0s);
  }

  @keyframes scramble-2 {
    0% {
      content: "Rnw Yqd Lx2G fJsP kMte BaUo Wvi Zcr NlmX gDyK bFjQ uAHp ECIT Rnw Yqd Lx2G fJsP kMte BaUo Wvi Zcr NlmX gDyK bFjQ uAHp ECIT";
    }
    16% {
      content: "fJsP kMte Rnw Yqd Lx2G BaUo Wvi ZcrN lmXg DyKb FjQu AHpE CITV fJsP kMte Rnw Yqd Lx2G BaUo Wvi ZcrN lmXg DyKb FjQu AHpE CITV";
    }
    33% {
      content: "BaUo Wvi Zcr Rnw Yqd Lx2G fJsP kMte NlmX gDyK bFjQ uAHp ECIT BaUo Wvi Zcr Rnw Yqd Lx2G fJsP kMte NlmX gDyK bFjQ uAHp ECIT";
    }
    50% {
      content: "NlmX gDyK bFjQ BaUo Wvi Zcr Rnw Yqd Lx2G fJsP kMte uAHp ECIT NlmX gDyK bFjQ BaUo Wvi Zcr Rnw Yqd Lx2G fJsP kMte uAHp ECIT";
    }
    66% {
      content: "QuAH pECI TVS NlmX gDyK bFjQ BaUo Wvi Zcr Rnw Yqd Lx2G fJsP kMte QuAH pECI TVS NlmX gDyK bFjQ BaUo Wvi Zcr Rnw Yqd Lx2G fJsP";
    }
    83% {
      content: "OQu AHpE CITV SNlm XgDy KbFj QBaU oWvi ZcrR nwYq dLx2 GfJs PkMt OQu AHpE CITV SNlm XgDy KbFj QBaU oWvi ZcrR nwYq dLx2 GfJs PkMt";
    }
  }

  /* ── Keyframe variant 3 ── */
  .v3 .scramble::before {
    content: "Wpg TcnF s5Vj";
    animation: scramble-3 1.8s steps(1) infinite;
    animation-delay: var(--delay, 0s);
  }

  @keyframes scramble-3 {
    0% {
      content: "Wpg Tcn Fs5V jLyH rbKd mQxw Aeu Zio Pvs NkGf XtBJ MCDE IRUY Wpg Tcn Fs5V jLyH rbKd mQxw Aeu Zio Pvs NkGf XtBJ MCDE IRUY";
    }
    16% {
      content: "jLyH rbKd Wpg Tcn Fs5V Qxw Aeu Zio PvsN kGfX tBJM CDEI RUYW jLyH rbKd Wpg Tcn Fs5V Qxw Aeu Zio PvsN kGfX tBJM CDEI RUYW";
    }
    33% {
      content: "Qxw Aeu Zio Wpg Tcn Fs5V jLyH rbKd Pvs NkGf XtBJ MCDE IRUY Qxw Aeu Zio Wpg Tcn Fs5V jLyH rbKd Pvs NkGf XtBJ MCDE IRUY";
    }
    50% {
      content: "Pvs NkGf XtBJ Qxw Aeu Zio Wpg Tcn Fs5V jLyH rbKd MCDE IRUY Pvs NkGf XtBJ Qxw Aeu Zio Wpg Tcn Fs5V jLyH rbKd MCDE IRUY";
    }
    66% {
      content: "BJMC DEIR UYWO Pvs NkGf XtBJ Qxw Aeu Zio Wpg Tcn Fs5V jLyH rbKd BJMC DEIR UYWO Pvs NkGf XtBJ Qxw Aeu Zio Wpg Tcn Fs5V jLyH";
    }
    83% {
      content: "bKd BJMC DEIR UYWO Pvs NkGf XtBJ Qxw Aeu Zio Wpg Tcn Fs5V jLyH rbKd BJMC DEIR UYWO Pvs NkGf XtBJ Qxw Aeu Zio Wpg Tcn Fs5V jLyH";
    }
  }

  /* ── Keyframe variant 4 ── */
  .v4 .scramble::before {
    content: "Ydn Kfv Rm4X";
    animation: scramble-4 1.8s steps(1) infinite;
    animation-delay: var(--delay, 0s);
  }

  @keyframes scramble-4 {
    0% {
      content: "Ydn Kfv Rm4X sPw Bhg Tjl Qce Aui Zor Nxt WkSa GbFy LMJD CHEV Ydn Kfv Rm4X sPw Bhg Tjl Qce Aui Zor Nxt WkSa GbFy LMJD CHEV";
    }
    16% {
      content: "sPw Bhg Tjl Ydn Kfv Rm4X Qce Aui Zor NxtW kSaG bFyL MJDC HEVI sPw Bhg Tjl Ydn Kfv Rm4X Qce Aui Zor NxtW kSaG bFyL MJDC HEVI";
    }
    33% {
      content: "Qce Aui Zor Ydn Kfv Rm4X sPw Bhg Tjl NxtW kSaG bFyL MJDC HEVI Qce Aui Zor Ydn Kfv Rm4X sPw Bhg Tjl NxtW kSaG bFyL MJDC HEVI";
    }
    50% {
      content: "Nxt WkSa GbFy Qce Aui Zor Ydn Kfv Rm4X sPw Bhg Tjl LMJD CHEV Nxt WkSa GbFy Qce Aui Zor Ydn Kfv Rm4X sPw Bhg Tjl LMJD CHEV";
    }
    66% {
      content: "LMJD CHEV IUO Nxt WkSa GbFy Qce Aui Zor Ydn Kfv Rm4X sPw Bhg Tjl LMJD CHEV IUO Nxt WkSa GbFy Qce Aui Zor Ydn Kfv Rm4X sPw";
    }
    83% {
      content: "Tjl LMJD CHEV IUO Nxt WkSa GbFy Qce Aui Zor Ydn Kfv Rm4X sPw Bhg Tjl LMJD CHEV IUO Nxt WkSa GbFy Qce Aui Zor Ydn Kfv Rm4X sPw";
    }
  }

  /* ── Media mode (images, files, non-text) ── */
  .dp.media {
    display: grid;
    width: 100%;
    min-height: 80px;
  }

  .scramble-media {
    width: 100% !important;
    height: 100%;
    white-space: pre-wrap;
    word-break: break-all;
    line-height: 1.1;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    overflow: hidden;
  }

  /* ── Media keyframe variant 1 ── */
  .m1 .scramble::before {
    content: "█ ░█░ ██ ░ █";
    animation: scramble-m1 1.8s steps(1) infinite;
    animation-delay: var(--delay, 0s);
  }

  @keyframes scramble-m1 {
    0% {
      content: "█░ ██ ░█ ░██░ █ ██░█ ░█░██ ░ ██░█░ █ ░██ █░ ██░ █░██ ░█ ░██░█ ░ ██░█░██ ░ █░██ ░█ ██░ █░██░ ██ ░█ ░█░██ ░ ██░█░ █ ░██░█░██ ░ █ ██░█ ░██ ░█ ██░█░ ██ ░ █░██ ░█░██ █ ░██░█ ░ ██░ █░██ ░█░██ ░ █ ██░";
    }
    16% {
      content: "░██ █░ ██░█ ░██ ░ █░██ ░█░██ █ ░██░ ██░█ ░ ██░ █░██ ░█ ██░█░ ░██ █ ░██░█░ █ ░█░██ ░ ██░█░██ ░ █ ██░█ ░██ ░█ ██░█░██ ░█ ██░ ░██ █ ░ █░██ ░█░██ █ ░██░ ██░█ ░ ██░ █░██ ░█ ██░█░██ ░ █ ██░█ ░ ██░ █░██░";
    }
    33% {
      content: " ██░█ ░█░██ ░ ██░█░ █ ░██ █░ ██░ █░██ ░█ ░██░█ ░ ██░█░██ ░ █░██ █░██░ ██ ░█ ░█░██ ░ ██░ ░█ ░██░█ ░ ██░█░██ ░ █░██ ░█ ██░ █░██░ ██ ░█ ░█░██ ░ ██░█░ █ ░██░█░██ ░ █ ██░█ ░██ ░█ ██░ █░██ ░█░██ ░ █ ██░█░";
    }
    50% {
      content: "░█ ██░ █░██░ ██ ░█ ░█░██ ░ ██░█░ █ ░██░█░██ ░ █ ██░█ ░██ ░█ ██░░██ █ ░ █░██ ░█░██ █ ░██░ ██░█ ░ ██░ █░██ ░█ ██░█░██ ░ █ ██░█ ░██ ░█ ██░█░██ ░█ ██░ ░██ █ ░ █░██ ░█░██ █ ░██░ ██░█ ░ ██░ █░██ ░█ ██░█░██";
    }
    66% {
      content: "██░█ ░ ██░ █░██ ░█░██ ░ █ ██░█ ░██ ░█ ██░█░ ██ ░ █░██ ░█░██ █░██░█ ░██ ░█ ██░█░██ ░█ ██░ ░██ █ ░ █░██ ░█░██ █ ░██░ ██░█ ░ ██░ █░██ █░ ██░ █░██ ░█ ░██░█ ░ ██░█░██ ░ █░██ ░█ ██░ █░██░ ██ ░█ ░█░██ ░ ██░";
    }
    83% {
      content: " ░██░█░██ ░ █ ██░█ ░██ ░█ ██░█░██ ░█ ██░ ░██ █ ░ █░██ ░█░██ █░██░ ██ ░█ ░█░██ ░ ██░█░ █ ░██░█░██ ░ █ ██░█ ░██ ░█ ██░ █░██ ░█░██ ░ ██░█░ █ ░██ █░ ██░ █░██ ░█ ░██░█ ░ ██░█░██ ░ █░██ ░█ ██░ █░██░ ██ ░█░";
    }
  }

  /* ── Media keyframe variant 2 ── */
  .m2 .scramble::before {
    content: "░ █░██ ░█ ██";
    animation: scramble-m2 1.8s steps(1) infinite;
    animation-delay: var(--delay, 0s);
  }

  @keyframes scramble-m2 {
    0% {
      content: "░█ ██░ █ ░██░█░██ ░ █ ██░█ ░██ ░█ ██░█░ ██ ░ █░██ ░█░██ █ ░██░ ██░█░██ ░█ ██░ ░██ █ ░ █░██ ░█░██ █ ░██░ ██░█ ░ ██░ █░██ ░█ ██░█░██ ░ █ ██░█ ░██ ░█ ██░█░██ ░█ ██░ ░██ █ ░ █░██ ░█░██ █ ░██░ ██░█ ░ ██░█";
    }
    16% {
      content: "██░ █░██ ░█ ░██░█ ░ ██░█░██ ░ █░██ ░█ ██░ █░██░ ██ ░█ ░█░██ ░ ██░█░█░██ ░ ██░█░ █ ░██ █░ ██░ █░██ ░█ ░██░█ ░ ██░█░██ ░ █░██ ░█ ██░ █░██░ ██ ░█ ░█░██ ░ ██░█░ █ ░██░█░██ ░ █ ██░█ ░██ ░█ ██░ █░██ ░█░██░";
    }
    33% {
      content: "█ ░██░█ ░ ██░█░██ ░ █░██ █░██░ ██ ░█ ░█░██ ░ ██░ ░█ ░██░█ ░ ██░██ ░█ ░█░██ ░ ██░█░ █ ░██░█░██ ░ █ ██░█ ░██ ░█ ██░ █░██ ░█░██ ░ █ ██░█░██░ █░██ ░█░██ ░ █ ██░█ ░██ ░█ ██░█░ ██ ░ █░██ ░█░██ █ ░██░ ██░█░";
    }
    50% {
      content: " ██░█░██ ░ █░██ ░█ ██░ █░██░ ██ ░█ ░█░██ ░ ██░█░ █ ░██░█░██░█ ░██ ░█ ██░█░██ ░█ ██░ ░██ █ ░ █░██ ░█░██ █ ░██░ ██░█ ░ ██░ █░██ ░█ ██░█ ░██ ░█ ██░█░██ ░█ ██░ ░██ █ ░ █░██ ░█░██ █ ░██░ ██░█ ░ ██░ █░██░█";
    }
    66% {
      content: "░██ ░█ ██░█░██ ░ █ ██░█ ░██ ░█ ██░█░ ██ ░ █░██ ░█░██ █ ░██░██░█ ░ ██░ █░██ ░█░██ ░ █ ██░█ ░██ ░█ ██░█░ ██ ░ █░██ ░█░██ █ ░██░ ██░█ ░ ██░ █░██ ░█ ██░█░██ ░ █ ██░ ░█ ██░ █░██░ ██ ░█ ░█░██ ░ ██░█░ █ ░██░";
    }
    83% {
      content: "█░██ ░ █ ██░█ ░██ ░█ ██░█░██ ░█ ██░ ░██ █ ░ █░██ ░█░██ █ ░██░█░██ ░ █ ██░█ ░██ ░█ ██░ █░██ ░█░██ ░ █ ██░█░██ ░ ██░ █░██ ░█░██░█ ░██ ░█ ██░█░██ ░█ ██░ ░██ █ ░ █░██ ░█░██ █ ░██░ ██░█ ░ ██░ █░██ ░█ ██░█";
    }
  }

  /* ── Revealed content ── */
  .content {
    opacity: 0;
    transition: opacity 0.35s ease-out 0.15s;
  }

  .dp:not(.loading) .content {
    opacity: 1;
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .scramble::before {
      animation: none !important;
    }
  }

  /* ── Decrypt error ── */
  .decrypt-error {
    color: var(--muted);
    font-style: italic;
  }

  /* ── Screen reader only ── */
  .dp-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
