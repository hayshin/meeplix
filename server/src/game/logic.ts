import { v4 as uuidv4 } from "uuid";
import { PlayerCardEntity, PlayerEntity } from "$types/player";
import { CardEntity } from "$shared/types/card";}
import { GAME_CONFIG } from "$shared/constants";
import { loadCardsFromAssets } from "./cards";
import { shuffleArray } from "$shared/utils";

const PREDEFINED_CARDS: Card[] = loadCardsFromAssets();

export class GameLogic {
  // Раздать карты игрокам
  dealCards(players: Player[]): Player[] {
    const shuffledCards = shuffleArray(PREDEFINED_CARDS);

    players.forEach((player, index) => {
      player.cards = shuffledCards.slice(
        index * GAME_CONFIG.cardsPerPlayer,
        (index + 1) * GAME_CONFIG.cardsPerPlayer,
      );
    });

    return players;
  }

  getCards(deckCards?: Card[]) {
    const shuffledCards = shuffleArray(deckCards ?? PREDEFINED_CARDS);
    return shuffledCards;
  }

  // Определить следующего ведущего
  getNextLeader(players: Player[], currentLeaderId?: string): string {
    if (!currentLeaderId) {
      return players[0].id;
    }

    const currentIndex = players.findIndex((p) => p.id === currentLeaderId);
    const nextIndex = (currentIndex + 1) % players.length;
    return players[nextIndex].id;
  }

  // Подсчёт очков по правилам игры
  calculatePoints(
    players: Player[],
    leaderId: string,
    choosedCards: PlayerCard[],
    votedCards: PlayerCard[],
  ): { [playerId: string]: number } {
    const scores: { [playerId: string]: number } = {};
    const leaderCard = choosedCards.find((pc) => pc.cardId === leaderId);

    if (!leaderCard) return scores;

    const leaderVotes = votedCards.filter((v) => v.cardId === leaderId);
    const totalVoters = votedCards.length;
    const guessedLeader = leaderVotes.length;

    // Points for leader
    if (guessedLeader > 0 && guessedLeader < totalVoters) {
      scores[leaderId] = 3; // Points for leader if not all and not none guessed
    } else {
      scores[leaderId] = 0;
    }

    // Points for other players
    players.forEach((player) => {
      if (player.id === leaderId) return; // Leader already processed
      scores[player.id] = 0;

      // 3 points for guessing the leader's card
      if (
        votedCards.some(
          (v) => v.playerId === player.id && v.cardId === leaderId,
        )
      ) {
        scores[player.id] += 3;
      }

      // 1 point for each vote for their card (if it's not the leader's card)
      const playerCard = choosedCards.find((pc) => pc.playerId === player.id);
      if (playerCard) {
        const votesForPlayerCard = votedCards.filter(
          (v) => v.cardId === playerCard.cardId && v.cardId !== leaderId,
        ).length;
        scores[player.id] += votesForPlayerCard;
      }
    });

    return scores;
  }

  isGameFinished(players: Player[]): boolean {
    return players.some((player) => player.score >= GAME_CONFIG.winningScore);
  }
  getWinner(players: Player[]): Player | null {
    if (!this.isGameFinished(players)) return null;
    const winner = players.reduce((max, player) =>
      player.score > max.score ? player : max,
    );
    return winner;
  }

  canStartGame(players: Player[]): boolean {
    return (
      players.length >= GAME_CONFIG.minPlayers &&
      players.length <= GAME_CONFIG.maxPlayers
    );
  }

  allPlayersSubmitted(players: Player[], choosedCards: PlayerCard[]): boolean {
    const activePlayers = players.filter((p) => p.isConnected);
    return choosedCards.length === activePlayers.length;
  }

  allPlayersVoted(
    players: Player[],
    votedCards: PlayerCard[],
    leaderId: string,
  ): boolean {
    const activePlayers = players.filter(
      (p) => p.isConnected && p.id !== leaderId,
    );
    return votedCards.length === activePlayers.length;
  }
}
