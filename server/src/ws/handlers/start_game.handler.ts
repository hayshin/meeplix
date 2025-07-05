import { WS } from "..";
import { StartGameMessageSchema } from "$shared/types/client";

export async function handleStartGame(ws: WS, message: StartGameMessage) {
  try {
    const { roomId, playerId } = await getIds(message);
    await gameManager.startGame(roomId);
  } catch (error) {
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to start game",
    );
  }
}
