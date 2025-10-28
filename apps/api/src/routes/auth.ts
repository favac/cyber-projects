import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcrypt";

interface RegisterBody {
  email: string;
  password: string;
  displayName: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export default async function authRoutes(
  app: FastifyInstance
): Promise<void> {
  app.post(
    "/register",
    async (
      request: FastifyRequest<{ Body: RegisterBody }>,
      reply: FastifyReply
    ) => {
      const { email, password, displayName } = request.body;

      if (!email || !password || !displayName) {
        return reply.badRequest("Email, password, and display name are required");
      }

      const existingUser = await app.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.conflict("User with this email already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await app.prisma.user.create({
        data: {
          email,
          displayName,
          role: "user",
          password: {
            create: {
              passwordHash: hashedPassword,
            },
          },
        },
      });

      const token = app.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return reply.code(201).send({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
        token,
      });
    }
  );

  app.post(
    "/login",
    async (
      request: FastifyRequest<{ Body: LoginBody }>,
      reply: FastifyReply
    ) => {
      const { email, password } = request.body;

      if (!email || !password) {
        return reply.badRequest("Email and password are required");
      }

      const user = await app.prisma.user.findUnique({
        where: { email },
        include: { password: true },
      });

      if (!user || !user.password) {
        return reply.unauthorized("Invalid email or password");
      }

      const isValidPassword = await bcrypt.compare(
        password,
        user.password.passwordHash
      );

      if (!isValidPassword) {
        return reply.unauthorized("Invalid email or password");
      }

      const token = app.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
        token,
      });
    }
  );

  app.get(
    "/me",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
        const payload = request.user as { id: string };

        const user = await app.prisma.user.findUnique({
          where: { id: payload.id },
        });

        if (!user) {
          return reply.notFound("User not found");
        }

        return reply.send({
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        });
      } catch (error) {
        return reply.unauthorized("Invalid token");
      }
    }
  );
}
