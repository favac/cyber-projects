/**
 * Task belonging to either an Area or Project with optional assignment.
 */
export interface Task {
  readonly id: string;
  readonly ownerId: string;
  readonly areaId?: string;
  readonly projectId?: string;
  readonly title: string;
  readonly description: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly assigneeId?: string;
  readonly startDate?: string;
  readonly dueDate?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string;
}

export const TASK_STATUSES = [
  "pending",
  "in_progress",
  "blocked",
  "done",
  "archived"
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = [
  "low",
  "medium",
  "high",
  "critical"
] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];
