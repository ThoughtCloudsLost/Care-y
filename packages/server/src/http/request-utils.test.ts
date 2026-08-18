/**
 * Unit tests for HTTP request utilities.
 *
 * Covers all branches of extractClientIp: trusted-proxy gate,
 * X-Forwarded-For (single IP, chained proxies, empty value,
 * whitespace-only), socket.remoteAddress fallback, the "unknown"
 * default, and TRUSTED_PROXIES env var support.
 */

import { describe, it, expect, afterEach } from "vitest";
import { IncomingMessage } from "node:http";
import { Socket } from "node:net";
import { mockReq } from "../test-utils.js";
import { extractClientIp, _resetTrustedProxiesCache } from "./request-utils.js";

afterEach(() => {
  delete process.env.TRUSTED_PROXIES;
  _resetTrustedProxiesCache();
});

describe("extractClientIp", () => {
  describe("trusted peer (loopback)", () => {
    it("returns the first IP from X-Forwarded-For when peer is loopback", () => {
      const req = mockReq({
        headers: { "x-forwarded-for": "203.0.113.42" },
        remoteAddress: "127.0.0.1",
      });
      expect(extractClientIp(req)).toBe("203.0.113.42");
    });

    it("returns the leftmost IP from chained proxies when peer is loopback", () => {
      const req = mockReq({
        headers: { "x-forwarded-for": "203.0.113.42, 10.0.0.1, 172.16.0.1" },
        remoteAddress: "127.0.0.1",
      });
      expect(extractClientIp(req)).toBe("203.0.113.42");
    });

    it("trims whitespace from the forwarded IP", () => {
      const req = mockReq({
        headers: { "x-forwarded-for": "  203.0.113.42  , 10.0.0.1" },
        remoteAddress: "127.0.0.1",
      });
      expect(extractClientIp(req)).toBe("203.0.113.42");
    });

    it("honors XFF from IPv6 loopback peer (::1)", () => {
      const req = mockReq({
        headers: { "x-forwarded-for": "203.0.113.42" },
        remoteAddress: "::1",
      });
      expect(extractClientIp(req)).toBe("203.0.113.42");
    });

    it("honors XFF from IPv4-mapped IPv6 loopback (::ffff:127.0.0.1)", () => {
      const req = mockReq({
        headers: { "x-forwarded-for": "203.0.113.42" },
        remoteAddress: "::ffff:127.0.0.1",
      });
      expect(extractClientIp(req)).toBe("203.0.113.42");
    });

    it("falls back to socket address when XFF is absent", () => {
      const req = mockReq({ remoteAddress: "127.0.0.1" });
      expect(extractClientIp(req)).toBe("127.0.0.1");
    });

    it("falls back to socket address when XFF is empty", () => {
      const req = mockReq({
        headers: { "x-forwarded-for": "" },
        remoteAddress: "127.0.0.1",
      });
      expect(extractClientIp(req)).toBe("127.0.0.1");
    });

    it("falls back to socket address when first XFF entry is empty after split", () => {
      const req = mockReq({
        headers: { "x-forwarded-for": ", 10.0.0.1" },
        remoteAddress: "127.0.0.1",
      });
      expect(extractClientIp(req)).toBe("127.0.0.1");
    });
  });

  describe("untrusted peer", () => {
    it("ignores spoofed XFF from an untrusted peer and returns socket address", () => {
      const req = mockReq({
        headers: { "x-forwarded-for": "1.2.3.4" },
        remoteAddress: "10.0.0.99",
      });
      expect(extractClientIp(req)).toBe("10.0.0.99");
    });

    it("returns socket address when peer is untrusted even with chained XFF", () => {
      const req = mockReq({
        headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
        remoteAddress: "192.168.1.50",
      });
      expect(extractClientIp(req)).toBe("192.168.1.50");
    });
  });

  describe("TRUSTED_PROXIES env var", () => {
    it("honors XFF when peer is listed in TRUSTED_PROXIES", () => {
      process.env.TRUSTED_PROXIES = "10.0.0.1,10.0.0.2";
      _resetTrustedProxiesCache();

      const req = mockReq({
        headers: { "x-forwarded-for": "203.0.113.42" },
        remoteAddress: "10.0.0.1",
      });
      expect(extractClientIp(req)).toBe("203.0.113.42");
    });

    it("ignores XFF when peer is not in TRUSTED_PROXIES", () => {
      process.env.TRUSTED_PROXIES = "10.0.0.1";
      _resetTrustedProxiesCache();

      const req = mockReq({
        headers: { "x-forwarded-for": "203.0.113.42" },
        remoteAddress: "10.0.0.99",
      });
      expect(extractClientIp(req)).toBe("10.0.0.99");
    });

    it("still trusts loopback even when TRUSTED_PROXIES is set", () => {
      process.env.TRUSTED_PROXIES = "10.0.0.1";
      _resetTrustedProxiesCache();

      const req = mockReq({
        headers: { "x-forwarded-for": "203.0.113.42" },
        remoteAddress: "127.0.0.1",
      });
      expect(extractClientIp(req)).toBe("203.0.113.42");
    });
  });

  describe("edge cases", () => {
    it("returns 'unknown' when neither header nor socket address exists", () => {
      const socket = new Socket();
      // Socket.remoteAddress is undefined before connection.
      const req = Object.create(IncomingMessage.prototype) as IncomingMessage;
      Object.defineProperty(req, "socket", { value: socket, writable: false });
      Object.defineProperty(req, "headers", { value: {}, writable: true });

      expect(extractClientIp(req)).toBe("unknown");
    });
  });
});
