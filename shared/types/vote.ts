import type { Static } from "elysia";
import { t } from "elysia";

import { Collection } from "./collection";
import { CardSchema, CardEntity } from "./card";
import { BaseEntity } from "./entity";
import { PlayerEntity } from "./player";

export const VoteSchema = t.Object({
  voterPlayerId: t.String(),
  choicePlayerId: t.String(),
  choiceCard: CardSchema,
});

// Type exports
export type VoteType = Static<typeof VoteSchema>;

export class VoteEntity extends BaseEntity implements VoteType {
  voterPlayerId: string;
  choicePlayerId: string;
  choiceCard: CardEntity;

  constructor(
    voterPlayerId: string,
    choicePlayerId: string,
    choiceCard: CardEntity,
  ) {
    super(voterPlayerId + choicePlayerId);
    this.voterPlayerId = voterPlayerId;
    this.choicePlayerId = choicePlayerId;
    this.choiceCard = choiceCard;
  }

  static fromType(type: VoteType): VoteEntity {
    return new VoteEntity(
      type.voterPlayerId,
      type.choicePlayerId,
      CardEntity.fromType(type.choiceCard),
    );
  }

  clone(): this {
    return new VoteEntity(
      this.voterPlayerId,
      this.choicePlayerId,
      this.choiceCard,
    ) as this;
  }

  // Static validation
  static validate(obj: unknown): obj is VoteType {
    try {
      return VoteSchema.Check(obj);
    } catch {
      return false;
    }
  }

  isValid(): boolean {
    return VoteEntity.validate(this);
  }

  // Create from entities
  // static fromIds(playerId: string, cardId: string): PlayerCardEntity {
  //   return new PlayerCardEntity(playerId, cardId);
  // }
  static fromEntities(
    voter: PlayerEntity,
    choice: PlayerEntity,
    card: CardEntity,
  ): VoteEntity {
    return new VoteEntity(voter.id, choice.id, card);
  }
}

export const VoteCollectionSchema = t.Object({
  items: t.Array(VoteSchema),
});
export type VoteCollectionType = Static<typeof VoteCollectionSchema>;

export class VoteCollection
  extends Collection<VoteEntity>
  implements VoteCollectionType
{
  constructor(votes: VoteEntity[]) {
    super(votes);
  }

  hasVoted(voterPlayerId: string): boolean {
    return this.items.some((vote) => vote.voterPlayerId === voterPlayerId);
  }

  countVotes(choicePlayerId: string): number {
    return this.items.filter((vote) => vote.choicePlayerId === choicePlayerId)
      .length;
  }

  totalVotes(): number {
    return this.size;
  }

  guessedLeader(voterPlayerId: string, leaderId: string): boolean {
    return this.items.some(
      (vote) =>
        vote.voterPlayerId === voterPlayerId &&
        vote.choicePlayerId === leaderId,
    );
  }

  static fromType(type: VoteCollectionType): VoteCollection {
    return new VoteCollection(
      type.items.map((item) => VoteEntity.fromType(item)),
    );
  }
}
