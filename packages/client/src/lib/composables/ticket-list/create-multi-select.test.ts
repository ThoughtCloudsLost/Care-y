import { describe, it, expect } from "vitest";
import { createMultiSelect } from "./create-multi-select.svelte.js";

describe("createMultiSelect", () => {
  function make() {
    return createMultiSelect();
  }

  it("starts inactive with empty selectedIds", () => {
    const ms = make();
    expect(ms.active).toBe(false);
    expect(ms.selectedIds.size).toBe(0);
  });

  it("toggle() activates when inactive", () => {
    const ms = make();
    ms.toggle();
    expect(ms.active).toBe(true);
  });

  it("toggle() deactivates and clears selection when active", () => {
    const ms = make();
    ms.toggle();
    ms.toggleSelection("t1");
    ms.toggleSelection("t2");
    ms.toggle();
    expect(ms.active).toBe(false);
    expect(ms.selectedIds.size).toBe(0);
  });

  it("toggleSelection() adds an ID", () => {
    const ms = make();
    ms.toggleSelection("t1");
    expect(ms.selectedIds.has("t1")).toBe(true);
    expect(ms.selectedIds.size).toBe(1);
  });

  it("toggleSelection() removes an already-selected ID", () => {
    const ms = make();
    ms.toggleSelection("t1");
    ms.toggleSelection("t1");
    expect(ms.selectedIds.has("t1")).toBe(false);
    expect(ms.selectedIds.size).toBe(0);
  });

  it("exit() deactivates and clears all selections", () => {
    const ms = make();
    ms.toggle();
    ms.toggleSelection("t1");
    ms.toggleSelection("t2");
    ms.toggleSelection("t3");
    ms.exit();
    expect(ms.active).toBe(false);
    expect(ms.selectedIds.size).toBe(0);
  });

  it("handleLongPress() activates if not already active, then selects the ticket", () => {
    const ms = make();
    ms.handleLongPress("t1");
    expect(ms.active).toBe(true);
    expect(ms.selectedIds.has("t1")).toBe(true);
  });

  it("handleLongPress() on already-active just toggles selection", () => {
    const ms = make();
    ms.toggle();
    ms.toggleSelection("t1");
    ms.handleLongPress("t2");
    expect(ms.active).toBe(true);
    expect(ms.selectedIds.has("t1")).toBe(true);
    expect(ms.selectedIds.has("t2")).toBe(true);
  });

  it("exit() after selections clears the SvelteSet", () => {
    const ms = make();
    ms.handleLongPress("t1");
    ms.handleLongPress("t2");
    ms.handleLongPress("t3");
    expect(ms.selectedIds.size).toBe(3);
    ms.exit();
    expect(ms.selectedIds.size).toBe(0);
    expect(ms.active).toBe(false);
  });
});
