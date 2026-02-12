-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('viewer', 'operator', 'admin');

-- CreateEnum
CREATE TYPE "RepoRole" AS ENUM ('viewer', 'operator', 'admin');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('queued', 'processing', 'done', 'failed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "githubId" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'viewer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repo" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultBranch" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepoUser" (
    "repoId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "RepoRole" NOT NULL DEFAULT 'viewer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepoUser_pkey" PRIMARY KEY ("repoId","userId")
);

-- CreateTable
CREATE TABLE "PRJob" (
    "id" SERIAL NOT NULL,
    "jobId" TEXT NOT NULL,
    "prNumber" INTEGER NOT NULL,
    "headSha" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'queued',
    "summary" TEXT,
    "aiResponseRaw" JSONB,
    "errorText" TEXT,
    "tokenCount" INTEGER,
    "costCents" INTEGER,
    "meta" JSONB,
    "triggeredBy" TEXT,
    "repoId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PRJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PRFile" (
    "id" TEXT NOT NULL,
    "jobId" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "comments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PRFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionLog" (
    "id" TEXT NOT NULL,
    "jobId" INTEGER,
    "workerId" TEXT,
    "kind" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "Repo_fullName_key" ON "Repo"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "PRJob_jobId_key" ON "PRJob"("jobId");

-- CreateIndex
CREATE INDEX "ActionLog_jobId_idx" ON "ActionLog"("jobId");

-- CreateIndex
CREATE INDEX "ActionLog_kind_idx" ON "ActionLog"("kind");

-- AddForeignKey
ALTER TABLE "RepoUser" ADD CONSTRAINT "RepoUser_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepoUser" ADD CONSTRAINT "RepoUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PRJob" ADD CONSTRAINT "PRJob_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PRFile" ADD CONSTRAINT "PRFile_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "PRJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionLog" ADD CONSTRAINT "ActionLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "PRJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
