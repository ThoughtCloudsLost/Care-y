// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  fireEvent,
  cleanup,
  type RenderResult,
} from "@testing-library/svelte";
import UpgradeChooser from "./UpgradeChooser.svelte";

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

function renderChooser(
  overrides: Record<string, unknown> = {},
): RenderResult<UpgradeChooser> {
  return render(UpgradeChooser, {
    props: {
      open: true,
      onclose: vi.fn(),
      options: ["passphrase", "account"] as const,
      onchoose: vi.fn(),
      accountUrl: "/account",
      ...overrides,
    },
  });
}

describe("UpgradeChooser", () => {
  afterEach(cleanup);

  it("renders both paths when options include passphrase and account", () => {
    const { getByTestId } = renderChooser();
    expect(getByTestId("upgrade-add-passphrase")).toBeTruthy();
    expect(getByTestId("upgrade-create-account")).toBeTruthy();
  });

  it("renders only account path when options include only account", () => {
    const { getByTestId, container } = renderChooser({
      options: ["account"],
    });
    expect(
      container.querySelector("[data-testid='upgrade-add-passphrase']"),
    ).toBeNull();
    expect(getByTestId("upgrade-create-account")).toBeTruthy();
  });

  it("hides the passphrase paragraph when passphrase is not an option", () => {
    const { container } = renderChooser({ options: ["account"] });
    expect(
      container.querySelector("[data-testid='upgrade-passphrase-paragraph']"),
    ).toBeNull();
  });

  it("shows the passphrase paragraph when passphrase is an option", () => {
    const { getByTestId } = renderChooser();
    expect(getByTestId("upgrade-passphrase-paragraph")).toBeTruthy();
  });

  it("fires onchoose with 'passphrase' when the passphrase button is clicked", async () => {
    const onchoose = vi.fn();
    const { getByTestId } = renderChooser({ onchoose });
    await fireEvent.click(getByTestId("upgrade-add-passphrase"));
    expect(onchoose).toHaveBeenCalledWith("passphrase");
  });

  it("fires onchoose with 'account' when the account button is clicked", async () => {
    const onchoose = vi.fn();
    const { getByTestId } = renderChooser({ onchoose });
    await fireEvent.click(getByTestId("upgrade-create-account"));
    expect(onchoose).toHaveBeenCalledWith("account");
  });

  it("renders the body copy with the account URL", () => {
    const { getByTestId } = renderChooser({ accountUrl: "/my-account" });
    const paragraph = getByTestId("upgrade-account-paragraph");
    expect(paragraph.textContent).toContain("/my-account");
  });

  it("always shows the account paragraph regardless of options", () => {
    const { getByTestId } = renderChooser({ options: ["passphrase"] });
    expect(getByTestId("upgrade-account-paragraph")).toBeTruthy();
  });
});
