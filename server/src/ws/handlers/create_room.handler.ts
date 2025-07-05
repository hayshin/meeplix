import { CreateRoomMessage } from "$messages/client_message";
export async function handleCreateRoom(ws: WS, message: CreateRoomMessage) {
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
