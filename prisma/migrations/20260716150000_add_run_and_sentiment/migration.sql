-- CreateEnum
CREATE TYPE "SentimentLabel" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'NOT_APPLICABLE');

-- CreateTable
CREATE TABLE "Run" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "promptVersionId" TEXT NOT NULL,
    "platformConfigId" TEXT NOT NULL,
    "scheduleConfigId" TEXT,
    "runIndexInCycle" INTEGER NOT NULL DEFAULT 1,
    "modelName" TEXT NOT NULL,
    "rawResponse" TEXT NOT NULL,
    "brandMentioned" BOOLEAN NOT NULL DEFAULT false,
    "brandMentionPosition" INTEGER,
    "competitorsMentioned" JSONB,
    "visibilityScore" DECIMAL(6,2) NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunSentiment" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "label" "SentimentLabel" NOT NULL,
    "reasoning" TEXT NOT NULL,
    "topics" JSONB,
    "judgeModel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RunSentiment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Run_projectId_executedAt_idx" ON "Run"("projectId", "executedAt");

-- CreateIndex
CREATE INDEX "Run_promptVersionId_idx" ON "Run"("promptVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "RunSentiment_runId_key" ON "RunSentiment"("runId");

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_promptVersionId_fkey" FOREIGN KEY ("promptVersionId") REFERENCES "PromptVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_platformConfigId_fkey" FOREIGN KEY ("platformConfigId") REFERENCES "ProjectPlatformConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_scheduleConfigId_fkey" FOREIGN KEY ("scheduleConfigId") REFERENCES "ScheduleConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunSentiment" ADD CONSTRAINT "RunSentiment_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

