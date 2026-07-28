// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushSync } from "svelte";
import {
  useDeferredUnmount,
  OVERLAY_OUTRO_MS,
  type DeferredUnmountOpts,
} from "./use-deferred-unmount.svelte.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Stub matchMedia to control reduced-motion in tests. */
function stubMatchMedia(reducedMotion: boolean): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches:
        query === "(prefers-reduced-motion: reduce)" ? reducedMotion : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    })),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useDeferredUnmount", () => {
  let cleanup: (() => void) | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    stubMatchMedia(false);
  });

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
    vi.useRealTimers();
  });

  /**
   * Initialize the rune inside an $effect.root so Svelte runes execute.
   * Returns a getter for the reactive `opened` prop and the rune result.
   */
  function setup(
    initialOpened: boolean,
    durationMs?: number,
  ): {
    result: { readonly current: boolean };
    setOpened: (v: boolean) => void;
  } {
    let opened = $state(initialOpened);

    const opts: DeferredUnmountOpts = {
      get opened(): boolean {
        return opened;
      },
      durationMs,
    };

    let result!: { readonly current: boolean };
    const teardown = $effect.root(() => {
      result = useDeferredUnmount(opts);
    });
    flushSync();

    cleanup = teardown;

    return {
      result,
      setOpened(v: boolean): void {
        opened = v;
        flushSync();
      },
    };
  }

  // -----------------------------------------------------------------------
  // Stays mounted while opened
  // -----------------------------------------------------------------------

  it("reports mounted while opened is true", () => {
    const { result } = setup(true);
    expect(result.current).toBe(true);
  });

  it("starts unmounted when opened is initially false", () => {
    const { result } = setup(false);
    expect(result.current).toBe(false);
  });

  // -----------------------------------------------------------------------
  // Stays mounted through outro window, then unmounts
  // -----------------------------------------------------------------------

  it("stays mounted during the outro window then unmounts", () => {
    const { result, setOpened } = setup(true);

    setOpened(false);

    // Still mounted right after close (within the outro window).
    expect(result.current).toBe(true);

    // Advance partway through the outro.
    vi.advanceTimersByTime(OVERLAY_OUTRO_MS - 50);
    expect(result.current).toBe(true);

    // Advance past the outro duration.
    vi.advanceTimersByTime(100);
    flushSync();
    expect(result.current).toBe(false);
  });

  it("uses custom durationMs when provided", () => {
    const custom = 200;
    const { result, setOpened } = setup(true, custom);

    setOpened(false);
    expect(result.current).toBe(true);

    vi.advanceTimersByTime(custom - 10);
    expect(result.current).toBe(true);

    vi.advanceTimersByTime(20);
    flushSync();
    expect(result.current).toBe(false);
  });

  // -----------------------------------------------------------------------
  // Re-opening mid-outro cancels unmount
  // -----------------------------------------------------------------------

  it("cancels pending unmount when re-opened mid-outro", () => {
    const { result, setOpened } = setup(true);

    setOpened(false);
    expect(result.current).toBe(true);

    // Advance partway through the outro window.
    vi.advanceTimersByTime(OVERLAY_OUTRO_MS / 2);

    // Re-open before the timer fires.
    setOpened(true);
    expect(result.current).toBe(true);

    // Advance well past the original timer. Should still be mounted.
    vi.advanceTimersByTime(OVERLAY_OUTRO_MS * 2);
    flushSync();
    expect(result.current).toBe(true);
  });

  // -----------------------------------------------------------------------
  // Reduced motion unmounts immediately
  // -----------------------------------------------------------------------

  it("unmounts immediately under prefers-reduced-motion", () => {
    stubMatchMedia(true);
    const { result, setOpened } = setup(true);

    setOpened(false);

    // The setTimeout fires with delay 0, but still needs a tick.
    vi.advanceTimersByTime(0);
    flushSync();
    expect(result.current).toBe(false);
  });

  // -----------------------------------------------------------------------
  // Multiple open/close cycles
  // -----------------------------------------------------------------------

  it("handles repeated open/close cycles correctly", () => {
    const { result, setOpened } = setup(false);
    expect(result.current).toBe(false);

    // Open.
    setOpened(true);
    expect(result.current).toBe(true);

    // Close and wait for unmount.
    setOpened(false);
    vi.advanceTimersByTime(OVERLAY_OUTRO_MS + 10);
    flushSync();
    expect(result.current).toBe(false);

    // Open again.
    setOpened(true);
    expect(result.current).toBe(true);

    // Close again.
    setOpened(false);
    vi.advanceTimersByTime(OVERLAY_OUTRO_MS + 10);
    flushSync();
    expect(result.current).toBe(false);
  });
});
