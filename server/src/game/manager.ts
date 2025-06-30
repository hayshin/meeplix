import { v4 as uuidv4 } from "uuid";
import { db } from "$db/index";
import { decks, cards } from "$db/schema/cards";
import { eq, and } from "drizzle-orm";
import {
  PlayerEntity,
  PlayerCardEntity,
  PlayerCollection,
  PlayerCardCollection,
} from "$shared/types/player";
import { CardCollection, CardEntity } from "$shared/types/card";
import { RoomStateEntity, type RoomStageType } from "$shared/types/room";
import { GAME_CONFIG } from "$shared/constants";
import { GameLogic } from "./logic";

export class GameManager {
  private wsConnections = new Map<string, Set<any>>(); // roomId -> Set of WebSocket connections
  private rooms = new Map<string, RoomStateEntity>(); // roomId -> RoomStateEntity

  constructor() {}

  async createRoom(deckId?: string): Promise<string> {
    const roomId = uuidv4();
    const now = new Date();

    // Use default deck if none provided
    let finalDeckId = deckId;
    // if (!finalDeckId) {
    //   // Try to find any existing deck, or create a default one
    //   const existingDecks = await db.select().from(decks).limit(1);
    //   if (existingDecks.length > 0) {
    //     finalDeckId = existingDecks[0].id;
    //   } else {
    //     // Create a minimal deck entry for testing
    //     const defaultDeck = await db
    //       .insert(decks)
    //       .values({
    //         id: uuidv4(),
    //         name: "Default Deck",
    //         description: "Default deck for testing",
    //         cardCategoriesId: uuidv4(), // This would need proper category
    //         cardStylesId: uuidv4(), // This would need proper style
    //       })
    //       .returning();
    //     finalDeckId = defaultDeck[0].id;
    //   }
    // }

    // await db.insert(roomSessions).values({
    //   id: roomId,
    //   deckId: finalDeckId,
    //   roundNumber: 1,
    //   playerOrder: [],
    //   stage: "joining",
    //   choosedCards: [],
    //   votedCards: [],
    //   createdAt: now,
    // });

    this.wsConnections.set(roomId, new Set());
    const room = new RoomStateEntity(
      roomId,
      new PlayerCollection([]),
      new CardCollection([]),
      0,
      "",
      "",
      new PlayerCardCollection([]),
      "joining",
      new PlayerCardCollection([]),
    );
    this.rooms.set(roomId, room);

    return roomId;
  }

  // Get room state by ID
  async getRoom(roomId: string): Promise<RoomState | null> {
    const sessions = await db
      .select()
      .from(roomSessions)
      .where(eq(roomSessions.id, roomId));

    if (sessions.length === 0) return null;

    const session = sessions[0];

    const roomPlayers = await db
      .select()
      .from(players)
      .where(eq(players.roomSessionId, roomId));

    const sessionPlayers: Player[] = roomPlayers.map((p) => ({
      id: p.id,
      nickname: p.nickname,
      score: p.score || 0,
      cards: p.cards || [],
      isConnected: Boolean(p.isConnected),
      isReady: Boolean(p.isReady),
      joinedAt: p.joinedAt,
    }));

    return {
      roomId: session.id,
      players: sessionPlayers,
      deck_id: session.deckId,
      roundNumber: session.roundNumber || 1,
      player_order: session.playerOrder || [],
      leaderId: session.leaderId || "",
      currentDescription: session.currentDescription || "",
      choosedCards: session.choosedCards || [],
      stage: session.stage as RoomStage,
      votedCards: session.votedCards || [],
    };
  }

  // Add player to room
  async addPlayerToRoom(
    roomId: string,
    nickname: string,
  ): Promise<Player | null> {
    const room = await this.getRoom(roomId);
    if (!room) return null;

    if (room.players.length >= GAME_CONFIG.maxPlayers) {
      throw new Error("Room is full");
    }

    // Check that nickname is unique in this room
    if (room.players.some((p) => p.nickname === nickname)) {
      throw new Error("Nickname already taken");
    }

    const playerId = uuidv4();
    const now = new Date();

    // Get cards for the deck to deal to new player
    const deckCards = await db
      .select()
      .from(cards)
      .where(eq(cards.deckId, room.deck_id));

    // Create default cards if none exist in deck
    let playerCards: Card[] = [];
    const shuffledCards = this.gameLogic.getCards(deckCards);
    const playerIndex = room.players.length;
    const startIndex = playerIndex * GAME_CONFIG.cardsPerPlayer;
    const endIndex = startIndex + GAME_CONFIG.cardsPerPlayer;
    playerCards = shuffledCards.slice(startIndex, endIndex);

    const newPlayer: Player = {
      id: playerId,
      nickname,
      score: 0,
      cards: playerCards,
      isConnected: true,
      isReady: false,
      joinedAt: now,
    };

    // await db.insert(players).values(newPlayer);

    return newPlayer;
  }

  // Start game (when all players are ready)
  async startGame(roomId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    if (!room || !this.gameLogic.canStartGame(room.players)) {
      throw new Error("Cannot start game");
    }

    // Check all players are ready
    if (!room.players.every((p) => p.isReady)) {
      throw new Error("Not all players are ready");
    }

    // Set player order and choose first leader
    const playerOrder = room.players.map((p) => p.id);
    const leaderId = this.gameLogic.getNextLeader(room.players);

    // Get cards for the deck
    const deckCards = await db
      .select()
      .from(cards)
      .where(eq(cards.deckId, room.deck_id));

    // Deal cards to all players
    let gameCards: Card[] = [];
    if (deckCards.length > 0) {
      gameCards = deckCards;
    } else {
      // Use default cards if no deck cards available
      gameCards = this.gameLogic.getCards();
    }

    const playersWithCards = this.gameLogic.dealCards(room.players, gameCards);

    // Update all players with their new cards
    for (const player of playersWithCards) {
      await db
        .update(players)
        .set({ cards: player.cards })
        .where(eq(players.id, player.id));
    }

    // Update room status
    await db
      .update(roomSessions)
      .set({
        stage: "leader_choosing",
        playerOrder,
        leaderId,
        choosedCards: [],
        votedCards: [],
      })
      .where(eq(roomSessions.id, roomId));
  }

  // Leader selects card and association
  async leaderChooseCard(
    roomId: string,
    playerId: string,
    cardId: string,
    description: string,
  ): Promise<void> {
    const room = await this.getRoom(roomId);
    if (
      !room ||
      room.stage !== "leader_choosing" ||
      room.leaderId !== playerId
    ) {
      throw new Error("Invalid move");
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player || !player.cards.some((c) => c.id === cardId)) {
      throw new Error("Invalid card");
    }

    await db
      .update(roomSessions)
      .set({
        stage: "players_choosing",
        current_description: description,
        choosedCards: [{ playerId, cardId }],
      })
      .where(eq(roomSessions.id, roomId));
  }

  // Player submits card
  async playerChooseCard(
    roomId: string,
    playerId: string,
    cardId: string,
  ): Promise<void> {
    const room = await this.getRoom(roomId);
    if (
      !room ||
      room.stage !== "players_choosing" ||
      room.leaderId === playerId
    ) {
      throw new Error("Invalid move");
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player || !player.cards.some((c) => c.id === cardId)) {
      throw new Error("Invalid card");
    }

    // Check if player already submitted a card
    if (room.choosedCards.some((pc) => pc.playerId === playerId)) {
      throw new Error("Player already submitted a card");
    }

    const updatedChoosedCards = [...room.choosedCards, { playerId, cardId }];

    // Check if all players submitted cards
    const nonLeaderPlayers = room.players.filter(
      (p) => p.id !== room.leaderId && p.isConnected && p.isReady,
    );
    const nonLeaderSubmissions = updatedChoosedCards.filter(
      (card) => card.playerId !== room.leaderId,
    );

    if (nonLeaderSubmissions.length === nonLeaderPlayers.length) {
      await db
        .update(roomSessions)
        .set({
          stage: "voting",
          choosedCards: updatedChoosedCards,
        })
        .where(eq(roomSessions.id, roomId));
    } else {
      await db
        .update(roomSessions)
        .set({ choosedCards: updatedChoosedCards })
        .where(eq(roomSessions.id, roomId));
    }
  }

  // Player votes
  async playerVote(
    roomId: string,
    playerId: string,
    cardId: string,
  ): Promise<void> {
    const room = await this.getRoom(roomId);
    if (!room || room.stage !== "voting" || room.leaderId === playerId) {
      throw new Error("Invalid move");
    }

    if (room.votedCards.some((v) => v.playerId === playerId)) {
      throw new Error("Player already voted");
    }

    const updatedVotedCards = [...room.votedCards, { playerId, cardId }];

    // Check if all non-leader players voted
    const nonLeaderPlayers = room.players.filter(
      (p) => p.id !== room.leaderId && p.isConnected && p.isReady,
    );

    if (updatedVotedCards.length === nonLeaderPlayers.length) {
      const leaderCard = room.choosedCards.find(
        (c) => c.playerId === room.leaderId,
      );
      if (!leaderCard) {
        throw new Error("Leader card not found");
      }

      const scores = this.gameLogic.calculatePoints(
        room.players,
        leaderCard.cardId,
        room.choosedCards,
        updatedVotedCards,
      );

      console.log("Scores calculated:", scores);

      // Update player scores
      for (const player of room.players) {
        const newScore = player.score + (scores[player.id] || 0);
        await db
          .update(players)
          .set({ score: newScore })
          .where(eq(players.id, player.id));
      }

      // Check if game is finished
      const updatedRoom = await this.getRoom(roomId);
      if (updatedRoom && this.gameLogic.isGameFinished(updatedRoom.players)) {
        await db
          .update(roomSessions)
          .set({
            stage: "finished",
            votedCards: updatedVotedCards,
          })
          .where(eq(roomSessions.id, roomId));
      } else {
        // Move to next round
        const nextLeader = this.gameLogic.getNextLeader(
          room.players,
          room.leaderId,
        );
        await db
          .update(roomSessions)
          .set({
            stage: "results",
            leaderId: nextLeader,
            roundNumber: room.roundNumber + 1,
            currentDescription: null,
            choosedCards: [],
            votedCards: updatedVotedCards,
          })
          .where(eq(roomSessions.id, roomId));
      }
    } else {
      await db
        .update(roomSessions)
        .set({ votedCards: updatedVotedCards })
        .where(eq(roomSessions.id, roomId));
    }
  }

  // Start next round
  async startNextRound(roomId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    if (!room || room.stage !== "results") {
      throw new Error("Cannot start next round");
    }

    await db
      .update(roomSessions)
      .set({
        stage: "leader_choosing",
        choosedCards: [],
        votedCards: [],
      })
      .where(eq(roomSessions.id, roomId));
  }

  // Set player ready status
  async setPlayerReady(
    roomId: string,
    playerId: string,
    isReady: boolean,
  ): Promise<void> {
    await db
      .update(players)
      .set({ isReady })
      .where(and(eq(players.id, playerId), eq(players.roomSessionId, roomId)));
  }

  // WebSocket connection management
  addConnection(roomId: string, ws: any): void {
    if (!this.wsConnections.has(roomId)) {
      this.wsConnections.set(roomId, new Set());
    }
    this.wsConnections.get(roomId)!.add(ws);
  }

  removeConnection(roomId: string, ws: any): void {
    const connections = this.wsConnections.get(roomId);
    if (connections) {
      connections.delete(ws);
      if (connections.size === 0) {
        this.wsConnections.delete(roomId);
      }
    }
  }

  // Broadcast message to all players in room
  broadcastToRoom(roomId: string, message: any): void {
    const connections = this.wsConnections.get(roomId);
    if (connections) {
      connections.forEach((ws: any) => {
        if (ws.readyState === 1) {
          // OPEN
          ws.send(JSON.stringify(message));
        }
      });
    }
  }

  // Broadcast room update to all players
  async broadcastRoomUpdate(roomId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    if (room) {
      this.broadcastToRoom(roomId, {
        type: "room_update",
        data: room,
      });
    }
  }

  // Remove player from room
  async removePlayerFromRoom(roomId: string, playerId: string): Promise<void> {
    await db
      .update(players)
      .set({ isConnected: false })
      .where(and(eq(players.id, playerId), eq(players.roomSessionId, roomId)));
  }

  // Get room cards for display
  async getRoomCards(roomId: string): Promise<Card[]> {
    const room = await this.getRoom(roomId);
    if (!room) return [];

    const roomCards = await db
      .select()
      .from(cards)
      .where(eq(cards.deckId, room.deck_id));

    return roomCards.map((card) => ({
      id: card.id,
      title: card.title,
      imageUrl: card.imageUrl,
      description: card.description,
    }));
  }
}
