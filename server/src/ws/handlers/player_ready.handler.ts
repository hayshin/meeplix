import { ReadyMessage } from "$messages/client_message";
export async function handlePlayerReady(message: ReadyMessage) {
  try {
    await gameManager.setPlayerReady(roomId, playerId, isReady);
    // await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    console.error("Failed to set player ready:", error);
    throw error;
  }
}
