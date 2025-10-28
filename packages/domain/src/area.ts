/**
 * Represents a PARA Area which remains active without an end date.
 */
export interface Area {
  readonly id: string;
  readonly ownerId: string;
  readonly name: string;
  readonly description: string;
  readonly colorHex: string;
  readonly iconName: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
