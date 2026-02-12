-- AlterTable
ALTER TABLE "PRJob" ADD COLUMN     "aiReviewMd" TEXT,
ADD COLUMN     "inlineSuggestions" JSONB,
ADD COLUMN     "riskScore" DOUBLE PRECISION;
