// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { flushSync } from "svelte";
import { getSodium, generatePortalSeed, encode } from "@care-y/crypto";
import {
  createPortalFragment,
  type PortalFragmentState,
} from "./create-portal-fragment.svelte.js";

beforeAll(async () => {
  await getSodium();
});

/** Wrap composable creation in $effect.root so internal $effect blocks run. */
function createHarness(
  isBrowser: boolean,
  readHash: () => string,
  routeChannelId: () => string,
): { frag: PortalFragmentState; destroy: () => void } {
  const box: { frag?: PortalFragmentState } = {};
  const destroy = $effect.root(() => {
    box.frag = createPortalFragment(isBrowser, readHash, routeChannelId);
  });
  flushSync();
  if (!box.frag) throw new Error("composable did not initialize");
  return { frag: box.frag, destroy };
}

describe("createPortalFragment", () => {
  let destroy: (() => void) | undefined;

  afterEach(() => {
    destroy?.();
    destroy = undefined;
  });

  it("resolves immediately with no hash", () => {
    const h = createHarness(
      true,
      () => "",
      () => "ch1",
    );
    destroy = h.destroy;

    expect(h.frag.hashPresent).toBe(false);
    expect(h.frag.fragmentResolved).toBe(true);
    expect(h.frag.fragmentData).toBeNull();
    expect(h.frag.hasValidFragment).toBe(false);
  });

  it("resolves with hash '#' only", () => {
    const h = createHarness(
      true,
      () => "#",
      () => "ch1",
    );
    destroy = h.destroy;

    expect(h.frag.hashPresent).toBe(false);
    expect(h.frag.fragmentResolved).toBe(true);
    expect(h.frag.fragmentData).toBeNull();
  });

  it("parses a valid fragment and marks resolved", async () => {
    const seed = generatePortalSeed();
    const hash = `#${encode(seed)}`;
    const h = createHarness(
      true,
      () => hash,
      () => "ch1",
    );
    destroy = h.destroy;

    await vi.waitFor(() => {
      expect(h.frag.fragmentResolved).toBe(true);
    });

    expect(h.frag.fragmentData).not.toBeNull();
    expect(h.frag.fragmentData!.seed).toEqual(seed);
    expect(h.frag.fragmentData!.channelId).toBeTruthy();
    expect(h.frag.fragmentData!.auth.length).toBe(32);
    expect(h.frag.hasValidFragment).toBe(true);
  });

  it("rejects a short seed (< 18 bytes)", async () => {
    const shortSeed = new Uint8Array(10);
    crypto.getRandomValues(shortSeed);

    const h = createHarness(
      true,
      () => `#${encode(shortSeed)}`,
      () => "ch1",
    );
    destroy = h.destroy;

    await vi.waitFor(() => {
      expect(h.frag.fragmentResolved).toBe(true);
    });

    expect(h.frag.fragmentData).toBeNull();
    expect(h.frag.hasValidFragment).toBe(false);
  });

  it("strippablePath is null before router ready", async () => {
    const seed = generatePortalSeed();
    const hash = `#${encode(seed)}`;
    const h = createHarness(
      true,
      () => hash,
      () => "ch1",
    );
    destroy = h.destroy;

    await vi.waitFor(() => {
      expect(h.frag.hasValidFragment).toBe(true);
    });

    expect(h.frag.strippablePath).toBeNull();
  });

  it("strippablePath becomes set after markRouterReady", async () => {
    const seed = generatePortalSeed();
    const hash = `#${encode(seed)}`;
    const h = createHarness(
      true,
      () => hash,
      () => "my-chan",
    );
    destroy = h.destroy;

    await vi.waitFor(() => {
      expect(h.frag.hasValidFragment).toBe(true);
    });

    h.frag.markRouterReady();
    flushSync();

    expect(h.frag.strippablePath).toBe("/portal/my-chan");
  });

  it("markStripped clears strippablePath", async () => {
    const seed = generatePortalSeed();
    const hash = `#${encode(seed)}`;
    const h = createHarness(
      true,
      () => hash,
      () => "c1",
    );
    destroy = h.destroy;

    await vi.waitFor(() => {
      expect(h.frag.hasValidFragment).toBe(true);
    });

    h.frag.markRouterReady();
    flushSync();
    expect(h.frag.strippablePath).not.toBeNull();

    h.frag.markStripped();
    flushSync();
    expect(h.frag.strippablePath).toBeNull();
    expect(h.frag.fragmentStripped).toBe(true);
  });

  it("does nothing when not in browser", () => {
    const h = createHarness(
      false,
      () => "#abc",
      () => "ch1",
    );
    destroy = h.destroy;

    expect(h.frag.hashPresent).toBe(false);
    expect(h.frag.fragmentResolved).toBe(false);
    expect(h.frag.fragmentData).toBeNull();
  });

  it("recovers when a hashchange brings a new valid fragment after no-hash resolve", async () => {
    // Start with no hash: composable resolves with null data
    const seed = generatePortalSeed();
    const validHash = `#${encode(seed)}`;
    let currentHash = "";

    const h = createHarness(
      true,
      () => currentHash,
      () => "ch1",
    );
    destroy = h.destroy;

    expect(h.frag.fragmentResolved).toBe(true);
    expect(h.frag.fragmentData).toBeNull();

    // Simulate the client re-pasting the full link: the hash changes
    currentHash = validHash;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    flushSync();

    // The composable should have reset and be parsing again
    await vi.waitFor(() => {
      expect(h.frag.fragmentResolved).toBe(true);
    });

    expect(h.frag.fragmentData).not.toBeNull();
    expect(h.frag.fragmentData!.seed).toEqual(seed);
    expect(h.frag.hasValidFragment).toBe(true);
  });

  it("does not reset on hashchange when a valid fragment is already present", async () => {
    const seed = generatePortalSeed();
    const hash = `#${encode(seed)}`;
    const h = createHarness(
      true,
      () => hash,
      () => "ch1",
    );
    destroy = h.destroy;

    await vi.waitFor(() => {
      expect(h.frag.hasValidFragment).toBe(true);
    });

    const originalData = h.frag.fragmentData;

    // Fire hashchange; the composable should ignore it because it
    // already has valid data
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    flushSync();

    expect(h.frag.fragmentData).toBe(originalData);
  });
});
