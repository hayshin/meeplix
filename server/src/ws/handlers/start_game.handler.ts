import {
  WS,
  sendError,
  broadcastMessage,
  sendMessage,
  sendMessageToPlayer,
} from "..";
import { StartGameMessage } from "$shared/messages";
import { startGame } from "../services/room.service";
import { getRoomById } from "../stores/room.store";

export async function handleStartGame(ws: WS, message: StartGameMessage) {
  try {
    const { roomId, playerId } = message.payload;
    const room = getRoomById(roomId);
    const hands = startGame(roomId, playerId);
    hands.forEach((hand) => {
      sendMessageToPlayer(hand.playerId, {
        type: "START_ROUND",
        payload: {
          leaderId: room.leaderId,
          currentHand: hand.cards,
        },
      });
    });
  } catch (error) {
    sendError(ws, "Failed to start game", error);
  }
}
