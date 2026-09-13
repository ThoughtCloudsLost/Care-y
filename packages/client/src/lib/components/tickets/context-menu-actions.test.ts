import { describe, it, expect } from "vitest";
import { getContextMenuActions } from "./context-menu-actions.js";

const labels = {
  copy: "Copy",
  editNote: "Edit Note",
  deleteNote: "Delete Note",
  editMessage: "Edit",
};

describe("getContextMenuActions", () => {
  it("shows only Copy for a regular client message", () => {
    const actions = getContextMenuActions(
      { type: "message", source: "client", createdBy: null },
      "user-1",
      false,
      labels,
    );
    expect(actions).toHaveLength(1);
    expect(actions[0]!.id).toBe("copy");
  });

  it("shows Copy and Edit for own volunteer message", () => {
    const actions = getContextMenuActions(
      { type: "message", source: "volunteer", createdBy: "user-1" },
      "user-1",
      false,
      labels,
    );
    const ids = actions.map((a) => a.id);
    expect(ids).toEqual(["copy", "editMessage"]);
  });

  it("shows only Copy for a system event", () => {
    const actions = getContextMenuActions(
      { type: "status_closed", source: "system", createdBy: null },
      "user-1",
      false,
      labels,
    );
    expect(actions).toHaveLength(1);
    expect(actions[0]!.id).toBe("copy");
  });

  it("shows Copy, Edit, Delete for own internal note", () => {
    const actions = getContextMenuActions(
      { type: "internal_note", source: "volunteer", createdBy: "user-1" },
      "user-1",
      false,
      labels,
    );
    const ids = actions.map((a) => a.id);
    expect(ids).toEqual(["copy", "edit", "delete"]);
  });

  it("marks Delete as destructive for own internal note", () => {
    const actions = getContextMenuActions(
      { type: "internal_note", source: "volunteer", createdBy: "user-1" },
      "user-1",
      false,
      labels,
    );
    const deleteAction = actions.find((a) => a.id === "delete");
    expect(deleteAction?.destructive).toBe(true);
  });

  it("shows only Copy for another user's internal note (non-admin)", () => {
    const actions = getContextMenuActions(
      { type: "internal_note", source: "volunteer", createdBy: "user-2" },
      "user-1",
      false,
      labels,
    );
    expect(actions).toHaveLength(1);
    expect(actions[0]!.id).toBe("copy");
  });

  it("shows Copy and Delete for another user's internal note (admin)", () => {
    const actions = getContextMenuActions(
      { type: "internal_note", source: "volunteer", createdBy: "user-2" },
      "user-1",
      true,
      labels,
    );
    const ids = actions.map((a) => a.id);
    expect(ids).toEqual(["copy", "delete"]);
  });

  it("admin does not get Edit on another user's note", () => {
    const actions = getContextMenuActions(
      { type: "internal_note", source: "volunteer", createdBy: "user-2" },
      "user-1",
      true,
      labels,
    );
    const ids = actions.map((a) => a.id);
    expect(ids).not.toContain("edit");
  });

  it("admin on own note gets Copy, Edit, Delete (no duplicate delete)", () => {
    const actions = getContextMenuActions(
      { type: "internal_note", source: "volunteer", createdBy: "user-1" },
      "user-1",
      true,
      labels,
    );
    const ids = actions.map((a) => a.id);
    // Own note: copy, edit, delete. Admin branch skips because createdBy === currentUserId.
    expect(ids).toEqual(["copy", "edit", "delete"]);
  });

  it("shows only Copy when currentUserId is undefined", () => {
    const actions = getContextMenuActions(
      { type: "internal_note", source: "volunteer", createdBy: "user-1" },
      undefined,
      false,
      labels,
    );
    expect(actions).toHaveLength(1);
    expect(actions[0]!.id).toBe("copy");
  });
});
