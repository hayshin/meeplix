import { LeaderSubmitCardMessage } from "$messages/client.message";
import { WS, broadcastMessage, sendError, sendMessageToPlayer } from "..";
import { getPlayersInRoom, leaderSubmitCard } from "../services/room.service";

export async function handleLeaderSubmitCard(
  ws: WS,
  message: LeaderSubmitCardMessage,
) {
  try {
    const { roomId, playerId, cardId, description } = message.payload;

    leaderSubmitCard(roomId, playerId, cardId, description);
    const players = getPlayersInRoom(roomId);

    players.forEach((player) => {
      sendMessageToPlayer(player.id, {
        type: "PHASE_CHOOSE_CARD",
        payload: {
          // hand: hand.cards,
          player,
          description: description,
        },
      });
    });
  } catch (error) {
    sendError(ws, "Failed to select leader card", error);
  }
}
