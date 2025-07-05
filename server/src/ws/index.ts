import Elysia from "elysia";
import { ElysiaWS } from "elysia/dist/ws";
import { t } from "elysia";
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
