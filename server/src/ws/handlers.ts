import type { ServerWebSocket } from "bun";
import { GameManager } from "../game/manager";
import {
  ClientMessageSchema,
  type ClientMessage,
  type JoinRoomMessage,
  type CreateRoomMessage,
  type LeaderPlayerChooseCardMessage,
  type PlayerChooseCardMessage,
  type PlayerVoteMessage,
  type ReadyMessage,
} from "$shared/types/client";
import { PlayerCardEntity } from "$shared/types/player";
import Elysia from "elysia";
import { ElysiaWS } from "elysia/dist/ws";
import { t } from "elysia";
import { ServerMessage } from "$shared/types/server";

export const gameManager = new GameManager();

const WSDataSchema = t.Object({
  roomId: t.Optional(t.String()),
  playerId: t.Optional(t.String()),
});

type WSData = typeof WSDataSchema.static;

type WS = ElysiaWS<{
  query: WSData;
  body: { message: ClientMessage };
}>;

export const websocket = new Elysia().ws("/ws", {
  query: WSDataSchema,
  body: t.Object({ message: ClientMessageSchema }),

  open(ws: WS) {
    console.log("WebSocket connection opened");
  },

  message: async (ws: WS, data: { message: ClientMessage }) => {
    const message = data.message;

    try {
      handleMessage(ws, message);
    } catch (error) {
      console.error("WebSocket handler error:", error);
      sendError(
        ws,
        error instanceof Error ? error.message : "Internal server error"
      );
    }
  },

  close: (ws: WS) => {
    console.log("WebSocket connection closed");
    const { roomId } = ws.data.query;
    if (roomId) {
      gameManager.removeConnection(roomId, ws);
    }
  },
});

function sendError(ws: WS, message: string) {
  ws.send({
    type: "error",
    message,
  });
}

function sendMessage(ws: WS, message: ServerMessage) {
  ws.send(message);
}

function broadcastToRoom(
  ws: WS,
  roomId: string,
  message: ServerMessage | ClientMessage
) {
  gameManager.broadcastToRoom(roomId, message);
}

async function handleMessage(ws: WS, message: ClientMessage) {
  console.log("Received message:", message);
  switch (message.type) {
    case "ready":
      await handleReady(ws, message as ReadyMessage);
      break;
    case "create_room":
      await handleCreateRoom(ws, message as CreateRoomMessage);
      break;
    case "join_room":
      await handleJoinRoom(ws, message as JoinRoomMessage);
      break;
    case "start_game":
      await handleStartGame(ws);
      break;
    case "leader_player_choose_card":
      await handleLeaderChooseCard(ws, message);
      break;
    case "player_choose_card":
      await handlePlayerChooseCard(ws, message);
      break;
    case "player_vote":
      await handlePlayerVote(ws, message);
      break;
    default:
      sendError(ws, "Unknown message type");
  }
}

async function handleReady(ws: WS, message: ReadyMessage) {
  // sendMessage(ws, {
  //   type: "ready_ack",
  //   message: "Connection ready",
  // });
  const { roomId, playerId } = ws.data.query;
  if (!roomId) throw Error("No roomId provided in query, ReadyMessage");
  if (!playerId) throw Error("No playerId provided in query, ReadyMessage");
  gameManager.setPlayerReady(roomId, playerId, true);
  broadcastToRoom(ws, roomId, message);
}

async function handleCreateRoom(ws: WS, message: CreateRoomMessage) {
  try {
    // For now, use a default deck ID. In the future, this could come from the message
    const defaultDeckId = "default-deck-id";
    const roomId = await gameManager.createRoom(defaultDeckId);

    // Add the creator to the room
    const player = await gameManager.addPlayerToRoom(roomId, message.name);

    if (!player) {
      sendError(ws, "Failed to create room");
      return;
    }

    // Update WebSocket data
    ws.data.query.roomId = roomId;
    ws.data.query.playerId = player.id;

    // Add connection to manager
    gameManager.addConnection(roomId, ws);

    // Send room created response
    const room = await gameManager.getRoom(roomId);
    // sendMessage(ws, {
    //   type: "room_created",
    //   roomId: roomId,
    //   playerId: player.id,
    //   // room: room,
    // });

    // Broadcast room update
    // await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to create room"
    );
  }
}

async function handleJoinRoom(ws: WS, message: JoinRoomMessage) {
  try {
    const { roomId, name } = message;
    console.log(`Joining room: ${roomId} with name: ${name}`);

    // Check if room exists
    const room = await gameManager.getRoom(roomId);
    console.log(
      `Attempting to join room ${roomId}:`,
      room ? "exists" : "does not exist"
    );

    if (!room) {
      console.log(`Room ${roomId} not found`);
      sendError(ws, "Room not found");
      return;
    }

    // Add player to room
    const player = await gameManager.addPlayerToRoom(roomId, name);
    if (!player) {
      sendError(ws, "Failed to join room");
      return;
    }

    // Update WebSocket data
    ws.data.query.roomId = roomId;
    ws.data.query.playerId = player.id;

    // Add connection to manager
    gameManager.addConnection(roomId, ws);

    // Send join success response
    sendMessage(ws, {
      type: "room_joined",
      roomId: roomId,
      playerId: player.id,
    });

    // Send room state update to the joining player
    const updatedRoom = await gameManager.getRoom(roomId);
    if (updatedRoom) {
      sendMessage(ws, {
        type: "room_state_update",
        roomState: updatedRoom.cloneForClient(),
      });

      // Broadcast room update to all other players in the room
      broadcastToRoom(ws, roomId, {
        type: "room_state_update",
        roomState: updatedRoom.cloneForClient(),
      });
    }
  } catch (error) {
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to join room"
    );
  }
}

async function handleLeaderChooseCard(
  ws: WS,
  message: LeaderPlayerChooseCardMessage
) {
  try {
    const { roomId, playerId } = ws.data.query;
    const { card, description } = message;

    if (!roomId || !playerId) {
      sendError(ws, "Invalid room or player data");
      return;
    }

    await gameManager.leaderChooseCard(roomId, playerId, card.id, description);
    // await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to select leader card"
    );
  }
}

async function handlePlayerChooseCard(
  ws: WS,
  message: PlayerChooseCardMessage
) {
  try {
    const { roomId, playerId } = ws.data.query;
    const { card } = message;

    if (!roomId || !playerId) {
      sendError(ws, "Invalid room or player data");
      return;
    }

    await gameManager.playerChooseCard(
      roomId,
      PlayerCardEntity.fromIds(playerId, card.id)
    );
    // await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to select card"
    );
  }
}

async function handlePlayerVote(ws: WS, message: PlayerVoteMessage) {
  try {
    const { roomId, playerId } = ws.data.query;
    const { card } = message;

    if (!roomId || !playerId) {
      sendError(ws, "Invalid room or player data");
      return;
    }

    await gameManager.playerVote(
      roomId,
      PlayerCardEntity.fromIds(playerId, card.id)
    );
    // await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    sendError(ws, error instanceof Error ? error.message : "Failed to vote");
  }
}

// Additional helper functions for game management
export async function handleSetPlayerReady(
  roomId: string,
  playerId: string,
  isReady: boolean
) {
  try {
    await gameManager.setPlayerReady(roomId, playerId, isReady);
    // await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    console.error("Failed to set player ready:", error);
    throw error;
  }
}

export async function handleStartGame(ws: WS) {
  const { roomId } = ws.data.query;
  if (!roomId) {
    sendError(ws, "No roomId provided in query, StartGameMessage");
    return;
  }
  try {
    await gameManager.startGame(roomId);

    // Get the updated room state after starting the game
    const room = await gameManager.getRoom(roomId);
    if (!room) {
      sendError(ws, "Room not found after starting game");
      return;
    }

    // Send each player their individual hand via StartRoundMessage
    room.players.forEach((player) => {
      gameManager.sendToPlayer(roomId, player.id, {
        type: "start_round",
        roundNumber: room.roundNumber,
        currentHand: player.hand,
      });
    });

    // Broadcast the updated room state to all players
    gameManager.broadcastToRoom(roomId, {
      type: "room_state_update",
      roomState: room.cloneForClient(),
    });
  } catch (error) {
    console.error("Failed to start game:", error);
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to start game"
    );
  }
}

export async function handleNextRound(roomId: string) {
  try {
    await gameManager.startNextRound(roomId);
    // await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    console.error("Failed to start next round:", error);
    throw error;
  }
}

export async function handleLeaveRoom(roomId: string, playerId: string) {
  try {
    await gameManager.removePlayerFromRoom(roomId, playerId);
    // await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    console.error("Failed to leave room:", error);
    throw error;
  }
}

// Utility functions for external access
export async function getRoomState(roomId: string) {
  return await gameManager.getRoom(roomId);
}

export async function createNewRoom(
  deckId: string = "default-deck-id"
): Promise<string> {
  return await gameManager.createRoom(deckId);
}

export async function addPlayerToExistingRoom(
  roomId: string,
  nickname: string
) {
  return await gameManager.addPlayerToRoom(roomId, nickname);
}
