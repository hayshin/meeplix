import { v4 as uuidv4 } from "uuid";
// import { db } from "$db/index";
import { decks, cards } from "$db/schema/cards";
import { eq, and } from "drizzle-orm";
import { loadCardsFromAssets } from "../game/cards";
import { PlayerEntity, PlayerCollection } from "$shared/types/player";
import { PairHandCollection } from "$types/pair";
import { PairHandEntity } from "$types/pair";
import { CardCollection, CardEntity } from "$shared/types/card";
import { RoomStateEntity, type RoomStageType } from "$shared/types/room";
import { GAME_CONFIG } from "$shared/constants";
import { ServerMessage } from "$shared/types/server";
import { ClientMessage } from "$shared/types/client";
import { createPlayer } from "./player";
import { createRoom } from "./room";

export class GameManager {
  private wsConnections = new Map<string, Set<any>>(); // roomId -> Set of WebSocket connections
  public rooms = new Map<string, RoomStateEntity>(); // roomId -> RoomStateEntity

  constructor() {}

  async addRoom(deckId?: string): Promise<string> {
    const room = await createRoom(deckId);

    this.wsConnections.set(room.id, new Set());
    this.rooms.set(room.id, room);

    return room.id;
  }

  async getRoom(roomId: string): Promise<RoomStateEntity> {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Room not found");
    return room;
  }

  // Add player to room
  async addPlayerToRoom(
    roomId: string,
    nickname: string,
  ): Promise<PlayerEntity | null> {
    const room = await this.getRoom(roomId);

    if (room.players.size >= GAME_CONFIG.maxPlayers) {
      throw new Error("Room is full");
    }

    // Check that nickname is unique in this room
    if (room.players.some((p) => p.nickname === nickname)) {
      throw new Error("Nickname already taken");
    }
    const newPlayer = createPlayer(nickname);
    room.addPlayer(newPlayer);

    return newPlayer;
  }

  // Start game (when all players are ready)
  async startGame(roomId: string): Promise<void> {
    const room = await this.getRoom(roomId);
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
  }

  // Leader selects card and association
  async leaderChooseCard(
    roomId: string,
    playerId: string,
    cardId: string,
    description: string,
  ): Promise<void> {
    const room = await this.getRoom(roomId);
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
    room.choosedPairs.add(PairHandEntity.fromEntities(player, card));

    // Move to players choosing stage
    room.stage = "players_choosing";

    // Remove the card from leader's hand
    player.removeCard(cardId);

    // // Send updated room state to all players
    // this.broadcastToRoom(roomId, {
    //   type: "room_state_update",
    //   roomState: room.cloneForClient(),
    // });

    // Send each non-leader player their hand for card selection
    room.getNonLeaderPlayers().forEach((player) => {
      this.sendToPlayer(roomId, player.id, {
        type: "players_choose_card",
        currentHand: player.hand,
      });
    });
  }

  // Player submits card
  async playerChooseCard(
    roomId: string,
    { playerId, card }: PairHandEntity,
  ): Promise<void> {
    const room = await this.getRoom(roomId);

    room.assertStage("players_choosing");

    if (room.leaderId === playerId) {
      throw new Error("Leader cannot choose card");
    }

    const player = room.getPlayer(playerId);

    // Check if player already submitted a card
    if (room.choosedPairs.hasPlayer(playerId)) {
      throw new Error("Player already submitted a card");
    }

    // Add player's card to chosen cards
    room.choosedPairs.add(PairHandEntity.fromEntities(player, card));

    console.log(`Player ${playerId} chose card ${card.id} in room ${roomId}`);
    // Remove the card from player's hand
    player.removeCard(card.id);

    // Check if all players submitted cards
    if (room.allPlayersSubmitted()) {
      // Move to voting stage
      room.stage = "voting";
      console.log(`All players submitted cards, moving to voting stage`);

      // Get the actual cards for voting (shuffle to hide the order)
      const cardsForVoting = room.choosedPairs.map((pair) => {
        // Find the card in the deck by ID
        return pair.card;
      });

      // Shuffle the cards to hide the order
      const shuffledCards = cardsForVoting.sort(() => Math.random() - 0.5);

      // Send voting message to all non-leader players
      room.getNonLeaderPlayers().forEach((player) => {
        this.sendToPlayer(roomId, player.id, {
          type: "begin_vote",
          cardsForVoting: shuffledCards,
        });
      });
    }

    // Send updated room state to all players
    // this.broadcastToRoom(roomId, {
    //   type: "room_state_update",
    //   roomState: room.cloneForClient(),
    // });
  }

  // Player votes
  async playerVote(
    roomId: string,
    { playerId, card }: PairHandEntity,
  ): Promise<void> {
    try {
      console.log(`=== PLAYER VOTE START ===`);

      const room = await this.getRoom(roomId);
      console.log(`Player ${playerId} voted for card ${card.id}`);

      room.assertStage("voting");

      if (room.leaderId === playerId) {
        console.log(`isLeader: ${room.leaderId === playerId}`);
        throw new Error("Leader cannot vote");
      }

      const player = room.getPlayer(playerId);
      console.log(`Player found: ${!!player}`);

      // Find the voted card in the chosen cards (not player's hand)
      const hasVotedCard = room.choosedPairs.hasCard(card.id);
      console.log(`Voted card found in chosen cards: ${!!hasVotedCard}`);
      console.log(
        `Chosen cards:`,
        room.choosedPairs
          .toArray()
          .map((c) => ({ id: c.card.id, playerId: c.playerId })),
      );
      if (!hasVotedCard) {
        console.log(`ERROR: Invalid card to vote for: ${card.id}`);
        throw new Error("Invalid card to vote for");
      }

      const hasAlreadyVoted = room.votedCards.hasPlayer(playerId);
      console.log(`Player already voted: ${hasAlreadyVoted}`);
      if (hasAlreadyVoted) {
        console.log(`ERROR: Player already voted: ${playerId}`);
        throw new Error("Player already voted");
      }

      // Record the vote (player voting for a specific card)
      console.log(`Recording vote...`);
      room.votedCards.add(new PairHandEntity(playerId, card));
      console.log(`Vote recorded successfully`);
      console.log(
        `Current voted cards:`,
        room.votedCards
          .toArray()
          .map((v) => ({ playerId: v.playerId, cardId: v.card.id })),
      );

      const allPlayersVoted = room.allPlayersVoted();
      const activePlayersCount = room.getActivePlayers().size;
      const votedCardsCount = room.votedCards.size;

      console.log(`All players voted: ${allPlayersVoted}`);
      console.log(`Active players count: ${activePlayersCount}`);
      console.log(`Voted cards count: ${votedCardsCount}`);

      // Check if all non-leader players voted
      if (allPlayersVoted) {
        console.log(`All players voted - processing end of voting...`);

        const leaderCard = room.choosedPairs.find(
          (c) => c.playerId === room.leaderId,
        );
        console.log(`Leader card found: ${!!leaderCard}`);
        if (!leaderCard) {
          console.log(`ERROR: Leader card not found in chosen cards`);
          throw new Error("Leader card not found");
        }

        // Calculate points
        console.log(`Calculating points...`);
        room.calculatePoints();
        console.log(`Points calculated successfully`);

        // Get the actual leader card from the deck
        const leaderCardEntity = room.deck.get(leaderCard.card.id);
        console.log(`Leader card entity found in deck: ${!!leaderCardEntity}`);
        if (!leaderCardEntity) {
          console.log(
            `ERROR: Leader card not found in deck: ${leaderCard.card.id}`,
          );
          throw new Error("Leader card not found in deck");
        }

        // Send voting results to all players
        console.log(`Preparing voting results...`);
        const pointChanges = room.players.map((player) => ({
          type: "point_change" as const,
          playerId: player.id,
          points: player.score,
        }));

        console.log(`Broadcasting end_vote...`);
        this.broadcastToRoom(roomId, {
          type: "end_vote",
          votedCards: room.votedCards,
          leaderCard: leaderCardEntity,
          points: pointChanges,
        });

        // Check if game is finished
        const isGameFinished = room.isGameFinished();
        console.log(`Game finished: ${isGameFinished}`);
        if (isGameFinished) {
          const winner = room.getWinner();
          console.log(`Winner: ${winner?.id}`);
          if (winner) {
            console.log(`Broadcasting end_game...`);
            this.broadcastToRoom(roomId, {
              type: "end_game",
              winner: winner.id,
            });
            room.stage = "finished";
            console.log(`Game stage set to finished`);
          }
        } else {
          // Move to results stage for next round preparation
          room.stage = "results";
          console.log(`Game stage set to results`);
        }
      }

      // Send updated room state to all players
      console.log(`Broadcasting room state update...`);
      this.broadcastToRoom(roomId, {
        type: "room_state_update",
        roomState: room.cloneForClient(),
      });

      console.log(`=== PLAYER VOTE END ===`);
    } catch (error) {
      console.error(`=== PLAYER VOTE ERROR ===`);
      console.error(`Error in playerVote:`, error);
      console.error(
        `Stack trace:`,
        error instanceof Error ? error.stack : "No stack trace",
      );
      console.error(`Room ID: ${roomId}`);
      console.error(`Player ID: ${playerId}`);
      console.error(`Card ID: ${card.id}`);
      console.error(`=== PLAYER VOTE ERROR END ===`);
      throw error;
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
    isReady: boolean,
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
      `Setting player ${playerId} ready status to ${isReady} in room ${roomId}`,
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
    message: ServerMessage | ClientMessage,
  ): void {
    const connections = this.wsConnections.get(roomId);
    console.log("Broadcasting message to room:", roomId);
    console.log(message);
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
