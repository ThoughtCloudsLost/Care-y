import { describe, expect, it } from "vitest";
import { encodeBase32Lower } from "./base32.js";

describe("encodeBase32Lower", () => {
  it("encodes an empty buffer to empty string", () => {
    expect(encodeBase32Lower(Buffer.alloc(0))).toBe("");
  });

  it("encodes known test vectors (RFC 4648, lowercased)", () => {
    // RFC 4648 section 10 test vectors (with lowercase output, no padding)
    expect(encodeBase32Lower(Buffer.from("f"))).toBe("my");
    expect(encodeBase32Lower(Buffer.from("fo"))).toBe("mzxq");
    expect(encodeBase32Lower(Buffer.from("foo"))).toBe("mzxw6");
    expect(encodeBase32Lower(Buffer.from("foob"))).toBe("mzxw6yq");
    expect(encodeBase32Lower(Buffer.from("fooba"))).toBe("mzxw6ytb");
    expect(encodeBase32Lower(Buffer.from("foobar"))).toBe("mzxw6ytboi");
  });

  it("encodes 16 random bytes to exactly 26 characters", () => {
    const buf = Buffer.from("0123456789abcdef", "hex");
    const result = encodeBase32Lower(buf);
    // 8 bytes = ceil(8*8/5) = 13 chars
    expect(result).toHaveLength(13);

    // 16 bytes = ceil(16*8/5) = 26 chars
    const buf16 = Buffer.alloc(16);
    buf16.fill(0xab);
    const result16 = encodeBase32Lower(buf16);
    expect(result16).toHaveLength(26);
  });

  it("produces only lowercase alphanumeric characters (a-z, 2-7)", () => {
    const buf = Buffer.alloc(16);
    for (let i = 0; i < 16; i++) buf[i] = i * 17; // spread across byte range
    const result = encodeBase32Lower(buf);
    expect(result).toMatch(/^[a-z2-7]+$/);
  });
});
