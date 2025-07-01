import type { Static } from "elysia";
import { t } from "elysia";

import { BaseEntitySchema } from "./entity";
import { CardSchema, type CardType, CardEntity, CardCollection } from "./card";
import { CollectionSchema, Collection } from "./collection";
import { BaseEntity } from "./entity";

// Schema definitions

export const PlayerSchema = t.Composite([
  BaseEntitySchema,
  t.Object({
    nickname: t.String(),
    score: t.Number(),
    hand: CollectionSchema,
    isConnected: t.Boolean(),
    joinedAt: t.Date(),
    isReady: t.Boolean(),
  }),
]);

export type PlayerType = Static<typeof PlayerSchema>;

export const PlayerCardSchema = t.Object({
  playerId: t.String(),
  card: CardSchema,
});

// Type exports
export type PlayerCardType = Static<typeof PlayerCardSchema>;

export class PlayerEntity extends BaseEntity implements PlayerType {
  nickname: string;
  score: number;
  hand: CardCollection;
  isConnected: boolean;
  joinedAt: Date;
  isReady: boolean;

  constructor(
    id: string,
    nickname: string,
    score: number,
    cards: CardCollection,
    isConnected: boolean,
    joinedAt: Date,
    isReady: boolean
  ) {
    super(id);
    this.nickname = nickname;
    this.score = score;
    this.hand = cards;
    this.isConnected = isConnected;
    this.joinedAt = joinedAt;
    this.isReady = isReady;
  }

  // Static validation
  static validate(obj: unknown): obj is PlayerType {
    try {
      return PlayerSchema.Check(obj);
    } catch {
      return false;
    }
  }

  clone(): this {
    return new PlayerEntity(
      this.id,
      this.nickname,
      this.score,
      this.hand.clone(),
      this.isConnected,
      this.joinedAt,
      this.isReady
    ) as this;
  }

  // Getters
  getCardCount(): number {
    return this.hand.size;
  }

  getStatus(): "ready" | "connected" | "disconnected" {
    if (!this.isConnected) return "disconnected";
    if (this.isConnected && this.isReady) return "ready";
    return "connected";
  }

  // Card management methods
  hasCard(cardId: string): boolean {
    return this.hand.has(cardId);
  }

  getCard(cardId: string): CardType | undefined {
    return this.hand.find((card) => card.id === cardId);
  }

  addCard(card: CardType): PlayerEntity {
    this.hand.add(CardEntity.fromType(card));
    return this;
  }

  removeCard(cardId: string): PlayerEntity {
    this.hand.remove(cardId);
    return this;
  }

  replaceCards(newCards: CardCollection): PlayerEntity {
    this.hand = newCards;
    return this;
  }

  // Score management
  updateScore(newScore: number): PlayerEntity {
    this.score = Math.max(0, newScore);
    return this;
  }

  addPoints(points: number): PlayerEntity {
    return this.updateScore(this.score + points);
  }

  subtractPoints(points: number): PlayerEntity {
    return this.updateScore(this.score - points);
  }

  resetScore(): PlayerEntity {
    return this.updateScore(0);
  }

  // Status management
  setReady(isReady: boolean): PlayerEntity {
    this.isReady = isReady;
    return this;
  }

  setConnected(isConnected: boolean): PlayerEntity {
    this.isConnected = isConnected;
    return this;
  }

  updateNickname(newNickname: string): PlayerEntity {
    this.nickname = newNickname;
    return this;
  }

  // Display methods
  getDisplayInfo(): {
    name: string;
    score: number;
    cardCount: number;
    status: string;
  } {
    return {
      name: this.nickname,
      score: this.score,
      cardCount: this.getCardCount(),
      status: this.getStatus(),
    };
  }

  isValid(): boolean {
    return PlayerEntity.validate(this);
  }
}

export class PlayerCardEntity extends BaseEntity implements PlayerCardType {
  card: CardEntity;
  playerId: string;

  constructor(playerId: string, card: CardEntity) {
    super(playerId + card.id);
    this.playerId = playerId;
    this.card = card;
  }

  clone(): this {
    return new PlayerCardEntity(this.playerId, this.card) as this;
  }

  // Static validation
  static validate(obj: unknown): obj is PlayerCardType {
    try {
      return PlayerCardSchema.Check(obj);
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
    return PlayerCardEntity.validate(this);
  }

  // Create from entities

  // static fromIds(playerId: string, cardId: string): PlayerCardEntity {
  //   return new PlayerCardEntity(playerId, cardId);
  // }
  static fromEntities(
    player: PlayerEntity,
    card: CardEntity
  ): PlayerCardEntity {
    return new PlayerCardEntity(player.id, card);
  }
}

export class PlayerCollection extends Collection<PlayerEntity> {
  constructor(players: PlayerEntity[]) {
    super(players);
  }

  cloneForClient(): PlayerCollection {
    let clone = this.clone();
    clone.forEach((player) => player.replaceCards(new CardCollection([])));
    return clone;
  }
}

export class PlayerCardCollection extends Collection<PlayerCardEntity> {
  constructor(cards: PlayerCardEntity[]) {
    super(cards);
  }

  hasCard(cardId: string): boolean {
    return this.some((card) => card.card.id === cardId);
  }

  hasPlayer(playerId: string): boolean {
    return this.some((card) => card.playerId === playerId);
  }
}
