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
import {
  extractClientIp,
  configureTrustedProxies,
  _resetTrustedProxies,
} from "./request-utils.js";

afterEach(() => {
  _resetTrustedProxies();
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

    it("returns the client IP when every intermediate hop is configured", () => {
      configureTrustedProxies("10.0.0.1,172.16.0.1");

      const req = mockReq({
        headers: { "x-forwarded-for": "203.0.113.42, 10.0.0.1, 172.16.0.1" },
        remoteAddress: "127.0.0.1",
      });
      expect(extractClientIp(req)).toBe("203.0.113.42");
    });

    it("stops at the nearest hop that is not a configured proxy", () => {
      // 172.16.0.1 was never declared trusted, so nothing it forwarded
      // can be attributed and the walk stops there.
      const req = mockReq({
        headers: { "x-forwarded-for": "203.0.113.42, 10.0.0.1, 172.16.0.1" },
        remoteAddress: "127.0.0.1",
      });
      expect(extractClientIp(req)).toBe("172.16.0.1");
    });

    it("trims whitespace from the forwarded IP", () => {
      configureTrustedProxies("10.0.0.1");

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

    it("skips empty entries rather than treating them as an address", () => {
      const req = mockReq({
        headers: { "x-forwarded-for": ", 10.0.0.1" },
        remoteAddress: "127.0.0.1",
      });
      expect(extractClientIp(req)).toBe("10.0.0.1");
    });

    it("falls back to the socket address when every hop is a configured proxy", () => {
      configureTrustedProxies("10.0.0.1,172.16.0.1");

      const req = mockReq({
        headers: { "x-forwarded-for": "10.0.0.1, 172.16.0.1" },
        remoteAddress: "127.0.0.1",
      });
      expect(extractClientIp(req)).toBe("127.0.0.1");
    });
  });

  describe("forwarded-header spoofing", () => {
    it("ignores an attacker-supplied address the edge proxy appended to", () => {
      // The caller sends X-Forwarded-For: 8.8.8.8. A proxy that appends
      // rather than replaces leaves that value leftmost and adds the real
      // address after it. Reading leftmost would return the caller's
      // choice and let them pick their own rate-limit bucket.
      configureTrustedProxies("10.0.0.1");

      const req = mockReq({
        headers: { "x-forwarded-for": "8.8.8.8, 203.0.113.42" },
        remoteAddress: "10.0.0.1",
      });
      expect(extractClientIp(req)).toBe("203.0.113.42");
    });

    it("ignores a chain of fabricated hops", () => {
      configureTrustedProxies("10.0.0.1");

      const req = mockReq({
        headers: {
          "x-forwarded-for": "1.1.1.1, 2.2.2.2, 3.3.3.3, 203.0.113.42",
        },
        remoteAddress: "10.0.0.1",
      });
      expect(extractClientIp(req)).toBe("203.0.113.42");
    });
  });

  describe("IPv4-mapped IPv6 normalization", () => {
    it("matches a configured IPv4 proxy against its mapped IPv6 form", () => {
      configureTrustedProxies("10.0.0.5");

      const req = mockReq({
        headers: { "x-forwarded-for": "203.0.113.42" },
        remoteAddress: "::ffff:10.0.0.5",
      });
      expect(extractClientIp(req)).toBe("203.0.113.42");
    });

    it("matches a mapped IPv6 configuration entry against an IPv4 peer", () => {
      configureTrustedProxies("::ffff:10.0.0.5");

      const req = mockReq({
        headers: { "x-forwarded-for": "203.0.113.42" },
        remoteAddress: "10.0.0.5",
      });
      expect(extractClientIp(req)).toBe("203.0.113.42");
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

  describe("configured trusted proxies", () => {
    it("honors XFF when peer is a configured proxy", () => {
      configureTrustedProxies("10.0.0.1,10.0.0.2");

      const req = mockReq({
        headers: { "x-forwarded-for": "203.0.113.42" },
        remoteAddress: "10.0.0.1",
      });
      expect(extractClientIp(req)).toBe("203.0.113.42");
    });

    it("ignores XFF when peer is not a configured proxy", () => {
      configureTrustedProxies("10.0.0.1");

      const req = mockReq({
        headers: { "x-forwarded-for": "203.0.113.42" },
        remoteAddress: "10.0.0.99",
      });
      expect(extractClientIp(req)).toBe("10.0.0.99");
    });

    it("still trusts loopback when proxies are configured", () => {
      configureTrustedProxies("10.0.0.1");

      const req = mockReq({
        headers: { "x-forwarded-for": "203.0.113.42" },
        remoteAddress: "127.0.0.1",
      });
      expect(extractClientIp(req)).toBe("203.0.113.42");
    });

    it("trusts only loopback when the configured value is empty", () => {
      configureTrustedProxies("");

      const req = mockReq({
        headers: { "x-forwarded-for": "203.0.113.42" },
        remoteAddress: "10.0.0.1",
      });
      expect(extractClientIp(req)).toBe("10.0.0.1");
    });

    it("trusts only loopback when the configured value is absent", () => {
      configureTrustedProxies(undefined);

      const req = mockReq({
        headers: { "x-forwarded-for": "203.0.113.42" },
        remoteAddress: "10.0.0.1",
      });
      expect(extractClientIp(req)).toBe("10.0.0.1");
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
