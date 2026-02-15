import pino from "pino";

const baseLogger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: ["req.headers.authorization", "authorization", "token", "password", "apiKey"],
    censor: "[REDACTED]"
  }
});

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => baseLogger.debug(meta ?? {}, message),
  info: (message: string, meta?: Record<string, unknown>) => baseLogger.info(meta ?? {}, message),
  warn: (message: string, meta?: Record<string, unknown>) => baseLogger.warn(meta ?? {}, message),
  error: (message: string, meta?: Record<string, unknown>) => baseLogger.error(meta ?? {}, message)
};
