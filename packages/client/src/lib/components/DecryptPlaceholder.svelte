<script lang="ts">
  import type { Snippet } from "svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    /** Whether content is still loading/decrypting */
    loading?: boolean;
    /**
     * Display mode:
     *  - "text": scrambled alphanumeric characters (inline text fields)
     *  - "media": grid of block characters (images, files, non-text)
     * Only use this component for client-decrypted content.
     * Server-returned plaintext should use <Skeleton> instead.
     */
    mode?: "text" | "media";
    /** Approximate character count for placeholder width (text mode) */
    length?: number;
    /** Render as block-level element (for notes, messages, or media) */
    block?: boolean;
    /** Additional CSS classes */
    class?: string;
    /** Revealed content */
    children?: Snippet;
  }

  let {
    loading = true,
    mode = "text",
    length = 20,
    block = false,
    class: className = "",
    children,
  }: Props = $props();

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
  role={loading ? "status" : undefined}
  aria-busy={loading ? "true" : undefined}
>
  <span
    class="scramble"
    class:scramble-media={isMedia}
    style:width={isMedia ? undefined : `${String(length)}ch`}
    style:--delay={delay}
    aria-hidden="true"
  ></span>
  {#if loading}
    <span class="dp-sr-only">{m.decrypt_placeholder_loading()}</span>
  {/if}
  <span class="content">
    {#if children}
      {@render children()}
    {/if}
  </span>
</span>

<style>
  .dp {
    position: relative;
    display: inline-grid;
    align-items: center;
    overflow: hidden;
  }

  .dp.block {
    display: grid;
    width: 100%;
  }

  .scramble,
  .content {
    grid-area: 1 / 1;
  }

  /* ── Scramble placeholder ── */
  .scramble {
    font-family: ui-monospace, "SF Mono", "Cascadia Mono", monospace;
    font-size: inherit;
    color: var(--muted, #888);
    filter: blur(2.5px);
    opacity: 1;
    overflow: hidden;
    white-space: nowrap;
    user-select: none;
    transition:
      filter 0.4s ease-out,
      opacity 0.3s ease-out 0.1s;
  }

  .dp:not(.loading) .scramble {
    filter: blur(0);
    opacity: 0;
    pointer-events: none;
  }

  .paused .scramble::before {
    animation-play-state: paused !important;
  }

  /* ── Keyframe variant 1 ── */
  .v1 .scramble::before {
    content: "kX9mBqR2pLzF";
    animation: scramble-1 1.8s steps(1) infinite;
    animation-delay: var(--delay, 0s);
  }

  @keyframes scramble-1 {
    0% {
      content: "kX9mBqR2pLzF4jNwC7sAhT6vDx1eYgUoI8tKdMfWb5n3cJrQyS0lEaHuPiVwZGkX9mBqR2pLzF4jNwC7sAhT6vDx1eYgUoI8tKdMfWb5n3cJrQyS0lEaHuPiVwZG";
    }
    16% {
      content: "Zf4jNwC7sAR2pLzFhT6vDx1eYUoI8tkX9mBqKdMfWb5n3cJrQyS0lEaHuPiVwZf4jNwC7sAR2pLzFhT6vDx1eYUoI8tkX9mBqKdMfWb5n3cJrQyS0lEaHuPiVw";
    }
    33% {
      content: "hT6vDx1eYgkX9mBqR2pLzF4jNwC7sAUoI8tKdMfWb5n3cJrQyS0lEaHuPiVwZGhT6vDx1eYgkX9mBqR2pLzF4jNwC7sAUoI8tKdMfWb5n3cJrQyS0lEaHuPi";
    }
    50% {
      content: "UoI8tKdMfWhT6vDx1eYgkX9mBqR2pLzF4jNwC7sAb5n3cJrQyS0lEaHuPiVwZGUoI8tKdMfWhT6vDx1eYgkX9mBqR2pLzF4jNwC7sAb5n3cJrQyS0lEaHuPiVw";
    }
    66% {
      content: "b5n3cJrQySUoI8tKdMfWhT6vDx1eYgkX9mBqR2pLzF4jNwC7sA0lEaHuPiVwZGb5n3cJrQySUoI8tKdMfWhT6vDx1eYgkX9mBqR2pLzF4jNwC7sA0lEaHuPiVw";
    }
    83% {
      content: "0lEaHuPiVwb5n3cJrQySUoI8tKdMfWhT6vDx1eYgkX9mBqR2pLzF4jNwC7sAZG0lEaHuPiVwb5n3cJrQySUoI8tKdMfWhT6vDx1eYgkX9mBqR2pLzF4jNwC7sA";
    }
  }

  /* ── Keyframe variant 2 ── */
  .v2 .scramble::before {
    content: "Rn7wYq4dLx2G";
    animation: scramble-2 1.8s steps(1) infinite;
    animation-delay: var(--delay, 0s);
  }

  @keyframes scramble-2 {
    0% {
      content: "Rn7wYq4dLx2GfJ9sPk6hMt0eBaUoWv8iZc5rNl3mXgDyKbFjQ1uAHpECITVSORn7wYq4dLx2GfJ9sPk6hMt0eBaUoWv8iZc5rNl3mXgDyKbFjQ1uAHpECITVSO";
    }
    16% {
      content: "fJ9sPk6hMt0eRn7wYq4dLx2GBaUoWv8iZc5rNl3mXgDyKbFjQ1uAHpECITVSOfJ9sPk6hMt0eRn7wYq4dLx2GBaUoWv8iZc5rNl3mXgDyKbFjQ1uAHpECITVSO";
    }
    33% {
      content: "BaUoWv8iZc5rRn7wYq4dLx2GfJ9sPk6hMt0eNl3mXgDyKbFjQ1uAHpECITVSOBaUoWv8iZc5rRn7wYq4dLx2GfJ9sPk6hMt0eNl3mXgDyKbFjQ1uAHpECITVSO";
    }
    50% {
      content: "Nl3mXgDyKbFjBaUoWv8iZc5rRn7wYq4dLx2GfJ9sPk6hMt0eQ1uAHpECITVSONl3mXgDyKbFjBaUoWv8iZc5rRn7wYq4dLx2GfJ9sPk6hMt0eQ1uAHpECITVSO";
    }
    66% {
      content: "Q1uAHpECITVSNl3mXgDyKbFjBaUoWv8iZc5rRn7wYq4dLx2GfJ9sPk6hMt0eOQ1uAHpECITVSNl3mXgDyKbFjBaUoWv8iZc5rRn7wYq4dLx2GfJ9sPk6hMt0e";
    }
    83% {
      content: "OQ1uAHpECITVSNl3mXgDyKbFjBaUoWv8iZc5rRn7wYq4dLx2GfJ9sPk6hMt0eSOQ1uAHpECITVSNl3mXgDyKbFjBaUoWv8iZc5rRn7wYq4dLx2GfJ9sPk6hMt";
    }
  }

  /* ── Keyframe variant 3 ── */
  .v3 .scramble::before {
    content: "Wp3gTc8nFs5V";
    animation: scramble-3 1.8s steps(1) infinite;
    animation-delay: var(--delay, 0s);
  }

  @keyframes scramble-3 {
    0% {
      content: "Wp3gTc8nFs5VjL1yHr6bKd9mQx4wAe0uZi7oPv2sSaNkGfXtBJMCDEIRUYWOWp3gTc8nFs5VjL1yHr6bKd9mQx4wAe0uZi7oPv2sSaNkGfXtBJMCDEIRUYWO";
    }
    16% {
      content: "jL1yHr6bKd9mWp3gTc8nFs5VQx4wAe0uZi7oPv2sSaNkGfXtBJMCDEIRUYWOjL1yHr6bKd9mWp3gTc8nFs5VQx4wAe0uZi7oPv2sSaNkGfXtBJMCDEIRUYWO";
    }
    33% {
      content: "Qx4wAe0uZi7oWp3gTc8nFs5VjL1yHr6bKd9mPv2sSaNkGfXtBJMCDEIRUYWOQx4wAe0uZi7oWp3gTc8nFs5VjL1yHr6bKd9mPv2sSaNkGfXtBJMCDEIRUYWO";
    }
    50% {
      content: "Pv2sSaNkGfXtQx4wAe0uZi7oWp3gTc8nFs5VjL1yHr6bKd9mBJMCDEIRUYWOPv2sSaNkGfXtQx4wAe0uZi7oWp3gTc8nFs5VjL1yHr6bKd9mBJMCDEIRUYWO";
    }
    66% {
      content: "BJMCDEIRUYWOPv2sSaNkGfXtQx4wAe0uZi7oWp3gTc8nFs5VjL1yHr6bKd9mBJMCDEIRUYWOPv2sSaNkGfXtQx4wAe0uZi7oWp3gTc8nFs5VjL1yHr6bKd9m";
    }
    83% {
      content: "6bKd9mBJMCDEIRUYWOPv2sSaNkGfXtQx4wAe0uZi7oWp3gTc8nFs5VjL1yHr6bKd9mBJMCDEIRUYWOPv2sSaNkGfXtQx4wAe0uZi7oWp3gTc8nFs5VjL1yHr";
    }
  }

  /* ── Keyframe variant 4 ── */
  .v4 .scramble::before {
    content: "Yd2nKf7vRm4X";
    animation: scramble-4 1.8s steps(1) infinite;
    animation-delay: var(--delay, 0s);
  }

  @keyframes scramble-4 {
    0% {
      content: "Yd2nKf7vRm4XsP9wBh6gTj1lQc0eAu8iZo5rNx3tWkSaGbFyLMJDCHEVIUOYd2nKf7vRm4XsP9wBh6gTj1lQc0eAu8iZo5rNx3tWkSaGbFyLMJDCHEVIUO";
    }
    16% {
      content: "sP9wBh6gTj1lYd2nKf7vRm4XQc0eAu8iZo5rNx3tWkSaGbFyLMJDCHEVIUOsP9wBh6gTj1lYd2nKf7vRm4XQc0eAu8iZo5rNx3tWkSaGbFyLMJDCHEVIUO";
    }
    33% {
      content: "Qc0eAu8iZo5rYd2nKf7vRm4XsP9wBh6gTj1lNx3tWkSaGbFyLMJDCHEVIUOQc0eAu8iZo5rYd2nKf7vRm4XsP9wBh6gTj1lNx3tWkSaGbFyLMJDCHEVIUO";
    }
    50% {
      content: "Nx3tWkSaGbFyQc0eAu8iZo5rYd2nKf7vRm4XsP9wBh6gTj1lLMJDCHEVIUONx3tWkSaGbFyQc0eAu8iZo5rYd2nKf7vRm4XsP9wBh6gTj1lLMJDCHEVIUO";
    }
    66% {
      content: "LMJDCHEVIUONx3tWkSaGbFyQc0eAu8iZo5rYd2nKf7vRm4XsP9wBh6gTj1lLMJDCHEVIUONx3tWkSaGbFyQc0eAu8iZo5rYd2nKf7vRm4XsP9wBh6gTj1l";
    }
    83% {
      content: "Tj1lLMJDCHEVIUONx3tWkSaGbFyQc0eAu8iZo5rYd2nKf7vRm4XsP9wBh6gTj1lLMJDCHEVIUONx3tWkSaGbFyQc0eAu8iZo5rYd2nKf7vRm4XsP9wBh6g";
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
