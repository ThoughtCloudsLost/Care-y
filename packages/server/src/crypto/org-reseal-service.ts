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
import type {
  ResealTableName,
  IndexTableName,
  ResealBlobTableName,
  BlobKey,
  FormAssetId,
} from "@care-y/shared";
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
  formAssetIdSchema,
  orgSchemaNameSchema,
  VOICEMAIL_QUARANTINE_MAX_BYTES,
  KB_ATTACHMENT_MAX_BYTES,
} from "@care-y/shared";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import type { BlobStore, BlobCategory } from "../storage/store.js";
import { ConflictError, ValidationError } from "../errors.js";
import { toCount } from "../db/query-utils.js";
import { phoneForViewer, emailForViewer } from "../utils/sql.js";

// ---------------------------------------------------------------------------
// Typed closure maps
//
// Each entry closes over its own literal table name so Kysely resolves column
// types statically. No string ever reaches an identifier position. This is
// the one write path where the server cannot verify content, so an explicit
// per-table allowlist that the type system enforces is the security property,
// not boilerplate.
// ---------------------------------------------------------------------------

interface ResealPendingRow {
  readonly id: string | number;
  readonly columns: Record<string, Buffer>;
}

interface ResealTableSpec {
  readonly columns: readonly string[];
  countPending(db: Kysely<TenantDatabase>, currentGen: number): Promise<number>;
  fetchPending(
    db: Kysely<TenantDatabase>,
    currentGen: number,
    limit: number,
    excludeIds: readonly (string | number)[],
    onlyIds: readonly (string | number)[] | undefined,
  ): Promise<ResealPendingRow[]>;
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("queues")
        .select(["id", "encrypted_name", "encrypted_color", "encrypted_icon"])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => queueIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => queueIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {
          encrypted_name: r.encrypted_name,
        };
        if (r.encrypted_color !== null)
          columns.encrypted_color = r.encrypted_color;
        if (r.encrypted_icon !== null)
          columns.encrypted_icon = r.encrypted_icon;
        return { id: r.id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("note_types")
        .select([
          "id",
          "encrypted_name",
          "encrypted_icon",
          "encrypted_description",
        ])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => noteTypeIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => noteTypeIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {
          encrypted_name: r.encrypted_name,
          encrypted_icon: r.encrypted_icon,
        };
        if (r.encrypted_description !== null)
          columns.encrypted_description = r.encrypted_description;
        return { id: r.id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("kb_categories")
        .select(["id", "encrypted_name", "encrypted_description"])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => kbCategoryIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => kbCategoryIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {
          encrypted_name: r.encrypted_name,
        };
        if (r.encrypted_description !== null)
          columns.encrypted_description = r.encrypted_description;
        return { id: r.id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("kb_items")
        .select([
          "id",
          "encrypted_title",
          "encrypted_body",
          "encrypted_excerpt",
        ])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => kbItemIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => kbItemIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {
          encrypted_title: r.encrypted_title,
          encrypted_body: r.encrypted_body,
        };
        if (r.encrypted_excerpt !== null)
          columns.encrypted_excerpt = r.encrypted_excerpt;
        return { id: r.id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("kb_attachments")
        .select(["id", "encrypted_filename"])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => kbAttachmentIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => kbAttachmentIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {};
        if (r.encrypted_filename !== null)
          columns.encrypted_filename = r.encrypted_filename;
        return { id: r.id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("preset_replies")
        .select(["id", "encrypted_title", "encrypted_body"])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => presetReplyIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => presetReplyIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {
          encrypted_title: r.encrypted_title,
          encrypted_body: r.encrypted_body,
        };
        return { id: r.id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("clients")
        .select(["id", "encrypted_alias"])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => clientIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => clientIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {
          encrypted_alias: r.encrypted_alias,
        };
        return { id: r.id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("users")
        .select([
          "id",
          "encrypted_identifier",
          "encrypted_display_name",
          "encrypted_preferred_locale",
        ])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => userIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => userIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {
          encrypted_identifier: r.encrypted_identifier,
          encrypted_display_name: r.encrypted_display_name,
        };
        if (r.encrypted_preferred_locale !== null)
          columns.encrypted_preferred_locale = r.encrypted_preferred_locale;
        return { id: r.id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("sessions")
        .select(["id", "encrypted_ip_address", "encrypted_user_agent"])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => sessionIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => sessionIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {
          encrypted_ip_address: r.encrypted_ip_address,
          encrypted_user_agent: r.encrypted_user_agent,
        };
        return { id: r.id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("org_config")
        .select(["id", "encrypted_terminology"])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => orgConfigIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => orgConfigIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {};
        if (r.encrypted_terminology !== null)
          columns.encrypted_terminology = r.encrypted_terminology;
        return { id: r.id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("merge_candidate_dismissals")
        .select(["id", "encrypted_dismissals"])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        // merge_candidate_dismissals.id is a plain number, no branded schema
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => Number(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        // merge_candidate_dismissals.id is a plain number, no branded schema
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => Number(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {
          encrypted_dismissals: r.encrypted_dismissals,
        };
        return { id: r.id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("consultants")
        .select(["id", "encrypted_phone"])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => consultantIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => consultantIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {};
        if (r.encrypted_phone !== null)
          columns.encrypted_phone = r.encrypted_phone;
        return { id: r.id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("phone_blocklist")
        .select(["id", "encrypted_number"])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => phoneBlocklistIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => phoneBlocklistIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {
          encrypted_number: r.encrypted_number,
        };
        return { id: r.id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("invite_tokens")
        .select(["id", "encrypted_token", "encrypted_email"])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => inviteTokenIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => inviteTokenIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {};
        if (r.encrypted_token !== null)
          columns.encrypted_token = r.encrypted_token;
        if (r.encrypted_email !== null)
          columns.encrypted_email = r.encrypted_email;
        return { id: r.id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("voicemail_quarantine")
        .select(["id", "encrypted_caller_number", "encrypted_called_number"])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => voicemailQuarantineIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => voicemailQuarantineIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {};
        if (r.encrypted_caller_number !== null)
          columns.encrypted_caller_number = r.encrypted_caller_number;
        if (r.encrypted_called_number !== null)
          columns.encrypted_called_number = r.encrypted_called_number;
        return { id: r.id, columns };
      });
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

  // phones: removed. encrypted_number converged to OPS tier (ADR-005/069/096).
  // The phone_match_hash index sweep (INDEX_TABLE_NAMES) is unaffected.

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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      // intake_key_wraps keys on ticket_id, not id
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("intake_key_wraps")
        .select(["ticket_id", "wrapped_tk"])
        .where("org_key_generation", "<", gen)
        .orderBy("ticket_id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "ticket_id",
          "not in",
          excludeIds.map((v) => ticketIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "ticket_id",
          "in",
          onlyIds.map((v) => ticketIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {
          wrapped_tk: r.wrapped_tk,
        };
        return { id: r.ticket_id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      // portal_reply_key_wraps keys on followup_id, not id
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("portal_reply_key_wraps")
        .select(["followup_id", "wrapped_tk"])
        .where("org_key_generation", "<", gen)
        .orderBy("followup_id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "followup_id",
          "not in",
          excludeIds.map((v) => followupIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "followup_id",
          "in",
          onlyIds.map((v) => followupIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {
          wrapped_tk: r.wrapped_tk,
        };
        return { id: r.followup_id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("intake_forms")
        .select(["id", "encrypted_form_meta"])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => intakeFormIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => intakeFormIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {};
        if (r.encrypted_form_meta !== null)
          columns.encrypted_form_meta = r.encrypted_form_meta;
        return { id: r.id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("intake_form_fields")
        .select(["id", "encrypted_label", "encrypted_config"])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => intakeFormFieldIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => intakeFormFieldIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {
          encrypted_label: r.encrypted_label,
          encrypted_config: r.encrypted_config,
        };
        return { id: r.id, columns };
      });
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
    fetchPending: async (db, gen, limit, excludeIds, onlyIds) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("client_merge_events")
        .select(["id", "snapshot"])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => clientMergeEventIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined && onlyIds.length > 0) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => clientMergeEventIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {
          snapshot: r.snapshot,
        };
        return { id: r.id, columns };
      });
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
// Blob-carrying table closure map
//
// Tables whose rows pair sealed columns with a sealed blob under one
// org_key_generation stamp. These reseal one row at a time because blobs
// are large. Each entry closes over its literal table name for the same
// reason as RESEAL_TABLES: no dynamic string reaches a Kysely identifier
// position. The type system enforces the allowlist via satisfies.
// ---------------------------------------------------------------------------

interface ResealBlobPendingRow {
  readonly id: string;
  readonly blobKey: BlobKey;
  readonly columns: Record<string, Buffer>;
}

interface ResealBlobTableSpec {
  readonly columns: readonly string[];
  readonly maxBlobBytes: number;
  readonly blobCategory: BlobCategory;
  fetchPending(
    db: Kysely<TenantDatabase>,
    currentGen: number,
    limit: number,
    excludeIds: readonly (string | number)[],
  ): Promise<ResealBlobPendingRow[]>;
  resealRow(
    tx: Transaction<TenantDatabase>,
    id: string,
    columns: Readonly<Record<string, Buffer>>,
    newBlobKey: BlobKey,
    currentGen: number,
  ): Promise<{ affected: number; oldBlobKey: BlobKey | null }>;
}

const RESEAL_BLOB_TABLES_RECORD: Record<
  ResealBlobTableName,
  ResealBlobTableSpec
> = {
  voicemail_quarantine: {
    columns: ["encrypted_caller_number", "encrypted_called_number"],
    maxBlobBytes: VOICEMAIL_QUARANTINE_MAX_BYTES,
    blobCategory: "quarantine",
    fetchPending: async (db, gen, limit, excludeIds) => {
      let q = db
        .selectFrom("voicemail_quarantine")
        .select([
          "id",
          "blob_key",
          "encrypted_caller_number",
          "encrypted_called_number",
        ])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => voicemailQuarantineIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {};
        if (r.encrypted_caller_number !== null)
          columns.encrypted_caller_number = r.encrypted_caller_number;
        if (r.encrypted_called_number !== null)
          columns.encrypted_called_number = r.encrypted_called_number;
        return { id: r.id, blobKey: r.blob_key, columns };
      });
    },
    resealRow: async (tx, id, cols, newBlobKey, gen) => {
      const parsed = voicemailQuarantineIdSchema.parse(id);
      // Read the old blob_key before updating so we can delete it after commit
      const existing = await tx
        .selectFrom("voicemail_quarantine")
        .select("blob_key")
        .where("id", "=", parsed)
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      if (!existing) return { affected: 0, oldBlobKey: null };

      const result = await tx
        .updateTable("voicemail_quarantine")
        .set({
          ...(cols.encrypted_caller_number !== undefined
            ? { encrypted_caller_number: cols.encrypted_caller_number }
            : {}),
          ...(cols.encrypted_called_number !== undefined
            ? { encrypted_called_number: cols.encrypted_called_number }
            : {}),
          blob_key: newBlobKey,
          org_key_generation: gen,
        })
        .where("id", "=", parsed)
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return {
        affected: Number(result.numUpdatedRows),
        oldBlobKey: existing.blob_key,
      };
    },
  },

  kb_attachments: {
    columns: ["encrypted_filename"],
    maxBlobBytes: KB_ATTACHMENT_MAX_BYTES,
    blobCategory: "kb-attachment",
    fetchPending: async (db, gen, limit, excludeIds) => {
      let q = db
        .selectFrom("kb_attachments")
        .select(["id", "blob_key", "encrypted_filename"])
        .where("org_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => kbAttachmentIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => {
        const columns: Record<string, Buffer> = {};
        if (r.encrypted_filename !== null)
          columns.encrypted_filename = r.encrypted_filename;
        return { id: r.id, blobKey: r.blob_key, columns };
      });
    },
    resealRow: async (tx, id, cols, newBlobKey, gen) => {
      const parsed = kbAttachmentIdSchema.parse(id);
      const existing = await tx
        .selectFrom("kb_attachments")
        .select("blob_key")
        .where("id", "=", parsed)
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      if (!existing) return { affected: 0, oldBlobKey: null };

      const result = await tx
        .updateTable("kb_attachments")
        .set({
          ...(cols.encrypted_filename !== undefined
            ? { encrypted_filename: cols.encrypted_filename }
            : {}),
          blob_key: newBlobKey,
          org_key_generation: gen,
        })
        .where("id", "=", parsed)
        .where("org_key_generation", "<", gen)
        .executeTakeFirst();
      return {
        affected: Number(result.numUpdatedRows),
        oldBlobKey: existing.blob_key,
      };
    },
  },
} satisfies Record<ResealBlobTableName, ResealBlobTableSpec>;

const RESEAL_BLOB_TABLES: ReadonlyMap<string, ResealBlobTableSpec> = new Map(
  Object.entries(RESEAL_BLOB_TABLES_RECORD),
);

function getResealBlobSpec(table: ResealBlobTableName): ResealBlobTableSpec {
  const spec = RESEAL_BLOB_TABLES.get(table);
  if (spec === undefined) {
    throw new ValidationError(`Unknown reseal blob table: ${table}`);
  }
  return spec;
}

// ---------------------------------------------------------------------------
// Blind-index closure map
//
// Same rationale as RESEAL_TABLES: each entry closes over a literal table
// name so no dynamic string reaches a Kysely identifier position. The type
// system enforces the allowlist.
// ---------------------------------------------------------------------------

/** Per-table return from index fetchPending. Clients carry org-key ciphertext
 *  (browser decrypts). Phones/emails carry OPS-decrypted plaintext (server
 *  decrypts via phoneForViewer/emailForViewer so the browser can re-hash). */
type IndexPendingRow =
  | { readonly id: string | number; readonly encryptedAlias: Buffer | null }
  | { readonly id: string | number; readonly plaintext: string | null };

interface IndexTableSpec {
  readonly column: string;
  countPending(db: Kysely<TenantDatabase>, currentGen: number): Promise<number>;
  fetchPending(
    db: Kysely<TenantDatabase>,
    currentGen: number,
    limit: number,
    excludeIds: readonly (string | number)[],
    piiUnmasked: boolean,
    fieldEncryptor: FieldEncryptor | null,
    onlyIds?: readonly (string | number)[],
  ): Promise<IndexPendingRow[]>;
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
    fetchPending: async (
      db,
      gen,
      limit,
      excludeIds,
      _piiUnmasked,
      _fieldEncryptor,
      onlyIds,
    ) => {
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("clients")
        .select(["id", "encrypted_alias"])
        .where("index_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => clientIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => clientIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => ({
        id: r.id,
        encryptedAlias: r.encrypted_alias,
      }));
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
    // Masked values cannot be hashed, so return empty when piiUnmasked is false.
    fetchPending: async (
      db,
      gen,
      limit,
      excludeIds,
      piiUnmasked,
      fieldEncryptor,
      onlyIds,
    ) => {
      if (!piiUnmasked || !fieldEncryptor) return [];
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("phones")
        .select(["id", "encrypted_number"])
        .where("index_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => phoneIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => phoneIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => ({
        id: r.id,
        // care-y-ignore-next-line server-no-decrypt -- OPS_SECRETS_KEY operational decryption for blind-index re-derivation (ADR-005)
        plaintext: phoneForViewer(r.encrypted_number, true, fieldEncryptor),
      }));
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
    // Masked values cannot be hashed, so return empty when piiUnmasked is false.
    fetchPending: async (
      db,
      gen,
      limit,
      excludeIds,
      piiUnmasked,
      fieldEncryptor,
      onlyIds,
    ) => {
      if (!piiUnmasked || !fieldEncryptor) return [];
      if (onlyIds?.length === 0) return [];
      let q = db
        .selectFrom("emails")
        .select(["id", "encrypted_address"])
        .where("index_key_generation", "<", gen)
        .orderBy("id")
        .limit(limit);
      if (excludeIds.length > 0) {
        q = q.where(
          "id",
          "not in",
          excludeIds.map((v) => emailIdSchema.parse(v)),
        );
      }
      if (onlyIds !== undefined) {
        q = q.where(
          "id",
          "in",
          onlyIds.map((v) => emailIdSchema.parse(v)),
        );
      }
      const rows = await q.execute();
      return rows.map((r) => ({
        id: r.id,
        // care-y-ignore-next-line server-no-decrypt -- OPS_SECRETS_KEY operational decryption for blind-index re-derivation (ADR-005)
        plaintext: emailForViewer(r.encrypted_address, true, fieldEncryptor),
      }));
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

export interface ResealPendingInput {
  readonly table: ResealTableName;
  readonly limit: number;
  readonly excludeIds: readonly (string | number)[];
  readonly onlyIds?: readonly (string | number)[];
}

export interface ResealPendingResult {
  readonly currentGeneration: number;
  readonly rows: readonly ResealPendingRow[];
}

export interface ReindexPendingInput {
  readonly table: IndexTableName;
  readonly limit: number;
  readonly excludeIds: readonly (string | number)[];
  readonly piiUnmasked: boolean;
  readonly onlyIds?: readonly (string | number)[];
}

export interface ReindexPendingResult {
  readonly currentGeneration: number;
  readonly rows: readonly IndexPendingRow[];
}

export interface ResealBlobPendingInput {
  readonly table: ResealBlobTableName;
  readonly limit: number;
  readonly excludeIds: readonly (string | number)[];
}

export interface ResealBlobPendingResultRow {
  readonly id: string;
  readonly columns: Record<string, Buffer>;
  readonly blob: Buffer;
}

export interface ResealBlobPendingResult {
  readonly currentGeneration: number;
  readonly rows: readonly ResealBlobPendingResultRow[];
}

export interface ResealBlobRowInput {
  readonly table: ResealBlobTableName;
  readonly id: string;
  readonly columns: Record<string, Buffer>;
  readonly blob: Buffer;
}

export interface FormAssetRow {
  readonly blobId: FormAssetId;
  readonly contentType: string;
}

export interface OrgResealService {
  resealStatus(): Promise<ResealStatusResult>;
  resealPending(input: ResealPendingInput): Promise<ResealPendingResult>;
  resealRows(input: ResealRowsInput): Promise<ResealRowsResult>;
  reindexPending(input: ReindexPendingInput): Promise<ReindexPendingResult>;
  reindexRows(input: ReindexRowsInput): Promise<ReindexRowsResult>;
  resealBlobPending(
    input: ResealBlobPendingInput,
  ): Promise<ResealBlobPendingResult>;
  resealBlobRow(input: ResealBlobRowInput): Promise<void>;
  listFormAssetsForReseal(): Promise<readonly FormAssetRow[]>;
  getFormAssetBlob(blobId: string): Promise<Buffer>;
  replaceFormAssetBlob(blobId: string, blob: Buffer): Promise<void>;
}

export function createOrgResealService(
  db: Kysely<TenantDatabase>,
  fieldEncryptor?: FieldEncryptor | null,
  blobStore?: BlobStore | null,
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

    async resealPending(
      input: ResealPendingInput,
    ): Promise<ResealPendingResult> {
      const spec = getResealSpec(input.table);

      const config = await db
        .selectFrom("org_config")
        .select("current_key_generation")
        .executeTakeFirstOrThrow();

      const currentGen = config.current_key_generation;
      const rows = await spec.fetchPending(
        db,
        currentGen,
        input.limit,
        input.excludeIds,
        input.onlyIds,
      );
      return { currentGeneration: currentGen, rows };
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

    async reindexPending(
      input: ReindexPendingInput,
    ): Promise<ReindexPendingResult> {
      const spec = getIndexSpec(input.table);

      const config = await db
        .selectFrom("org_config")
        .select("current_key_generation")
        .executeTakeFirstOrThrow();

      const currentGen = config.current_key_generation;
      const rows = await spec.fetchPending(
        db,
        currentGen,
        input.limit,
        input.excludeIds,
        input.piiUnmasked,
        fieldEncryptor ?? null,
        input.onlyIds,
      );
      return { currentGeneration: currentGen, rows };
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

    async resealBlobPending(
      input: ResealBlobPendingInput,
    ): Promise<ResealBlobPendingResult> {
      if (!blobStore) {
        throw new ValidationError("BlobStore is required for blob reseal");
      }

      const spec = getResealBlobSpec(input.table);

      const config = await db
        .selectFrom("org_config")
        .select("current_key_generation")
        .executeTakeFirstOrThrow();

      const currentGen = config.current_key_generation;
      const rows = await spec.fetchPending(
        db,
        currentGen,
        input.limit,
        input.excludeIds,
      );

      const result: ResealBlobPendingResultRow[] = [];
      for (const row of rows) {
        const blob = await blobStore.get(row.blobKey);
        if (!blob) {
          // Blob missing from store. Skip this row rather than failing
          // the entire batch; the row stays pending and will be reported
          // in status counts.
          continue;
        }
        result.push({ id: row.id, columns: row.columns, blob });
      }

      return { currentGeneration: currentGen, rows: result };
    },

    async resealBlobRow(input: ResealBlobRowInput): Promise<void> {
      if (!blobStore) {
        throw new ValidationError("BlobStore is required for blob reseal");
      }

      const spec = getResealBlobSpec(input.table);

      // Validate column keys against the closed allowlist
      const allowedSet = new Set(spec.columns);
      for (const col of Object.keys(input.columns)) {
        if (!allowedSet.has(col)) {
          throw new ValidationError(
            `Column "${col}" is not in the reseal allowlist for table "${input.table}"`,
          );
        }
      }

      // Size cap on the decoded blob
      if (input.blob.byteLength > spec.maxBlobBytes) {
        throw new ValidationError(
          `Blob exceeds ${String(spec.maxBlobBytes)} byte limit for table "${input.table}"`,
        );
      }

      const config = await db
        .selectFrom("org_config")
        .select("current_key_generation")
        .executeTakeFirstOrThrow();

      const currentGen = config.current_key_generation;

      // Read the blob key from the existing row to extract the org schema
      // namespace. Explicit per-table branches avoid dynamic table names in
      // Kysely identifier positions.
      let existingBlobKey: BlobKey | undefined;
      if (input.table === "voicemail_quarantine") {
        const row = await db
          .selectFrom("voicemail_quarantine")
          .select("blob_key")
          .where("id", "=", voicemailQuarantineIdSchema.parse(input.id))
          .executeTakeFirst();
        existingBlobKey = row?.blob_key;
      } else {
        const row = await db
          .selectFrom("kb_attachments")
          .select("blob_key")
          .where("id", "=", kbAttachmentIdSchema.parse(input.id))
          .executeTakeFirst();
        existingBlobKey = row?.blob_key;
      }

      if (!existingBlobKey) {
        throw new ConflictError(
          `Row ${input.id} not found in "${input.table}"`,
        );
      }

      // Blob key format is <orgSchema>/<category>/<uuid>
      const keyParts = existingBlobKey.split("/");
      const blobOrgSchema = keyParts[0];
      if (blobOrgSchema === undefined || blobOrgSchema === "") {
        throw new ValidationError("Could not parse org schema from blob key");
      }

      const newBlobKey = await blobStore.put(
        orgSchemaNameSchema.parse(blobOrgSchema),
        spec.blobCategory,
        input.blob,
      );

      try {
        const { affected, oldBlobKey } = await db
          .transaction()
          .execute(async (tx) => {
            return spec.resealRow(
              tx,
              input.id,
              input.columns,
              newBlobKey,
              currentGen,
            );
          });

        if (affected === 0) {
          // Transaction did not update (row already at current generation or
          // raced). Clean up the new blob we just wrote.
          await blobStore.delete(newBlobKey).catch((_: unknown) => {
            // Orphaned blob is harmless; swallow delete failure
          });
          throw new ConflictError(
            `Reseal conflict: row ${input.id} in "${input.table}" was already at current generation, missing, or raced`,
          );
        }

        // Delete the old blob best-effort after commit.
        // oldBlobKey is always present when affected > 0 (the spec returns
        // null only when the row was not found, which implies affected === 0).
        if (oldBlobKey) {
          await blobStore.delete(oldBlobKey).catch((_: unknown) => {
            console.error(
              `Failed to delete old blob ${oldBlobKey} after reseal of ${input.table}:${input.id}`,
            );
          });
        }
      } catch (err: unknown) {
        if (err instanceof ConflictError) throw err;
        // Transaction failed. Delete the new blob best-effort.
        await blobStore.delete(newBlobKey).catch((_: unknown) => {
          // Orphaned blob is harmless; swallow delete failure
        });
        throw err;
      }
    },

    async listFormAssetsForReseal(): Promise<readonly FormAssetRow[]> {
      const rows = await db
        .selectFrom("form_assets")
        .select(["blob_id", "content_type"])
        .execute();

      return rows.map((r) => ({
        blobId: r.blob_id,
        contentType: r.content_type,
      }));
    },

    async getFormAssetBlob(blobId: string): Promise<Buffer> {
      if (!blobStore) {
        throw new ValidationError(
          "BlobStore is required for form asset reseal",
        );
      }

      const parsed = formAssetIdSchema.parse(blobId);
      const asset = await db
        .selectFrom("form_assets")
        .select("blob_key")
        .where("blob_id", "=", parsed)
        .executeTakeFirst();

      if (!asset) {
        throw new ValidationError(`Form asset not found: ${blobId}`);
      }

      const blob = await blobStore.get(asset.blob_key);
      if (!blob) {
        throw new ValidationError(
          `Form asset blob missing from store: ${blobId}`,
        );
      }

      return blob;
    },

    async replaceFormAssetBlob(blobId: string, blob: Buffer): Promise<void> {
      if (!blobStore) {
        throw new ValidationError(
          "BlobStore is required for form asset reseal",
        );
      }

      // Size cap: form assets use KB_ATTACHMENT_MAX_BYTES
      if (blob.byteLength > KB_ATTACHMENT_MAX_BYTES) {
        throw new ValidationError(
          `Form asset blob exceeds ${String(KB_ATTACHMENT_MAX_BYTES)} byte limit`,
        );
      }

      const parsed = formAssetIdSchema.parse(blobId);
      const asset = await db
        .selectFrom("form_assets")
        .select("blob_key")
        .where("blob_id", "=", parsed)
        .executeTakeFirst();

      if (!asset) {
        throw new ValidationError(`Form asset not found: ${blobId}`);
      }

      // Overwrite the SAME blob key in the store. Form asset references
      // in rich text use the blob_id URL, so the key must not change.
      const existingBlob = await blobStore.get(asset.blob_key);
      if (!existingBlob) {
        throw new ValidationError(
          `Form asset blob missing from store: ${blobId}`,
        );
      }

      // The BlobStore.put() generates a new key. For in-place overwrite,
      // we delete the old blob and put a new one, then update the DB
      // record to point to the new key. Since the serving handler resolves
      // blob_id -> blob_key from the DB, changing the key is transparent.
      const keyParts = asset.blob_key.split("/");
      const blobOrgSchema = keyParts[0];
      if (blobOrgSchema === undefined || blobOrgSchema === "") {
        throw new ValidationError("Could not parse org schema from blob key");
      }

      const newBlobKey = await blobStore.put(
        orgSchemaNameSchema.parse(blobOrgSchema),
        "form-asset",
        blob,
      );

      try {
        await db
          .updateTable("form_assets")
          .set({ blob_key: newBlobKey })
          .where("blob_id", "=", parsed)
          .execute();
      } catch (err: unknown) {
        // DB update failed; clean up the new blob
        await blobStore.delete(newBlobKey).catch((_: unknown) => {
          // Orphaned blob is harmless
        });
        throw err;
      }

      // Delete the old blob best-effort
      await blobStore.delete(asset.blob_key).catch((_: unknown) => {
        console.error(
          `Failed to delete old form asset blob ${asset.blob_key} after reseal`,
        );
      });
    },
  };
}
