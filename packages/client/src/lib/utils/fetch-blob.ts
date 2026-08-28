import { BlobFetchError } from "$lib/errors.js";

export async function fetchBlob(
  path: string,
  signal?: AbortSignal,
  headers?: Record<string, string>,
): Promise<ArrayBuffer> {
  const res = await fetch(path, { credentials: "include", signal, headers });
  if (!res.ok) {
    throw new BlobFetchError(res.status);
  }
  return res.arrayBuffer();
}
