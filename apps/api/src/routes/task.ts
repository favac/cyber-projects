import type { FastifyInstance } from "fastify";

interface CreateTaskBody {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: string;
  areaId?: string;
  projectId?: string;
}

export default async function taskRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: CreateTaskBody }>(
    "/",
    {
      preValidation: [app.authenticate],
      schema: {
        body: {
          type: "object",
          required: ["title", "description", "status", "priority"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            status: { type: "string" },
            priority: { type: "string" },
            dueDate: { type: "string", format: "date-time" },
            areaId: { type: "string" },
            projectId: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id: userId } = request.user;
        const { title, description, status, priority, dueDate, areaId, projectId } = request.body;

        const task = await app.prisma.task.create({
          data: {
            ownerId: userId,
            title,
            description,
            status,
            priority,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            areaId,
            projectId,
          },
        });

        return reply.code(201).send(task);
      } catch (error) {
        app.log.error(error);
        return reply.internalServerError("Failed to create task");
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

        const tasks = await app.prisma.task.findMany({
          where: {
            ownerId: userId,
          },
        });

        return reply.send(tasks);
      } catch (error) {
        app.log.error(error);
        return reply.internalServerError("Failed to fetch tasks");
      }
    }
  );
}
