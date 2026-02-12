// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

export const prisma = new PrismaClient({
  log: [{ emit: "event", level: "query" }]
});

prisma.$on("query", (event) => {
  logger.debug("prisma.query", { sql: event.query, durationMs: event.duration });
});
