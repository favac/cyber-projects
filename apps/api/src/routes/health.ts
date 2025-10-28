import type { FastifyInstance, FastifyPluginAsync } from "fastify";

export interface HealthStatus {
  readonly status: "ok";
  readonly uptimeSeconds: number;
}

const healthRoutes: FastifyPluginAsync = async function healthRoutes(
  fastify: FastifyInstance
): Promise<void> {
  fastify.get<{ Reply: HealthStatus }>('/', async function handleGetHealth() {
    return {
      status: "ok",
      uptimeSeconds: process.uptime()
    } satisfies HealthStatus;
  });
};

export default healthRoutes;
