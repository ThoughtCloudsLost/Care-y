import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  fetchBlob,
  setEngineBlobResolver,
  resetEngineBlobResolver,
  DemoBlobResolverNotReadyError,
  type DemoBlobResolver,
} from "./fetch-blob.js";
import { BlobFetchError } from "$lib/errors.js";

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

function fakeResolver(
  fn: DemoBlobResolver["resolveBlob"] = () => Promise.resolve(null),
): DemoBlobResolver {
  return { resolveBlob: vi.fn(fn) };
}

describe("fetch-blob stub", () => {
  beforeEach(() => {
    resetEngineBlobResolver();
  });

  describe("valid path resolution", () => {
    it("resolves bytes from a fake resolver for recordings", async () => {
      const data = new Uint8Array([1, 2, 3, 4]);
      const resolver = fakeResolver(() => Promise.resolve(data));
      setEngineBlobResolver(resolver);

      const result = await fetchBlob(`/api/blobs/recordings/${VALID_UUID}`);

      expect(new Uint8Array(result)).toEqual(data);
      expect(resolver.resolveBlob).toHaveBeenCalledWith(
        "recordings",
        VALID_UUID,
      );
    });

    it("resolves bytes for attachments category", async () => {
      const data = new Uint8Array([10, 20]);
      const resolver = fakeResolver(() => Promise.resolve(data));
      setEngineBlobResolver(resolver);

      const result = await fetchBlob(`/api/blobs/attachments/${VALID_UUID}`);
      expect(new Uint8Array(result)).toEqual(data);
      expect(resolver.resolveBlob).toHaveBeenCalledWith(
        "attachments",
        VALID_UUID,
      );
    });

    it("resolves bytes for kb-attachments category", async () => {
      const data = new Uint8Array([99]);
      const resolver = fakeResolver(() => Promise.resolve(data));
      setEngineBlobResolver(resolver);

      const result = await fetchBlob(`/api/blobs/kb-attachments/${VALID_UUID}`);
      expect(new Uint8Array(result)).toEqual(data);
      expect(resolver.resolveBlob).toHaveBeenCalledWith(
        "kb-attachments",
        VALID_UUID,
      );
    });
  });

  describe("path validation", () => {
    it("throws BlobFetchError 404 for wrong prefix", async () => {
      const resolver = fakeResolver();
      setEngineBlobResolver(resolver);

      await expect(fetchBlob(`/wrong/path/${VALID_UUID}`)).rejects.toThrow(
        BlobFetchError,
      );
      await expect(
        fetchBlob(`/wrong/path/${VALID_UUID}`),
      ).rejects.toMatchObject({ status: 404 });
    });

    it("throws BlobFetchError 404 for invalid category", async () => {
      const resolver = fakeResolver();
      setEngineBlobResolver(resolver);

      await expect(
        fetchBlob(`/api/blobs/invalid-cat/${VALID_UUID}`),
      ).rejects.toThrow(BlobFetchError);
      await expect(
        fetchBlob(`/api/blobs/invalid-cat/${VALID_UUID}`),
      ).rejects.toMatchObject({ status: 404 });
    });

    it("throws BlobFetchError 404 for non-UUID id", async () => {
      const resolver = fakeResolver();
      setEngineBlobResolver(resolver);

      await expect(
        fetchBlob("/api/blobs/recordings/not-a-uuid"),
      ).rejects.toThrow(BlobFetchError);
      await expect(
        fetchBlob("/api/blobs/recordings/not-a-uuid"),
      ).rejects.toMatchObject({ status: 404 });
    });

    it("throws BlobFetchError 404 when path has no slash after category", async () => {
      const resolver = fakeResolver();
      setEngineBlobResolver(resolver);

      await expect(fetchBlob("/api/blobs/recordings")).rejects.toThrow(
        BlobFetchError,
      );
    });
  });

  describe("resolver returning null", () => {
    it("throws BlobFetchError 404 when resolver returns null", async () => {
      const resolver = fakeResolver(() => Promise.resolve(null));
      setEngineBlobResolver(resolver);

      await expect(
        fetchBlob(`/api/blobs/recordings/${VALID_UUID}`),
      ).rejects.toThrow(BlobFetchError);
      await expect(
        fetchBlob(`/api/blobs/recordings/${VALID_UUID}`),
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("resolver throwing", () => {
    it("throws BlobFetchError 500 when resolver throws", async () => {
      const resolver = fakeResolver(() => {
        throw new Error("DB exploded");
      });
      setEngineBlobResolver(resolver);

      await expect(
        fetchBlob(`/api/blobs/recordings/${VALID_UUID}`),
      ).rejects.toThrow(BlobFetchError);
      await expect(
        fetchBlob(`/api/blobs/recordings/${VALID_UUID}`),
      ).rejects.toMatchObject({ status: 500 });
    });
  });

  describe("abort signal", () => {
    it("rejects with abort reason when signal is already aborted", async () => {
      const resolver = fakeResolver(() => Promise.resolve(new Uint8Array([1])));
      setEngineBlobResolver(resolver);

      const controller = new AbortController();
      const reason = new DOMException("Aborted", "AbortError");
      controller.abort(reason);

      await expect(
        fetchBlob(`/api/blobs/recordings/${VALID_UUID}`, controller.signal),
      ).rejects.toBe(reason);
    });

    it("rejects with abort reason when aborted during resolution", async () => {
      const controller = new AbortController();
      const reason = new DOMException("Aborted", "AbortError");

      // Resolver that aborts mid-flight
      const resolver = fakeResolver(async () => {
        controller.abort(reason);
        return new Uint8Array([1]);
      });
      setEngineBlobResolver(resolver);

      await expect(
        fetchBlob(`/api/blobs/recordings/${VALID_UUID}`, controller.signal),
      ).rejects.toBe(reason);
    });
  });

  describe("pre-boot behavior", () => {
    it("throws DemoBlobResolverNotReadyError before setEngineBlobResolver", async () => {
      await expect(
        fetchBlob(`/api/blobs/recordings/${VALID_UUID}`),
      ).rejects.toThrow(DemoBlobResolverNotReadyError);
    });

    it("awaits a pending resolver promise before resolving", async () => {
      const data = new Uint8Array([42]);
      let resolveResolver: (v: DemoBlobResolver) => void = () => {
        // Replaced synchronously by the Promise executor below.
      };
      const pending = new Promise<DemoBlobResolver>((r) => {
        resolveResolver = r;
      });

      setEngineBlobResolver(pending);

      const callPromise = fetchBlob(`/api/blobs/recordings/${VALID_UUID}`);

      // Resolver hasn't resolved yet, so the call is still pending
      const raceResult = await Promise.race([
        callPromise.then(() => "resolved" as const),
        new Promise<"pending">((r) =>
          setTimeout(() => {
            r("pending");
          }, 50),
        ),
      ]);
      expect(raceResult).toBe("pending");

      // Now resolve the resolver
      resolveResolver(fakeResolver(() => Promise.resolve(data)));

      const result = await callPromise;
      expect(new Uint8Array(result)).toEqual(data);
    });
  });
});
