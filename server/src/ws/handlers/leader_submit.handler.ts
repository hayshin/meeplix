import { LeaderSubmitCardMessage } from "$messages/client.message";
import { WS, sendError } from "..";
import { leaderSubmitCard } from "../services/room.service";

export async function handleLeaderSubmitCard(
  ws: WS,
  message: LeaderSubmitCardMessage,
) {
  try {
    const { roomId, playerId, cardId, description } = message.payload;

    leaderSubmitCard(roomId, playerId, cardId, description);
  } catch (error) {
    sendError(ws, "Failed to select leader card", error);
  }
}
