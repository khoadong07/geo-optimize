import type { PromptIntent } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { llmClientForProvider } from "../lib/llm";
import { badRequest, conflict, HttpError, notFound } from "../lib/httpError";
import { getOrCreateDefaultPromptSet } from "./promptService";
import type {
  ApproveCandidateInput,
  CreateSeedKeywordInput,
  GenerateBatchInput,
  RejectCandidateInput,
} from "../validation/paraphrase";

const ALL_INTENTS: PromptIntent[] = ["DISCOVERY", "COMPARISON", "BRANDED", "LONG_TAIL"];

const INTENT_GUIDE: Record<PromptIntent, string> = {
  DISCOVERY: 'không nhắc tên thương hiệu cụ thể, hỏi mở dạng "X nào tốt nhất cho..."',
  COMPARISON: 'so sánh trực tiếp thương hiệu với một đối thủ cụ thể, dạng "A và B cái nào tốt hơn"',
  BRANDED: "có nhắc tên thương hiệu cụ thể, hỏi về uy tín/chất lượng/độ tin cậy của thương hiệu đó",
  LONG_TAIL: "câu hỏi tự nhiên theo hành vi tìm kiếm thực tế, không nhất thiết nhắc thương hiệu",
};

function buildGenerationPrompt(params: {
  seedKeywordText: string;
  projectName: string;
  industry: string | null;
  variantCount: number;
  intents: PromptIntent[];
}): string {
  const intentLines = params.intents.map((i) => `- ${i}: ${INTENT_GUIDE[i]}`).join("\n");
  return `Bạn đang giúp xây dựng bộ câu hỏi (prompt) để theo dõi thương hiệu "${params.projectName}"${
    params.industry ? ` (ngành: ${params.industry})` : ""
  } trong câu trả lời của các mô hình AI (ChatGPT, Gemini...) tại thị trường Việt Nam.

Từ khoá gốc (seed keyword): "${params.seedKeywordText}"

Hãy sinh ra ${params.variantCount} câu hỏi tiếng Việt tự nhiên, đa dạng cách diễn đạt, mô phỏng cách người dùng thật sẽ hỏi một trợ lý AI — KHÔNG phải dạng "exact match keyword" như SEO truyền thống.

Mỗi câu hỏi phải được gắn với đúng 1 trong các loại intent sau:
${intentLines}

Chỉ trả về JSON thuần, là một mảng object, không kèm giải thích hay markdown code fence:
[{ "text": "...", "intent": "DISCOVERY" }, ...]`;
}

function tryParseCandidates(raw: string): Array<{ text: string; intent: PromptIntent }> {
  const jsonSlice = raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1);
  const candidateSource = jsonSlice.length > 0 ? jsonSlice : raw;

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidateSource);
  } catch {
    throw badRequest("LLM response was not valid JSON", { raw });
  }

  if (!Array.isArray(parsed)) {
    throw badRequest("LLM response JSON was not an array", { raw });
  }

  return parsed
    .filter(
      (item): item is { text: string; intent: PromptIntent } =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as { text?: unknown }).text === "string" &&
        ALL_INTENTS.includes((item as { intent?: unknown }).intent as PromptIntent),
    )
    .map((item) => ({ text: item.text.trim(), intent: item.intent }));
}

export async function createSeedKeyword(projectId: string, input: CreateSeedKeywordInput) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw notFound("Project");
  return prisma.seedKeyword.create({ data: { projectId, ...input } });
}

export async function listSeedKeywords(projectId: string) {
  return prisma.seedKeyword.findMany({
    where: { projectId },
    include: { batches: { include: { candidates: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function generateBatch(seedKeywordId: string, input: GenerateBatchInput) {
  const seedKeyword = await prisma.seedKeyword.findUnique({
    where: { id: seedKeywordId },
    include: { project: true },
  });
  if (!seedKeyword) throw notFound("SeedKeyword");

  const variantCount = input.requestedVariantCount ?? 8;
  const intents = input.requestedIntents?.length ? input.requestedIntents : ALL_INTENTS;
  const generationPrompt = buildGenerationPrompt({
    seedKeywordText: seedKeyword.text,
    projectName: seedKeyword.project.name,
    industry: seedKeyword.project.industry,
    variantCount,
    intents,
  });

  const llm = llmClientForProvider(input.provider);
  const { text, modelName } = await llm.generateText(
    generationPrompt,
    "Bạn chỉ trả lời bằng JSON thuần, không thêm bất kỳ văn bản nào khác.",
  );

  let candidates: Array<{ text: string; intent: PromptIntent }>;
  try {
    candidates = tryParseCandidates(text);
  } catch (err) {
    await prisma.generationBatch.create({
      data: {
        seedKeywordId,
        provider: input.provider,
        modelName,
        generationPrompt,
        requestedVariantCount: variantCount,
        requestedIntents: intents,
        status: "FAILED",
        createdById: input.createdById,
      },
    });
    if (err instanceof HttpError) throw err;
    throw err;
  }

  return prisma.generationBatch.create({
    data: {
      seedKeywordId,
      provider: input.provider,
      modelName,
      generationPrompt,
      requestedVariantCount: variantCount,
      requestedIntents: intents,
      status: "COMPLETED",
      createdById: input.createdById,
      candidates: {
        create: candidates.map((c) => ({ text: c.text, suggestedIntent: c.intent })),
      },
    },
    include: { candidates: true },
  });
}

export async function listCandidates(generationBatchId: string) {
  const batch = await prisma.generationBatch.findUnique({ where: { id: generationBatchId } });
  if (!batch) throw notFound("GenerationBatch");
  return prisma.generatedPromptCandidate.findMany({ where: { generationBatchId } });
}

// Promotes an approved candidate into a real, trackable Prompt (+ its first
// PromptVersion), atomically with the review decision — mirrors the
// two-step Prompt/PromptVersion creation transaction in promptService.
export async function approveCandidate(candidateId: string, input: ApproveCandidateInput) {
  const candidate = await prisma.generatedPromptCandidate.findUnique({
    where: { id: candidateId },
    include: { generationBatch: { include: { seedKeyword: true } } },
  });
  if (!candidate) throw notFound("GeneratedPromptCandidate");
  if (candidate.reviewStatus !== "PENDING") throw conflict(`Candidate already ${candidate.reviewStatus.toLowerCase()}`);

  const projectId = candidate.generationBatch.seedKeyword.projectId;
  const promptSetId = input.promptSetId ?? (await getOrCreateDefaultPromptSet(projectId)).id;

  if (input.promptGroupId) {
    const group = await prisma.promptGroup.findUnique({ where: { id: input.promptGroupId } });
    if (!group || group.promptSetId !== promptSetId) throw badRequest("promptGroupId does not belong to this PromptSet");
  }
  if (candidate.suggestedIntent === "COMPARISON" && !input.comparedCompetitorId) {
    throw badRequest("comparedCompetitorId is required to approve a COMPARISON-intent candidate");
  }

  const finalText = input.editedText ?? candidate.text;

  return prisma.$transaction(async (tx) => {
    const prompt = await tx.prompt.create({
      data: {
        projectId,
        promptSetId,
        promptGroupId: input.promptGroupId,
        intent: candidate.suggestedIntent,
        comparedCompetitorId: input.comparedCompetitorId,
      },
    });

    const version = await tx.promptVersion.create({
      data: {
        promptId: prompt.id,
        versionNumber: 1,
        text: finalText,
        sourceCandidateId: candidate.id,
      },
    });

    await tx.prompt.update({ where: { id: prompt.id }, data: { currentVersionId: version.id } });

    await tx.generatedPromptCandidate.update({
      where: { id: candidateId },
      data: {
        reviewStatus: "APPROVED",
        reviewedById: input.reviewedById,
        reviewedAt: new Date(),
        editedText: input.editedText,
      },
    });

    return tx.prompt.findUniqueOrThrow({
      where: { id: prompt.id },
      include: { currentVersion: true },
    });
  });
}

export async function rejectCandidate(candidateId: string, input: RejectCandidateInput) {
  const candidate = await prisma.generatedPromptCandidate.findUnique({ where: { id: candidateId } });
  if (!candidate) throw notFound("GeneratedPromptCandidate");
  if (candidate.reviewStatus !== "PENDING") throw conflict(`Candidate already ${candidate.reviewStatus.toLowerCase()}`);

  return prisma.generatedPromptCandidate.update({
    where: { id: candidateId },
    data: {
      reviewStatus: "REJECTED",
      reviewedById: input.reviewedById,
      reviewedAt: new Date(),
      rejectionReason: input.rejectionReason,
    },
  });
}
