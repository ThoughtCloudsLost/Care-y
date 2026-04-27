import { describe, it, expect } from "vitest";
import { createLightbox } from "./create-lightbox.svelte.js";

describe("createLightbox", () => {
  it("starts closed with null url", () => {
    const lb = createLightbox();

    expect(lb.open).toBe(false);
    expect(lb.url).toBeNull();
  });

  it("opens with the given url", () => {
    const lb = createLightbox();

    lb.show("https://example.com/img.jpg");

    expect(lb.open).toBe(true);
    expect(lb.url).toBe("https://example.com/img.jpg");
  });

  it("dismiss resets both open and url", () => {
    const lb = createLightbox();
    lb.show("https://example.com/img.jpg");

    lb.dismiss();

    expect(lb.open).toBe(false);
    expect(lb.url).toBeNull();
  });

  it("show replaces previous url when already open", () => {
    const lb = createLightbox();
    lb.show("https://example.com/first.jpg");

    lb.show("https://example.com/second.jpg");

    expect(lb.open).toBe(true);
    expect(lb.url).toBe("https://example.com/second.jpg");
  });
});
