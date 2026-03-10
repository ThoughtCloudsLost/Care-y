/**
 * Unit tests for HTTP request utilities.
 *
 * Covers all branches of extractClientIp: X-Forwarded-For (single IP,
 * chained proxies, empty value, whitespace-only), socket.remoteAddress
 * fallback, and the "unknown" default.
 */

import { describe, it, expect } from "vitest";
import { IncomingMessage } from "node:http";
import { Socket } from "node:net";
import { mockReq } from "../test-utils.js";
import { extractClientIp } from "./request-utils.js";

describe("extractClientIp", () => {
  it("returns the first IP from X-Forwarded-For", () => {
    const req = mockReq({
      headers: { "x-forwarded-for": "203.0.113.42" },
      remoteAddress: "10.0.0.1",
    });
    expect(extractClientIp(req)).toBe("203.0.113.42");
  });

  it("returns the leftmost IP from chained proxies", () => {
    const req = mockReq({
      headers: { "x-forwarded-for": "203.0.113.42, 10.0.0.1, 172.16.0.1" },
      remoteAddress: "10.0.0.1",
    });
    expect(extractClientIp(req)).toBe("203.0.113.42");
  });

  it("trims whitespace from the forwarded IP", () => {
    const req = mockReq({
      headers: { "x-forwarded-for": "  203.0.113.42  , 10.0.0.1" },
      remoteAddress: "10.0.0.1",
    });
    expect(extractClientIp(req)).toBe("203.0.113.42");
  });

  it("falls back to socket.remoteAddress when X-Forwarded-For is absent", () => {
    const req = mockReq({ remoteAddress: "192.168.1.100" });
    expect(extractClientIp(req)).toBe("192.168.1.100");
  });

  it("falls back to socket.remoteAddress when X-Forwarded-For is empty", () => {
    const req = mockReq({
      headers: { "x-forwarded-for": "" },
      remoteAddress: "192.168.1.100",
    });
    expect(extractClientIp(req)).toBe("192.168.1.100");
  });

  it("falls back to socket.remoteAddress when first entry is empty after split", () => {
    const req = mockReq({
      headers: { "x-forwarded-for": ", 10.0.0.1" },
      remoteAddress: "192.168.1.100",
    });
    expect(extractClientIp(req)).toBe("192.168.1.100");
  });

  it("returns 'unknown' when neither header nor socket address exists", () => {
    const socket = new Socket();
    // Socket.remoteAddress is undefined before connection.
    const req = Object.create(IncomingMessage.prototype) as IncomingMessage;
    Object.defineProperty(req, "socket", { value: socket, writable: false });
    Object.defineProperty(req, "headers", { value: {}, writable: true });

    expect(extractClientIp(req)).toBe("unknown");
  });
});
