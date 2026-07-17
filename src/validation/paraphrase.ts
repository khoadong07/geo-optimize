import { z } from "zod";
import { promptIntentEnum } from "./prompt";

export const seedKeywordSourceEnum = z.enum(["SEARCH_CONSOLE", "MANUAL", "OTHER"]);
export const llmProviderEnum = z.enum(["OPENAI", "GEMINI"]);

export const createSeedKeywordSchema = z.object({
  text: z.string().min(1),
  source: seedKeywordSourceEnum.optional(),
  createdById: z.string().min(1).optional(),
});
export type CreateSeedKeywordInput = z.infer<typeof createSeedKeywordSchema>;

export const generateBatchSchema = z.object({
  provider: llmProviderEnum,
  requestedVariantCount: z.number().int().min(1).max(20).optional(),
  requestedIntents: z.array(promptIntentEnum).optional(),
  createdById: z.string().min(1).optional(),
});
export type GenerateBatchInput = z.infer<typeof generateBatchSchema>;

export const approveCandidateSchema = z.object({
  promptSetId: z.string().min(1).optional(),
  promptGroupId: z.string().min(1).optional(),
  comparedCompetitorId: z.string().min(1).optional(),
  editedText: z.string().min(1).optional(),
  reviewedById: z.string().min(1).optional(),
});
export type ApproveCandidateInput = z.infer<typeof approveCandidateSchema>;

export const rejectCandidateSchema = z.object({
  rejectionReason: z.string().min(1).optional(),
  reviewedById: z.string().min(1).optional(),
});
export type RejectCandidateInput = z.infer<typeof rejectCandidateSchema>;
