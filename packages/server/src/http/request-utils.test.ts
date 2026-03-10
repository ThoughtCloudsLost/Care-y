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
import { extractClientIp } from "./request-utils.js";

function mockReq(
  headers: Record<string, string | undefined>,
  remoteAddress?: string | undefined,
): IncomingMessage {
  const socket = new Socket();
  if (remoteAddress !== undefined) {
    Object.defineProperty(socket, "remoteAddress", {
      value: remoteAddress,
      writable: true,
    });
  }

  const req = Object.create(IncomingMessage.prototype) as IncomingMessage;
  Object.defineProperty(req, "socket", { value: socket, writable: false });

  // Filter out undefined values so they don't appear as string "undefined".
  const cleanHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    if (v !== undefined) cleanHeaders[k] = v;
  }
  Object.defineProperty(req, "headers", {
    value: cleanHeaders,
    writable: true,
  });
  return req;
}

describe("extractClientIp", () => {
  it("returns the first IP from X-Forwarded-For", () => {
    const req = mockReq({ "x-forwarded-for": "203.0.113.42" }, "10.0.0.1");
    expect(extractClientIp(req)).toBe("203.0.113.42");
  });

  it("returns the leftmost IP from chained proxies", () => {
    const req = mockReq(
      { "x-forwarded-for": "203.0.113.42, 10.0.0.1, 172.16.0.1" },
      "10.0.0.1",
    );
    expect(extractClientIp(req)).toBe("203.0.113.42");
  });

  it("trims whitespace from the forwarded IP", () => {
    const req = mockReq(
      { "x-forwarded-for": "  203.0.113.42  , 10.0.0.1" },
      "10.0.0.1",
    );
    expect(extractClientIp(req)).toBe("203.0.113.42");
  });

  it("falls back to socket.remoteAddress when X-Forwarded-For is absent", () => {
    const req = mockReq({}, "192.168.1.100");
    expect(extractClientIp(req)).toBe("192.168.1.100");
  });

  it("falls back to socket.remoteAddress when X-Forwarded-For is empty", () => {
    const req = mockReq({ "x-forwarded-for": "" }, "192.168.1.100");
    expect(extractClientIp(req)).toBe("192.168.1.100");
  });

  it("falls back to socket.remoteAddress when first entry is empty after split", () => {
    const req = mockReq({ "x-forwarded-for": ", 10.0.0.1" }, "192.168.1.100");
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
