import Elysia from "elysia";
import { ElysiaWS } from "elysia/dist/ws";
import { t, RouteSchema } from "elysia";

import { ServerMessage } from "$messages/server_message";
import { ClientMessage } from "$messages/client_message";
import * as Handlers from "./handlers/index";
const WSDataSchema = t.Object({
  roomId: t.Optional(t.String()),
  playerId: t.Optional(t.String()),
});

type WSData = typeof WSDataSchema.static;
// interface WSRouteSchema extends RouteSchema {
//   // body: { message: ClientMessage };
// }

export type WS = ElysiaWS<
  { body: { message: ClientMessage } },
  { response: { message: ServerMessage } }
>;

export const websocket = new Elysia().ws("/ws", {
  body: t.Object({ message: ClientMessage }),
  // data: t.Object({ message: ClientMessage }),
  response: { message: ServerMessage },

  open: (ws: WS) => {
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
    // if (ws.data?.roomId) {
    //   console.log(`Cleaning up connection for room ${ws.data.roomId}`);
    //   gameManager.removeConnection(ws.data.roomId, ws);

    //   // Broadcast player disconnection
    //   if (ws.data.playerId) {
    //     console.log(`Broadcasting player disconnect for ${ws.data.playerId}`);
    //     gameManager.broadcastToRoom(ws.data.roomId, {
    //       type: "player_disconnected",
    //       roomId: ws.data.roomId,
    //       playerId: ws.data.playerId,
    //     });
    //   }
    // }
  },
});

async function handleMessage(ws: WS, message: ClientMessage) {
  console.log("Received message:", message);
  switch (message.type) {
    case "READY":
      await Handlers.handlePlayerReady(message);
      break;
    case "CREATE_ROOM":
      await Handlers.handleCreateRoom(ws, message);
      break;
    case "JOIN_ROOM":
      await Handlers.handleJoinRoom(ws, message);
      break;
    case "START_GAME":
      await Handlers.handleStartGame(ws, message);
      break;
    case "LEADER_SUBMIT_CARD":
      await Handlers.handleLeaderSubmitCard(ws, message);
      break;
    case "SUBMIT_CARD":
      await Handlers.handlePlayerSubmitCard(ws, message);
      break;
    case "VOTE":
      await Handlers.handlePlayerVote(ws, message);
      break;
    case "NEXT_ROUND":
      await Handlers.handleNextRound(ws, message);
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
