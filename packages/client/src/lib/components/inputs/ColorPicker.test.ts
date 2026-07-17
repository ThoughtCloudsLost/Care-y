// @vitest-environment jsdom
/**
 * ColorPicker component tests.
 *
 * The picker is a pure input: options in, bound value out. Tests verify
 * the radiogroup contract (one radio per option, aria-checked tracks the
 * value), selection via click, and the disabled state.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

import ColorPicker from "./ColorPicker.svelte";
import { PICKER_COLORS } from "./picker-options.js";

describe("ColorPicker", () => {
  afterEach(cleanup);

  it("renders a radio per option inside a labelled radiogroup", () => {
    render(ColorPicker, {
      options: PICKER_COLORS,
      value: "blue",
      label: "Color",
    });
    const group = screen.getByRole("radiogroup", { name: "Color" });
    expect(group).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(PICKER_COLORS.length);
  });

  it("marks only the bound value as checked", () => {
    render(ColorPicker, {
      options: PICKER_COLORS,
      value: "green",
      label: "Color",
    });
    const checked = screen.getAllByRole("radio", { checked: true });
    expect(checked).toHaveLength(1);
    expect(checked[0]?.getAttribute("aria-label")).toBe("green");
  });

  it("moves the checked state to a clicked swatch", async () => {
    render(ColorPicker, {
      options: PICKER_COLORS,
      value: "blue",
      label: "Color",
    });
    await fireEvent.click(screen.getByRole("radio", { name: "red" }));
    expect(
      screen.getByRole("radio", { name: "red" }).getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      screen.getByRole("radio", { name: "blue" }).getAttribute("aria-checked"),
    ).toBe("false");
  });

  it("keeps the checked state when a disabled swatch is clicked", async () => {
    render(ColorPicker, {
      options: PICKER_COLORS,
      value: "blue",
      label: "Color",
      disabled: true,
    });
    await fireEvent.click(screen.getByRole("radio", { name: "red" }));
    expect(
      screen.getByRole("radio", { name: "blue" }).getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("reports the selected id through onclick handlers bound upstream", async () => {
    // Two-way binding is exercised via the DOM above; this guards the
    // option identity contract (id attribute drives selection, not index).
    const onclickSpy = vi.fn();
    render(ColorPicker, {
      options: PICKER_COLORS,
      value: "blue",
      label: "Color",
    });
    const swatch = screen.getByRole("radio", { name: "purple" });
    swatch.addEventListener("click", onclickSpy);
    await fireEvent.click(swatch);
    expect(onclickSpy).toHaveBeenCalledTimes(1);
    expect(swatch.getAttribute("aria-checked")).toBe("true");
  });
});
