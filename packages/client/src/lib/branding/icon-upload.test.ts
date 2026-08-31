import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { uploadPwaIcons, type IconUploadRouter } from "./icon-upload.js";
import { getCachedBranding } from "./index.js";
import {
  getAppleTouchIconHref,
  setAppleTouchIconHref,
} from "./icon-link.svelte.js";
import { getOrgSlug } from "$lib/utils/org-slug.js";

// OffscreenCanvas and createImageBitmap do not exist in the test
// environment. Stubbed at the platform boundary, following the approach
// in icon-generator.test.ts, so the real generateIconVariants pipeline
// runs. Each canvas produces a blob labeled with its dimensions plus a
// maskable marker when a background fill was drawn, so the upload payload
// can be verified per variant without depending on generation order.
class StubOffscreenCanvas {
  readonly width: number;
  readonly height: number;
  #filled = false;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  getContext(): {
    fillStyle: string;
    fillRect: () => void;
    drawImage: () => void;
  } {
    return {
      fillStyle: "",
      fillRect: () => {
        this.#filled = true;
      },
      drawImage: () => undefined,
    };
  }

  convertToBlob(): Promise<Blob> {
    const label = this.#filled
      ? `${String(this.width)}x${String(this.height)}-maskable`
      : `${String(this.width)}x${String(this.height)}`;
    return Promise.resolve(new Blob([label], { type: "image/png" }));
  }
}
vi.stubGlobal("OffscreenCanvas", StubOffscreenCanvas);

const mockCreateImageBitmap = vi.fn();
vi.stubGlobal("createImageBitmap", mockCreateImageBitmap);

// In-memory Cache API stand-in (Map-backed, per testing-reference) so the
// fire-and-forget branding cache update can be observed through the public
// getCachedBranding() read path. A fresh Response is minted per match
// because Response bodies are single-use.
const cacheStore = new Map<string, string>();
const memoryCache = {
  match: (key: string): Promise<Response | null> => {
    const body = cacheStore.get(key);
    return Promise.resolve(
      body === undefined
        ? null
        : new Response(body, {
            headers: { "Content-Type": "application/json" },
          }),
    );
  },
  put: async (key: string, response: Response): Promise<void> => {
    cacheStore.set(key, await response.text());
  },
};
vi.stubGlobal("caches", {
  open: () => Promise.resolve(memoryCache),
  delete: () => Promise.resolve(true),
});

const encoder = new TextEncoder();

interface UploadInput {
  icon192: string;
  icon512: string;
  iconMaskable: string;
}

function createRouter(): {
  router: IconUploadRouter;
  mutate: Mock<(input: UploadInput) => Promise<unknown>>;
} {
  const mutate = vi
    .fn<(input: UploadInput) => Promise<unknown>>()
    .mockResolvedValue(undefined);
  return { router: { uploadIcons: { mutate } }, mutate };
}

/** Base64url-encode raw bytes (mirrors the production helper). */
function toBase64url(label: string): string {
  const bytes = encoder.encode(label);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sourceBlob(): Blob {
  return new Blob(["synthetic-logo-bytes"], { type: "image/png" });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCreateImageBitmap.mockResolvedValue({
    width: 640,
    height: 640,
    close: vi.fn(),
  });
  cacheStore.clear();
  setAppleTouchIconHref(null);
});

describe("uploadPwaIcons", () => {
  it("base64-encodes each generated variant and uploads it in its matching field", async () => {
    const { router, mutate } = createRouter();

    const result = await uploadPwaIcons(sourceBlob(), router);

    // The mutate input carries one base64url string per variant (plain PNG
    // bytes, no encryption).
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith({
      icon192: toBase64url("192x192"),
      icon512: toBase64url("512x512"),
      iconMaskable: toBase64url("512x512-maskable"),
    });

    // Version is the cache-busting token embedded in served icon URLs.
    expect(result.version).toMatch(/^\d+$/);
  });

  it("propagates an unreadable source image and never uploads", async () => {
    const { router, mutate } = createRouter();
    const decodeFailure = new TypeError("unreadable image data");
    mockCreateImageBitmap.mockRejectedValueOnce(decodeFailure);

    await expect(uploadPwaIcons(sourceBlob(), router)).rejects.toBe(
      decodeFailure,
    );

    expect(mutate).not.toHaveBeenCalled();
  });

  it("propagates an upload failure and leaves the cache and icon link untouched", async () => {
    const { router, mutate } = createRouter();
    const uploadFailure = new Error("relay unavailable");
    mutate.mockRejectedValueOnce(uploadFailure);

    await expect(uploadPwaIcons(sourceBlob(), router)).rejects.toBe(
      uploadFailure,
    );

    expect(getAppleTouchIconHref()).toBeNull();
    await expect(getCachedBranding()).resolves.toBeNull();
  });

  it("records the new icon state in the branding cache after a successful upload", async () => {
    const { router } = createRouter();

    const result = await uploadPwaIcons(sourceBlob(), router);

    // The cache update is fire-and-forget, so poll the public read path.
    await vi.waitFor(async () => {
      const cached = await getCachedBranding();
      expect(cached?.hasIcons).toBe(true);
      expect(cached?.iconVersion).toBe(result.version);
    });
  });

  it("points the apple-touch-icon at the freshly versioned 192px icon URL", async () => {
    const { router } = createRouter();
    const slug = getOrgSlug();
    // The unit test environment resolves the dev-mode org slug.
    expect(slug).not.toBeNull();

    const result = await uploadPwaIcons(sourceBlob(), router);

    // URL shape is the server branding route contract (the same format
    // brandingIconUrl() produces for the 192 "any" variant).
    expect(getAppleTouchIconHref()).toBe(
      `/api/branding/${slug ?? ""}/icon-192.png?v=${result.version}`,
    );
  });
});
