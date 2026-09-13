import { describe, it, expect } from "vitest";
import { NO_STORE_CACHE_CONTROL, withNoStore } from "./response-headers.js";

describe("response-headers", () => {
  describe("NO_STORE_CACHE_CONTROL", () => {
    it("forbids storing in any cache (no-store) and shared reuse (private)", () => {
      const directives = NO_STORE_CACHE_CONTROL.split(",").map((d) => d.trim());
      expect(directives).toContain("no-store");
      expect(directives).toContain("private");
    });
  });

  describe("withNoStore", () => {
    it("adds Cache-Control while preserving every existing header", () => {
      const cors = {
        "Access-Control-Allow-Origin": "https://example.org",
        "Access-Control-Allow-Credentials": "true",
      };
      const merged = withNoStore(cors);
      expect(merged).toEqual({
        ...cors,
        "Cache-Control": NO_STORE_CACHE_CONTROL,
      });
    });

    it("does not mutate the input header map", () => {
      const input: Record<string, string> = { "X-Test": "1" };
      withNoStore(input);
      expect(input).toEqual({ "X-Test": "1" });
    });

    it("overrides a caller-supplied Cache-Control with the no-store value", () => {
      const merged = withNoStore({ "Cache-Control": "public, max-age=300" });
      expect(merged["Cache-Control"]).toBe(NO_STORE_CACHE_CONTROL);
    });
  });
});
