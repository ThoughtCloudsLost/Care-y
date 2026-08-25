import { describe, it, expect } from "vitest";
import { splashCovers } from "./boot-landing.js";

describe("splashCovers", () => {
  // -----------------------------------------------------------------
  // Resting state (origin "init"): splash lifts when keying settles
  // -----------------------------------------------------------------

  it("covers the resting phone before the background login settles", () => {
    expect(splashCovers(false, "login", "login", "init")).toBe(true);
  });

  it("lifts the splash at rest once keying settles, revealing the login form", () => {
    // keyedDone lifts the splash at rest so the login form is the
    // demo's ready state; no navigation needed.
    expect(splashCovers(true, "login", "login", "init")).toBe(false);
  });

  it("covers at init when not keyed regardless of routerFeature", () => {
    expect(splashCovers(false, "tickets", "login", "init")).toBe(true);
    expect(splashCovers(false, "home", "tickets", "init")).toBe(true);
  });

  it("lifts at init when keyed regardless of routerFeature", () => {
    expect(splashCovers(true, "tickets", "login", "init")).toBe(false);
    expect(splashCovers(true, "home", "tickets", "init")).toBe(false);
  });

  // -----------------------------------------------------------------
  // Navigation: splash lifts only when the target screen is showing
  // -----------------------------------------------------------------

  it("keeps covering while a chosen screen has not committed yet", () => {
    // Visitor clicked tickets during boot: location moved, router has
    // not left login yet.
    expect(splashCovers(false, "login", "tickets", "page-click")).toBe(true);
  });

  it("lifts once the router shows the chosen non-login screen", () => {
    expect(splashCovers(true, "tickets", "tickets", "page-click")).toBe(false);
  });

  it("lifts for deep links the same way as clicks", () => {
    expect(splashCovers(true, "tickets", "tickets", "deep-link")).toBe(false);
  });

  // -----------------------------------------------------------------
  // Login section: its screens are the narration
  // -----------------------------------------------------------------

  it("lifts immediately when the visitor chooses the login section", () => {
    expect(splashCovers(false, "login", "login", "page-click")).toBe(false);
    expect(splashCovers(false, "login", "login", "deep-link")).toBe(false);
  });

  it("stays lifted at the login section after keying settles", () => {
    expect(splashCovers(true, "login", "login", "page-scroll")).toBe(false);
  });

  // -----------------------------------------------------------------
  // Failure degradation
  // -----------------------------------------------------------------

  it("lifts after a failed boot once a navigation commits a screen", () => {
    // keyedDone flips on failure too; a committed non-login screen
    // must become visible rather than sitting behind the splash.
    expect(splashCovers(true, "tickets", "tickets", "page-click")).toBe(false);
  });
});
