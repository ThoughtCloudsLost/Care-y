import { z } from "zod";

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
