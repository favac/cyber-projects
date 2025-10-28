/**
 * Reusable resource that can be associated with Areas or Projects.
 */
export interface Resource {
  readonly id: string;
  readonly ownerId: string;
  readonly title: string;
  readonly description: string;
  readonly type: ResourceType;
  readonly url?: string;
  readonly notes: string;
  readonly tags: readonly string[];
  readonly areaId?: string;
  readonly projectId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string;
}

export const RESOURCE_TYPES = [
  "article",
  "video",
  "book",
  "course",
  "template",
  "other"
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];
