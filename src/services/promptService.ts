import { prisma } from "../lib/prisma";
import { badRequest, notFound } from "../lib/httpError";
import type {
  CreatePromptGroupInput,
  CreatePromptInput,
  CreatePromptSetInput,
  EditPromptTextInput,
  SetPromptStatusInput,
} from "../validation/prompt";

const promptInclude = {
  currentVersion: true,
  promptGroup: true,
  comparedCompetitor: true,
} as const;

export async function listPromptSets(projectId: string) {
  return prisma.promptSet.findMany({
    where: { projectId },
    include: { promptGroups: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createPromptSet(projectId: string, input: CreatePromptSetInput) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw notFound("Project");
  return prisma.promptSet.create({
    data: { projectId, name: input.name ?? "Default", description: input.description },
  });
}

export async function getOrCreateDefaultPromptSet(projectId: string) {
  const existing = await prisma.promptSet.findUnique({
    where: { projectId_name: { projectId, name: "Default" } },
  });
  if (existing) return existing;
  return prisma.promptSet.create({ data: { projectId, name: "Default" } });
}

export async function createPromptGroup(promptSetId: string, input: CreatePromptGroupInput) {
  const promptSet = await prisma.promptSet.findUnique({ where: { id: promptSetId } });
  if (!promptSet) throw notFound("PromptSet");
  return prisma.promptGroup.create({ data: { promptSetId, ...input } });
}

export async function listPrompts(promptSetId: string) {
  const promptSet = await prisma.promptSet.findUnique({ where: { id: promptSetId } });
  if (!promptSet) throw notFound("PromptSet");
  return prisma.prompt.findMany({
    where: { promptSetId },
    include: promptInclude,
    orderBy: { createdAt: "asc" },
  });
}

export async function getPromptOrThrow(promptId: string) {
  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
    include: { ...promptInclude, versions: { orderBy: { versionNumber: "desc" } } },
  });
  if (!prompt) throw notFound("Prompt");
  return prompt;
}

// Two-step transaction, per the Module 1 schema design: a Prompt and its
// first PromptVersion reference each other, so Prompt is created with
// currentVersionId = null, then repointed once the version exists.
export async function createPrompt(promptSetId: string, input: CreatePromptInput) {
  const promptSet = await prisma.promptSet.findUnique({ where: { id: promptSetId } });
  if (!promptSet) throw notFound("PromptSet");

  if (input.promptGroupId) {
    const group = await prisma.promptGroup.findUnique({ where: { id: input.promptGroupId } });
    if (!group || group.promptSetId !== promptSetId) throw badRequest("promptGroupId does not belong to this PromptSet");
  }

  if (input.intent === "COMPARISON" && !input.comparedCompetitorId) {
    throw badRequest("comparedCompetitorId is required for COMPARISON-intent prompts");
  }
  if (input.comparedCompetitorId) {
    const competitor = await prisma.competitor.findUnique({ where: { id: input.comparedCompetitorId } });
    if (!competitor || competitor.projectId !== promptSet.projectId) {
      throw badRequest("comparedCompetitorId does not belong to this project");
    }
  }

  return prisma.$transaction(async (tx) => {
    const prompt = await tx.prompt.create({
      data: {
        projectId: promptSet.projectId,
        promptSetId,
        promptGroupId: input.promptGroupId,
        intent: input.intent,
        comparedCompetitorId: input.comparedCompetitorId,
      },
    });

    const version = await tx.promptVersion.create({
      data: {
        promptId: prompt.id,
        versionNumber: 1,
        text: input.text,
        createdById: input.createdById,
      },
    });

    return tx.prompt.update({
      where: { id: prompt.id },
      data: { currentVersionId: version.id },
      include: promptInclude,
    });
  });
}

export async function editPromptText(promptId: string, input: EditPromptTextInput) {
  const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
  if (!prompt) throw notFound("Prompt");

  const latest = await prisma.promptVersion.findFirst({
    where: { promptId },
    orderBy: { versionNumber: "desc" },
  });
  const nextVersionNumber = (latest?.versionNumber ?? 0) + 1;

  return prisma.$transaction(async (tx) => {
    const version = await tx.promptVersion.create({
      data: {
        promptId,
        versionNumber: nextVersionNumber,
        text: input.text,
        createdById: input.createdById,
      },
    });

    return tx.prompt.update({
      where: { id: promptId },
      data: { currentVersionId: version.id },
      include: promptInclude,
    });
  });
}

// Prompts are never hard-deleted (historical Run rows must keep a valid FK)
// — lifecycle moves through status instead.
export async function setPromptStatus(promptId: string, input: SetPromptStatusInput) {
  const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
  if (!prompt) throw notFound("Prompt");

  return prisma.prompt.update({
    where: { id: promptId },
    data: {
      status: input.status,
      deprecatedAt: input.status === "DEPRECATED" ? new Date() : prompt.deprecatedAt,
      archivedAt: input.status === "ARCHIVED" ? new Date() : prompt.archivedAt,
    },
  });
}
