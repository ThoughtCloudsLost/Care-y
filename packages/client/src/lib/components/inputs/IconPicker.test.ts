// @vitest-environment jsdom
/**
 * IconPicker component tests.
 *
 * The picker is a pure input: options in, bound value out. Tests verify
 * the radiogroup contract (one radio per option, aria-checked tracks the
 * value), selection via click, the disabled state, and that it accepts an
 * arbitrary option set (domain registries are passed as props).
 */

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

import IconPicker from "./IconPicker.svelte";
import { PICKER_ICONS } from "./picker-options.js";

describe("IconPicker", () => {
  afterEach(cleanup);

  it("renders a radio per option inside a labelled radiogroup", () => {
    render(IconPicker, {
      options: PICKER_ICONS,
      value: "tag",
      label: "Icon",
    });
    const group = screen.getByRole("radiogroup", { name: "Icon" });
    expect(group).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(PICKER_ICONS.length);
  });

  it("marks only the bound value as checked", () => {
    render(IconPicker, {
      options: PICKER_ICONS,
      value: "shield",
      label: "Icon",
    });
    const checked = screen.getAllByRole("radio", { checked: true });
    expect(checked).toHaveLength(1);
    expect(checked[0]?.getAttribute("aria-label")).toBe("shield");
  });

  it("moves the checked state to a clicked icon", async () => {
    render(IconPicker, {
      options: PICKER_ICONS,
      value: "tag",
      label: "Icon",
    });
    await fireEvent.click(screen.getByRole("radio", { name: "phone" }));
    expect(
      screen.getByRole("radio", { name: "phone" }).getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      screen.getByRole("radio", { name: "tag" }).getAttribute("aria-checked"),
    ).toBe("false");
  });

  it("keeps the checked state when a disabled icon is clicked", async () => {
    render(IconPicker, {
      options: PICKER_ICONS,
      value: "tag",
      label: "Icon",
      disabled: true,
    });
    await fireEvent.click(screen.getByRole("radio", { name: "phone" }));
    expect(
      screen.getByRole("radio", { name: "tag" }).getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("renders an arbitrary option subset passed as props", () => {
    const subset = PICKER_ICONS.slice(0, 3);
    render(IconPicker, {
      options: subset,
      value: subset[0]?.id ?? "",
      label: "Icon",
    });
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });
});
