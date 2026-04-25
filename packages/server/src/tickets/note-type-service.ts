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
import { escalationTargetSchema } from "@care-y/shared";
import type { EscalationTarget } from "@care-y/shared";
import { ForbiddenError, NotFoundError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";
import { z } from "zod";

export interface NoteTypeRecord {
  readonly id: string;
  readonly encryptedName: Buffer;
  readonly encryptedIcon: Buffer;
  readonly isActive: boolean;
  readonly requiresOnClose: boolean;
  readonly createdAt: Date;
}

export interface NoteTypeAdminRecord extends NoteTypeRecord {
  readonly escalationTargets: EscalationTarget[];
}

export interface NoteTypeService {
  list(): Promise<NoteTypeAdminRecord[]>;
  listActive(): Promise<{
    types: NoteTypeRecord[];
    defaultNoteTypeId: string | null;
  }>;
  create(input: {
    encryptedName: Buffer;
    encryptedIcon: Buffer;
    escalationTargets: EscalationTarget[];
    requiresOnClose?: boolean;
  }): Promise<NoteTypeRecord>;
  update(input: {
    id: string;
    encryptedName?: Buffer;
    encryptedIcon?: Buffer;
    escalationTargets?: EscalationTarget[];
    isActive?: boolean;
    requiresOnClose?: boolean;
  }): Promise<NoteTypeRecord>;
  getDefaultTypeId(): Promise<string | null>;
  getEscalationTargets(noteTypeId: string): Promise<EscalationTarget[]>;
}

interface NoteTypeRow {
  id: string;
  encrypted_name: Buffer;
  encrypted_icon: Buffer;
  encrypted_escalation_targets: Buffer;
  is_active: boolean;
  requires_on_close: boolean;
  created_at: Date;
}

function toRecord(row: NoteTypeRow): NoteTypeRecord {
  return {
    id: row.id,
    encryptedName: row.encrypted_name,
    encryptedIcon: row.encrypted_icon,
    isActive: row.is_active,
    requiresOnClose: row.requires_on_close,
    createdAt: row.created_at,
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

    async listActive(): Promise<{
      types: NoteTypeRecord[];
      defaultNoteTypeId: string | null;
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
        types: rows.map(toRecord),
        defaultNoteTypeId: config?.default_note_type_id ?? null,
      };
    },

    async create(input): Promise<NoteTypeRecord> {
      const encryptedTargets = encryptTargets(
        input.escalationTargets,
        secretsEncryptor,
      );

      const row = await db
        .insertInto("note_types")
        .values({
          encrypted_name: input.encryptedName,
          encrypted_icon: input.encryptedIcon,
          encrypted_escalation_targets: encryptedTargets,
          requires_on_close: input.requiresOnClose ?? false,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toRecord(row);
    },

    async update(input): Promise<NoteTypeRecord> {
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

    async getDefaultTypeId(): Promise<string | null> {
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
  };
}

export interface DefaultNoteTypeDef {
  readonly name: string;
  readonly icon: string;
  readonly escalationTargets: EscalationTarget[];
  readonly requiresOnClose: boolean;
}

export const DEFAULT_NOTE_TYPES: readonly DefaultNoteTypeDef[] = [
  {
    name: "Comment",
    icon: "message-square-dashed",
    escalationTargets: [],
    requiresOnClose: false,
  },
  {
    name: "Resolution",
    icon: "clipboard-check",
    escalationTargets: [],
    requiresOnClose: true,
  },
  {
    name: "Safety Concern",
    icon: "life-buoy",
    escalationTargets: [
      { type: "role", value: "admin" },
      { type: "role", value: "manager" },
    ],
    requiresOnClose: false,
  },
  {
    name: "Request",
    icon: "heart-handshake",
    escalationTargets: [
      { type: "role", value: "admin" },
      { type: "role", value: "manager" },
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
  let commentId: string | undefined;

  for (const def of DEFAULT_NOTE_TYPES) {
    const row = await db
      .insertInto("note_types")
      .values({
        encrypted_name: sealedBox.seal(def.name),
        encrypted_icon: sealedBox.seal(def.icon),
        encrypted_escalation_targets: encryptTargets(
          def.escalationTargets,
          secretsEncryptor,
        ),
        requires_on_close: def.requiresOnClose,
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
