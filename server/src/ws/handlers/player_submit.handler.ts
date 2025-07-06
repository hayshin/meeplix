import { PlayerSubmitCardMessage as PlayerSubmitCardMessage } from "$messages/client.message";
import { playerSubmitCard } from "../services/room.service";
import { WS, broadcastMessage, sendError } from "..";

export async function handlePlayerSubmitCard(
  ws: WS,
  message: PlayerSubmitCardMessage,
) {
  try {
    const { roomId, playerId, cardId } = message.payload;

    playerSubmitCard(roomId, playerId, cardId);
    broadcastMessage(roomId, {
      type: "PLAYER_SUBMIT_CARD",
      payload: { roomId, playerId, cardId },
    });
  } catch (error) {
    sendError(ws, "Failed to select card", error);
  }
}
