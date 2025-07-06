import { NextRoundMessage } from "$messages/client.message";
import { WS, sendError } from "..";
import { startRound, getNextLeader } from "../services/room.service";

export async function handleNextRound(ws: WS, message: NextRoundMessage) {
  try {
    const { roomId, playerId } = message.payload;
    console.log(`Starting next round for room ${roomId} by player ${playerId}`);

    const nextLeader = getNextLeader(roomId);
    startRound(roomId, nextLeader.id);
  } catch (error) {
    console.error("Error starting next round:", error);
    sendError(
      ws,
      error instanceof Error ? error.message : "Failed to start next round",
    );
  }
}
