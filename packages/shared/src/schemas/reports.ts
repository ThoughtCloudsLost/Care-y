import { z } from "zod";
import { callStatusSchema } from "./tickets.js";

export const queueStatSchema = z.object({
  queueId: z.string(),
  encryptedQueueName: z.string(),
  open: z.number().int().nonnegative(),
  closed: z.number().int().nonnegative(),
});

export type QueueStat = z.infer<typeof queueStatSchema>;

export const monthlyVolumeSchema = z.object({
  month: z.string(),
  created: z.number().int().nonnegative(),
  closed: z.number().int().nonnegative(),
});

export type MonthlyVolume = z.infer<typeof monthlyVolumeSchema>;

export const monthlyResolutionSchema = z.object({
  month: z.string(),
  avgDays: z.number().nonnegative(),
});

export type MonthlyResolution = z.infer<typeof monthlyResolutionSchema>;

export const priorityStatSchema = z.object({
  priority: z.number().int(),
  count: z.number().int().nonnegative(),
});

export type PriorityStat = z.infer<typeof priorityStatSchema>;

// --- Call log (7.5b) ---

export const callDirectionSchema = z.enum(["inbound", "outbound"]);
export type CallDirection = z.infer<typeof callDirectionSchema>;

export const callLogQueryInputSchema = z.object({
  direction: callDirectionSchema.optional(),
  callStatus: callStatusSchema.optional(),
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
});
export type CallLogQueryInput = z.infer<typeof callLogQueryInputSchema>;
