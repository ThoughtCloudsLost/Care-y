/**
 * Escalation rules tRPC router.
 *
 * Admin-only CRUD for time-based escalation rules. Each rule is scoped
 * to a queue and evaluated by the background escalation checker job.
 * Mutations write audit rows for accountability; queue names are never
 * stored in audit metadata (they are encrypted per ADR-030).
 */

import { TRPCError } from "@trpc/server";
import { router, adminProcedure, withErrorWrapping } from "../trpc/trpc.js";
import type { OrgContext } from "../trpc/context.js";
import type { AuditService } from "../tickets/audit.js";
import {
  listEscalationRulesInputSchema,
  createEscalationRuleInputSchema,
  updateEscalationRuleInputSchema,
  deleteEscalationRuleInputSchema,
} from "@care-y/shared";
import {
  listRules,
  createRule,
  updateRule,
  deleteRule,
  queueExists,
  getRuleById,
} from "../tickets/escalation-service.js";

export interface EscalationRouterDeps {
  readonly createAuditSvc: (tDb: OrgContext["tenantDb"]) => AuditService;
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createEscalationRouter(deps: EscalationRouterDeps) {
  return router({
    /** List all escalation rules for a queue. */
    list: adminProcedure.input(listEscalationRulesInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const rules = await listRules(ctx.org.tenantDb, input.queueId);
        return { rules };
      }),
    ),

    /** Create a new escalation rule on a queue. */
    create: adminProcedure.input(createEscalationRuleInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        if (!(await queueExists(ctx.org.tenantDb, input.queueId))) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Queue not found",
          });
        }

        const rule = await createRule(ctx.org.tenantDb, {
          queueId: input.queueId,
          ruleType: input.ruleType,
          thresholdMinutes: input.thresholdMinutes,
          action: input.action,
        });

        const audit = deps.createAuditSvc(ctx.org.tenantDb);
        void audit.log({
          eventType: "escalation_rule_created",
          actorId: ctx.user.id,
          metadata: {
            ruleId: rule.id,
            queueId: input.queueId,
            ruleType: input.ruleType,
          },
        });

        return { rule };
      }),
    ),

    /** Update an existing escalation rule. */
    update: adminProcedure.input(updateEscalationRuleInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const rule = await updateRule(ctx.org.tenantDb, input.ruleId, {
          thresholdMinutes: input.thresholdMinutes,
          action: input.action,
          isActive: input.isActive,
        });

        if (rule === null) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Escalation rule not found",
          });
        }

        const audit = deps.createAuditSvc(ctx.org.tenantDb);
        void audit.log({
          eventType: "escalation_rule_updated",
          actorId: ctx.user.id,
          metadata: {
            ruleId: input.ruleId,
            queueId: rule.queueId,
            ruleType: rule.ruleType,
          },
        });

        return { rule };
      }),
    ),

    /** Delete an escalation rule. */
    remove: adminProcedure.input(deleteEscalationRuleInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        // Fetch the rule before deleting so we can include its queueId
        // and ruleType in the audit metadata.
        const existing = await getRuleById(ctx.org.tenantDb, input.ruleId);

        const deleted = await deleteRule(ctx.org.tenantDb, input.ruleId);

        if (!deleted) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Escalation rule not found",
          });
        }

        const audit = deps.createAuditSvc(ctx.org.tenantDb);
        void audit.log({
          eventType: "escalation_rule_deleted",
          actorId: ctx.user.id,
          metadata: {
            ruleId: input.ruleId,
            ...(existing !== null
              ? { queueId: existing.queueId, ruleType: existing.ruleType }
              : {}),
          },
        });

        return { deleted: true };
      }),
    ),
  });
}
