import type { Static } from "elysia";
import { t } from "elysia";
import { BaseEntity, BaseEntitySchema } from "./entity";
import { Collection } from "./collection";
import { PlayerCollection } from "./player";

export const CardSchema = t.Composite([
  BaseEntitySchema,
  t.Object({
    title: t.String({ minLength: 1, maxLength: 100 }),
    // description: t.String({ minLength: 0, maxLength: 500 }).optional(),
  }),
]);

export type CardType = Static<typeof CardSchema>;

export class CardEntity extends BaseEntity implements CardType {
  title: string;

  constructor(id: string, title: string) {
    super(id);
    this.title = title;
  }

  static fromType(card: CardType) {
    const cardEntity = new CardEntity(card.id, card.title);
    return cardEntity;
  }

  // Static validation
  static validate(obj: unknown): obj is CardType {
    try {
      return CardSchema.Check(obj);
    } catch {
      return false;
    }
  }

  getDisplayName(): string {
    return this.title;
  }

  getImageUrl(): string {
    const STORAGE_URL = "http://localhost:3000/";
    return `${STORAGE_URL}${encodeURIComponent(this.title)}`;
  }

  updateTitle(newTitle: string): CardEntity {
    this.title = newTitle;
    return this;
  }

  // updateDescription(newDescription: string | undefined): CardEntity {
  //   return new CardEntity({
  //     ...this._data,
  //     description: newDescription,
  //   });
  // }

  // toSearchString(): string {
  //   return `${this.title} ${this.description || ""}`.toLowerCase();
  // }

  isValid(): boolean {
    return CardEntity.validate(this);
  }

  // Create placeholder card
  // static createPlaceholder(id: string, index: number): CardEntity {
  //   return new CardEntity({
  //     id,
  //     title: `Card ${index}`,
  //     // imageUrl: `https://via.placeholder.com/300x400?text=Card+${index}`,
  //     // description: `Placeholder card ${index}`,
  //   });
  // }
  //
  clone(): this {
    return new CardEntity(this.id, this.title) as this;
  }
}

export class CardCollection extends Collection<CardEntity> {
  constructor(cards: CardEntity[] = []) {
    super(cards);
  }

  draw(count: number): CardCollection {
    const drawnCards = new CardCollection();
    for (let i = 0; i < count; i++) {
      drawnCards.add(this.pop()!);
    }
    return drawnCards;
  }
}
