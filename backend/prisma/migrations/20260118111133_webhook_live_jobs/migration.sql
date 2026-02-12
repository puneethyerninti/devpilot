/*
  Warnings:

  - A unique constraint covering the columns `[deliveryId]` on the table `PRJob` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[installationId,repoOwner,repoName,prNumber,headSha]` on the table `PRJob` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PRJob" ADD COLUMN     "deliveryId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PRJob_deliveryId_key" ON "PRJob"("deliveryId");

-- CreateIndex
CREATE UNIQUE INDEX "PRJob_installationId_repoOwner_repoName_prNumber_headSha_key" ON "PRJob"("installationId", "repoOwner", "repoName", "prNumber", "headSha");
