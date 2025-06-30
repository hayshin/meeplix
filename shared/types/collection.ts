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
  // static fromData(itemsData: T[]): Collection<T> {
  //   const cards = itemsData.map((data) => new T(data));
  //   return new CardHand(cards);
  // }

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

  remove(itemId: string): boolean {
    const originaLength = this.items.length;
    this.items = this.items.filter((item) => item.id === itemId);
    return originaLength !== this.items.length;
  }

  get(cardId: string): Type | undefined {
    return this.items.find((card) => card.id === cardId);
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

  filter(predicate: (item: Type) => boolean): Collection<Type> {
    const filtered = this.toArray().filter(predicate);
    return new Collection<Type>(filtered);
  }

  find(predicate: (item: Type) => boolean): Type | undefined {
    return this.toArray().find(predicate);
  }

  // Utility methods
  // search(searchTerm: string): Collection<Type> {
  //   const term = searchTerm.toLowerCase();
  //   return this.filter((card) => card.toSearchString().includes(term));
  // }

  shuffle(): Collection<Type> {
    const shuffled = this.toArray().sort(() => Math.random() - 0.5);
    return new Collection<Type>(shuffled);
  }

  slice(start: number, end?: number): Collection<Type> {
    const sliced = this.toArray().slice(start, end);
    return new Collection<Type>(sliced);
  }

  getRandomItem(): Type | undefined {
    const cards = this.toArray();
    if (cards.length === 0) return undefined;
    return cards[Math.floor(Math.random() * cards.length)];
  }

  clone(): Collection<Type> {
    const clonedItems = this.toArray().map((item) => item.clone());
    return new Collection<Type>(clonedItems);
  }
}
