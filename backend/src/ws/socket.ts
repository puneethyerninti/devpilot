// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import IORedis from "ioredis";
import type { AppConfig } from "../config";
import { registerDirectEmitter, initSocketPublisher } from "./publisher";
import type { OutboundSocketMessage } from "../types/messages";
import { logger } from "../utils/logger";
import { verifySocketAuth } from "../middleware/socketAuth";

export const createSocketServer = async (server: HttpServer, config: AppConfig) => {
  const isAllowedOrigin = (origin?: string) => {
    if (!origin) return true;
    if (origin === config.frontendUrl) return true;
    if (config.nodeEnv !== "production" && /^https?:\/\/localhost:\d+$/.test(origin)) return true;
    return false;
  };

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`Socket origin not allowed: ${origin ?? "unknown"}`));
      },
      credentials: true
    }
  });

  const pubClient = createClient({ url: config.redisUrl });
  const subClient = pubClient.duplicate();
  pubClient.on("error", (err) => {
    logger.warn("redis.socket_pub_error", { error: err.message });
  });
  subClient.on("error", (err) => {
    logger.warn("redis.socket_sub_error", { error: err.message });
  });
  await pubClient.connect();
  await subClient.connect();
  io.adapter(createAdapter(pubClient, subClient));

  registerDirectEmitter((message: OutboundSocketMessage, room?: string) => {
    if (room) {
      io.to(room).emit("event", message);
    } else {
      io.emit("event", message);
    }
  });

  initSocketPublisher(config);

  const subscriber = new IORedis(config.redisUrl);
  subscriber.on("error", (err) => {
    logger.warn("redis.socket_events_error", { error: err.message });
  });
  await subscriber.subscribe("socket-events");
  subscriber.on("message", (_channel, payload) => {
    try {
      const { message, room } = JSON.parse(payload) as { message: OutboundSocketMessage; room?: string };
      if (room) {
        io.to(room).emit("event", message);
      } else {
        io.emit("event", message);
      }
    } catch (err) {
      logger.error("socket.publish_parse_failed", { err });
    }
  });

  io.use(verifySocketAuth(config));

  io.on("connection", (socket) => {
    logger.info("socket.connected", { id: socket.id });
    socket.on("subscribe", (room: string) => {
      socket.join(room);
    });

    socket.on("job:retry", (payload: { jobId: number }) => {
      const role = socket.user?.role;
      if (role !== "operator" && role !== "admin") {
        socket.emit("event", { type: "job.failed", payload: { id: payload.jobId, error: "Forbidden" } });
      }
    });
  });

  return io;
};
