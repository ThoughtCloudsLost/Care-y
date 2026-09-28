/**
 * Dev-only service for seed data management.
 *
 * Only instantiated when NODE_ENV !== "production". The module is never
 * imported in production builds, so it is tree-shaken entirely.
 */

import type { Kysely } from "kysely";
import type { FollowupId, OrgSchema } from "@care-y/shared";
import type {
  ApplySeedTimelineInput,
  BackdateOrgSetupInput,
  ReopenAsClientInput,
  SeedVoicemailInput,
} from "@care-y/shared/dev/seed-stories.js";
import type { TenantDatabase } from "../db/types.js";
import type { BlobStore } from "../storage/store.js";
import { ValidationError } from "../errors.js";
import { createEncryptedFollowUp } from "../tickets/server-followup-create.js";
import { reopenClosedTicket } from "../tickets/ticket-reopen.js";

/**
 * Seed content tables in dependency order (children first, parents last).
 *
 * Uses individual DELETE FROM statements instead of bulk TRUNCATE because
 * bulk truncate walks FK constraints at the metadata level (not row level)
 * and would destroy org_config via its FK to queues.id and note_types.id,
 * even when those FK columns are NULL.
 */
const SEED_TABLES_DELETE_ORDER: readonly (keyof TenantDatabase)[] = [
  // leaf tables (no other seed table references these)
  "voicemail_quarantine",
  "tracked_calls",
  "followup_reactions",
  "ticket_read_cursors",
  "ticket_watchers",
  "ticket_dependencies",
  "ticket_key_wraps",
  "email_reply_tokens",
  "kb_votes",
  "kb_attachments",
  "audit_log",
  // depend on followups
  "attachments",
  "recordings",
  // depend on tickets
  "followups",
  // depend on clients/queues
  "tickets",
  "client_merge_events",
  // depend on phones/emails
  "clients",
  "emails",
  "phone_greetings",
  "phones",
  // depend on queues
  "queue_watchers",
  "queue_assignments",
  "preset_replies",
  // parent tables
  "queues",
  "kb_items",
  "kb_categories",
  "note_types",
];

/** Rows moved per table by backdateOrgSetup. */
export interface BackdateOrgSetupResult {
  readonly auditRows: number;
  readonly kbCategories: number;
  readonly kbItems: number;
  readonly noteTypes: number;
  readonly presetReplies: number;
}

export interface DevService {
  resetSeedData(): Promise<{ tablesReset: number }>;
  /**
   * Re-times a seeded ticket's history. The client seeder creates tickets
   * through the production endpoints, which stamp everything "now"; this
   * moves each follow-up to its story time (points map 1:1 to follow-ups
   * in creation order), moves the ticket's creation to `createdMinutesAgo`,
   * and carries each audit row along with the follow-up it followed. A
   * point may also re-stamp its volunteer follow-up's author, and the
   * user and time of the reactions on it, since the seeding account can
   * only act as itself.
   */
  applySeedTimeline(
    input: ApplySeedTimelineInput,
  ): Promise<{ followUps: number; auditRows: number }>;
  /**
   * Moves org setup (org-level audit rows, KB categories and articles,
   * note types, preset replies) to `minutesAgo`, so a seeded org reads as
   * set up before its oldest ticket. Each table keeps its own order: row i
   * by original (created_at, id) lands at the new base plus i seconds.
   */
  backdateOrgSetup(
    input: BackdateOrgSetupInput,
  ): Promise<BackdateOrgSetupResult>;
  /**
   * Adds a client voicemail to a ticket through the same path the
   * telephony recording webhook uses, so seeded voicemails are stored and
   * encrypted exactly like real ones.
   */
  seedVoicemail(
    input: SeedVoicemailInput,
    media: { readonly blobStore: BlobStore; readonly orgSchema: OrgSchema },
  ): Promise<{ followUpId: FollowupId }>;
  /**
   * Reopens a closed ticket the way a client writing in reopens it, through
   * the same helper the inbound and portal paths use. A volunteer's manual
   * reopen is a different path.
   */
  reopenAsClient(input: ReopenAsClientInput): Promise<void>;
}

export function createDevService(tDb: Kysely<TenantDatabase>): DevService {
  return {
    async resetSeedData(): Promise<{ tablesReset: number }> {
      // Null out org_config FK columns that point to seed tables.
      // This prevents DELETE FROM queues/note_types from violating
      // the FK constraints on org_config (which we preserve).
      await tDb
        .updateTable("org_config")
        .set({ intake_queue_id: null, default_note_type_id: null })
        .execute();

      for (const table of SEED_TABLES_DELETE_ORDER) {
        await tDb.deleteFrom(table).execute();
      }

      return { tablesReset: SEED_TABLES_DELETE_ORDER.length };
    },

    async applySeedTimeline(
      input: ApplySeedTimelineInput,
    ): Promise<{ followUps: number; auditRows: number }> {
      if (input.points.some((p) => p.minutesAgo > input.createdMinutesAgo)) {
        throw new ValidationError(
          "A follow-up cannot come before its ticket was created",
        );
      }
      return tDb.transaction().execute(async (trx) => {
        const followUps = await trx
          .selectFrom("followups")
          .select(["id", "type", "source", "created_at"])
          .where("ticket_id", "=", input.ticketId)
          .orderBy("created_at", "asc")
          .orderBy("id", "asc")
          .execute();
        if (followUps.length !== input.points.length) {
          throw new ValidationError(
            `Ticket has ${String(followUps.length)} follow-ups but ${String(input.points.length)} timeline points were given`,
          );
        }
        // Only a volunteer follow-up has a staff author to re-stamp.
        followUps.forEach((fu, i) => {
          if (
            input.points.at(i)?.createdBy !== undefined &&
            fu.source !== "volunteer"
          ) {
            throw new ValidationError(
              `Timeline point ${String(i)} sets an author on a ${fu.source} follow-up`,
            );
          }
        });

        const now = Date.now();
        const retimed = followUps.map((fu, i) => {
          const point = input.points.at(i);
          // Lengths match (checked above), so every follow-up has a point.
          const minutesAgo = point?.minutesAgo ?? 0;
          return {
            ...fu,
            point,
            newAt: new Date(now - minutesAgo * 60_000),
          };
        });

        for (const fu of retimed) {
          const callStatus = fu.point?.callStatus;
          const createdBy = fu.point?.createdBy;
          await trx
            .updateTable("followups")
            .set({
              created_at: fu.newAt,
              ...(callStatus !== undefined && fu.type === "phone_call"
                ? {
                    call_status: callStatus,
                    call_duration_seconds:
                      fu.point?.callDurationSeconds ?? null,
                  }
                : {}),
              ...(createdBy !== undefined ? { created_by: createdBy } : {}),
            })
            .where("id", "=", fu.id)
            .execute();

          const reaction = fu.point?.reaction;
          if (reaction !== undefined) {
            await trx
              .updateTable("followup_reactions")
              .set({
                user_id: reaction.userId,
                created_at: new Date(now - reaction.minutesAgo * 60_000),
              })
              .where("followup_id", "=", fu.id)
              .execute();
          }
        }

        // The seed writes client messages through the staff API, which
        // stamps the seeding account as author. Inbound handlers leave
        // client-sourced rows without an author, and read state counts
        // only activity by others, so clear it to match production.
        await trx
          .updateTable("followups")
          .set({ created_by: null })
          .where("ticket_id", "=", input.ticketId)
          .where("source", "=", "client")
          .execute();

        const ticketCreatedAt = new Date(
          now - input.createdMinutesAgo * 60_000,
        );
        await trx
          .updateTable("tickets")
          .set({ created_at: ticketCreatedAt })
          .where("id", "=", input.ticketId)
          .execute();

        // Each audit row takes the new time of the latest follow-up that
        // originally preceded it, so the audit trail keeps its order
        // relative to the timeline.
        const auditRows = await trx
          .selectFrom("audit_log")
          .select(["id", "created_at"])
          .where("ticket_id", "=", input.ticketId)
          .orderBy("created_at", "asc")
          .orderBy("id", "asc")
          .execute();
        for (const row of auditRows) {
          let target = ticketCreatedAt;
          for (const fu of retimed) {
            if (fu.created_at.getTime() <= row.created_at.getTime()) {
              target = fu.newAt;
            }
          }
          await trx
            .updateTable("audit_log")
            .set({ created_at: target })
            .where("id", "=", row.id)
            .execute();
        }

        return { followUps: retimed.length, auditRows: auditRows.length };
      });
    },

    async backdateOrgSetup(
      input: BackdateOrgSetupInput,
    ): Promise<BackdateOrgSetupResult> {
      const base = Date.now() - input.minutesAgo * 60_000;
      const slot = (i: number): Date => new Date(base + i * 1_000);
      // An edited row keeps its gap between creation and last update.
      const updatedSlot = (i: number, created: Date, updated: Date): Date =>
        new Date(
          slot(i).getTime() +
            Math.max(0, updated.getTime() - created.getTime()),
        );

      return tDb.transaction().execute(async (trx) => {
        const audits = await trx
          .selectFrom("audit_log")
          .select("id")
          .where("ticket_id", "is", null)
          .orderBy("created_at", "asc")
          .orderBy("id", "asc")
          .execute();
        for (const [i, row] of audits.entries()) {
          await trx
            .updateTable("audit_log")
            .set({ created_at: slot(i) })
            .where("id", "=", row.id)
            .execute();
        }

        const categories = await trx
          .selectFrom("kb_categories")
          .select(["id", "created_at", "updated_at"])
          .orderBy("created_at", "asc")
          .orderBy("id", "asc")
          .execute();
        for (const [i, row] of categories.entries()) {
          await trx
            .updateTable("kb_categories")
            .set({
              created_at: slot(i),
              updated_at: updatedSlot(i, row.created_at, row.updated_at),
            })
            .where("id", "=", row.id)
            .execute();
        }

        const items = await trx
          .selectFrom("kb_items")
          .select(["id", "created_at", "updated_at"])
          .orderBy("created_at", "asc")
          .orderBy("id", "asc")
          .execute();
        for (const [i, row] of items.entries()) {
          await trx
            .updateTable("kb_items")
            .set({
              created_at: slot(i),
              updated_at: updatedSlot(i, row.created_at, row.updated_at),
            })
            .where("id", "=", row.id)
            .execute();
        }

        const noteTypes = await trx
          .selectFrom("note_types")
          .select("id")
          .orderBy("created_at", "asc")
          .orderBy("id", "asc")
          .execute();
        for (const [i, row] of noteTypes.entries()) {
          await trx
            .updateTable("note_types")
            .set({ created_at: slot(i) })
            .where("id", "=", row.id)
            .execute();
        }

        const presets = await trx
          .selectFrom("preset_replies")
          .select("id")
          .orderBy("created_at", "asc")
          .orderBy("id", "asc")
          .execute();
        for (const [i, row] of presets.entries()) {
          await trx
            .updateTable("preset_replies")
            .set({ created_at: slot(i) })
            .where("id", "=", row.id)
            .execute();
        }

        return {
          auditRows: audits.length,
          kbCategories: categories.length,
          kbItems: items.length,
          noteTypes: noteTypes.length,
          presetReplies: presets.length,
        };
      });
    },

    async seedVoicemail(
      input: SeedVoicemailInput,
      media: { readonly blobStore: BlobStore; readonly orgSchema: OrgSchema },
    ): Promise<{ followUpId: FollowupId }> {
      const data = Buffer.from(input.audio, "base64");
      if (data.length === 0) {
        throw new ValidationError("Voicemail audio is empty");
      }
      // Same call as telephony/recording-handler.ts, without a portal seal.
      const { followUpId } = await createEncryptedFollowUp(
        tDb,
        input.ticketId,
        Buffer.from("Voicemail recording", "utf-8"),
        "voicemail",
        "client",
        {
          recording: { data, durationSeconds: input.durationSeconds },
          blobStore: media.blobStore,
          orgSchema: media.orgSchema,
        },
      );
      return { followUpId };
    },

    async reopenAsClient(input: ReopenAsClientInput): Promise<void> {
      await tDb.transaction().execute(async (trx) => {
        const ticket = await trx
          .selectFrom("tickets")
          .select("status")
          .where("id", "=", input.ticketId)
          .executeTakeFirst();
        if (ticket?.status !== "closed") {
          throw new ValidationError("Only a closed ticket can be reopened");
        }
        await reopenClosedTicket(trx, input.ticketId);
      });
    },
  };
}
