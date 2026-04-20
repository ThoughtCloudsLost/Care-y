import { describe, it, expect } from "vitest";
import { validateAudioMagicBytes } from "./audio-validator.js";

describe("validateAudioMagicBytes", () => {
  it("accepts WAV files (RIFF header)", () => {
    const wav = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00]);
    expect(validateAudioMagicBytes(wav, "audio/wav")).toBe("audio/wav");
  });

  it("accepts MP3 files (ID3 tag)", () => {
    const mp3 = Buffer.from([0x49, 0x44, 0x33, 0x04, 0x00, 0x00]);
    expect(validateAudioMagicBytes(mp3, "audio/mpeg")).toBe("audio/mpeg");
  });

  it("accepts MP3 files (sync word 0xff 0xfb)", () => {
    const mp3 = Buffer.from([0xff, 0xfb, 0x90, 0x00]);
    expect(validateAudioMagicBytes(mp3, "audio/mpeg")).toBe("audio/mpeg");
  });

  it("accepts OGG files (OggS header)", () => {
    const ogg = Buffer.from([0x4f, 0x67, 0x67, 0x53, 0x00, 0x00]);
    expect(validateAudioMagicBytes(ogg, "audio/ogg")).toBe("audio/ogg");
  });

  it("rejects mismatched content type", () => {
    const wav = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00]);
    expect(validateAudioMagicBytes(wav, "audio/mpeg")).toBeNull();
  });

  it("rejects random bytes", () => {
    const random = Buffer.from([0x00, 0x01, 0x02, 0x03]);
    expect(validateAudioMagicBytes(random, "audio/wav")).toBeNull();
    expect(validateAudioMagicBytes(random, "audio/mpeg")).toBeNull();
    expect(validateAudioMagicBytes(random, "audio/ogg")).toBeNull();
  });

  it("rejects empty buffer", () => {
    const empty = Buffer.alloc(0);
    expect(validateAudioMagicBytes(empty, "audio/wav")).toBeNull();
  });

  it("rejects buffer too short for signature", () => {
    const short = Buffer.from([0x52]);
    expect(validateAudioMagicBytes(short, "audio/wav")).toBeNull();
  });
});
