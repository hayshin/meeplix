import { BaseEntity } from "./entity";
import { t } from "elysia";
import type { Static } from "elysia";
import { BaseEntitySchema } from "./entity";

export const CollectionSchema = t.Object({
  items: t.Array(BaseEntitySchema),
});
export type CollectionType = Static<typeof CollectionSchema>;

export class Collection<Type extends BaseEntity> implements CollectionType {
  items: Type[];

  constructor(items: Type[] = []) {
    this.items = items;
  }

  // Static factory methods
  static empty<Type extends BaseEntity>(): Collection<Type> {
    return new Collection<Type>();
  }

  add(item: Type): this {
    this.items.push(item);
    return this;
  }

  pop(): Type | undefined {
    return this.items.pop();
  }

  // Correction for remove: it should filter out the item with the given ID
  // Your original implementation was keeping only the item with the given ID
  remove(itemId: string): boolean {
    const originalLength = this.items.length;
    this.items = this.items.filter((item) => item.id !== itemId); // Corrected: filter OUT the item with itemId
    return originalLength !== this.items.length;
  }

  get(cardId: string | number): Type | undefined {
    if (typeof cardId === "string") {
      return this.items.find((card) => card.id === cardId);
    } else {
      return this.items[cardId];
    }
  }

  has(cardId: string): boolean {
    return this.items.some((card) => card.id === cardId);
  }

  clear(): this {
    this.items.length = 0;
    return this;
  }

  get size(): number {
    return this.items.length;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  toArray(): Type[] {
    return this.items;
  }

  forEach(callback: (item: Type) => void): void {
    this.items.forEach((item) => callback(item));
  }

  map<T>(callback: (item: Type) => T): T[] {
    return this.toArray().map(callback);
  }

  // Use 'this' as the return type for methods that should return the concrete collection type
  filter(predicate: (item: Type) => boolean): this {
    const filtered = this.toArray().filter(predicate);
    // Use 'new (this.constructor as any)(filtered)' to create an instance of the current class
    return new (this.constructor as any)(filtered);
  }

  find(predicate: (item: Type) => boolean): Type | undefined {
    return this.toArray().find(predicate);
  }

  some(predicate: (item: Type) => boolean): boolean {
    return this.toArray().some(predicate);
  }

  reduce<T>(callback: (accumulator: T, item: Type) => T, initialValue: T): T {
    return this.toArray().reduce(callback, initialValue);
  }

  findIndex(predicate: (item: Type) => boolean): number {
    return this.toArray().findIndex(predicate);
  }

  shuffle(): this {
    const shuffled = this.toArray().sort(() => Math.random() - 0.5);
    // Assign to this.items to modify the current instance
    this.items = shuffled;
    // Return the current instance for chaining
    return this;
  }

  // Use 'this' as the return type
  slice(start: number, end?: number): this {
    const sliced = this.toArray().slice(start, end);
    // Use 'new (this.constructor as any)(sliced)' to create an instance of the current class
    return new (this.constructor as any)(sliced);
  }

  every(predicate: (item: Type) => boolean): boolean {
    return this.toArray().every(predicate);
  }

  getRandomItem(): Type | undefined {
    const cards = this.toArray();
    if (cards.length === 0) return undefined;
    return cards[Math.floor(Math.random() * cards.length)];
  }

  // Use 'this' as the return type
  clone(): this {
    const clonedItems = this.toArray().map((item) => item.clone());
    // Use 'new (this.constructor as any)(clonedItems)' to create an instance of the current class
    return new (this.constructor as any)(clonedItems);
  }

  isValid(): boolean {
    return this.items.every((item) => item.isValid());
  }
}
