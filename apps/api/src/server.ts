import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import { env } from "./config/env.ts";
import prismaPlugin from "./plugins/prisma.ts";
import authPlugin from "./plugins/auth.ts";
import areaRoutes from "./routes/area.ts";
import authRoutes from "./routes/auth.ts";
import healthRoutes from "./routes/health.ts";

export async function createServer(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  await app.register(sensible);
  await app.register(helmet);
  await app.register(cors, { origin: true, credentials: true });
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  await app.register(jwt, { secret: env.JWT_SECRET });
  await app.register(prismaPlugin);
  await app.register(authPlugin);
  await app.register(healthRoutes, { prefix: "/health" });
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(areaRoutes, { prefix: "/areas" });
  return app;
}
