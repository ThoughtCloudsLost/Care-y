/**
 * Admin intake form tRPC router.
 *
 * Thin procedures over IntakeFormService, gated with the MANAGE_QUEUES
 * permission. Audit events are dispatched for save, delete, and
 * web-intake-toggle operations.
 *
 * The listResponses query and backfillWraps mutation are gated with the
 * VIEW_INTAKE_RESPONSES permission (high-trust, opt-in) and require
 * completed 2FA.
 */

import { z } from "zod";
import {
  router,
  authed2faProcedure,
  requireRole,
  withErrorWrapping,
} from "../trpc/trpc.js";
import type { OrgContext } from "../trpc/context.js";
import type { AuditService } from "../tickets/audit.js";
import type { IntakeFormService } from "../portal/intake-form-service.js";
import type { IntakeResponseService } from "../portal/intake-response-service.js";
import {
  Permission,
  saveIntakeFormInputSchema,
  intakeFormIdSchema,
  listIntakeResponsesInputSchema,
  backfillWrapsInputSchema,
} from "@care-y/shared";
import { b64 } from "../utils/ciphertext-wire.js";

export interface IntakeFormRouterDeps {
  readonly createAuditSvc: (tDb: OrgContext["tenantDb"]) => AuditService;
  readonly intakeFormService: IntakeFormService;
  readonly intakeResponseService: IntakeResponseService;
}

const queueManagerProcedure = authed2faProcedure.use(
  requireRole(Permission.MANAGE_QUEUES),
);

const responseViewerProcedure = authed2faProcedure.use(
  requireRole(Permission.VIEW_INTAKE_RESPONSES),
);

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createIntakeFormRouter(deps: IntakeFormRouterDeps) {
  return router({
    /** List all intake forms with summary info. */
    list: queueManagerProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const forms = await deps.intakeFormService.listForms(ctx.org.tenantDb);
        return { forms };
      }),
    ),

    /** Load a single form with its fields (for the editor). */
    get: queueManagerProcedure
      .input(z.object({ formId: intakeFormIdSchema }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          return deps.intakeFormService.getForm(ctx.org.tenantDb, input.formId);
        }),
      ),

    /** Create or update a form (whole-form save). */
    save: queueManagerProcedure.input(saveIntakeFormInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const result = await deps.intakeFormService.saveForm(
          ctx.org.tenantDb,
          ctx.user.id,
          input,
        );

        const audit = deps.createAuditSvc(ctx.org.tenantDb);
        void audit.log({
          eventType: "intake_form_saved",
          actorId: ctx.user.id,
          metadata: { formId: result.formId },
        });

        return result;
      }),
    ),

    /** Delete a form. Throws FORM_HAS_RESPONSES when responses exist. */
    remove: queueManagerProcedure
      .input(z.object({ formId: intakeFormIdSchema }))
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          await deps.intakeFormService.deleteForm(
            ctx.org.tenantDb,
            input.formId,
          );

          const audit = deps.createAuditSvc(ctx.org.tenantDb);
          void audit.log({
            eventType: "intake_form_deleted",
            actorId: ctx.user.id,
            metadata: { formId: input.formId },
          });

          return { deleted: true };
        }),
      ),

    /** Activate or deactivate a form. */
    setActive: queueManagerProcedure
      .input(z.object({ formId: intakeFormIdSchema, active: z.boolean() }))
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          await deps.intakeFormService.setActive(
            ctx.org.tenantDb,
            input.formId,
            input.active,
          );
          return { ok: true };
        }),
      ),

    /** Read the org-wide web intake enabled flag. */
    getWebIntakeEnabled: queueManagerProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const enabled = await deps.intakeFormService.isWebIntakeEnabled(
          ctx.org.tenantDb,
        );
        return { enabled };
      }),
    ),

    /** Toggle the org-wide web intake enabled flag. */
    setWebIntakeEnabled: queueManagerProcedure
      .input(z.object({ enabled: z.boolean() }))
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          await deps.intakeFormService.setWebIntakeEnabled(
            ctx.org.tenantDb,
            input.enabled,
          );

          const audit = deps.createAuditSvc(ctx.org.tenantDb);
          void audit.log({
            eventType: "web_intake_toggled",
            actorId: ctx.user.id,
            metadata: { enabled: input.enabled },
          });

          return { ok: true };
        }),
      ),

    /**
     * Paginated listing of intake form responses.
     * Returns ciphertext + wraps only; the server never sees plaintext.
     * Access is audit-logged (explicit egress surface).
     */
    listResponses: responseViewerProcedure
      .input(listIntakeResponsesInputSchema)
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const page = await deps.intakeResponseService.listResponses(
            ctx.org.tenantDb,
            ctx.org.orgSchema,
            ctx.user.id,
            input.formId,
            { cursor: input.cursor, pageSize: input.pageSize },
          );

          // Audit-log this read (egress surface for encrypted responses)
          const audit = deps.createAuditSvc(ctx.org.tenantDb);
          void audit.log({
            eventType: "intake_responses_viewed",
            actorId: ctx.user.id,
            metadata: { formId: input.formId, rowCount: page.rows.length },
          });

          // Convert Buffer fields to base64url for the wire
          return {
            rows: page.rows.map((r) => ({
              ticketId: r.ticketId,
              submittedAt: r.submittedAt.toISOString(),
              encryptedResponse: b64(r.encryptedResponse),
              callerKeyWrap: r.callerKeyWrap
                ? {
                    volunteerId: r.callerKeyWrap.volunteerId,
                    ephemeralPoint: b64(r.callerKeyWrap.ephemeralPoint),
                    nonce: b64(r.callerKeyWrap.nonce),
                    wrappedKey: b64(r.callerKeyWrap.wrappedKey),
                  }
                : null,
              orgSealWrap: r.orgSealWrap
                ? { wrappedTk: b64(r.orgSealWrap.wrappedTk) }
                : null,
              missingPrincipals: r.missingPrincipals,
            })),
            nextCursor: page.nextCursor,
            total: page.total,
          };
        }),
      ),

    /**
     * Lazy wrap backfill: accepts client-minted ECIES wraps for
     * principals missing ticket key wraps. Idempotent.
     */
    backfillWraps: responseViewerProcedure
      .input(backfillWrapsInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const result = await deps.intakeResponseService.backfillWraps(
            ctx.org.tenantDb,
            ctx.org.orgSchema,
            ctx.user.id,
            {
              ticketId: input.ticketId,
              wraps: input.wraps.map((w) => ({
                ticketId: input.ticketId,
                volunteerId: w.volunteerId,
                ephemeralPoint: Buffer.from(w.ephemeralPoint, "base64"),
                nonce: Buffer.from(w.nonce, "base64"),
                wrappedKey: Buffer.from(w.wrappedKey, "base64"),
              })),
            },
          );

          return result;
        }),
      ),
  });
}
