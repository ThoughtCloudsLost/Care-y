import { describe, it, expect } from "vitest";
import { isValidHexColor } from "./color-utils";

describe("isValidHexColor", () => {
  it("accepts valid 6-digit hex colors", () => {
    expect(isValidHexColor("#FF5C35")).toBe(true);
    expect(isValidHexColor("#000000")).toBe(true);
    expect(isValidHexColor("#ffffff")).toBe(true);
    expect(isValidHexColor("#abcdef")).toBe(true);
  });

  it("rejects named colors", () => {
    expect(isValidHexColor("red")).toBe(false);
    expect(isValidHexColor("blue")).toBe(false);
  });

  it("rejects 3-digit hex shorthand", () => {
    expect(isValidHexColor("#FFF")).toBe(false);
    expect(isValidHexColor("#abc")).toBe(false);
  });

  it("rejects url() and CSS expressions", () => {
    expect(isValidHexColor("url(evil)")).toBe(false);
    expect(isValidHexColor("expression(alert(1))")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidHexColor("")).toBe(false);
  });

  it("rejects hex without hash", () => {
    expect(isValidHexColor("FF5C35")).toBe(false);
  });

  it("rejects 8-digit hex (with alpha)", () => {
    expect(isValidHexColor("#FF5C35FF")).toBe(false);
  });
});
