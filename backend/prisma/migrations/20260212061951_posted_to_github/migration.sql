-- AlterTable
ALTER TABLE "PRJob" ADD COLUMN     "postedToGithubAt" TIMESTAMP(3),
ADD COLUMN     "postedToGithubError" TEXT;
