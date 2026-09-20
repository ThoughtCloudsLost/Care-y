/**
 * Tests for the encrypted column-to-tier manifest.
 *
 * Validates structural invariants: every entry has a non-empty column,
 * a valid tier, and at least one ADR citation. Also verifies that
 * getOrgTierTables excludes tables with OPS-tier columns.
 */

import { describe, it, expect } from "vitest";
import {
  COLUMN_TIER_MANIFEST,
  getOrgTierTables,
  type EncryptionTier,
} from "./column-tiers.js";

describe("COLUMN_TIER_MANIFEST", () => {
  it("has at least one table", () => {
    expect(Object.keys(COLUMN_TIER_MANIFEST).length).toBeGreaterThan(0);
  });

  it("every entry has a non-empty column name", () => {
    for (const [table, entries] of Object.entries(COLUMN_TIER_MANIFEST)) {
      for (const entry of entries) {
        expect(entry.column, `${table}.${entry.column}`).toBeTruthy();
      }
    }
  });

  it("every entry has a valid tier", () => {
    const validTiers: readonly EncryptionTier[] = ["org", "ops"];
    for (const [table, entries] of Object.entries(COLUMN_TIER_MANIFEST)) {
      for (const entry of entries) {
        expect(
          validTiers,
          `${table}.${entry.column} tier "${entry.tier}"`,
        ).toContain(entry.tier);
      }
    }
  });

  it("every entry cites at least one ADR", () => {
    for (const [table, entries] of Object.entries(COLUMN_TIER_MANIFEST)) {
      for (const entry of entries) {
        expect(
          entry.adrs.length,
          `${table}.${entry.column} has no ADR citation`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("phones.encrypted_number is OPS tier (ADR-005/069/096)", () => {
    const phoneEntries = COLUMN_TIER_MANIFEST.phones;
    expect(phoneEntries).toBeDefined();
    const numberEntry = phoneEntries?.find(
      (e) => e.column === "encrypted_number",
    );
    expect(numberEntry?.tier).toBe("ops");
  });

  it("emails.encrypted_address is OPS tier (ADR-005/069/096)", () => {
    const emailEntries = COLUMN_TIER_MANIFEST.emails;
    expect(emailEntries).toBeDefined();
    const addressEntry = emailEntries?.find(
      (e) => e.column === "encrypted_address",
    );
    expect(addressEntry?.tier).toBe("ops");
  });

  it("clients.encrypted_alias is org tier", () => {
    const clientEntries = COLUMN_TIER_MANIFEST.clients;
    expect(clientEntries).toBeDefined();
    const aliasEntry = clientEntries?.find(
      (e) => e.column === "encrypted_alias",
    );
    expect(aliasEntry?.tier).toBe("org");
  });
});

describe("getOrgTierTables", () => {
  it("excludes tables with any OPS-tier columns", () => {
    const orgTables = getOrgTierTables();
    // phones and emails are exclusively OPS-tier
    expect(orgTables).not.toContain("phones");
    expect(orgTables).not.toContain("emails");
    // consultants has a mix (encrypted_display_name = org, ops_encrypted_phone = ops)
    expect(orgTables).not.toContain("consultants");
  });

  it("includes tables with exclusively org-tier columns", () => {
    const orgTables = getOrgTierTables();
    expect(orgTables).toContain("clients");
    expect(orgTables).toContain("users");
    expect(orgTables).toContain("queues");
    expect(orgTables).toContain("sessions");
    expect(orgTables).toContain("intake_key_wraps");
  });
});
