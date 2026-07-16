-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BrandAliasType" AS ENUM ('OFFICIAL', 'VIETNAMESE', 'ABBREVIATION', 'OTHER');

-- CreateEnum
CREATE TYPE "PromptIntent" AS ENUM ('DISCOVERY', 'COMPARISON', 'BRANDED', 'LONG_TAIL');

-- CreateEnum
CREATE TYPE "PromptLifecycleStatus" AS ENUM ('ACTIVE', 'DEPRECATED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SeedKeywordSource" AS ENUM ('SEARCH_CONSOLE', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "LlmProvider" AS ENUM ('OPENAI', 'GEMINI', 'ANTHROPIC', 'OTHER');

-- CreateEnum
CREATE TYPE "GenerationBatchStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PlatformName" AS ENUM ('GEMINI', 'OPENAI', 'PERPLEXITY', 'GROK', 'COPILOT', 'GOOGLE_AI_OVERVIEW');

-- CreateEnum
CREATE TYPE "TargetKind" AS ENUM ('POSITION', 'APPEARANCE_RATE', 'SENTIMENT', 'SHARE_OF_VOICE');

-- CreateEnum
CREATE TYPE "EvaluationWindowUnit" AS ENUM ('RUNS', 'DAYS');

-- CreateEnum
CREATE TYPE "ScheduleFrequency" AS ENUM ('DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "PriorityTier" AS ENUM ('CORE', 'STANDARD', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "TierChangeReason" AS ENUM ('INITIAL', 'TARGET_MET_AUTO', 'TARGET_REGRESSED_AUTO', 'MANUAL_OVERRIDE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "officialWebsite" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandAlias" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "type" "BrandAliasType" NOT NULL DEFAULT 'OTHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptSet" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptGroup" (
    "id" TEXT NOT NULL,
    "promptSetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "promptSetId" TEXT NOT NULL,
    "promptGroupId" TEXT,
    "intent" "PromptIntent" NOT NULL,
    "status" "PromptLifecycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "comparedCompetitorId" TEXT,
    "currentVersionId" TEXT,
    "deprecatedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptVersion" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "sourceCandidateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "PromptVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeedKeyword" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "source" "SeedKeywordSource" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "SeedKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerationBatch" (
    "id" TEXT NOT NULL,
    "seedKeywordId" TEXT NOT NULL,
    "provider" "LlmProvider" NOT NULL,
    "modelName" TEXT NOT NULL,
    "generationPrompt" TEXT NOT NULL,
    "requestedVariantCount" INTEGER NOT NULL DEFAULT 8,
    "requestedIntents" "PromptIntent"[],
    "status" "GenerationBatchStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "GenerationBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedPromptCandidate" (
    "id" TEXT NOT NULL,
    "generationBatchId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "suggestedIntent" "PromptIntent" NOT NULL,
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "editedText" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedPromptCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectPlatformConfig" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "platform" "PlatformName" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectPlatformConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TargetConfig" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "promptId" TEXT,
    "promptGroupId" TEXT,
    "kind" "TargetKind" NOT NULL,
    "thresholdValue" DECIMAL(6,2) NOT NULL,
    "windowUnit" "EvaluationWindowUnit" NOT NULL,
    "windowValue" INTEGER NOT NULL,
    "minSampleSize" INTEGER,
    "extraParams" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TargetConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleConfig" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "promptId" TEXT,
    "promptGroupId" TEXT,
    "frequency" "ScheduleFrequency" NOT NULL,
    "runsPerCycle" INTEGER NOT NULL DEFAULT 1,
    "priorityTier" "PriorityTier" NOT NULL DEFAULT 'STANDARD',
    "isAutoMaintenance" BOOLEAN NOT NULL DEFAULT true,
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "lastTierChangeAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleTierHistory" (
    "id" TEXT NOT NULL,
    "scheduleConfigId" TEXT NOT NULL,
    "fromTier" "PriorityTier",
    "toTier" "PriorityTier" NOT NULL,
    "reason" "TierChangeReason" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT,

    CONSTRAINT "ScheduleTierHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BrandAlias_projectId_alias_key" ON "BrandAlias"("projectId", "alias");

-- CreateIndex
CREATE UNIQUE INDEX "Competitor_projectId_name_key" ON "Competitor"("projectId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PromptSet_projectId_name_key" ON "PromptSet"("projectId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PromptGroup_promptSetId_name_key" ON "PromptGroup"("promptSetId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Prompt_currentVersionId_key" ON "Prompt"("currentVersionId");

-- CreateIndex
CREATE INDEX "Prompt_projectId_status_idx" ON "Prompt"("projectId", "status");

-- CreateIndex
CREATE INDEX "Prompt_promptSetId_idx" ON "Prompt"("promptSetId");

-- CreateIndex
CREATE INDEX "Prompt_promptGroupId_idx" ON "Prompt"("promptGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "PromptVersion_sourceCandidateId_key" ON "PromptVersion"("sourceCandidateId");

-- CreateIndex
CREATE UNIQUE INDEX "PromptVersion_promptId_versionNumber_key" ON "PromptVersion"("promptId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SeedKeyword_projectId_text_key" ON "SeedKeyword"("projectId", "text");

-- CreateIndex
CREATE INDEX "GenerationBatch_seedKeywordId_idx" ON "GenerationBatch"("seedKeywordId");

-- CreateIndex
CREATE INDEX "GeneratedPromptCandidate_generationBatchId_reviewStatus_idx" ON "GeneratedPromptCandidate"("generationBatchId", "reviewStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectPlatformConfig_projectId_platform_key" ON "ProjectPlatformConfig"("projectId", "platform");

-- CreateIndex
CREATE INDEX "TargetConfig_projectId_kind_idx" ON "TargetConfig"("projectId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "TargetConfig_promptId_kind_key" ON "TargetConfig"("promptId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "TargetConfig_promptGroupId_kind_key" ON "TargetConfig"("promptGroupId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleConfig_promptId_key" ON "ScheduleConfig"("promptId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleConfig_promptGroupId_key" ON "ScheduleConfig"("promptGroupId");

-- CreateIndex
CREATE INDEX "ScheduleConfig_projectId_priorityTier_idx" ON "ScheduleConfig"("projectId", "priorityTier");

-- CreateIndex
CREATE INDEX "ScheduleTierHistory_scheduleConfigId_changedAt_idx" ON "ScheduleTierHistory"("scheduleConfigId", "changedAt");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandAlias" ADD CONSTRAINT "BrandAlias_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competitor" ADD CONSTRAINT "Competitor_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptSet" ADD CONSTRAINT "PromptSet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptGroup" ADD CONSTRAINT "PromptGroup_promptSetId_fkey" FOREIGN KEY ("promptSetId") REFERENCES "PromptSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_promptSetId_fkey" FOREIGN KEY ("promptSetId") REFERENCES "PromptSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_promptGroupId_fkey" FOREIGN KEY ("promptGroupId") REFERENCES "PromptGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_comparedCompetitorId_fkey" FOREIGN KEY ("comparedCompetitorId") REFERENCES "Competitor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "PromptVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_sourceCandidateId_fkey" FOREIGN KEY ("sourceCandidateId") REFERENCES "GeneratedPromptCandidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeedKeyword" ADD CONSTRAINT "SeedKeyword_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeedKeyword" ADD CONSTRAINT "SeedKeyword_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationBatch" ADD CONSTRAINT "GenerationBatch_seedKeywordId_fkey" FOREIGN KEY ("seedKeywordId") REFERENCES "SeedKeyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationBatch" ADD CONSTRAINT "GenerationBatch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedPromptCandidate" ADD CONSTRAINT "GeneratedPromptCandidate_generationBatchId_fkey" FOREIGN KEY ("generationBatchId") REFERENCES "GenerationBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedPromptCandidate" ADD CONSTRAINT "GeneratedPromptCandidate_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPlatformConfig" ADD CONSTRAINT "ProjectPlatformConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetConfig" ADD CONSTRAINT "TargetConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetConfig" ADD CONSTRAINT "TargetConfig_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetConfig" ADD CONSTRAINT "TargetConfig_promptGroupId_fkey" FOREIGN KEY ("promptGroupId") REFERENCES "PromptGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleConfig" ADD CONSTRAINT "ScheduleConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleConfig" ADD CONSTRAINT "ScheduleConfig_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleConfig" ADD CONSTRAINT "ScheduleConfig_promptGroupId_fkey" FOREIGN KEY ("promptGroupId") REFERENCES "PromptGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleTierHistory" ADD CONSTRAINT "ScheduleTierHistory_scheduleConfigId_fkey" FOREIGN KEY ("scheduleConfigId") REFERENCES "ScheduleConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleTierHistory" ADD CONSTRAINT "ScheduleTierHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CheckConstraint
-- TargetConfig / ScheduleConfig must scope to exactly one of Prompt or
-- PromptGroup (XOR). Prisma's schema DSL has no CHECK constraint syntax, so
-- this invariant is added by hand here; mirror it in app-layer validation
-- (e.g. Zod) before insert so violations surface before hitting the DB.
ALTER TABLE "TargetConfig" ADD CONSTRAINT "target_config_scope_xor"
  CHECK ((("promptId" IS NOT NULL)::int + ("promptGroupId" IS NOT NULL)::int) = 1);

ALTER TABLE "ScheduleConfig" ADD CONSTRAINT "schedule_config_scope_xor"
  CHECK ((("promptId" IS NOT NULL)::int + ("promptGroupId" IS NOT NULL)::int) = 1);
