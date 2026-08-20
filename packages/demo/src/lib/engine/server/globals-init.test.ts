import { describe, it, expect } from "vitest";
import { Buffer } from "buffer";
import { toBase64Url, fromBase64Url } from "./globals-init.js";

describe("base64url mapping", () => {
  it("maps the url-unsafe alphabet and strips padding", () => {
    // 0xfb 0xef 0xbe encodes to "++++" / 0xff 0xff to "//8=" in standard base64
    expect(
      toBase64Url(Buffer.from([0xfb, 0xef, 0xbe]).toString("base64")),
    ).toBe("----");
    expect(toBase64Url(Buffer.from([0xff, 0xff]).toString("base64"))).toBe(
      "__8",
    );
  });

  it("round-trips arbitrary bytes through both directions", () => {
    const bytes = Buffer.from([0, 1, 2, 250, 251, 252, 253, 254, 255, 62, 63]);
    const url = toBase64Url(bytes.toString("base64"));
    const back = Buffer.from(fromBase64Url(url), "base64");
    expect(back.equals(bytes)).toBe(true);
  });

  it("restores padding for every remainder class", () => {
    expect(fromBase64Url("YQ")).toBe("YQ==");
    expect(fromBase64Url("YWI")).toBe("YWI=");
    expect(fromBase64Url("YWJj")).toBe("YWJj");
  });

  it("leaves the runtime Buffer able to speak base64url", () => {
    // After globals-init evaluates, both directions must work on the
    // ambient Buffer class regardless of whether the polyfill needed
    // the patch (Node's builtin passes through untouched).
    expect(Buffer.from("abc").toString("base64url")).toBe("YWJj");
    expect(Buffer.from("YWJj", "base64url").toString("utf8")).toBe("abc");
  });
});
