/**
 * Audio file magic byte validator for greeting uploads.
 *
 * Verifies that uploaded audio data matches known signatures for
 * WAV, MP3, and OGG formats. Prevents content-type spoofing
 * (declaring audio/mpeg but sending HTML, which could enable
 * stored XSS if the serving endpoint echoes it back).
 */

import type { GreetingAudioContentType } from "@care-y/shared";

const AUDIO_MAGIC_BYTES: readonly {
  readonly contentType: GreetingAudioContentType;
  readonly offset: number;
  readonly bytes: readonly number[];
}[] = [
  // WAV: RIFF header
  { contentType: "audio/wav", offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
  // MP3: ID3 tag
  { contentType: "audio/mpeg", offset: 0, bytes: [0x49, 0x44, 0x33] },
  // MP3: MPEG sync word (no ID3 tag, layer 3)
  { contentType: "audio/mpeg", offset: 0, bytes: [0xff, 0xfb] },
  // MP3: MPEG sync word (layer 3, alternate)
  { contentType: "audio/mpeg", offset: 0, bytes: [0xff, 0xf3] },
  // MP3: MPEG sync word (layer 3, alternate)
  { contentType: "audio/mpeg", offset: 0, bytes: [0xff, 0xf2] },
  // OGG: OggS header
  { contentType: "audio/ogg", offset: 0, bytes: [0x4f, 0x67, 0x67, 0x53] },
];

/**
 * Validates that the buffer's magic bytes match the declared content type.
 * Returns the verified content type, or null if no match.
 */
export function validateAudioMagicBytes(
  data: Buffer,
  declaredType: GreetingAudioContentType,
): GreetingAudioContentType | null {
  for (const sig of AUDIO_MAGIC_BYTES) {
    if (sig.contentType !== declaredType) continue;
    if (data.length < sig.offset + sig.bytes.length) continue;

    const expected = Buffer.from(sig.bytes);
    const slice = data.subarray(sig.offset, sig.offset + sig.bytes.length);
    if (slice.equals(expected)) return sig.contentType;
  }
  return null;
}
