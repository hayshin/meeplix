import { CreateRoomMessage } from "$messages/index";
import { ServerMessage } from "$messages/index";
import { WS, sendError, sendMessage } from "../index";
import { addPlayerConnection } from "../stores/connection.store";
import { addRoom } from "../stores/room.store";

export async function handleCreateRoom(ws: WS, message: CreateRoomMessage) {
  const { username } = message.payload;
  console.log("=== HANDLING CREATE ROOM ===");
  console.log("Creator username:", username);

  try {
    console.log(`Creating room with creator username: ${username}`);

    const defaultDeckId = "default-deck-id";
    const room = addRoom(defaultDeckId);
    console.log(`Room created with ID: ${room.id}`);

    // Add creator as a player

    // const player = await gameManager.addPlayerToRoom(roomId, username);
    // console.log(`Player created with ID: ${player.id}`);
    // Connect the creator via WebSocket
    // addConnection(room.id, ws);
    // console.log(`Player connected to WebSocket`);

    // Send confirmation to creator
    const response: ServerMessage = {
      type: "ROOM_CREATED",
      payload: {
        roomId: room.id,
      },
      // playerId: player.id,
    };
    sendMessage(ws, response);
  } catch (error) {
    console.error("=== ERROR IN CREATE ROOM ===");
    sendError(ws, "Failed to create room", error);
  }
}
