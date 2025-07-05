import { LeaderSubmitCardMessage } from "$messages/client_message";

export async function handleLeaderSubmitCard(
  ws: WS,
  message: LeaderSubmitCardMessage,
) {
  try {
    const { roomId, playerId } = await getIds(message);
    const { card, description } = message;

    await gameManager.leaderSubmitCard(roomId, playerId, card.id, description);
  } catch (error) {
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to select leader card",
    );
  }
}
