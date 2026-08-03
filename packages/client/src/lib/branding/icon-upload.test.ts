import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { uploadPwaIcons, type IconUploadRouter } from "./icon-upload.js";
import {
  OrgKeyNotLoadedError,
  type OrgKeyManager,
} from "$lib/crypto/org-key.js";
import { getCachedBranding } from "./index.js";
import {
  getAppleTouchIconHref,
  setAppleTouchIconHref,
} from "./icon-link.svelte.js";
import { getOrgSlug } from "$lib/utils/org-slug.js";

const { fakeEncrypt } = vi.hoisted(() => ({
  /**
   * Deterministic stand-in for encryptClientBranding: prefixes the payload
   * with the first public key byte so assertions can verify that both the
   * variant bytes and the org public key reached the encrypt call.
   */
  fakeEncrypt: (data: Uint8Array, orgPublicKey: Uint8Array): Uint8Array => {
    const sealed = new Uint8Array(data.length + 1);
    sealed[0] = orgPublicKey[0] ?? 0;
    sealed.set(data, 1);
    return sealed;
  },
}));

// vi.mock required: the @care-y/crypto barrel initializes libsodium WASM
// via the getSodium() singleton at import time, which the Node/jsdom test
// environment cannot load without the slow JS fallback (testing-reference
// section 4, constraint 2).
vi.mock("@care-y/crypto", () => ({
  encryptClientBranding: fakeEncrypt,
  decode: vi.fn(),
  encode: (bytes: Uint8Array): string => {
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  },
}));

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

const ORG_PUB_KEY = new Uint8Array(32).fill(7);
const encoder = new TextEncoder();

/**
 * uploadPwaIcons only reads getPublicKey(); cast per the project's mock
 * construction convention (see org-decrypt-cache.test.ts) instead of
 * wiring a Worker-backed OrgKeyManager.
 */
function stubKeyManager(key: Uint8Array | null): OrgKeyManager {
  return { getPublicKey: () => key } as unknown as OrgKeyManager;
}

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

/** Base64url ciphertext expected on the wire for a variant blob label. */
function expectedPayload(label: string): string {
  const bytes = fakeEncrypt(encoder.encode(label), ORG_PUB_KEY);
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
  it("encrypts each generated variant and uploads it in its matching field", async () => {
    const { router, mutate } = createRouter();

    const result = await uploadPwaIcons(
      sourceBlob(),
      stubKeyManager(ORG_PUB_KEY),
      router,
    );

    // The mutate input is the tRPC wire format: one base64 ciphertext
    // string per variant, stored server-side and served back on the
    // public branding icon routes.
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith({
      icon192: expectedPayload("192x192"),
      icon512: expectedPayload("512x512"),
      iconMaskable: expectedPayload("512x512-maskable"),
    });

    // Version is the cache-busting token embedded in served icon URLs.
    expect(result.version).toMatch(/^\d+$/);

    // The uploaded strings are ciphertext, never the plaintext icon bytes.
    const input = mutate.mock.calls[0]?.[0];
    const plainB64 = btoa(String.fromCharCode(...encoder.encode("192x192")));
    expect(input?.icon192).not.toBe(plainB64);
  });

  it("throws OrgKeyNotLoadedError and skips the upload when the org key is absent", async () => {
    const { router, mutate } = createRouter();

    await expect(
      uploadPwaIcons(sourceBlob(), stubKeyManager(null), router),
    ).rejects.toThrow(OrgKeyNotLoadedError);

    expect(mutate).not.toHaveBeenCalled();
  });

  it("propagates an unreadable source image and never uploads", async () => {
    const { router, mutate } = createRouter();
    const decodeFailure = new TypeError("unreadable image data");
    mockCreateImageBitmap.mockRejectedValueOnce(decodeFailure);

    await expect(
      uploadPwaIcons(sourceBlob(), stubKeyManager(ORG_PUB_KEY), router),
    ).rejects.toBe(decodeFailure);

    expect(mutate).not.toHaveBeenCalled();
  });

  it("propagates an upload failure and leaves the cache and icon link untouched", async () => {
    const { router, mutate } = createRouter();
    const uploadFailure = new Error("relay unavailable");
    mutate.mockRejectedValueOnce(uploadFailure);

    await expect(
      uploadPwaIcons(sourceBlob(), stubKeyManager(ORG_PUB_KEY), router),
    ).rejects.toBe(uploadFailure);

    expect(getAppleTouchIconHref()).toBeNull();
    await expect(getCachedBranding()).resolves.toBeNull();
  });

  it("records the new icon state in the branding cache after a successful upload", async () => {
    const { router } = createRouter();

    const result = await uploadPwaIcons(
      sourceBlob(),
      stubKeyManager(ORG_PUB_KEY),
      router,
    );

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

    const result = await uploadPwaIcons(
      sourceBlob(),
      stubKeyManager(ORG_PUB_KEY),
      router,
    );

    // URL shape is the server branding route contract (the same format
    // brandingIconUrl() produces for the 192 "any" variant).
    expect(getAppleTouchIconHref()).toBe(
      `/api/branding/${slug ?? ""}/icon-192.png?v=${result.version}`,
    );
  });
});
