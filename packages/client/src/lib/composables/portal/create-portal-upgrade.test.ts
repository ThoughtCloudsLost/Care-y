import { describe, it, expect } from "vitest";
import {
  createPortalUpgrade,
  mapUpgradeError,
} from "./create-portal-upgrade.svelte.js";
import { ErrorCode } from "@care-y/shared";

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

  it("dismissing after expanding leaves the form expanded", () => {
    const upgrade = createPortalUpgrade();

    upgrade.expand();
    expect(upgrade.expanded).toBe(true);
    expect(upgrade.dismissed).toBe(false);

    upgrade.dismiss();
    expect(upgrade.dismissed).toBe(true);
    expect(upgrade.expanded).toBe(true);
  });

  // The drawer offers this flow permanently, so reaching it there has to
  // work after the in-thread card was dismissed.
  it("expand clears a previous dismissal", () => {
    const upgrade = createPortalUpgrade();

    upgrade.dismiss();
    expect(upgrade.dismissed).toBe(true);

    upgrade.expand();

    expect(upgrade.dismissed).toBe(false);
    expect(upgrade.expanded).toBe(true);
  });
});

describe("mapUpgradeError", () => {
  const LABELS = {
    staleThread: "stale",
    loginFailed: "failed",
    usernameTaken: "taken",
  };

  it("maps a CONFLICT to the stale-thread message with a refetch", () => {
    const err = { message: "Thread state changed", data: { code: "CONFLICT" } };
    expect(mapUpgradeError(err, LABELS)).toEqual({
      message: "stale",
      invalidate: true,
    });
  });

  it("maps a username-taken CONFLICT to its own message without a refetch", () => {
    const err = {
      message: ErrorCode.ACCOUNT_USERNAME_TAKEN,
      data: { code: "CONFLICT" },
    };
    expect(mapUpgradeError(err, LABELS)).toEqual({
      message: "taken",
      invalidate: false,
    });
  });

  it("does not map a FORBIDDEN to the stale-thread retry loop", () => {
    // A 403 (e.g. an identity mismatch) can never be fixed by retrying
    // against a refetched thread, so it must not render as "the
    // conversation changed".
    const err = {
      message: "Session userId mismatch",
      data: { code: "FORBIDDEN" },
    };
    expect(mapUpgradeError(err, LABELS)).toEqual({
      message: "failed",
      invalidate: false,
    });
  });

  it("maps a non-tRPC error to the generic failure message", () => {
    expect(mapUpgradeError(new Error("network"), LABELS)).toEqual({
      message: "failed",
      invalidate: false,
    });
  });
});
