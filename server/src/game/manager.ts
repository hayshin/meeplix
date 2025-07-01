import { v4 as uuidv4 } from "uuid";
// import { db } from "$db/index";
import { decks, cards } from "$db/schema/cards";
import { eq, and } from "drizzle-orm";
import { loadCardsFromAssets } from "../game/cards";
import {
  PlayerEntity,
  PlayerCardEntity,
  PlayerCollection,
  PlayerCardCollection,
} from "$shared/types/player";
import { CardCollection, CardEntity } from "$shared/types/card";
import { RoomStateEntity, type RoomStageType } from "$shared/types/room";
import { GAME_CONFIG } from "$shared/constants";
import { ServerMessage } from "$shared/types/server";
import { ClientMessage } from "$shared/types/client";

export class GameManager {
  private wsConnections = new Map<string, Set<any>>(); // roomId -> Set of WebSocket connections
  public rooms = new Map<string, RoomStateEntity>(); // roomId -> RoomStateEntity

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

    const deck = loadCardsFromAssets();
    this.wsConnections.set(roomId, new Set());
    const room = new RoomStateEntity(
      roomId,
      new PlayerCollection([]),
      new CardCollection(deck),
      0,
      "",
      "",
      new PlayerCardCollection([]),
      "joining",
      new PlayerCardCollection([])
    );
    this.rooms.set(roomId, room);

    return roomId;
  }

  // Get room state by ID
  async getRoom(roomId: string): Promise<RoomStateEntity | undefined> {
    return this.rooms.get(roomId);
    // const sessions = await db
    //   .select()
    //   .from(roomSessions)
    //   .where(eq(roomSessions.id, roomId));

    // if (sessions.length === 0) return null;

    // const session = sessions[0];

    // const roomPlayers = await db
    //   .select()
    //   .from(players)
    //   .where(eq(players.roomSessionId, roomId));

    // const sessionPlayers: Player[] = roomPlayers.map((p) => ({
    //   id: p.id,
    //   nickname: p.nickname,
    //   score: p.score || 0,
    //   cards: p.cards || [],
    //   isConnected: Boolean(p.isConnected),
    //   isReady: Boolean(p.isReady),
    //   joinedAt: p.joinedAt,
    // }));

    // return {
    //   roomId: session.id,
    //   players: sessionPlayers,
    //   deck_id: session.deckId,
    //   roundNumber: session.roundNumber || 1,
    //   player_order: session.playerOrder || [],
    //   leaderId: session.leaderId || "",
    //   currentDescription: session.currentDescription || "",
    //   choosedCards: session.choosedCards || [],
    //   stage: session.stage as RoomStage,
    //   votedCards: session.votedCards || [],
    // };
  }

  // Add player to room
  async addPlayerToRoom(
    roomId: string,
    nickname: string
  ): Promise<PlayerEntity | null> {
    const room = await this.getRoom(roomId);
    if (!room) return null;

    if (room.players.size >= GAME_CONFIG.maxPlayers) {
      throw new Error("Room is full");
    }

    // Check that nickname is unique in this room
    if (room.players.some((p) => p.nickname === nickname)) {
      throw new Error("Nickname already taken");
    }

    const playerId = uuidv4();
    const now = new Date();

    // Get cards for the deck to deal to new player
    // const deckCards = await db
    //   .select()
    //   .from(cards)
    //   .where(eq(cards.deckId, room.deck_id));

    // Create default cards if none exist in deck

    const newPlayer = new PlayerEntity(
      playerId,
      nickname,
      0,
      new CardCollection([]),
      true,
      now,
      false
    );
    room.addPlayer(newPlayer);
    // await db.insert(players).values(newPlayer);

    return newPlayer;
  }

  // Start game (when all players are ready)
  async startGame(roomId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    if (!room || !room.canStartGame()) {
      throw new Error("Cannot start game");
    }

    // Check all players are ready
    if (!room.players.every((p) => p.isReady)) {
      throw new Error("Not all players are ready");
    }

    // Set player order and choose first leader
    const leaderId = room.getNextLeader();

    // Deal cards to all players
    room.dealCards();
    room.startRound(leaderId);

    // // Update all players with their new cards
    // for (const player of playersWithCards) {
    //   await db
    //     .update(players)
    //     .set({ cards: player.cards })
    //     .where(eq(players.id, player.id));
    // }

    // Update room status
    // await db
    //   .update(roomSessions)
    //   .set({
    //     stage: "leader_choosing",
    //     playerOrder,
    //     leaderId,
    //     choosedCards: [],
    //     votedCards: [],
    //   })
    //   .where(eq(roomSessions.id, roomId));
  }

  // Leader selects card and association
  async leaderChooseCard(
    roomId: string,
    playerId: string,
    cardId: string,
    description: string
  ): Promise<void> {
    const room = await this.getRoom(roomId);
    if (
      !room ||
      room.stage !== "leader_choosing" ||
      room.leaderId !== playerId
    ) {
      throw new Error("Invalid move");
    }

    const player = room.players.get(playerId);
    if (!player || !player.hand.has(cardId)) {
      throw new Error("Invalid card");
    }

    const card = player.hand.get(cardId);
    if (!card) {
      throw new Error("Card not found");
    }

    // Set the description and add leader's card to chosen cards
    room.currentDescription = description;
    room.choosedCards.add(PlayerCardEntity.fromEntities(player, card));

    // Move to players choosing stage
    room.stage = "players_choosing";

    // Remove the card from leader's hand
    player.hand.remove(cardId);

    // Send updated room state to all players
    this.broadcastToRoom(roomId, {
      type: "room_state_update",
      roomState: room.cloneForClient(),
    });

    // Send each non-leader player their hand for card selection
    room.getNonLeaderPlayers().forEach((nonLeaderPlayer) => {
      this.sendToPlayer(roomId, nonLeaderPlayer.id, {
        type: "players_choose_card",
        currentHand: nonLeaderPlayer.hand,
      });
    });
  }

  // Player submits card
  async playerChooseCard(
    roomId: string,
    { playerId, card }: PlayerCardEntity
  ): Promise<void> {
    const room = await this.getRoom(roomId);
    if (
      !room ||
      room.stage !== "players_choosing" ||
      room.leaderId === playerId
    ) {
      throw new Error("Invalid move");
    }

    const player = room.players.get(playerId);
    if (!player) throw new Error("Invalid player");

    if (!card) throw new Error("Invalid card");

    // Check if player already submitted a card
    if (room.choosedCards.hasPlayer(playerId)) {
      throw new Error("Player already submitted a card");
    }

    // Add player's card to chosen cards
    room.choosedCards.add(PlayerCardEntity.fromEntities(player, card));

    console.log(`Player ${playerId} chose card ${card.id} in room ${roomId}`);
    console.log(`Currently chosen cards:`, room.choosedCards.size);
    console.log(`Currently active players:`, room.getActivePlayers().size);
    // Remove the card from player's hand
    player.hand.remove(card.id);

    // Check if all players submitted cards
    if (room.allPlayersSubmitted()) {
      // Move to voting stage
      room.stage = "voting";
      console.log(`All players submitted cards, moving to voting stage`);

      // Get the actual cards for voting (shuffle to hide the order)
      const cardsForVoting = room.choosedCards.map((playerCard) => {
        // Find the card in the deck by ID
        return playerCard.card;
      });

      // Shuffle the cards to hide the order
      const shuffledCards = cardsForVoting.sort(() => Math.random() - 0.5);

      // Send voting message to all non-leader players
      room.getNonLeaderPlayers().forEach((nonLeaderPlayer) => {
        this.sendToPlayer(roomId, nonLeaderPlayer.id, {
          type: "begin_vote",
          choosedCards: shuffledCards,
        });
      });
    }

    // Send updated room state to all players
    this.broadcastToRoom(roomId, {
      type: "room_state_update",
      roomState: room.cloneForClient(),
    });
  }

  // Player votes
  async playerVote(
    roomId: string,
    { playerId, card }: PlayerCardEntity
  ): Promise<void> {
    const room = await this.getRoom(roomId);

    if (!room || room.stage !== "voting" || room.leaderId === playerId) {
      throw new Error("Invalid move");
    }

    const player = room.players.get(playerId);
    if (!player) throw new Error("Invalid player");

    // Find the voted card in the chosen cards (not player's hand)
    const votedCard = room.choosedCards.get(card.id);
    if (!votedCard) throw new Error("Invalid card to vote for");

    if (room.votedCards.hasPlayer(playerId)) {
      throw new Error("Player already voted");
    }

    // Record the vote (player voting for a specific card)
    room.votedCards.add(new PlayerCardEntity(playerId, card));

    // Check if all non-leader players voted
    if (room.allPlayersVoted()) {
      const leaderCard = room.choosedCards.find(
        (c) => c.playerId === room.leaderId
      );
      if (!leaderCard) {
        throw new Error("Leader card not found");
      }

      // Calculate points
      room.calculatePoints();

      // Get the actual leader card from the deck
      const leaderCardEntity = room.deck.get(leaderCard.card.id);
      if (!leaderCardEntity) {
        throw new Error("Leader card not found in deck");
      }

      // Send voting results to all players
      const pointChanges = room.players.map((player) => ({
        type: "point_change" as const,
        playerId: player.id,
        points: player.score,
      }));

      this.broadcastToRoom(roomId, {
        type: "end_vote",
        votedCards: room.votedCards,
        leaderCard: leaderCardEntity,
        points: pointChanges,
      });

      // Check if game is finished
      if (room.isGameFinished()) {
        const winner = room.getWinner();
        if (winner) {
          this.broadcastToRoom(roomId, {
            type: "end_game",
            winner: winner.id,
          });
          room.stage = "finished";
        }
      } else {
        // Move to results stage for next round preparation
        room.stage = "results";
      }
    }

    // Send updated room state to all players
    this.broadcastToRoom(roomId, {
      type: "room_state_update",
      roomState: room.cloneForClient(),
    });
  }

  // Start next round
  async startNextRound(roomId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    if (!room || room.stage !== "results") {
      throw new Error("Cannot start next round");
    }

    // Change leader to next player
    room.changeLeader();

    // Deal new cards to all players (assuming some cards were used)
    const neededCards =
      room.players.size * 6 -
      room.players.reduce((total, player) => total + player.hand.size, 0);
    if (neededCards > 0) {
      // Deal cards to fill hands back to 6
      room.players.forEach((player) => {
        const cardsNeeded = 6 - player.hand.size;
        if (cardsNeeded > 0) {
          const newCards = room.deck.draw(cardsNeeded);
          newCards.forEach((card) => player.hand.add(card));
        }
      });
    }

    // Start the new round
    room.startRound(room.leaderId);

    // Send each player their updated hand
    room.players.forEach((player) => {
      this.sendToPlayer(roomId, player.id, {
        type: "start_round",
        roundNumber: room.roundNumber,
        currentHand: player.hand,
      });
    });

    // Broadcast updated room state to all players
    this.broadcastToRoom(roomId, {
      type: "room_state_update",
      roomState: room.cloneForClient(),
    });
  }

  // Set player ready status
  async setPlayerReady(
    roomId: string,
    playerId: string,
    isReady: boolean
  ): Promise<void> {
    const room = await this.getRoom(roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    const player = room.players.get(playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    console.log(
      `Setting player ${playerId} ready status to ${isReady} in room ${roomId}`
    );
    player.isReady = isReady;
    // await db
    //   .update(players)
    //   .set({ isReady })
    //   .where(and(eq(players.id, playerId), eq(players.roomSessionId, roomId)));
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

  // export const RoomStateUpdateMessageSchema = t.Object({
  //   type: t.Literal("room_state_update"),
  //   roomState: RoomStateSchema,
  // });
  // Broadcast message to all players in room
  broadcastToRoom(
    roomId: string,
    message: ServerMessage | ClientMessage
  ): void {
    const connections = this.wsConnections.get(roomId);
    if (connections) {
      connections.forEach((ws: any) => {
        if (ws.readyState === 1) {
          // OPEN
          ws.send(message);
          // Only send room state update if the message is not already a room state update
          if (message.type !== "room_state_update") {
            const room = this.rooms.get(roomId);
            console.log(message);
            if (room) {
              ws.send({
                type: "room_state_update",
                roomState: room.cloneForClient(),
              });
            }
          }
        }
      });
    }
  }

  // Send message to specific player in room
  sendToPlayer(roomId: string, playerId: string, message: ServerMessage): void {
    const connections = this.wsConnections.get(roomId);
    if (connections) {
      connections.forEach((ws: any) => {
        if (ws.readyState === 1 && ws.data.query.playerId === playerId) {
          // OPEN
          ws.send(message);
        }
      });
    }
  }

  // Broadcast room update to all players
  // async broadcastRoomUpdate(roomId: string): Promise<void> {
  //   const room = await this.getRoom(roomId);
  //   if (room) {
  //     this.broadcastToRoom(roomId, {
  //       type: "room_update",
  //       data: room,
  //     });
  //   }
  // }

  // Remove player from room
  async removePlayerFromRoom(roomId: string, playerId: string): Promise<void> {
    // await db
    //   .update(players)
    //   .set({ isConnected: false })
    //   .where(and(eq(players.id, playerId), eq(players.roomSessionId, roomId)));
  }

  // Get room cards for display
  // async getRoomCards(roomId: string): Promise<Card[]> {
  //   const room = await this.getRoom(roomId);
  //   if (!room) return [];

  // const roomCards = await db
  //   .select()
  //   .from(cards)
  //   .where(eq(cards.deckId, room.deck_id));

  // return roomCards.map((card) => ({
  //   id: card.id,
  //   title: card.title,
  //   imageUrl: card.imageUrl,
  //   description: card.description,
  // }));
  // }
}
