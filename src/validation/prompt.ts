import { z } from "zod";

export const promptIntentEnum = z.enum(["DISCOVERY", "COMPARISON", "BRANDED", "LONG_TAIL"]);
export const promptStatusEnum = z.enum(["ACTIVE", "DEPRECATED", "ARCHIVED"]);

export const createPromptSetSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});
export type CreatePromptSetInput = z.infer<typeof createPromptSetSchema>;

export const createPromptGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});
export type CreatePromptGroupInput = z.infer<typeof createPromptGroupSchema>;

export const createPromptSchema = z.object({
  promptGroupId: z.string().min(1).optional(),
  intent: promptIntentEnum,
  comparedCompetitorId: z.string().min(1).optional(),
  text: z.string().min(1),
  createdById: z.string().min(1).optional(),
});
export type CreatePromptInput = z.infer<typeof createPromptSchema>;

export const editPromptTextSchema = z.object({
  text: z.string().min(1),
  createdById: z.string().min(1).optional(),
});
export type EditPromptTextInput = z.infer<typeof editPromptTextSchema>;

export const setPromptStatusSchema = z.object({
  status: promptStatusEnum,
});
export type SetPromptStatusInput = z.infer<typeof setPromptStatusSchema>;
