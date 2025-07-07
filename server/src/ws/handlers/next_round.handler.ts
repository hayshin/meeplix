import { NextRoundMessage } from "$messages/client.message";
import { WS, sendError, sendMessageToPlayer } from "..";
import { startRound, getNextLeader } from "../services/room.service";

export async function handleNextRound(ws: WS, message: NextRoundMessage) {
  try {
    const { roomId, playerId } = message.payload;
    console.log(`Starting next round for room ${roomId} by player ${playerId}`);

    const nextLeader = getNextLeader(roomId);
    const hands = startRound(roomId, nextLeader.id);
    hands.forEach((hand) => {
      sendMessageToPlayer(hand.playerId, {
        type: "START_ROUND",
        payload: {
          leaderId: nextLeader.id,
          currentHand: hand.cards,
        },
      });
    });
  } catch (error) {
    console.error("Error starting next round:", error);
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to start next round",
    );
  }
}
