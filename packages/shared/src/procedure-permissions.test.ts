import { describe, expect, it } from "vitest";
import { PROCEDURE_PERMISSIONS } from "./procedure-permissions.js";
import { Permission } from "./roles.js";

const PERMISSION_VALUES = new Set<string>(Object.values(Permission));

describe("PROCEDURE_PERMISSIONS", () => {
  it("has no gate for the removed disbursement note type procedure", () => {
    expect(Object.keys(PROCEDURE_PERMISSIONS)).not.toContain(
      "funds.ensureDisbursementNoteType",
    );
  });

  it("maps every funds procedure to a Permission", () => {
    const fundsEntries = Object.entries(PROCEDURE_PERMISSIONS).filter(
      ([path]) => path.startsWith("funds."),
    );
    // Guards against the filter matching nothing and the loop passing empty.
    expect(fundsEntries.length).toBeGreaterThan(0);
    for (const [path, permission] of fundsEntries) {
      expect(PERMISSION_VALUES.has(permission), path).toBe(true);
    }
  });
});
