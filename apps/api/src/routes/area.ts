import type { FastifyInstance } from "fastify";

interface CreateAreaBody {
  name: string;
  description: string;
  colorHex: string;
  iconName: string;
}

export default async function areaRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/",
    {
      preValidation: [app.authenticate],
    },
    async (request, reply) => {
      try {
        const { id: userId } = request.user;

        const areas = await app.prisma.area.findMany({
          where: {
            ownerId: userId,
          },
        });

        return reply.send(areas);
      } catch (error) {
        app.log.error(error);
        return reply.internalServerError("Failed to fetch areas");
      }
    }
  );

  app.post<{ Body: CreateAreaBody }>(
    "/",
    {
      preValidation: [app.authenticate],
      schema: {
        body: {
          type: "object",
          required: ["name", "description", "colorHex", "iconName"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            colorHex: { type: "string" },
            iconName: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id: userId } = request.user;
        const { name, description, colorHex, iconName } = request.body;

        const area = await app.prisma.area.create({
          data: {
            ownerId: userId,
            name,
            description,
            colorHex,
            iconName,
          },
        });

        return reply.code(201).send(area);
      } catch (error) {
        app.log.error(error);
        return reply.internalServerError("Failed to create area");
      }
    }
  );
}

