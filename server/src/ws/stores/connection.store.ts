import { Player } from "$shared/models/player";
import Elysia from "elysia";
import { RoomState } from "../models/room.model";
import { WS } from "..";

// player id -> player
// export const players = new Map<string, Player>();

// socket -> player id
const connectionToPlayer = new Map<WS, string>();
// player id -> socket
const playerToConnection = new Map<string, WS>();

export function addPlayerConnection(connection: WS, playerId: string) {
  if (connectionToPlayer.has(connection)) {
    removePlayerConnection(connection);
  }
  connectionToPlayer.set(connection, playerId);
  playerToConnection.set(playerId, connection);

  connection.data = { playerId };
  console.log("Connection added:", connection.id);
}

export function removePlayerConnection(connection: WS) {
  if (connectionToPlayer.has(connection)) {
    const playerId = connectionToPlayer.get(connection)!;
    connectionToPlayer.delete(connection);
    playerToConnection.delete(playerId);
  } else {
    throw new Error("Connection not found");
  }
}

export function getPlayerConnection(playerId: string): WS {
  const connection = playerToConnection.get(playerId);
  if (!connection) {
    throw new Error("Player not found");
  }
  return connection;
}
