import { z } from "zod";

export const brandAliasTypeEnum = z.enum(["OFFICIAL", "VIETNAMESE", "ABBREVIATION", "OTHER"]);

export const createProjectSchema = z.object({
  name: z.string().min(1),
  industry: z.string().min(1).optional(),
  officialWebsite: z.string().url().optional(),
  ownerId: z.string().min(1).optional(),
  brandAliases: z
    .array(z.object({ alias: z.string().min(1), type: brandAliasTypeEnum.optional() }))
    .optional(),
  competitors: z
    .array(z.object({ name: z.string().min(1), website: z.string().url().optional() }))
    .optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  industry: z.string().min(1).nullable().optional(),
  officialWebsite: z.string().url().nullable().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
});
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const createBrandAliasSchema = z.object({
  alias: z.string().min(1),
  type: brandAliasTypeEnum.optional(),
});
export type CreateBrandAliasInput = z.infer<typeof createBrandAliasSchema>;

export const createCompetitorSchema = z.object({
  name: z.string().min(1),
  website: z.string().url().optional(),
});
export type CreateCompetitorInput = z.infer<typeof createCompetitorSchema>;

export const updateCompetitorSchema = z.object({
  name: z.string().min(1).optional(),
  website: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateCompetitorInput = z.infer<typeof updateCompetitorSchema>;
