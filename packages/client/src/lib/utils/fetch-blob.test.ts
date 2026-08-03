import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchBlob } from "./fetch-blob.js";
import { BlobFetchError } from "$lib/errors.js";

describe("fetchBlob", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns ArrayBuffer on success", async () => {
    const expected = new ArrayBuffer(8);
    new Uint8Array(expected).set([1, 2, 3, 4, 5, 6, 7, 8]);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(expected),
      }),
    );

    const result = await fetchBlob("/api/blobs/recordings/abc");
    expect(result).toBe(expected);
    expect(fetch).toHaveBeenCalledWith("/api/blobs/recordings/abc", {
      credentials: "include",
      signal: undefined,
    });
  });

  it("passes signal to fetch", async () => {
    const ac = new AbortController();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      }),
    );

    await fetchBlob("/api/blobs/attachments/xyz", ac.signal);
    expect(fetch).toHaveBeenCalledWith("/api/blobs/attachments/xyz", {
      credentials: "include",
      signal: ac.signal,
    });
  });

  it("throws BlobFetchError on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 403 }),
    );

    await expect(fetchBlob("/api/blobs/kb-attachments/123")).rejects.toThrow(
      BlobFetchError,
    );
    await expect(
      fetchBlob("/api/blobs/kb-attachments/123"),
    ).rejects.toMatchObject({ status: 403 });
  });
});
