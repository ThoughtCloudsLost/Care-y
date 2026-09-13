import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { encodeFileKeyPayload, decodeFileKeyPayload } from "./attachment.js";
import { generateContentKey } from "./content.js";
import { toSymmetricKey } from "./types.js";
import { InvalidInputError } from "./errors.js";
import { getSodium, _resetSodiumForTesting } from "./sodium.js";
import { FC_LIGHT } from "./fc-config.js";

const textEncoder = new TextEncoder();

describe("file key payload", () => {
  beforeAll(async () => {
    _resetSodiumForTesting();
    await getSodium();
  });

  it("roundtrips a key and a filename", () => {
    const fileKey = generateContentKey();
    const encoded = encodeFileKeyPayload(fileKey, "scan of the letter.pdf");
    const decoded = decodeFileKeyPayload(encoded);

    expect(decoded.fileKey).toEqual(fileKey);
    expect(decoded.filename).toBe("scan of the letter.pdf");
  });

  it("survives a filename that is not ASCII", () => {
    const fileKey = generateContentKey();
    const filename = "declaración jurada firmada.pdf";
    const decoded = decodeFileKeyPayload(
      encodeFileKeyPayload(fileKey, filename),
    );

    expect(decoded.filename).toBe(filename);
  });

  it("survives a filename holding JSON punctuation", () => {
    // A name is user-supplied text, so it can contain the characters the
    // encoding itself uses.
    const fileKey = generateContentKey();
    const filename = 'note {"k":"not-a-key"}.txt';
    const decoded = decodeFileKeyPayload(
      encodeFileKeyPayload(fileKey, filename),
    );

    expect(decoded.filename).toBe(filename);
    expect(decoded.fileKey).toEqual(fileKey);
  });

  it("accepts an empty filename", () => {
    const fileKey = generateContentKey();
    expect(
      decodeFileKeyPayload(encodeFileKeyPayload(fileKey, "")).filename,
    ).toBe("");
  });

  it("roundtrips arbitrary filenames (property-based)", () => {
    fc.assert(
      fc.property(fc.string(), (filename: string) => {
        const fileKey = generateContentKey();
        const decoded = decodeFileKeyPayload(
          encodeFileKeyPayload(fileKey, filename),
        );
        return decoded.filename === filename;
      }),
      { numRuns: FC_LIGHT },
    );
  });

  it("roundtrips arbitrary keys (property-based)", () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 32, maxLength: 32 }), (raw) => {
        const fileKey = toSymmetricKey(raw);
        const decoded = decodeFileKeyPayload(
          encodeFileKeyPayload(fileKey, "f.pdf"),
        );
        return decoded.fileKey.every((b, i) => b === raw[i]);
      }),
      { numRuns: FC_LIGHT },
    );
  });

  describe("rejects payloads that cannot open a file", () => {
    it("throws on bytes that are not JSON", () => {
      expect(() =>
        decodeFileKeyPayload(textEncoder.encode("not json at all")),
      ).toThrow(InvalidInputError);
    });

    it("throws on JSON that is not an object", () => {
      expect(() => decodeFileKeyPayload(textEncoder.encode("42"))).toThrow(
        InvalidInputError,
      );
    });

    it("throws on JSON null", () => {
      expect(() => decodeFileKeyPayload(textEncoder.encode("null"))).toThrow(
        InvalidInputError,
      );
    });

    it("throws when the key is missing", () => {
      expect(() =>
        decodeFileKeyPayload(textEncoder.encode('{"n":"f.pdf"}')),
      ).toThrow(InvalidInputError);
    });

    it("throws when the filename is missing", () => {
      expect(() =>
        decodeFileKeyPayload(textEncoder.encode('{"k":"AAAA"}')),
      ).toThrow(InvalidInputError);
    });

    it("throws when the filename is not a string", () => {
      expect(() =>
        decodeFileKeyPayload(textEncoder.encode('{"k":"AAAA","n":7}')),
      ).toThrow(InvalidInputError);
    });

    it("throws when the key decodes to the wrong length", () => {
      // A 31-byte key would otherwise reach the AEAD as a RangeError from
      // deep inside the decrypt call.
      const short = encodeFileKeyPayload(generateContentKey(), "f.pdf");
      const json = JSON.parse(new TextDecoder().decode(short)) as {
        k: string;
        n: string;
      };
      const truncated = textEncoder.encode(
        JSON.stringify({ k: json.k.slice(0, 20), n: json.n }),
      );

      expect(() => decodeFileKeyPayload(truncated)).toThrow(InvalidInputError);
    });

    it("throws when the key is not base64url", () => {
      expect(() =>
        decodeFileKeyPayload(textEncoder.encode('{"k":"!!!!","n":"f.pdf"}')),
      ).toThrow(InvalidInputError);
    });

    it("throws on empty input", () => {
      expect(() => decodeFileKeyPayload(new Uint8Array(0))).toThrow(
        InvalidInputError,
      );
    });
  });
});
