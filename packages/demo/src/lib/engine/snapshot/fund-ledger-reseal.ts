/**
 * Moves the time stored inside each seeded fund ledger entry by the
 * boot's time shift. An entry's payload holds its exact recorded time
 * (`recordedAt`) sealed to the org public key, so the SQL shift in
 * seed-time-shift.ts moves the row's entry_date but cannot reach the
 * time inside, and the ledger page, which dates each entry by
 * recordedAt (FundHistoryList.svelte), would list them at build time.
 *
 * The ledger is append-only and the product has no call that rewrites
 * an entry, so this writes the table directly. Each payload is opened
 * with the demo org's secret key from the snapshot manifest, validated
 * against the product's ledger schema, and sealed again to the same org
 * public key. A sealed box only opens under the keypair it was sealed
 * to, so the row's org_key_generation still names the key that sealed
 * it and is left as it is.
 *
 * Statements are built with Kysely (a typed description of the columns
 * touched here) and run through PGlite inside one transaction, as
 * seed-time-shift.ts does, so a failed reseal changes nothing.
 */

import type { PGlite } from "@electric-sql/pglite";
import { requireSodium, sealForOrgKey } from "@care-y/crypto";
import {
  fundLedgerPayloadSchema,
  type FundLedgerPayload,
} from "@care-y/shared";

import { SeedTimeResealError } from "../errors.js";
import { createStatementCompiler } from "./seed-rows.js";

/** The fund_ledger columns read and written here, and only those. */
interface FundLedgerResealDatabase {
  fund_ledger: { id: string; encrypted_payload: Uint8Array };
}

export interface FundLedgerResealDeps {
  readonly pg: PGlite;
  /** The demo org's tenant schema. */
  readonly schema: string;
  /** The demo org's public key, which every seeded entry is sealed to. */
  readonly orgPublicKey: Uint8Array;
  /** Its secret key. The caller owns it and zeroes it afterwards. */
  readonly orgSecretKey: Uint8Array;
  readonly deltaMs: number;
}

interface LedgerRow {
  readonly id: string;
  readonly payload: Uint8Array;
}

function toLedgerRow(row: unknown[]): LedgerRow {
  const [id, payload] = row;
  if (typeof id !== "string" || !(payload instanceof Uint8Array)) {
    throw new SeedTimeResealError(
      "A fund ledger row does not have the expected id and payload",
    );
  }
  return { id, payload };
}

/** Validate an entry's plaintext as the product's ledger payload. */
function ledgerPayloadOf(plaintext: Uint8Array, id: string): FundLedgerPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(plaintext));
  } catch (err: unknown) {
    throw new SeedTimeResealError(`The fund ledger entry ${id} is not JSON`, {
      cause: err,
    });
  }
  const result = fundLedgerPayloadSchema.safeParse(parsed);
  if (!result.success) {
    throw new SeedTimeResealError(
      `The fund ledger entry ${id} is not a ledger payload`,
    );
  }
  return result.data;
}

/** The entry's payload with recordedAt moved, sealed to the org key. */
function resealEntry(deps: FundLedgerResealDeps, row: LedgerRow): Uint8Array {
  const sodium = requireSodium();
  let plaintext: Uint8Array;
  try {
    plaintext = sodium.crypto_box_seal_open(
      row.payload,
      deps.orgPublicKey,
      deps.orgSecretKey,
    );
  } catch (err: unknown) {
    throw new SeedTimeResealError(
      `The fund ledger entry ${row.id} does not open under the demo org key`,
      { cause: err },
    );
  }

  let shifted: Uint8Array;
  try {
    const payload = ledgerPayloadOf(plaintext, row.id);
    const recordedAt = new Date(
      Date.parse(payload.recordedAt) + deps.deltaMs,
    ).toISOString();
    const next = fundLedgerPayloadSchema.safeParse({ ...payload, recordedAt });
    if (!next.success) {
      throw new SeedTimeResealError(
        `The shifted fund ledger entry ${row.id} is not a ledger payload`,
      );
    }
    shifted = new TextEncoder().encode(JSON.stringify(next.data));
  } finally {
    sodium.memzero(plaintext);
  }

  try {
    return sealForOrgKey(shifted, deps.orgPublicKey);
  } finally {
    sodium.memzero(shifted);
  }
}

/**
 * Reseal every fund ledger entry with its recordedAt moved by `deltaMs`,
 * in one transaction. Throws {@link SeedTimeResealError} when any entry
 * cannot be read, opened, parsed or written; the underlying failure is
 * its cause, and nothing is written.
 */
export async function resealFundLedger(
  deps: FundLedgerResealDeps,
): Promise<void> {
  if (!Number.isFinite(deps.deltaMs)) {
    throw new SeedTimeResealError(
      "The fund ledger time shift is not a finite number",
    );
  }
  const compiler = createStatementCompiler<FundLedgerResealDatabase>();
  const select = compiler
    .withSchema(deps.schema)
    .selectFrom("fund_ledger")
    .select(["id", "encrypted_payload"])
    .orderBy("id")
    .compile();

  try {
    await deps.pg.transaction(async (tx) => {
      const result = await tx.query<unknown[]>(
        select.sql,
        [...select.parameters],
        { rowMode: "array" },
      );
      for (const row of result.rows.map(toLedgerRow)) {
        const update = compiler
          .withSchema(deps.schema)
          .updateTable("fund_ledger")
          .set({ encrypted_payload: resealEntry(deps, row) })
          .where("id", "=", row.id)
          .compile();
        await tx.query(update.sql, [...update.parameters]);
      }
    });
  } catch (err: unknown) {
    if (err instanceof SeedTimeResealError) throw err;
    const reason = err instanceof Error ? err.message : String(err);
    throw new SeedTimeResealError(
      `Resealing the seeded fund ledger failed: ${reason}`,
      { cause: err },
    );
  }
}
