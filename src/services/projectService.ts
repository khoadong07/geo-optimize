import { prisma } from "../lib/prisma";
import { notFound } from "../lib/httpError";
import type {
  CreateBrandAliasInput,
  CreateCompetitorInput,
  CreateProjectInput,
  UpdateCompetitorInput,
  UpdateProjectInput,
} from "../validation/project";

const projectInclude = {
  brandAliases: true,
  competitors: true,
  platformConfigs: true,
} as const;

export async function listProjects() {
  return prisma.project.findMany({ include: projectInclude, orderBy: { createdAt: "desc" } });
}

export async function getProjectOrThrow(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: projectInclude });
  if (!project) throw notFound("Project");
  return project;
}

export async function createProject(input: CreateProjectInput) {
  return prisma.project.create({
    data: {
      name: input.name,
      industry: input.industry,
      officialWebsite: input.officialWebsite,
      ownerId: input.ownerId,
      brandAliases: input.brandAliases?.length ? { create: input.brandAliases } : undefined,
      competitors: input.competitors?.length ? { create: input.competitors } : undefined,
    },
    include: projectInclude,
  });
}

export async function updateProject(projectId: string, input: UpdateProjectInput) {
  await getProjectOrThrow(projectId);
  return prisma.project.update({
    where: { id: projectId },
    data: input,
    include: projectInclude,
  });
}

export async function addBrandAlias(projectId: string, input: CreateBrandAliasInput) {
  await getProjectOrThrow(projectId);
  return prisma.brandAlias.create({ data: { projectId, ...input } });
}

export async function removeBrandAlias(projectId: string, aliasId: string) {
  const alias = await prisma.brandAlias.findUnique({ where: { id: aliasId } });
  if (!alias || alias.projectId !== projectId) throw notFound("BrandAlias");
  await prisma.brandAlias.delete({ where: { id: aliasId } });
}

export async function addCompetitor(projectId: string, input: CreateCompetitorInput) {
  await getProjectOrThrow(projectId);
  return prisma.competitor.create({ data: { projectId, ...input } });
}

export async function updateCompetitor(projectId: string, competitorId: string, input: UpdateCompetitorInput) {
  const competitor = await prisma.competitor.findUnique({ where: { id: competitorId } });
  if (!competitor || competitor.projectId !== projectId) throw notFound("Competitor");
  return prisma.competitor.update({ where: { id: competitorId }, data: input });
}
