/**
 * Client email management service.
 *
 * Mirrors the phone management paths in client-service.ts: OPS-encrypted
 * email addresses with deterministic blind index for uniqueness and merge
 * suggestion. The server decrypts for relay sending and role-masked read
 * payloads, but never logs the address.
 *
 * Audit entries log { clientId, actorId } only, never email addresses.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { AuditService } from "../tickets/audit.js";
import type {
  FieldEncryptor,
  BlindIndexer,
} from "../crypto/field-encryptor.js";
import { NotFoundError, ConflictError } from "../errors.js";
import { ErrorCode, emailHashSchema } from "@care-y/shared";
import type {
  ClientId,
  UserId,
  OrgId,
  EmailHash,
  EmailMatchHash,
  EmailId,
} from "@care-y/shared";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface EmailConflict {
  readonly conflictingClientId: ClientId;
  readonly conflictingClientEncryptedAlias: Buffer;
}

export interface UpdateEmailResult {
  readonly success: boolean;
  readonly conflict: EmailConflict | null;
}

// ---------------------------------------------------------------------------
// Unique constraint detection
// ---------------------------------------------------------------------------

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === "23505"
  );
}

// ---------------------------------------------------------------------------
// Service interface
// ---------------------------------------------------------------------------

export interface EmailService {
  /** Creates or replaces the email for a client. Returns conflict info when
   *  email_hash already belongs to another client. */
  updateEmail(
    clientId: ClientId,
    address: string,
    actorUserId: UserId,
    emailMatchHash: EmailMatchHash | null,
  ): Promise<UpdateEmailResult>;

  /** OPS-decrypts the active email for a client, for read payloads.
   *  Returns null when the client has no email on file. */
  getClientEmail(clientId: ClientId): Promise<string | null>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export interface EmailServiceDeps {
  readonly db: Kysely<TenantDatabase>;
  readonly audit: AuditService;
  readonly encryptor: FieldEncryptor;
  readonly indexer: BlindIndexer;
  readonly orgId: OrgId;
}

export function createEmailService(deps: EmailServiceDeps): EmailService {
  const { db, audit, encryptor, indexer } = deps;

  return {
    async updateEmail(
      clientId,
      address,
      actorUserId,
      emailMatchHash,
    ): Promise<UpdateEmailResult> {
      // address arrives as a JS string from the tRPC input layer and cannot
      // be zeroed. The encryptor copies it into a Buffer and zeroes that copy
      // in its own finally block; the blind indexer HMACs the string without
      // buffering. Same accepted residual as the phone path in client-service.
      const encryptedAddress = encryptor.encrypt(address);
      const emailHash = emailHashSchema.parse(
        indexer.hash(address, deps.orgId),
      );

      // Check for hash collision before starting the transaction.
      // Inner join: email-less clients have no email hash to match against.
      const existing = await db
        .selectFrom("emails as e")
        .innerJoin("clients as c", "c.email_id", "e.id")
        .select([
          "c.id as clientId",
          "c.encrypted_alias as clientEncryptedAlias",
        ])
        .where("e.email_hash", "=", emailHash)
        .where("c.merged_into", "is", null)
        .where("c.id", "!=", clientId)
        .executeTakeFirst();

      if (existing) {
        return {
          success: false,
          conflict: {
            conflictingClientId: existing.clientId,
            conflictingClientEncryptedAlias: existing.clientEncryptedAlias,
          },
        };
      }

      await db.transaction().execute(async (trx) => {
        // Verify client exists and is not merged
        const client = await trx
          .selectFrom("clients")
          .select(["id", "email_id", "merged_into"])
          .where("id", "=", clientId)
          .executeTakeFirst();

        if (client?.merged_into !== null) {
          throw new NotFoundError(ErrorCode.CLIENT_NOT_FOUND);
        }

        const oldEmailId = client.email_id;

        // 1. Insert new email row
        let newEmailId: EmailId;
        try {
          const newEmail = await trx
            .insertInto("emails")
            .values({
              email_hash: emailHash,
              encrypted_address: encryptedAddress,
              email_match_hash: emailMatchHash ?? null,
              locale: "en-US",
            })
            .returning("id")
            .executeTakeFirstOrThrow();

          newEmailId = newEmail.id;
        } catch (err: unknown) {
          // Race: another transaction inserted the same hash between our
          // pre-check and this insert. Surface as conflict.
          if (isUniqueViolation(err)) {
            throw new ConflictError(ErrorCode.EMAIL_HASH_CONFLICT);
          }
          throw err;
        }

        // 2. Re-point client to new email
        await trx
          .updateTable("clients")
          .set({ email_id: newEmailId, updated_at: new Date() })
          .where("id", "=", clientId)
          .execute();

        // 3. Delete old email row (never soft-delete; lingering email_hash
        //    would produce false duplicate matches)
        if (oldEmailId !== null) {
          await trx.deleteFrom("emails").where("id", "=", oldEmailId).execute();
        }
      });

      await audit.log({
        eventType: "client_email_changed",
        actorId: actorUserId,
        metadata: { clientId },
      });

      return { success: true, conflict: null };
    },

    async getClientEmail(clientId): Promise<string | null> {
      const row = await db
        .selectFrom("clients as c")
        .innerJoin("emails as e", "e.id", "c.email_id")
        .select("e.encrypted_address")
        .where("c.id", "=", clientId)
        .where("c.merged_into", "is", null)
        .executeTakeFirst();

      if (!row) return null;

      // care-y-ignore-next-line server-no-decrypt -- OPS_SECRETS_KEY operational encryption (ADR-005); server must read the address for relay sending and role-masked display, same as phoneForRole in routes/clients.ts
      return encryptor.decrypt(row.encrypted_address);
    },
  };
}
