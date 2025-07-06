import { ReconnectMessage } from "$messages/client.message";
import { ServerMessage } from "$messages/server.message";
import { WS, sendError, sendMessage, sendMessageToPlayer } from "../index";
import { serializeRoomState } from "../models/room.model";
import { getPlayerInRoom } from "../services/room.service";
import {
  addPlayerConnection,
  getPlayerConnection,
} from "../stores/connection.store";
import { getPlayersIDsInRoom, getRoomById } from "../stores/room.store";

export async function handleReconnect(ws: WS, message: ReconnectMessage) {
  const { roomId, playerId, username } = message.payload;

  console.log("=== HANDLING RECONNECT ===");
  console.log("Room ID:", roomId);
  console.log("Player ID:", playerId);
  console.log("Username:", username);

  try {
    // Check if room exists
    const room = getRoomById(roomId);
    if (!room) {
      console.log("Room not found:", roomId);
      const response: ServerMessage = {
        type: "RECONNECT_FAILED",
        payload: {
          message: "Room not found or has been closed",
        },
      };
      sendMessage(ws, response);
      return;
    }

    // Check if player exists in room
    const player = getPlayerInRoom(roomId, playerId);
    if (!player || player.roomId !== roomId) {
      console.log("Player not found in room:", playerId, roomId);
      const response: ServerMessage = {
        type: "RECONNECT_FAILED",
        payload: {
          message: "Player not found in this room",
        },
      };
      sendMessage(ws, response);
      return;
    }

    // Verify username matches (optional security check)
    if (player.username !== username) {
      console.log("Username mismatch:", player.username, "vs", username);
      const response: ServerMessage = {
        type: "RECONNECT_FAILED",
        payload: {
          message: "Username does not match",
        },
      };
      sendMessage(ws, response);
      return;
    }

    // Check if player is already connected
    const existingConnection = getPlayerConnection(playerId);
    if (existingConnection) {
      console.log("Player already connected, updating connection");
      // Close existing connection
      existingConnection.close();
    }

    // Update player connection
    addPlayerConnection(ws, playerId);

    // Update player status to online
    player.status = "online";

    console.log("Player reconnected successfully:", player.username);

    // Send success response with current room state
    const publicRoomState = serializeRoomState(room);
    const response: ServerMessage = {
      type: "RECONNECT_SUCCESS",
      payload: {
        player,
        // hand: player.hand,
        // hasSubmittedCard: player.hasSubmittedCard,
        // hasVoted: player.hasVoted,
        // lastSeen: player.lastSeen,
        // },
        room: publicRoomState,
      },
    };

    sendMessage(ws, response);

    // Notify other players about reconnection
    const notificationMessage: ServerMessage = {
      type: "PLAYER_CONNECTED",
      payload: {
        player,
        // player: {
        //   id: player.id,
        //   username: player.username,
        //   roomId: player.roomId,
        //   status: player.status,
        //   score: player.score,
        // hand: [], // Don't send hand to other players
        // hasSubmittedCard: player.hasSubmittedCard,
        // hasVoted: player.hasVoted,
        // lastSeen: player.lastSeen,
        // },
      },
    };

    // Send to all other players in the room
    getPlayersIDsInRoom(roomId).forEach((otherPlayerId) => {
      if (otherPlayerId !== playerId) {
        sendMessageToPlayer(otherPlayerId, notificationMessage);
      }
    });

    console.log("Reconnection completed successfully");
  } catch (error) {
    console.error("Error handling reconnect:", error);
    sendError(ws, "Failed to reconnect to game", error);
  }
}
