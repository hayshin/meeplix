import { Player } from "$shared/models/player";
import Elysia from "elysia";
import { RoomState } from "../models/room.model";
import { ElysiaWS } from "elysia/dist/ws";

// player id -> player
// export const players = new Map<string, Player>();

// roomId -> connections
const connections = new Map<string, Set<ElysiaWS>>();

export function addConnection(roomId: string, connection: ElysiaWS) {
  if (!connections.has(roomId)) connections.set(roomId, new Set());
  connections.get(roomId)!.add(connection);
}

export function removeConnection(roomId: string, connection: ElysiaWS) {
  if (!connections.has(roomId)) throw new Error(`Room ${roomId} not found`);
  connections.get(roomId)!.delete(connection);

  // TODO proper garbage collection
  // if (connections.get(roomId)!.size === 0) {
  //   connections.delete(roomId);
  // }
}
