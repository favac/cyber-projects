/**
 * Snapshot stored when an entity is archived within PARA.
 */
export interface ArchiveEntry {
  readonly id: string;
  readonly ownerId: string;
  readonly entityType: ArchivedEntityType;
  readonly entityId: string;
  readonly snapshot: Record<string, unknown>;
  readonly reason: string;
  readonly archivedAt: string;
  readonly restoredAt?: string;
}

export const ARCHIVED_ENTITY_TYPES = [
  "area",
  "project",
  "task",
  "resource"
] as const;

export type ArchivedEntityType = (typeof ARCHIVED_ENTITY_TYPES)[number];
