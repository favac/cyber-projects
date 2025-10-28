# PARA Workspace Monorepo

Monorepo para la aplicación de gestión basada en PARA (Projects, Areas, Resources, Archive). Está organizado con `pnpm` workspaces e incluye un backend Fastify + Prisma/SQLite y un frontend web sin framework potenciado por Vite.

## Estructura

```
apps/
  api/        # Servidor Fastify, Prisma y lógica backend
  web/        # Frontend TypeScript + Vite
packages/
  config/     # Configuraciones compartidas (tsconfig, ESLint próximamente)
  domain/     # Tipos y constantes de dominio compartidas
  ui/         # (Pendiente) Componentes UI reutilizables
```

## Requisitos

- Node.js >= 20
- pnpm >= 9 (`corepack enable` recomendado)

## Comandos generales

```bash
pnpm install           # Instala todas las dependencias
pnpm dev               # Ejecuta "dev" en todos los paquetes relevantes
pnpm build             # Construye todos los paquetes
pnpm lint              # Ejecuta linting
pnpm typecheck         # Verifica tipos
pnpm test              # Corre pruebas (pendiente de implementación)
```

## Backend (`apps/api`)

- Variables de entorno: definir en `.env` si deseas valores distintos a los defaults.
  ```env
  NODE_ENV=development
  PORT=3001
  DATABASE_URL=file:../data/para.db
  JWT_SECRET=dev-secret-change-me-dev-secret-change-me
  ```
- Comandos útiles:
  ```bash
  pnpm --filter @cyber/api prisma:migrate  # Ejecuta migraciones
  pnpm --filter @cyber/api prisma:generate # Genera Prisma Client
  pnpm --filter @cyber/api dev             # Inicia Fastify en modo watch
  ```

## Frontend (`apps/web`)

- Arranque: `pnpm --filter @cyber/web dev`
- Archivo de entrada: `apps/web/src/main.ts` (pronto se integrará la UI legacy).

## Próximos pasos sugeridos

1. Agregar configuración ESLint/Prettier compartida en `packages/config` y extenderla.
2. Implementar migraciones iniciales (`pnpm --filter @cyber/api prisma:migrate`).
3. Conectar frontend legacy al nuevo bundle (`apps/web`).
4. Crear seeds + rutas CRUD para Áreas/Proyectos y consumirlas desde el frontend.
