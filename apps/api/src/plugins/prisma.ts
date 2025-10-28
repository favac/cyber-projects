import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prismaClient = new PrismaClient();

const prismaPlugin: FastifyPluginAsync = async function prismaPlugin(
  fastify: FastifyInstance
): Promise<void> {
  fastify.decorate("prisma", prismaClient);
  fastify.addHook(
    "onClose",
    async function handleOnClose(app: FastifyInstance): Promise<void> {
      await app.prisma.$disconnect();
    }
  );
};

export default fp(prismaPlugin);
