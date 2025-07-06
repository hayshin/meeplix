import { VoteMessage } from "$messages/client.message";
import { WS, broadcastMessage, sendError } from "..";
import { playerVote } from "../services/room.service";

export async function handlePlayerVote(ws: WS, message: VoteMessage) {
  try {
    const { roomId, playerId, cardId } = message.payload;

    console.log(
      `Handling player vote for room ${roomId} by player ${playerId}`,
    );

    playerVote(roomId, playerId, cardId);
    broadcastMessage(roomId, {
      type: "PLAYER_VOTED",
      payload: { playerId },
    });
    // await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    console.error(
      `Stack trace:`,
      error instanceof Error ? error.stack : "No stack trace",
    );
    sendError(ws, error instanceof Error ? error.message : "Failed to vote");
  }
}
