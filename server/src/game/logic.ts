import { v4 as uuidv4 } from "uuid";
import { Card, Player, GameSession, GAME_CONSTANTS } from "$types";
import * as fs from "fs";
import * as path from "path";

// Функция для загрузки всех карт из папки assets/cards
function loadCardsFromAssets(): Card[] {
  const cardsDir = path.join(process.cwd(), "assets", "cards");

  try {
    // Проверяем существование папки
    if (!fs.existsSync(cardsDir)) {
      console.warn(
        `Cards directory not found: ${cardsDir}. Using fallback cards.`
      );
      return createFallbackCards();
    }

    // Читаем все файлы из папки
    const files = fs.readdirSync(cardsDir);

    const jpgFiles = files.filter(
      (file) =>
        file.toLowerCase().endsWith(".jpg") ||
        file.toLowerCase().endsWith(".jpeg") ||
        file.toLowerCase().endsWith(".png")
    );

    // Создаем карты из найденных файлов
    const cards: Card[] = jpgFiles.map((filename, index) => {
      const cardName = path.parse(filename).name; // Имя файла без расширения
      return {
        id: String(index + 1),
        title: filename,
        imageUrl: `$assets/cards/${filename}`,
        description: cardName.replace(/[-_]/g, " "), // Заменяем дефисы и подчеркивания на пробелы
      };
    });

    if (cards.length === 0) {
      console.warn(
        "No JPG files found in cards directory. Using fallback cards."
      );
      return createFallbackCards();
    }

    console.log(`Loaded ${cards.length} cards from assets/cards directory`);
    return cards;
  } catch (error) {
    console.error("Error loading cards from assets:", error);
    return createFallbackCards();
  }
}

// Резервные карты на случай ошибки загрузки
function createFallbackCards(): Card[] {
  return Array.from({ length: 30 }, (_, i) => ({
    id: String(i + 1),
    title: `Card ${i + 1}`,
    imageUrl: `$assets/cards/card${i + 1}.jpg`,
    description: `Card ${i + 1}`,
  }));
}

// Предопределенные карты из папки assets/cards
const PREDEFINED_CARDS: Card[] = loadCardsFromAssets();

export class GameLogic {
  // Перемешать массив
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Раздать карты игрокам
  dealCards(players: Player[]): { [playerId: string]: Card[] } {
    const shuffledCards = this.shuffleArray(PREDEFINED_CARDS);
    const playerCards: { [playerId: string]: Card[] } = {};

    players.forEach((player, index) => {
      playerCards[player.id] = shuffledCards.slice(
        index * GAME_CONSTANTS.CARDS_PER_PLAYER,
        (index + 1) * GAME_CONSTANTS.CARDS_PER_PLAYER
      );
    });

    return playerCards;
  }

  getCards() {
    const shuffledCards = this.shuffleArray(PREDEFINED_CARDS);
    return shuffledCards;
  }

  // Определить следующего ведущего
  getNextLeader(players: Player[], currentLeaderId?: string): string {
    const sortedPlayers = players.sort(
      (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
    );

    if (!currentLeaderId) {
      return sortedPlayers[0].id;
    }

    const currentIndex = sortedPlayers.findIndex(
      (p) => p.id === currentLeaderId
    );
    const nextIndex = (currentIndex + 1) % sortedPlayers.length;
    return sortedPlayers[nextIndex].id;
  }

  // Подсчёт очков по правилам игры
  calculateScores(
    players: Player[],
    leaderCard: Card,
    playerCards: { playerId: string; card: Card }[],
    votes: { playerId: string; cardId: string }[]
  ): { [playerId: string]: number } {
    const scores: { [playerId: string]: number } = {};
    const leaderId = playerCards.find(
      (pc) => pc.card.id === leaderCard.id
    )?.playerId;

    if (!leaderId) return scores;

    // Подсчитываем голоса за карту ведущего
    const leaderVotes = votes.filter((v) => v.cardId === leaderCard.id);
    const totalVoters = votes.length;
    const guessedLeader = leaderVotes.length;

    // Очки для ведущего
    if (guessedLeader > 0 && guessedLeader < totalVoters) {
      scores[leaderId] = 3; // Ведущий получает 3 очка, если не все и не никто не угадал
    } else {
      scores[leaderId] = 0;
    }

    // Очки для остальных игроков
    players.forEach((player) => {
      if (player.id === leaderId) return; // Ведущий уже обработан

      scores[player.id] = 0;

      // 3 очка за угадывание карты ведущего
      if (
        votes.some(
          (v) => v.playerId === player.id && v.cardId === leaderCard.id
        )
      ) {
        scores[player.id] += 3;
      }

      // 1 очко за каждый голос за их карту (если это не карта ведущего)
      const playerCard = playerCards.find((pc) => pc.playerId === player.id);
      if (playerCard) {
        const votesForPlayerCard = votes.filter(
          (v) => v.cardId === playerCard.card.id && v.cardId !== leaderCard.id
        ).length;
        scores[player.id] += votesForPlayerCard;
      }
    });

    return scores;
  }

  isGameFinished(players: Player[]): boolean {
    return players.some(
      (player) => player.score >= GAME_CONSTANTS.WINNING_SCORE
    );
  }
  getWinner(players: Player[]): Player | null {
    if (!this.isGameFinished(players)) return null;
    const winner = players.reduce((max, player) =>
      player.score > max.score ? player : max
    );
    return winner;
  }

  canStartGame(players: Player[]): boolean {
    return (
      players.length >= GAME_CONSTANTS.MIN_PLAYERS &&
      players.length <= GAME_CONSTANTS.MAX_PLAYERS
    );
  }

  allPlayersSubmitted(players: Player[], submissions: any[]): boolean {
    const activePlayers = players.filter((p) => p.isConnected);
    return submissions.length === activePlayers.length - 1; // -1 потому что ведущий не выбирает
  }

  allPlayersVoted(players: Player[], votes: any[], leaderId: string): boolean {
    const activePlayers = players.filter(
      (p) => p.isConnected && p.id !== leaderId
    );
    return votes.length === activePlayers.length;
  }
}
