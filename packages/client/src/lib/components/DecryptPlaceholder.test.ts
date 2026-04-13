// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import DecryptPlaceholder from "./DecryptPlaceholder.svelte";

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

afterEach(() => {
  cleanup();
  mockObserve.mockClear();
  mockDisconnect.mockClear();
});

describe("DecryptPlaceholder", () => {
  it("renders with role=status and aria-busy when loading (content undefined)", () => {
    render(DecryptPlaceholder, { props: {} });
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-busy")).toBe("true");
  });

  it("has no role=status when content is provided", () => {
    render(DecryptPlaceholder, { props: { content: "decrypted text" } });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("renders scramble element with aria-hidden", () => {
    render(DecryptPlaceholder, { props: {} });
    const status = screen.getByRole("status");
    const scramble = status.querySelector("[aria-hidden='true']");
    expect(scramble).not.toBeNull();
  });

  it("assigns a variant class (v1-v4)", () => {
    render(DecryptPlaceholder, { props: {} });
    const status = screen.getByRole("status");
    const variant = status.getAttribute("data-variant");
    expect(variant).toMatch(/^v[1-4]$/);
  });

  it("sets scramble width based on length prop", () => {
    render(DecryptPlaceholder, { props: { length: 14 } });
    const status = screen.getByRole("status");
    const scramble = status.querySelector<HTMLElement>("[aria-hidden='true']");
    expect(scramble?.style.width).toBe("14ch");
  });

  it("computes width from ciphertext when provided", () => {
    // 60-byte ciphertext minus 40 overhead = 20ch
    const ciphertext = new Uint8Array(60);
    render(DecryptPlaceholder, { props: { ciphertext } });
    const status = screen.getByRole("status");
    const scramble = status.querySelector<HTMLElement>("[aria-hidden='true']");
    expect(scramble?.style.width).toBe("20ch");
  });

  it("applies block class when block prop is true", () => {
    render(DecryptPlaceholder, { props: { block: true } });
    const status = screen.getByRole("status");
    expect(status.classList.contains("block")).toBe(true);
  });

  it("provides screen reader text when loading", () => {
    render(DecryptPlaceholder, { props: {} });
    expect(screen.getByText("Decrypting")).toBeDefined();
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
    it("assigns a media variant class (m1-m2)", () => {
      render(DecryptPlaceholder, { props: { mode: "media" } });
      const status = screen.getByRole("status");
      const mediaVariant = status.getAttribute("data-media-variant");
      expect(mediaVariant).toMatch(/^m[12]$/);
    });

    it("applies media and block classes in media mode", () => {
      render(DecryptPlaceholder, { props: { mode: "media" } });
      const status = screen.getByRole("status");
      expect(status.classList.contains("media")).toBe(true);
      expect(status.classList.contains("block")).toBe(true);
    });

    it("does not set width on scramble in media mode", () => {
      render(DecryptPlaceholder, { props: { mode: "media" } });
      const status = screen.getByRole("status");
      const scramble = status.querySelector<HTMLElement>(
        "[aria-hidden='true']",
      );
      expect(scramble?.style.width).toBe("");
    });
  });
});
