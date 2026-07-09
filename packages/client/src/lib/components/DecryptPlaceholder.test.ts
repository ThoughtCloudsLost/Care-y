// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import DecryptPlaceholder from "./DecryptPlaceholder.svelte";
import {
  LOADING,
  DENIED,
  ERROR,
  type DecryptResult,
} from "$lib/crypto/decrypt-result.js";

// IntersectionObserver is not available in jsdom
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

const MockIntersectionObserver = vi.fn(function (this: {
  observe: typeof mockObserve;
  disconnect: typeof mockDisconnect;
  unobserve: ReturnType<typeof vi.fn>;
}) {
  this.observe = mockObserve;
  this.disconnect = mockDisconnect;
  this.unobserve = vi.fn();
});

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

/** Advance past the 150ms scramble delay threshold and flush Svelte updates. */
async function advancePastDelay(): Promise<void> {
  await vi.advanceTimersByTimeAsync(200);
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  mockObserve.mockClear();
  mockDisconnect.mockClear();
});

describe("DecryptPlaceholder", () => {
  it("does not show role=status before the delay threshold", () => {
    render(DecryptPlaceholder, { props: {} });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("renders with role=status and aria-busy after the delay threshold", async () => {
    render(DecryptPlaceholder, { props: {} });
    await advancePastDelay();
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-busy")).toBe("true");
  });

  it("has no role=status when content is provided", () => {
    render(DecryptPlaceholder, { props: { content: "decrypted text" } });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("renders scramble element with aria-hidden after delay", async () => {
    render(DecryptPlaceholder, { props: {} });
    await advancePastDelay();
    const status = screen.getByRole("status");
    const scramble = status.querySelector("[aria-hidden='true']");
    expect(scramble).not.toBeNull();
  });

  it("assigns a variant class (v1-v4)", async () => {
    render(DecryptPlaceholder, { props: {} });
    await advancePastDelay();
    const status = screen.getByRole("status");
    const variant = status.getAttribute("data-variant");
    expect(variant).toMatch(/^v[1-4]$/);
  });

  it("sets scramble width based on length prop", async () => {
    render(DecryptPlaceholder, { props: { length: 14 } });
    await advancePastDelay();
    const status = screen.getByRole("status");
    const scramble = status.querySelector<HTMLElement>("[aria-hidden='true']");
    expect(scramble?.style.width).toBe("14ch");
  });

  it("computes width from ciphertext when provided", async () => {
    // 60-byte ciphertext minus 40 overhead = 20ch
    const ciphertext = new Uint8Array(60);
    render(DecryptPlaceholder, { props: { ciphertext } });
    await advancePastDelay();
    const status = screen.getByRole("status");
    const scramble = status.querySelector<HTMLElement>("[aria-hidden='true']");
    expect(scramble?.style.width).toBe("20ch");
  });

  it("applies block class when block prop is true", () => {
    render(DecryptPlaceholder, { props: { block: true } });
    const container = document.querySelector(".dp");
    expect(container?.classList.contains("block")).toBe(true);
  });

  it("provides screen reader text after delay", async () => {
    render(DecryptPlaceholder, { props: {} });
    await advancePastDelay();
    expect(screen.getByText("Decrypting")).toBeDefined();
  });

  it("does not show screen reader text before delay", () => {
    render(DecryptPlaceholder, { props: {} });
    expect(screen.queryByText("Decrypting")).toBeNull();
  });

  it("renders decrypted content as plain text", () => {
    render(DecryptPlaceholder, {
      props: { content: "Hello world" },
    });
    expect(screen.getByText("Hello world")).toBeDefined();
  });

  it("renders error message for decrypt error sentinel", () => {
    render(DecryptPlaceholder, {
      props: { content: "\0DECRYPT_FAILED" },
    });
    expect(
      screen.getByText("This content could not be decrypted."),
    ).toBeDefined();
  });

  it("sets up IntersectionObserver on mount", () => {
    render(DecryptPlaceholder, { props: {} });
    expect(mockObserve).toHaveBeenCalledOnce();
  });

  it("disconnects IntersectionObserver on unmount", () => {
    const { unmount } = render(DecryptPlaceholder, { props: {} });
    unmount();
    expect(mockDisconnect).toHaveBeenCalledOnce();
  });

  describe("media mode", () => {
    it("assigns a media variant class (m1-m2)", async () => {
      render(DecryptPlaceholder, { props: { mode: "media" } });
      await advancePastDelay();
      const status = screen.getByRole("status");
      const mediaVariant = status.getAttribute("data-media-variant");
      expect(mediaVariant).toMatch(/^m[12]$/);
    });

    it("applies media and block classes in media mode", () => {
      render(DecryptPlaceholder, { props: { mode: "media" } });
      // media/block classes are on the container, not gated by delay
      const container = document.querySelector(".dp");
      expect(container?.classList.contains("media")).toBe(true);
      expect(container?.classList.contains("block")).toBe(true);
    });

    it("does not set width on scramble in media mode", async () => {
      render(DecryptPlaceholder, { props: { mode: "media" } });
      await advancePastDelay();
      const status = screen.getByRole("status");
      const scramble = status.querySelector<HTMLElement>(
        "[aria-hidden='true']",
      );
      expect(scramble?.style.width).toBe("");
    });
  });

  describe("result prop (DecryptResult)", () => {
    it("shows loading state for result=LOADING after delay", async () => {
      render(DecryptPlaceholder, { props: { result: LOADING } });
      await advancePastDelay();
      const status = screen.getByRole("status");
      expect(status.getAttribute("aria-busy")).toBe("true");
      expect(screen.getByText("Decrypting")).toBeDefined();
    });

    it("shows ready content for result with value", () => {
      const result: DecryptResult = { status: "ready", value: "Decrypted!" };
      render(DecryptPlaceholder, { props: { result } });
      expect(screen.queryByRole("status")).toBeNull();
      expect(screen.getByText("Decrypted!")).toBeDefined();
    });

    it("shows denied message for result=DENIED", () => {
      render(DecryptPlaceholder, { props: { result: DENIED } });
      expect(screen.getByText("No access to this content")).toBeDefined();
    });

    it("shows error message for result=ERROR", () => {
      render(DecryptPlaceholder, { props: { result: ERROR } });
      expect(
        screen.getByText("This content could not be decrypted."),
      ).toBeDefined();
    });

    it("errorLabel overrides the error message", () => {
      render(DecryptPlaceholder, {
        props: { result: ERROR, errorLabel: "Could not unlock this preview" },
      });
      expect(screen.getByText("Could not unlock this preview")).toBeDefined();
      expect(
        screen.queryByText("This content could not be decrypted."),
      ).toBeNull();
    });

    it("errorLabel does not override the denied message", () => {
      render(DecryptPlaceholder, {
        props: { result: DENIED, errorLabel: "Could not unlock this preview" },
      });
      // Denied means missing key material, not a failed attempt; the
      // distinction must survive any surface-specific error copy.
      expect(screen.getByText("No access to this content")).toBeDefined();
      expect(screen.queryByText("Could not unlock this preview")).toBeNull();
    });

    it("result takes precedence over content when both provided", () => {
      const result: DecryptResult = { status: "ready", value: "From result" };
      render(DecryptPlaceholder, {
        props: { result, content: "From content" },
      });
      expect(screen.getByText("From result")).toBeDefined();
      expect(screen.queryByText("From content")).toBeNull();
    });
  });
});
