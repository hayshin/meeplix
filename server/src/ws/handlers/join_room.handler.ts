import { JoinRoomMessage } from "$messages/index";
import { WS, sendError, sendMessage, broadcastMessage } from "..";
import { serializeRoomState } from "../models/room.model";
import { getPlayersInRoom } from "../services/room.service";
import { addPlayerConnection } from "../stores/connection.store";
import { addPlayer } from "../stores/player.store";
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
    const players = getPlayersInRoom(roomId);
    let player = players.find((player) => player.username === username);
    if (player) {
      throw new Error(`Player ${username} already exists in room ${roomId}`);
    }

    // Add player to room
    player = addPlayer(username, roomId);
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
    sendMessage(ws, {
      type: "ROOM_STATE",
      payload: {
        player,
        room: serializeRoomState(room),
      },
    });
  } catch (error) {
    console.error("=== ERROR IN JOIN ROOM ===");
    console.error("Error joining room:", error);
    sendError(ws, "Failed to join room", error);
  }
}
