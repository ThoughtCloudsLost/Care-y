// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Node as PMNode } from "prosemirror-model";
import { kbArticleSchema } from "../prosemirror-schema.js";
import { createImageNodeView, type ImageViewDeps } from "./image-view.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a ProseMirror image node with the given attrs. */
function imageNode(src: string, alt = "", title: string | null = null): PMNode {
  return kbArticleSchema.nodes.image!.create({ src, alt, title });
}

/** Stub EditorView and getPos (NodeView constructor requires them). */
const fakeView = {} as Parameters<ReturnType<typeof createImageNodeView>>[1];
const fakeGetPos = (): number | undefined => 0;

/** Create a fresh deps object with controllable downloadBlob mock. */
function makeDeps(overrides?: Partial<ImageViewDeps>): ImageViewDeps {
  return {
    downloadBlob: vi.fn(async () => ({
      data: btoa("fake-image-data"),
    })) as unknown as ImageViewDeps["downloadBlob"],
    orgKeyManager: {
      decrypt(input: Uint8Array): Uint8Array {
        return input;
      },
    } as unknown as ImageViewDeps["orgKeyManager"],
    ...overrides,
  };
}

/** Type-safe access to the vi.fn mock on deps.downloadBlob. */
function asMock(fn: ImageViewDeps["downloadBlob"]): ReturnType<typeof vi.fn> {
  return fn as unknown as ReturnType<typeof vi.fn>;
}

/** Track blob URL creation and revocation. */
function trackBlobUrls(): {
  created: string[];
  revoked: string[];
  cleanup: () => void;
} {
  const created: string[] = [];
  const revoked: string[] = [];
  let counter = 0;

  const origCreate = URL.createObjectURL;
  const origRevoke = URL.revokeObjectURL;

  URL.createObjectURL = (_blob: Blob | MediaSource): string => {
    const url = `blob:test-${String(++counter)}`;
    created.push(url);
    return url;
  };

  URL.revokeObjectURL = (url: string): void => {
    revoked.push(url);
  };

  return {
    created,
    revoked,
    cleanup() {
      URL.createObjectURL = origCreate;
      URL.revokeObjectURL = origRevoke;
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("KbImageView (NodeView)", () => {
  let blobTracker: ReturnType<typeof trackBlobUrls>;

  beforeEach(() => {
    blobTracker = trackBlobUrls();
  });

  afterEach(() => {
    blobTracker.cleanup();
  });

  describe("blob: and data: URLs (recently uploaded images)", () => {
    it("displays blob: URL directly without fetching", () => {
      const deps = makeDeps();
      const factory = createImageNodeView(deps);
      const node = imageNode("blob:http://localhost/abc-123", "Photo");
      const nv = factory(node, fakeView, fakeGetPos);

      const img = nv.dom.querySelector("img") as HTMLImageElement;
      expect(img.src).toBe("blob:http://localhost/abc-123");
      expect(img.alt).toBe("Photo");
      expect(img.style.display).not.toBe("none");
      expect(asMock(deps.downloadBlob)).not.toHaveBeenCalled();
    });

    it("displays data: URL directly without fetching", () => {
      const deps = makeDeps();
      const factory = createImageNodeView(deps);
      const node = imageNode("data:image/png;base64,abc", "Icon");
      const nv = factory(node, fakeView, fakeGetPos);

      const img = nv.dom.querySelector("img") as HTMLImageElement;
      expect(img.src).toBe("data:image/png;base64,abc");
      expect(asMock(deps.downloadBlob)).not.toHaveBeenCalled();
    });
  });

  describe("kb-attachment:// URIs", () => {
    it("calls downloadBlob with the attachment ID", async () => {
      const deps = makeDeps();
      const factory = createImageNodeView(deps);
      const node = imageNode("kb-attachment://att-uuid-1");
      factory(node, fakeView, fakeGetPos);

      // Wait for the async fetch+decrypt to resolve
      await vi.waitFor(() => {
        expect(asMock(deps.downloadBlob)).toHaveBeenCalledWith("att-uuid-1");
      });
    });

    it("creates a blob URL from decrypted bytes and displays the image", async () => {
      const deps = makeDeps();
      const factory = createImageNodeView(deps);
      const node = imageNode("kb-attachment://att-uuid-2", "Decrypted photo");
      const nv = factory(node, fakeView, fakeGetPos);

      await vi.waitFor(() => {
        expect(blobTracker.created.length).toBeGreaterThan(0);
      });

      const img = nv.dom.querySelector("img") as HTMLImageElement;
      expect(img.src).toBe(blobTracker.created[0]);
      expect(img.style.display).not.toBe("none");
    });

    it("shows loading state while fetch is in progress", () => {
      // Create a deps where downloadBlob never resolves
      const deps = makeDeps({
        downloadBlob: vi.fn(
          () =>
            new Promise((_resolve) => {
              /* intentionally never resolves */
            }),
        ) as unknown as ImageViewDeps["downloadBlob"],
      });
      const factory = createImageNodeView(deps);
      const node = imageNode("kb-attachment://pending");
      const nv = factory(node, fakeView, fakeGetPos);

      const loading = nv.dom.querySelector(
        ".pm-image-view__loading",
      ) as HTMLElement;
      expect(loading.style.display).not.toBe("none");

      const img = nv.dom.querySelector("img") as HTMLImageElement;
      expect(img.style.display).toBe("none");
    });

    it("shows error state when download fails", async () => {
      const deps = makeDeps({
        downloadBlob: vi.fn(async () => {
          throw new Error("network failure");
        }) as unknown as ImageViewDeps["downloadBlob"],
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const factory = createImageNodeView(deps);
      const node = imageNode("kb-attachment://broken");
      const nv = factory(node, fakeView, fakeGetPos);

      await vi.waitFor(() => {
        const errEl = nv.dom.querySelector(
          ".pm-image-view__error",
        ) as HTMLElement;
        expect(errEl.style.display).not.toBe("none");
      });

      const img = nv.dom.querySelector("img") as HTMLImageElement;
      expect(img.style.display).toBe("none");

      consoleSpy.mockRestore();
    });

    it("shows error state when decryption fails", async () => {
      const deps = makeDeps({
        orgKeyManager: {
          decrypt(): Uint8Array {
            throw new Error("decrypt failed");
          },
        } as unknown as ImageViewDeps["orgKeyManager"],
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const factory = createImageNodeView(deps);
      const node = imageNode("kb-attachment://bad-cipher");
      const nv = factory(node, fakeView, fakeGetPos);

      await vi.waitFor(() => {
        const errEl = nv.dom.querySelector(
          ".pm-image-view__error",
        ) as HTMLElement;
        expect(errEl.style.display).not.toBe("none");
      });

      consoleSpy.mockRestore();
    });
  });

  describe("alt badge", () => {
    it("shows alt badge when alt text is empty", () => {
      const deps = makeDeps();
      const factory = createImageNodeView(deps);
      const node = imageNode("blob:test", "");
      const nv = factory(node, fakeView, fakeGetPos);

      const badge = nv.dom.querySelector(
        ".pm-image-view__alt-badge",
      ) as HTMLElement;
      expect(badge.style.display).not.toBe("none");
      expect(badge.textContent).toBe("alt");
    });

    it("hides alt badge when alt text is provided", () => {
      const deps = makeDeps();
      const factory = createImageNodeView(deps);
      const node = imageNode("blob:test", "A descriptive alt");
      const nv = factory(node, fakeView, fakeGetPos);

      const badge = nv.dom.querySelector(
        ".pm-image-view__alt-badge",
      ) as HTMLElement;
      expect(badge.style.display).toBe("none");
    });
  });

  describe("update()", () => {
    it("returns true for image nodes (handles the update)", () => {
      const deps = makeDeps();
      const factory = createImageNodeView(deps);
      const node1 = imageNode("blob:test-1", "Old alt");
      const nv = factory(node1, fakeView, fakeGetPos);

      const node2 = imageNode("blob:test-1", "New alt");
      expect((nv.update as (n: PMNode) => boolean)(node2)).toBe(true);

      const img = nv.dom.querySelector("img") as HTMLImageElement;
      expect(img.alt).toBe("New alt");
    });

    it("returns false for non-image nodes", () => {
      const deps = makeDeps();
      const factory = createImageNodeView(deps);
      const node = imageNode("blob:test");
      const nv = factory(node, fakeView, fakeGetPos);

      const paragraph = kbArticleSchema.nodes.paragraph!.create();
      expect((nv.update as (n: PMNode) => boolean)(paragraph)).toBe(false);
    });

    it("re-fetches when src changes", async () => {
      const deps = makeDeps();
      const factory = createImageNodeView(deps);
      const node1 = imageNode("blob:original");
      const nv = factory(node1, fakeView, fakeGetPos);

      // Update to a kb-attachment:// URI triggers a new fetch
      const node2 = imageNode("kb-attachment://new-id");
      (nv.update as (n: PMNode) => boolean)(node2);

      await vi.waitFor(() => {
        expect(asMock(deps.downloadBlob)).toHaveBeenCalledWith("new-id");
      });
    });

    it("updates attrs without re-fetching when only alt/title changes", () => {
      const deps = makeDeps();
      const factory = createImageNodeView(deps);
      const node1 = imageNode("blob:test-same", "Old");
      const nv = factory(node1, fakeView, fakeGetPos);

      asMock(deps.downloadBlob).mockClear();
      const node2 = imageNode("blob:test-same", "New", "My Title");
      (nv.update as (n: PMNode) => boolean)(node2);

      const img = nv.dom.querySelector("img") as HTMLImageElement;
      expect(img.alt).toBe("New");
      expect(img.title).toBe("My Title");
      expect(asMock(deps.downloadBlob)).not.toHaveBeenCalled();
    });
  });

  describe("destroy()", () => {
    it("revokes a created blob URL on destroy", async () => {
      const deps = makeDeps();
      const factory = createImageNodeView(deps);
      const node = imageNode("kb-attachment://revoke-test");
      const nv = factory(node, fakeView, fakeGetPos);

      await vi.waitFor(() => {
        expect(blobTracker.created.length).toBeGreaterThan(0);
      });

      nv.destroy!();
      expect(blobTracker.revoked).toContain(blobTracker.created[0]);
    });

    it("does not attempt to revoke when no blob URL was created", () => {
      const deps = makeDeps();
      const factory = createImageNodeView(deps);
      const node = imageNode("blob:external-url");
      const nv = factory(node, fakeView, fakeGetPos);

      nv.destroy!();
      expect(blobTracker.revoked).toHaveLength(0);
    });

    it("prevents fetch callback from updating DOM after destroy", async () => {
      // downloadBlob resolves after destroy is called
      let resolveDownload!: (value: { data: string }) => void;
      const deps = makeDeps({
        downloadBlob: vi.fn(
          () =>
            new Promise<{ data: string }>((resolve) => {
              resolveDownload = resolve;
            }),
        ) as unknown as ImageViewDeps["downloadBlob"],
      });

      const factory = createImageNodeView(deps);
      const node = imageNode("kb-attachment://race-condition");
      const nv = factory(node, fakeView, fakeGetPos);

      // Destroy before the download resolves
      nv.destroy!();

      // Now resolve the download
      resolveDownload({ data: btoa("late-data") });
      await new Promise((r) => setTimeout(r, 10));

      // Should not have created any blob URL (aborted flag prevents it)
      expect(blobTracker.created).toHaveLength(0);
    });
  });

  describe("stopEvent()", () => {
    it("returns false (does not capture events)", () => {
      const deps = makeDeps();
      const factory = createImageNodeView(deps);
      const node = imageNode("blob:test");
      const nv = factory(node, fakeView, fakeGetPos);

      expect((nv.stopEvent as (e: Event) => boolean)(new Event("click"))).toBe(
        false,
      );
    });
  });

  describe("empty src", () => {
    it("shows error state for empty src", () => {
      const deps = makeDeps();
      const factory = createImageNodeView(deps);
      const node = imageNode("");
      const nv = factory(node, fakeView, fakeGetPos);

      const errEl = nv.dom.querySelector(
        ".pm-image-view__error",
      ) as HTMLElement;
      expect(errEl.style.display).not.toBe("none");
    });
  });

  describe("external URLs", () => {
    it("displays external http: URLs directly", () => {
      const deps = makeDeps();
      const factory = createImageNodeView(deps);
      const node = imageNode("https://example.com/photo.jpg", "External");
      const nv = factory(node, fakeView, fakeGetPos);

      const img = nv.dom.querySelector("img") as HTMLImageElement;
      expect(img.src).toBe("https://example.com/photo.jpg");
      expect(asMock(deps.downloadBlob)).not.toHaveBeenCalled();
    });
  });
});
