import { describe, it, expect } from "vitest";
import {
  parseCookies,
  buildSessionCookie,
  buildClearSessionCookie,
} from "./cookies.js";
import { SESSION_COOKIE_NAME } from "./service.js";

describe("parseCookies", () => {
  it("parses standard cookies", () => {
    const cookies = parseCookies("foo=bar; baz=qux");
    expect(cookies.get("foo")).toBe("bar");
    expect(cookies.get("baz")).toBe("qux");
  });

  it("returns empty map for null header", () => {
    expect(parseCookies(null).size).toBe(0);
  });

  it("returns empty map for undefined header", () => {
    expect(parseCookies(undefined).size).toBe(0);
  });

  it("returns empty map for empty string", () => {
    expect(parseCookies("").size).toBe(0);
  });

  it("handles values containing =", () => {
    const cookies = parseCookies("token=abc=def=ghi");
    expect(cookies.get("token")).toBe("abc=def=ghi");
  });

  it("trims whitespace from names and values", () => {
    const cookies = parseCookies("  foo  =  bar  ;  baz  =  qux  ");
    expect(cookies.get("foo")).toBe("bar");
    expect(cookies.get("baz")).toBe("qux");
  });

  it("skips pairs without =", () => {
    const cookies = parseCookies("valid=yes; garbage; also=fine");
    expect(cookies.size).toBe(2);
    expect(cookies.get("valid")).toBe("yes");
    expect(cookies.get("also")).toBe("fine");
  });

  it("skips pairs with empty name", () => {
    const cookies = parseCookies("=noname; real=value");
    expect(cookies.size).toBe(1);
    expect(cookies.get("real")).toBe("value");
  });
});

describe("buildSessionCookie", () => {
  it("includes all required attributes", () => {
    const cookie = buildSessionCookie("abc123", 3600, false);
    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=abc123`);
    expect(cookie).toContain("Max-Age=3600");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
  });

  it("adds Secure flag when isSecure is true", () => {
    const cookie = buildSessionCookie("abc123", 3600, true);
    expect(cookie).toContain("Secure");
  });

  it("omits Secure flag when isSecure is false", () => {
    const cookie = buildSessionCookie("abc123", 3600, false);
    expect(cookie).not.toContain("Secure");
  });

  it("uses semicolon-space separator", () => {
    const cookie = buildSessionCookie("tok", 100, false);
    const parts = cookie.split("; ");
    expect(parts.length).toBeGreaterThanOrEqual(5);
  });
});

describe("buildClearSessionCookie", () => {
  it("sets Max-Age=0 to expire the cookie", () => {
    const cookie = buildClearSessionCookie();
    expect(cookie).toContain("Max-Age=0");
  });

  it("uses the session cookie name", () => {
    const cookie = buildClearSessionCookie();
    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=`);
  });

  it("includes HttpOnly and SameSite=Strict", () => {
    const cookie = buildClearSessionCookie();
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
  });
});
