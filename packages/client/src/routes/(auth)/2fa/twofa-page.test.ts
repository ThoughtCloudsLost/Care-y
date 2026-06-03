// @vitest-environment jsdom
/**
 * 2FA page redirect test.
 *
 * The /2fa route now redirects to /login unconditionally. 2FA verification
 * is handled inline on the login page (ADR-045). This test verifies the
 * redirect and sessionStorage cleanup.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";

const gotoMock = vi.fn();
vi.mock("$app/navigation", () => ({
  goto: gotoMock,
}));

vi.mock("$app/paths", () => ({
  resolve: (path: string) => path,
  base: "",
  assets: "",
}));

vi.mock("$app/environment", () => ({
  browser: true,
}));

describe("2FA page redirect", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("redirects to /login", async () => {
    const Page = (await import("./+page.svelte")).default;
    render(Page);
    expect(gotoMock).toHaveBeenCalledWith("/login");
  });

  it("cleans up leftover sessionStorage methods", async () => {
    sessionStorage.setItem("care-y-2fa-methods", '["totp"]');
    const Page = (await import("./+page.svelte")).default;
    render(Page);
    expect(sessionStorage.getItem("care-y-2fa-methods")).toBeNull();
    expect(gotoMock).toHaveBeenCalledWith("/login");
  });
});
