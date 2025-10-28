/**
 * Project belonging to a PARA Area with lifecycle metadata.
 */
export interface Project {
  readonly id: string;
  readonly areaId: string;
  readonly ownerId: string;
  readonly title: string;
  readonly description: string;
  readonly status: ProjectStatus;
  readonly priority: ProjectPriority;
  readonly dueDate: string;
  readonly progressPercentage: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string;
}

export const PROJECT_STATUSES = [
  "planned",
  "active",
  "on_hold",
  "completed",
  "archived"
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_PRIORITIES = [
  "low",
  "medium",
  "high",
  "critical"
] as const;

export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];
