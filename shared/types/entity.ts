import { t } from "elysia";
import type { Static } from "elysia";

export const BaseEntitySchema = t.Object({
  id: t.String(),
});

export type BaseEntityType = Static<typeof BaseEntitySchema>;

export abstract class BaseEntity implements BaseEntityType {
  id: string;

  constructor(id: string) {
    this.id = id;
  }
  // Compare with another entity
  equals(other: BaseEntity): boolean {
    return this.id === other.id;
  }

  abstract clone(): this;

  // Validate the current data
  abstract isValid(): boolean;
}
