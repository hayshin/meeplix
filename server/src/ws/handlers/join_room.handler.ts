import { JoinRoomMessage } from "$messages/client_message";

export async function handleJoinRoom(ws: WS, message: JoinRoomMessage) {
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
