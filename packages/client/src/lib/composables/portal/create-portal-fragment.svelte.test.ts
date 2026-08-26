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
});
