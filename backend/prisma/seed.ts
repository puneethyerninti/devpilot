import { PrismaClient, Prisma, JobStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { githubId: "seed-user" },
    update: {},
    create: {
      githubId: "seed-user",
      login: "seeduser",
      name: "Seed User",
      role: "admin"
    }
  });

  const repo = await prisma.repo.upsert({
    where: { fullName: "seed/repo" },
    update: {},
    create: {
      fullName: "seed/repo",
      owner: "seed",
      name: "repo",
      defaultBranch: "main"
    }
  });

  await prisma.repoUser.upsert({
    where: {
      repoId_userId: {
        repoId: repo.id,
        userId: user.id
      }
    },
    update: { role: "admin" },
    create: {
      repoId: repo.id,
      userId: user.id,
      role: "admin"
    }
  });

  const seedMetadata: Prisma.JsonObject = { step: "seed" };

  const job = await prisma.pRJob.upsert({
    where: { jobId: "seed-job-1" },
    update: {
      status: JobStatus.done,
      summary: "Seed PR review completed",
      tokenCount: 256,
      costCents: 12
    },
    create: {
      jobId: "seed-job-1",
      prNumber: 1,
      headSha: "abcdef123456",
      status: JobStatus.done,
      summary: "Seed PR review completed",
      repoId: repo.id,
      triggeredBy: user.login,
      tokenCount: 256,
      costCents: 12
    }
  });

  await prisma.actionLog.upsert({
    where: { id: "seed-log-1" },
    update: {
      jobId: job.id,
      message: "Seed job verified",
      metadata: seedMetadata
    },
    create: {
      id: "seed-log-1",
      jobId: job.id,
      kind: "seed",
      message: "Seed job created",
      metadata: seedMetadata
    }
  });

  console.log("✅ Seed completed");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
