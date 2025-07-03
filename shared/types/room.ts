import type { Static } from "elysia";
import { t } from "elysia";

import { CollectionSchema } from "./collection";
import { GAME_CONFIG } from "../constants";
import { CardCollection, CardSchema } from "./card";
import {
  PlayerCollection,
  PlayerEntity,
  PlayerSchema,
  PlayerCollectionSchema,
} from "./player";
import { VoteSchema, VoteCollection, VoteCollectionSchema } from "./vote";
import { CardCollectionSchema, CardEntity } from "./card";
import {
  SubmittedCardCollection,
  SubmittedCardEntity,
  SubmittedCardSchema,
  SubmittedCardCollectionSchema,
} from "./submitted_card";
import { BaseEntity } from "./entity";

export const RoomStageSchema = t.Union([
  t.Literal("joining"),
  t.Literal("leader_choosing"),
  t.Literal("players_choosing"),
  t.Literal("voting"),
  t.Literal("results"),
  t.Literal("finished"),
]);

export type RoomStageType = Static<typeof RoomStageSchema>;

export const RoomStateSchema = t.Object({
  id: t.String(),
  players: PlayerCollectionSchema,
  deck: CardCollectionSchema,
  roundNumber: t.Number(),
  leaderId: t.String(),
  currentDescription: t.String(),
  // for the active player, this is the active card; for other players, this is the card they chose
  submittedCards: SubmittedCardCollectionSchema,
  stage: RoomStageSchema,
  votedPairs: VoteCollectionSchema,
});

export type RoomStateType = Static<typeof RoomStateSchema>;

export class RoomStateEntity extends BaseEntity implements RoomStateType {
  players: PlayerCollection;
  deck: CardCollection;
  roundNumber: number;
  leaderId: string;
  currentDescription: string;
  submittedCards: SubmittedCardCollection;
  stage: RoomStageType;
  votedPairs: VoteCollection;

  constructor(
    id: string,
    players: PlayerCollection,
    deck: CardCollection,
    roundNumber: number,
    leaderId: string,
    currentDescription: string,
    submittedCards: SubmittedCardCollection,
    stage: RoomStageType,
    votedCards: VoteCollection,
  ) {
    super(id);
    this.players = players;
    this.deck = deck;
    this.roundNumber = roundNumber;
    this.leaderId = leaderId;
    this.currentDescription = currentDescription;
    this.submittedCards = submittedCards;
    this.stage = stage;
    this.votedPairs = votedCards;
  }

  dealCards() {
    this.deck = this.deck.shuffle();
    this.players.forEach((player) => {
      player.replaceCards(this.deck.draw(6));
    });
  }

  startRound(leaderId: string) {
    this.roundNumber += 1;
    this.leaderId = leaderId;
    this.currentDescription = "";
    this.submittedCards = new SubmittedCardCollection([]);
    this.stage = "leader_choosing";
    this.votedPairs = new VoteCollection([]);
  }

  addPlayer(player: PlayerEntity) {
    if (this.players.has(player.id)) {
      throw new Error(`Player with id ${player.id} already exists in the room`);
    }
    this.players.add(player);
  }

  setReadyPlayer(playerId: string, isReady: boolean) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) throw new Error(`Player with id ${playerId} not found`);
    player.isReady = isReady;
  }

  getNextLeader(): string {
    const currentLeaderId = this.leaderId;
    const leaderIndex = this.players.findIndex(
      (player) => player.id === currentLeaderId,
    );
    const nextIndex = (leaderIndex + 1) % this.players.size;
    return this.players.get(nextIndex)!.id;
  }

  getCurrentLeader(): PlayerEntity {
    const leaderPlayer = this.getPlayer(this.leaderId);
    if (!leaderPlayer) throw Error("No leader player found");
    return leaderPlayer;
  }

  getPlayer(playerId: string): PlayerEntity {
    try {
      const player = this.getPlayer(playerId);
      return player;
    } catch (error) {
      throw new Error(`Player with id ${playerId} not found`);
    }
  }

  hasPlayer(playerId: string): boolean {
    return this.players.has(playerId);
  }

  getNonLeaderPlayers(): PlayerCollection {
    return this.players.filter((player) => player.id !== this.leaderId);
  }

  changeLeader() {
    this.leaderId = this.getNextLeader();
  }

  getSubmittedLeaderCard(): CardEntity {
    const leaderCard = this.submittedCards.getPair(undefined, this.leaderId);
    if (!leaderCard) throw Error("Leader submit not found");
    return leaderCard.card;
  }

  calculatePoints() {
    const leaderCard = this.getSubmittedLeaderCard();

    const votesForLeader = this.votedPairs.countVotes(this.leaderId);
    const totalVotes = this.votedPairs.totalVotes();

    // Points for leader
    const leaderPlayer = this.getCurrentLeader();
    if (votesForLeader > 0 && votesForLeader < totalVotes) {
      leaderPlayer.addPoints(3); // Points for leader if not all and not none guessed
    } else {
      leaderPlayer.addPoints(0); // Points for leader if not all and not none guessed
    }

    // Points for other players
    this.players.forEach((player) => {
      if (player.id === this.leaderId) return; // Leader already processed

      // 3 points for guessing the leader's card
      if (this.votedPairs.guessedLeader(player.id, this.leaderId)) {
        player.addPoints(3); // Points for leader if not all and not none guessed
      }

      // 1 point for each vote for their card (if it's not the leader's card)
      const votesForPlayer = this.votedPairs.countVotes(player.id);
      player.addPoints(votesForPlayer); // Points for leader if not all and not none guessed
    });
  }

  assertStage(stage: string): void {
    if (this.stage !== stage) {
      throw new Error(`Invalid stage of game ${this.stage}`);
    }
  }

  isGameFinished(): boolean {
    return this.players.some(
      (player) => player.score >= GAME_CONFIG.winningScore,
    );
  }

  getWinner(): PlayerEntity | null {
    if (!this.isGameFinished()) return null;
    const winner = this.players.reduce(
      (max, player) => (player.score > max.score ? player : max),
      this.players.get(0)!,
    );
    return winner;
  }

  canStartGame(): boolean {
    return (
      this.players.size >= GAME_CONFIG.minPlayers &&
      this.players.size <= GAME_CONFIG.maxPlayers
    );
  }

  getNonLeaderSubmissions(): SubmittedCardCollection {
    return this.submittedCards.filter(
      (card) => card.playerId !== this.leaderId,
    );
  }

  getActivePlayers(): PlayerCollection {
    return this.players.filter((player) => player.isConnected);
  }

  allPlayersSubmitted(): boolean {
    return this.submittedCards.size === this.getActivePlayers().size;
  }

  allPlayersVoted(): boolean {
    return this.votedPairs.size === this.getActivePlayers().size - 1;
  }

  cloneForClient(): RoomStateEntity {
    return new RoomStateEntity(
      this.id,
      this.players.cloneForClient(),
      new CardCollection([]),
      this.roundNumber,
      this.leaderId,
      this.currentDescription,
      this.submittedCards.clone(),
      this.stage,
      this.votedPairs.clone(),
    ) as RoomStateEntity;
  }
  clone(): this {
    return new RoomStateEntity(
      this.id,
      this.players.clone(),
      this.deck.clone(),
      this.roundNumber,
      this.leaderId,
      this.currentDescription,
      this.submittedCards.clone(),
      this.stage,
      this.votedPairs.clone(),
    ) as this;
  }

  isValid(): boolean {
    return (
      this.players.isValid() &&
      this.deck.isValid() &&
      this.roundNumber >= 0 &&
      this.leaderId !== "" &&
      this.currentDescription !== "" &&
      this.submittedCards.isValid() &&
      this.stage &&
      this.votedPairs.isValid()
    );
  }
}
