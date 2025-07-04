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
  type NextRoundMessage,
  StartGameMessage,
} from "$shared/types/client";
import { SubmittedCardEntity } from "$types/submitted_card";
import Elysia from "elysia";
import { ElysiaWS } from "elysia/dist/ws";
import { t } from "elysia";
import {
  ServerMessage,
  ServerMessageWithoutRoomState,
} from "$shared/types/server";
import { CardEntity } from "$shared/types/card";

export const gameManager = new GameManager();

const WSDataSchema = t.Object({
  roomId: t.Optional(t.String()),
  playerId: t.Optional(t.String()),
});

type WSData = typeof WSDataSchema.static;

export type WS = ElysiaWS<{
  body: { message: ClientMessage };
}> & {
  data: WSData;
};

export const websocket = new Elysia().ws("/ws", {
  body: t.Object({ message: ClientMessageSchema }),

  open(ws: WS) {
    console.log("WebSocket connection opened");
  },

  message: async (ws: WS, data: { message: ClientMessage }) => {
    const message = data.message;
    console.log("=== RECEIVED WEBSOCKET MESSAGE ===");
    console.log("Message type:", message.type);
    console.log("Message data:", message);
    try {
      handleMessage(ws, message);
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

    // Clean up connection from gameManager
    if (ws.data?.roomId) {
      console.log(`Cleaning up connection for room ${ws.data.roomId}`);
      gameManager.removeConnection(ws.data.roomId, ws);

      // Broadcast player disconnection
      if (ws.data.playerId) {
        console.log(`Broadcasting player disconnect for ${ws.data.playerId}`);
        gameManager.broadcastToRoom(ws.data.roomId, {
          type: "player_disconnected",
          roomId: ws.data.roomId,
          playerId: ws.data.playerId,
        });
      }
    }
  },
});

function broadcastToRoom(
  ws: WS,
  roomId: string,
  message: ServerMessageWithoutRoomState,
) {
  gameManager.broadcastToRoom(roomId, message);
}

async function handleMessage(ws: WS, message: ClientMessage) {
  console.log("Received message:", message);
  switch (message.type) {
    case "ready":
      const { roomId, playerId } = await getIds(message);
      await gameManager.setPlayerReady(roomId, playerId, true);
      break;
    case "create_room":
      await handleCreateRoom(ws, message as CreateRoomMessage);
      break;
    case "join_room":
      await handleJoinRoom(ws, message as JoinRoomMessage);
      break;
    case "start_game":
      await handleStartGame(ws, message);
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
    case "next_round":
      await handleNextRound(ws, message);
      break;
    default:
      sendError(ws, "Unknown message type");
  }
}

export async function sendError(ws: WS, message: string) {
  console.log("=== SENDING ERROR ===");
  console.log("Error message:", message);
  ws.send({
    type: "error",
    message,
  });
}

export async function sendMessage(
  ws: WS,
  message: ServerMessageWithoutRoomState,
) {
  // For messages that need room state, we need to add it
  if (ws.data?.roomId) {
    try {
      const room = gameManager.getRoom(ws.data.roomId);
      ws.send({
        ...message,
        roomState: room.cloneForClient(),
      });
    } catch (error) {
      console.error("Error getting room state for message:", error);
      // Send without room state as fallback
      ws.send(message);
    }
  } else {
    // Send without room state for messages that don't need it
    ws.send(message);
  }
}

async function getIds(
  message: Exclude<ClientMessage, JoinRoomMessage | CreateRoomMessage>,
): Promise<{ roomId: string; playerId: string }> {
  const { roomId, playerId } = message;
  if (!roomId) throw Error("No roomId provided in message");
  if (!playerId) throw Error("No playerId provided in message");
  return { roomId, playerId };
}

async function handleCreateRoom(ws: WS, message: CreateRoomMessage) {
  console.log("=== HANDLING CREATE ROOM ===");
  console.log("Creator name:", message.name);

  try {
    console.log(`Creating room with creator name: ${message.name}`);

    const defaultDeckId = "default-deck-id";
    const roomId = await gameManager.addRoom(defaultDeckId);
    console.log(`Room created with ID: ${roomId}`);

    // Add creator as a player
    const player = await gameManager.addPlayerToRoom(roomId, message.name);
    console.log(`Player created with ID: ${player.id}`);

    // Connect the creator via WebSocket
    await gameManager.connectPlayer(ws, roomId, player.id);
    console.log(`Player connected to WebSocket`);

    console.log(`Room ${roomId} created with creator ${player.id}`);

    // Send confirmation to creator
    const response = {
      type: "room_created" as const,
      roomId,
      playerId: player.id,
    };
    console.log("Sending room_created response:", response);
    sendMessage(ws, response);
  } catch (error) {
    console.error("=== ERROR IN CREATE ROOM ===");
    console.error("Error creating room:", error);
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to create room",
    );
  }
}

async function handleStartGame(ws: WS, message: StartGameMessage) {
  try {
    const { roomId, playerId } = await getIds(message);
    await gameManager.startGame(roomId);
  } catch (error) {
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to start game",
    );
  }
}

async function handleJoinRoom(ws: WS, message: JoinRoomMessage) {
  console.log("=== HANDLING JOIN ROOM ===");
  console.log("Room ID:", message.roomId);
  console.log("Player name:", message.name);

  try {
    const { roomId, name } = message;
    console.log(`Player ${name} attempting to join room: ${roomId}`);

    // Validate room exists
    const room = gameManager.getRoom(roomId);
    if (!room) {
      throw new Error("Room not found");
    }
    console.log(`Room found with ${room.players.size} players`);

    // Add player to room
    const player = await gameManager.addPlayerToRoom(roomId, name);
    console.log(`Player ${name} added to room ${roomId} with ID: ${player.id}`);

    // Connect player via WebSocket
    await gameManager.connectPlayer(ws, roomId, player.id);

    console.log(
      `Player ${name} (${player.id}) successfully joined room ${roomId}`,
    );
  } catch (error) {
    console.error("=== ERROR IN JOIN ROOM ===");
    console.error("Error joining room:", error);
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
    const { roomId, playerId } = await getIds(message);
    const { card, description } = message;

    await gameManager.leaderSubmitCard(roomId, playerId, card.id, description);
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
    const { roomId, playerId } = await getIds(message);
    const { card } = message;

    await gameManager.playerSubmitCard(
      roomId,
      new SubmittedCardEntity(playerId, CardEntity.fromType(card)),
    );
  } catch (error) {
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to select card",
    );
  }
}

async function handlePlayerVote(ws: WS, message: PlayerVoteMessage) {
  try {
    const { roomId, playerId } = await getIds(message);
    const { card } = message;

    console.log(
      `Handling player vote for room ${roomId} by player ${playerId}`,
    );

    await gameManager.playerVote(roomId, playerId, CardEntity.fromType(card));
    // await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    console.error(
      `Stack trace:`,
      error instanceof Error ? error.stack : "No stack trace",
    );
    sendError(ws, error instanceof Error ? error.message : "Failed to vote");
  }
}

async function handleNextRound(ws: WS, message: NextRoundMessage) {
  try {
    const { roomId, playerId } = await getIds(message);
    console.log(`Starting next round for room ${roomId} by player ${playerId}`);

    await gameManager.startNextRound(roomId);
  } catch (error) {
    console.error("Error starting next round:", error);
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to start next round",
    );
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
    // await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    console.error("Failed to set player ready:", error);
    throw error;
  }
}
