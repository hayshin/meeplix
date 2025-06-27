import { v4 as uuidv4 } from "uuid";
import { db } from "$db/index";
import { gameSessions, players } from "$db/schema";
import { eq, and } from "drizzle-orm";
import {
  type GameSession,
  type Player,
  type Card,
  GAME_CONSTANTS,
} from "$shared/types";
import { GameLogic } from "./logic";

export class GameManager {
  private gameLogic = new GameLogic();
  private wsConnections = new Map<string, any>(); // gameId -> Set of WebSocket connections

  constructor() {
    // Инициализируем карту подключений
  }

  // Создать новую игру
  async createGame(): Promise<string> {
    const gameId = uuidv4();
    const now = new Date();

    // Перемешиваем карты заранее для будущих игроков
    const shuffledCards = this.gameLogic.getCards();

    await db.insert(gameSessions).values({
      id: gameId,
      status: "waiting",
      currentRound: 1,
      createdAt: now,
      maxPlayers: 8,
      // Сохраняем перемешанные карты в roundData
      roundData: JSON.stringify({
        shuffledCards,
        selectedCards: [],
        playerCards: [],
        votes: [],
      }),
    });

    this.wsConnections.set(gameId, new Set());

    return gameId;
  }

  // Получить игру по ID
  async getGame(gameId: string): Promise<GameSession | null> {
    const sessions = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, gameId));
    const gamePlayers = await db
      .select()
      .from(players)
      .where(eq(players.gameSessionId, gameId));

    if (sessions.length === 0) return null;

    const session = sessions[0];
    const sessionPlayers: Player[] = gamePlayers.map((p) => ({
      id: p.id,
      nickname: p.nickname,
      score: p.score || 0,
      cards: p.cards ? JSON.parse(p.cards) : [],
      isConnected: Boolean(p.isConnected),
      joinedAt: p.joinedAt,
    }));

    return {
      id: session.id,
      status: session.status as any,
      players: sessionPlayers,
      currentRound: session.currentRound || 1,
      leaderPlayerId: session.leaderPlayerId || undefined,
      association: session.association || undefined,
      roundData: session.roundData
        ? JSON.parse(session.roundData)
        : {
            playerCards: [],
            votes: [],
            selectedCards: [],
            shuffledCards: [],
          },
      createdAt: session.createdAt,
      maxPlayers: session.maxPlayers || 8,
    };
  }

  // Добавить игрока в игру
  async addPlayerToGame(
    gameId: string,
    nickname: string
  ): Promise<Player | undefined> {
    const game = await this.getGame(gameId);
    if (!game) return;

    if (game.players.length >= game.maxPlayers) {
      throw new Error("Game is full");
    }

    // Проверить, что никнейм уникален в этой игре
    if (game.players.some((p) => p.nickname === nickname)) {
      throw new Error("Nickname already taken");
    }

    const playerId = uuidv4();
    const now = new Date();

    // Получаем перемешанные карты из roundData
    const gameRoundData = game.roundData;
    const shuffledCards = gameRoundData.shuffledCards || [];

    // Определяем карты для нового игрока
    const playerIndex = game.players.length; // Индекс нового игрока
    const startIndex = playerIndex * GAME_CONSTANTS.CARDS_PER_PLAYER;
    const endIndex = startIndex + GAME_CONSTANTS.CARDS_PER_PLAYER;
    const playerCards = shuffledCards.slice(startIndex, endIndex);

    const newPlayer: Player = {
      id: playerId,
      nickname,
      score: 0,
      cards: playerCards,
      isConnected: true,
      joinedAt: now,
    };

    await db.insert(players).values({
      id: playerId,
      gameSessionId: gameId,
      nickname,
      score: 0,
      cards: JSON.stringify(playerCards),
      isConnected: true,
      joinedAt: now,
    });

    return newPlayer;
  }

  // Начать игру (упрощаем, так как карты уже розданы)
  async startGame(gameId: string): Promise<void> {
    const game = await this.getGame(gameId);
    if (!game || !this.gameLogic.canStartGame(game.players)) {
      throw new Error("Cannot start game");
    }

    // Карты уже розданы при добавлении игроков, просто выбираем ведущего
    const leaderId = this.gameLogic.getNextLeader(game.players);

    // Обновить статус игры
    await db
      .update(gameSessions)
      .set({
        status: "leader_turn",
        leaderPlayerId: leaderId,
        roundData: JSON.stringify({
          playerCards: [],
          selectedCards: [],
          votes: [],
        }),
      })
      .where(eq(gameSessions.id, gameId));
  }

  // Ведущий выбирает карту и ассоциацию
  async leaderSelectsCard(
    gameId: string,
    playerId: string,
    cardId: string,
    association: string
  ): Promise<void> {
    const game = await this.getGame(gameId);
    if (
      !game ||
      game.status !== "leader_turn" ||
      game.leaderPlayerId !== playerId
    ) {
      throw new Error("Invalid move");
    }

    const player = game.players.find((p) => p.id === playerId);
    if (!player || !player.cards.some((c) => c.id === cardId)) {
      throw new Error("Invalid card");
    }

    const leaderCard = player.cards.find((c) => c.id === cardId)!;

    await db
      .update(gameSessions)
      .set({
        status: "player_selection",
        association,
        roundData: JSON.stringify({
          leaderCard,
          playerCards: [],
          votes: [],
        }),
      })
      .where(eq(gameSessions.id, gameId));
  }

  // Игрок выбирает карту
  async playerSubmitsCard(
    gameId: string,
    playerId: string,
    cardId: string
  ): Promise<void> {
    const game = await this.getGame(gameId);
    if (
      !game ||
      game.status !== "player_selection" ||
      game.leaderPlayerId === playerId
    ) {
      throw new Error("Invalid move");
    }

    const player = game.players.find((p) => p.id === playerId);
    if (!player || !player.cards.some((c) => c.id === cardId)) {
      throw new Error("Invalid card");
    }

    const card = player.cards.find((c) => c.id === cardId)!;
    const roundData = game.roundData;

    // Проверить, что игрок еще не выбирал карту
    if (roundData.selectedCards) {
      if (roundData.selectedCards.some((pc) => pc.playerId === playerId)) {
        throw new Error("Player already submitted a card");
      }
    } else {
      roundData.selectedCards = [];
    }

    roundData.selectedCards.push({ playerId, card });

    // Проверить, все ли игроки выбрали карты
    if (
      this.gameLogic.allPlayersSubmitted(game.players, roundData.selectedCards)
    ) {
      await db
        .update(gameSessions)
        .set({
          status: "voting",
          roundData: JSON.stringify(roundData),
        })
        .where(eq(gameSessions.id, gameId));
    } else {
      await db
        .update(gameSessions)
        .set({ roundData: JSON.stringify(roundData) })
        .where(eq(gameSessions.id, gameId));
    }
  }

  // Игрок голосует
  async playerVotes(
    gameId: string,
    playerId: string,
    cardId: string
  ): Promise<void> {
    const game = await this.getGame(gameId);
    if (!game || game.status !== "voting" || game.leaderPlayerId === playerId) {
      throw new Error("Invalid move");
    }

    const roundData = game.roundData;

    // Проверить, что игрок еще не голосовал
    if (roundData.votes.some((v) => v.playerId === playerId)) {
      throw new Error("Player already voted");
    }

    roundData.votes.push({ playerId, cardId });

    // Проверить, все ли игроки проголосовали
    if (
      this.gameLogic.allPlayersVoted(
        game.players,
        roundData.votes,
        game.leaderPlayerId!
      )
    ) {
      // Подсчитать очки
      const scores = this.gameLogic.calculateScores(
        game.players,
        roundData.leaderCard!,
        roundData.playerCards,
        roundData.votes
      );

      // Обновить очки игроков
      for (const player of game.players) {
        const newScore = player.score + (scores[player.id] || 0);
        await db
          .update(players)
          .set({ score: newScore })
          .where(eq(players.id, player.id));
      }

      // Проверить, закончилась ли игра
      const updatedGame = await this.getGame(gameId);
      if (updatedGame && this.gameLogic.isGameFinished(updatedGame.players)) {
        await db
          .update(gameSessions)
          .set({
            status: "finished",
            roundData: JSON.stringify(roundData),
          })
          .where(eq(gameSessions.id, gameId));
      } else {
        // Перейти к следующему раунду
        const nextLeader = this.gameLogic.getNextLeader(
          game.players,
          game.leaderPlayerId
        );
        await db
          .update(gameSessions)
          .set({
            status: "leader_turn",
            leaderPlayerId: nextLeader,
            currentRound: game.currentRound + 1,
            association: null,
            roundData: JSON.stringify({
              playerCards: [],
              votes: [],
            }),
          })
          .where(eq(gameSessions.id, gameId));
      }
    } else {
      await db
        .update(gameSessions)
        .set({ roundData: JSON.stringify(roundData) })
        .where(eq(gameSessions.id, gameId));
    }
  }

  // Управление WebSocket подключениями
  addConnection(gameId: string, ws: any): void {
    if (!this.wsConnections.has(gameId)) {
      this.wsConnections.set(gameId, new Set());
    }
    this.wsConnections.get(gameId)!.add(ws);
  }

  removeConnection(gameId: string, ws: any): void {
    const connections = this.wsConnections.get(gameId);
    if (connections) {
      connections.delete(ws);
      if (connections.size === 0) {
        this.wsConnections.delete(gameId);
      }
    }
  }

  // Отправить сообщение всем игрокам в игре
  broadcastToGame(gameId: string, message: any): void {
    const connections = this.wsConnections.get(gameId);
    if (connections) {
      connections.forEach((ws: any) => {
        if (ws.readyState === 1) {
          // OPEN
          ws.send(JSON.stringify(message));
        }
      });
    }
  }

  // Отправить обновление игры всем игрокам
  async broadcastGameUpdate(gameId: string): Promise<void> {
    const game = await this.getGame(gameId);
    if (game) {
      this.broadcastToGame(gameId, {
        type: "game_update",
        data: { session: game },
      });
    }
  }
}
