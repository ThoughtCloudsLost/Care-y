/**
 * Admin intake form tRPC router.
 *
 * Thin procedures over IntakeFormService, gated with the MANAGE_QUEUES
 * permission. Audit events are dispatched for save, delete, and
 * web-intake-toggle operations.
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
import { Permission, saveIntakeFormInputSchema } from "@care-y/shared";

export interface IntakeFormRouterDeps {
  readonly createAuditSvc: (tDb: OrgContext["tenantDb"]) => AuditService;
  readonly intakeFormService: IntakeFormService;
}

const queueManagerProcedure = authed2faProcedure.use(
  requireRole(Permission.MANAGE_QUEUES),
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
    get: queueManagerProcedure.input(z.object({ formId: z.uuid() })).query(
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
      .input(z.object({ formId: z.uuid() }))
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
      .input(z.object({ formId: z.uuid(), active: z.boolean() }))
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
  });
}
