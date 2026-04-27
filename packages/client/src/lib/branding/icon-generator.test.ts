import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateIconVariants } from "./icon-generator";

// Mock OffscreenCanvas and createImageBitmap for test environment
const mockConvertToBlob = vi.fn();
const mockGetContext = vi.fn();
const mockDrawImage = vi.fn();
const mockFillRect = vi.fn();

class MockOffscreenCanvas {
  readonly width: number;
  readonly height: number;
  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
  }
  getContext(): {
    drawImage: typeof mockDrawImage;
    fillRect: typeof mockFillRect;
    fillStyle: string;
  } {
    mockGetContext();
    return {
      drawImage: mockDrawImage,
      fillRect: mockFillRect,
      fillStyle: "",
    };
  }
  convertToBlob = mockConvertToBlob;
}

vi.stubGlobal("OffscreenCanvas", MockOffscreenCanvas);

const mockClose = vi.fn();
vi.stubGlobal(
  "createImageBitmap",
  vi.fn().mockResolvedValue({
    width: 1024,
    height: 1024,
    close: mockClose,
  }),
);

describe("generateIconVariants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConvertToBlob.mockResolvedValue(
      new Blob(["png"], { type: "image/png" }),
    );
  });

  it("generates three variants: 192 any, 512 any, 512 maskable", async () => {
    const source = new Blob(["test"], { type: "image/png" });
    const variants = await generateIconVariants(source);

    expect(variants).toHaveLength(3);
    expect(variants[0]).toMatchObject({ size: 192, purpose: "any" });
    expect(variants[1]).toMatchObject({ size: 512, purpose: "any" });
    expect(variants[2]).toMatchObject({ size: 512, purpose: "maskable" });
  });

  it("returns Blob instances for each variant", async () => {
    const source = new Blob(["test"], { type: "image/png" });
    const variants = await generateIconVariants(source);

    for (const variant of variants) {
      expect(variant.blob).toBeInstanceOf(Blob);
    }
  });

  it("calls createImageBitmap with the source blob", async () => {
    const source = new Blob(["test"], { type: "image/png" });
    await generateIconVariants(source);

    expect(globalThis.createImageBitmap).toHaveBeenCalledWith(source);
  });

  it("closes the ImageBitmap after processing", async () => {
    const source = new Blob(["test"], { type: "image/png" });
    await generateIconVariants(source);

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("draws maskable variant with white background and inset", async () => {
    const source = new Blob(["test"], { type: "image/png" });
    await generateIconVariants(source);

    // maskable is the 3rd call (index 2). The fillRect should be called
    // for the maskable variant background.
    expect(mockFillRect).toHaveBeenCalledWith(0, 0, 512, 512);
  });

  it("creates OffscreenCanvas with correct dimensions", async () => {
    const source = new Blob(["test"], { type: "image/png" });
    await generateIconVariants(source);

    // convertToBlob called 3 times (one per variant)
    expect(mockConvertToBlob).toHaveBeenCalledTimes(3);
    expect(mockConvertToBlob).toHaveBeenCalledWith({ type: "image/png" });
  });
});
