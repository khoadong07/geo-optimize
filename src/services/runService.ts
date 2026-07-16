import type { Prisma, PlatformName } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { llmClientForPlatform } from "../lib/llm";
import { badRequest, notFound } from "../lib/httpError";
import { classifySentiment } from "./sentimentService";
import { scanMentions } from "./visibilityService";

export interface ExecuteRunParams {
  promptId: string;
  platform: PlatformName;
  scheduleConfigId?: string;
  runIndexInCycle?: number;
}

export async function executeRun(params: ExecuteRunParams) {
  const prompt = await prisma.prompt.findUnique({
    where: { id: params.promptId },
    include: {
      currentVersion: true,
      project: { include: { brandAliases: true, competitors: { where: { isActive: true } } } },
    },
  });
  if (!prompt) throw notFound("Prompt");
  if (!prompt.currentVersion) throw badRequest("Prompt has no current version yet");
  if (prompt.status !== "ACTIVE") throw badRequest(`Prompt is ${prompt.status.toLowerCase()}, not ACTIVE`);

  const platformConfig = await prisma.projectPlatformConfig.findUnique({
    where: { projectId_platform: { projectId: prompt.projectId, platform: params.platform } },
  });
  if (!platformConfig || !platformConfig.isEnabled) {
    throw badRequest(`Platform ${params.platform} is not enabled for this project`);
  }

  const llm = llmClientForPlatform(params.platform);
  const { text: rawResponse, modelName } = await llm.generateText(prompt.currentVersion.text);

  const brandNames = [prompt.project.name, ...prompt.project.brandAliases.map((a) => a.alias)];
  const scan = scanMentions(rawResponse, brandNames, prompt.project.competitors);

  const run = await prisma.run.create({
    data: {
      projectId: prompt.projectId,
      promptVersionId: prompt.currentVersion.id,
      platformConfigId: platformConfig.id,
      scheduleConfigId: params.scheduleConfigId,
      runIndexInCycle: params.runIndexInCycle ?? 1,
      modelName,
      rawResponse,
      brandMentioned: scan.brandMentioned,
      brandMentionPosition: scan.brandMentionPosition,
      competitorsMentioned: scan.competitorsMentioned as unknown as Prisma.InputJsonValue,
      visibilityScore: scan.visibilityScore,
    },
  });

  const sentiment = await classifySentiment(llm, {
    rawResponse,
    brandName: prompt.project.name,
    brandMentioned: scan.brandMentioned,
  });

  await prisma.runSentiment.create({
    data: {
      runId: run.id,
      label: sentiment.label,
      reasoning: sentiment.reasoning,
      topics: sentiment.topics as unknown as Prisma.InputJsonValue,
      judgeModel: sentiment.judgeModel,
    },
  });

  return prisma.run.findUniqueOrThrow({ where: { id: run.id }, include: { sentiment: true } });
}

export async function listRuns(promptId: string) {
  const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
  if (!prompt) throw notFound("Prompt");
  return prisma.run.findMany({
    where: { promptVersion: { promptId } },
    include: { sentiment: true },
    orderBy: { executedAt: "desc" },
  });
}
