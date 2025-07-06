import { ReadyMessage } from "$messages/client.message";
import { updateStatus } from "../services/player.service";
import { getPlayerById, updatePlayer } from "../stores/player.store";
import { WS, broadcastMessage, sendError } from "..";

export async function handlePlayerReady(ws: WS, message: ReadyMessage) {
  try {
    const { playerId, roomId } = message.payload;
    let player = getPlayerById(playerId);
    player = updateStatus(player, "ready");
    updatePlayer(player);
    broadcastMessage(roomId, { type: "PLAYER_READY", payload: { playerId } });
    // await gameManager.broadcastRoomUpdate(roomId);
  } catch (error) {
    sendError(ws, "Failed to set player ready:", error);
  }
}
