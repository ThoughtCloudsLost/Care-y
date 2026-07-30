import { describe, it, expect } from "vitest";
import { classifyDemoLabel } from "./topic-classifier.js";
import type { ClassifierContext } from "./topic-classifier.js";

const listCtx: ClassifierContext = { inDetail: false, feature: "tickets" };
const detailCtx: ClassifierContext = { inDetail: true, feature: "tickets" };
const loginCtx: ClassifierContext = { inDetail: false, feature: "login" };
const settingsCtx: ClassifierContext = { inDetail: false, feature: "settings" };
const adminCtx: ClassifierContext = { inDetail: false, feature: "admin" };
const homeCtx: ClassifierContext = { inDetail: false, feature: "home" };
const libraryCtx: ClassifierContext = { inDetail: false, feature: "library" };

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
    expect(classifyDemoLabel("Login Username", listCtx)).toBe("credentials");
  });

  it("classifies Password label as credentials", () => {
    expect(classifyDemoLabel("Password", listCtx)).toBe("credentials");
  });

  // -- twofa (per-method labels, shared controls stay generic) --
  it("classifies TOTP label as twofa-totp on login", () => {
    expect(classifyDemoLabel("Authenticator app", loginCtx)).toBe("twofa-totp");
  });

  it("classifies Passkey label as twofa-passkey on login", () => {
    expect(classifyDemoLabel("Use passkey", loginCtx)).toBe("twofa-passkey");
  });

  it("classifies Backup codes label as twofa-backup on login", () => {
    expect(classifyDemoLabel("Enter backup code", loginCtx)).toBe(
      "twofa-backup",
    );
  });

  it("classifies Verify submit as generic twofa on login", () => {
    expect(classifyDemoLabel("Verify", loginCtx)).toBe("twofa");
  });

  // -- twofa labels on settings classify as settings-2fa --
  it("classifies TOTP label as settings-2fa on settings", () => {
    expect(classifyDemoLabel("Authenticator app", settingsCtx)).toBe(
      "settings-2fa",
    );
  });

  it("classifies Passkey label as settings-2fa on settings", () => {
    expect(classifyDemoLabel("Use passkey", settingsCtx)).toBe("settings-2fa");
  });

  it("classifies Backup codes label as settings-2fa on settings", () => {
    expect(classifyDemoLabel("Enter backup code", settingsCtx)).toBe(
      "settings-2fa",
    );
  });

  it("classifies Verify submit as settings-2fa on settings", () => {
    expect(classifyDemoLabel("Verify", settingsCtx)).toBe("settings-2fa");
  });

  it("classifies Remove method confirm as settings-2fa on settings", () => {
    expect(classifyDemoLabel("Remove this method?", settingsCtx)).toBe(
      "settings-2fa",
    );
  });

  it("does not classify Remove method confirm on login", () => {
    expect(classifyDemoLabel("Remove this method?", loginCtx)).toBeNull();
  });

  // -- key-derivation --
  it("classifies argon2id phase label as key-derivation", () => {
    expect(classifyDemoLabel("Preparing your keys...", listCtx)).toBe(
      "key-derivation",
    );
  });

  // -- timeline --
  it("classifies timeline toggle as timeline", () => {
    expect(classifyDemoLabel("View timeline", detailCtx)).toBe("timeline");
  });

  it("classifies messages toggle as timeline", () => {
    expect(classifyDemoLabel("View messages", detailCtx)).toBe("timeline");
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

  // -- dashboard-queues --
  it("classifies Queues heading as dashboard-queues (English)", () => {
    expect(classifyDemoLabel("Queues", homeCtx)).toBe("dashboard-queues");
  });

  it("classifies Queues heading as dashboard-queues (Spanish locale)", () => {
    // The Spanish template also uses the {Queues} terminology param,
    // which resolves to "Queues" (English terminology defaults). Both
    // locales produce the same label for this parameterized heading.
    expect(classifyDemoLabel("Queues", homeCtx)).toBe("dashboard-queues");
  });

  // -- dashboard-activity --
  it("classifies Activity heading as dashboard-activity", () => {
    expect(classifyDemoLabel("Activity", homeCtx)).toBe("dashboard-activity");
  });

  it("classifies Actividad heading as dashboard-activity (Spanish)", () => {
    expect(classifyDemoLabel("Actividad", homeCtx)).toBe("dashboard-activity");
  });

  // -- library-vote --
  it("classifies Was this helpful? as library-vote", () => {
    expect(classifyDemoLabel("Was this helpful?", libraryCtx)).toBe(
      "library-vote",
    );
  });

  it("classifies Helpful as library-vote", () => {
    expect(classifyDemoLabel("Helpful", libraryCtx)).toBe("library-vote");
  });

  it("classifies Not helpful as library-vote", () => {
    expect(classifyDemoLabel("Not helpful", libraryCtx)).toBe("library-vote");
  });

  // -- library-categories --
  it("classifies Manage categories as library-categories", () => {
    expect(classifyDemoLabel("Manage categories", libraryCtx)).toBe(
      "library-categories",
    );
  });

  // -- library-editor --
  it("classifies New Article as library-editor", () => {
    expect(classifyDemoLabel("New Article", libraryCtx)).toBe("library-editor");
  });

  it("classifies Edit article as library-editor", () => {
    expect(classifyDemoLabel("Edit article", libraryCtx)).toBe(
      "library-editor",
    );
  });

  // -- admin-roster-edit --
  it("classifies Edit user as admin-roster-edit", () => {
    expect(classifyDemoLabel("Edit user", adminCtx)).toBe("admin-roster-edit");
  });

  // -- settings_display_name disambiguation --
  it("classifies Display Name as admin-roster-edit on admin", () => {
    expect(classifyDemoLabel("Display Name", adminCtx)).toBe(
      "admin-roster-edit",
    );
  });

  it("classifies Display Name as settings-profile on settings", () => {
    expect(classifyDemoLabel("Display Name", settingsCtx)).toBe(
      "settings-profile",
    );
  });

  it("classifies Login Username as admin-roster-edit on admin", () => {
    expect(classifyDemoLabel("Login Username", adminCtx)).toBe(
      "admin-roster-edit",
    );
  });

  it("classifies Login Username as settings-profile on settings", () => {
    expect(classifyDemoLabel("Login Username", settingsCtx)).toBe(
      "settings-profile",
    );
  });

  // -- admin-greetings --
  it("classifies Add greeting as admin-greetings", () => {
    expect(classifyDemoLabel("Add greeting", adminCtx)).toBe("admin-greetings");
  });

  it("classifies Greetings tab as admin-greetings", () => {
    expect(classifyDemoLabel("Greetings", adminCtx)).toBe("admin-greetings");
  });

  // -- admin-quarantine --
  it("classifies Play voicemail as admin-quarantine", () => {
    expect(classifyDemoLabel("Play voicemail", adminCtx)).toBe(
      "admin-quarantine",
    );
  });

  it("classifies Route to ticket as admin-quarantine", () => {
    expect(classifyDemoLabel("Route to ticket", adminCtx)).toBe(
      "admin-quarantine",
    );
  });

  it("classifies Dismiss as admin-quarantine", () => {
    expect(classifyDemoLabel("Dismiss", adminCtx)).toBe("admin-quarantine");
  });

  it("classifies Unrouted tab as admin-quarantine", () => {
    expect(classifyDemoLabel("Unrouted", adminCtx)).toBe("admin-quarantine");
  });

  // -- settings-password --
  it("classifies Password as settings-password on settings (not credentials)", () => {
    expect(classifyDemoLabel("Password", settingsCtx)).toBe(
      "settings-password",
    );
  });

  it("classifies Password as credentials on non-settings features", () => {
    expect(classifyDemoLabel("Password", listCtx)).toBe("credentials");
    expect(classifyDemoLabel("Password", loginCtx)).toBe("credentials");
  });

  // -- settings-2fa --
  it("classifies Two-factor authentication as settings-2fa", () => {
    expect(classifyDemoLabel("Two-factor authentication", settingsCtx)).toBe(
      "settings-2fa",
    );
  });
});
