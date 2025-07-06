import {
  WS,
  sendError,
  broadcastMessage,
  sendMessage,
  sendMessageToPlayer,
} from "..";
import { StartGameMessage } from "$shared/messages";
import { startGame } from "../services/room.service";

export async function handleStartGame(ws: WS, message: StartGameMessage) {
  try {
    const { roomId, playerId } = message.payload;
    const hands = startGame(roomId, playerId);
    hands.forEach((hand) => {
      sendMessageToPlayer(hand.playerId, {
        type: "START_ROUND",
        payload: {
          currentHand: hand.cards,
        },
      });
    });
  } catch (error) {
    sendError(ws, "Failed to start game", error);
  }
}
