import type { Static } from "elysia";
import { t } from "elysia";

import { Collection } from "./collection";
import { CardSchema, CardEntity } from "./card";
import { BaseEntity } from "./entity";
import { PlayerEntity } from "./player";

export const SubmittedCardSchema = t.Object({
  playerId: t.String(),
  card: CardSchema,
});

// Type exports
export type SubmittedCardType = Static<typeof SubmittedCardSchema>;

export class SubmittedCardEntity
  extends BaseEntity
  implements SubmittedCardType
{
  card: CardEntity;
  playerId: string;

  constructor(playerId: string, card: CardEntity) {
    super(playerId + card.id);
    this.playerId = playerId;
    this.card = card;
  }

  clone(): this {
    return new SubmittedCardEntity(this.playerId, this.card) as this;
  }
  static fromType(type: SubmittedCardType): SubmittedCardEntity {
    return new SubmittedCardEntity(
      type.playerId,
      CardEntity.fromType(type.card),
    );
  }

  // Static validation
  static validate(obj: unknown): obj is SubmittedCardType {
    try {
      return SubmittedCardSchema.Check(obj);
    } catch {
      return false;
    }
  }

  // Methods
  belongsToPlayer(playerId: string): boolean {
    return this.playerId === playerId;
  }

  usesCard(cardId: string): boolean {
    return this.card.id === cardId;
  }

  isValid(): boolean {
    return SubmittedCardEntity.validate(this);
  }

  // Create from entities
  // static fromIds(playerId: string, cardId: string): PlayerCardEntity {
  //   return new PlayerCardEntity(playerId, cardId);
  // }
  static fromEntities(
    player: PlayerEntity,
    card: CardEntity,
  ): SubmittedCardEntity {
    return new SubmittedCardEntity(player.id, card);
  }
}

export const SubmittedCardCollectionSchema = t.Object({
  items: t.Array(SubmittedCardSchema),
});

export type SubmittedCardCollectionType = Static<
  typeof SubmittedCardCollectionSchema
>;

export class SubmittedCardCollection
  extends Collection<SubmittedCardEntity>
  implements SubmittedCardCollectionType
{
  constructor(pairs: SubmittedCardEntity[]) {
    super(pairs);
  }

  hasCard(cardId: string): boolean {
    return this.some((pair) => pair.card.id === cardId);
  }

  getPair(cardId?: string, playerId?: string): SubmittedCardEntity {
    let submitCard: SubmittedCardEntity | undefined;
    if (cardId && playerId)
      submitCard = this.find(
        (pair) => pair.card.id === cardId && pair.playerId === playerId,
      );
    else if (cardId) submitCard = this.find((pair) => pair.card.id === cardId);
    else if (playerId)
      submitCard = this.find((pair) => pair.playerId === playerId);
    if (!submitCard) throw new Error("Not found pair ");
    return submitCard;
  }

  hasPlayer(playerId: string): boolean {
    return this.some((pair) => pair.playerId === playerId);
  }

  static fromType(type: SubmittedCardCollectionType): SubmittedCardCollection {
    return new SubmittedCardCollection(
      type.items.map((item) => SubmittedCardEntity.fromType(item)),
    );
  }
}
