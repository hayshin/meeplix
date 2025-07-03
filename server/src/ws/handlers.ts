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
}>;

export const websocket = new Elysia().ws("/ws", {
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
        error instanceof Error ? error.message : "Internal server error",
      );
    }
  },

  close: (ws: WS) => {
    console.log("WebSocket connection closed");
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
    default:
      sendError(ws, "Unknown message type");
  }
}

export async function sendError(ws: WS, message: string) {
  ws.send({
    type: "error",
    message,
  });
}

export async function sendMessage(
  ws: WS,
  message: ServerMessageWithoutRoomState,
) {
  ws.send(message);
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
  try {
    const defaultDeckId = "default-deck-id";
    await gameManager.addRoom(defaultDeckId);
  } catch (error) {
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
  try {
    const { roomId, name } = message;
    console.log(`Joining room: ${roomId} with name: ${name}`);
    await gameManager.connectPlayer(ws, roomId, name);
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
