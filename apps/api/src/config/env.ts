import { config as loadEnv } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

loadEnv();

export const repoRoot = dirname(
  fileURLToPath(new URL("../../..", import.meta.url))
);
const defaultDatabaseUrl = `file:${join(repoRoot, "data", "para.db")}`;
const defaultJwtSecret = "dev-secret-change-me-dev-secret-change-me";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters")
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL ?? defaultDatabaseUrl,
  JWT_SECRET: process.env.JWT_SECRET ?? defaultJwtSecret
});
