/**
 * Client-side audio format conversion for greeting uploads.
 *
 * Twilio's <Play> verb supports WAV, MP3, OGG, AIFF, GSM, and ulaw.
 * iPhones record in M4A (AAC), which Twilio cannot play. This utility
 * decodes any browser-supported audio format via AudioContext and
 * re-encodes as WAV (PCM 16-bit mono), which Twilio handles natively.
 *
 * Mono output is intentional: telephony is mono, and halving the
 * channel count keeps WAV files under the 5MB upload limit for
 * typical greeting lengths (mono 44.1kHz 16-bit = ~5MB per minute).
 */

const TWILIO_NATIVE_TYPES = new Set([
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
]);

const CONVERTIBLE_TYPES = new Set([
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/m4a",
]);

export function needsConversion(mimeType: string): boolean {
  const lower = mimeType.toLowerCase();
  return CONVERTIBLE_TYPES.has(lower) && !TWILIO_NATIVE_TYPES.has(lower);
}

export function isSupportedAudioType(mimeType: string): boolean {
  const lower = mimeType.toLowerCase();
  return TWILIO_NATIVE_TYPES.has(lower) || CONVERTIBLE_TYPES.has(lower);
}

/**
 * Converts an audio file to mono 16-bit PCM WAV via the Web Audio API.
 * Returns a new File with audio/wav content type.
 */
export async function convertToWav(file: File): Promise<File> {
  const arrayBuf = await file.arrayBuffer();
  const ctx = new AudioContext();

  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuf);
    const wavBlob = encodeWav(audioBuffer);
    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([wavBlob], `${baseName}.wav`, { type: "audio/wav" });
  } finally {
    await ctx.close();
  }
}

function encodeWav(buffer: AudioBuffer): Blob {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;

  // Mix down to mono
  const samples = buffer.getChannelData(0);
  if (buffer.numberOfChannels > 1) {
    const right = buffer.getChannelData(1);
    for (const [i, leftSample] of samples.entries()) {
      // eslint-disable-next-line security/detect-object-injection -- Float32Array numeric index from .entries(), not user input
      samples[i] = (leftSample + (right.at(i) ?? 0)) / 2;
    }
  }

  const dataLength = samples.length * bytesPerSample;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const buf = new ArrayBuffer(totalLength);
  const view = new DataView(buf);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, "WAVE");

  // fmt subchunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data subchunk
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  // PCM samples (float32 to int16)
  let offset = 44;
  for (const sample of samples) {
    const s = Math.max(-1, Math.min(1, sample));
    const int16 = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  return new Blob([buf], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
