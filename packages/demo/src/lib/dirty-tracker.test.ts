/**
 * Unit tests for the dirty tracker.
 *
 * Uses jsdom (vitest's default environment) with synthetic DOM events.
 * The tracker attaches capture-phase listeners, so events must bubble
 * from real DOM nodes; dispatchEvent on the root alone would not
 * trigger capture listeners on descendants.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createDirtyTracker, SUBMIT_SELECTORS } from "./dirty-tracker.js";

let root: HTMLDivElement;

beforeEach(() => {
  root = document.createElement("div");
  document.body.appendChild(root);
});

afterEach(() => {
  root.remove();
});

describe("dirty tracker", () => {
  // -----------------------------------------------------------------
  // Input events mark dirty
  // -----------------------------------------------------------------

  it("marks dirty on input event from an <input>", () => {
    const onChange = vi.fn();
    const handle = createDirtyTracker(root, { onChange });

    const input = document.createElement("input");
    root.appendChild(input);
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(onChange).toHaveBeenCalledWith(true);
    handle.destroy();
  });

  it("marks dirty on input event from a <textarea>", () => {
    const onChange = vi.fn();
    const handle = createDirtyTracker(root, { onChange });

    const textarea = document.createElement("textarea");
    root.appendChild(textarea);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    expect(onChange).toHaveBeenCalledWith(true);
    handle.destroy();
  });

  it("marks dirty on change event from a <select>", () => {
    const onChange = vi.fn();
    const handle = createDirtyTracker(root, { onChange });

    const select = document.createElement("select");
    root.appendChild(select);
    select.dispatchEvent(new Event("change", { bubbles: true }));

    expect(onChange).toHaveBeenCalledWith(true);
    handle.destroy();
  });

  it("marks dirty on input from a contenteditable element", () => {
    const onChange = vi.fn();
    const handle = createDirtyTracker(root, { onChange });

    const div = document.createElement("div");
    div.setAttribute("contenteditable", "true");
    root.appendChild(div);
    div.dispatchEvent(new Event("input", { bubbles: true }));

    expect(onChange).toHaveBeenCalledWith(true);
    handle.destroy();
  });

  // -----------------------------------------------------------------
  // Non-tracked elements do not mark dirty
  // -----------------------------------------------------------------

  it("ignores input events from non-tracked elements", () => {
    const onChange = vi.fn();
    const handle = createDirtyTracker(root, { onChange });

    const div = document.createElement("div");
    root.appendChild(div);
    div.dispatchEvent(new Event("input", { bubbles: true }));

    expect(onChange).not.toHaveBeenCalled();
    handle.destroy();
  });

  // -----------------------------------------------------------------
  // Submit clears dirty
  // -----------------------------------------------------------------

  it("clears dirty on form submit", () => {
    const onChange = vi.fn();
    const handle = createDirtyTracker(root, { onChange });

    const form = document.createElement("form");
    const input = document.createElement("input");
    form.appendChild(input);
    root.appendChild(form);

    // Mark dirty first
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith(true);

    // Submit clears
    form.dispatchEvent(new Event("submit", { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith(false);
    handle.destroy();
  });

  // -----------------------------------------------------------------
  // Click on [type=submit] clears dirty
  // -----------------------------------------------------------------

  it("clears dirty on click on a [type=submit] button", () => {
    const onChange = vi.fn();
    const handle = createDirtyTracker(root, { onChange });

    const input = document.createElement("input");
    const btn = document.createElement("button");
    btn.type = "submit";
    root.appendChild(input);
    root.appendChild(btn);

    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith(true);

    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith(false);
    handle.destroy();
  });

  // -----------------------------------------------------------------
  // Click on allowlisted selector clears dirty
  // -----------------------------------------------------------------

  it("clears dirty on click on a .soft-btn button", () => {
    const onChange = vi.fn();
    const handle = createDirtyTracker(root, { onChange });

    const input = document.createElement("input");
    const btn = document.createElement("button");
    btn.className = "soft-btn";
    root.appendChild(input);
    root.appendChild(btn);

    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith(true);

    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith(false);
    handle.destroy();
  });

  it("clears dirty on click on a .k-button-large element", () => {
    const onChange = vi.fn();
    const handle = createDirtyTracker(root, { onChange });

    const input = document.createElement("input");
    const btn = document.createElement("button");
    btn.className = "k-button-large";
    root.appendChild(input);
    root.appendChild(btn);

    input.dispatchEvent(new Event("input", { bubbles: true }));
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onChange).toHaveBeenLastCalledWith(false);
    handle.destroy();
  });

  it("clears dirty on click inside a ShellMessagebar send link", () => {
    const onChange = vi.fn();
    const handle = createDirtyTracker(root, { onChange });

    // Build DOM structure: .shell-messagebar > [role=button]:last-child > svg
    const bar = document.createElement("div");
    bar.className = "shell-messagebar";
    const link = document.createElement("a");
    link.setAttribute("role", "button");
    const icon = document.createElement("svg");
    link.appendChild(icon);
    bar.appendChild(link);
    root.appendChild(bar);

    const input = document.createElement("input");
    root.appendChild(input);

    input.dispatchEvent(new Event("input", { bubbles: true }));
    // Click on the icon inside the link
    icon.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onChange).toHaveBeenLastCalledWith(false);
    handle.destroy();
  });

  // -----------------------------------------------------------------
  // markClean clears dirty
  // -----------------------------------------------------------------

  it("clears dirty via markClean", () => {
    const onChange = vi.fn();
    const handle = createDirtyTracker(root, { onChange });

    const input = document.createElement("input");
    root.appendChild(input);

    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith(true);

    handle.markClean("route-change");
    expect(onChange).toHaveBeenCalledWith(false);
    handle.destroy();
  });

  // -----------------------------------------------------------------
  // No duplicate notifications
  // -----------------------------------------------------------------

  it("does not re-notify when already dirty", () => {
    const onChange = vi.fn();
    const handle = createDirtyTracker(root, { onChange });

    const input = document.createElement("input");
    root.appendChild(input);

    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("input", { bubbles: true }));

    // Only one call with true
    expect(onChange).toHaveBeenCalledTimes(1);
    handle.destroy();
  });

  // -----------------------------------------------------------------
  // destroy removes listeners
  // -----------------------------------------------------------------

  it("stops tracking after destroy", () => {
    const onChange = vi.fn();
    const handle = createDirtyTracker(root, { onChange });

    handle.destroy();

    const input = document.createElement("input");
    root.appendChild(input);
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(onChange).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------
  // SUBMIT_SELECTORS is a non-empty array
  // -----------------------------------------------------------------

  it("exports a non-empty SUBMIT_SELECTORS list", () => {
    expect(SUBMIT_SELECTORS.length).toBeGreaterThan(0);
    for (const selector of SUBMIT_SELECTORS) {
      expect(typeof selector).toBe("string");
    }
  });
});
