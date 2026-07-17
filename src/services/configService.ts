import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { badRequest, conflict, notFound } from "../lib/httpError";
import type {
  CreateScheduleConfigInput,
  CreateTargetConfigInput,
  UpdateScheduleConfigInput,
  UpsertPlatformConfigInput,
} from "../validation/config";

async function resolveScope(projectId: string, promptId?: string, promptGroupId?: string) {
  if (promptId) {
    const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
    if (!prompt || prompt.projectId !== projectId) throw badRequest("promptId does not belong to this project");
  }
  if (promptGroupId) {
    const group = await prisma.promptGroup.findUnique({ where: { id: promptGroupId }, include: { promptSet: true } });
    if (!group || group.promptSet.projectId !== projectId) {
      throw badRequest("promptGroupId does not belong to this project");
    }
  }
}

// --- Platform config -------------------------------------------------------

export async function listPlatformConfigs(projectId: string) {
  return prisma.projectPlatformConfig.findMany({ where: { projectId } });
}

export async function upsertPlatformConfig(projectId: string, input: UpsertPlatformConfigInput) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw notFound("Project");

  return prisma.projectPlatformConfig.upsert({
    where: { projectId_platform: { projectId, platform: input.platform } },
    create: {
      projectId,
      platform: input.platform,
      isEnabled: input.isEnabled,
      config: input.config as Prisma.InputJsonValue | undefined,
    },
    update: { isEnabled: input.isEnabled, config: input.config as Prisma.InputJsonValue | undefined },
  });
}

// --- Target config -----------------------------------------------------

export async function listTargetConfigs(projectId: string) {
  return prisma.targetConfig.findMany({ where: { projectId } });
}

export async function createTargetConfig(projectId: string, input: CreateTargetConfigInput) {
  await resolveScope(projectId, input.promptId, input.promptGroupId);

  try {
    return await prisma.targetConfig.create({
      data: {
        projectId,
        promptId: input.promptId,
        promptGroupId: input.promptGroupId,
        kind: input.kind,
        thresholdValue: input.thresholdValue,
        windowUnit: input.windowUnit,
        windowValue: input.windowValue,
        minSampleSize: input.minSampleSize,
        extraParams: input.extraParams as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw conflict("A TargetConfig of this kind already exists for this scope");
    }
    throw err;
  }
}

export async function deleteTargetConfig(projectId: string, targetConfigId: string) {
  const target = await prisma.targetConfig.findUnique({ where: { id: targetConfigId } });
  if (!target || target.projectId !== projectId) throw notFound("TargetConfig");
  await prisma.targetConfig.delete({ where: { id: targetConfigId } });
}

// --- Schedule config -----------------------------------------------------

export async function listScheduleConfigs(projectId: string) {
  return prisma.scheduleConfig.findMany({ where: { projectId } });
}

export async function createScheduleConfig(projectId: string, input: CreateScheduleConfigInput) {
  await resolveScope(projectId, input.promptId, input.promptGroupId);

  try {
    return await prisma.$transaction(async (tx) => {
      const created = await tx.scheduleConfig.create({
        data: {
          projectId,
          promptId: input.promptId,
          promptGroupId: input.promptGroupId,
          frequency: input.frequency,
          runsPerCycle: input.runsPerCycle,
          priorityTier: input.priorityTier,
          isAutoMaintenance: input.isAutoMaintenance,
          isPaused: input.isPaused,
          lastTierChangeAt: new Date(),
        },
      });
      await tx.scheduleTierHistory.create({
        data: { scheduleConfigId: created.id, toTier: created.priorityTier, reason: "INITIAL" },
      });
      return created;
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw conflict("A ScheduleConfig already exists for this scope");
    }
    throw err;
  }
}

export async function updateScheduleConfig(
  projectId: string,
  scheduleConfigId: string,
  input: UpdateScheduleConfigInput,
) {
  const existing = await prisma.scheduleConfig.findUnique({ where: { id: scheduleConfigId } });
  if (!existing || existing.projectId !== projectId) throw notFound("ScheduleConfig");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.scheduleConfig.update({
      where: { id: scheduleConfigId },
      data: {
        frequency: input.frequency,
        runsPerCycle: input.runsPerCycle,
        priorityTier: input.priorityTier,
        isAutoMaintenance: input.isAutoMaintenance,
        isPaused: input.isPaused,
        lastTierChangeAt: input.priorityTier && input.priorityTier !== existing.priorityTier ? new Date() : undefined,
      },
    });

    if (input.priorityTier && input.priorityTier !== existing.priorityTier) {
      await tx.scheduleTierHistory.create({
        data: {
          scheduleConfigId,
          fromTier: existing.priorityTier,
          toTier: input.priorityTier,
          reason: "MANUAL_OVERRIDE",
        },
      });
    }

    return updated;
  });
}
