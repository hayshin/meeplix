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
import Elysia from "elysia";
import { ElysiaWS } from "elysia/dist/ws";
import { t } from "elysia";

const gameManager = new GameManager();

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
    console.log("WebSocket message received:", message);

    try {
      switch (message.type) {
        case "ready":
          await handleReady(ws, message);
          break;

        case "create_room":
          await handleCreateRoom(ws, message);
          break;

        case "join_room":
          await handleJoinRoom(ws, message);
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
    } catch (error) {
      console.error("WebSocket handler error:", error);
      sendError(
        ws,
        error instanceof Error ? error.message : "Internal server error",
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
  ws.send(
    JSON.stringify({
      type: "error",
      message,
    }),
  );
}

function sendMessage(ws: WS, message: any) {
  ws.send(JSON.stringify(message));
}

async function handleReady(ws: WS, message: ReadyMessage) {
  sendMessage(ws, {
    type: "ready_ack",
    message: "Connection ready",
  });
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
    sendMessage(ws, {
      type: "room_created",
      room_id: roomId,
      player_id: player.id,
      room: room,
    });

    // Broadcast room update
    await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to create room",
    );
  }
}

async function handleJoinRoom(ws: WS, message: JoinRoomMessage) {
  try {
    const { room_id, name } = message;

    // Check if room exists
    const room = await gameManager.getRoom(room_id);
    if (!room) {
      sendError(ws, "Room not found");
      return;
    }

    // Add player to room
    const player = await gameManager.addPlayerToRoom(room_id, name);
    if (!player) {
      sendError(ws, "Failed to join room");
      return;
    }

    // Update WebSocket data
    ws.data.query.roomId = room_id;
    ws.data.query.playerId = player.id;

    // Add connection to manager
    gameManager.addConnection(room_id, ws);

    // Send join success response
    const updatedRoom = await gameManager.getRoom(room_id);
    sendMessage(ws, {
      type: "room_joined",
      room_id: room_id,
      player_id: player.id,
      room: updatedRoom,
    });

    // Broadcast room update to all players
    await gameManager.broadcastRoomUpdate(room_id);
  } catch (error) {
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to join room",
    );
  }
}

async function handleLeaderChooseCard(
  ws: WS,
  message: LeaderPlayerChooseCardMessage,
) {
  try {
    const { roomId, playerId } = ws.data.query;
    const { card_id, description } = message;

    if (!roomId || !playerId) {
      sendError(ws, "Invalid room or player data");
      return;
    }

    await gameManager.leaderChooseCard(roomId, playerId, card_id, description);
    await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to select leader card",
    );
  }
}

async function handlePlayerChooseCard(
  ws: WS,
  message: PlayerChooseCardMessage,
) {
  try {
    const { roomId, playerId } = ws.data.query;
    const { card_id } = message;

    if (!roomId || !playerId) {
      sendError(ws, "Invalid room or player data");
      return;
    }

    await gameManager.playerChooseCard(roomId, playerId, card_id);
    await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to select card",
    );
  }
}

async function handlePlayerVote(ws: WS, message: PlayerVoteMessage) {
  try {
    const { roomId, playerId } = ws.data.query;
    const { card_id } = message;

    if (!roomId || !playerId) {
      sendError(ws, "Invalid room or player data");
      return;
    }

    await gameManager.playerVote(roomId, playerId, card_id);
    await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    sendError(ws, error instanceof Error ? error.message : "Failed to vote");
  }
}

// Additional helper functions for game management
export async function handleSetPlayerReady(
  roomId: string,
  playerId: string,
  isReady: boolean,
) {
  try {
    await gameManager.setPlayerReady(roomId, playerId, isReady);
    await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    console.error("Failed to set player ready:", error);
    throw error;
  }
}

export async function handleStartGame(roomId: string) {
  try {
    await gameManager.startGame(roomId);
    await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    console.error("Failed to start game:", error);
    throw error;
  }
}

export async function handleNextRound(roomId: string) {
  try {
    await gameManager.startNextRound(roomId);
    await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    console.error("Failed to start next round:", error);
    throw error;
  }
}

export async function handleLeaveRoom(roomId: string, playerId: string) {
  try {
    await gameManager.removePlayerFromRoom(roomId, playerId);
    await gameManager.broadcastRoomUpdate(roomId);
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
  deckId: string = "default-deck-id",
): Promise<string> {
  return await gameManager.createRoom(deckId);
}

export async function addPlayerToExistingRoom(
  roomId: string,
  nickname: string,
) {
  return await gameManager.addPlayerToRoom(roomId, nickname);
}

export { gameManager };
