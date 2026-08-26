import { describe, it, expect } from "vitest";
import { createPortalUpgrade } from "./create-portal-upgrade.svelte.js";

describe("createPortalUpgrade", () => {
  it("starts in initial state", () => {
    const upgrade = createPortalUpgrade();

    expect(upgrade.dismissed).toBe(false);
    expect(upgrade.expanded).toBe(false);
    expect(upgrade.pending).toBe(false);
    expect(upgrade.error).toBe("");
    expect(upgrade.success).toBe(false);
    expect(upgrade.username).toBe("");
  });

  it("dismiss sets dismissed to true", () => {
    const upgrade = createPortalUpgrade();

    upgrade.dismiss();

    expect(upgrade.dismissed).toBe(true);
  });

  it("expand sets expanded to true", () => {
    const upgrade = createPortalUpgrade();

    upgrade.expand();

    expect(upgrade.expanded).toBe(true);
  });

  it("dismiss and expand are independent", () => {
    const upgrade = createPortalUpgrade();

    upgrade.expand();
    expect(upgrade.expanded).toBe(true);
    expect(upgrade.dismissed).toBe(false);

    upgrade.dismiss();
    expect(upgrade.dismissed).toBe(true);
    expect(upgrade.expanded).toBe(true);
  });
});
