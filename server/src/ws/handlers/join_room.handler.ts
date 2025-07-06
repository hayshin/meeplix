import { JoinRoomMessage } from "$messages/index";
import { createPlayer } from "$shared/models/player";
import { WS, sendError, sendMessage, broadcastMessage } from "..";
import { addPlayerConnection } from "../stores/connection.store";
import {
  addPlayerToRoom,
  getPlayersIDsInRoom,
  getRoomById,
} from "../stores/room.store";

export async function handleJoinRoom(ws: WS, message: JoinRoomMessage) {
  console.log("=== HANDLING JOIN ROOM ===");

  try {
    const { username, roomId } = message.payload;
    console.log(`Player ${username} attempting to join room: ${roomId}`);

    // Validate room exists
    const room = getRoomById(roomId);
    console.log(
      `Room found with ${getPlayersIDsInRoom(roomId).length} players`,
    );

    // Add player to room
    const player = createPlayer(username, roomId);
    addPlayerToRoom(roomId, player.id);
    console.log(
      `Player ${username} added to room ${roomId} with ID: ${player.id}`,
    );

    // Connect player via WebSocket
    addPlayerConnection(ws, player.id);

    console.log(
      `Player ${username} (${player.id}) successfully joined room ${roomId}`,
    );

    broadcastMessage(roomId, {
      type: "PLAYER_JOINED",
      payload: {
        player,
      },
    });
  } catch (error) {
    console.error("=== ERROR IN JOIN ROOM ===");
    console.error("Error joining room:", error);
    sendError(ws, "Failed to join room", error);
  }
}
