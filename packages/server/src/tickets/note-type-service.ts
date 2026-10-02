/**
 * Note type CRUD service.
 *
 * Note type names and icons are org-key encrypted (sealed box). The server
 * stores and returns them as opaque bytea; only the client can decrypt.
 * Escalation targets are encrypted with the operational secrets key so the
 * server can decrypt them for notification routing.
 */

import type { Kysely, Updateable } from "kysely";
import type { TenantDatabase, NoteTypesTable } from "../db/types.js";
import type { SecretsEncryptor } from "../config/secrets.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import {
  escalationTargetSchema,
  meetsRoleThreshold,
  RoleId,
  ErrorCode,
} from "@care-y/shared";
import type {
  EscalationTarget,
  NoteTypeId,
  RoleIdValue,
  UserId,
} from "@care-y/shared";
import { ForbiddenError, NotFoundError } from "../errors.js";
import { z } from "zod";

export interface NoteTypeRecord {
  readonly id: NoteTypeId;
  readonly encryptedName: Buffer;
  readonly encryptedIcon: Buffer;
  readonly encryptedDescription: Buffer | null;
  readonly isActive: boolean;
  readonly requiresOnClose: boolean;
  readonly minViewRole: RoleIdValue;
  readonly minCreateRole: RoleIdValue;
  readonly createdAt: Date;
  readonly notificationHints: readonly string[];
  readonly systemKey: string | null;
}

export interface NoteTypeAdminRecord extends NoteTypeRecord {
  readonly escalationTargets: EscalationTarget[];
}

export interface NoteTypeService {
  list(): Promise<NoteTypeAdminRecord[]>;
  listActive(userRoleId: RoleIdValue): Promise<{
    types: (NoteTypeRecord & { readonly canCreate: boolean })[];
    defaultNoteTypeId: NoteTypeId | null;
  }>;
  create(input: {
    encryptedName: Buffer;
    encryptedIcon: Buffer;
    encryptedDescription?: Buffer;
    escalationTargets: EscalationTarget[];
    requiresOnClose?: boolean;
    minViewRole?: RoleIdValue;
    minCreateRole?: RoleIdValue;
    orgKeyGeneration: number;
  }): Promise<NoteTypeRecord>;
  update(input: {
    id: NoteTypeId;
    encryptedName?: Buffer;
    encryptedIcon?: Buffer;
    encryptedDescription?: Buffer | null;
    escalationTargets?: EscalationTarget[];
    isActive?: boolean;
    requiresOnClose?: boolean;
    minViewRole?: RoleIdValue;
    minCreateRole?: RoleIdValue;
  }): Promise<NoteTypeRecord>;
  getDefaultTypeId(): Promise<NoteTypeId | null>;
  getEscalationTargets(noteTypeId: NoteTypeId): Promise<EscalationTarget[]>;
  getEscalationContext(noteTypeId: NoteTypeId): Promise<{
    targets: EscalationTarget[];
    minViewRole: RoleIdValue;
  } | null>;
  getMinCreateRole(noteTypeId: NoteTypeId): Promise<RoleIdValue | undefined>;
  /**
   * Create the system note type for `systemKey` if the org does not have it
   * yet, and return it either way. Concurrent callers race on the unique
   * index, so the insert ignores a conflict and re-reads. When this call
   * creates the type it also writes the `note_type_created` audit row in
   * the same transaction: the audit row commits with the type or not at
   * all.
   */
  ensureSystem(input: {
    systemKey: string;
    actorId: UserId;
    encryptedName: Buffer;
    encryptedIcon: Buffer;
    orgKeyGeneration: number;
  }): Promise<{ record: NoteTypeRecord; created: boolean }>;
  /** The type's system key, null if it has none, undefined if no such type. */
  getSystemKey(noteTypeId: NoteTypeId): Promise<string | null | undefined>;
}

interface NoteTypeRow {
  id: NoteTypeId;
  encrypted_name: Buffer;
  encrypted_icon: Buffer;
  encrypted_description: Buffer | null;
  encrypted_escalation_targets: Buffer;
  is_active: boolean;
  requires_on_close: boolean;
  min_view_role: RoleIdValue;
  min_create_role: RoleIdValue;
  created_at: Date;
  system_key: string | null;
}

function buildNotificationHints(targets: EscalationTarget[]): string[] {
  const hints: string[] = [];
  for (const t of targets) {
    if (t.type === "ticket_access") hints.push("ticket_access");
    else if (t.type === "role") hints.push(`role:${t.value}`);
    else if (t.type === "permission") hints.push(`permission:${t.value}`);
    else hints.push("queue");
  }
  return hints;
}

function toRecord(
  row: NoteTypeRow,
  hints: readonly string[] = [],
): NoteTypeRecord {
  return {
    id: row.id,
    encryptedName: row.encrypted_name,
    encryptedIcon: row.encrypted_icon,
    encryptedDescription: row.encrypted_description,
    isActive: row.is_active,
    requiresOnClose: row.requires_on_close,
    minViewRole: row.min_view_role,
    minCreateRole: row.min_create_role,
    createdAt: row.created_at,
    notificationHints: hints,
    systemKey: row.system_key,
  };
}

function toAdminRecord(
  row: NoteTypeRow,
  targets: EscalationTarget[],
): NoteTypeAdminRecord {
  return {
    ...toRecord(row),
    escalationTargets: targets,
  };
}

function encryptTargets(
  targets: EscalationTarget[],
  encryptor: SecretsEncryptor,
): Buffer {
  return encryptor.encrypt(Buffer.from(JSON.stringify(targets), "utf-8"));
}

// care-y-ignore-next-line server-no-decrypt -- operational escalation targets (OPS1 design), not E2EE client data. Server must decrypt to resolve notification recipients.
function decryptTargets(
  encrypted: Buffer,
  encryptor: SecretsEncryptor,
): EscalationTarget[] {
  const plaintext = encryptor.decrypt(encrypted);
  try {
    const parsed: unknown = JSON.parse(plaintext.toString("utf-8"));
    return z.array(escalationTargetSchema).parse(parsed);
  } finally {
    plaintext.fill(0);
  }
}

export function createNoteTypeService(
  db: Kysely<TenantDatabase>,
  secretsEncryptor: SecretsEncryptor,
): NoteTypeService {
  return {
    async list(): Promise<NoteTypeAdminRecord[]> {
      const rows = await db
        .selectFrom("note_types")
        .selectAll()
        .orderBy("created_at", "asc")
        .execute();

      return rows.map((row) =>
        toAdminRecord(
          row,
          decryptTargets(row.encrypted_escalation_targets, secretsEncryptor),
        ),
      );
    },

    async listActive(userRoleId: RoleIdValue): Promise<{
      types: (NoteTypeRecord & { readonly canCreate: boolean })[];
      defaultNoteTypeId: NoteTypeId | null;
    }> {
      const [rows, config] = await Promise.all([
        db
          .selectFrom("note_types")
          .selectAll()
          .where("is_active", "=", true)
          .orderBy("created_at", "asc")
          .execute(),
        db
          .selectFrom("org_config")
          .select("default_note_type_id")
          .executeTakeFirst(),
      ]);

      return {
        types: rows.map((row) => {
          const targets = decryptTargets(
            row.encrypted_escalation_targets,
            secretsEncryptor,
          );
          // A system type stays in the list so the timeline can resolve its
          // name and icon, but no role may pick it in the composer.
          return {
            ...toRecord(row, buildNotificationHints(targets)),
            canCreate:
              row.system_key === null &&
              meetsRoleThreshold({
                userRoleId,
                minRoleId: row.min_create_role,
              }),
          };
        }),
        defaultNoteTypeId: config?.default_note_type_id ?? null,
      };
    },

    async create(input): Promise<NoteTypeRecord> {
      const viewRole = input.minViewRole ?? RoleId.VOLUNTEER;
      const createRole = input.minCreateRole ?? RoleId.VOLUNTEER;

      const encryptedTargets = encryptTargets(
        input.escalationTargets,
        secretsEncryptor,
      );

      const row = await db
        .insertInto("note_types")
        .values({
          encrypted_name: input.encryptedName,
          encrypted_icon: input.encryptedIcon,
          encrypted_description: input.encryptedDescription ?? null,
          encrypted_escalation_targets: encryptedTargets,
          requires_on_close: input.requiresOnClose ?? false,
          min_view_role: viewRole,
          min_create_role: createRole,
          org_key_generation: input.orgKeyGeneration,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toRecord(row);
    },

    async update(input): Promise<NoteTypeRecord> {
      const current = await db
        .selectFrom("note_types")
        .select([
          "system_key",
          "is_active",
          "requires_on_close",
          "min_view_role",
          "min_create_role",
        ])
        .where("id", "=", input.id)
        .executeTakeFirst();
      if (!current) throw new NotFoundError(ErrorCode.NOTE_TYPE_NOT_FOUND);
      // A system type keeps its roles, escalation, active flag and key
      // because the flow that owns it depends on them; its name and icon
      // are the org's to set. An admin save re-sends every field, so
      // unchanged values pass; only a change to a reserved field is
      // refused. A system type has no escalation targets.
      if (
        current.system_key !== null &&
        ((input.isActive !== undefined &&
          input.isActive !== current.is_active) ||
          (input.requiresOnClose !== undefined &&
            input.requiresOnClose !== current.requires_on_close) ||
          (input.minViewRole !== undefined &&
            input.minViewRole !== current.min_view_role) ||
          (input.minCreateRole !== undefined &&
            input.minCreateRole !== current.min_create_role) ||
          (input.escalationTargets !== undefined &&
            input.escalationTargets.length > 0))
      ) {
        throw new ForbiddenError(ErrorCode.NOTE_TYPE_RESERVED);
      }

      // Guard: cannot deactivate the default note type
      if (input.isActive === false) {
        const config = await db
          .selectFrom("org_config")
          .select("default_note_type_id")
          .executeTakeFirst();

        if (config?.default_note_type_id === input.id) {
          throw new ForbiddenError(
            ErrorCode.CANNOT_DEACTIVATE_DEFAULT_NOTE_TYPE,
          );
        }
      }

      const updates: Updateable<NoteTypesTable> = {};
      if (input.encryptedName !== undefined) {
        updates.encrypted_name = input.encryptedName;
      }
      if (input.encryptedIcon !== undefined) {
        updates.encrypted_icon = input.encryptedIcon;
      }
      if (input.encryptedDescription !== undefined) {
        updates.encrypted_description = input.encryptedDescription;
      }
      if (input.escalationTargets !== undefined) {
        updates.encrypted_escalation_targets = encryptTargets(
          input.escalationTargets,
          secretsEncryptor,
        );
      }
      if (input.isActive !== undefined) {
        updates.is_active = input.isActive;
      }
      if (input.requiresOnClose !== undefined) {
        updates.requires_on_close = input.requiresOnClose;
      }
      if (input.minViewRole !== undefined) {
        updates.min_view_role = input.minViewRole;
      }
      if (input.minCreateRole !== undefined) {
        updates.min_create_role = input.minCreateRole;
      }

      if (Object.keys(updates).length === 0) {
        const existing = await db
          .selectFrom("note_types")
          .selectAll()
          .where("id", "=", input.id)
          .executeTakeFirst();
        if (!existing) throw new NotFoundError(ErrorCode.NOTE_TYPE_NOT_FOUND);
        return toRecord(existing);
      }

      const row = await db
        .updateTable("note_types")
        .set(updates)
        .where("id", "=", input.id)
        .returningAll()
        .executeTakeFirst();

      if (!row) throw new NotFoundError(ErrorCode.NOTE_TYPE_NOT_FOUND);
      return toRecord(row);
    },

    async getDefaultTypeId(): Promise<NoteTypeId | null> {
      const config = await db
        .selectFrom("org_config")
        .select("default_note_type_id")
        .executeTakeFirst();
      return config?.default_note_type_id ?? null;
    },

    async getEscalationTargets(noteTypeId): Promise<EscalationTarget[]> {
      const row = await db
        .selectFrom("note_types")
        .select("encrypted_escalation_targets")
        .where("id", "=", noteTypeId)
        .executeTakeFirst();

      if (!row) return [];
      return decryptTargets(row.encrypted_escalation_targets, secretsEncryptor);
    },

    async getEscalationContext(noteTypeId) {
      const row = await db
        .selectFrom("note_types")
        .select(["encrypted_escalation_targets", "min_view_role"])
        .where("id", "=", noteTypeId)
        .executeTakeFirst();

      if (!row) return null;
      return {
        targets: decryptTargets(
          row.encrypted_escalation_targets,
          secretsEncryptor,
        ),
        minViewRole: row.min_view_role,
      };
    },

    async getMinCreateRole(noteTypeId): Promise<RoleIdValue | undefined> {
      const row = await db
        .selectFrom("note_types")
        .select("min_create_role")
        .where("id", "=", noteTypeId)
        .executeTakeFirst();
      return row?.min_create_role;
    },

    async ensureSystem(input): Promise<{
      record: NoteTypeRecord;
      created: boolean;
    }> {
      return db.transaction().execute(async (trx) => {
        const inserted = await trx
          .insertInto("note_types")
          .values({
            encrypted_name: input.encryptedName,
            encrypted_icon: input.encryptedIcon,
            encrypted_escalation_targets: encryptTargets([], secretsEncryptor),
            requires_on_close: false,
            min_view_role: RoleId.VOLUNTEER,
            min_create_role: RoleId.VOLUNTEER,
            org_key_generation: input.orgKeyGeneration,
            system_key: input.systemKey,
          })
          .onConflict((oc) => oc.column("system_key").doNothing())
          .returningAll()
          .executeTakeFirst();
        if (inserted) {
          await trx
            .insertInto("audit_log")
            .values({
              event_type: "note_type_created",
              actor_id: input.actorId,
              ticket_id: null,
              metadata: {
                noteTypeId: inserted.id,
                systemKey: input.systemKey,
              },
            })
            .execute();
          return { record: toRecord(inserted), created: true };
        }

        const existing = await trx
          .selectFrom("note_types")
          .selectAll()
          .where("system_key", "=", input.systemKey)
          .executeTakeFirst();
        if (!existing) throw new NotFoundError(ErrorCode.NOTE_TYPE_NOT_FOUND);
        return { record: toRecord(existing), created: false };
      });
    },

    async getSystemKey(noteTypeId): Promise<string | null | undefined> {
      const row = await db
        .selectFrom("note_types")
        .select("system_key")
        .where("id", "=", noteTypeId)
        .executeTakeFirst();
      return row?.system_key;
    },
  };
}

export interface DefaultNoteTypeDef {
  readonly name: string;
  readonly icon: string;
  readonly description: string;
  readonly escalationTargets: EscalationTarget[];
  readonly requiresOnClose: boolean;
}

export const DEFAULT_NOTE_TYPES: readonly DefaultNoteTypeDef[] = [
  {
    name: "Comment",
    icon: "message-square-dashed",
    description: "General notes and observations about this ticket.",
    escalationTargets: [{ type: "ticket_access" }],
    requiresOnClose: false,
  },
  {
    name: "Resolution",
    icon: "clipboard-check",
    description: "Documents how the ticket was resolved. Prompted on close.",
    escalationTargets: [{ type: "ticket_access" }],
    requiresOnClose: true,
  },
  {
    name: "Safety Concern",
    icon: "life-buoy",
    description: "Use when someone's wellbeing may be at risk.",
    escalationTargets: [
      { type: "role", value: "admin" },
      { type: "role", value: "manager" },
      { type: "ticket_access" },
    ],
    requiresOnClose: false,
  },
  {
    name: "Request",
    icon: "heart-handshake",
    description: "Requests additional resources or assistance for this ticket.",
    escalationTargets: [
      { type: "role", value: "admin" },
      { type: "role", value: "manager" },
      { type: "ticket_access" },
    ],
    requiresOnClose: false,
  },
];

/**
 * Seeds default note types for a newly created org.
 * Encrypts names/icons with the org public key (sealed box) and
 * escalation targets with the operational secrets key.
 * Sets org_config.default_note_type_id to the Comment type.
 */
export async function seedDefaultNoteTypes(
  db: Kysely<TenantDatabase>,
  sealedBox: SealedBoxEncryptor,
  secretsEncryptor: SecretsEncryptor,
): Promise<void> {
  let commentId: NoteTypeId | undefined;

  for (const def of DEFAULT_NOTE_TYPES) {
    const row = await db
      .insertInto("note_types")
      .values({
        encrypted_name: sealedBox.seal(def.name),
        encrypted_icon: sealedBox.seal(def.icon),
        encrypted_description: sealedBox.seal(def.description),
        encrypted_escalation_targets: encryptTargets(
          def.escalationTargets,
          secretsEncryptor,
        ),
        requires_on_close: def.requiresOnClose,
        org_key_generation: sealedBox.generation,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    if (def.name === "Comment") {
      commentId = row.id;
    }
  }

  if (commentId !== undefined) {
    await db
      .updateTable("org_config")
      .set({ default_note_type_id: commentId })
      .execute();
  }
}
