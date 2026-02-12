-- CreateTable
CREATE TABLE "AiUsage" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL,
    "costCents" INTEGER NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiUsage_jobId_idx" ON "AiUsage"("jobId");

-- CreateIndex
CREATE INDEX "AiUsage_provider_idx" ON "AiUsage"("provider");

-- AddForeignKey
ALTER TABLE "AiUsage" ADD CONSTRAINT "AiUsage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "PRJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
