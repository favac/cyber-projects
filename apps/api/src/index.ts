import { createServer } from "./server.js";
import { env, repoRoot } from "./config/env.js";

async function main(): Promise<void> {
  const server = await createServer();
  try {
    await server.listen({ port: env.PORT, host: "0.0.0.0" });
    server.log.info(
      { repoRoot, env: env.NODE_ENV, port: env.PORT },
      "API server started"
    );
  } catch (error) {
    server.log.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
}

void main();
