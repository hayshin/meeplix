import { VoteMessage } from "$messages/client_message";
export async function handlePlayerVote(ws: WS, message: VoteMessage) {
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
