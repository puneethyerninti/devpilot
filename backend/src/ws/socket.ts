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

export const createSocketServer = async (server: HttpServer, config: AppConfig) => {
  const io = new Server(server, {
    cors: {
      origin: config.frontendUrl,
      credentials: true
    }
  });

  const pubClient = createClient({ url: config.redisUrl });
  const subClient = pubClient.duplicate();
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

  io.on("connection", (socket) => {
    logger.info("socket.connected", { id: socket.id });
    socket.on("subscribe", (room: string) => {
      socket.join(room);
    });
  });

  return io;
};
