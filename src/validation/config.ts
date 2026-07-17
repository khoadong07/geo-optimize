import { z } from "zod";

export const platformNameEnum = z.enum([
  "GEMINI",
  "OPENAI",
  "PERPLEXITY",
  "GROK",
  "COPILOT",
  "GOOGLE_AI_OVERVIEW",
]);

export const upsertPlatformConfigSchema = z.object({
  platform: platformNameEnum,
  isEnabled: z.boolean(),
  config: z.record(z.unknown()).optional(),
});
export type UpsertPlatformConfigInput = z.infer<typeof upsertPlatformConfigSchema>;

const scopeXor = <T extends { promptId?: string; promptGroupId?: string }>(v: T) =>
  (v.promptId ? 1 : 0) + (v.promptGroupId ? 1 : 0) === 1;
const scopeXorMessage = {
  message: "Exactly one of promptId or promptGroupId must be set",
  path: ["promptId"],
};

export const targetKindEnum = z.enum(["POSITION", "APPEARANCE_RATE", "SENTIMENT", "SHARE_OF_VOICE"]);
export const evaluationWindowUnitEnum = z.enum(["RUNS", "DAYS"]);

export const createTargetConfigSchema = z
  .object({
    promptId: z.string().min(1).optional(),
    promptGroupId: z.string().min(1).optional(),
    kind: targetKindEnum,
    thresholdValue: z.number(),
    windowUnit: evaluationWindowUnitEnum,
    windowValue: z.number().int().min(1),
    minSampleSize: z.number().int().min(1).optional(),
    extraParams: z.record(z.unknown()).optional(),
  })
  .refine(scopeXor, scopeXorMessage);
export type CreateTargetConfigInput = z.infer<typeof createTargetConfigSchema>;

export const scheduleFrequencyEnum = z.enum(["DAILY", "WEEKLY"]);
export const priorityTierEnum = z.enum(["CORE", "STANDARD", "MAINTENANCE"]);

export const createScheduleConfigSchema = z
  .object({
    promptId: z.string().min(1).optional(),
    promptGroupId: z.string().min(1).optional(),
    frequency: scheduleFrequencyEnum,
    runsPerCycle: z.number().int().min(1).max(20).optional(),
    priorityTier: priorityTierEnum.optional(),
    isAutoMaintenance: z.boolean().optional(),
    isPaused: z.boolean().optional(),
  })
  .refine(scopeXor, scopeXorMessage);
export type CreateScheduleConfigInput = z.infer<typeof createScheduleConfigSchema>;

export const updateScheduleConfigSchema = z.object({
  frequency: scheduleFrequencyEnum.optional(),
  runsPerCycle: z.number().int().min(1).max(20).optional(),
  priorityTier: priorityTierEnum.optional(),
  isAutoMaintenance: z.boolean().optional(),
  isPaused: z.boolean().optional(),
});
export type UpdateScheduleConfigInput = z.infer<typeof updateScheduleConfigSchema>;
