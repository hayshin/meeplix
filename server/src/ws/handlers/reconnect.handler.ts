import { ReconnectMessage } from "$messages/client.message";
import { ServerMessage } from "$messages/server.message";
import { PublicCard } from "$shared/models/public_card";
import { WS, sendError, sendMessage, sendMessageToPlayer } from "../index";
import { serializeRoomState } from "../models/room.model";
import {
  getHandOfPlayer,
  getPlayerInRoom,
  hasHand,
} from "../services/room.service";
import {
  addPlayerConnection,
  getPlayerConnection,
} from "../stores/connection.store";
import { getPlayersIDsInRoom, getRoomById } from "../stores/room.store";

export async function handleReconnect(ws: WS, message: ReconnectMessage) {
  const { roomId, playerId, username } = message.payload;

  console.log("=== HANDLING RECONNECT ===");

  try {
    const room = getRoomById(roomId);

    const player = getPlayerInRoom(roomId, playerId);

    // Verify username matches (optional security check)
    if (player.username !== username) {
      throw new Error(
        "Username mismatch: " + player.username + " vs " + username,
      );
    }

    // const existingConnection = getPlayerConnection(playerId);
    // if (existingConnection) {
    //   throw new Error("Player already connected");
    // }

    addPlayerConnection(ws, playerId);

    player.status = "online";

    console.log("Player reconnected successfully: ", player.username);

    // Send success response with current room state
    const publicRoomState = serializeRoomState(room);
    let hand: PublicCard[] | undefined = hasHand(roomId, playerId)
      ? getHandOfPlayer(roomId, playerId).cards
      : undefined;
    const response: ServerMessage = {
      type: "RECONNECT_SUCCESS",
      payload: {
        player,
        hand,
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
