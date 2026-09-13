/**
 * Public HTTP handler for serving greeting audio files.
 *
 * Path: /api/greetings/<orgSchema>/<blobKey>
 *
 * Unauthenticated. Greeting audio is inherently public (callers hear it
 * via Twilio <Play>). Blob keys are server-generated UUIDs, not guessable.
 *
 * Security: BlobStore validates key format (assertSafeKey in local.ts).
 * Response includes nosniff and inline disposition headers.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { blobKeySchema } from "@care-y/shared";
import type { BlobStore } from "../storage/store.js";

export interface GreetingAudioHandlerDeps {
  readonly blobStore: BlobStore;
  readonly corsHeaders: Readonly<Record<string, string>>;
}

const CACHE_CONTROL = "public, max-age=604800, immutable";
const PATH_PREFIX = "/api/greetings/";

const AUDIO_SIGNATURES: readonly {
  readonly contentType: string;
  readonly offset: number;
  readonly bytes: readonly number[];
}[] = [
  { contentType: "audio/wav", offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
  { contentType: "audio/mpeg", offset: 0, bytes: [0x49, 0x44, 0x33] },
  { contentType: "audio/mpeg", offset: 0, bytes: [0xff, 0xfb] },
  { contentType: "audio/mpeg", offset: 0, bytes: [0xff, 0xf3] },
  { contentType: "audio/mpeg", offset: 0, bytes: [0xff, 0xf2] },
  { contentType: "audio/ogg", offset: 0, bytes: [0x4f, 0x67, 0x67, 0x53] },
];

function detectAudioContentType(data: Buffer): string {
  for (const sig of AUDIO_SIGNATURES) {
    if (data.length < sig.offset + sig.bytes.length) continue;
    const expected = Buffer.from(sig.bytes);
    const slice = data.subarray(sig.offset, sig.offset + sig.bytes.length);
    if (slice.equals(expected)) return sig.contentType;
  }
  return "application/octet-stream";
}

export function createGreetingAudioHandler(
  deps: GreetingAudioHandlerDeps,
): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  const { blobStore, corsHeaders } = deps;

  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method !== "GET") {
      res.writeHead(405, { Allow: "GET" });
      res.end();
      return;
    }

    const url = req.url ?? "";
    if (!url.startsWith(PATH_PREFIX)) {
      res.writeHead(404);
      res.end();
      return;
    }

    // Blob key is everything after the prefix (e.g. "org_test/greeting/uuid")
    const rawKey = decodeURIComponent(url.slice(PATH_PREFIX.length));
    const keyResult = blobKeySchema.safeParse(rawKey);
    if (!keyResult.success) {
      res.writeHead(404);
      res.end();
      return;
    }

    try {
      const blob = await blobStore.get(keyResult.data);
      if (blob === null) {
        res.writeHead(404);
        res.end();
        return;
      }

      const contentType = detectAudioContentType(blob);

      res.writeHead(200, {
        ...corsHeaders,
        "Content-Type": contentType,
        "Content-Length": String(blob.length),
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": CACHE_CONTROL,
      });
      res.end(blob);
    } catch {
      res.writeHead(500);
      res.end();
    }
  };
}
