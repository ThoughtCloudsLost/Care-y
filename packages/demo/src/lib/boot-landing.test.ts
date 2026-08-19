import { describe, it, expect } from "vitest";
import { splashCovers } from "./boot-landing.js";

describe("splashCovers", () => {
  // -----------------------------------------------------------------
  // Resting state: splash stays up, before and after keying
  // -----------------------------------------------------------------

  it("covers the resting phone before the background login settles", () => {
    expect(splashCovers(false, "login", "login", "init")).toBe(true);
  });

  it("keeps covering the resting phone after keying until a navigation lands", () => {
    // keyedDone alone must not lift the splash: the router is still on
    // the hidden login resting state and nothing was chosen.
    expect(splashCovers(true, "login", "login", "init")).toBe(true);
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
