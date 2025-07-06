import { v4 as uuidv4 } from "uuid";
// import { db } from "$db/index";
import { decks, cards } from "$db/schema/cards";
import { eq, and } from "drizzle-orm";
import { loadCardsFromAssets } from "../game/cards";
import { PlayerEntity, PlayerCollection } from "$shared/types/player";
import { VoteEntity, VoteCollection } from "$shared/types/vote";
import { SubmittedCardCollection } from "$types/submitted_card";
import { SubmittedCardEntity } from "$types/submitted_card";
import { CardCollection, CardEntity } from "$shared/types/card";
import { RoomStateEntity, type RoomStageType } from "$shared/types/room";
import { GAME_CONFIG } from "$shared/constants";
import {
  ServerMessage,
  ServerMessageWithoutRoomState,
} from "$shared/types/server";
import { ClientMessage } from "$shared/types/client";
import { sendMessage, WS } from "$/ws/handlers";

export class GameManager {
  private wsConnections = new Map<string, Set<any>>(); // roomId -> Set of WebSocket connections
  public rooms = new Map<string, RoomStateEntity>(); // roomId -> RoomStateEntity

  constructor() {}

  async addRoom(deckId?: string): Promise<string> {
    const room = await createRoom(deckId);

    this.rooms.set(room.id, room);

    return room.id;
  }

  getRoom(roomId: string): RoomStateEntity {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Room not found");
    return room;
  }

  // Add player to room
  async addPlayerToRoom(
    roomId: string,
    nickname: string,
  ): Promise<PlayerEntity> {
    const room = this.getRoom(roomId);

    if (room.players.size >= GAME_CONFIG.maxPlayers) {
      throw new Error("Room is full");
    }

    // Check that nickname is unique in this room
    if (room.players.some((p) => p.nickname === nickname)) {
      throw new Error("Nickname already taken");
    }

    console.log(`Creating new player with nickname: ${nickname}`);
    const newPlayer = createPlayer(nickname);
    console.log(
      `Generated player ID: ${newPlayer.id} for nickname: ${nickname}`,
    );

    room.addPlayer(newPlayer);
    console.log(
      `Added player to room ${roomId}. Total players: ${room.players.size}`,
    );
    console.log(
      `All player IDs in room:`,
      room.players.map((p) => `${p.nickname}: ${p.id}`),
    );

    return newPlayer;
  }

  async connectPlayer(ws: WS, roomId: string, playerId: string): Promise<void> {
    console.log(`Connecting player ${playerId} to room ${roomId}`);

    // Store player ID in WebSocket data for later identification
    if (!ws.data) {
      ws.data = {};
    }
    ws.data.playerId = playerId;
    ws.data.roomId = roomId;

    this.addConnection(roomId, ws);
    console.log(`WebSocket connection added for player ${playerId}`);

    // Broadcast to room that player joined
    this.broadcastToRoom(roomId, {
      type: "player_joined",
      roomId: roomId,
      playerId: playerId,
    });

    console.log(`Player ${playerId} successfully connected to room ${roomId}`);
  }

  // Start game (when all players are ready)
  async startGame(roomId: string): Promise<void> {
    const room = this.getRoom(roomId);
    if (!room.canStartGame()) {
      throw new Error("Cannot start game");
    }

    if (!room.players.every((p) => p.isReady)) {
      throw new Error("Not all players are ready");
    }

    // Set player order and choose first leader
    const leaderId = room.getNextLeader();

    room.dealCards();
    room.startRound(leaderId);

    room.players.forEach((player) => {
      this.sendToPlayer(roomId, player.id, {
        type: "start_round",
        roundNumber: room.roundNumber,
        currentHand: player.hand,
      });
    });
  }

  // Leader selects card and association
  async leaderSubmitCard(
    roomId: string,
    playerId: string,
    cardId: string,
    description: string,
  ): Promise<void> {
    const room = this.getRoom(roomId);
    room.assertStage("leader_choosing");

    if (room.leaderId !== playerId) {
      throw new Error("Player is not the leader");
    }

    const player = room.getPlayer(playerId);

    const card = player.getCard(cardId);
    if (!card) {
      throw new Error("Card not found");
    }

    // Set the description and add leader's card to chosen cards
    room.currentDescription = description;
    room.submittedCards.add(SubmittedCardEntity.fromEntities(player, card));

    // Move to players choosing stage
    room.stage = "players_choosing";

    // Remove the card from leader's hand
    player.removeCard(cardId);

    // Send each non-leader player their hand for card selection
    room.getNonLeaderPlayers().forEach((player) => {
      this.sendToPlayer(roomId, player.id, {
        type: "players_choose_card",
        currentHand: player.hand,
      });
    });
  }

  // Player submits card
  async playerSubmitCard(
    roomId: string,
    { playerId, card }: SubmittedCardEntity,
  ): Promise<void> {
    const room = await this.getRoom(roomId);

    room.assertStage("players_choosing");

    if (room.leaderId === playerId) {
      throw new Error("Leader cannot choose card");
    }

    const player = room.getPlayer(playerId);

    // Check if player already submitted a card
    if (room.submittedCards.hasPlayer(playerId)) {
      throw new Error("Player already submitted a card");
    }

    // Add player's card to chosen cards
    room.submittedCards.add(SubmittedCardEntity.fromEntities(player, card));

    console.log(`Player ${playerId} submits card ${card.id} in room ${roomId}`);
    // Remove the card from player's hand
    player.removeCard(card.id);

    // Check if all players submitted cards
    if (room.allPlayersSubmitted()) {
      // Move to voting stage
      await this.startVoting(room);
    }
  }

  async startVoting(room: RoomStateEntity) {
    room.stage = "voting";
    console.log(`All players submitted cards, moving to voting stage`);

    // Get the actual cards for voting (shuffle to hide the order)
    const cardsForVoting = room.submittedCards.map((pair) => {
      // Find the card in the deck by ID
      return pair.card;
    });

    // Shuffle the cards to hide the order
    const shuffledCards = cardsForVoting.sort(() => Math.random() - 0.5);

    // Send voting message to all non-leader players
    room.getNonLeaderPlayers().forEach((player) => {
      this.sendToPlayer(room.id, player.id, {
        type: "begin_vote",
        cardsForVoting: shuffledCards,
      });
    });
  }

  // Player votes
  async playerVote(
    roomId: string,
    voterPlayerId: string,
    choiceCard: CardEntity,
    // { voterPlayerId, choicePlayerId, choiceCard }: VoteEntity,
  ): Promise<void> {
    try {
      console.log(`=== PLAYER VOTE START ===`);

      const room = await this.getRoom(roomId);
      console.log(
        `Player ${voterPlayerId} voted for card ${choiceCard.id} that belongs to choicePlayerId`,
      );
      const choicePlayerId = room.submittedCards.getPair(
        choiceCard.id,
      ).playerId;
      const choicePlayer = room.getPlayer(choicePlayerId);
      console.log(`Player found: ${!!choicePlayer}`);

      room.assertStage("voting");

      if (room.leaderId === voterPlayerId) {
        throw new Error("Leader cannot vote");
      }

      const voter = room.getPlayer(voterPlayerId);
      console.log(`Player found: ${!!voter}`);

      // Find the voted card in the chosen cards (not player's hand)
      if (!room.submittedCards.hasCard(choiceCard.id)) {
        console.log(`ERROR: Invalid card to vote for: ${choiceCard.id}`);
        throw new Error("Invalid card to vote for");
      } else {
        console.log(`Card found: ${choiceCard.id}`);
      }

      const hasAlreadyVoted = room.votedPairs.hasVoted(voterPlayerId);
      console.log(`Player already voted: ${hasAlreadyVoted}`);
      if (hasAlreadyVoted) {
        console.log(`ERROR: Player already voted: ${voterPlayerId}`);
        throw new Error("Player already voted");
      }

      // Record the vote (player voting for a specific card)
      console.log(`Recording vote...`);
      room.votedPairs.add(
        new VoteEntity(voterPlayerId, choicePlayerId, choiceCard),
      );
      console.log(`Vote recorded successfully`);

      const allPlayersVoted = room.allPlayersVoted();
      const activePlayersCount = room.getActivePlayers().size;
      const votedCardsCount = room.votedPairs.size;

      console.log(`All players voted: ${allPlayersVoted}`);
      console.log(`Active players count: ${activePlayersCount}`);
      console.log(`Voted cards count: ${votedCardsCount}`);

      // Check if all non-leader players voted
      if (allPlayersVoted) {
        this.endVote(room);
        // Check if game is finished
        const isGameFinished = room.isGameFinished();
        console.log(`Game finished: ${isGameFinished}`);
        if (isGameFinished) {
          this.finishGame(room);
        } else {
          // Move to results stage for next round preparation
          room.stage = "results";
          console.log(`Game stage set to results`);
        }
      }

      // Send updated room state to all players

      console.log(`=== PLAYER VOTE END ===`);
    } catch (error) {
      console.error(`=== PLAYER VOTE ERROR ===`);
      console.error(`Error in playerVote:`, error);
      console.error(
        `Stack trace:`,
        error instanceof Error ? error.stack : "No stack trace",
      );
      console.error(`Room ID: ${roomId}`);
      console.error(`=== PLAYER VOTE ERROR END ===`);
      throw error;
    }
  }

  async endVote(room: RoomStateEntity) {
    console.log(`All players voted - processing end of voting...`);

    console.log(`Calculating points...`);
    room.calculatePoints();
    console.log(`Points calculated successfully`);

    // Send voting results to all players
    console.log(`Preparing voting results...`);
    const pointChanges = room.players.map((player) => ({
      type: "point_change" as const,
      playerId: player.id,
      points: player.score,
    }));

    room.stage = "results";

    console.log(`Broadcasting end_vote...`);
    this.broadcastToRoom(room.id, {
      type: "end_vote",
      votedCards: room.votedPairs,
      leaderCard: room.getSubmittedLeaderCard(),
    });
  }

  async finishGame(room: RoomStateEntity) {
    const winner = room.getWinner();
    console.log(`Winner: ${winner?.id}`);
    if (winner) {
      console.log(`Broadcasting end_game...`);
      this.broadcastToRoom(room.id, {
        type: "end_game",
        winner: winner.id,
      });
      room.stage = "finished";
      console.log(`Game stage set to finished`);
    }
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
  }

  // Set player ready status
  async setPlayerReady(
    roomId: string,
    playerId: string,
    isReady: boolean,
  ): Promise<void> {
    const room = this.getRoom(roomId);
    const player = room.getPlayer(playerId);

    console.log(
      `Setting player ${playerId} ready status to ${isReady} in room ${roomId}`,
    );
    player.isReady = isReady;

    this.broadcastToRoom(roomId, { type: "player_ready", roomId, playerId });
  }

  // WebSocket connection management
  addConnection(roomId: string, ws: WS): void {
    if (!this.wsConnections.has(roomId)) {
      this.wsConnections.set(roomId, new Set());
    }
    this.wsConnections.get(roomId)!.add(ws);
  }

  removeConnection(roomId: string, ws: WS): void {
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
    message: ServerMessageWithoutRoomState,
  ): void {
    const room = this.getRoom(roomId);
    const connections = this.wsConnections.get(roomId);
    console.log("Broadcasting message to room:", roomId);
    console.log(message);
    if (connections) {
      connections.forEach((ws: WS) => {
        if (ws.readyState === 1) {
          // OPEN
          ws.send({
            ...message,
            roomState: room.cloneForClient(),
          });
          // Only send room state update if the message is not already a room state update
        }
      });
    }
  }

  // Send message to specific player in room
  sendToPlayer(
    roomId: string,
    playerId: string,
    message: ServerMessageWithoutRoomState,
  ): void {
    const room = this.getRoom(roomId);
    const connections = this.wsConnections.get(roomId);
    if (connections) {
      connections.forEach((ws: WS) => {
        if (ws.readyState === 1 && ws.data?.playerId === playerId) {
          // OPEN
          ws.send({
            ...message,
            roomState: room.cloneForClient(),
          });
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
