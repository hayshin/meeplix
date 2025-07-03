import type { Static } from "elysia";
import { t } from "elysia";

import { Collection } from "./collection";
import { CardSchema, CardEntity } from "./card";
import { BaseEntity } from "./entity";
import { PlayerEntity } from "./player";

export const PairHandSchema = t.Object({
  playerId: t.String(),
  card: CardSchema,
});

// Type exports
export type PairHandType = Static<typeof PairHandSchema>;

export class PairHandEntity extends BaseEntity implements PairHandType {
  card: CardEntity;
  playerId: string;

  constructor(playerId: string, card: CardEntity) {
    super(playerId + card.id);
    this.playerId = playerId;
    this.card = card;
  }

  clone(): this {
    return new PairHandEntity(this.playerId, this.card) as this;
  }

  // Static validation
  static validate(obj: unknown): obj is PairHandType {
    try {
      return PairHandSchema.Check(obj);
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
    return PairHandEntity.validate(this);
  }

  // Create from entities
  // static fromIds(playerId: string, cardId: string): PlayerCardEntity {
  //   return new PlayerCardEntity(playerId, cardId);
  // }
  static fromEntities(player: PlayerEntity, card: CardEntity): PairHandEntity {
    return new PairHandEntity(player.id, card);
  }
}

export class PairHandCollection extends Collection<PairHandEntity> {
  constructor(pairs: PairHandEntity[]) {
    super(pairs);
  }

  hasCard(cardId: string): boolean {
    return this.some((pair) => pair.card.id === cardId);
  }

  hasPlayer(playerId: string): boolean {
    return this.some((pair) => pair.playerId === playerId);
  }
}
