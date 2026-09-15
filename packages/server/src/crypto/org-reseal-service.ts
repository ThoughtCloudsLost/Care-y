/**
 * Org-key reseal service.
 *
 * After an org key rotation, data rows encrypted under the old org key must
 * be re-encrypted ("resealed") under the new one. The server cannot verify
 * plaintext (it never holds the org private key), so integrity is structural:
 * only rows whose org_key_generation is below current_key_generation may be
 * overwritten, the stamp bumps atomically in the same UPDATE, and the client
 * declares any rows it could not decrypt (skippedIds) rather than hiding
 * them. See ADR-102 for the design rationale.
 */

import type { Kysely, Transaction } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { ResealTableName, IndexTableName } from "@care-y/shared";
import {
  RESEAL_TABLE_NAMES,
  INDEX_TABLE_NAMES,
  queueIdSchema,
  noteTypeIdSchema,
  kbCategoryIdSchema,
  kbItemIdSchema,
  kbAttachmentIdSchema,
  presetReplyIdSchema,
  clientIdSchema,
  userIdSchema,
  sessionIdSchema,
  orgConfigIdSchema,
  consultantIdSchema,
  phoneBlocklistIdSchema,
  inviteTokenIdSchema,
  voicemailQuarantineIdSchema,
  phoneIdSchema,
  ticketIdSchema,
  followupIdSchema,
  intakeFormIdSchema,
  intakeFormFieldIdSchema,
  clientMergeEventIdSchema,
  emailIdSchema,
  aliasHashSchema,
  phoneMatchHashSchema,
  emailMatchHashSchema,
} from "@care-y/shared";
import { ConflictError, ValidationError } from "../errors.js";
import { toCount } from "../db/query-utils.js";

// ---------------------------------------------------------------------------
// Typed closure maps
//
// Each entry closes over its own literal table name so Kysely resolves column
// types statically. No string ever reaches an identifier position. This is
// the one write path where the server cannot verify content, so an explicit
// per-table allowlist that the type system enforces is the security property,
// not boilerplate.
// ---------------------------------------------------------------------------

interface ResealTableSpec {
  readonly columns: readonly string[];
  countPending(db: Kysely<TenantDatabase>, currentGen: number): Promise<number>;
  resealRow(
    tx: Transaction<TenantDatabase>,
    id: string | number,
    columns: Readonly<Record<string, Buffer>>,
    currentGen: number,
  ): Promise<number>;
}

/**
 * Closed map of org-sealed tables to their typed reseal closures. The key
 * set must be exactly RESEAL_TABLE_NAMES; the `satisfies` constraint below
 * enforces that at compile time. The Map built from this record is used for
 * runtime lookups so no computed property access reaches a plain object.
 */
const RESEAL_TABLES_RECORD: Record<ResealTableName, ResealTableSpec> = {
  queues: {
    columns: ["encrypted_name", "encrypted_color", "encrypted_icon"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("queues")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("queues")
        .set({
          ...(cols.encrypted_name !== undefined
            ? { encrypted_name: cols.encrypted_name }
            : {}),
          ...(cols.encrypted_color !== undefined
            ? { encrypted_color: cols.encrypted_color }
            : {}),
          ...(cols.encrypted_icon !== undefined
            ? { encrypted_icon: cols.encrypted_icon }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", queueIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  note_types: {
    columns: ["encrypted_name", "encrypted_icon", "encrypted_description"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("note_types")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("note_types")
        .set({
          ...(cols.encrypted_name !== undefined
            ? { encrypted_name: cols.encrypted_name }
            : {}),
          ...(cols.encrypted_icon !== undefined
            ? { encrypted_icon: cols.encrypted_icon }
            : {}),
          ...(cols.encrypted_description !== undefined
            ? { encrypted_description: cols.encrypted_description }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", noteTypeIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  kb_categories: {
    columns: ["encrypted_name", "encrypted_description"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("kb_categories")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("kb_categories")
        .set({
          ...(cols.encrypted_name !== undefined
            ? { encrypted_name: cols.encrypted_name }
            : {}),
          ...(cols.encrypted_description !== undefined
            ? { encrypted_description: cols.encrypted_description }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", kbCategoryIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  kb_items: {
    columns: ["encrypted_title", "encrypted_body", "encrypted_excerpt"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("kb_items")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("kb_items")
        .set({
          ...(cols.encrypted_title !== undefined
            ? { encrypted_title: cols.encrypted_title }
            : {}),
          ...(cols.encrypted_body !== undefined
            ? { encrypted_body: cols.encrypted_body }
            : {}),
          ...(cols.encrypted_excerpt !== undefined
            ? { encrypted_excerpt: cols.encrypted_excerpt }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", kbItemIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  kb_attachments: {
    columns: ["encrypted_filename"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("kb_attachments")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("kb_attachments")
        .set({
          ...(cols.encrypted_filename !== undefined
            ? { encrypted_filename: cols.encrypted_filename }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", kbAttachmentIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  preset_replies: {
    columns: ["encrypted_title", "encrypted_body"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("preset_replies")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("preset_replies")
        .set({
          ...(cols.encrypted_title !== undefined
            ? { encrypted_title: cols.encrypted_title }
            : {}),
          ...(cols.encrypted_body !== undefined
            ? { encrypted_body: cols.encrypted_body }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", presetReplyIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  clients: {
    columns: ["encrypted_alias"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("clients")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("clients")
        .set({
          ...(cols.encrypted_alias !== undefined
            ? { encrypted_alias: cols.encrypted_alias }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", clientIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  users: {
    columns: [
      "encrypted_identifier",
      "encrypted_display_name",
      "encrypted_preferred_locale",
    ],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("users")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("users")
        .set({
          ...(cols.encrypted_identifier !== undefined
            ? { encrypted_identifier: cols.encrypted_identifier }
            : {}),
          ...(cols.encrypted_display_name !== undefined
            ? { encrypted_display_name: cols.encrypted_display_name }
            : {}),
          ...(cols.encrypted_preferred_locale !== undefined
            ? { encrypted_preferred_locale: cols.encrypted_preferred_locale }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", userIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  sessions: {
    columns: ["encrypted_ip_address", "encrypted_user_agent"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("sessions")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("sessions")
        .set({
          ...(cols.encrypted_ip_address !== undefined
            ? { encrypted_ip_address: cols.encrypted_ip_address }
            : {}),
          ...(cols.encrypted_user_agent !== undefined
            ? { encrypted_user_agent: cols.encrypted_user_agent }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", sessionIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  org_config: {
    columns: ["encrypted_terminology"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("org_config")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("org_config")
        .set({
          ...(cols.encrypted_terminology !== undefined
            ? { encrypted_terminology: cols.encrypted_terminology }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", orgConfigIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  merge_candidate_dismissals: {
    columns: ["encrypted_dismissals"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("merge_candidate_dismissals")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      // merge_candidate_dismissals.id is a plain number, no branded schema
      const numId = Number(id);
      const result = await tx
        .updateTable("merge_candidate_dismissals")
        .set({
          ...(cols.encrypted_dismissals !== undefined
            ? { encrypted_dismissals: cols.encrypted_dismissals }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", numId)
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  consultants: {
    columns: ["encrypted_phone"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("consultants")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("consultants")
        .set({
          ...(cols.encrypted_phone !== undefined
            ? { encrypted_phone: cols.encrypted_phone }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", consultantIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  phone_blocklist: {
    columns: ["encrypted_number"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("phone_blocklist")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("phone_blocklist")
        .set({
          ...(cols.encrypted_number !== undefined
            ? { encrypted_number: cols.encrypted_number }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", phoneBlocklistIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  invite_tokens: {
    columns: ["encrypted_token", "encrypted_email"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("invite_tokens")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("invite_tokens")
        .set({
          ...(cols.encrypted_token !== undefined
            ? { encrypted_token: cols.encrypted_token }
            : {}),
          ...(cols.encrypted_email !== undefined
            ? { encrypted_email: cols.encrypted_email }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", inviteTokenIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  voicemail_quarantine: {
    columns: ["encrypted_caller_number", "encrypted_called_number"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("voicemail_quarantine")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("voicemail_quarantine")
        .set({
          ...(cols.encrypted_caller_number !== undefined
            ? { encrypted_caller_number: cols.encrypted_caller_number }
            : {}),
          ...(cols.encrypted_called_number !== undefined
            ? { encrypted_called_number: cols.encrypted_called_number }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", voicemailQuarantineIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  phones: {
    columns: ["encrypted_number"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("phones")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("phones")
        .set({
          ...(cols.encrypted_number !== undefined
            ? { encrypted_number: cols.encrypted_number }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", phoneIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  intake_key_wraps: {
    columns: ["wrapped_tk"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("intake_key_wraps")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      // intake_key_wraps keys on ticket_id, not id
      const result = await tx
        .updateTable("intake_key_wraps")
        .set({
          ...(cols.wrapped_tk !== undefined
            ? { wrapped_tk: cols.wrapped_tk }
            : {}),
          org_key_generation: gen,
        })
        .where("ticket_id", "=", ticketIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  portal_reply_key_wraps: {
    columns: ["wrapped_tk"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("portal_reply_key_wraps")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      // portal_reply_key_wraps keys on followup_id, not id
      const result = await tx
        .updateTable("portal_reply_key_wraps")
        .set({
          ...(cols.wrapped_tk !== undefined
            ? { wrapped_tk: cols.wrapped_tk }
            : {}),
          org_key_generation: gen,
        })
        .where("followup_id", "=", followupIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  intake_forms: {
    columns: ["encrypted_form_meta"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("intake_forms")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("intake_forms")
        .set({
          ...(cols.encrypted_form_meta !== undefined
            ? { encrypted_form_meta: cols.encrypted_form_meta }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", intakeFormIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  intake_form_fields: {
    columns: ["encrypted_label", "encrypted_config"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("intake_form_fields")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("intake_form_fields")
        .set({
          ...(cols.encrypted_label !== undefined
            ? { encrypted_label: cols.encrypted_label }
            : {}),
          ...(cols.encrypted_config !== undefined
            ? { encrypted_config: cols.encrypted_config }
            : {}),
          org_key_generation: gen,
        })
        .where("id", "=", intakeFormFieldIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  client_merge_events: {
    columns: ["snapshot"],
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("client_merge_events")
        .select(db.fn.countAll().as("count"))
        .where("org_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    resealRow: async (tx, id, cols, gen) => {
      const result = await tx
        .updateTable("client_merge_events")
        .set({
          ...(cols.snapshot !== undefined ? { snapshot: cols.snapshot } : {}),
          org_key_generation: gen,
        })
        .where("id", "=", clientMergeEventIdSchema.parse(id))
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },
} satisfies Record<ResealTableName, ResealTableSpec>;

// Runtime lookups go through a Map so no request-supplied string is ever a
// computed key on a plain object. The key type widens to string here, which
// is harmless. The `satisfies` above guarantees that every name in the shared
// list has a spec, and lookups only ever pass a name the schema validated.
const RESEAL_TABLES: ReadonlyMap<string, ResealTableSpec> = new Map(
  Object.entries(RESEAL_TABLES_RECORD),
);

// ---------------------------------------------------------------------------
// Blind-index closure map
//
// Same rationale as RESEAL_TABLES: each entry closes over a literal table
// name so no dynamic string reaches a Kysely identifier position. The type
// system enforces the allowlist.
// ---------------------------------------------------------------------------

interface IndexTableSpec {
  readonly column: string;
  countPending(db: Kysely<TenantDatabase>, currentGen: number): Promise<number>;
  reindexRow(
    tx: Transaction<TenantDatabase>,
    id: string | number,
    hash: string,
    currentGen: number,
  ): Promise<number>;
}

/**
 * Closed map of blind-index tables to their typed reindex closures.
 * The key set must be exactly INDEX_TABLE_NAMES; the `satisfies`
 * constraint below enforces that at compile time.
 */
const INDEX_TABLES_RECORD: Record<IndexTableName, IndexTableSpec> = {
  clients: {
    column: "alias_hash",
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("clients")
        .select(db.fn.countAll().as("count"))
        .where("index_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    reindexRow: async (tx, id, hash, gen) => {
      // care-y-ignore-next-line no-plaintext-db-write -- hash is a browser-computed HMAC blind index, not plaintext PII
      const result = await tx
        .updateTable("clients")
        .set({
          alias_hash: aliasHashSchema.parse(hash),
          index_key_generation: gen,
        })
        .where("id", "=", clientIdSchema.parse(id))
        .where("index_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  phones: {
    column: "phone_match_hash",
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("phones")
        .select(db.fn.countAll().as("count"))
        .where("index_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    reindexRow: async (tx, id, hash, gen) => {
      // care-y-ignore-next-line no-plaintext-db-write -- hash is a browser-computed HMAC blind index, not plaintext PII
      const result = await tx
        .updateTable("phones")
        .set({
          phone_match_hash: phoneMatchHashSchema.parse(hash),
          index_key_generation: gen,
        })
        .where("id", "=", phoneIdSchema.parse(id))
        .where("index_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },

  emails: {
    column: "email_match_hash",
    countPending: async (db, gen) => {
      const r = await db
        .selectFrom("emails")
        .select(db.fn.countAll().as("count"))
        .where("index_key_generation", "<", gen)
        .executeTakeFirstOrThrow();
      return toCount(r);
    },
    reindexRow: async (tx, id, hash, gen) => {
      // care-y-ignore-next-line no-plaintext-db-write -- hash is a browser-computed HMAC blind index, not plaintext PII
      const result = await tx
        .updateTable("emails")
        .set({
          email_match_hash: emailMatchHashSchema.parse(hash),
          index_key_generation: gen,
        })
        .where("id", "=", emailIdSchema.parse(id))
        .where("index_key_generation", "<", gen)
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    },
  },
} satisfies Record<IndexTableName, IndexTableSpec>;

// Built the same way as RESEAL_TABLES above, and for the same reason.
const INDEX_TABLES: ReadonlyMap<string, IndexTableSpec> = new Map(
  Object.entries(INDEX_TABLES_RECORD),
);

// ---------------------------------------------------------------------------
// Spec lookup helpers
//
// Wrapping the Map.get() + existence check in a function keeps the service
// methods focused on their own logic and provides a clear ValidationError
// for any table name that somehow bypasses the type system at runtime.
// ---------------------------------------------------------------------------

function getResealSpec(table: ResealTableName): ResealTableSpec {
  const spec = RESEAL_TABLES.get(table);
  if (spec === undefined) {
    throw new ValidationError(`Unknown reseal table: ${table}`);
  }
  return spec;
}

function getIndexSpec(table: IndexTableName): IndexTableSpec {
  const spec = INDEX_TABLES.get(table);
  if (spec === undefined) {
    throw new ValidationError(`Unknown index table: ${table}`);
  }
  return spec;
}

// ---------------------------------------------------------------------------
// Service interface and implementation
// ---------------------------------------------------------------------------

export interface ResealStatusRow {
  readonly table: ResealTableName;
  readonly pending: number;
}

export interface IndexStatusRow {
  readonly table: IndexTableName;
  readonly pending: number;
}

export interface ResealStatusResult {
  readonly currentGeneration: number;
  readonly tables: readonly ResealStatusRow[];
  readonly indexTables: readonly IndexStatusRow[];
}

export interface ResealRowInput {
  readonly id: string | number;
  readonly columns: Record<string, Buffer>;
}

export interface ResealRowsInput {
  readonly table: ResealTableName;
  readonly rows: readonly ResealRowInput[];
  readonly skippedIds: readonly (string | number)[];
}

export interface ResealRowsResult {
  readonly resealed: number;
  readonly skipped: number;
}

export interface ReindexRowInput {
  readonly id: string | number;
  readonly hash: string;
}

export interface ReindexRowsInput {
  readonly table: IndexTableName;
  readonly rows: readonly ReindexRowInput[];
  readonly skippedIds: readonly (string | number)[];
}

export interface ReindexRowsResult {
  readonly reindexed: number;
  readonly skipped: number;
}

export interface OrgResealService {
  resealStatus(): Promise<ResealStatusResult>;
  resealRows(input: ResealRowsInput): Promise<ResealRowsResult>;
  reindexRows(input: ReindexRowsInput): Promise<ReindexRowsResult>;
}

export function createOrgResealService(
  db: Kysely<TenantDatabase>,
): OrgResealService {
  return {
    async resealStatus(): Promise<ResealStatusResult> {
      const config = await db
        .selectFrom("org_config")
        .select("current_key_generation")
        .executeTakeFirstOrThrow();

      const currentGen = config.current_key_generation;

      const tables: ResealStatusRow[] = [];

      for (const name of RESEAL_TABLE_NAMES) {
        const spec = getResealSpec(name);
        const pending = await spec.countPending(db, currentGen);
        tables.push({ table: name, pending });
      }

      const indexTables: IndexStatusRow[] = [];

      for (const name of INDEX_TABLE_NAMES) {
        const spec = getIndexSpec(name);
        const pending = await spec.countPending(db, currentGen);
        indexTables.push({ table: name, pending });
      }

      return { currentGeneration: currentGen, tables, indexTables };
    },

    async resealRows(input: ResealRowsInput): Promise<ResealRowsResult> {
      const spec = getResealSpec(input.table);

      // Validate every column key against the closed allowlist
      const allowedSet = new Set(spec.columns);
      for (const row of input.rows) {
        for (const col of Object.keys(row.columns)) {
          if (!allowedSet.has(col)) {
            throw new ValidationError(
              `Column "${col}" is not in the reseal allowlist for table "${input.table}"`,
            );
          }
        }
      }

      return db.transaction().execute(async (tx) => {
        const config = await tx
          .selectFrom("org_config")
          .select("current_key_generation")
          .executeTakeFirstOrThrow();

        const currentGen = config.current_key_generation;

        let resealed = 0;

        for (const row of input.rows) {
          const affected = await spec.resealRow(
            tx,
            row.id,
            row.columns,
            currentGen,
          );

          if (affected === 0) {
            throw new ConflictError(
              `Reseal conflict: row ${String(row.id)} in "${input.table}" was already at current generation, missing, or raced`,
            );
          }

          resealed++;
        }

        return { resealed, skipped: input.skippedIds.length };
      });
    },

    async reindexRows(input: ReindexRowsInput): Promise<ReindexRowsResult> {
      const spec = getIndexSpec(input.table);

      return db.transaction().execute(async (tx) => {
        const config = await tx
          .selectFrom("org_config")
          .select("current_key_generation")
          .executeTakeFirstOrThrow();

        const currentGen = config.current_key_generation;

        let reindexed = 0;

        for (const row of input.rows) {
          const affected = await spec.reindexRow(
            tx,
            row.id,
            row.hash,
            currentGen,
          );

          if (affected === 0) {
            throw new ConflictError(
              `Reindex conflict: row ${String(row.id)} in "${input.table}" was already at current index generation, missing, or raced`,
            );
          }

          reindexed++;
        }

        return { reindexed, skipped: input.skippedIds.length };
      });
    },
  };
}
