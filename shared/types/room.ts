import type { Static } from "elysia";
import { t } from "elysia";

import { CollectionSchema } from "./collection";
import { GAME_CONFIG } from "../constants";
import { CardCollection } from "./card";
import { PlayerCollection, PlayerCardCollection, PlayerEntity } from "./player";
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
  players: CollectionSchema,
  deck: CollectionSchema,
  roundNumber: t.Number(),
  leaderId: t.String(),
  currentDescription: t.String(),
  // for the active player, this is the active card; for other players, this is the card they chose
  choosedCards: CollectionSchema,
  stage: RoomStageSchema,
  votedCards: CollectionSchema,
});

export type RoomStateType = Static<typeof RoomStateSchema>;

export class RoomStateEntity extends BaseEntity implements RoomStateType {
  players: PlayerCollection;
  deck: CardCollection;
  roundNumber: number;
  leaderId: string;
  currentDescription: string;
  choosedCards: PlayerCardCollection;
  stage: RoomStageType;
  votedCards: PlayerCardCollection;

  constructor(
    id: string,
    players: PlayerCollection,
    deck: CardCollection,
    roundNumber: number,
    leaderId: string,
    currentDescription: string,
    choosedCards: PlayerCardCollection,
    stage: RoomStageType,
    votedCards: PlayerCardCollection,
  ) {
    super(id);
    this.players = players;
    this.deck = deck;
    this.roundNumber = roundNumber;
    this.leaderId = leaderId;
    this.currentDescription = currentDescription;
    this.choosedCards = choosedCards;
    this.stage = stage;
    this.votedCards = votedCards;
  }

  dealCards() {
    this.deck = this.deck.shuffle();
    this.players.forEach((player) => {
      player.hand = this.deck.draw(6);
    });
  }

  getNextLeader(): string {
    const currentLeaderId = this.leaderId;
    const leaderIndex = this.players.findIndex(
      (player) => player.id === currentLeaderId,
    );
    const nextIndex = (leaderIndex + 1) % this.players.size;
    return this.players.get(nextIndex)!.id;
  }

  getCurrentLeader(): PlayerEntity | undefined {
    return this.players.find((player) => player.id === this.leaderId);
  }

  getNonLeaderPlayers(): PlayerCollection {
    return this.players.filter((player) => player.id !== this.leaderId);
  }

  changeLeader() {
    this.leaderId = this.getNextLeader();
  }

  calculatePoints() {
    const leaderCard = this.choosedCards.find(
      (card) => card.id === this.leaderId,
    );
    if (!leaderCard) throw Error("Leader card not found");

    const leaderVotes = this.votedCards.filter(
      (card) => card.playerId === this.leaderId,
    );
    const totalVoters = this.votedCards.size;
    const guessedLeader = leaderVotes.size;

    // Points for leader
    const leaderPlayer = this.players.find(
      (player) => player.id === this.leaderId,
    );
    if (!leaderPlayer) throw Error("No leader player found");
    if (guessedLeader > 0 && guessedLeader < totalVoters) {
      leaderPlayer.addPoints(3); // Points for leader if not all and not none guessed
    } else {
      leaderPlayer.addPoints(0); // Points for leader if not all and not none guessed
    }

    // Points for other players
    this.players.forEach((player) => {
      if (player.id === this.leaderId) return; // Leader already processed

      // 3 points for guessing the leader's card
      if (
        this.votedCards.some(
          (v) => v.playerId === player.id && v.cardId === this.leaderId,
        )
      ) {
        player.addPoints(3); // Points for leader if not all and not none guessed
      }

      // 1 point for each vote for their card (if it's not the leader's card)
      const playerCard = this.choosedCards.find(
        (pc) => pc.playerId === player.id,
      );
      if (playerCard) {
        const votesForPlayerCard = this.votedCards.filter(
          (v) => v.cardId === playerCard.cardId && v.cardId !== this.leaderId,
        ).size;
        player.addPoints(votesForPlayerCard); // Points for leader if not all and not none guessed
      } else {
        throw Error("No player card found");
      }
    });
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
      this.players.get(0),
    );
    return winner;
  }

  canStartGame(): boolean {
    return (
      this.players.size >= GAME_CONFIG.minPlayers &&
      this.players.size <= GAME_CONFIG.maxPlayers
    );
  }

  getNonLeaderSubmissions(): PlayerCardCollection {
    return this.choosedCards.filter((card) => card.playerId !== this.leaderId);
  }

  getActivePlayers(): PlayerCollection {
    return this.players.filter((player) => player.isConnected);
  }

  allPlayersSubmitted(): boolean {
    return this.choosedCards.size === this.getActivePlayers().size - 1;
  }

  allPlayersVoted(): boolean {
    return this.votedCards.size === this.getActivePlayers().size - 1;
  }
  clone(): this {
    return new RoomStateEntity(
      this.id,
      this.players.clone(),
      this.deck.clone(),
      this.roundNumber,
      this.leaderId,
      this.currentDescription,
      this.choosedCards.clone(),
      this.stage,
      this.votedCards.clone(),
    ) as this;
  }

  isValid(): boolean {
    return (
      this.players.isValid() &&
      this.deck.isValid() &&
      this.roundNumber >= 0 &&
      this.leaderId !== "" &&
      this.currentDescription !== "" &&
      this.choosedCards.isValid() &&
      this.stage &&
      this.votedCards.isValid()
    );
  }
}
