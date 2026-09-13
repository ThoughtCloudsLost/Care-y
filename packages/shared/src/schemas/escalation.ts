/**
 * Zod schemas for escalation rule configuration.
 *
 * Escalation rules are server-actioned config: the background job reads
 * them autonomously to decide when to fire notifications. No encrypted
 * fields here; rule data is plaintext by design (ADR-018 "server acts"
 * branch).
 */

import { z } from "zod";

// --- Escalation rule enums ---

export const escalationRuleTypeSchema = z.enum([
  "unassigned_duration",
  "inactive_duration",
]);
export type EscalationRuleType = z.infer<typeof escalationRuleTypeSchema>;

export const escalationActionSchema = z.enum([
  "notify_managers",
  "notify_queue_watchers",
]);
export type EscalationAction = z.infer<typeof escalationActionSchema>;

// --- CRUD input schemas ---

export const createEscalationRuleInputSchema = z.object({
  queueId: z.uuid(),
  ruleType: escalationRuleTypeSchema,
  thresholdMinutes: z
    .number()
    .int()
    .min(5)
    .max(60 * 24 * 90),
  action: escalationActionSchema,
});
export type CreateEscalationRuleInput = z.infer<
  typeof createEscalationRuleInputSchema
>;

export const updateEscalationRuleInputSchema = z.object({
  ruleId: z.uuid(),
  thresholdMinutes: z
    .number()
    .int()
    .min(5)
    .max(60 * 24 * 90)
    .optional(),
  action: escalationActionSchema.optional(),
  isActive: z.boolean().optional(),
});
export type UpdateEscalationRuleInput = z.infer<
  typeof updateEscalationRuleInputSchema
>;

export const deleteEscalationRuleInputSchema = z.object({
  ruleId: z.uuid(),
});
export type DeleteEscalationRuleInput = z.infer<
  typeof deleteEscalationRuleInputSchema
>;

export const listEscalationRulesInputSchema = z.object({
  queueId: z.uuid(),
});
export type ListEscalationRulesInput = z.infer<
  typeof listEscalationRulesInputSchema
>;
