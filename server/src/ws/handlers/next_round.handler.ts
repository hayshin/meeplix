import { NextRoundMessage } from "$messages/client.message";

export async function handleNextRound(ws: WS, message: NextRoundMessage) {
  try {
    const { roomId, playerId } = await getIds(message);
    console.log(`Starting next round for room ${roomId} by player ${playerId}`);

    await gameManager.startNextRound(roomId);
  } catch (error) {
    console.error("Error starting next round:", error);
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to start next round",
    );
  }
}
