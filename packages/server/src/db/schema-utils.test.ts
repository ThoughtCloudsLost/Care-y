import { describe, expect, it, vi } from "vitest";
import { isValidOrgSchemaName, logMigrationResults } from "./schema-utils.js";
import type { MigrationResult } from "kysely";

describe("isValidOrgSchemaName", () => {
  it("accepts a valid org schema name", () => {
    expect(
      isValidOrgSchemaName("org_f47ac10b-58cc-4372-a567-0e02b2c3d479"),
    ).toBe(true);
  });

  it("accepts all-zero UUID", () => {
    expect(
      isValidOrgSchemaName("org_00000000-0000-0000-0000-000000000000"),
    ).toBe(true);
  });

  it("accepts all-f UUID", () => {
    expect(
      isValidOrgSchemaName("org_ffffffff-ffff-ffff-ffff-ffffffffffff"),
    ).toBe(true);
  });

  it("rejects missing org_ prefix", () => {
    expect(isValidOrgSchemaName("f47ac10b-58cc-4372-a567-0e02b2c3d479")).toBe(
      false,
    );
  });

  it("rejects uppercase hex", () => {
    expect(
      isValidOrgSchemaName("org_F47AC10B-58CC-4372-A567-0E02B2C3D479"),
    ).toBe(false);
  });

  it("rejects short UUID (missing segment)", () => {
    expect(isValidOrgSchemaName("org_f47ac10b-58cc-4372-a567")).toBe(false);
  });

  it("rejects trailing characters", () => {
    expect(
      isValidOrgSchemaName("org_f47ac10b-58cc-4372-a567-0e02b2c3d479; DROP"),
    ).toBe(false);
  });

  it("rejects leading characters", () => {
    expect(
      isValidOrgSchemaName("x_org_f47ac10b-58cc-4372-a567-0e02b2c3d479"),
    ).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidOrgSchemaName("")).toBe(false);
  });

  it("rejects org_ with no UUID", () => {
    expect(isValidOrgSchemaName("org_")).toBe(false);
  });

  it("rejects UUID without dashes", () => {
    expect(isValidOrgSchemaName("org_f47ac10b58cc4372a5670e02b2c3d479")).toBe(
      false,
    );
  });
});

describe("logMigrationResults", () => {
  it("logs 'No migrations to apply' when results is undefined", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    logMigrationResults("platform", undefined);

    expect(logSpy).toHaveBeenCalledWith("[platform] No migrations to apply");
    logSpy.mockRestore();
  });

  it("logs 'No migrations to apply' when results is empty", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    logMigrationResults("platform", []);

    expect(logSpy).toHaveBeenCalledWith("[platform] No migrations to apply");
    logSpy.mockRestore();
  });

  it("logs 'No migrations to roll back' for down direction", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    logMigrationResults("tenant", undefined, "down");

    expect(logSpy).toHaveBeenCalledWith("[tenant] No migrations to roll back");
    logSpy.mockRestore();
  });

  it("logs each migration result with label", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    const results: MigrationResult[] = [
      { migrationName: "001_create_users", status: "Success", direction: "Up" },
      { migrationName: "002_add_sessions", status: "Success", direction: "Up" },
    ];

    logMigrationResults("org_abc", results);

    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenCalledWith("[org_abc] Success 001_create_users");
    expect(logSpy).toHaveBeenCalledWith("[org_abc] Success 002_add_sessions");
    logSpy.mockRestore();
  });
});
