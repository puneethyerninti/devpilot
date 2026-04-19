// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import IORedis from "ioredis";
import type { AppConfig } from "../config";
import type { OutboundSocketMessage } from "../types/messages";
import { logger } from "../utils/logger";

type Envelope = {
  message: OutboundSocketMessage;
  room?: string;
};

type DirectEmitter = (message: OutboundSocketMessage, room?: string) => void;

let publisherClient: IORedis | null = null;
let directEmitter: DirectEmitter | null = null;

export const initSocketPublisher = (config: AppConfig) => {
  if (publisherClient) return publisherClient;
  publisherClient = new IORedis(config.redisUrl);
  publisherClient.on("error", (err) => {
    logger.warn("redis.socket_publisher_error", { error: err.message });
  });
  return publisherClient;
};

export const registerDirectEmitter = (fn: DirectEmitter) => {
  directEmitter = fn;
};

export const publishSocketEvent = async (message: OutboundSocketMessage, room?: string) => {
  directEmitter?.(message, room);
  if (publisherClient) {
    await publisherClient.publish("socket-events", JSON.stringify({ message, room } satisfies Envelope));
  }
};
