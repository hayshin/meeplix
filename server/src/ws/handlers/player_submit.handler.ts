import { PlayerSubmitCardMessage as PlayerSubmitCardMessage } from "$messages/client_message";

export async function handlePlayerSubmitCard(
  ws: WS,
  message: PlayerSubmitCardMessage,
) {
  try {
    const { roomId, playerId } = await getIds(message);
    const { card } = message;

    await gameManager.playerSubmitCard(
      roomId,
      new SubmittedCardEntity(playerId, CardEntity.fromType(card)),
    );
  } catch (error) {
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to select card",
    );
  }
}
