import { describe, it, expect } from "vitest";
import { classifyDemoLabel } from "./topic-classifier.js";
import type { ClassifierContext } from "./topic-classifier.js";

const listCtx: ClassifierContext = { inDetail: false };
const detailCtx: ClassifierContext = { inDetail: true };

describe("classifyDemoLabel", () => {
  // -- sort --
  it("classifies English sort label", () => {
    expect(classifyDemoLabel("Sort", listCtx)).toBe("sort");
  });

  it("classifies Spanish sort label", () => {
    expect(classifyDemoLabel("Ordenar", listCtx)).toBe("sort");
  });

  // -- filters (list context) --
  it("classifies filter toolbar label on the list as filters", () => {
    expect(classifyDemoLabel("Filter tickets", listCtx)).toBe("filters");
  });

  it("classifies Spanish filter toolbar label on the list as filters", () => {
    expect(classifyDemoLabel("Filtrar tickets", listCtx)).toBe("filters");
  });

  it("classifies Status pill as filters", () => {
    expect(classifyDemoLabel("Status", listCtx)).toBe("filters");
  });

  it("classifies Priority pill as filters", () => {
    expect(classifyDemoLabel("Priority", listCtx)).toBe("filters");
  });

  it("classifies Assignee pill as filters", () => {
    expect(classifyDemoLabel("Assignee", listCtx)).toBe("filters");
  });

  it("classifies Date pill as filters", () => {
    expect(classifyDemoLabel("Date", listCtx)).toBe("filters");
  });

  it("classifies Queue pill as filters (English)", () => {
    expect(classifyDemoLabel("Queue", listCtx)).toBe("filters");
  });

  it("classifies Save filter shortcut as filters", () => {
    expect(classifyDemoLabel("Save filter shortcut", listCtx)).toBe("filters");
  });

  // -- thread-filters (detail context) --
  it("classifies filter toolbar label on detail as thread-filters", () => {
    expect(classifyDemoLabel("Filter tickets", detailCtx)).toBe(
      "thread-filters",
    );
  });

  it("classifies Type pill in detail as thread-filters", () => {
    expect(classifyDemoLabel("Type", detailCtx)).toBe("thread-filters");
  });

  it("classifies Author pill in detail as thread-filters", () => {
    expect(classifyDemoLabel("Author", detailCtx)).toBe("thread-filters");
  });

  it("classifies Date pill in detail as thread-filters", () => {
    // "Date" is ticket_filter_date in detail context
    expect(classifyDemoLabel("Date", detailCtx)).toBe("thread-filters");
  });

  // -- view-modes --
  it("classifies view switcher group label", () => {
    expect(classifyDemoLabel("View as", listCtx)).toBe("view-modes");
  });

  it("classifies individual view mode buttons", () => {
    expect(classifyDemoLabel("Table", listCtx)).toBe("view-modes");
    expect(classifyDemoLabel("Compact rows", listCtx)).toBe("view-modes");
    expect(classifyDemoLabel("Cards", listCtx)).toBe("view-modes");
    expect(classifyDemoLabel("Grid", listCtx)).toBe("view-modes");
    expect(classifyDemoLabel("Kanban board", listCtx)).toBe("view-modes");
  });

  it("classifies Spanish view mode labels", () => {
    expect(classifyDemoLabel("Ver como", listCtx)).toBe("view-modes");
    expect(classifyDemoLabel("Tabla", listCtx)).toBe("view-modes");
  });

  // -- select-mode --
  it("classifies list select mode label", () => {
    expect(classifyDemoLabel("Select", listCtx)).toBe("select-mode");
  });

  it("classifies detail select mode label", () => {
    expect(classifyDemoLabel("Select messages", detailCtx)).toBe("select-mode");
  });

  // -- new-ticket --
  it("classifies new ticket label (English)", () => {
    expect(classifyDemoLabel("New Ticket", listCtx)).toBe("new-ticket");
  });

  it("classifies new ticket label (Spanish)", () => {
    expect(classifyDemoLabel("Nuevo Ticket", listCtx)).toBe("new-ticket");
  });

  // -- compose-actions --
  it("classifies compose actions label", () => {
    expect(classifyDemoLabel("Compose actions", detailCtx)).toBe(
      "compose-actions",
    );
  });

  // -- reply --
  it("classifies send message label as reply", () => {
    expect(classifyDemoLabel("Send message", detailCtx)).toBe("reply");
  });

  it("classifies send SMS label as reply", () => {
    expect(classifyDemoLabel("Send SMS", detailCtx)).toBe("reply");
  });

  // -- notes --
  it("classifies internal note label", () => {
    expect(classifyDemoLabel("Internal Note", detailCtx)).toBe("notes");
  });

  it("classifies edit note label", () => {
    expect(classifyDemoLabel("Edit Note", detailCtx)).toBe("notes");
  });

  it("classifies save note label", () => {
    expect(classifyDemoLabel("Save note", detailCtx)).toBe("notes");
  });

  // -- case-fold --
  it("classifies ticket details label", () => {
    expect(classifyDemoLabel("Ticket details", detailCtx)).toBe("case-fold");
  });

  it("classifies fold ticket details label", () => {
    expect(classifyDemoLabel("Fold ticket details", detailCtx)).toBe(
      "case-fold",
    );
  });

  // -- language --
  it("classifies language picker label", () => {
    expect(classifyDemoLabel("Language", listCtx)).toBe("language");
  });

  it("classifies Spanish language picker label", () => {
    expect(classifyDemoLabel("Idioma", listCtx)).toBe("language");
  });

  // -- credentials --
  it("classifies Sign in label as credentials", () => {
    expect(classifyDemoLabel("Sign in", listCtx)).toBe("credentials");
  });

  it("classifies Username label as credentials", () => {
    expect(classifyDemoLabel("Username", listCtx)).toBe("credentials");
  });

  it("classifies Password label as credentials", () => {
    expect(classifyDemoLabel("Password", listCtx)).toBe("credentials");
  });

  // -- twofa (per-method labels, shared controls stay generic) --
  it("classifies TOTP label as twofa-totp", () => {
    expect(classifyDemoLabel("Authenticator app", listCtx)).toBe("twofa-totp");
  });

  it("classifies Passkey label as twofa-passkey", () => {
    expect(classifyDemoLabel("Use Passkey", listCtx)).toBe("twofa-passkey");
  });

  it("classifies Backup codes label as twofa-backup", () => {
    expect(classifyDemoLabel("Enter backup code", listCtx)).toBe(
      "twofa-backup",
    );
  });

  it("classifies Verify submit as generic twofa", () => {
    expect(classifyDemoLabel("Verify", listCtx)).toBe("twofa");
  });

  // -- key-derivation --
  it("classifies argon2id phase label as key-derivation", () => {
    expect(classifyDemoLabel("Deriving keys...", listCtx)).toBe(
      "key-derivation",
    );
  });

  // -- timeline --
  it("classifies timeline toggle as timeline", () => {
    expect(classifyDemoLabel("Timeline", detailCtx)).toBe("timeline");
  });

  it("classifies messages toggle as timeline", () => {
    expect(classifyDemoLabel("Messages", detailCtx)).toBe("timeline");
  });

  // -- unrecognized --
  it("returns null for unknown labels", () => {
    expect(classifyDemoLabel("Something random", listCtx)).toBeNull();
    expect(classifyDemoLabel("", listCtx)).toBeNull();
  });

  // -- context sensitivity --
  it("Date pill on list is filters, not thread-filters", () => {
    // tickets_filter_date_range = "Date" in English
    expect(classifyDemoLabel("Date", listCtx)).toBe("filters");
  });
});
