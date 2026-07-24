// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";

// vi.mock required: flushSync is a Svelte compiler-integrated function
// that requires the Svelte runtime. In jsdom unit tests the runtime is
// not initialized, so we mock it to verify the call contract.
vi.mock("svelte", () => ({
  flushSync: vi.fn((fn?: () => void) => {
    fn?.();
  }),
}));

import { gestureMount } from "./gesture-focus.js";
import { flushSync } from "svelte";

describe("gestureMount", () => {
  it("calls mount inside flushSync", () => {
    const mount = vi.fn();
    gestureMount(mount);

    expect(flushSync).toHaveBeenCalledTimes(1);
    expect(flushSync).toHaveBeenCalledWith(mount);
    expect(mount).toHaveBeenCalledTimes(1);
  });

  it("focuses the element returned by the focus callback", () => {
    const el = document.createElement("input");
    const focusSpy = vi.spyOn(el, "focus");
    const mount = vi.fn();

    gestureMount(mount, () => el);

    expect(focusSpy).toHaveBeenCalledTimes(1);
    focusSpy.mockRestore();
  });

  it("tolerates a focus callback that returns null", () => {
    const mount = vi.fn();
    expect(() => {
      gestureMount(mount, () => null);
    }).not.toThrow();
    expect(mount).toHaveBeenCalledTimes(1);
  });

  it("tolerates a focus callback that returns undefined", () => {
    const mount = vi.fn();
    expect(() => {
      gestureMount(mount, () => undefined);
    }).not.toThrow();
  });

  it("skips focus when no focus callback is provided", () => {
    const mount = vi.fn();
    gestureMount(mount);
    expect(mount).toHaveBeenCalledTimes(1);
  });

  it("executes mount before focus", () => {
    const order: string[] = [];
    const el = document.createElement("input");
    vi.spyOn(el, "focus").mockImplementation(() => {
      order.push("focus");
    });

    gestureMount(
      () => {
        order.push("mount");
      },
      () => el,
    );

    expect(order).toEqual(["mount", "focus"]);
  });
});
