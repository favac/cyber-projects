import type { FastifyInstance } from "fastify";

interface CreateProjectBody {
  title: string;
  description: string;
  status: string;
  areaId: string;
}

export default async function projectRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: CreateProjectBody }>(
    "/",
    {
      preValidation: [app.authenticate],
      schema: {
        body: {
          type: "object",
          required: ["title", "description", "status", "areaId"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            status: { type: "string" },
            areaId: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id: userId } = request.user;
        const { title, description, status, areaId } = request.body;

        const project = await app.prisma.project.create({
          data: {
            ownerId: userId,
            title,
            description,
            status,
            areaId,
            priority: "medium",
          },
        });

        return reply.code(201).send(project);
      } catch (error) {
        app.log.error(error);
        return reply.internalServerError("Failed to create project");
      }
    }
  );

  app.get(
    "/",
    {
      preValidation: [app.authenticate],
    },
    async (request, reply) => {
      try {
        const { id: userId } = request.user;

        const projects = await app.prisma.project.findMany({
          where: {
            ownerId: userId,
          },
        });

        return reply.send(projects);
      } catch (error) {
        app.log.error(error);
        return reply.internalServerError("Failed to fetch projects");
      }
    }
  );
}
