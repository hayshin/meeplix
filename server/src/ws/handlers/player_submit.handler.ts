import { PlayerSubmitCardMessage as PlayerSubmitCardMessage } from "$messages/client.message";
import { playerSubmitCard } from "../services/room.service";
import { WS, broadcastMessage, sendError } from "..";
import { ServerMessage } from "$shared/messages";

export async function handlePlayerSubmitCard(
  ws: WS,
  message: PlayerSubmitCardMessage,
) {
  try {
    const { roomId, playerId, cardId } = message.payload;

    playerSubmitCard(roomId, playerId, cardId);
    const response: ServerMessage = {
      type: "PLAYER_SUBMIT_CARD",
      payload: { playerId },
    };
    broadcastMessage(roomId, response);
  } catch (error) {
    sendError(ws, "Failed to select card", error);
  }
}
