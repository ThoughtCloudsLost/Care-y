import { describe, it, expect } from "vitest";
import { getContextMenuActions } from "./context-menu-actions.js";

const labels = {
  copy: "Copy",
  editNote: "Edit Note",
  deleteNote: "Delete Note",
  editMessage: "Edit",
  editDisbursement: "Edit disbursement",
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

  describe("disbursements", () => {
    const entry = {
      type: "disbursement",
      source: "volunteer",
      createdBy: "user-1",
    };

    it("offers copy and the disbursement editor to the author", () => {
      const ids = getContextMenuActions(entry, "user-1", false, labels, {
        canRevise: true,
        canReviseOthers: false,
      }).map((a) => a.id);
      expect(ids).toEqual(["copy", "editDisbursement"]);
    });

    it("offers copy only without the revise permission", () => {
      const ids = getContextMenuActions(entry, "user-1", false, labels, {
        canRevise: false,
        canReviseOthers: false,
      }).map((a) => a.id);
      expect(ids).toEqual(["copy"]);
    });

    it("lets a fund manager correct someone else's disbursement", () => {
      const ids = getContextMenuActions(entry, "user-2", false, labels, {
        canRevise: true,
        canReviseOthers: true,
      }).map((a) => a.id);
      expect(ids).toEqual(["copy", "editDisbursement"]);
    });

    it("keeps other people's disbursements closed to everyone else", () => {
      const ids = getContextMenuActions(entry, "user-2", false, labels, {
        canRevise: true,
        canReviseOthers: false,
      }).map((a) => a.id);
      expect(ids).toEqual(["copy"]);
    });

    it("never offers note edit or delete, even to the author or an admin", () => {
      const cases: [string, boolean][] = [
        ["user-1", false],
        ["user-1", true],
        ["user-2", true],
      ];
      for (const [userId, isAdmin] of cases) {
        for (const access of [
          undefined,
          { canRevise: true, canReviseOthers: true },
        ]) {
          const ids = getContextMenuActions(
            entry,
            userId,
            isAdmin,
            labels,
            access,
          ).map((a) => a.id);
          expect(ids).not.toContain("edit");
          expect(ids).not.toContain("delete");
        }
      }
    });

    it("ignores disbursement access on an internal note", () => {
      const note = {
        type: "internal_note",
        source: "volunteer",
        createdBy: "user-1",
      };
      const ids = getContextMenuActions(note, "user-1", false, labels, {
        canRevise: true,
        canReviseOthers: true,
      }).map((a) => a.id);
      expect(ids).toEqual(["copy", "edit", "delete"]);
    });
  });
});
